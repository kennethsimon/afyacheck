"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
  Key,
  useState,
} from "react";
import projectApi from "../../services/config";
import { ReloadIcon } from "@radix-ui/react-icons";

const AddUserFormSchema = z.object({
  campId: z.string(),
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  roles: z.string(),
  permissions: z.string(),
});

type AddUserFormProps = {
  campId: string;
  permissions: any;
};

export function AddUserForm({ campId, permissions }: AddUserFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof AddUserFormSchema>>({
    resolver: zodResolver(AddUserFormSchema),
    defaultValues: {
      campId,
      name: "",
      password: "",
      roles: "",
      permissions: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof AddUserFormSchema>) => {
    setLoading(true);
    // Handle form submission here...
    // remember the type has be passed in the props as either "project" or "camp"
    console.log(data);
    const res = await projectApi.post("/auth/user", {
      name: data.name,
      password: data.password,
      username: data.name,
      camp: campId,
      permissions: [data.permissions],
      roles: [data.roles],
    });
    if (res.status === 200) {
      setLoading(false);
      toast("User created successfully.", {
        description: ``,
      });
    }
    setLoading(false);
    window.location.reload();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 py-8 w-full"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
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
                  {permissions?.data?.roles?.map(
                    (permission: {
                      _id: string;
                      name:
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | Promise<AwaitedReactNode>
                        | null
                        | undefined;
                    }) => {
                      return (
                        <FormItem
                          key={permission?._id}
                          className="flex items-baseline space-x-4"
                        >
                          <RadioGroupItem value={permission?._id} />
                          <FormLabel>{permission.name}</FormLabel>
                        </FormItem>
                      );
                    }
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="max-w-full md:max-w-xl mx-auto p-4">
          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap space-x-2"
                  >
                    {permissions?.data?.permissions?.map((permission: any) => (
                      <FormItem
                        key={permission?._id}
                        className="flex items-baseline space-x-4"
                      >
                        <RadioGroupItem value={permission?._id} />
                        <FormLabel>{permission.name}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between">
          <Button type="submit">
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
