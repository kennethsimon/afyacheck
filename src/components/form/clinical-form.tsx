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
import { ClinicalFindingsSchema } from "@/types/schemas";
import { ClinicalFindings } from "./clinical-findings";
import { CustomFieldsSection } from "./custom-fields-section";

export function AddClinicalForm({ campId, session, patientId, projectId, projectConfig }: any) {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(ClinicalFindingsSchema),
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
          patientIdentifier: data?.clinicalFindings?.patientNumber,
          camp: campId,
          createdBy: session?.user?._id,
        };
        const response = await projectApi.post("/patients/diagnosis", updatedData);
        console.log(response?.data);
        // const newPatientId = response.data.patient._id;
        // setPatientData(response.data.patient);
        toast("Clinical Findings data added successfully.");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!patientId && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                  <strong>Note:</strong> Create a patient first to edit other patient details
                </p>
              </div>
            )}
            {patientData?.name && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  <strong>Updating details for patient:</strong> {patientData.name}
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
              <ClinicalFindings form={form} />
              <CustomFieldsSection 
                form={form} 
                projectConfig={projectConfig} 
                section="clinicalFindings" 
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md"
              >
                {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                {patientId ? "Update Findings" : "Submit Findings"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
