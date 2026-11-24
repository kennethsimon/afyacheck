"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  HeartPulse,
  Loader2,
  Lock,
  MapPin,
  Save,
  ScanLine,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import { ErrorState, StatusBadge } from "@/components/platform/states";
import { DiagnosesRegisterView } from "./diagnoses-register-view";
import { useCamps, useDiagnoses, useUpsertDiagnosis } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import {
  canAccessClinical,
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";
import { PATIENT_ID_REGEX } from "@/types/schemas";
import { cn } from "@/lib/utils";
import type { DiagnosisRecord } from "@/lib/api/types";

export type ClinicalSectionId =
  | "vitals"
  | "infectious"
  | "cancer"
  | "specialties"
  | "radiology"
  | "doctor";

interface ScreeningDraft {
  height: string;
  weight: string;
  bloodPressure: string;
  hb: string;
  illness: string;
  medication: string;
  alcoholOrSmokeUsage: string;
  chronicDiseases: string;
  vaccinationHistory: string;
}

interface ClinicalDraft {
  tbStatus: string;
  tbMedicationStatus: string;
  hivTesting: string;
  hivResult: string;
  hivCase: string;
  hivKnownCaseMedication: string;
  hivNewCaseMedication: string;
  preventiveMeasure: string;
  preventiveMeasureDetails: string;
  educationCounseling: string;
  bloodDonation: string;
  cancerScreening: string;
  breastCancerStatus: string;
  breastCancerReferred: string;
  cervicalCancerStatus: string;
  cervicalCancerTreatment: string;
  prostateCancerStatus: string;
  physioStatus: string;
  physioDiagnosis: string;
  physioReferral: string;
  dentalStatus: string;
  dentalDiagnosis: string;
  ophthalmologyStatus: string;
  ophthalmologyDiagnosis: string;
  ophthalmologyReferral: string;
  orthoStatus: string;
  orthoDiagnosis: string;
  orthoReferral: string;
  radiologyType: string;
  echoStatus: string;
  echoDiagnosis: string;
  ecgStatus: string;
  ecgDiagnosis: string;
  xrayStatus: string;
  xrayDiagnosis: string;
  ultrasoundStatus: string;
  ultrasoundDiagnosis: string;
}

interface DoctorDraft {
  doctorsComment: string;
  prescription: string;
}

const EMPTY_SCREENING: ScreeningDraft = {
  height: "",
  weight: "",
  bloodPressure: "",
  hb: "",
  illness: "",
  medication: "",
  alcoholOrSmokeUsage: "",
  chronicDiseases: "",
  vaccinationHistory: "",
};

const EMPTY_CLINICAL: ClinicalDraft = {
  tbStatus: "",
  tbMedicationStatus: "",
  hivTesting: "",
  hivResult: "",
  hivCase: "",
  hivKnownCaseMedication: "",
  hivNewCaseMedication: "",
  preventiveMeasure: "",
  preventiveMeasureDetails: "",
  educationCounseling: "",
  bloodDonation: "",
  cancerScreening: "",
  breastCancerStatus: "",
  breastCancerReferred: "",
  cervicalCancerStatus: "",
  cervicalCancerTreatment: "",
  prostateCancerStatus: "",
  physioStatus: "",
  physioDiagnosis: "",
  physioReferral: "",
  dentalStatus: "",
  dentalDiagnosis: "",
  ophthalmologyStatus: "",
  ophthalmologyDiagnosis: "",
  ophthalmologyReferral: "",
  orthoStatus: "",
  orthoDiagnosis: "",
  orthoReferral: "",
  radiologyType: "",
  echoStatus: "",
  echoDiagnosis: "",
  ecgStatus: "",
  ecgDiagnosis: "",
  xrayStatus: "",
  xrayDiagnosis: "",
  ultrasoundStatus: "",
  ultrasoundDiagnosis: "",
};

const EMPTY_DOCTOR: DoctorDraft = {
  doctorsComment: "",
  prescription: "",
};

const NOT_PERFORMED = "__not_performed__";

function selectVal(v: string) {
  return v || NOT_PERFORMED;
}

function fromSelect(v: string) {
  return v === NOT_PERFORMED ? "" : v;
}

export function ClinicalWorkspaceView({
  initialSection = "vitals",
  initialTab = "entry",
  scopedCampId,
}: {
  initialSection?: ClinicalSectionId;
  initialTab?: "entry" | "register";
  scopedCampId?: string;
}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const workspace = useWorkspace();

  const urlPatientId = searchParams?.get("patientIdentifier") || "AC";
  const urlCampId =
    scopedCampId ||
    searchParams?.get("campId") ||
    (workspace.campId !== "all" ? workspace.campId : "");

  const [activeTab, setActiveTab] = useState<"entry" | "register">(initialTab);
  const [section, setSection] = useState<ClinicalSectionId>(initialSection);
  const [patientIdentifier, setPatientIdentifier] = useState<string>(
    urlPatientId.toUpperCase()
  );
  const [selectedCampId, setSelectedCampId] = useState<string>(urlCampId);

  const [screening, setScreening] = useState<ScreeningDraft>(EMPTY_SCREENING);
  const [clinical, setClinical] = useState<ClinicalDraft>(EMPTY_CLINICAL);
  const [doctor, setDoctor] = useState<DoctorDraft>(EMPTY_DOCTOR);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);

  const campsQuery = useCamps("all");
  const upsertDiagnosis = useUpsertDiagnosis();

  // Check if there is an existing record for this patient ID in the active camp
  const diagnosesQuery = useDiagnoses(
    {
      projectId: "all",
      campId: selectedCampId || "all",
      page: 1,
      limit: 200,
    },
    Boolean(selectedCampId)
  );

  const existingRecord = useMemo(() => {
    if (!PATIENT_ID_REGEX.test(patientIdentifier)) return null;
    return (
      (diagnosesQuery.data?.items ?? []).find(
        (d) => d.patientIdentifier === patientIdentifier
      ) ?? null
    );
  }, [diagnosesQuery.data?.items, patientIdentifier]);

  const hydrateFromRecord = (record: DiagnosisRecord) => {
    setPatientIdentifier(record.patientIdentifier);
    const cid = typeof record.camp === "string" ? record.camp : record.camp?._id;
    if (cid) setSelectedCampId(cid);

    const s = record.screening;
    if (s) {
      setScreening({
        height: s.height !== undefined && s.height !== null ? String(s.height) : "",
        weight: s.weight !== undefined && s.weight !== null ? String(s.weight) : "",
        bloodPressure: s.bloodPressure || "",
        hb: s.hb || "",
        illness: s.illness || "",
        medication: s.medication || "",
        alcoholOrSmokeUsage: s.alcoholOrSmokeUsage || "",
        chronicDiseases: s.chronicDiseases || "",
        vaccinationHistory: s.vaccinationHistory || "",
      });
    }

    const cf = record.clinicalFindings;
    if (cf) {
      setClinical({
        tbStatus: cf.tbScreening?.status || "",
        tbMedicationStatus: cf.tbScreening?.medicationStatus || "",
        hivTesting: cf.hivTesting || "",
        hivResult: cf.hivResult || "",
        hivCase: cf.hivCase || "",
        hivKnownCaseMedication: cf.hivKnownCaseMedication || "",
        hivNewCaseMedication: cf.hivNewCaseMedication || "",
        preventiveMeasure: cf.preventiveMeasure || "",
        preventiveMeasureDetails: cf.preventiveMeasureDetails || "",
        educationCounseling: cf.educationCounseling || "",
        bloodDonation: cf.bloodDonation || "",
        cancerScreening: cf.cancerScreening || "",
        breastCancerStatus: cf.breastCancerStatus || "",
        breastCancerReferred: cf.breastCancerReferred || "",
        cervicalCancerStatus: cf.cervicalCancerStatus || "",
        cervicalCancerTreatment: cf.cervicalCancerTreatment || "",
        prostateCancerStatus: cf.prostateCancerStatus || "",
        physioStatus: cf.physioStatus || "",
        physioDiagnosis: cf.physioDiagnosis || "",
        physioReferral: cf.physioReferral || "",
        dentalStatus: cf.dentalStatus || "",
        dentalDiagnosis: cf.dentalDiagnosis || "",
        ophthalmologyStatus: cf.ophthalmologyStatus || "",
        ophthalmologyDiagnosis: cf.ophthalmologyDiagnosis || "",
        ophthalmologyReferral: cf.ophthalmologyReferral || "",
        orthoStatus: cf.orthoStatus || "",
        orthoDiagnosis: cf.orthoDiagnosis || "",
        orthoReferral: cf.orthoReferral || "",
        radiologyType: cf.radiologyType || "",
        echoStatus: cf.echoStatus || "",
        echoDiagnosis: cf.echoDiagnosis || "",
        ecgStatus: cf.ecgStatus || "",
        ecgDiagnosis: cf.ecgDiagnosis || "",
        xrayStatus: cf.xrayStatus || "",
        xrayDiagnosis: cf.xrayDiagnosis || "",
        ultrasoundStatus: cf.ultrasoundStatus || "",
        ultrasoundDiagnosis: cf.ultrasoundDiagnosis || "",
      });
    }

    const dc = record.doctorComments;
    if (dc) {
      setDoctor({
        doctorsComment: dc.doctorsComment || "",
        prescription: dc.prescription || "",
      });
    }

    setActiveTab("entry");
    toast.info(`Loaded clinical record for ${record.patientIdentifier}`);
  };

  // Reactive BMI calculation without mutating user inputs
  const calculatedBmi = useMemo(() => {
    const h = parseFloat(screening.height);
    const w = parseFloat(screening.weight);
    if (!h || !w || h <= 0 || w <= 0) return "";
    const meters = h / 100;
    return (w / (meters * meters)).toFixed(1);
  }, [screening.height, screening.weight]);

  // Clinical plausibility warnings (non-destructive)
  const clinicalWarnings = useMemo(() => {
    const warnings: string[] = [];
    const h = parseFloat(screening.height);
    const w = parseFloat(screening.weight);
    const bmi = parseFloat(calculatedBmi);

    if (screening.height && (Number.isNaN(h) || h < 45 || h > 240)) {
      warnings.push("Height is outside typical clinical range (45–240 cm). Verify measurement.");
    }
    if (screening.weight && (Number.isNaN(w) || w < 2 || w > 250)) {
      warnings.push("Weight is outside typical clinical range (2–250 kg). Verify measurement.");
    }
    if (calculatedBmi && !Number.isNaN(bmi) && (bmi < 12 || bmi > 55)) {
      warnings.push(`Calculated BMI (${bmi} kg/m²) is extreme. Double-check height (cm) and weight (kg).`);
    }
    if (clinical.tbStatus === "positive" || clinical.hivResult === "positive") {
      warnings.push(
        "Clinically significant positive screening finding recorded. Confirm clinician review before finalizing."
      );
    }
    return warnings;
  }, [screening.height, screening.weight, calculatedBmi, clinical.tbStatus, clinical.hivResult]);

  // Warn before accidental navigation with unsaved values
  const hasAnyInput = useMemo(() => {
    return (
      Object.values(screening).some(Boolean) ||
      Object.values(clinical).some(Boolean) ||
      Object.values(doctor).some(Boolean)
    );
  }, [screening, clinical, doctor]);

  useEffect(() => {
    if (!hasAnyInput) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasAnyInput]);

  const canEnter = canAccessClinical(session as any);
  const canEditScreening = hasPermission(session as any, PERMISSIONS.EDIT_SCREENING);
  const canEditFindings = hasPermission(session as any, PERMISSIONS.EDIT_CLINICAL);
  const canEditDoctor = hasPermission(session as any, PERMISSIONS.EDIT_DOCTOR_COMMENTS);

  if (!canEnter) {
    return (
      <ErrorState
        isPermissionError
        title="Clinical workspace access restricted"
        description="You need screening, clinical findings, or doctor review permissions to access this workspace."
      />
    );
  }

  const camps = campsQuery.data?.camps ?? [];
  const selectedCamp = camps.find((c) => c._id === selectedCampId);
  const patientIdValid = PATIENT_ID_REGEX.test(patientIdentifier);

  const sectionProgress = {
    vitals: Boolean(
      screening.height ||
        screening.weight ||
        screening.bloodPressure ||
        screening.hb ||
        screening.illness
    ),
    infectious: Boolean(
      clinical.tbStatus || clinical.hivTesting || clinical.preventiveMeasure
    ),
    cancer: Boolean(clinical.cancerScreening),
    specialties: Boolean(
      clinical.physioStatus ||
        clinical.dentalStatus ||
        clinical.ophthalmologyStatus ||
        clinical.orthoStatus
    ),
    radiology: Boolean(clinical.radiologyType),
    doctor: Boolean(doctor.doctorsComment.trim() && doctor.prescription.trim()),
  };

  const sections: {
    id: ClinicalSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    allowed: boolean;
    completed: boolean;
  }[] = [
    {
      id: "vitals",
      label: "Vitals & History",
      icon: Activity,
      allowed: canEditScreening,
      completed: sectionProgress.vitals,
    },
    {
      id: "infectious",
      label: "TB, HIV & Preventive",
      icon: HeartPulse,
      allowed: canEditFindings,
      completed: sectionProgress.infectious,
    },
    {
      id: "cancer",
      label: "Cancer Screening",
      icon: ClipboardList,
      allowed: canEditFindings,
      completed: sectionProgress.cancer,
    },
    {
      id: "specialties",
      label: "Specialty Exams",
      icon: Stethoscope,
      allowed: canEditFindings,
      completed: sectionProgress.specialties,
    },
    {
      id: "radiology",
      label: "Radiology & Imaging",
      icon: ScanLine,
      allowed: canEditFindings,
      completed: sectionProgress.radiology,
    },
    {
      id: "doctor",
      label: "Doctor Review & Plan",
      icon: FileCheck2,
      allowed: canEditDoctor,
      completed: sectionProgress.doctor,
    },
  ];

  const buildPayload = (status: "pending" | "completed") => {
    const screeningPayload: Record<string, unknown> = {};
    if (screening.height) screeningPayload.height = Number(screening.height);
    if (screening.weight) screeningPayload.weight = Number(screening.weight);
    if (calculatedBmi) screeningPayload.bmi = calculatedBmi;
    if (screening.bloodPressure) screeningPayload.bloodPressure = screening.bloodPressure;
    if (screening.hb) screeningPayload.hb = screening.hb;
    if (screening.illness) screeningPayload.illness = screening.illness;
    if (screening.medication) screeningPayload.medication = screening.medication;
    if (screening.alcoholOrSmokeUsage) {
      screeningPayload.alcoholOrSmokeUsage = screening.alcoholOrSmokeUsage;
    }
    if (screening.chronicDiseases) {
      screeningPayload.chronicDiseases = screening.chronicDiseases;
    }
    if (screening.vaccinationHistory) {
      screeningPayload.vaccinationHistory = screening.vaccinationHistory;
    }

    const clinicalPayload: Record<string, unknown> = {};
    if (clinical.tbStatus) {
      clinicalPayload.tbScreening = {
        status: clinical.tbStatus,
        ...(clinical.tbMedicationStatus
          ? { medicationStatus: clinical.tbMedicationStatus }
          : {}),
      };
    }
    if (clinical.hivTesting) clinicalPayload.hivTesting = clinical.hivTesting;
    if (clinical.hivResult) clinicalPayload.hivResult = clinical.hivResult;
    if (clinical.hivCase) clinicalPayload.hivCase = clinical.hivCase;
    if (clinical.hivKnownCaseMedication) {
      clinicalPayload.hivKnownCaseMedication = clinical.hivKnownCaseMedication;
    }
    if (clinical.hivNewCaseMedication) {
      clinicalPayload.hivNewCaseMedication = clinical.hivNewCaseMedication;
    }
    if (clinical.preventiveMeasure) {
      clinicalPayload.preventiveMeasure = clinical.preventiveMeasure;
    }
    if (clinical.preventiveMeasureDetails) {
      clinicalPayload.preventiveMeasureDetails = clinical.preventiveMeasureDetails;
    }
    if (clinical.educationCounseling) {
      clinicalPayload.educationCounseling = clinical.educationCounseling;
    }
    if (clinical.bloodDonation) clinicalPayload.bloodDonation = clinical.bloodDonation;

    if (clinical.cancerScreening) {
      clinicalPayload.cancerScreening = clinical.cancerScreening;
      if (clinical.breastCancerStatus) {
        clinicalPayload.breastCancerStatus = clinical.breastCancerStatus;
      }
      if (clinical.breastCancerReferred) {
        clinicalPayload.breastCancerReferred = clinical.breastCancerReferred;
      }
      if (clinical.cervicalCancerStatus) {
        clinicalPayload.cervicalCancerStatus = clinical.cervicalCancerStatus;
      }
      if (clinical.cervicalCancerTreatment) {
        clinicalPayload.cervicalCancerTreatment = clinical.cervicalCancerTreatment;
      }
      if (clinical.prostateCancerStatus) {
        clinicalPayload.prostateCancerStatus = clinical.prostateCancerStatus;
      }
    }

    if (clinical.physioStatus) clinicalPayload.physioStatus = clinical.physioStatus;
    if (clinical.physioDiagnosis) clinicalPayload.physioDiagnosis = clinical.physioDiagnosis;
    if (clinical.physioReferral) clinicalPayload.physioReferral = clinical.physioReferral;
    if (clinical.dentalStatus) clinicalPayload.dentalStatus = clinical.dentalStatus;
    if (clinical.dentalDiagnosis) clinicalPayload.dentalDiagnosis = clinical.dentalDiagnosis;
    if (clinical.ophthalmologyStatus) {
      clinicalPayload.ophthalmologyStatus = clinical.ophthalmologyStatus;
    }
    if (clinical.ophthalmologyDiagnosis) {
      clinicalPayload.ophthalmologyDiagnosis = clinical.ophthalmologyDiagnosis;
    }
    if (clinical.ophthalmologyReferral) {
      clinicalPayload.ophthalmologyReferral = clinical.ophthalmologyReferral;
    }
    if (clinical.orthoStatus) clinicalPayload.orthoStatus = clinical.orthoStatus;
    if (clinical.orthoDiagnosis) clinicalPayload.orthoDiagnosis = clinical.orthoDiagnosis;
    if (clinical.orthoReferral) clinicalPayload.orthoReferral = clinical.orthoReferral;

    if (clinical.radiologyType) clinicalPayload.radiologyType = clinical.radiologyType;
    if (clinical.echoStatus) clinicalPayload.echoStatus = clinical.echoStatus;
    if (clinical.echoDiagnosis) clinicalPayload.echoDiagnosis = clinical.echoDiagnosis;
    if (clinical.ecgStatus) clinicalPayload.ecgStatus = clinical.ecgStatus;
    if (clinical.ecgDiagnosis) clinicalPayload.ecgDiagnosis = clinical.ecgDiagnosis;
    if (clinical.xrayStatus) clinicalPayload.xrayStatus = clinical.xrayStatus;
    if (clinical.xrayDiagnosis) clinicalPayload.xrayDiagnosis = clinical.xrayDiagnosis;
    if (clinical.ultrasoundStatus) {
      clinicalPayload.ultrasoundStatus = clinical.ultrasoundStatus;
    }
    if (clinical.ultrasoundDiagnosis) {
      clinicalPayload.ultrasoundDiagnosis = clinical.ultrasoundDiagnosis;
    }

    const doctorPayload =
      doctor.doctorsComment.trim() || doctor.prescription.trim()
        ? {
            doctorsComment: doctor.doctorsComment.trim(),
            prescription: doctor.prescription.trim(),
          }
        : undefined;

    return {
      patientIdentifier,
      camp: selectedCampId,
      createdBy: (session?.user as any)?._id,
      status,
      ...(Object.keys(screeningPayload).length > 0 ? { screening: screeningPayload } : {}),
      ...(Object.keys(clinicalPayload).length > 0
        ? { clinicalFindings: clinicalPayload }
        : {}),
      ...(doctorPayload ? { doctorComments: doctorPayload } : {}),
    };
  };

  const submitClinicalRecord = async (status: "pending" | "completed") => {
    if (!selectedCampId) {
      toast.error("Select the active camp before saving clinical data.");
      return;
    }
    if (!patientIdValid) {
      toast.error("Enter a valid Patient ID (AC followed by exactly 12 digits).");
      return;
    }
    if (
      status === "completed" &&
      (!doctor.doctorsComment.trim() || !doctor.prescription.trim())
    ) {
      toast.error(
        "Doctor comments and prescription/plan are required to finalize a clinical record."
      );
      setSection("doctor");
      return;
    }

    try {
      await upsertDiagnosis.mutateAsync(buildPayload(status));
      toast.success(
        status === "completed"
          ? `Clinical record finalized for ${patientIdentifier}`
          : `Pending clinical draft saved for ${patientIdentifier}`
      );
      setConfirmFinalizeOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save clinical record"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clinical Screening Workspace"
        description="Structured vital signs, infectious disease, cancer, specialty, radiology, and doctor review workflows."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Clinical Screening" },
        ]}
        badge={
          selectedCamp ? (
            <StatusBadge tone="info">Camp: {selectedCamp.name}</StatusBadge>
          ) : (
            <StatusBadge tone="warning">Select camp</StatusBadge>
          )
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v: any) => setActiveTab(v)}
        className="space-y-4"
      >
        <TabsList className="h-9 bg-muted/60 p-0.5">
          <TabsTrigger value="entry" className="text-xs">
            Clinical Data Entry
          </TabsTrigger>
          <TabsTrigger value="register" className="text-xs">
            Screenings & Diagnoses Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          {/* Active Camp + Patient ID Safety Bar */}
          <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Active Health Camp <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedCampId} onValueChange={setSelectedCampId}>
                <SelectTrigger className="h-9 bg-background text-xs">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  <SelectValue placeholder="Choose target camp..." />
                </SelectTrigger>
                <SelectContent>
                  {camps.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="clinical-patient-id"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Patient Identifier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clinical-patient-id"
                value={patientIdentifier}
                maxLength={14}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setPatientIdentifier(val.startsWith("AC") ? val : `AC${val.replace(/^AC/i, "")}`);
                }}
                placeholder="AC000000000001"
                className="h-9 bg-background font-mono text-xs tracking-wider"
              />
              {!patientIdValid && patientIdentifier.length > 2 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Format: AC + 12 digits ({Math.max(0, 14 - patientIdentifier.length)} remaining)
                </p>
              )}
            </div>

            <div className="flex items-end justify-between gap-2">
              {existingRecord ? (
                <div className="flex w-full items-center justify-between rounded-md border border-primary/30 bg-accent/40 px-3 py-2 text-xs">
                  <div>
                    <div className="font-medium text-foreground">
                      Existing {existingRecord.status} record
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {existingRecord.createdAt
                        ? format(new Date(existingRecord.createdAt), "MMM d, HH:mm")
                        : "On file"}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => hydrateFromRecord(existingRecord)}
                  >
                    Load
                  </Button>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-[11px] text-muted-foreground">
                  <span>
                    {patientIdValid
                      ? "New clinical encounter ready"
                      : "Enter valid Patient ID to check prior findings"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3-Pane Clinical Workspace */}
          <div className="grid gap-4 lg:grid-cols-[220px_1fr_290px]">
            {/* LEFT: Section Navigation */}
            <aside className="rounded-lg border border-border bg-card p-2 space-y-1 self-start">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Screening Sections
              </div>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const active = section === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSection(sec.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{sec.label}</span>
                    </span>
                    {!sec.allowed ? (
                      <Lock className="h-3 w-3 shrink-0 opacity-60" />
                    ) : sec.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : null}
                  </button>
                );
              })}
            </aside>

            {/* CENTER: Active Clinical Entry Form */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-5">
              {section === "vitals" && (
                <div className="space-y-5">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Vital Signs & Intake History
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Record physical measurements with units. Values are preserved
                      when switching sections.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (cm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        disabled={!canEditScreening}
                        placeholder="e.g., 168"
                        value={screening.height}
                        onChange={(e) =>
                          setScreening((s) => ({ ...s, height: e.target.value }))
                        }
                        className="h-9 bg-background tabular-nums text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        disabled={!canEditScreening}
                        placeholder="e.g., 64.5"
                        value={screening.weight}
                        onChange={(e) =>
                          setScreening((s) => ({ ...s, weight: e.target.value }))
                        }
                        className="h-9 bg-background tabular-nums text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">BMI (kg/m², auto-calculated)</Label>
                      <Input
                        readOnly
                        value={calculatedBmi ? `${calculatedBmi} kg/m²` : "—"}
                        className="h-9 bg-muted/50 tabular-nums text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Blood Pressure Classification</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.bloodPressure)}
                        onValueChange={(v) =>
                          setScreening((s) => ({ ...s, bloodPressure: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High (Elevated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Hemoglobin (Hb) Status</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.hb)}
                        onValueChange={(v) =>
                          setScreening((s) => ({ ...s, hb: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Current Illness or Symptoms</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.illness)}
                        onValueChange={(v) =>
                          setScreening((s) => ({ ...s, illness: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not asked</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="dont-know">Unsure / Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Current Medication Use</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.medication)}
                        onValueChange={(v) =>
                          setScreening((s) => ({ ...s, medication: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not asked</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="stopped">Stopped previously</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Alcohol or Tobacco Usage</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.alcoholOrSmokeUsage)}
                        onValueChange={(v) =>
                          setScreening((s) => ({
                            ...s,
                            alcoholOrSmokeUsage: fromSelect(v),
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not asked</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="stopped">Stopped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Known Chronic Diseases</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.chronicDiseases)}
                        onValueChange={(v) =>
                          setScreening((s) => ({ ...s, chronicDiseases: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not asked</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="dont-know">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Vaccination Status</Label>
                      <Select
                        disabled={!canEditScreening}
                        value={selectVal(screening.vaccinationHistory)}
                        onValueChange={(v) =>
                          setScreening((s) => ({
                            ...s,
                            vaccinationHistory: fromSelect(v),
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not asked</SelectItem>
                          <SelectItem value="yes">Vaccinated</SelectItem>
                          <SelectItem value="no">Not vaccinated</SelectItem>
                          <SelectItem value="ready">Ready to vaccinate</SelectItem>
                          <SelectItem value="refuse">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {section === "infectious" && (
                <div className="space-y-5">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      TB, HIV & Preventive Care Screening
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Screening statuses distinguish not performed, negative,
                      suspicious, and positive findings.
                    </p>
                  </div>

                  {/* TB */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">TB Screening Status</Label>
                      <Select
                        disabled={!canEditFindings}
                        value={selectVal(clinical.tbStatus)}
                        onValueChange={(v) =>
                          setClinical((c) => ({ ...c, tbStatus: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                          <SelectItem value="suspicious">Suspicious</SelectItem>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="knownCase">Known TB Case</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(clinical.tbStatus === "positive" ||
                      clinical.tbStatus === "knownCase") && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">TB Medication Status</Label>
                        <Select
                          disabled={!canEditFindings}
                          value={selectVal(clinical.tbMedicationStatus)}
                          onValueChange={(v) =>
                            setClinical((c) => ({
                              ...c,
                              tbMedicationStatus: fromSelect(v),
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                            <SelectItem value="started">Started</SelectItem>
                            <SelectItem value="notStarted">Not started</SelectItem>
                            <SelectItem value="onMedication">On medication</SelectItem>
                            <SelectItem value="notOnMedication">Not on medication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* HIV */}
                  <div className="border-t border-border pt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">HIV Testing</Label>
                      <Select
                        disabled={!canEditFindings}
                        value={selectVal(clinical.hivTesting)}
                        onValueChange={(v) =>
                          setClinical((c) => ({ ...c, hivTesting: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                          <SelectItem value="not-tested">Not tested</SelectItem>
                          <SelectItem value="tested">Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {clinical.hivTesting === "tested" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">HIV Test Result</Label>
                        <Select
                          disabled={!canEditFindings}
                          value={selectVal(clinical.hivResult)}
                          onValueChange={(v) =>
                            setClinical((c) => ({ ...c, hivResult: fromSelect(v) }))
                          }
                        >
                          <SelectTrigger className="h-9 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {clinical.hivResult === "positive" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">HIV Case Classification</Label>
                          <Select
                            disabled={!canEditFindings}
                            value={selectVal(clinical.hivCase)}
                            onValueChange={(v) =>
                              setClinical((c) => ({ ...c, hivCase: fromSelect(v) }))
                            }
                          >
                            <SelectTrigger className="h-9 bg-background text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                              <SelectItem value="new-case">New case</SelectItem>
                              <SelectItem value="known-case">Known case</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {clinical.hivCase === "known-case" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Known Case ART Status</Label>
                            <Select
                              disabled={!canEditFindings}
                              value={selectVal(clinical.hivKnownCaseMedication)}
                              onValueChange={(v) =>
                                setClinical((c) => ({
                                  ...c,
                                  hivKnownCaseMedication: fromSelect(v),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 bg-background text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                                <SelectItem value="on-medication">On ART</SelectItem>
                                <SelectItem value="not-on-medication">Not on ART</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {clinical.hivCase === "new-case" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">New Case Linkage</Label>
                            <Select
                              disabled={!canEditFindings}
                              value={selectVal(clinical.hivNewCaseMedication)}
                              onValueChange={(v) =>
                                setClinical((c) => ({
                                  ...c,
                                  hivNewCaseMedication: fromSelect(v),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 bg-background text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                                <SelectItem value="started">Started</SelectItem>
                                <SelectItem value="linked-to-care">Linked to care</SelectItem>
                                <SelectItem value="not-started">Not started</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Preventive & Blood Donation */}
                  <div className="border-t border-border pt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Preventive Measure Provided</Label>
                      <Select
                        disabled={!canEditFindings}
                        value={selectVal(clinical.preventiveMeasure)}
                        onValueChange={(v) =>
                          setClinical((c) => ({
                            ...c,
                            preventiveMeasure: fromSelect(v),
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes (Commodity provided)</SelectItem>
                          <SelectItem value="education-and-counseling">
                            Education & Counseling
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {clinical.preventiveMeasure === "yes" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Commodity Detail</Label>
                        <Select
                          disabled={!canEditFindings}
                          value={selectVal(clinical.preventiveMeasureDetails)}
                          onValueChange={(v) =>
                            setClinical((c) => ({
                              ...c,
                              preventiveMeasureDetails: fromSelect(v),
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_PERFORMED}>Not specified</SelectItem>
                            <SelectItem value="self-test-kit">Self-test kit</SelectItem>
                            <SelectItem value="condom">Condoms</SelectItem>
                            <SelectItem value="pep">PEP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs">Blood Donation</Label>
                      <Select
                        disabled={!canEditFindings}
                        value={selectVal(clinical.bloodDonation)}
                        onValueChange={(v) =>
                          setClinical((c) => ({ ...c, bloodDonation: fromSelect(v) }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                          <SelectItem value="yes">Donated</SelectItem>
                          <SelectItem value="no">Did not donate</SelectItem>
                          <SelectItem value="not-reported">Not reported</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {section === "cancer" && (
                <div className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Cancer Screening
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Breast, cervical, and prostate screening status and referral documentation.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Screening Type</Label>
                      <Select
                        disabled={!canEditFindings}
                        value={selectVal(clinical.cancerScreening)}
                        onValueChange={(v) =>
                          setClinical((c) => ({
                            ...c,
                            cancerScreening: fromSelect(v),
                          }))
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                          <SelectItem value="breast-cancer">Breast Cancer</SelectItem>
                          <SelectItem value="cervical-cancer">Cervical Cancer</SelectItem>
                          <SelectItem value="prostate-cancer">Prostate Cancer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {clinical.cancerScreening === "breast-cancer" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Breast Screening Status</Label>
                          <Select
                            disabled={!canEditFindings}
                            value={selectVal(clinical.breastCancerStatus)}
                            onValueChange={(v) =>
                              setClinical((c) => ({
                                ...c,
                                breastCancerStatus: fromSelect(v),
                              }))
                            }
                          >
                            <SelectTrigger className="h-9 bg-background text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="suspicious">Suspicious</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {clinical.breastCancerStatus === "suspicious" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Referral Action</Label>
                            <Select
                              disabled={!canEditFindings}
                              value={selectVal(clinical.breastCancerReferred)}
                              onValueChange={(v) =>
                                setClinical((c) => ({
                                  ...c,
                                  breastCancerReferred: fromSelect(v),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 bg-background text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                                <SelectItem value="further-investigation">
                                  Referred for further investigation
                                </SelectItem>
                                <SelectItem value="not-referred">Not referred</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}

                    {clinical.cancerScreening === "cervical-cancer" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Cervical Screening Status</Label>
                          <Select
                            disabled={!canEditFindings}
                            value={selectVal(clinical.cervicalCancerStatus)}
                            onValueChange={(v) =>
                              setClinical((c) => ({
                                ...c,
                                cervicalCancerStatus: fromSelect(v),
                              }))
                            }
                          >
                            <SelectTrigger className="h-9 bg-background text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="suspicious">Suspicious</SelectItem>
                              <SelectItem value="positive">Positive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {clinical.cervicalCancerStatus === "positive" && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Treatment Referral</Label>
                            <Select
                              disabled={!canEditFindings}
                              value={selectVal(clinical.cervicalCancerTreatment)}
                              onValueChange={(v) =>
                                setClinical((c) => ({
                                  ...c,
                                  cervicalCancerTreatment: fromSelect(v),
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 bg-background text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                                <SelectItem value="referred-for-treatment">
                                  Referred for treatment
                                </SelectItem>
                                <SelectItem value="not-referred">Not referred</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}

                    {clinical.cancerScreening === "prostate-cancer" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Prostate Screening Status</Label>
                        <Select
                          disabled={!canEditFindings}
                          value={selectVal(clinical.prostateCancerStatus)}
                          onValueChange={(v) =>
                            setClinical((c) => ({
                              ...c,
                              prostateCancerStatus: fromSelect(v),
                            }))
                          }
                        >
                          <SelectTrigger className="h-9 bg-background text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="suspicious">Suspicious</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {section === "specialties" && (
                <div className="space-y-5">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Specialty Examinations
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Physiotherapy, dental, ophthalmology, and orthopedic clinic findings.
                    </p>
                  </div>

                  {(
                    [
                      {
                        label: "Physiotherapy",
                        statusKey: "physioStatus",
                        diagKey: "physioDiagnosis",
                        refKey: "physioReferral",
                      },
                      {
                        label: "Dental",
                        statusKey: "dentalStatus",
                        diagKey: "dentalDiagnosis",
                        refKey: null,
                      },
                      {
                        label: "Ophthalmology",
                        statusKey: "ophthalmologyStatus",
                        diagKey: "ophthalmologyDiagnosis",
                        refKey: "ophthalmologyReferral",
                      },
                      {
                        label: "Orthopedics",
                        statusKey: "orthoStatus",
                        diagKey: "orthoDiagnosis",
                        refKey: "orthoReferral",
                      },
                    ] as const
                  ).map((spec) => {
                    const statusVal = clinical[spec.statusKey];
                    return (
                      <div
                        key={spec.label}
                        className="rounded-md border border-border bg-background/60 p-3.5 space-y-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">{spec.label} Status</Label>
                            <Select
                              disabled={!canEditFindings}
                              value={selectVal(statusVal)}
                              onValueChange={(v) =>
                                setClinical((c) => ({
                                  ...c,
                                  [spec.statusKey]: fromSelect(v),
                                }))
                              }
                            >
                              <SelectTrigger className="h-8 bg-card text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {spec.refKey && statusVal === "abnormal" && (
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">
                                {spec.label} Referral
                              </Label>
                              <Select
                                disabled={!canEditFindings}
                                value={selectVal(clinical[spec.refKey])}
                                onValueChange={(v) =>
                                  setClinical((c) => ({
                                    ...c,
                                    [spec.refKey!]: fromSelect(v),
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 bg-card text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NOT_PERFORMED}>Not recorded</SelectItem>
                                  <SelectItem value="referred">Referred</SelectItem>
                                  <SelectItem value="given-medication">
                                    Given medication
                                  </SelectItem>
                                  <SelectItem value="not-referred">Not referred</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {statusVal === "abnormal" && (
                          <div className="space-y-1">
                            <Label className="text-xs">
                              {spec.label} Findings Notes
                            </Label>
                            <Textarea
                              rows={2}
                              disabled={!canEditFindings}
                              placeholder={`Document ${spec.label.toLowerCase()} findings...`}
                              value={clinical[spec.diagKey]}
                              onChange={(e) =>
                                setClinical((c) => ({
                                  ...c,
                                  [spec.diagKey]: e.target.value,
                                }))
                              }
                              className="bg-card text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {section === "radiology" && (
                <div className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Radiology & Diagnostic Imaging
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Record ECG, Echocardiogram, X-Ray, and Ultrasound results accurately.
                    </p>
                  </div>

                  <div className="space-y-1.5 max-w-xs">
                    <Label className="text-xs">Primary Modality Performed</Label>
                    <Select
                      disabled={!canEditFindings}
                      value={selectVal(clinical.radiologyType)}
                      onValueChange={(v) =>
                        setClinical((c) => ({ ...c, radiologyType: fromSelect(v) }))
                      }
                    >
                      <SelectTrigger className="h-9 bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                        <SelectItem value="ecg">ECG</SelectItem>
                        <SelectItem value="echo">Echocardiogram (Echo)</SelectItem>
                        <SelectItem value="x-ray">X-Ray</SelectItem>
                        <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        { label: "ECG", sKey: "ecgStatus", dKey: "ecgDiagnosis" },
                        { label: "Echocardiogram", sKey: "echoStatus", dKey: "echoDiagnosis" },
                        { label: "X-Ray", sKey: "xrayStatus", dKey: "xrayDiagnosis" },
                        {
                          label: "Ultrasound",
                          sKey: "ultrasoundStatus",
                          dKey: "ultrasoundDiagnosis",
                        },
                      ] as const
                    ).map((mod) => (
                      <div
                        key={mod.label}
                        className="rounded-md border border-border bg-background/60 p-3 space-y-2.5"
                      >
                        <Label className="text-xs font-medium">{mod.label}</Label>
                        <Select
                          disabled={!canEditFindings}
                          value={selectVal(clinical[mod.sKey])}
                          onValueChange={(v) =>
                            setClinical((c) => ({
                              ...c,
                              [mod.sKey]: fromSelect(v),
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 bg-card text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_PERFORMED}>Not performed</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                          </SelectContent>
                        </Select>
                        {clinical[mod.sKey] === "abnormal" && (
                          <Textarea
                            rows={2}
                            disabled={!canEditFindings}
                            placeholder={`Describe abnormal ${mod.label} finding...`}
                            value={clinical[mod.dKey]}
                            onChange={(e) =>
                              setClinical((c) => ({
                                ...c,
                                [mod.dKey]: e.target.value,
                              }))
                            }
                            className="bg-card text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === "doctor" && (
                <div className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Doctor Assessment, Prescription & Finalization
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Screening findings are never auto-converted to diagnoses.
                      Document the clinician&apos;s final assessment and plan below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="doc-comments" className="text-xs font-medium">
                        Doctor&apos;s Clinical Notes & Assessment{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="doc-comments"
                        rows={5}
                        disabled={!canEditDoctor}
                        placeholder="Summarize clinical assessment, working diagnosis, counseling provided, and follow-up recommendations..."
                        value={doctor.doctorsComment}
                        onChange={(e) =>
                          setDoctor((d) => ({ ...d, doctorsComment: e.target.value }))
                        }
                        className="bg-background text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="doc-rx" className="text-xs font-medium">
                        Prescription & Management Plan{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="doc-rx"
                        rows={4}
                        disabled={!canEditDoctor}
                        placeholder="Specify medications, dosage, referral facility, or enter 'None — routine follow-up'..."
                        value={doctor.prescription}
                        onChange={(e) =>
                          setDoctor((d) => ({ ...d, prescription: e.target.value }))
                        }
                        className="bg-background text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar inside Center Pane */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <div className="text-[11px] text-muted-foreground">
                  Draft saves preserve pending status for multi-station camp handoff.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={upsertDiagnosis.isPending || !patientIdValid || !selectedCampId}
                    onClick={() => submitClinicalRecord("pending")}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {upsertDiagnosis.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Pending Draft
                  </Button>
                  {canEditDoctor && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={upsertDiagnosis.isPending || !patientIdValid || !selectedCampId}
                      onClick={() => setConfirmFinalizeOpen(true)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      Finalize Record
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Patient Summary & Clinical Safety Rail */}
            <aside className="space-y-4 self-start">
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Encounter Summary
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Patient ID</dt>
                    <dd className="font-mono font-semibold text-foreground">
                      {patientIdValid ? patientIdentifier : "Incomplete"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Target Camp</dt>
                    <dd className="truncate font-medium text-foreground">
                      {selectedCamp?.name || "Unselected"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Record State</dt>
                    <dd>
                      <StatusBadge
                        tone={
                          existingRecord?.status === "completed"
                            ? "success"
                            : existingRecord
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {existingRecord?.status === "completed"
                          ? "Finalized on file"
                          : existingRecord
                          ? "Pending on file"
                          : "Unsaved draft"}
                      </StatusBadge>
                    </dd>
                  </div>
                </dl>
              </div>

              {clinicalWarnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Clinical Safety Notices
                  </div>
                  <ul className="space-y-1.5 text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                    {clinicalWarnings.map((w, idx) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                  Clinical Documentation Rules
                </div>
                <p>
                  • Blank fields remain recorded as <strong>Not performed</strong> rather than negative.
                </p>
                <p>
                  • Screening values never auto-generate diagnoses or referrals.
                </p>
                <p>
                  • Use <strong>Save Pending Draft</strong> during triage handoff; finalize only after clinician review.
                </p>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="register">
          <DiagnosesRegisterView
            scopedCampId={selectedCampId || undefined}
            onSelectRecord={hydrateFromRecord}
          />
        </TabsContent>
      </Tabs>

      {/* Finalization Confirmation Dialog */}
      <Dialog open={confirmFinalizeOpen} onOpenChange={setConfirmFinalizeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              Finalize Clinical Record?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              You are marking the clinical encounter for{" "}
              <span className="font-mono font-semibold text-foreground">
                {patientIdentifier}
              </span>{" "}
              at{" "}
              <span className="font-medium text-foreground">
                {selectedCamp?.name || "selected camp"}
              </span>{" "}
              as <strong>Completed / Finalized</strong>. Confirm that all vitals,
              findings, doctor notes, and prescriptions have been verified.
            </DialogDescription>
          </DialogHeader>
          {clinicalWarnings.length > 0 && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              {clinicalWarnings.map((w, idx) => (
                <div key={idx}>• {w}</div>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmFinalizeOpen(false)}
              className="h-8 text-xs"
            >
              Review Again
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={upsertDiagnosis.isPending}
              onClick={() => submitClinicalRecord("completed")}
              className="h-8 gap-1.5 text-xs"
            >
              {upsertDiagnosis.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Confirm & Finalize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
