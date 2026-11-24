"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  ShieldCheck,
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
import { MetricCard } from "@/components/platform/metric-card";
import {
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { SectionedForm } from "@/components/platform/record-detail-layout";
import {
  useCamp,
  useCampAnalytics,
  useCampStats,
  useProject,
} from "@/lib/api/hooks";
import { fetchAllMatchingPatients } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/client";
import { generateAnalyticsReport } from "@/lib/report-generator";
import { useWorkspace } from "@/lib/workspace-context";
import { isAdminSession } from "@/lib/permissions";
import { calculateAge } from "@/lib/utils";

function pct(part: number, total: number): string {
  if (!total || total <= 0) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const content = [
    headers.map(esc).join(","),
    ...rows.map((r) => r.map(esc).join(",")),
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsWorkspaceView({
  scopedProjectId,
  scopedCampId,
  embedded = false,
}: {
  scopedProjectId?: string;
  scopedCampId?: string;
  embedded?: boolean;
}) {
  const { data: session } = useSession();
  const workspace = useWorkspace();
  const effectiveProjectId = scopedProjectId ?? workspace.projectId ?? "all";
  const effectiveCampId = scopedCampId ?? workspace.campId ?? "all";

  const [reportType, setReportType] = useState<
    "comprehensive" | "demographics" | "screening"
  >("comprehensive");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const isAdmin = isAdminSession(session as any);

  const projectQuery = useProject(
    effectiveProjectId !== "all" ? effectiveProjectId : undefined
  );
  const campQuery = useCamp(effectiveCampId !== "all" ? effectiveCampId : undefined);

  const queryParams = useMemo(
    () => ({
      projectId: effectiveProjectId,
      campId: effectiveCampId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [effectiveProjectId, effectiveCampId, dateFrom, dateTo]
  );

  const statsQuery = useCampStats(queryParams);
  const analyticsQuery = useCampAnalytics(queryParams);

  const stats = statsQuery.data;
  const analytics = analyticsQuery.data;

  const projectName =
    projectQuery.data?.name ||
    (effectiveProjectId === "all" ? "All Health Projects" : effectiveProjectId);
  const campName =
    campQuery.data?.name ||
    (effectiveCampId === "all" ? "All Camps" : effectiveCampId);

  const periodText =
    dateFrom && dateTo
      ? `${dateFrom} to ${dateTo}`
      : dateFrom
      ? `From ${dateFrom}`
      : dateTo
      ? `Through ${dateTo}`
      : "All recorded dates";

  const summaryRows = useMemo(() => {
    const attended = stats?.attended ?? 0;
    const screened = analytics?.attended ?? 0;
    const rows: { section: string; indicator: string; count: number; denominator: number }[] = [];

    if (reportType === "comprehensive" || reportType === "demographics") {
      rows.push(
        { section: "Demographics", indicator: "Total Registered Patients", count: attended, denominator: attended },
        { section: "Demographics", indicator: "Female Patients", count: stats?.female ?? 0, denominator: attended },
        { section: "Demographics", indicator: "Male Patients", count: stats?.male ?? 0, denominator: attended },
        { section: "Demographics", indicator: "Children (0–12)", count: stats?.children ?? 0, denominator: attended },
        { section: "Demographics", indicator: "Teenagers (13–19)", count: stats?.teenagers ?? 0, denominator: attended },
        { section: "Demographics", indicator: "Adults (20–60)", count: stats?.adults ?? 0, denominator: attended },
        { section: "Demographics", indicator: "Seniors (60+)", count: stats?.seniors ?? 0, denominator: attended },
        { section: "Coverage", indicator: "With Insurance", count: analytics?.withInsurance ?? 0, denominator: attended },
        { section: "Coverage", indicator: "Without Insurance", count: analytics?.withoutInsurance ?? 0, denominator: attended }
      );
    }

    if (reportType === "comprehensive" || reportType === "screening") {
      rows.push(
        { section: "Clinical Screening", indicator: "Total Clinical Encounters", count: screened, denominator: attended },
        { section: "Infectious Disease", indicator: "HIV Tested", count: analytics?.hivTested ?? 0, denominator: screened },
        { section: "Infectious Disease", indicator: "HIV Positive", count: analytics?.hivPositive ?? 0, denominator: analytics?.hivTested ?? 0 },
        { section: "Infectious Disease", indicator: "TB Positive", count: analytics?.tbPositive ?? 0, denominator: (analytics?.tbPositive ?? 0) + (analytics?.tbNegative ?? 0) },
        { section: "Cancer", indicator: "Breast Cancer Screened", count: analytics?.breastCancerScreened ?? 0, denominator: screened },
        { section: "Cancer", indicator: "Cervical Cancer Screened", count: analytics?.cervicalCancerScreened ?? 0, denominator: screened },
        { section: "Cancer", indicator: "Prostate Cancer Screened", count: analytics?.prostateCancerScreened ?? 0, denominator: screened },
        { section: "Specialties", indicator: "Physiotherapy Abnormal", count: analytics?.physioAbnormal ?? 0, denominator: screened },
        { section: "Specialties", indicator: "Dental Abnormal", count: analytics?.dentalAbnormal ?? 0, denominator: screened },
        { section: "Specialties", indicator: "Ophthalmology Abnormal", count: analytics?.ophthalmologyAbnormal ?? 0, denominator: screened },
        { section: "Specialties", indicator: "Orthopedic Abnormal", count: analytics?.orthoAbnormal ?? 0, denominator: screened },
        { section: "Radiology", indicator: "ECG Abnormal", count: analytics?.ecgAbnormal ?? 0, denominator: screened },
        { section: "Radiology", indicator: "Echo Abnormal", count: analytics?.echoAbnormal ?? 0, denominator: screened },
        { section: "Radiology", indicator: "X-Ray Abnormal", count: analytics?.xrayAbnormal ?? 0, denominator: screened },
        { section: "Radiology", indicator: "Ultrasound Abnormal", count: analytics?.ultrasoundAbnormal ?? 0, denominator: screened }
      );
    }

    return rows;
  }, [stats, analytics, reportType]);

  const handleDownloadPdf = async () => {
    if (!stats || !analytics) {
      toast.error("Report metrics are not ready yet.");
      return;
    }
    setExportingPdf(true);
    try {
      await generateAnalyticsReport({
        projectName,
        campName,
        generatedAt: new Date(),
        stats,
        analytics,
      });
      toast.success("PDF report downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate PDF report"));
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadSummaryCsv = () => {
    const headers = ["Section", "Indicator", "Count", "Denominator", "Rate"];
    const rows = summaryRows.map((r) => [
      r.section,
      r.indicator,
      r.count,
      r.denominator,
      pct(r.count, r.denominator),
    ]);
    downloadCsv(
      `afyacheck-summary-report-${format(new Date(), "yyyy-MM-dd")}.csv`,
      headers,
      rows
    );
    toast.success("De-identified summary CSV exported");
  };

  const handleDownloadDeidentifiedDataset = async () => {
    setExportingCsv(true);
    try {
      const patients = await fetchAllMatchingPatients(queryParams);
      if (patients.length === 0) {
        toast.info("No matching patient records for this reporting scope.");
        return;
      }
      const headers = [
        "Record #",
        "Age",
        "Gender",
        "Region",
        "District",
        "Has Insurance",
        "Registered Date",
      ];
      const rows = patients.map((p, idx) => [
        idx + 1,
        p.dateOfBirth ? calculateAge(p.dateOfBirth) : "",
        p.gender || "",
        p.region || p.location || "",
        p.district || "",
        p.insurance ? "Yes" : "No",
        p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "",
      ]);
      downloadCsv(
        `afyacheck-deidentified-dataset-${format(new Date(), "yyyy-MM-dd")}.csv`,
        headers,
        rows
      );
      toast.success(`Exported ${patients.length.toLocaleString()} de-identified records`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export full dataset"));
    } finally {
      setExportingCsv(false);
    }
  };

  const isLoading = statsQuery.isLoading || analyticsQuery.isLoading;

  return (
    <div className="space-y-5">
      {!embedded && (
        <PageHeader
          title="Executive & Clinical Reports"
          description="Generate structured, audit-ready PDF and CSV reports covering the full matching dataset."
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Reports" },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSummaryCsv}
                disabled={isLoading || !stats}
                className="h-8 gap-1.5 text-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Summary CSV
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadDeidentifiedDataset}
                  disabled={exportingCsv}
                  className="h-8 gap-1.5 text-xs"
                >
                  {exportingCsv ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Full Dataset (De-identified)
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                disabled={exportingPdf || isLoading || !stats || !analytics}
                className="h-8 gap-1.5 text-xs"
              >
                {exportingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Export PDF Report
              </Button>
            </>
          }
        />
      )}

      {/* Report Configuration Controls */}
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Report Template</Label>
          <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">
                Comprehensive Program & Clinical Report
              </SelectItem>
              <SelectItem value="demographics">Demographic Breakdown Report</SelectItem>
              <SelectItem value="screening">Clinical Screening & Referral Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Period Start</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 bg-background text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Period End</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 bg-background text-xs"
          />
        </div>
      </div>

      {statsQuery.isError && analyticsQuery.isError ? (
        <ErrorState
          title="Unable to assemble report preview"
          description={getErrorMessage(statsQuery.error || analyticsQuery.error)}
          onRetry={() => {
            statsQuery.refetch();
            analyticsQuery.refetch();
          }}
        />
      ) : isLoading ? (
        <LoadingSkeleton variant="detail" />
      ) : (
        /* Structured Report Preview Document */
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                AfyaCheck Official Report Preview
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {reportType === "comprehensive"
                  ? "Comprehensive Health Operations Report"
                  : reportType === "demographics"
                  ? "Patient Demographics Report"
                  : "Clinical Screening & Referrals Report"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Project: <strong className="text-foreground">{projectName}</strong> · Camp:{" "}
                <strong className="text-foreground">{campName}</strong> · Period:{" "}
                <strong className="text-foreground">{periodText}</strong>
              </p>
            </div>
            <div className="text-right space-y-1">
              <StatusBadge tone="success">De-identified by Default</StatusBadge>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                Generated {format(new Date(), "MMM d, yyyy HH:mm")}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Registered Patients"
                value={stats?.attended ?? 0}
                denominator="Full matching set"
              />
              <MetricCard
                label="Clinical Screenings"
                value={analytics?.attended ?? 0}
                sublabel={pct(analytics?.attended ?? 0, stats?.attended ?? 0)}
              />
              <MetricCard
                label="HIV / TB Positives"
                value={(analytics?.hivPositive ?? 0) + (analytics?.tbPositive ?? 0)}
                sublabel={`HIV: ${analytics?.hivPositive ?? 0} · TB: ${analytics?.tbPositive ?? 0}`}
              />
              <MetricCard
                label="Insured Patients"
                value={analytics?.withInsurance ?? 0}
                sublabel={pct(
                  analytics?.withInsurance ?? 0,
                  (analytics?.withInsurance ?? 0) + (analytics?.withoutInsurance ?? 0)
                )}
              />
            </div>

            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Domain</th>
                    <th className="px-4 py-2.5">Indicator</th>
                    <th className="px-4 py-2.5 text-right">Count</th>
                    <th className="px-4 py-2.5 text-right">Denominator</th>
                    <th className="px-4 py-2.5 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70 tabular-nums">
                  {summaryRows.map((row) => (
                    <tr key={`${row.section}-${row.indicator}`}>
                      <td className="px-4 py-2 text-muted-foreground">{row.section}</td>
                      <td className="px-4 py-2 font-medium text-foreground">
                        {row.indicator}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {row.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {row.denominator.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {pct(row.count, row.denominator)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SectionedForm
              title="Methodology & Data Integrity Notes"
              className="bg-muted/20"
            >
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-1 leading-relaxed">
                  <p>
                    • All KPIs and rates are computed via server-side aggregations across the full matching dataset, never from a single paginated table page.
                  </p>
                  <p>
                    • Standard report exports omit patient names, phone numbers, and street addresses by default. Authorized patient-level exports are restricted to administrators in the Patient Register.
                  </p>
                  <p>
                    • Denominators reflect recorded screening tests performed; zero values are distinguished from unrecorded fields.
                  </p>
                </div>
              </div>
            </SectionedForm>

            {embedded && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSummaryCsv}
                  className="h-8 gap-1.5 text-xs"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Export Summary CSV
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={exportingPdf}
                  className="h-8 gap-1.5 text-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
