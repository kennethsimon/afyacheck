"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format, subDays, startOfYear } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Table as TableIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { ReportDocumentPreview } from "@/components/reports/report-document-preview";
import {
  useCamps,
  useCreateReportJob,
  useCustomProjects,
  useFormSchemas,
  useProjects,
  useReportJobs,
  useStructuredReport,
} from "@/lib/api/hooks";
import { fetchAllMatchingPatients } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { isAdminSession } from "@/lib/permissions";
import { calculateAge } from "@/lib/utils";
import {
  DEFAULT_SECTIONS_BY_TYPE,
  REPORT_SECTION_OPTIONS,
  type ReportSectionKey,
  type ReportTypeId,
} from "@/lib/reports/types";
import { downloadStructuredReportPdf } from "@/lib/reports/pdf-renderer";
import {
  downloadReportCsv,
  downloadReportXlsx,
} from "@/lib/reports/exporters";
import { sanitizeSpreadsheetValue } from "@/lib/reports/tokens";

const REPORT_TYPE_META: Array<{
  id: ReportTypeId;
  label: string;
  description: string;
}> = [
  {
    id: "executive",
    label: "Executive Summary Report",
    description: "Concise 1–3 page stakeholder brief with KPIs and headline trends",
  },
  {
    id: "project",
    label: "Project Health Report",
    description: "Full multi-camp program publication with comparisons and clinical screening",
  },
  {
    id: "camp",
    label: "Camp Operations Report",
    description: "Site-specific registration, screening completion, findings, and referrals",
  },
  {
    id: "wellness",
    label: "Wellness Program Report",
    description: "Psychosocial score band distribution with non-diagnostic guidance",
  },
  {
    id: "custom-project",
    label: "Custom Project Form Report",
    description: "Schema-driven indicator analytics using exact form versions",
  },
];

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
  const isAdmin = isAdminSession(session as any);

  const [reportType, setReportType] = useState<ReportTypeId>(
    scopedCampId ? "camp" : scopedProjectId ? "project" : "project"
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    scopedProjectId ?? workspace.projectId ?? "all"
  );
  const [selectedCampId, setSelectedCampId] = useState<string>(
    scopedCampId ?? workspace.campId ?? "all"
  );
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>("all");
  const [selectedFormVersion, setSelectedFormVersion] = useState<string>("latest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [insuranceFilter, setInsuranceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [includedSections, setIncludedSections] = useState<ReportSectionKey[]>(
    DEFAULT_SECTIONS_BY_TYPE[scopedCampId ? "camp" : "project"]
  );

  // Preview pagination & zoom controls
  const [zoom, setZoom] = useState(85);
  const [pageCount, setPageCount] = useState(1);
  const [viewMode, setViewMode] = useState<"scroll" | "single">("scroll");
  const [currentPage, setCurrentPage] = useState(0);

  // Export states
  const [exportingFormat, setExportingFormat] = useState<
    null | "pdf" | "xlsx" | "csv" | "dataset"
  >(null);

  const effectiveProjectId = scopedProjectId ?? selectedProjectId;
  const effectiveCampId = scopedCampId ?? selectedCampId;

  const projectsQuery = useProjects({ limit: 100 });
  const customProjectsQuery = useCustomProjects();
  const campsQuery = useCamps(effectiveProjectId);
  const schemasQuery = useFormSchemas(
    effectiveProjectId !== "all" ? effectiveProjectId : undefined,
    true
  );

  const handleReportTypeChange = (nextType: ReportTypeId) => {
    setReportType(nextType);
    setIncludedSections(DEFAULT_SECTIONS_BY_TYPE[nextType]);
    setCurrentPage(0);
  };

  const toggleSection = (key: ReportSectionKey, mandatory?: boolean) => {
    if (mandatory) return;
    setIncludedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const applyDatePreset = (preset: "all" | "30d" | "90d" | "ytd") => {
    const today = new Date();
    if (preset === "all") {
      setDateFrom("");
      setDateTo("");
    } else if (preset === "30d") {
      setDateFrom(format(subDays(today, 30), "yyyy-MM-dd"));
      setDateTo(format(today, "yyyy-MM-dd"));
    } else if (preset === "90d") {
      setDateFrom(format(subDays(today, 90), "yyyy-MM-dd"));
      setDateTo(format(today, "yyyy-MM-dd"));
    } else {
      setDateFrom(format(startOfYear(today), "yyyy-MM-dd"));
      setDateTo(format(today, "yyyy-MM-dd"));
    }
  };

  const queryParams = useMemo(
    () => ({
      type: reportType,
      projectId: effectiveProjectId,
      campId: effectiveCampId,
      schemaId: reportType === "custom-project" ? selectedSchemaId : undefined,
      formVersion:
        reportType === "custom-project" && selectedFormVersion !== "latest"
          ? Number(selectedFormVersion)
          : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      gender: genderFilter !== "all" ? genderFilter : undefined,
      insurance: insuranceFilter !== "all" ? insuranceFilter : undefined,
      location: locationFilter.trim() || undefined,
    }),
    [
      reportType,
      effectiveProjectId,
      effectiveCampId,
      selectedSchemaId,
      selectedFormVersion,
      dateFrom,
      dateTo,
      genderFilter,
      insuranceFilter,
      locationFilter,
    ]
  );

  const reportQuery = useStructuredReport(queryParams);
  const report = reportQuery.data;
  const reportJobsQuery = useReportJobs(!embedded);
  const createReportJobMutation = useCreateReportJob();
  const activeBackgroundJobs = (reportJobsQuery.data ?? []).filter(
    (j) => j.status === "queued" || j.status === "processing"
  ).length;

  const handleQueueBackgroundJob = async (formatType: "csv" | "json") => {
    try {
      const { job, deduplicated } = await createReportJobMutation.mutateAsync({
        type: reportType,
        format: formatType,
        projectId: effectiveProjectId,
        campId: effectiveCampId,
        schemaId: reportType === "custom-project" ? selectedSchemaId : undefined,
        formVersion:
          reportType === "custom-project" && selectedFormVersion !== "latest"
            ? Number(selectedFormVersion)
            : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        gender: genderFilter !== "all" ? genderFilter : undefined,
        insurance: insuranceFilter !== "all" ? insuranceFilter : undefined,
        location: locationFilter.trim() || undefined,
      });
      toast.success(
        deduplicated
          ? `Existing background ${formatType.toUpperCase()} job found (${job.status})`
          : `Background ${formatType.toUpperCase()} report queued — open Background Jobs to download when ready`
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to queue background report job"));
    }
  };

  const applicableSectionOptions = useMemo(
    () =>
      REPORT_SECTION_OPTIONS.filter((opt) =>
        opt.applicableTypes.includes(reportType)
      ),
    [reportType]
  );

  const handlePagesComputed = useCallback((count: number) => {
    setPageCount(count);
    setCurrentPage((prev) => Math.min(prev, Math.max(0, count - 1)));
  }, []);

  const handleExportPdf = async () => {
    if (!report) return;
    setExportingFormat("pdf");
    try {
      await downloadStructuredReportPdf(report, { includedSections });
      toast.success("Publication-grade PDF report downloaded");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate PDF report"));
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportXlsx = async () => {
    if (!report) return;
    setExportingFormat("xlsx");
    try {
      await downloadReportXlsx(report);
      toast.success("Formatted Excel workbook (.xlsx) exported");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate Excel workbook"));
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportCsv = () => {
    if (!report) return;
    setExportingFormat("csv");
    try {
      downloadReportCsv(report);
      toast.success("Machine-readable summary CSV exported");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export CSV"));
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportDeidentifiedDataset = async () => {
    setExportingFormat("dataset");
    try {
      const patients = await fetchAllMatchingPatients({
        projectId: effectiveProjectId,
        campId: effectiveCampId,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        gender: genderFilter !== "all" ? genderFilter : undefined,
        location: locationFilter.trim() || undefined,
      });
      if (patients.length === 0) {
        toast.info("No matching participant records for this reporting scope.");
        return;
      }
      const esc = (v: unknown) =>
        `"${String(sanitizeSpreadsheetValue(v)).replace(/"/g, '""')}"`;
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
        p.gender || "Unrecorded",
        p.region || p.location || "Unrecorded",
        p.district || "",
        p.insurance && !["none", "no", "n/a"].includes(p.insurance.toLowerCase())
          ? "Yes"
          : p.insurance
          ? "No"
          : "Unrecorded",
        p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "",
      ]);
      const csv = [
        headers.map(esc).join(","),
        ...rows.map((r) => r.map(esc).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `afyacheck-deidentified-dataset-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${patients.length.toLocaleString()} de-identified records`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export full dataset"));
    } finally {
      setExportingFormat(null);
    }
  };

  const projectOptions = useMemo(() => {
    if (reportType === "custom-project") {
      const custom = customProjectsQuery.data ?? [];
      const standard = projectsQuery.data?.projects ?? [];
      const map = new Map<string, { _id: string; name: string }>();
      [...custom, ...standard].forEach((p) => map.set(p._id, p));
      return Array.from(map.values());
    }
    return projectsQuery.data?.projects ?? [];
  }, [reportType, customProjectsQuery.data, projectsQuery.data?.projects]);

  const activeTypeMeta = REPORT_TYPE_META.find((t) => t.id === reportType);

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title={report?.meta.title || activeTypeMeta?.label || "Health Program Reports"}
          description="Configure, preview, and export publication-grade healthcare reports backed by full-dataset server aggregations."
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Reports" },
          ]}
          badge={
            report ? (
              <StatusBadge tone="success">
                Ref {report.meta.reportRef}
              </StatusBadge>
            ) : undefined
          }
          actions={
            <>
              <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
                <Link href="/reports/jobs">
                  <Clock className="h-3.5 w-3.5" />
                  Background Jobs
                  {activeBackgroundJobs > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {activeBackgroundJobs}
                    </span>
                  )}
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => reportQuery.refetch()}
                disabled={reportQuery.isFetching}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${reportQuery.isFetching ? "animate-spin" : ""}`}
                />
                Refresh Preview
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    disabled={!report || exportingFormat !== null}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {exportingFormat ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Export Report
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                    Publication & Data Formats
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleExportPdf} className="gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">Download PDF Report</span>
                      <span className="text-[10px] text-muted-foreground">
                        A4 publication layout with vector charts
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportXlsx} className="gap-2 text-xs">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">Export Excel Workbook (.xlsx)</span>
                      <span className="text-[10px] text-muted-foreground">
                        Multi-sheet formatted workbook
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCsv} className="gap-2 text-xs">
                    <TableIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">Export Summary CSV</span>
                      <span className="text-[10px] text-muted-foreground">
                        Machine-readable validated indicators
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                    Async Background Jobs
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleQueueBackgroundJob("csv")}
                    disabled={createReportJobMutation.isPending}
                    className="gap-2 text-xs"
                  >
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">Queue Background CSV</span>
                      <span className="text-[10px] text-muted-foreground">
                        Durable server job · Revalidated download
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQueueBackgroundJob("json")}
                    disabled={createReportJobMutation.isPending}
                    className="gap-2 text-xs"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">Queue Background JSON</span>
                      <span className="text-[10px] text-muted-foreground">
                        Full structured payload artifact
                      </span>
                    </div>
                  </DropdownMenuItem>
                  {isAdmin &&
                    ["executive", "project", "camp"].includes(reportType) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleExportDeidentifiedDataset}
                          className="gap-2 text-xs"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              De-identified Participant CSV
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Admin only · Names & phones stripped
                            </span>
                          </div>
                        </DropdownMenuItem>
                      </>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      )}

      {/* Dedicated 2-Pane Linear-Inspired Report Studio */}
      <div className="grid gap-5 lg:grid-cols-[316px_1fr] lg:items-start">
        {/* LEFT PANEL: Report Configuration */}
        <aside className="space-y-4 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              1. Report Template
            </Label>
            <Select
              value={reportType}
              onValueChange={(v) => handleReportTypeChange(v as ReportTypeId)}
            >
              <SelectTrigger className="h-9 bg-background text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPE_META.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeTypeMeta && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                {activeTypeMeta.description}
              </p>
            )}
          </div>

          {/* Scope Selectors */}
          {reportType !== "wellness" && (
            <div className="space-y-3 border-t border-border pt-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                2. Program Scope
              </div>

              {!scopedProjectId && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Project</Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={(val) => {
                      setSelectedProjectId(val);
                      setSelectedCampId("all");
                      setSelectedSchemaId("all");
                      setSelectedFormVersion("latest");
                    }}
                  >
                    <SelectTrigger className="h-8 bg-background text-xs">
                      <SelectValue placeholder="All Health Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">
                        All Health Projects
                      </SelectItem>
                      {projectOptions.map((p) => (
                        <SelectItem key={p._id} value={p._id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!scopedCampId && reportType !== "custom-project" && (
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Camp / Site</Label>
                  <Select value={selectedCampId} onValueChange={setSelectedCampId}>
                    <SelectTrigger className="h-8 bg-background text-xs">
                      <SelectValue placeholder="All Camps" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">
                        All Camps
                      </SelectItem>
                      {(campsQuery.data?.camps ?? []).map((c) => (
                        <SelectItem key={c._id} value={c._id} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === "custom-project" && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Form Schema (Versioned)
                    </Label>
                    <Select
                      value={selectedSchemaId}
                      onValueChange={(v) => {
                        setSelectedSchemaId(v);
                        setSelectedFormVersion("latest");
                      }}
                    >
                      <SelectTrigger className="h-8 bg-background text-xs">
                        <SelectValue placeholder="Latest active schema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">
                          Latest Active Schema
                        </SelectItem>
                        {(schemasQuery.data ?? []).map((s) => (
                          <SelectItem key={s._id} value={s._id} className="text-xs">
                            {s.name} (v{s.version || 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {report?.customProject?.versionBreakdown &&
                    Object.keys(report.customProject.versionBreakdown).length > 1 && (
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          Strict Schema Version
                        </Label>
                        <Select
                          value={selectedFormVersion}
                          onValueChange={setSelectedFormVersion}
                        >
                          <SelectTrigger className="h-8 bg-background text-xs">
                            <SelectValue placeholder="Latest version" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest" className="text-xs">
                              Latest Published Version
                            </SelectItem>
                            {Object.entries(report.customProject.versionBreakdown).map(
                              ([verKey, count]) => {
                                const verNum = verKey.replace(/^v/i, "");
                                return (
                                  <SelectItem key={verKey} value={verNum} className="text-xs">
                                    {verKey} ({count.toLocaleString()} submissions)
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Reporting Period */}
          <div className="space-y-2.5 border-t border-border pt-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                3. Reporting Period
              </span>
              <div className="flex gap-1">
                {(
                  [
                    ["all", "All"],
                    ["30d", "30d"],
                    ["90d", "90d"],
                    ["ytd", "YTD"],
                  ] as const
                ).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyDatePreset(id)}
                    className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 bg-background text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 bg-background text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Configurable Report Sections */}
          <div className="space-y-2 border-t border-border pt-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              4. Document Sections
            </div>
            <div className="space-y-1.5">
              {applicableSectionOptions.map((opt) => {
                const checked =
                  opt.mandatory || includedSections.includes(opt.key);
                return (
                  <label
                    key={opt.key}
                    className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                      opt.mandatory
                        ? "bg-muted/40 opacity-90"
                        : "cursor-pointer hover:bg-muted/40"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={opt.mandatory}
                      onCheckedChange={() => toggleSection(opt.key, opt.mandatory)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <span>{opt.label}</span>
                        {opt.mandatory && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {opt.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          {["executive", "project", "camp"].includes(reportType) && (
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((v) => !v)}
                className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <Filter className="h-3 w-3" />
                  Advanced Filters
                </span>
                <span>{showAdvancedFilters ? "−" : "+"}</span>
              </button>
              {showAdvancedFilters && (
                <div className="mt-3 space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Gender</Label>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="h-8 bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All Genders</SelectItem>
                        <SelectItem value="female" className="text-xs">Female</SelectItem>
                        <SelectItem value="male" className="text-xs">Male</SelectItem>
                        <SelectItem value="others" className="text-xs">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Insurance</Label>
                    <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                      <SelectTrigger className="h-8 bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All Coverage</SelectItem>
                        <SelectItem value="yes" className="text-xs">Insured</SelectItem>
                        <SelectItem value="no" className="text-xs">Uninsured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Region / Location
                    </Label>
                    <Input
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="e.g. Arusha, Dar es Salaam"
                      className="h-8 bg-background text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {embedded && (
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <Button
                size="sm"
                onClick={handleExportPdf}
                disabled={!report || exportingFormat !== null}
                className="h-8 w-full gap-1.5 text-xs"
              >
                {exportingFormat === "pdf" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Download PDF Report
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportXlsx}
                  disabled={!report || exportingFormat !== null}
                  className="h-8 gap-1 text-[11px]"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={!report || exportingFormat !== null}
                  className="h-8 gap-1 text-[11px]"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN PANEL: WYSIWYG Paginated A4 Document Preview */}
        <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted/40">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground">
                Document Preview
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-[11px] text-muted-foreground">
                A4 Portrait · {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
              {report?.meta.deidentified && (
                <StatusBadge tone="success">De-identified</StatusBadge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View mode & page nav */}
              <div className="flex items-center rounded-md border border-border bg-background p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setViewMode("scroll")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    viewMode === "scroll"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Pages
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("single")}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    viewMode === "single"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Single Page
                </button>
              </div>

              {viewMode === "single" && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={currentPage <= 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-[54px] text-center text-[11px] font-medium tabular-nums text-muted-foreground">
                    {currentPage + 1} / {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={currentPage >= pageCount - 1}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Zoom controls */}
              <div className="flex items-center gap-1 border-l border-border pl-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.max(60, z - 10))}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[38px] text-center text-[11px] font-medium tabular-nums text-muted-foreground">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.min(120, z + 10))}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Paper Canvas */}
          <div className="max-h-[calc(100vh-210px)] overflow-auto px-4 py-4">
            {reportQuery.isError ? (
              <div className="mx-auto max-w-lg py-12">
                <ErrorState
                  title="Unable to generate report preview"
                  description={getErrorMessage(reportQuery.error)}
                  onRetry={() => reportQuery.refetch()}
                />
              </div>
            ) : reportQuery.isLoading || !report ? (
              <div className="mx-auto max-w-2xl py-8">
                <LoadingSkeleton variant="detail" />
              </div>
            ) : (
              <ReportDocumentPreview
                report={report}
                includedSections={includedSections}
                zoom={zoom}
                activePageIndex={viewMode === "single" ? currentPage : null}
                onPagesComputed={handlePagesComputed}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
