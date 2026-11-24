"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Activity,
  ArrowLeft,
  Edit3,
  FileText,
  Loader2,
  MapPin,
  Save,
  Stethoscope,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import {
  KeyValueGrid,
  RecordDetailLayout,
  SectionedForm,
} from "@/components/platform/record-detail-layout";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import {
  useCamp,
  useDiagnoses,
  usePatient,
  useUpdatePatient,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { generatePatientClinicalReport } from "@/lib/api/endpoints";
import { downloadPatientClinicalReportPdf } from "@/lib/reports/pdf-renderer";
import { canAccessClinical, canRegisterPatient } from "@/lib/permissions";
import { calculateAge } from "@/lib/utils";
import type { DiagnosisRecord } from "@/lib/api/types";

function formatClinicalValue(val: unknown): string {
  if (val === null || val === undefined || val === "") return "Not performed";
  return String(val)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusToneForFinding(val?: string | null) {
  if (!val) return "neutral" as const;
  const lower = val.toLowerCase();
  if (["normal", "negative", "no", "not-referred"].includes(lower)) return "success" as const;
  if (["suspicious", "pending", "linked-to-care"].includes(lower)) return "warning" as const;
  if (["abnormal", "positive", "high", "low", "referred", "knowncase", "known-case"].includes(lower)) {
    return "critical" as const;
  }
  return "info" as const;
}

export function PatientProfileView({ patientId }: { patientId: string }) {
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [exportingClinicalPdf, setExportingClinicalPdf] = useState(false);

  const handleExportClinicalReport = async () => {
    setExportingClinicalPdf(true);
    try {
      const payload = await generatePatientClinicalReport(patientId);
      await downloadPatientClinicalReportPdf(payload);
      toast.success("Authorized patient clinical summary downloaded");
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Unable to export authorized clinical report")
      );
    } finally {
      setExportingClinicalPdf(false);
    }
  };

  const patientQuery = usePatient(patientId);
  const updatePatient = useUpdatePatient(patientId);

  const patient = patientQuery.data;
  const campId =
    patient && typeof patient.camp === "string"
      ? patient.camp
      : patient && typeof patient.camp === "object"
      ? patient.camp?._id
      : undefined;

  const campQuery = useCamp(campId);
  const diagnosesQuery = useDiagnoses(
    {
      projectId: "all",
      campId: campId || "all",
      page: 1,
      limit: 200,
    },
    Boolean(patient)
  );

  const [editDraft, setEditDraft] = useState({
    name: "",
    gender: "female" as "male" | "female" | "others",
    dateOfBirth: "",
    phoneNumber: "",
    location: "",
    address: "",
    insurance: "",
  });

  const startEditing = () => {
    if (!patient) return;
    setEditDraft({
      name: patient.name || "",
      gender: patient.gender || "female",
      dateOfBirth: patient.dateOfBirth
        ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd")
        : "",
      phoneNumber: patient.phoneNumber || "",
      location:
        patient.location ||
        [patient.region, patient.district].filter(Boolean).join(", "),
      address: patient.address || "",
      insurance: patient.insurance || "",
    });
    setEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePatient.mutateAsync(editDraft);
      toast.success("Patient demographics updated");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update patient record"));
    }
  };

  const patientDiagnoses: DiagnosisRecord[] = useMemo(() => {
    if (!patient?.patientIdentifier) return [];
    return (diagnosesQuery.data?.items ?? []).filter(
      (d) => d.patientIdentifier === patient.patientIdentifier
    );
  }, [diagnosesQuery.data?.items, patient?.patientIdentifier]);

  const latestDiagnosis = patientDiagnoses[0];

  const canEdit = canRegisterPatient(session as any);
  const canScreen = canAccessClinical(session as any);

  if (patientQuery.isLoading) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (patientQuery.isError) {
    return (
      <ErrorState
        title="Unable to load patient record"
        description={getErrorMessage(patientQuery.error)}
        onRetry={() => patientQuery.refetch()}
      />
    );
  }

  if (!patient) {
    return (
      <EmptyState
        title="Patient record not found"
        description="This record may not exist or you may lack access to its assigned camp."
        action={
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/patients">Return to Patient Register</Link>
          </Button>
        }
      />
    );
  }

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null;
  const campName =
    campQuery.data?.name ||
    (typeof patient.camp === "object" ? patient.camp?.name : undefined) ||
    "Assigned Camp";

  const screeningData = latestDiagnosis?.screening || patient.screening;
  const clinicalData = latestDiagnosis?.clinicalFindings || patient.clinicalFindings;

  const clinicalUrl = `/clinical?patientIdentifier=${encodeURIComponent(
    patient.patientIdentifier || ""
  )}&campId=${encodeURIComponent(campId || "")}`;

  return (
    <RecordDetailLayout
      header={
        <PageHeader
          title={patient.name}
          description={`Patient ID ${patient.patientIdentifier || "Pending"} • Registered at ${campName}`}
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Patients", href: "/patients" },
            { label: patient.patientIdentifier || "Profile" },
          ]}
          badge={
            <StatusBadge
              tone={
                latestDiagnosis?.status === "completed"
                  ? "success"
                  : latestDiagnosis
                  ? "warning"
                  : "neutral"
              }
            >
              {latestDiagnosis?.status === "completed"
                ? "Screening Finalized"
                : latestDiagnosis
                ? "Screening Pending"
                : "Not Screened"}
            </StatusBadge>
          }
          actions={
            <>
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Link href="/patients">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Register
                </Link>
              </Button>
              {canEdit && !editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Demographics
                </Button>
              )}
              {canScreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportClinicalReport}
                  disabled={exportingClinicalPdf}
                  className="h-8 gap-1.5 text-xs"
                >
                  {exportingClinicalPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  Clinical Report PDF
                </Button>
              )}
              {canScreen && patient.patientIdentifier && (
                <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                  <Link href={clinicalUrl}>
                    <Stethoscope className="h-3.5 w-3.5" />
                    Clinical Screening
                  </Link>
                </Button>
              )}
            </>
          }
        />
      }
      sidebar={
        <>
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Patient Summary
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Patient ID</dt>
                <dd className="font-mono font-medium text-foreground">
                  {patient.patientIdentifier || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Age / Gender</dt>
                <dd className="capitalize font-medium text-foreground">
                  {age !== null ? `${age} yrs` : "—"} • {patient.gender}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Camp</dt>
                <dd className="flex items-center gap-1 font-medium text-foreground">
                  <MapPin className="h-3 w-3 text-primary" />
                  {campName}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Insurance</dt>
                <dd className="font-medium text-foreground">
                  {patient.insurance || "None recorded"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Encounters</dt>
                <dd className="tabular-nums font-medium text-foreground">
                  {patientDiagnoses.length}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Registered</dt>
                <dd className="tabular-nums text-foreground">
                  {patient.createdAt
                    ? format(new Date(patient.createdAt), "MMM d, yyyy")
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {screeningData && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Latest Vitals
                </h3>
                <Activity className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">Height</div>
                  <div className="mt-0.5 tabular-nums font-semibold">
                    {screeningData.height ? `${screeningData.height} cm` : "—"}
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">Weight</div>
                  <div className="mt-0.5 tabular-nums font-semibold">
                    {screeningData.weight ? `${screeningData.weight} kg` : "—"}
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">BMI</div>
                  <div className="mt-0.5 tabular-nums font-semibold">
                    {screeningData.bmi ? `${screeningData.bmi} kg/m²` : "—"}
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">Blood Pressure</div>
                  <div className="mt-0.5 capitalize font-semibold">
                    {screeningData.bloodPressure || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      }
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 bg-muted/60 p-0.5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="demographics" className="text-xs">Demographics</TabsTrigger>
          <TabsTrigger value="screening" className="text-xs">Screening History</TabsTrigger>
          <TabsTrigger value="clinical" className="text-xs">Clinical Findings</TabsTrigger>
          <TabsTrigger value="diagnoses" className="text-xs">Diagnoses & Notes</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SectionedForm
            title="Demographics & Contact"
            description="Verified patient identity and camp registration metadata."
          >
            <KeyValueGrid
              columns={3}
              items={[
                { label: "Full Name", value: patient.name },
                {
                  label: "Patient Identifier",
                  value: (
                    <span className="font-mono">
                      {patient.patientIdentifier || "Pending"}
                    </span>
                  ),
                },
                { label: "Gender", value: <span className="capitalize">{patient.gender}</span> },
                {
                  label: "Date of Birth",
                  value: patient.dateOfBirth
                    ? `${format(new Date(patient.dateOfBirth), "MMM d, yyyy")} (${age} yrs)`
                    : "Not recorded",
                },
                { label: "Phone Number", value: patient.phoneNumber },
                { label: "Insurance", value: patient.insurance || "None" },
                {
                  label: "Region / District",
                  value:
                    [patient.region, patient.district].filter(Boolean).join(", ") ||
                    patient.location ||
                    "Not recorded",
                },
                { label: "Address", value: patient.address },
                { label: "Assigned Camp", value: campName },
              ]}
            />
          </SectionedForm>

          <SectionedForm
            title="Recent Clinical Encounters"
            description="Chronological screening and diagnosis records linked to this patient identifier."
          >
            {patientDiagnoses.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No clinical encounters recorded"
                description="Start a clinical screening session to capture vitals, TB/HIV/cancer assessments, and doctor comments."
                action={
                  canScreen && patient.patientIdentifier ? (
                    <Button asChild size="sm" className="h-8 text-xs">
                      <Link href={clinicalUrl}>Start Screening</Link>
                    </Button>
                  ) : undefined
                }
                className="py-8"
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border">
                {patientDiagnoses.map((enc) => (
                  <div
                    key={enc._id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        Encounter on{" "}
                        {enc.createdAt
                          ? format(new Date(enc.createdAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {enc.doctorComments?.doctorsComment
                          ? enc.doctorComments.doctorsComment
                          : "Screening / clinical findings logged — awaiting final doctor comments"}
                      </div>
                    </div>
                    <StatusBadge
                      tone={enc.status === "completed" ? "success" : "warning"}
                    >
                      {enc.status === "completed" ? "Finalized" : "Pending"}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </SectionedForm>
        </TabsContent>

        <TabsContent value="demographics">
          <SectionedForm
            title={editing ? "Edit Patient Demographics" : "Demographics & Registration"}
            description="Updates are validated against backend field contracts."
          >
            {editing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      value={editDraft.name}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender</Label>
                    <Select
                      value={editDraft.gender}
                      onValueChange={(v: any) =>
                        setEditDraft((d) => ({ ...d, gender: v }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date of Birth</Label>
                    <Input
                      type="date"
                      value={editDraft.dateOfBirth}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, dateOfBirth: e.target.value }))
                      }
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      value={editDraft.phoneNumber}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, phoneNumber: e.target.value }))
                      }
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location (Region, District)</Label>
                    <Input
                      value={editDraft.location}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, location: e.target.value }))
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Insurance / Bima</Label>
                    <Input
                      value={editDraft.insurance}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, insurance: e.target.value }))
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Residential Address</Label>
                    <Input
                      value={editDraft.address}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, address: e.target.value }))
                      }
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="h-8 gap-1 text-xs"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updatePatient.isPending}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {updatePatient.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <KeyValueGrid
                columns={2}
                items={[
                  { label: "Full Name", value: patient.name },
                  { label: "Phone Number", value: patient.phoneNumber },
                  { label: "Gender", value: <span className="capitalize">{patient.gender}</span> },
                  {
                    label: "Date of Birth",
                    value: patient.dateOfBirth
                      ? format(new Date(patient.dateOfBirth), "MMMM d, yyyy")
                      : "Not recorded",
                  },
                  { label: "Region", value: patient.region || "Not recorded" },
                  { label: "District", value: patient.district || "Not recorded" },
                  { label: "Location", value: patient.location || "Not recorded" },
                  { label: "Address", value: patient.address },
                  { label: "Insurance", value: patient.insurance || "None" },
                ]}
              />
            )}
          </SectionedForm>
        </TabsContent>

        <TabsContent value="screening">
          <SectionedForm
            title="Vital Signs & Intake Screening"
            description="Recorded measurements and health history responses."
          >
            {!screeningData ? (
              <EmptyState
                title="No screening vitals recorded"
                description="Use the Clinical Screening workspace to record height, weight, BMI, blood pressure, hemoglobin, and history."
              />
            ) : (
              <KeyValueGrid
                columns={3}
                items={[
                  {
                    label: "Height",
                    value: screeningData.height ? `${screeningData.height} cm` : "Not performed",
                  },
                  {
                    label: "Weight",
                    value: screeningData.weight ? `${screeningData.weight} kg` : "Not performed",
                  },
                  {
                    label: "BMI",
                    value: screeningData.bmi ? `${screeningData.bmi} kg/m²` : "Not calculated",
                  },
                  {
                    label: "Blood Pressure",
                    value: (
                      <StatusBadge tone={statusToneForFinding(screeningData.bloodPressure)}>
                        {formatClinicalValue(screeningData.bloodPressure)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Hemoglobin (Hb)",
                    value: (
                      <StatusBadge tone={statusToneForFinding(screeningData.hb)}>
                        {formatClinicalValue(screeningData.hb)}
                      </StatusBadge>
                    ),
                  },
                  { label: "Current Illness", value: formatClinicalValue(screeningData.illness) },
                  { label: "Medication", value: formatClinicalValue(screeningData.medication) },
                  {
                    label: "Alcohol / Smoking",
                    value: formatClinicalValue(screeningData.alcoholOrSmokeUsage),
                  },
                  {
                    label: "Chronic Diseases",
                    value: formatClinicalValue(screeningData.chronicDiseases),
                  },
                  {
                    label: "Vaccination History",
                    value: formatClinicalValue(screeningData.vaccinationHistory),
                  },
                ]}
              />
            )}
          </SectionedForm>
        </TabsContent>

        <TabsContent value="clinical">
          <SectionedForm
            title="Clinical Findings & Specialty Assessments"
            description="Structured screening outputs — screening results do not constitute automated diagnoses."
          >
            {!clinicalData ? (
              <EmptyState
                title="No clinical findings recorded"
                description="No infectious disease, cancer, radiology, or specialty findings have been submitted for this patient."
              />
            ) : (
              <KeyValueGrid
                columns={3}
                items={[
                  {
                    label: "TB Screening",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.tbScreening?.status)}>
                        {formatClinicalValue(clinicalData.tbScreening?.status)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "HIV Testing",
                    value: formatClinicalValue(clinicalData.hivTesting),
                  },
                  {
                    label: "HIV Result",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.hivResult)}>
                        {formatClinicalValue(clinicalData.hivResult)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Cancer Screening",
                    value: formatClinicalValue(clinicalData.cancerScreening),
                  },
                  {
                    label: "Preventive Measure",
                    value: formatClinicalValue(clinicalData.preventiveMeasure),
                  },
                  {
                    label: "Blood Donation",
                    value: formatClinicalValue(clinicalData.bloodDonation),
                  },
                  {
                    label: "Physiotherapy",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.physioStatus)}>
                        {formatClinicalValue(clinicalData.physioStatus)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Dental",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.dentalStatus)}>
                        {formatClinicalValue(clinicalData.dentalStatus)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Ophthalmology",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.ophthalmologyStatus)}>
                        {formatClinicalValue(clinicalData.ophthalmologyStatus)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Orthopedics",
                    value: (
                      <StatusBadge tone={statusToneForFinding(clinicalData.orthoStatus)}>
                        {formatClinicalValue(clinicalData.orthoStatus)}
                      </StatusBadge>
                    ),
                  },
                  {
                    label: "Radiology Type",
                    value: formatClinicalValue(clinicalData.radiologyType),
                  },
                  {
                    label: "ECG / Echo / X-Ray / US",
                    value: [
                      clinicalData.ecgStatus && `ECG: ${clinicalData.ecgStatus}`,
                      clinicalData.echoStatus && `Echo: ${clinicalData.echoStatus}`,
                      clinicalData.xrayStatus && `X-Ray: ${clinicalData.xrayStatus}`,
                      clinicalData.ultrasoundStatus && `US: ${clinicalData.ultrasoundStatus}`,
                    ]
                      .filter(Boolean)
                      .join(" • ") || "Not performed",
                  },
                ]}
              />
            )}
          </SectionedForm>
        </TabsContent>

        <TabsContent value="diagnoses">
          <SectionedForm
            title="Doctor Comments, Diagnoses & Prescriptions"
            description="Clinician-authored notes and prescriptions."
          >
            {patientDiagnoses.filter((d) => d.doctorComments?.doctorsComment).length === 0 ? (
              <EmptyState
                title="No finalized doctor notes"
                description="Doctor comments and prescriptions appear here once finalized in the Clinical Screening workspace."
              />
            ) : (
              <div className="space-y-3">
                {patientDiagnoses
                  .filter((d) => d.doctorComments?.doctorsComment || d.doctorComments?.prescription)
                  .map((d) => (
                    <div
                      key={d._id}
                      className="rounded-md border border-border bg-background p-4 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {d.createdAt
                            ? format(new Date(d.createdAt), "MMMM d, yyyy HH:mm")
                            : "Recorded encounter"}
                        </span>
                        <StatusBadge
                          tone={d.status === "completed" ? "success" : "warning"}
                        >
                          {d.status === "completed" ? "Finalized" : "Draft / Pending"}
                        </StatusBadge>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground">
                          Clinical Notes / Diagnosis
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-foreground">
                          {d.doctorComments?.doctorsComment || "—"}
                        </p>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground">
                          Prescription & Plan
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-foreground">
                          {d.doctorComments?.prescription || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </SectionedForm>
        </TabsContent>

        <TabsContent value="documents">
          <SectionedForm
            title="Clinical Documents"
            description="Attachments linked to this patient profile."
          >
            <EmptyState
              icon={FileText}
              title="Document storage pending backend activation"
              description="The backend `/api/documents/upload` endpoint is currently disabled in `atosclone`. Once enabled, lab reports and referral letters will attach here."
            />
          </SectionedForm>
        </TabsContent>
      </Tabs>
    </RecordDetailLayout>
  );
}
