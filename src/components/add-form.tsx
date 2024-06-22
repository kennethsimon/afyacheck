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
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { ReloadIcon } from "@radix-ui/react-icons";

export const AddFormSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Please enter a valid description.",
  }),
});

type AddFormProps = {
  onSubmit: (data: z.infer<typeof AddFormSchema>) => void;
  onClose: () => void;
  loading: boolean
};

export function AddForm({ onSubmit, onClose, loading }: AddFormProps) {
  const form = useForm<z.infer<typeof AddFormSchema>>({
    resolver: zodResolver(AddFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const desktop = "(min-width: 768px)";
  const isDesktop = useMediaQuery(desktop);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-2/3", !isDesktop && "w-full pb-8", "space-y-6")}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input placeholder="project name" {...field} />
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
        <div className="flex justify-between">
          <Button className="flex justify-start" type="submit">
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
          <Button className="flex justify-end" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </form>
    </Form>
  );
}
