"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  BarChart3,
  HeartPulse,
  ShieldCheck,
  Users,
} from "lucide-react";
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
import { MetricCard } from "@/components/platform/metric-card";
import { AnalyticsChart } from "@/components/platform/analytics-chart";
import {
  ActiveFilterChips,
  FilterPopover,
  type ActiveFilterChip,
} from "@/components/platform/data-toolbar";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import {
  useCampAnalytics,
  useCampStats,
  useFormAnalyticsDashboard,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";

function pct(part: number, total: number): string {
  if (!total || total <= 0) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function deltaInfo(current: number, previous: number) {
  if (!previous && !current) {
    return { value: "0%", direction: "flat" as const };
  }
  if (!previous && current > 0) {
    return { value: `+${current}`, direction: "up" as const };
  }
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 0.1) return { value: "0%", direction: "flat" as const };
  return {
    value: `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`,
    direction: diff > 0 ? ("up" as const) : ("down" as const),
  };
}

export function AnalyticsWorkspaceView({
  scopedProjectId,
  scopedCampId,
  embedded = false,
}: {
  scopedProjectId?: string;
  scopedCampId?: string;
  embedded?: boolean;
}) {
  const workspace = useWorkspace();
  const effectiveProjectId = scopedProjectId ?? workspace.projectId ?? "all";
  const effectiveCampId = scopedCampId ?? workspace.campId ?? "all";

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [gender, setGender] = useState("all");
  const [insurance, setInsurance] = useState("");
  const [location, setLocation] = useState("");

  const queryParams = useMemo(
    () => ({
      projectId: effectiveProjectId,
      campId: effectiveCampId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      gender: gender !== "all" ? gender : undefined,
      insurance: insurance.trim() || undefined,
      location: location.trim() || undefined,
    }),
    [effectiveProjectId, effectiveCampId, dateFrom, dateTo, gender, insurance, location]
  );

  const statsQuery = useCampStats(queryParams);
  const analyticsQuery = useCampAnalytics(queryParams);
  const formAnalyticsQuery = useFormAnalyticsDashboard(
    effectiveProjectId !== "all" ? effectiveProjectId : undefined
  );

  const stats = statsQuery.data;
  const analytics = analyticsQuery.data;

  const periodLabel = useMemo(() => {
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `From ${dateFrom}`;
    if (dateTo) return `Up to ${dateTo}`;
    return "All recorded dates";
  }, [dateFrom, dateTo]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (dateFrom) {
      list.push({
        key: "from",
        label: "From",
        value: dateFrom,
        onRemove: () => setDateFrom(""),
      });
    }
    if (dateTo) {
      list.push({
        key: "to",
        label: "To",
        value: dateTo,
        onRemove: () => setDateTo(""),
      });
    }
    if (gender !== "all") {
      list.push({
        key: "gender",
        label: "Gender",
        value: gender,
        onRemove: () => setGender("all"),
      });
    }
    if (insurance.trim()) {
      list.push({
        key: "insurance",
        label: "Insurance",
        value: insurance.trim(),
        onRemove: () => setInsurance(""),
      });
    }
    if (location.trim()) {
      list.push({
        key: "location",
        label: "Location",
        value: location.trim(),
        onRemove: () => setLocation(""),
      });
    }
    return list;
  }, [dateFrom, dateTo, gender, insurance, location]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setGender("all");
    setInsurance("");
    setLocation("");
  };

  const trendSeries = useMemo(() => {
    return (analytics?.newPatientsOverTime ?? []).map((pt) => ({
      name: (() => {
        try {
          return format(new Date(pt.date), "MMM d");
        } catch {
          return pt.date;
        }
      })(),
      value: pt.count,
    }));
  }, [analytics?.newPatientsOverTime]);

  const ageSeries = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Children (0-12)", value: stats.children || 0 },
      { name: "Teenagers (13-19)", value: stats.teenagers || 0 },
      { name: "Adults (20-60)", value: stats.adults || 0 },
      { name: "Seniors (60+)", value: stats.seniors || 0 },
    ];
  }, [stats]);

  const genderSeries = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Female", value: stats.female || 0 },
      { name: "Male", value: stats.male || 0 },
      { name: "Others", value: stats.others || 0 },
    ];
  }, [stats]);

  const specialtySeries = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Physiotherapy", value: analytics.physioAbnormal || 0 },
      { name: "Dental", value: analytics.dentalAbnormal || 0 },
      { name: "Ophthalmology", value: analytics.ophthalmologyAbnormal || 0 },
      { name: "Orthopedics", value: analytics.orthoAbnormal || 0 },
    ];
  }, [analytics]);

  const radiologySeries = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "ECG", value: analytics.ecgAbnormal || 0 },
      { name: "Echocardiogram", value: analytics.echoAbnormal || 0 },
      { name: "X-Ray", value: analytics.xrayAbnormal || 0 },
      { name: "Ultrasound", value: analytics.ultrasoundAbnormal || 0 },
    ];
  }, [analytics]);

  const cancerSeries = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Breast Cancer", value: analytics.breastCancerScreened || 0 },
      { name: "Cervical Cancer", value: analytics.cervicalCancerScreened || 0 },
      { name: "Prostate Cancer", value: analytics.prostateCancerScreened || 0 },
    ];
  }, [analytics]);

  const isLoading = statsQuery.isLoading || analyticsQuery.isLoading;
  const hasError = statsQuery.isError && analyticsQuery.isError;

  const registeredTotal = stats?.attended ?? 0;
  const screenedTotal = analytics?.attended ?? 0;
  const insuredCount = analytics?.withInsurance ?? 0;
  const uninsuredCount = analytics?.withoutInsurance ?? 0;
  const insuranceDenom = insuredCount + uninsuredCount;

  return (
    <div className="space-y-5">
      {!embedded && (
        <PageHeader
          title="Clinical & Program Analytics"
          description="Server-aggregated demographics, clinical screening volumes, and diagnostic findings."
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Analytics" },
          ]}
          badge={<StatusBadge tone="neutral">{periodLabel}</StatusBadge>}
        />
      )}

      {/* Compact Filter Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover label="Filters" activeCount={chips.length}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">From date</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">To date</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Insurance</Label>
                  <Input
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    placeholder="Filter by insurer..."
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Filter by location..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </FilterPopover>
            <span className="text-xs text-muted-foreground">
              Period: <strong className="font-medium text-foreground">{periodLabel}</strong>
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            All metrics aggregated server-side (non-identifiable)
          </span>
        </div>

        <ActiveFilterChips chips={chips} onClearAll={clearFilters} />
      </div>

      {hasError ? (
        <ErrorState
          title="Unable to load analytics"
          description={getErrorMessage(statsQuery.error || analyticsQuery.error)}
          onRetry={() => {
            statsQuery.refetch();
            analyticsQuery.refetch();
          }}
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} />
      ) : (
        <Tabs defaultValue="demographics" className="space-y-4">
          <TabsList className="h-9 bg-muted/60 p-0.5">
            <TabsTrigger value="demographics" className="text-xs">
              Demographics & Volume
            </TabsTrigger>
            <TabsTrigger value="clinical" className="text-xs">
              Clinical Screening
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              Custom Forms
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Demographics & Volume */}
          <TabsContent value="demographics" className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Registered Patients"
                value={registeredTotal}
                sublabel="Matched patient records"
                denominator={`n = ${registeredTotal}`}
                icon={Users}
              />
              <MetricCard
                label="New Today"
                value={stats?.newPatientsToday ?? 0}
                sublabel="vs yesterday"
                delta={deltaInfo(
                  stats?.newPatientsToday ?? 0,
                  stats?.prevNewPatientsToday ?? 0
                )}
                icon={Activity}
              />
              <MetricCard
                label="New This Week"
                value={stats?.newPatientsThisWeek ?? 0}
                sublabel="vs prior 7 days"
                delta={deltaInfo(
                  stats?.newPatientsThisWeek ?? 0,
                  stats?.prevNewPatientsThisWeek ?? 0
                )}
                icon={BarChart3}
              />
              <MetricCard
                label="Insurance Coverage"
                value={pct(insuredCount, insuranceDenom)}
                sublabel={`${insuredCount.toLocaleString()} insured of ${insuranceDenom.toLocaleString()}`}
                denominator={`n = ${insuranceDenom}`}
                icon={ShieldCheck}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AnalyticsChart
                title="Screening Activity Over Time"
                description="Daily count of recorded clinical screening encounters."
                type="line"
                data={trendSeries}
                valueLabel="Encounters"
                periodLabel={periodLabel}
                denominator={`n = ${screenedTotal}`}
                sampleSize={screenedTotal}
                className="lg:col-span-2"
              />
              <AnalyticsChart
                title="Gender Distribution"
                description="Registered patients by recorded gender."
                type="horizontal-bar"
                data={genderSeries}
                valueLabel="Patients"
                denominator={`n = ${registeredTotal}`}
                sampleSize={registeredTotal}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <AnalyticsChart
                title="Age Group Distribution"
                description="Registered patients grouped into clinical age brackets."
                type="bar"
                data={ageSeries}
                valueLabel="Patients"
                denominator={`n = ${registeredTotal}`}
                sampleSize={registeredTotal}
              />

              {/* Precise Distribution Table */}
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Demographic Breakdown Table
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Exact counts and shares of total registered patients (n = {registeredTotal}).
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2 text-right">Count</th>
                        <th className="px-4 py-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70 tabular-nums">
                      {[
                        { label: "Female", count: stats?.female ?? 0 },
                        { label: "Male", count: stats?.male ?? 0 },
                        { label: "Others", count: stats?.others ?? 0 },
                        { label: "Children (0–12)", count: stats?.children ?? 0 },
                        { label: "Teenagers (13–19)", count: stats?.teenagers ?? 0 },
                        { label: "Adults (20–60)", count: stats?.adults ?? 0 },
                        { label: "Seniors (60+)", count: stats?.seniors ?? 0 },
                        { label: "Insured", count: insuredCount },
                        { label: "Uninsured", count: uninsuredCount },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className="px-4 py-2 text-foreground">{row.label}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            {row.count.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right text-muted-foreground">
                            {pct(row.count, registeredTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Clinical Screening */}
          <TabsContent value="clinical" className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="HIV Tests Performed"
                value={analytics?.hivTested ?? 0}
                sublabel={`${analytics?.hivPositive ?? 0} positive (${pct(
                  analytics?.hivPositive ?? 0,
                  analytics?.hivTested ?? 0
                )})`}
                denominator={`n = ${analytics?.hivTested ?? 0}`}
                icon={HeartPulse}
              />
              <MetricCard
                label="TB Screened (Pos / Neg)"
                value={(analytics?.tbPositive ?? 0) + (analytics?.tbNegative ?? 0)}
                sublabel={`${analytics?.tbPositive ?? 0} positive identified`}
                denominator={`n = ${(analytics?.tbPositive ?? 0) + (analytics?.tbNegative ?? 0)}`}
                icon={Activity}
              />
              <MetricCard
                label="Cancer Screenings"
                value={analytics?.cancerScreened ?? 0}
                sublabel="Breast, cervical & prostate"
                denominator={`n = ${screenedTotal}`}
                icon={ShieldCheck}
              />
              <MetricCard
                label="Preventive Interventions"
                value={analytics?.preventiveMeasures ?? 0}
                sublabel={`${analytics?.bloodDonation ?? 0} blood donations recorded`}
                denominator={`n = ${screenedTotal}`}
                icon={Users}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AnalyticsChart
                title="Specialty Abnormal Findings"
                description="Abnormal evaluations flagged across clinic stations."
                type="horizontal-bar"
                data={specialtySeries}
                valueLabel="Abnormal findings"
                denominator={`n = ${screenedTotal}`}
                sampleSize={screenedTotal}
              />
              <AnalyticsChart
                title="Radiology Abnormal Findings"
                description="Abnormal findings by imaging/diagnostic modality."
                type="horizontal-bar"
                data={radiologySeries}
                valueLabel="Abnormal findings"
                denominator={`n = ${screenedTotal}`}
                sampleSize={screenedTotal}
              />
              <AnalyticsChart
                title="Cancer Screenings by Site"
                description="Completed cancer screening volumes by site."
                type="bar"
                data={cancerSeries}
                valueLabel="Screened"
                denominator={`n = ${analytics?.cancerScreened ?? 0}`}
                sampleSize={analytics?.cancerScreened ?? 0}
              />
            </div>
          </TabsContent>

          {/* TAB 3: Custom Forms */}
          <TabsContent value="custom" className="space-y-4">
            {effectiveProjectId === "all" ? (
              <EmptyState
                title="Select a specific project for Custom Form Analytics"
                description="Use the Project selector in the top bar to view custom form template counts and submission approval metrics."
              />
            ) : formAnalyticsQuery.isLoading ? (
              <LoadingSkeleton variant="cards" rows={4} />
            ) : formAnalyticsQuery.isError ? (
              <ErrorState
                description={getErrorMessage(formAnalyticsQuery.error)}
                onRetry={() => formAnalyticsQuery.refetch()}
              />
            ) : (
              <>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Total Submissions"
                    value={formAnalyticsQuery.data?.totalSubmissions ?? 0}
                    sublabel="Across active & archived schemas"
                  />
                  <MetricCard
                    label="Approved Submissions"
                    value={formAnalyticsQuery.data?.approvedCount ?? 0}
                    sublabel={pct(
                      formAnalyticsQuery.data?.approvedCount ?? 0,
                      formAnalyticsQuery.data?.totalSubmissions ?? 0
                    )}
                  />
                  <MetricCard
                    label="Pending Review"
                    value={formAnalyticsQuery.data?.submittedCount ?? 0}
                    sublabel={`${formAnalyticsQuery.data?.draftCount ?? 0} drafts`}
                  />
                  <MetricCard
                    label="Active Form Schemas"
                    value={formAnalyticsQuery.data?.activeSchemas ?? 0}
                    sublabel={`of ${formAnalyticsQuery.data?.totalSchemas ?? 0} total`}
                  />
                </div>
                <AnalyticsChart
                  title="Form Submissions by Review Status"
                  description="Distribution of custom form submissions for the selected project."
                  type="bar"
                  data={[
                    { name: "Draft", value: formAnalyticsQuery.data?.draftCount ?? 0 },
                    { name: "Submitted", value: formAnalyticsQuery.data?.submittedCount ?? 0 },
                    { name: "Approved", value: formAnalyticsQuery.data?.approvedCount ?? 0 },
                    { name: "Rejected", value: formAnalyticsQuery.data?.rejectedCount ?? 0 },
                  ]}
                  valueLabel="Submissions"
                  denominator={`n = ${formAnalyticsQuery.data?.totalSubmissions ?? 0}`}
                  sampleSize={formAnalyticsQuery.data?.totalSubmissions ?? 0}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
