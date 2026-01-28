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
import { toast } from "sonner";
import projectApi from "../services/config";

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Please enter a valid description.",
  }),
});

export function AddCampForm({ projectId }: any) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (!projectId) {
        toast.error("Project ID is required");
        return;
      }
      console.log(data);
      const res = await projectApi.post("/camps", {
        name: data?.title,
        description: data?.description,
        project: projectId,
      });
      console.log(res);
      if (res?.data?.status) {
        toast.success("Camp created successfully.", {
          description: "The camp has been added to your project.",
        });
        form.reset();
      } else {
        throw new Error(res?.data?.message || "Failed to create camp");
      }
    } catch (error: any) {
      console.error("Error creating camp:", error);
      toast.error("Failed to create camp", {
        description: error?.response?.data?.message || error?.message || "An unexpected error occurred",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>Insert project title.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>description</FormLabel>
              <FormControl>
                <Input placeholder="description" {...field} />
              </FormControl>
              <FormDescription>Insert projects description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
