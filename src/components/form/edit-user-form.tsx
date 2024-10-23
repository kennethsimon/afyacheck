"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useParams } from "next/navigation"; // To get userId from URL

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import projectApi from "../../services/config"; // Import the getUserById function
import { getUserById } from "@/services/users";

const AddUserFormSchema = z.object({
  campId: z.string(),
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  roles: z.string(),
  permissions: z.array(z.string()).min(1, {
    message: "Please select at least one permission.",
  }),
});

type AddUserFormProps = {
  campId: string;
  permissions: {
    data: {
      roles: Array<{ _id: string; name: string }>;
      permissions: Array<{ _id: string; name: string }>;
    };
  };
};

export default function EditUserForm({ campId, permissions }: AddUserFormProps) {
  const { userId } = useParams(); // Get the userId from the URL params
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true); // Loading state for fetching user data
  const form = useForm<z.infer<typeof AddUserFormSchema>>({
    resolver: zodResolver(AddUserFormSchema),
    defaultValues: {
      campId,
      name: "",
      password: "",
      roles: "",
      permissions: [],
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const userData = await getUserById(userId); // Fetch user data by ID
          if (userData?.items) {
            const user = userData?.items?.user;
            console.log('ken', user)
            form.reset({
              campId,
              name: user?.name || "",
              password: "", // Password won't be autofilled for security reasons
              roles: user?.roles[0] || "",
              permissions: user?.permissions || [],
            });
          }
        } catch (error) {
          toast.error("Error fetching user data.");
        } finally {
          setFetchingUser(false); // Set fetchingUser state to false after data is fetched
        }
      }
    };

    fetchUser();
  }, [userId]);

  const onSubmit = async (data: z.infer<typeof AddUserFormSchema>) => {
    setLoading(true);
    try {
      const res = await projectApi.put(`/auth/admin/${userId}`, {
        name: data.name,
        password: data.password,
        username: data.name,
        camp: campId,
        permissions: data.permissions,
        roles: [data.roles],
      });
      if (res.status === 200) {
        toast.success("User Edited successfully.");
        window.location.reload();
      }
    } catch (error) {
      toast.error("Error creating user.", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Display a loading spinner while fetching user data
  if (fetchingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ReloadIcon className="mr-2 h-6 w-6 animate-spin" />
        Loading user data...
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-8 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  {permissions?.data?.roles?.map((role) => (
                    <FormItem key={role._id} className="flex items-center space-x-2">
                      <RadioGroupItem value={role._id} id={role._id} />
                      <FormLabel htmlFor={role._id}>{role.name}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel>Permissions</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {permissions?.data?.permissions?.map((permission) => (
                  <FormField
                    key={permission._id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission._id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission._id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permission._id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permission._id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
