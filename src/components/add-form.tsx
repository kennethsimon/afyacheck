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
  loading: boolean;
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
              <FormLabel className="text-gray-700 dark:text-gray-300">Program Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Community Health Initiative" 
                  {...field}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                />
              </FormControl>
              <FormDescription className="text-gray-500 dark:text-gray-400">
                Enter a descriptive name for your health program
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Comprehensive healthcare services for rural communities" 
                  {...field}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                />
              </FormControl>
              <FormDescription className="text-gray-500 dark:text-gray-400">
                Provide details about the program's objectives and services
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4 pt-4">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white" 
            type="submit"
          >
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Create Program
          </Button>
          <Button 
            className="flex-1" 
            type="button" 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
