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
import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";

export function AddPatientForm({ campId, session, patientId, projectId, projectConfig }: any) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {patientData?.name && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Updating patient record
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Patient: <span className="font-semibold">{patientData.name}</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!patientId && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Complete the form below to register a new patient. After registration, you can add screening, clinical findings, and doctor comments.
              </p>
            </div>
          </div>
        )}

        <PatientInfo form={form} projectConfig={projectConfig} />
        
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href={`/dashboard/${projectId}/${campId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all min-w-[120px]"
            disabled={loading}
          >
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {patientId ? "Update Patient" : "Register Patient"}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 backdrop-blur-sm fixed inset-0 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
              {patientId ? "Patient Updated" : "Patient Registered"}
            </Dialog.Title>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {patientId 
                ? "Patient information has been successfully updated."
                : "The patient has been successfully registered in the system."}
            </p>

            {submittedPatient && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {submittedPatient.name}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Patient Identifier</span>
                      </div>
                      <p className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100">
                        {submittedPatient.patientIdentifier}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(submittedPatient.patientIdentifier)}
                      className="ml-4"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Link href={`/dashboard/${projectId}/${campId}/patients`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  View Patients
                </Button>
              </Link>
            </div>

            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Form>
  );
}
