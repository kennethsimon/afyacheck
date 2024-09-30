"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PatientInfo } from "./patient-info";
import { toast } from "sonner";
import projectApi from "../../services/config";
import { useState, useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { cleanPatientFormData } from "@/lib/utils";
import { PatientInfoSchema } from "@/types/schemas";
import * as Dialog from "@radix-ui/react-dialog"; // Import Dialog from Radix UI
import { Cross2Icon } from "@radix-ui/react-icons"; // Radix UI icon for closing

export function AddPatientForm({ campId, session, patientId, projectId }: any) {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [submittedPatient, setSubmittedPatient] = useState<any>(null); // Holds submitted patient data
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(PatientInfoSchema),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Patient Identifier copied to clipboard!");
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let updatedData = {};

      if (!patientId) {
        updatedData = {
          ...data,
          camp: campId,
          createdBy: session?.user?._id,
        };
        const response = await projectApi.post("/patients", updatedData);
        setSubmittedPatient(response?.data?.patient); // Store the response data
        setShowDialog(true); // Show dialog after successful submission
      } else {
        updatedData = {
          ...patientData,
          ...data,
        };
        const cleanData = cleanPatientFormData(updatedData, 0);
        const response = await projectApi.put(`/patients/${patientId}`, cleanData);
        setPatientData(response.data.patient);
        setSubmittedPatient(response?.data?.patient); // Update the patient data in state
        setShowDialog(true); // Show dialog after successful update
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="gap-8">
        {!patientId && (
          <div className="text-center mb-4">
            Create patient to edit other patient details
          </div>
        )}
        {patientData?.name && (
          <div className="text-center mb-4">
            Updating details for patient: {patientData.name}
          </div>
        )}
        <PatientInfo form={form} />
        <div className="flex justify-center mt-4">
          <Button className="flex justify-start" type="submit">
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {patientId ? "Update" : "Submit"}
          </Button>
        </div>
      </form>

      {/* Dialog for showing the patient details */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black bg-opacity-50 fixed inset-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Patient Created/Updated
            </Dialog.Title>
            {submittedPatient && (
              <div>
                <p>
                  <strong>Name:</strong> {submittedPatient.name}
                </p>
                <p className="flex items-center">
                  <strong>Patient Identifier:</strong> {submittedPatient.patientIdentifier}
                  <button
                    className="ml-2 text-blue-500"
                    onClick={() => copyToClipboard(submittedPatient.patientIdentifier)}
                  >
                    Copy
                  </button>
                </p>
                <div className="text-center mt-4">
                  <Button onClick={() => setShowDialog(false)}>Close</Button>
                </div>
              </div>
            )}
            <Dialog.Close asChild>
              <button className="absolute top-2 right-2">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Form>
  );
}
