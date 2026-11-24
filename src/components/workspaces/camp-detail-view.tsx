"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Activity,
  ArrowLeft,
  HeartPulse,
  Loader2,
  MapPin,
  Save,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import { MetricCard } from "@/components/platform/metric-card";
import { AnalyticsChart } from "@/components/platform/analytics-chart";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { SectionedForm } from "@/components/platform/record-detail-layout";
import { PatientsRegisterView } from "@/components/workspaces/patients-register-view";
import { DiagnosesRegisterView } from "@/components/workspaces/diagnoses-register-view";
import { AnalyticsWorkspaceView } from "@/components/workspaces/analytics-workspace-view";
import { ReportsWorkspaceView } from "@/components/workspaces/reports-workspace-view";
import {
  useCamp,
  useCampAnalytics,
  useCampStats,
  useDiagnoses,
  useProject,
  useUpdateCamp,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import {
  canAccessClinical,
  canManageCamps,
  canRegisterPatient,
} from "@/lib/permissions";

export function CampDetailView({
  projectId,
  campId,
}: {
  projectId: string;
  campId: string;
}) {
  const { data: session } = useSession();

  const projectQuery = useProject(projectId !== "all" ? projectId : undefined);
  const campQuery = useCamp(campId !== "all" ? campId : undefined);
  const statsQuery = useCampStats({ projectId, campId });
  const analyticsQuery = useCampAnalytics({ projectId, campId });
  const diagnosesQuery = useDiagnoses({ projectId, campId, page: 1, limit: 100 });
  const updateCamp = useUpdateCamp(campId);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    const c = campQuery.data;
    if (!c) return;
    setEditName(c.name || "");
    setEditDescription(c.description || "");
    setEditActive(c.active !== false);
  }, [campQuery.data]);

  const canRegister = canRegisterPatient(session as any);
  const canScreen = canAccessClinical(session as any);
  const canEditCamp = canManageCamps(session as any);

  const pendingCount = useMemo(() => {
    return (diagnosesQuery.data?.items ?? []).filter(
      (d) => d.status === "pending"
    ).length;
  }, [diagnosesQuery.data?.items]);

  const dailyTrend = useMemo(() => {
    return (analyticsQuery.data?.newPatientsOverTime ?? []).map((item) => ({
      name: (() => {
        try {
          return format(new Date(item.date), "MMM d");
        } catch {
          return item.date;
        }
      })(),
      value: item.count,
    }));
  }, [analyticsQuery.data?.newPatientsOverTime]);

  if (campId !== "all" && campQuery.isLoading) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (campId !== "all" && campQuery.isError) {
    return (
      <ErrorState
        title="Unable to load camp details"
        description={getErrorMessage(campQuery.error)}
        onRetry={() => campQuery.refetch()}
      />
    );
  }

  const camp = campQuery.data;
  const campTitle = camp?.name || (campId === "all" ? "All Camps" : "Health Camp");
  const projectName = projectQuery.data?.name || "Health Project";

  const registered = statsQuery.data?.attended ?? 0;
  const screened = analyticsQuery.data?.attended ?? 0;
  const referralsCount =
    (analyticsQuery.data?.physioAbnormal ?? 0) +
    (analyticsQuery.data?.dentalAbnormal ?? 0) +
    (analyticsQuery.data?.ophthalmologyAbnormal ?? 0) +
    (analyticsQuery.data?.orthoAbnormal ?? 0);

  const handleSaveCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Camp name is required.");
      return;
    }
    try {
      await updateCamp.mutateAsync({
        name: editName.trim(),
        description: editDescription.trim(),
        active: editActive,
      });
      toast.success("Camp updated successfully");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update camp"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={campTitle}
        description={
          camp?.description || `Field outreach operations under ${projectName}.`
        }
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Projects", href: "/projects" },
          ...(projectId !== "all"
            ? [{ label: projectName, href: `/projects/${projectId}` }]
            : []),
          { label: campTitle },
        ]}
        badge={
          <StatusBadge tone={camp?.active !== false ? "success" : "neutral"}>
            {camp?.active !== false ? "Active Camp" : "Inactive"}
          </StatusBadge>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={projectId !== "all" ? `/projects/${projectId}` : "/camps"}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>
            </Button>
            {canRegister && campId !== "all" && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href={`/patients/new?campId=${encodeURIComponent(campId)}`}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Register Patient
                </Link>
              </Button>
            )}
            {canScreen && campId !== "all" && (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Link href={`/clinical?campId=${encodeURIComponent(campId)}`}>
                  <Stethoscope className="h-3.5 w-3.5" />
                  Clinical Screening
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9 flex-wrap bg-muted/60 p-0.5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="participants" className="text-xs">Participants</TabsTrigger>
          <TabsTrigger value="screenings" className="text-xs">Screenings & Diagnoses</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          {canEditCamp && campId !== "all" && (
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Registered Participants"
              value={registered}
              sublabel={`${statsQuery.data?.newPatientsToday ?? 0} registered today`}
              icon={Users}
            />
            <MetricCard
              label="Screened Count"
              value={screened}
              sublabel={
                registered > 0
                  ? `${Math.min(100, Math.round((screened / registered) * 100))}% of registered`
                  : "No registrations yet"
              }
              denominator={`n = ${registered}`}
              icon={Activity}
            />
            <MetricCard
              label="Pending Screenings"
              value={pendingCount}
              sublabel="Awaiting doctor finalization"
              icon={Stethoscope}
            />
            <MetricCard
              label="Specialty Referrals Flagged"
              value={referralsCount}
              sublabel="Physio, dental, eye & ortho"
              icon={HeartPulse}
            />
          </div>

          <AnalyticsChart
            title="Daily Camp Attendance & Screening Trend"
            description="Number of clinical encounters recorded per day in this camp."
            type="line"
            data={dailyTrend}
            valueLabel="Encounters"
            denominator={`n = ${screened}`}
            sampleSize={screened}
          />
        </TabsContent>

        <TabsContent value="participants">
          <PatientsRegisterView
            scopedProjectId={projectId}
            scopedCampId={campId}
            embedded
          />
        </TabsContent>

        <TabsContent value="screenings">
          <DiagnosesRegisterView
            scopedProjectId={projectId}
            scopedCampId={campId}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsWorkspaceView
            scopedProjectId={projectId}
            scopedCampId={campId}
            embedded
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsWorkspaceView
            scopedProjectId={projectId}
            scopedCampId={campId}
            embedded
          />
        </TabsContent>

        {canEditCamp && campId !== "all" && (
          <TabsContent value="settings">
            <SectionedForm
              title="Camp Settings"
              description="Update camp metadata via PUT /api/camps/:id."
            >
              <form onSubmit={handleSaveCamp} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label className="text-xs">Camp Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 bg-background text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location & Operational Description</Label>
                  <Textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-foreground">
                      Camp Active
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Inactive camps remain archived for read-only reporting.
                    </div>
                  </div>
                  <Switch checked={editActive} onCheckedChange={setEditActive} />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateCamp.isPending}
                  className="h-8 gap-1.5 text-xs"
                >
                  {updateCamp.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Camp Settings
                </Button>
              </form>
            </SectionedForm>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
