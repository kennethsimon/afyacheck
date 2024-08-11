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
import { getAddPatientFormPermissions } from "@/services/projects";
import { useRouter } from "next/navigation";
import { cleanPatientFormData } from "@/lib/utils";
import StepIndicator from "./step-indicator"; // Import the StepIndicator component
import {
  ClinicalFindingsSchema,
  DoctorCommentsSchema,
  PatientInfoSchema,
  ScreeningQuestionsSchema,
} from "@/types/schemas";

const schemas = [
  PatientInfoSchema,
  ScreeningQuestionsSchema,
  ClinicalFindingsSchema,
  DoctorCommentsSchema,
];

export function AddPatientForm({ campId, session, patientId, projectId }: any) {
  const [loading, setLoading] = useState(false);
  const [allSteps, setAllSteps] = useState<any>([]);
  const [allowedSteps, setAllowedSteps] = useState<any>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [patientData, setPatientData] = useState<any>(null);
  const [stepStatus, setStepStatus] = useState<string[]>([]);
  const [stepAllowed, setStepAllowed] = useState<boolean[]>([]);
  const [formPermissions, setFormPermissions] = useState<any>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schemas[currentStage]),
    defaultValues: patientData || {},
  });

  useEffect(() => {
    const fetchSteps = async () => {
      const allSteps = [
        "PatientInfo",
        "ScreeningQuestions",
        "ClinicalFindings",
        "DoctorComments",
      ];
      setAllSteps(allSteps);

      if (!formPermissions) {
        const fetchedFormPermissions = await getAddPatientFormPermissions();
        setFormPermissions(fetchedFormPermissions);
        const allowedSteps = allSteps.filter(
          (step) => fetchedFormPermissions[step]
        );
        setAllowedSteps(allowedSteps);
        updateStepStatus(patientData, fetchedFormPermissions);
      }
    };
    fetchSteps();
  }, [session, currentStage, formPermissions]);

  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        try {
          const response = await projectApi.get(`/patients/${patientId}`);
          const patientInfo = response?.data?.data.patient;
          setPatientData(patientInfo);
          form.reset(patientInfo);
          if (formPermissions) {
            updateStepStatus(patientInfo, formPermissions);
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
          toast("Failed to fetch patient data. Please try again.");
        }
      };
      fetchPatientData();
    }
  }, [patientId, form, currentStage, formPermissions]);

  useEffect(() => {
    form.reset();
    setCurrentStage(0);
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let updatedData = {};

      if (currentStage === 0 && !patientId) {
        updatedData = {
          ...data,
          camp: campId,
          createdBy: session?.user?._id,
        };
      } else {
        switch (currentStage) {
          case 0:
            updatedData = {
              ...patientData,
              ...data,
            };
            break;
          case 1:
            updatedData = {
              ...patientData,
              screening: {
                ...patientData.screening,
                ...data.screening,
              },
            };
            break;
          case 2:
            updatedData = {
              ...patientData,
              clinicalFindings: {
                ...patientData.clinicalFindings,
                ...data.clinicalFindings,
              },
            };
            break;
          case 3:
            updatedData = {
              ...patientData,
              doctorComments: {
                ...patientData.doctorComments,
                ...data.doctorComments,
              },
            };
            break;
          default:
            updatedData = data;
        }
      }

      const cleanData = cleanPatientFormData(updatedData, currentStage);

      if (currentStage === 0 && !patientId) {
        const response = await projectApi.post("/patients", cleanData);
        const patientId = response.data.patient._id;
        setPatientData(response.data.patient);
        toast("Patient created successfully.");
        router.push(
          `/dashboard/${projectId}/${campId}/add-patient?patientId=${patientId}`
        );
      } else {
        const response = await projectApi.put(
          `/patients/${patientId}`,
          cleanData
        );
        setPatientData(response.data.patient);
        toast("Patient updated successfully.");
        updateStepStatus(response.data.patient, formPermissions);
      }

      setLoading(false);

      if (!formPermissions) {
        const fetchedFormPermissions = await getAddPatientFormPermissions();
        setFormPermissions(fetchedFormPermissions);
      }

      const allowed = stages.map(
        (stage) => formPermissions[stage.name] === true
      );

      if (currentStage < stages.length - 1 && allowed[currentStage + 1]) {
        setCurrentStage(currentStage + 1);
        form.reset(patientData);
      } else if (
        currentStage < stages.length - 1 &&
        !allowed[currentStage + 1]
      ) {
        console.error("You don't have permission to move to the next stage.");
        toast("You don't have permission to move to the next stage.");
      }
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

  const renderStage = () => {
    return stages[currentStage]?.component;
  };

  const updateStepStatus = (patientInfo: any, formPermissions: any) => {
    const status = stages.map((stage, index) => {
      switch (index) {
        case 0:
          return patientInfo?.name ? "Completed" : "Not Completed";
        case 1:
          return patientInfo?.screening ? "Completed" : "Not Completed";
        case 2:
          return patientInfo?.clinicalFindings ? "Completed" : "Not Completed";
        case 3:
          return patientInfo?.doctorComments ? "Completed" : "Not Completed";
        default:
          return "Not Completed";
      }
    });

    const allowed = stages.map((stage) => formPermissions[stage.name] === true);
    setStepStatus(status);
    setStepAllowed(allowed);
  };

  const handleStepClick = (index: number) => {
    if (stepAllowed[index]) {
      setCurrentStage(index);
      form.reset(patientData);
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
        <StepIndicator
          steps={[
            "Patient Info",
            "Screening Questions",
            "Clinical Findings",
            "Doctor Comments",
          ]}
          currentStep={currentStage}
          stepStatus={stepStatus}
          stepAllowed={stepAllowed}
          onStepClick={handleStepClick}
        />
        {renderStage()}
        <div className="flex justify-center mt-4">
          <Button className="flex justify-start" type="submit">
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {currentStage === 0 && !patientId ? "Submit" : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
