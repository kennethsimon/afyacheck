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
import projectApi from "../../../services/config";
import moment from "moment";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

export const PatientFormSchema = z.object({
  // PatientInfo
  patientName: z.string().min(1, "Patient name is required"),
  age: z.number().min(0, "Age must be a positive number"),
  gender: z.enum(["male", "female", "other"]),
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
export function AddPatientForm({ campId, session }: any) {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: {
      patientName: "",
      age: 1,
      gender: "female",
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

  const onSubmit = async (data: z.infer<typeof PatientFormSchema>) => {
    // Handle form submission here...
    setLoading(true);
    const datacleaned = {
      name: data.patientName,
      gender: data.gender,
      dateOfBirth: moment(data.dob).format(),
      phoneNumber: data.telNo,
      location: data.location,
      address: data.address,
      screening: {
        illness: data.chronicIllness,
        medication: data.medications,
        alcoholOrSmokeUsage: data.smokeDrink,
        chronicDiseases: data.familyHistory,
        vaccinationHistory: data.vaccinationHistory,
      },
      clinicalFindings: {
        height: data.height.toString(),
        weight: data.weight.toString(),
        bmi: data.bmi.toString(),
        bloodPressure: data.bloodPressure,
        rbgFbs: data.rbg,
        bloodGroup: data.bloodGroup,
        cholesterol: data.cholesterol,
        physicalAppearance: data.physicalAppearance,
        cancer: data.cancerReport,
        ecgEcho: data.ecgReport,
        mse: data.mse,
        physio: data.physio,
        ot: data.ot,
        dental: data.dentalReport,
        ophthalmology: data.ophthalmologyReport,
        comments: data.doctorsComment,
        prescription: data.prescription,
        referral: data.referral,
      },
      camp: campId,
      createdBy: session?.user?._id,
    };
    const res: any = await projectApi.post("/patients", { ...datacleaned });
    if (res.status === 200) {
      setLoading(false);
      toast("Patient created successfully.", {
        description: `You submmited ${JSON.stringify(datacleaned)}`,
      });
    } else {
      setLoading(false);
      toast("An error occured please check your data before submitting", {
        description: `You submmited ${JSON.stringify(datacleaned)}`,
      });
    }
    window.location.reload();
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
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
