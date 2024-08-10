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
import projectApi from "../../services/config";
import { useState, useEffect, useMemo } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getPermissions } from "@/services/projects";
import { useRouter } from "next/navigation";

const PatientInfoSchema = z.object({
  name: z.string().min(1, "Patient name is required"),
  gender: z.enum(["male", "female", "others"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Telephone number is required"),
  location: z.string().min(1, "Location is required"),
  insurance: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

const ScreeningQuestionsSchema = z.object({
  chronicIllness: z.enum(["yes", "no", "dont-know"]),
  medications: z.enum(["yes", "no", "stopped"]),
  smokeDrink: z.enum(["yes", "no", "stopped"]),
  familyHistory: z.enum(["yes", "no", "dont-know"]),
  vaccinationHistory: z.enum(["yes", "no", "ready", "refuse"]),
});

const ClinicalFindingsSchema = z.object({
  height: z.number().min(0, "Height must be a positive number"),
  weight: z.number().min(0, "Weight must be a positive number"),
  bmi: z.number().min(0, "BMI must be a positive number"),
  bloodPressure: z.string().min(1, "Blood pressure is required"),
  rbg: z.string().min(1, "RBG/FBS is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  cholesterol: z.string().min(1, "Cholesterol is required"),
  physicalAppearance: z.string().min(1, "Physical appearance is required"),
  cancerReport: z.string().min(1, "Cancer report is required"),
});

const DoctorCommentsSchema = z.object({
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

const schemas = [
  PatientInfoSchema,
  ScreeningQuestionsSchema,
  ClinicalFindingsSchema,
  DoctorCommentsSchema,
];

export function AddPatientForm({ campId, session, patientId, projectId }: any) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [patientData, setPatientData] = useState<any>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schemas[currentStage]),
    defaultValues: patientData || {},
  });

  useEffect(() => {
    setPermissions([
      "PatientInfo",
      "ScreeningQuestions",
      "ClinicalFindings",
      "DoctorComments",
    ]);
  }, [session]);

  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        try {
          const response = await projectApi.get(`/patients/${patientId}`);
          const patientInfo = response?.data?.data.patient;
          setPatientData(patientInfo);
          form.reset(patientInfo);
        } catch (error) {
          console.error("Error fetching patient data:", error);
          toast("Failed to fetch patient data. Please try again.");
        }
      };
      fetchPatientData();
    }
  }, [patientId, form]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (currentStage === 0 && !patientId) {
        const updatedData = {
          ...data,
          camp: campId,
          createdBy: session?.user?._id,
        };
        const response = await projectApi.post("/patients", updatedData);
        const patientId = response.data.patient._id;
        setPatientData(response.data.patient);
        toast("Patient created successfully.");
        router.push(
          `/dashboard/${projectId}/${campId}/add-patient?patientId=${patientId}`
        );
      } else {
        const response = await projectApi.put(`/patients/${patientId}`, data);
        setPatientData(response.data.patient);
        toast("Patient updated successfully.");
      }
      setLoading(false);
    } catch (error) {
      console.log("error : ", error);
      setLoading(false);
      toast("An error occurred. Please check your data before submitting");
    }
  };

  const stages = useMemo(
    () => [
      { name: "PatientInfo", component: <PatientInfo form={form} /> },
      {
        name: "ScreeningQuestions",
        component: <ScreeningQuestions form={form} />,
      },
      { name: "ClinicalFindings", component: <ClinicalFindings form={form} /> },
      { name: "DoctorComments", component: <DoctorComments form={form} /> },
    ],
    [form]
  );

  const fetchLatestPatientData = async () => {
    try {
      const response = await projectApi.get(`/patients/${patientId}`);
      const patientInfo = response?.data?.data.patient;
      setPatientData(patientInfo);
      form.reset(patientInfo);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast("Failed to fetch patient data. Please try again.");
    }
  };

  const renderStage = () => {
    console.log(`Rendering stage: ${stages[currentStage]?.name}`);
    return stages[currentStage]?.component;
  };

  const nextStage = () => {
    console.log("Triggering form validation...");
    form.trigger().then((isValid) => {
      console.log("Form validation result:", isValid);
      if (isValid) {
        // Submit the current stage data before moving to the next stage
        form
          .handleSubmit(onSubmit)()
          .then(() => {
            // Fetch the latest patient data
            fetchLatestPatientData().then(() => {
              let nextStageIndex = currentStage + 1;
              console.log("Initial next stage index:", nextStageIndex);
              while (
                nextStageIndex < stages.length &&
                !canAccessStage(stages[nextStageIndex].name)
              ) {
                console.log(
                  `Cannot access stage: ${stages[nextStageIndex].name}, moving to next stage`
                );
                nextStageIndex++;
              }
              if (nextStageIndex < stages.length) {
                console.log("Setting current stage to:", nextStageIndex);
                setCurrentStage(nextStageIndex);
                console.log("Resetting form with patient data:", patientData);
                form.reset(patientData); // Reset form with current patient data
              } else {
                console.log("No accessible stages found beyond current stage.");
                toast("No more stages available. Submitting form.");
                form.handleSubmit(onSubmit)(); // Trigger form submission
              }
            });
          });
      } else {
        console.log("Form is invalid. Showing toast message.");
        toast("Please fill all required fields before proceeding.");
      }
    });
  };

  const prevStage = () => {
    // Fetch the latest patient data
    fetchLatestPatientData().then(() => {
      let prevStageIndex = currentStage - 1;
      while (
        prevStageIndex >= 0 &&
        !canAccessStage(stages[prevStageIndex].name)
      ) {
        prevStageIndex--;
      }
      if (prevStageIndex >= 0) {
        setCurrentStage(prevStageIndex);
        form.reset(patientData);
      }
    });
  };

  const canAccessStage = (stageName: string) =>
    permissions?.includes(stageName);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="gap-8">
        {renderStage()}
        <div className="flex justify-between">
          <Button
            className="flex justify-start"
            type="button"
            onClick={prevStage}
            disabled={currentStage === 0}
          >
            Previous
          </Button>
          <Button
            className="flex justify-start"
            type="button"
            onClick={nextStage}
            disabled={currentStage === stages.length - 1}
          >
            Next
          </Button>
          {(currentStage === stages.length - 1 ||
            !canAccessStage(stages[currentStage + 1]?.name)) && (
            <Button className="flex justify-start" type="submit">
              {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
