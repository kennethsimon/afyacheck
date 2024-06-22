"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { PatientInfo } from "./patient-info";
import { ScreeningQuestions } from "./screening-questions";
import { DoctorComments } from "./doctor-comments";
import { ClinicalFindings } from "./clinical-findings";
import { toast } from "sonner";

export const PatientFormSchema = z.object({
  // PatientInfo
  patientName: z.string().min(1, "Patient name is required"),
  age: z.number().min(0, "Age must be a positive number"),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().min(1, "Date of birth is required"),
  telNo: z.string().min(1, "Telephone number is required"),
  location: z.string().min(1, "Location is required"),
  insurance: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  // ClinicalFindings
  height: z.number().min(0, "Height must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  bmi: z.number().min(0, "BMI must be a positive number"),
  bloodPressure: z.string().min(1, "Blood pressure is required"),
  rbg: z.string().min(1, "RBG/FBS is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  cholesterol: z.string().min(1, "Cholesterol is required"),
  physicalAppearance: z.string().min(1, "Physical appearance is required"),
  cancerReport: z.string().min(1, "Cancer report is required"),
  // ScreeningQuestions
  chronicIllness: z.enum(["yes", "no", "dont-know"]),
  medications: z.enum(["yes", "no", "stopped"]),
  smokeDrink: z.enum(["yes", "no", "stopped"]),
  familyHistory: z.enum(["yes", "no", "dont-know"]),
  vaccinationHistory: z.enum(["yes", "no", "ready", "refuse"]),
  // DoctorComments
  ecgReport: z.string().min(1, "ECG/ECHO and report is required"),
  mse: z.string().min(1, "MSE is required"),
  physio: z.string().min(1, "PHYSIO is required"),
  ot: z.string().min(1, "OT is required"),
  dentalReport: z.string().min(1, "Dental screening and report is required"),
  ophthalmologyReport: z
    .string()
    .min(1, "Ophthalmology screening and report is required"),
  doctorsComment: z
    .string()
    .min(1, "Doctors comment and/or diagnosis is required"),
  prescription: z.string().min(1, "Prescription if any is required"),
  referral: z.enum(["yes", "no-need-counselled", "no-need-healthy"]),
});
export function AddPatientForm() {
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      patientName: "",
      age: 1,
      gender: "Female",
      dob: "",
      telNo: "",
      location: "",
      insurance: "",
      address: "",
      height: 0,
      weight: 0,
      bmi: 0,
      bloodPressure: "",
      rbg: "",
      bloodGroup: "",
      cholesterol: "",
      physicalAppearance: "",
      cancerReport: "",
      chronicIllness: "dont-know",
      medications: "no",
      smokeDrink: "no",
      familyHistory: "dont-know",
      vaccinationHistory: "no",
      ecgReport: "",
      mse: "",
      physio: "",
      ot: "",
      dentalReport: "",
      ophthalmologyReport: "",
      doctorsComment: "",
      prescription: "",
      referral: "no-need-healthy",
    },
  });

  const onSubmit = (data: z.infer<typeof PatientFormSchema>) => {
    // Handle form submission here...
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="gap-8">
        <PatientInfo form={form} />
        <ScreeningQuestions form={form} />
        <ClinicalFindings form={form} />
        <DoctorComments form={form} />
        <div className="flex justify-between">
          <Button className="flex justify-start" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
