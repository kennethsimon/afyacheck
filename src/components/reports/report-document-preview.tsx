"use client";

import React, { useMemo } from "react";
import {
  ReportDonutSvg,
  ReportGroupedBarSvg,
  ReportHorizontalBarSvg,
  ReportLineTrendSvg,
  ReportStackedBarSvg,
} from "./report-svg-charts";
import {
  formatRateOrNA,
  formatReportDate,
  formatReportDateTime,
  REPORT_COLORS,
} from "@/lib/reports/tokens";
import {
  DEFAULT_SECTIONS_BY_TYPE,
  type ReportSectionKey,
  type StructuredReportPayload,
} from "@/lib/reports/types";

interface ReportPageSlot {
  id: string;
  label: string;
  isCover?: boolean;
  content: React.ReactNode;
}

function EditorialSectionHeader({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 h-[3px] w-8 rounded-full bg-[#106D75]" />
      <div className="flex items-baseline gap-2.5 border-b border-[#E2E8F0] pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#106D75]">
          Section {String(index).padStart(2, "0")}
        </span>
        <h2 className="text-[15px] font-bold tracking-tight text-[#101828]">
          {title}
        </h2>
      </div>
      {description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#667085]">
          {description}
        </p>
      )}
    </div>
  );
}

function EditorialTable({
  title,
  subtitle,
  headers,
  rows,
  numericColumns = [],
  boldLastRow = false,
}: {
  title?: string;
  subtitle?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  numericColumns?: number[];
  boldLastRow?: boolean;
}) {
  const numSet = new Set(numericColumns);
  return (
    <div className="mt-4">
      {title && (
        <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
      )}
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
      )}
      <div className="mt-2 overflow-hidden rounded border border-[#E2E8F0] bg-white">
        <table className="w-full border-collapse text-[10.5px]">
          <thead>
            <tr className="border-b-2 border-[#106D75] bg-[#F5F7F9] text-left text-[9.5px] font-bold uppercase tracking-wide text-[#101828]">
              {headers.map((h, idx) => (
                <th
                  key={h}
                  className={`px-2.5 py-2 ${numSet.has(idx) ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0] tabular-nums">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-2.5 py-3 text-center italic text-[#667085]"
                >
                  No matching records
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
                const isLast = boldLastRow && rIdx === rows.length - 1;
                return (
                  <tr
                    key={rIdx}
                    className={
                      isLast
                        ? "bg-[#F4F9FA] font-semibold text-[#101828]"
                        : "text-[#344054]"
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-2.5 py-1.5 ${
                          numSet.has(cIdx) ? "text-right" : "text-left"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * True paginated A4 document preview using the exact AfyaCheck Report Design System.
 * Mirrors the downloaded PDF layout, charts, tables, and mandatory governance notices.
 */
export function ReportDocumentPreview({
  report,
  includedSections,
  zoom = 100,
  activePageIndex,
  onPagesComputed,
}: {
  report: StructuredReportPayload;
  includedSections: ReportSectionKey[];
  zoom?: number;
  activePageIndex?: number | null;
  onPagesComputed?: (count: number) => void;
}) {
  const sections = useMemo(() => {
    const s = new Set<ReportSectionKey>(
      includedSections.length > 0
        ? includedSections
        : DEFAULT_SECTIONS_BY_TYPE[report.meta.reportType]
    );
    s.add("methodology");
    return s;
  }, [includedSections, report.meta.reportType]);

  const pages = useMemo<ReportPageSlot[]>(() => {
    const list: ReportPageSlot[] = [];
    const kickerMap: Record<StructuredReportPayload["meta"]["reportType"], string> = {
      executive: "Executive Health Program Brief",
      project: "Health Program Report",
      camp: "Health Camp Operations Report",
      wellness: "Wellness Program Report",
      "custom-project": "Custom Health Program Report",
    };

    const hasCover = sections.has("cover");
    let secNum = 1;
    const nextNum = () => secNum++;

    // Page 1: Cover Page (optional for compact 1-page summaries)
    if (hasCover) {
      const locationText =
        report.programInfo.campLocation ||
        (report.programInfo.regions.length > 0
          ? report.programInfo.regions.slice(0, 3).join(", ")
          : null);

      list.push({
        id: "cover",
        label: "Cover Page",
        isCover: true,
        content: (
          <div className="relative flex h-full min-h-[1040px] flex-col justify-between bg-white pl-7">
            {/* Editorial left spine */}
            <div className="absolute inset-y-0 left-0 flex">
              <div className="w-[14px] bg-[#084C53]" />
              <div className="w-[4px] bg-[#106D75]" />
            </div>

            {/* Clean white top band so official AfyaCheck logo integrates seamlessly */}
            <div className="mx-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white pb-6 pt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="AfyaCheck"
                className="h-10 w-auto object-contain"
              />
              <div className="text-right text-[11px] text-[#667085] tabular-nums">
                <div className="font-semibold text-[#344054]">
                  Ref: {report.meta.reportRef}
                </div>
                <div>{formatReportDate(report.meta.generatedAt)}</div>
              </div>
            </div>

            {/* Center title composition */}
            <div className="px-10 py-12">
              <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#106D75]">
                {kickerMap[report.meta.reportType]}
              </div>
              <h1 className="mt-3 text-[34px] font-bold leading-[1.15] tracking-tight text-[#101828]">
                {report.meta.title}
              </h1>
              <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-[#344054]">
                {report.meta.subtitle}
              </p>
              <div className="mt-7 h-[3px] w-24 bg-[#106D75]" />

              <div className="mt-10 rounded-lg border border-[#E2E8F0] bg-[#F5F7F9] px-6 py-5">
                <dl className="divide-y divide-[#E2E8F0] text-[12px]">
                  {[
                    ["Program / Project", report.programInfo.projectName],
                    ["Camp / Site Scope", report.programInfo.campName],
                    ...(locationText ? [["Location / Region", locationText]] : []),
                    ["Reporting Period", report.meta.periodLabel],
                    ["Date Generated", formatReportDateTime(report.meta.generatedAt)],
                    ["Prepared By", report.meta.generatedBy],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[170px_1fr] py-2.5">
                      <dt className="text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
                        {k}
                      </dt>
                      <dd className="font-medium text-[#101828]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Cover footer */}
            <div className="mx-10 border-t border-[#E2E8F0] pb-10 pt-4">
              <div className="text-[10.5px] font-bold tracking-wide text-[#084C53]">
                {report.meta.confidentiality}
              </div>
              <div className="mt-1 text-[10.5px] text-[#667085]">
                Prepared using AfyaCheck Healthcare Operations Platform · Verified full-dataset reporting
              </div>
            </div>
          </div>
        ),
      });
    }

    // Executive Summary & Program Information Page
    if (sections.has("executiveSummary") || sections.has("programInfo")) {
      const execSec = sections.has("executiveSummary") ? nextNum() : 0;
      const progSec = sections.has("programInfo") ? nextNum() : 0;

      list.push({
        id: "overview",
        label: "Executive Overview",
        content: (
          <div className="space-y-6">
            {!hasCover && (
              <div className="border-b border-[#E2E8F0] pb-4">
                <div className="mb-3 h-[4px] w-full bg-[#084C53]" />
                <div className="flex items-start justify-between gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="AfyaCheck"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="text-right text-[10px]">
                    <div className="font-bold uppercase tracking-wider text-[#106D75]">
                      {kickerMap[report.meta.reportType]}
                    </div>
                    <div className="text-[#667085] tabular-nums">
                      Ref: {report.meta.reportRef} · {report.meta.periodLabel}
                    </div>
                  </div>
                </div>
                <h1 className="mt-3 text-[21px] font-bold tracking-tight text-[#101828]">
                  {report.meta.title}
                </h1>
                <p className="mt-1 text-[11.5px] text-[#667085]">
                  {report.meta.subtitle}
                </p>
              </div>
            )}

            {report.meta.smallSampleWarning && (
              <div className="rounded border border-[#FDE68A] border-l-4 border-l-[#B45309] bg-[#FFFBEB] px-4 py-3 text-[11px] text-[#344054]">
                <div className="font-bold text-[#B45309]">
                  Small-Sample Privacy & Interpretation Notice
                </div>
                <p className="mt-0.5">
                  Fewer than {report.meta.smallSampleThreshold} records matched the active filters.
                  Interpret percentages cautiously and review privacy policy before external sharing.
                </p>
              </div>
            )}

            {sections.has("executiveSummary") && (
              <div>
                <EditorialSectionHeader
                  index={execSec}
                  title="Executive Summary"
                  description="Verified key performance indicators and factual program observations derived from full-dataset server aggregations."
                />
                <div className="grid grid-cols-3 gap-3">
                  {report.kpis.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="overflow-hidden rounded border border-[#E2E8F0] bg-white"
                    >
                      <div className="h-[3px] w-full bg-[#106D75]" />
                      <div className="p-3">
                        <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                          {kpi.label}
                        </div>
                        <div className="mt-1.5 text-[20px] font-bold tracking-tight text-[#101828] tabular-nums">
                          {kpi.formattedValue}
                        </div>
                        {(kpi.sublabel || kpi.denominator) && (
                          <div className="mt-1 text-[10px] text-[#667085]">
                            {kpi.sublabel || kpi.denominator}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {report.executiveNarrative.length > 0 && (
                  <ul className="mt-4 space-y-2 text-[11.5px] leading-relaxed text-[#344054]">
                    {report.executiveNarrative.map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#106D75]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {sections.has("programInfo") && (
              <div>
                <EditorialSectionHeader
                  index={progSec}
                  title="Program & Reporting Scope"
                  description="Structured context, geographic coverage, and applied query parameters."
                />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded border border-[#E2E8F0] bg-[#F5F7F9] p-4 text-[11px]">
                  {[
                    ["Project / Program", report.programInfo.projectName],
                    ["Program Type", report.programInfo.programType],
                    ["Camp / Site Scope", report.programInfo.campName],
                    [
                      "Participating Sites",
                      `${report.programInfo.campCount} (${report.programInfo.activeCampCount} active)`,
                    ],
                    ["Reporting Period", report.programInfo.reportingPeriod],
                    ["Report Reference", report.meta.reportRef],
                    [
                      "Regions Covered",
                      report.programInfo.regions.length > 0
                        ? report.programInfo.regions.slice(0, 4).join(", ")
                        : report.programInfo.campLocation || "—",
                    ],
                    ["Generated On", formatReportDateTime(report.meta.generatedAt)],
                    ...(report.programInfo.schemaName
                      ? [
                          [
                            "Active Form Schema",
                            `${report.programInfo.schemaName} (v${report.programInfo.schemaVersion ?? 1})`,
                          ],
                        ]
                      : []),
                    ["Applied Filters", report.methodology.appliedFiltersSummary],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                        {k}
                      </div>
                      <div className="mt-0.5 font-medium text-[#101828]">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      });
    }

    // Demographics Page
    if (sections.has("demographics") && report.demographics) {
      const demo = report.demographics;
      const demoSec = nextNum();
      list.push({
        id: "demographics",
        label: "Demographics",
        content: (
          <div className="space-y-4">
            <EditorialSectionHeader
              index={demoSec}
              title="Demographic Analysis"
              description={`Population profile across n = ${demo.totalRegistered.toLocaleString()} registered participants. Unknown and unrecorded categories are explicitly retained.`}
            />
            <div className="grid grid-cols-2 gap-3.5">
              <ReportDonutSvg
                title="Gender Distribution"
                subtitle={`n = ${demo.totalRegistered.toLocaleString()} participants`}
                items={demo.gender}
              />
              <ReportDonutSvg
                title="Health Insurance Coverage"
                subtitle={`n = ${demo.totalRegistered.toLocaleString()} participants`}
                items={demo.insurance}
              />
            </div>

            <ReportHorizontalBarSvg
              title="Age-Group Distribution"
              subtitle={`Approved AfyaCheck age brackets (n = ${demo.totalRegistered.toLocaleString()} registered participants)`}
              items={demo.ageGroups}
            />

            {demo.attendanceTrend.length >= 2 && (
              <ReportLineTrendSvg
                title="Participation & Clinical Encounter Trend"
                subtitle={`Daily volume across reporting period (${report.meta.periodLabel})`}
                primaryLabel="Registrations"
                secondaryLabel="Clinical Encounters"
                points={demo.attendanceTrend.map((t) => ({
                  label: t.date.slice(5),
                  primary: t.registrations,
                  secondary: t.encounters,
                }))}
              />
            )}

            {sections.has("dataTables") && demo.regions.length > 0 && (
              <EditorialTable
                title="Geographic Coverage Distribution"
                subtitle={`Registered participants by recorded region/location (n = ${demo.totalRegistered.toLocaleString()})`}
                headers={["Region / Location", "Participants", "Share (%)"]}
                numericColumns={[1, 2]}
                boldLastRow
                rows={[
                  ...demo.regions.map((r) => [
                    r.label,
                    r.count.toLocaleString(),
                    formatRateOrNA(r.percentage),
                  ]),
                  [
                    "Total",
                    demo.totalRegistered.toLocaleString(),
                    demo.totalRegistered > 0 ? "100.0%" : "N/A",
                  ],
                ]}
              />
            )}
          </div>
        ),
      });
    }

    // Clinical Screening Page
    if (sections.has("clinicalScreening") && report.clinicalScreening) {
      const clin = report.clinicalScreening;
      const clinSec = nextNum();
      list.push({
        id: "clinical",
        label: "Clinical Screening",
        content: (
          <div className="space-y-4">
            <EditorialSectionHeader
              index={clinSec}
              title="Clinical Screening & Findings Analysis"
              description={`Summary of ${clin.encountersTotal.toLocaleString()} recorded encounters. Screening performed, not-performed, recorded findings, and explicit referrals are distinguished cleanly.`}
            />

            <ReportStackedBarSvg
              title="Clinical Encounter Completion Status"
              subtitle={`Denominator: ${clin.encountersTotal.toLocaleString()} recorded encounters`}
              segments={[
                {
                  label: "Completed",
                  count: clin.encountersCompleted,
                  color: REPORT_COLORS.deepTeal,
                },
                {
                  label: "Pending Review",
                  count: clin.encountersPending,
                  color: "#94A3B8",
                },
              ]}
            />

            {clin.domains.length > 0 ? (
              <EditorialTable
                title="Clinical Screening Activity by Active Domain"
                subtitle="Finding rate denominator equals assessments performed in that specific domain (excludes not-performed entries)."
                headers={[
                  "Domain",
                  "Assessment",
                  "Performed",
                  "Not Perf.",
                  "Normal / Neg",
                  "Finding",
                  "Rate",
                  "Referrals",
                ]}
                numericColumns={[2, 3, 4, 5, 6, 7]}
                rows={clin.domains.map((d) => [
                  d.domain,
                  d.indicator,
                  d.performedCount.toLocaleString(),
                  d.notPerformedCount.toLocaleString(),
                  d.normalOrNegativeCount.toLocaleString(),
                  d.abnormalOrReactiveCount.toLocaleString(),
                  formatRateOrNA(d.findingRate),
                  d.referralCount > 0 ? d.referralCount.toLocaleString() : "—",
                ])}
              />
            ) : (
              <div className="rounded border border-[#E2E8F0] bg-[#F4F9FA] px-4 py-3 text-[11px] text-[#344054]">
                No specialized infectious, cancer, specialty, or radiology screening entries were
                recorded in the selected scope and date window.
              </div>
            )}

            {sections.has("dataTables") && (
              <EditorialTable
                title="Vital Signs & Anthropometric Capture Completeness"
                subtitle={`Recorded measurements with standard clinical units across ${clin.encountersTotal.toLocaleString()} encounters`}
                headers={[
                  "Measurement",
                  "Unit",
                  "Recorded",
                  "Missing",
                  "Completeness",
                  "Mean Value",
                ]}
                numericColumns={[2, 3, 4, 5]}
                rows={clin.vitalsCompleteness.map((v) => [
                  v.metric,
                  v.unit,
                  v.recordedCount.toLocaleString(),
                  v.missingCount.toLocaleString(),
                  formatRateOrNA(v.completenessRate),
                  v.meanValue !== undefined && v.meanValue !== null
                    ? `${v.meanValue} ${v.unit}`
                    : "—",
                ])}
              />
            )}
          </div>
        ),
      });
    }

    // Camp Comparisons Page
    if (
      sections.has("campComparisons") &&
      report.campComparisons &&
      report.campComparisons.length > 1
    ) {
      const campSec = nextNum();
      list.push({
        id: "camps",
        label: "Camp Comparison",
        content: (
          <div className="space-y-4">
            <EditorialSectionHeader
              index={campSec}
              title="Participating Camp Comparison"
              description={`Side-by-side operational comparison across ${report.campComparisons.length} participating camps.`}
            />
            <ReportGroupedBarSvg
              title="Registered Participants vs. Completed Clinical Encounters by Camp"
              subtitle="Top camps ordered by registration volume"
              seriesALabel="Registered Participants"
              seriesBLabel="Completed Encounters"
              groups={report.campComparisons.slice(0, 7).map((c) => ({
                label: c.campName,
                valueA: c.registered,
                valueB: c.completed,
              }))}
            />
            <EditorialTable
              title="Camp Performance Table"
              headers={[
                "Camp Name",
                "Location",
                "Registered",
                "Encounters",
                "Completed",
                "Completion",
                "Referrals",
              ]}
              numericColumns={[2, 3, 4, 5, 6]}
              boldLastRow
              rows={[
                ...report.campComparisons.map((c) => [
                  c.campName,
                  c.location || "—",
                  c.registered.toLocaleString(),
                  c.encounters.toLocaleString(),
                  c.completed.toLocaleString(),
                  formatRateOrNA(c.completionRate),
                  c.referrals.toLocaleString(),
                ]),
                [
                  "Total / Combined",
                  `${report.campComparisons.length} sites`,
                  report.campComparisons
                    .reduce((s, c) => s + c.registered, 0)
                    .toLocaleString(),
                  report.campComparisons
                    .reduce((s, c) => s + c.encounters, 0)
                    .toLocaleString(),
                  report.campComparisons
                    .reduce((s, c) => s + c.completed, 0)
                    .toLocaleString(),
                  "—",
                  report.campComparisons
                    .reduce((s, c) => s + c.referrals, 0)
                    .toLocaleString(),
                ],
              ]}
            />
          </div>
        ),
      });
    }

    // Wellness Page
    if (sections.has("wellnessAnalysis") && report.wellness) {
      const w = report.wellness;
      const wSec = nextNum();
      list.push({
        id: "wellness",
        label: "Wellness Analysis",
        content: (
          <div className="space-y-4">
            <EditorialSectionHeader
              index={wSec}
              title="Wellness Indicator Analysis"
              description={`Score distribution and respondent demographics across ${w.totalAssessments.toLocaleString()} completed assessments.`}
            />
            <div className="rounded border border-[#FDE68A] border-l-4 border-l-[#B45309] bg-[#FFFBEB] px-4 py-3 text-[11px] text-[#344054]">
              <div className="font-bold text-[#B45309]">
                Clinical Governance — Non-Diagnostic Indicator Scale
              </div>
              <p className="mt-0.5">{w.interpretationGuidance}</p>
            </div>
            <ReportHorizontalBarSvg
              title="Wellness Screening Indicator Band Distribution"
              subtitle={`n = ${w.totalAssessments.toLocaleString()} assessments (Mean ${w.avgScore}, Median ${w.medianScore}, Range ${w.minScore}–${w.maxScore})`}
              items={w.scoreBands.map((b) => ({
                label: `${b.band} (${b.range})`,
                count: b.count,
                percentage: b.percentage,
              }))}
            />
            <div className="grid grid-cols-2 gap-3.5">
              <ReportDonutSvg
                title="Respondent Gender"
                subtitle={`n = ${w.totalAssessments.toLocaleString()} assessments`}
                items={w.demographics.gender}
              />
              <ReportHorizontalBarSvg
                title="Respondent Age Groups"
                subtitle={`n = ${w.totalAssessments.toLocaleString()} assessments`}
                items={w.demographics.ageGroups}
              />
            </div>
            <EditorialTable
              title="Indicator Band Breakdown & Approved Follow-Up Guidance"
              headers={["Indicator Band", "Score Range", "Count", "Share (%)", "Program Guidance"]}
              numericColumns={[2, 3]}
              rows={w.scoreBands.map((b) => [
                b.band,
                b.range,
                b.count.toLocaleString(),
                formatRateOrNA(b.percentage),
                b.interpretationNote,
              ])}
            />
          </div>
        ),
      });
    }

    // Custom Project Form Analysis Page (Zero hardcoded clinical sections)
    if (sections.has("customFormAnalysis") && report.customProject) {
      const cf = report.customProject;
      const cfSec = nextNum();
      list.push({
        id: "custom-form",
        label: "Custom Form Analysis",
        content: (
          <div className="space-y-4">
            <EditorialSectionHeader
              index={cfSec}
              title={`Custom Form Analysis — ${cf.schemaName} (v${cf.schemaVersion})`}
              description={cf.versionNote}
            />
            <ReportStackedBarSvg
              title="Form Submission Workflow Status"
              subtitle={`Total version-aligned submissions: n = ${cf.totalSubmissions.toLocaleString()}`}
              segments={[
                { label: "Approved", count: cf.statusBreakdown.approved, color: REPORT_COLORS.deepTeal },
                { label: "Submitted", count: cf.statusBreakdown.submitted, color: REPORT_COLORS.primaryTeal },
                { label: "Draft", count: cf.statusBreakdown.draft, color: "#94A3B8" },
                { label: "Rejected", count: cf.statusBreakdown.rejected, color: REPORT_COLORS.critical },
              ]}
            />
            <div className="space-y-3.5">
              {cf.fields.map((field) => {
                if (field.distribution && Object.keys(field.distribution).length > 0) {
                  const denom = field.isMultipleResponse
                    ? Math.max(1, field.totalResponses)
                    : Math.max(1, cf.totalSubmissions);
                  const distItems = Object.entries(field.distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([label, count]) => ({
                      label,
                      count,
                      percentage: Number(((count / denom) * 100).toFixed(1)),
                    }));
                  if (!field.isMultipleResponse && field.missingCount > 0) {
                    distItems.push({
                      label: "Unrecorded / Missing",
                      count: field.missingCount,
                      percentage: Number(((field.missingCount / denom) * 100).toFixed(1)),
                    });
                  }
                  return (
                    <ReportHorizontalBarSvg
                      key={field.fieldName}
                      title={`${field.label} (${field.type})`}
                      subtitle={field.denominatorLabel}
                      items={distItems}
                    />
                  );
                }
                if (field.numericSummary) {
                  return (
                    <EditorialTable
                      key={field.fieldName}
                      title={`${field.label} — Numeric Summary`}
                      subtitle={`Valid responses: ${field.numericSummary.count} · Missing: ${field.missingCount} · Completeness: ${field.completionRate}%`}
                      headers={["Minimum", "Maximum", "Mean", "Median", "Valid Count"]}
                      numericColumns={[0, 1, 2, 3, 4]}
                      rows={[
                        [
                          field.numericSummary.min,
                          field.numericSummary.max,
                          field.numericSummary.avg,
                          field.numericSummary.median ?? "—",
                          field.numericSummary.count.toLocaleString(),
                        ],
                      ]}
                    />
                  );
                }
                return null;
              })}
            </div>
            {sections.has("dataTables") && cf.fields.length > 0 && (
              <EditorialTable
                title="Form Field Completeness & Missing-Data Audit"
                subtitle={`Schema ${cf.schemaName} (v${cf.schemaVersion}) · Free-text responses excluded by default for privacy.`}
                headers={["Field Label", "Type", "Required", "Responses", "Missing", "Completeness", "Privacy / Summary"]}
                numericColumns={[3, 4, 5]}
                rows={cf.fields.map((f) => [
                  f.label,
                  f.type,
                  f.required ? "Yes" : "No",
                  f.totalResponses.toLocaleString(),
                  f.missingCount.toLocaleString(),
                  formatRateOrNA(f.completionRate),
                  f.redactedFreeText
                    ? "Withheld (free-text)"
                    : f.numericSummary
                    ? `Mean ${f.numericSummary.avg}`
                    : f.distribution
                    ? `${Object.keys(f.distribution).length} options`
                    : "—",
                ])}
              />
            )}
          </div>
        ),
      });
    }

    // Mandatory Methodology & Governance Page
    const methSec = nextNum();
    list.push({
      id: "methodology",
      label: "Methodology & Governance",
      content: (
        <div className="space-y-4">
          <EditorialSectionHeader
            index={methSec}
            title="Methodology, Definitions & Governance"
            description="Authoritative data source notes, standardized indicator definitions, missing-data policy, and confidentiality classification."
          />

          <div className="grid grid-cols-2 gap-4 rounded border border-[#E2E8F0] bg-[#F5F7F9] p-4 text-[11px]">
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                Data Source
              </div>
              <div className="mt-0.5 text-[#101828]">{report.methodology.dataSource}</div>
            </div>
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                Reporting Period
              </div>
              <div className="mt-0.5 text-[#101828]">{report.methodology.reportingPeriod}</div>
            </div>
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                Applied Filters
              </div>
              <div className="mt-0.5 text-[#101828]">
                {report.methodology.appliedFiltersSummary}
              </div>
            </div>
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
                Missing-Data Policy
              </div>
              <div className="mt-0.5 text-[#101828]">
                {report.methodology.missingDataHandling}
              </div>
            </div>
          </div>

          <EditorialTable
            title="Standardized Metric Definitions"
            headers={["Indicator / Term", "Documented Definition"]}
            rows={report.methodology.metricDefinitions.map((m) => [
              m.term,
              m.definition,
            ])}
          />

          {report.methodology.limitations.length > 0 && (
            <div className="space-y-1.5 text-[11px] text-[#344054]">
              <div className="text-[11px] font-semibold text-[#101828]">
                Notes & Limitations
              </div>
              <ul className="space-y-1.5">
                {report.methodology.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#667085]" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded border border-[#E2E8F0] border-l-4 border-l-[#106D75] bg-[#F4F9FA] px-4 py-3 text-[11px] text-[#344054]">
            <div className="font-bold text-[#084C53]">
              Confidentiality & Data Protection Notice
            </div>
            <p className="mt-0.5">{report.methodology.confidentialityNotice}</p>
          </div>
        </div>
      ),
    });

    return list;
  }, [report, sections]);

  React.useEffect(() => {
    onPagesComputed?.(pages.length);
  }, [pages.length, onPagesComputed]);

  const visiblePages =
    activePageIndex !== undefined && activePageIndex !== null
      ? [pages[Math.min(activePageIndex, pages.length - 1)]].filter(Boolean)
      : pages;

  const scale = zoom / 100;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {visiblePages.map((page) => {
        const pageNum = pages.findIndex((p) => p.id === page.id) + 1;
        return (
          <div
            key={page.id}
            style={{
              width: `${Math.round(794 * scale)}px`,
            }}
            className="transition-[width] duration-150"
          >
            <div
              style={{
                width: "794px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="overflow-hidden rounded-[4px] border border-[#D0D5DD] bg-white text-[#101828] shadow-[0_6px_28px_rgba(16,24,40,0.08)]"
            >
              {page.isCover ? (
                page.content
              ) : (
                <div className="flex min-h-[1040px] flex-col justify-between px-12 py-8">
                  {/* Interior Running Header */}
                  <div>
                    <div className="mb-6 flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-[10px]">
                      <div>
                        <span className="font-bold tracking-wider text-[#084C53]">
                          AFYACHECK
                        </span>
                        <span className="mx-2 text-[#CBD5E1]">|</span>
                        <span className="text-[#667085]">{report.meta.title}</span>
                      </div>
                      <div className="text-[#667085] tabular-nums">
                        {report.meta.reportRef} · {report.meta.periodLabel}
                      </div>
                    </div>

                    {page.content}
                  </div>

                  {/* Interior Running Footer */}
                  <div className="mt-8 flex items-center justify-between border-t border-[#E2E8F0] pt-2.5 text-[10px]">
                    <span className="text-[#667085]">
                      {report.meta.confidentiality}
                    </span>
                    <span className="font-semibold text-[#344054] tabular-nums">
                      Page {pageNum} of {pages.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
