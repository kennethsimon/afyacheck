"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { UserPlus, Lock, Shield, Key, User, ArrowLeft } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import projectApi from "../../services/config";

const AddUserFormSchema = z.object({
  campId: z.string(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  roles: z.string().min(1, {
    message: "Please select a role.",
  }),
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

export default function AddUserForm({ campId, permissions }: AddUserFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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

  const onSubmit = async (data: z.infer<typeof AddUserFormSchema>) => {
    setLoading(true);
    try {
      const res = await projectApi.post("/auth/user", {
        name: data.name,
        password: data.password,
        username: data.name,
        camp: campId,
        permissions: data.permissions,
        roles: [data.roles],
      });
      if (res.status === 200) {
        toast.success("User created successfully.");
        router.back();
      }
    } catch (error) {
      toast.error("Error creating user.", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* User Information Card */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              User Information
            </CardTitle>
            <CardDescription>
              Enter the basic information for the new user account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </FormLabel>
                  <FormDescription>
                    This will be used as both the display name and username
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter user's full name"
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    />
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
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password
                  </FormLabel>
                  <FormDescription>
                    Password must be at least 6 characters long
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      placeholder="Enter password"
                      className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Role Selection Card */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              User Role
            </CardTitle>
            <CardDescription>
              Select a role that defines the user&apos;s primary responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {permissions?.data?.roles?.map((role) => (
                        <div
                          key={role._id}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                            field.value === role._id
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                          }`}
                        >
                          <RadioGroupItem value={role._id} id={role._id} />
                          <FormLabel
                            htmlFor={role._id}
                            className="font-normal cursor-pointer flex-1"
                          >
                            {role.name}
                          </FormLabel>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Permissions
            </CardTitle>
            <CardDescription>
              Select the permissions this user should have. At least one permission is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissions?.data?.permissions?.map((permission) => (
                      <FormField
                        key={permission._id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission._id}
                              className={`flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg border transition-all ${
                                field.value?.includes(permission._id)
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                              }`}
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
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer flex-1">
                                {permission.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                  {form.watch("permissions")?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Selected permissions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("permissions")?.map((permId) => {
                          const perm = permissions?.data?.permissions?.find(
                            (p) => p._id === permId
                          );
                          return perm ? (
                            <Badge key={permId} variant="secondary" className="text-xs">
                              {perm.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-w-[100px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[150px] bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md"
          >
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
