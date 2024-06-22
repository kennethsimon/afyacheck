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
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

import { PatientInfo } from "./patient-info";
import { ScreeningQuestions } from "./screening-questions";
import { DoctorComments } from "./doctor-comments";
import { ClinicalFindings } from "./clinical-findings";

export const PatientFormSchema = z.object({
  // Define your form fields here
});

export function AddPatientForm() {
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      // Define your form default values here
    },
  });

  const onSubmit = (data: z.infer<typeof PatientFormSchema>) => {
    // Handle form submission here...
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PatientInfo />
        <ScreeningQuestions />
        <ClinicalFindings />
        <DoctorComments />
        <div className="flex justify-between">
          <Button className="flex justify-start" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
