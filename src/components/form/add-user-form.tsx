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

const AddUserFormSchema = z.object({
  campId: z.string(),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["admin", "user", "viewer"]),
});

type AddUserFormProps = {
  campId: string;
};

export function AddUserForm({ campId }: AddUserFormProps) {
  const form = useForm<z.infer<typeof AddUserFormSchema>>({
    resolver: zodResolver(AddUserFormSchema),
    defaultValues: {
      campId,
      username: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = (data: z.infer<typeof AddUserFormSchema>) => {
    // Handle form submission here...
    // remember the type has be passed in the props as either "project" or "camp"
    console.log(data);
    toast("Item created successfully.", {
      description: `You submmited ${data}`,
      action: {
        label: "Open",
        onClick: () => {
          console.log("Opening item...");
        },
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 py-8 w-full"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row space-x-2"
                >
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="admin" />
                    <FormLabel>Admin</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="user" />
                    <FormLabel>User</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-baseline space-x-4">
                    <RadioGroupItem value="viewer" />
                    <FormLabel>Viewer</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
