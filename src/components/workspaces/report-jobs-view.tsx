"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/platform/page-header";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { useReportJobs, useRetryReportJob } from "@/lib/api/hooks";
import { downloadReportJob } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/client";
import type { ReportJobRecord, ReportJobStatus } from "@/lib/reports/types";

const REPORT_TYPE_LABELS: Record<string, string> = {
  executive: "Executive Summary",
  project: "Project Health Report",
  camp: "Camp Operations Report",
  wellness: "Wellness Program Report",
  "custom-project": "Custom Project Form Report",
};

function formatBytes(bytes?: number): string {
  if (!bytes || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function JobStatusBadge({ status, progress }: { status: ReportJobStatus; progress: number }) {
  if (status === "completed") {
    return (
      <StatusBadge tone="success">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </StatusBadge>
    );
  }
  if (status === "processing") {
    return (
      <StatusBadge tone="info">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Processing ({progress}%)
      </StatusBadge>
    );
  }
  if (status === "queued") {
    return (
      <StatusBadge tone="warning">
        <Clock className="mr-1 h-3 w-3" />
        Queued
      </StatusBadge>
    );
  }
  if (status === "failed") {
    return (
      <StatusBadge tone="critical">
        <AlertCircle className="mr-1 h-3 w-3" />
        Failed
      </StatusBadge>
    );
  }
  return <StatusBadge tone="neutral">Expired</StatusBadge>;
}

export function ReportJobsView() {
  const jobsQuery = useReportJobs();
  const retryMutation = useRetryReportJob();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const jobs = jobsQuery.data ?? [];
  const activeCount = jobs.filter(
    (j) => j.status === "queued" || j.status === "processing"
  ).length;

  const handleDownload = async (job: ReportJobRecord) => {
    setDownloadingId(job._id);
    try {
      await downloadReportJob(job);
      toast.success(`Downloaded ${job.reportRef || "report export"}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Download authorization failed or expired"));
      jobsQuery.refetch();
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRetry = async (job: ReportJobRecord) => {
    setRetryingId(job._id);
    try {
      await retryMutation.mutateAsync(job._id);
      toast.success("Report job re-queued for execution");
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to retry report job"));
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Background Report Jobs"
        description="Track asynchronous full-dataset report exports, inspect real server progress, retry failed jobs, and download expiring artifacts."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Reports", href: "/reports" },
          { label: "Background Jobs" },
        ]}
        badge={
          activeCount > 0 ? (
            <StatusBadge tone="info">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              {activeCount} active
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral">{jobs.length} total</StatusBadge>
          )
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
              <Link href="/reports">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Report Studio
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => jobsQuery.refetch()}
              disabled={jobsQuery.isFetching}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${jobsQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Every queued execution and artifact download revalidates live user permissions and camp/project scope on the server. Artifacts expire automatically after 24 hours.
        </span>
      </div>

      {jobsQuery.isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : jobsQuery.isError ? (
        <ErrorState
          title="Unable to load background report jobs"
          description={getErrorMessage(jobsQuery.error)}
          onRetry={() => jobsQuery.refetch()}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No background report jobs yet"
          description="Queue a large CSV or JSON export from the Report Studio to generate it asynchronously in the background."
          action={
            <Button size="sm" asChild className="h-8 text-xs">
              <Link href="/reports">Open Report Studio</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Report & Format</th>
                  <th className="px-4 py-3">Status & Progress</th>
                  <th className="px-4 py-3">Reference / Size</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => {
                  const expired =
                    job.status === "expired" ||
                    (Boolean(job.expiresAt) && isPast(new Date(job.expiresAt)));
                  const effectiveStatus: ReportJobStatus = expired ? "expired" : job.status;
                  const canDownload = effectiveStatus === "completed";
                  const canRetry = effectiveStatus === "failed";

                  return (
                    <tr key={job._id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {job.format === "csv" ? (
                            <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <FileJson className="h-4 w-4 shrink-0 text-primary" />
                          )}
                          <div>
                            <div className="font-medium text-foreground">
                              {REPORT_TYPE_LABELS[job.reportType] || job.reportType}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Format: {job.format.toUpperCase()}
                              {job.ownerUsername ? ` · Requested by @${job.ownerUsername}` : ""}
                            </div>
                            {job.errorMessage && effectiveStatus === "failed" && (
                              <div className="mt-1 max-w-md text-[11px] text-destructive">
                                {job.errorCode ? `[${job.errorCode}] ` : ""}
                                {job.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          <JobStatusBadge status={effectiveStatus} progress={job.progress} />
                          {(effectiveStatus === "queued" || effectiveStatus === "processing") && (
                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${Math.max(5, Math.min(100, job.progress || 0))}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground tabular-nums">
                        <div className="text-foreground">{job.reportRef || "Pending"}</div>
                        <div>
                          {formatBytes(job.payloadSizeBytes)}
                          {job.attempts > 0 ? ` · Attempt ${job.attempts}/${job.maxAttempts || 3}` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        <div>{job.createdAt ? format(new Date(job.createdAt), "MMM d, HH:mm") : "—"}</div>
                        {job.completedAt && (
                          <div className="text-[11px]">
                            Done {format(new Date(job.completedAt), "HH:mm:ss")}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {expired ? (
                          <span className="text-destructive">Expired</span>
                        ) : job.expiresAt ? (
                          <span>
                            Expires {formatDistanceToNow(new Date(job.expiresAt), { addSuffix: true })}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canDownload && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 gap-1.5 px-2.5 text-xs"
                              disabled={downloadingId === job._id}
                              onClick={() => handleDownload(job)}
                            >
                              {downloadingId === job._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                              Download
                            </Button>
                          )}
                          {canRetry && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 px-2.5 text-xs"
                              disabled={retryingId === job._id}
                              onClick={() => handleRetry(job)}
                            >
                              {retryingId === job._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                              Retry
                            </Button>
                          )}
                          {!canDownload && !canRetry && (
                            <span className="text-[11px] text-muted-foreground">
                              {effectiveStatus === "expired" ? "Unavailable" : "In progress"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
