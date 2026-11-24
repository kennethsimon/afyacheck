"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Activity,
  ArrowRight,
  BarChart3,
  FolderKanban,
  HeartPulse,
  MapPin,
  Plus,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/platform/page-header";
import { MetricCard } from "@/components/platform/metric-card";
import { AnalyticsChart } from "@/components/platform/analytics-chart";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import {
  useCampAnalytics,
  useCamps,
  useCampStats,
  useDiagnoses,
  useProjects,
} from "@/lib/api/hooks";
import { useWorkspace } from "@/lib/workspace-context";
import {
  canAccessClinical,
  canManageProjects,
  canRegisterPatient,
} from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/client";

export default function OverviewPage() {
  const { data: session } = useSession();
  const { projectId, campId, setContext } = useWorkspace();

  const projectsQuery = useProjects();
  const campsQuery = useCamps(projectId);
  const statsQuery = useCampStats({ projectId, campId });
  const analyticsQuery = useCampAnalytics({ projectId, campId });
  const diagnosesQuery = useDiagnoses({ projectId, campId, page: 1, limit: 6 });

  const projects = projectsQuery.data?.projects ?? [];
  const camps = campsQuery.data?.camps ?? [];
  const stats = statsQuery.data;
  const analytics = analyticsQuery.data;
  const recentDiagnoses = diagnosesQuery.data?.items ?? [];

  const activeProject = projects.find((p) => p._id === projectId);
  const activeCamp = camps.find((c) => c._id === campId);

  const scopeLabel = activeCamp
    ? `${activeProject?.name ?? "Project"} / ${activeCamp.name}`
    : activeProject
    ? activeProject.name
    : "All Projects & Camps";

  const trendData = useMemo(() => {
    const raw = analytics?.newPatientsOverTime ?? [];
    return raw.slice(-14).map((item) => ({
      name: (() => {
        try {
          return format(new Date(item.date), "MMM d");
        } catch {
          return item.date;
        }
      })(),
      value: item.count,
    }));
  }, [analytics?.newPatientsOverTime]);

  const genderBreakdown = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Female", value: stats.female || 0 },
      { name: "Male", value: stats.male || 0 },
      { name: "Others", value: stats.others || 0 },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const screeningRate = useMemo(() => {
    const registered = stats?.attended ?? 0;
    const screened = analytics?.attended ?? 0;
    if (registered <= 0) return "0%";
    return `${Math.min(100, Math.round((screened / registered) * 100))}%`;
  }, [stats?.attended, analytics?.attended]);

  const totalReferralsOrAbnormal = useMemo(() => {
    if (!analytics) return 0;
    return (
      (analytics.physioAbnormal || 0) +
      (analytics.dentalAbnormal || 0) +
      (analytics.ophthalmologyAbnormal || 0) +
      (analytics.orthoAbnormal || 0) +
      (analytics.ecgAbnormal || 0) +
      (analytics.echoAbnormal || 0) +
      (analytics.xrayAbnormal || 0) +
      (analytics.ultrasoundAbnormal || 0)
    );
  }, [analytics]);

  const isLoading =
    projectsQuery.isLoading || campsQuery.isLoading || statsQuery.isLoading;

  const hasError = projectsQuery.isError && statsQuery.isError;

  const canAddPatient = canRegisterPatient(session as any);
  const canScreen = canAccessClinical(session as any);
  const canCreateProject = canManageProjects(session as any);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Overview"
        description={`Real-time clinical and program summary scoped to ${scopeLabel}.`}
        badge={
          <StatusBadge tone={campId !== "all" ? "info" : "neutral"}>
            {scopeLabel}
          </StatusBadge>
        }
        actions={
          <>
            {canAddPatient && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href="/patients/new">
                  <UserPlus className="h-3.5 w-3.5" />
                  Register Patient
                </Link>
              </Button>
            )}
            {canScreen && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Link href="/clinical">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Clinical Screening
                </Link>
              </Button>
            )}
            {canCreateProject && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Link href="/projects/new">
                  <Plus className="h-3.5 w-3.5" />
                  New Project
                </Link>
              </Button>
            )}
          </>
        }
      />

      {hasError ? (
        <ErrorState
          title="Unable to connect to AfyaCheck API"
          description={getErrorMessage(
            projectsQuery.error || statsQuery.error,
            "Verify backend availability and your session."
          )}
          onRetry={() => {
            projectsQuery.refetch();
            campsQuery.refetch();
            statsQuery.refetch();
            analyticsQuery.refetch();
          }}
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : (
        <>
          {/* Primary KPI Row */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Registered Patients"
              value={stats?.attended ?? 0}
              sublabel={`${stats?.newPatientsThisMonth ?? 0} registered this month`}
              denominator={campId !== "all" ? "Camp total" : "Scope total"}
              icon={Users}
            />
            <MetricCard
              label="Clinical Screenings"
              value={analytics?.attended ?? 0}
              sublabel={`${screeningRate} of registered patients`}
              denominator={`n = ${stats?.attended ?? 0}`}
              icon={Activity}
            />
            <MetricCard
              label="Active Health Camps"
              value={camps.filter((c) => c.active !== false).length}
              sublabel={`Across ${projects.length} project${projects.length === 1 ? "" : "s"}`}
              icon={MapPin}
            />
            <MetricCard
              label="Abnormal Findings Flagged"
              value={totalReferralsOrAbnormal}
              sublabel="Specialty & diagnostic follow-ups"
              denominator={`n = ${analytics?.attended ?? 0}`}
              icon={HeartPulse}
            />
          </div>

          {/* Analytics Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <AnalyticsChart
              title="Daily Screening Activity"
              description="Clinical encounters recorded per day in the current scope."
              type="line"
              data={trendData}
              valueLabel="Screenings"
              periodLabel="Last 14 active days"
              denominator={`n = ${analytics?.attended ?? 0}`}
              sampleSize={analytics?.attended}
              className="lg:col-span-2"
            />
            <AnalyticsChart
              title="Patient Demographics"
              description="Registered patients by recorded gender."
              type="horizontal-bar"
              data={genderBreakdown}
              valueLabel="Patients"
              denominator={`n = ${stats?.attended ?? 0}`}
              sampleSize={stats?.attended}
            />
          </div>

          {/* Operational Panels */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Active Camps List */}
            <section className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Active Health Camps
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select a camp to scope registration and screening workflows.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <Link href="/camps">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {camps.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={MapPin}
                      title="No camps found"
                      description="Create a camp inside a health project to start registering patients."
                      className="py-8"
                    />
                  </div>
                ) : (
                  camps.slice(0, 6).map((camp) => {
                    const parentId =
                      typeof camp.project === "string"
                        ? camp.project
                        : camp.project?._id ||
                          camp.projectDetails?.[0]?._id ||
                          "all";
                    const parentName =
                      typeof camp.project === "object" && camp.project?.name
                        ? camp.project.name
                        : camp.projectDetails?.[0]?.name ||
                          projects.find((p) => p._id === parentId)?.name ||
                          "Health Project";

                    return (
                      <Link
                        key={camp._id}
                        href={`/projects/${parentId}/camps/${camp._id}`}
                        onClick={() => setContext(parentId, camp._id)}
                        className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-foreground">
                            {camp.name}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <FolderKanban className="h-3 w-3 shrink-0" />
                            <span className="truncate">{parentName}</span>
                          </div>
                        </div>
                        <StatusBadge tone={camp.active !== false ? "success" : "neutral"}>
                          {camp.active !== false ? "Active" : "Inactive"}
                        </StatusBadge>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            {/* Recent Clinical Records */}
            <section className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Recent Clinical Records
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Latest screening and diagnosis encounters in scope.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <Link href="/clinical">
                    Open workspace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {recentDiagnoses.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={Stethoscope}
                      title="No clinical records yet"
                      description="Completed or in-progress patient screenings will appear here."
                      className="py-8"
                    />
                  </div>
                ) : (
                  recentDiagnoses.map((record) => {
                    const campName =
                      typeof record.camp === "object" && record.camp?.name
                        ? record.camp.name
                        : "Assigned camp";
                    return (
                      <div
                        key={record._id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-medium text-foreground">
                            {record.patientIdentifier}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {campName} •{" "}
                            {record.createdAt
                              ? format(new Date(record.createdAt), "MMM d, yyyy HH:mm")
                              : "—"}
                          </div>
                        </div>
                        <StatusBadge
                          tone={record.status === "completed" ? "success" : "warning"}
                        >
                          {record.status === "completed" ? "Finalized" : "Pending review"}
                        </StatusBadge>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Quick Analytics & Reporting Shortcut */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Need full demographic breakdowns or camp PDF/CSV exports?
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Generate de-identified executive reports across any project or camp scope.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href="/analytics">Explore Analytics</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/reports">Open Reports</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
