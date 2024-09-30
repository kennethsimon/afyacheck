"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PatientInfo } from "./patient-info"; // Assuming PatientInfo is included for context
import { toast } from "sonner";
import projectApi from "../../services/config";
import { useState, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { cleanPatientFormData } from "@/lib/utils";
import { ScreeningQuestionsSchema } from "@/types/schemas";
import { ScreeningQuestions } from "./screening-questions";

export function AddScreeningForm({ campId, session, patientId, projectId }: any) {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ScreeningQuestionsSchema),
    defaultValues: patientData || {},
  });

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
    console.log(data)
    try {
      let updatedData = {};

      if (!patientId) {
        updatedData = {
          ...data,
          camp: campId,
          createdBy: session?.user?._id,
          patientIdentifier: data?.screening?.patientIdentifier
        };
        const response = await projectApi.post("/patients/diagnosis", updatedData);
        console.log(response?.data);
        // const newPatientId = response.data.patient._id;
        // setPatientData(response.data.patient);
        toast("Screening data added successfully.");
        // router.push(
        //   `/dashboard/${projectId}/${campId}/add-patient?patientId=${newPatientId}`
        // );
      } else {
        updatedData = {
          ...patientData,
          ...data,
        };
        const cleanData = cleanPatientFormData(updatedData, 0);
        const response = await projectApi.put(
          `/patients/${patientId}`,
          cleanData
        );
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!patientId && (
          <div className="text-center mb-4">
            <span className="text-lg font-semibold">Create patient to edit other patient details</span>
          </div>
        )}
        {patientData?.name && (
          <div className="text-center mb-4">
            <span className="text-lg font-semibold">
              Updating details for patient: {patientData.name}
            </span>
          </div>
        )}

        <ScreeningQuestions form={form} />
        
        <div className="flex justify-center mt-4">
          <Button className="flex justify-start" type="submit">
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {patientId ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
