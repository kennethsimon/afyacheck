"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Stethoscope,
  UserPlus,
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
import { PageHeader } from "@/components/platform/page-header";
import {
  SectionedForm,
  StickyFormActions,
} from "@/components/platform/record-detail-layout";
import { ErrorState, StatusBadge } from "@/components/platform/states";
import { PatientInfoSchema } from "@/types/schemas";
import { regionsData } from "@/data/data";
import { useCamps, useCreatePatient, usePatients, useProjects } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { canRegisterPatient } from "@/lib/permissions";
import { calculateAge } from "@/lib/utils";
import type { PatientRecord } from "@/lib/api/types";

type RegistrationValues = z.infer<typeof PatientInfoSchema>;

export function PatientRegistrationView({
  defaultCampId,
}: {
  defaultCampId?: string;
}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { projectId: workspaceProjectId, campId: workspaceCampId } = useWorkspace();

  const initialCamp =
    defaultCampId ||
    searchParams?.get("campId") ||
    (workspaceCampId !== "all" ? workspaceCampId : "");

  const [selectedCampId, setSelectedCampId] = useState<string>(initialCamp);
  const [createdPatient, setCreatedPatient] = useState<PatientRecord | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const projectsQuery = useProjects();
  const campsQuery = useCamps("all");
  const createPatient = useCreatePatient();

  const canRegister = canRegisterPatient(session as any);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(PatientInfoSchema),
    defaultValues: {
      name: "",
      gender: "female",
      dateOfBirth: "",
      phoneNumber: "",
      region: "",
      district: "",
      insurance: "",
      address: "",
    },
  });

  const watchedName = watch("name");
  const watchedPhone = watch("phoneNumber");
  const watchedDob = watch("dateOfBirth");
  const watchedRegion = watch("region");
  const watchedDistrict = watch("district");
  const watchedGender = watch("gender");

  // Duplicate safeguard: query existing patients in the selected camp matching name
  const duplicateCheckQuery = usePatients(
    {
      projectId: "all",
      campId: selectedCampId || "all",
      name: watchedName?.trim().length >= 3 ? watchedName.trim() : undefined,
      page: 1,
      limit: 5,
    },
    Boolean(selectedCampId && watchedName?.trim().length >= 3)
  );

  const potentialDuplicates = useMemo(() => {
    const items = duplicateCheckQuery.data?.items ?? [];
    return items.filter(
      (p) =>
        p.name?.toLowerCase() === watchedName?.trim().toLowerCase() ||
        (watchedPhone?.trim() && p.phoneNumber === watchedPhone.trim())
    );
  }, [duplicateCheckQuery.data?.items, watchedName, watchedPhone]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const districts = useMemo(() => {
    const found = regionsData.find((r) => r.name === watchedRegion);
    return found?.districts ?? [];
  }, [watchedRegion]);

  const camps = useMemo(() => campsQuery.data?.camps ?? [], [campsQuery.data?.camps]);
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects]
  );

  const selectedCamp = camps.find((c) => c._id === selectedCampId);
  const selectedCampProjectName = useMemo(() => {
    if (!selectedCamp) return null;
    if (typeof selectedCamp.project === "object" && selectedCamp.project?.name) {
      return selectedCamp.project.name;
    }
    if (selectedCamp.projectDetails?.[0]?.name) {
      return selectedCamp.projectDetails[0].name;
    }
    const pid =
      typeof selectedCamp.project === "string"
        ? selectedCamp.project
        : workspaceProjectId;
    return projects.find((p) => p._id === pid)?.name ?? null;
  }, [selectedCamp, projects, workspaceProjectId]);

  const computedAge = useMemo(() => {
    if (!watchedDob) return null;
    const age = calculateAge(watchedDob);
    return Number.isNaN(age) || age < 0 ? null : age;
  }, [watchedDob]);

  if (!canRegister) {
    return (
      <ErrorState
        isPermissionError
        title="Patient registration restricted"
        description="Your account does not hold the 'Edit patient info step' permission required to register patients."
      />
    );
  }

  const onSubmit = async (values: RegistrationValues) => {
    if (!selectedCampId) {
      toast.error("Select a target health camp before registering a patient.");
      return;
    }
    if (potentialDuplicates.length > 0 && !confirmDuplicate) {
      toast.warning(
        "A patient with a matching name or phone number exists in this camp. Confirm duplicate override to proceed."
      );
      return;
    }

    const userId = (session?.user as any)?._id;
    if (!userId) {
      toast.error("Active staff session required to register a patient.");
      return;
    }

    try {
      const created = await createPatient.mutateAsync({
        name: values.name,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
        region: values.region,
        district: values.district,
        address: values.address,
        insurance: values.insurance || undefined,
        camp: selectedCampId,
        createdBy: userId,
      });

      toast.success("Patient registered successfully");
      setCreatedPatient(created);
      setConfirmDuplicate(false);
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to register patient"));
    }
  };

  if (createdPatient) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-6">
        <div className="rounded-lg border border-emerald-500/30 bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Patient Registered Successfully
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Record saved to {selectedCamp?.name || "selected camp"}. Provide
                the generated Patient Identifier below to the clinical screening
                station.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Generated Patient Identifier
              </div>
              <div className="mt-1 font-mono text-2xl font-bold tracking-wider text-primary">
                {createdPatient.patientIdentifier || "Assigned"}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-medium text-foreground">{createdPatient.name}</div>
              <div className="capitalize text-muted-foreground">
                {createdPatient.gender}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setCreatedPatient(null)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Register Next Patient
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link href={`/patients/${createdPatient._id}`}>View Profile</Link>
            </Button>
            {createdPatient.patientIdentifier && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link
                  href={`/clinical?patientIdentifier=${encodeURIComponent(
                    createdPatient.patientIdentifier
                  )}&campId=${encodeURIComponent(selectedCampId)}`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  Proceed to Clinical Screening
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PageHeader
        title="Register Patient"
        description="Structured intake registration. Patient Identifier (AC...) is generated automatically on save."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Patients", href: "/patients" },
          { label: "Register Patient" },
        ]}
        badge={
          selectedCamp ? (
            <StatusBadge tone="info">
              Camp: {selectedCamp.name}
            </StatusBadge>
          ) : (
            <StatusBadge tone="warning">No camp selected</StatusBadge>
          )
        }
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/patients">
              <ArrowLeft className="h-3.5 w-3.5" />
              Patient Register
            </Link>
          </Button>
        }
      />

      {/* Camp Safety Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-xs ${
          selectedCamp
            ? "border-primary/30 bg-accent/40"
            : "border-amber-500/40 bg-amber-500/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-foreground">
              {selectedCamp
                ? `Target Camp: ${selectedCamp.name}`
                : "Select a Health Camp before entering patient data"}
            </span>
            {selectedCampProjectName && (
              <span className="ml-2 text-muted-foreground">
                ({selectedCampProjectName})
              </span>
            )}
          </div>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedCampId} onValueChange={setSelectedCampId}>
            <SelectTrigger className="h-8 bg-background text-xs">
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
      </div>

      {/* Duplicate Safeguard Alert */}
      {potentialDuplicates.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Potential duplicate patient detected in this camp
          </div>
          <p className="text-muted-foreground">
            The following existing record(s) match the name or phone number you entered:
          </p>
          <ul className="space-y-1">
            {potentialDuplicates.map((dup) => (
              <li
                key={dup._id}
                className="flex items-center justify-between rounded bg-background/80 px-3 py-1.5"
              >
                <span>
                  <span className="font-mono font-medium">{dup.patientIdentifier}</span>{" "}
                  — {dup.name} ({dup.phoneNumber})
                </span>
                <Link
                  href={`/patients/${dup._id}`}
                  className="font-medium text-primary hover:underline"
                >
                  Open record
                </Link>
              </li>
            ))}
          </ul>
          <label className="flex items-center gap-2 pt-1 font-medium text-foreground">
            <input
              type="checkbox"
              checked={confirmDuplicate}
              onChange={(e) => setConfirmDuplicate(e.target.checked)}
              className="rounded border-border"
            />
            I have verified this is a distinct patient and want to create a new record.
          </label>
        </div>
      )}

      {/* 1. Personal Information */}
      <SectionedForm
        title="1. Personal Information"
        description="Required patient demographics."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name" className="text-xs font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter patient's full legal name"
              {...register("name")}
              className="h-9 bg-background text-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedGender}
              onValueChange={(v: any) =>
                setValue("gender", v, { shouldDirty: true, shouldValidate: true })
              }
            >
              <SelectTrigger className="h-9 bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth" className="text-xs font-medium">
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={format(new Date(), "yyyy-MM-dd")}
              {...register("dateOfBirth")}
              className="h-9 bg-background text-sm"
            />
            {computedAge !== null && (
              <p className="text-[11px] text-muted-foreground">
                Calculated age: <strong className="tabular-nums">{computedAge} years</strong>
              </p>
            )}
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="phoneNumber" className="text-xs font-medium">
              Contact Telephone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g., +255 7XX XXX XXX"
              {...register("phoneNumber")}
              className="h-9 bg-background text-sm"
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>
      </SectionedForm>

      {/* 2. Location & Residence */}
      <SectionedForm
        title="2. Location & Residence"
        description="Administrative region, district, and residential address."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Region <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedRegion}
              onValueChange={(val) => {
                setValue("region", val, { shouldDirty: true, shouldValidate: true });
                setValue("district", "", { shouldDirty: true });
              }}
            >
              <SelectTrigger className="h-9 bg-background text-sm">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regionsData.map((r) => (
                  <SelectItem key={r.name} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && (
              <p className="text-xs text-destructive">{errors.region.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              District <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedDistrict}
              disabled={!watchedRegion}
              onValueChange={(val) =>
                setValue("district", val, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-9 bg-background text-sm">
                <SelectValue
                  placeholder={watchedRegion ? "Select district" : "Select region first"}
                />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.name} value={d.name.trim()}>
                    {d.name.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.district && (
              <p className="text-xs text-destructive">{errors.district.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="insurance" className="text-xs font-medium">
              Insurance / Bima <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="insurance"
              placeholder="e.g., NHIF, CHF, Private"
              {...register("insurance")}
              className="h-9 bg-background text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="address" className="text-xs font-medium">
              Street / Ward / Village Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Ward, street, or nearest landmark"
              {...register("address")}
              className="h-9 bg-background text-sm"
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>
        </div>
      </SectionedForm>

      <StickyFormActions
        helperText={
          selectedCamp
            ? `Submitting to camp: ${selectedCamp.name}`
            : "Select a camp above before saving."
        }
      >
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/patients">Cancel</Link>
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || createPatient.isPending || !selectedCampId}
          className="h-8 gap-1.5 text-xs"
        >
          {(isSubmitting || createPatient.isPending) && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          Register Patient
        </Button>
      </StickyFormActions>
    </form>
  );
}
