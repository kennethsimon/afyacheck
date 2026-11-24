import {
  formatReportDateTime,
  REPORT_COLORS,
  safeFilenameSlug,
  sanitizeSpreadsheetValue,
} from "./tokens";
import type { StructuredReportPayload } from "./types";

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: unknown): string {
  const safe = sanitizeSpreadsheetValue(value);
  return `"${String(safe).replace(/"/g, '""')}"`;
}

/**
 * Machine-readable RFC-4180 CSV export using the exact backend StructuredReportPayload
 * and formula-injection protection. Zero decorative formatting.
 */
export function buildReportCsvContent(report: StructuredReportPayload): string {
  const rows: Array<Array<string | number>> = [
    ["Section", "Category", "Indicator", "Value", "Denominator / Context", "Rate / Notes"],
  ];

  for (const kpi of report.kpis) {
    rows.push([
      "Executive KPI",
      report.meta.reportType,
      kpi.label,
      kpi.value,
      kpi.denominator || "",
      kpi.sublabel || "",
    ]);
  }

  if (report.demographics) {
    const total = report.demographics.totalRegistered;
    for (const b of report.demographics.gender) {
      rows.push(["Demographics", "Gender", b.label, b.count, total, `${b.percentage}%`]);
    }
    for (const b of report.demographics.ageGroups) {
      rows.push(["Demographics", "Age Group", b.label, b.count, total, `${b.percentage}%`]);
    }
    for (const b of report.demographics.insurance) {
      rows.push(["Demographics", "Insurance", b.label, b.count, total, `${b.percentage}%`]);
    }
    for (const b of report.demographics.regions) {
      rows.push(["Demographics", "Geographic Region", b.label, b.count, total, `${b.percentage}%`]);
    }
  }

  if (report.clinicalScreening) {
    for (const v of report.clinicalScreening.vitalsCompleteness) {
      rows.push([
        "Clinical Vitals",
        v.metric,
        `Recorded (${v.unit})`,
        v.recordedCount,
        v.recordedCount + v.missingCount,
        `${v.completenessRate}%`,
      ]);
    }
    for (const d of report.clinicalScreening.domains) {
      rows.push([
        "Clinical Screening",
        d.domain,
        `${d.indicator} — Performed`,
        d.performedCount,
        report.clinicalScreening.encountersTotal,
        `${d.findingLabel}: ${d.abnormalOrReactiveCount} (${d.findingRate}%)`,
      ]);
      if (d.referralCount > 0) {
        rows.push([
          "Clinical Screening",
          d.domain,
          `${d.indicator} — Recorded Referrals`,
          d.referralCount,
          d.performedCount,
          "Explicit documented referrals",
        ]);
      }
    }
  }

  if (report.campComparisons && report.campComparisons.length > 0) {
    for (const c of report.campComparisons) {
      rows.push([
        "Camp Comparison",
        c.projectName,
        c.campName,
        c.registered,
        `Encounters: ${c.encounters}; Completed: ${c.completed}`,
        `Completion ${c.completionRate}%; Referrals: ${c.referrals}`,
      ]);
    }
  }

  if (report.wellness) {
    for (const band of report.wellness.scoreBands) {
      rows.push([
        "Wellness Screening",
        band.range,
        band.band,
        band.count,
        report.wellness.totalAssessments,
        `${band.percentage}%`,
      ]);
    }
  }

  if (report.customProject) {
    for (const f of report.customProject.fields) {
      rows.push([
        "Custom Form",
        f.type,
        f.label,
        f.totalResponses,
        f.totalResponses + f.missingCount,
        `${f.completionRate}% completeness`,
      ]);
      if (f.distribution) {
        const denom = f.isMultipleResponse
          ? f.totalResponses
          : report.customProject.totalSubmissions;
        for (const [opt, cnt] of Object.entries(f.distribution)) {
          const pct = denom > 0 ? `${((cnt / denom) * 100).toFixed(1)}%` : "0.0%";
          rows.push(["Custom Form Distribution", f.label, opt, cnt, denom, pct]);
        }
      }
      if (f.numericSummary) {
        rows.push([
          "Custom Form Numeric",
          f.label,
          "Mean",
          f.numericSummary.avg,
          `n=${f.numericSummary.count}`,
          `Median ${f.numericSummary.median ?? "—"}; Min ${f.numericSummary.min}; Max ${f.numericSummary.max}`,
        ]);
      }
    }
  }

  return rows.map((r) => r.map(escapeCsvCell).join(",")).join("\n");
}

export function downloadReportCsv(report: StructuredReportPayload): void {
  const csv = buildReportCsvContent(report);
  const slug = safeFilenameSlug(report.programInfo.projectName);
  const datePart = report.meta.generatedAt.slice(0, 10);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerBrowserDownload(
    blob,
    `afyacheck-${report.meta.reportType}-${slug}-${datePart}.csv`
  );
}

/**
 * Generates a professionally formatted multi-worksheet Excel workbook (.xlsx)
 * with frozen headers, styled column headings, explicit column widths, numeric formatting,
 * and spreadsheet formula-injection neutralization.
 */
export async function buildReportXlsxBuffer(
  report: StructuredReportPayload
): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AfyaCheck Health Platform";
  workbook.created = new Date(report.meta.generatedAt);

  const headerFill = {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF106D75" },
  };
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
  const titleFont = { bold: true, color: { argb: "FF101828" }, size: 14, name: "Calibri" };
  const subFont = { italic: true, color: { argb: "FF667085" }, size: 10, name: "Calibri" };
  const bodyBorder = {
    bottom: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
  };

  const styleTableHeader = (ws: any, rowIndex: number) => {
    const row = ws.getRow(rowIndex);
    row.height = 24;
    row.eachCell((cell: any) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: "middle", horizontal: cell.col > 2 ? "right" : "left" };
    });
    ws.views = [{ state: "frozen", ySplit: rowIndex }];
  };

  // 1. Summary Sheet
  const summaryWs = workbook.addWorksheet("Executive Summary");
  summaryWs.columns = [
    { width: 28 },
    { width: 24 },
    { width: 34 },
    { width: 52 },
  ];
  summaryWs.addRow([sanitizeSpreadsheetValue(`AfyaCheck — ${report.meta.title}`)]);
  summaryWs.getRow(1).font = titleFont;
  summaryWs.addRow([
    sanitizeSpreadsheetValue(
      `${report.meta.confidentiality} | Ref: ${report.meta.reportRef}`
    ),
  ]);
  summaryWs.getRow(2).font = subFont;
  summaryWs.addRow([]);

  const metaRows = [
    ["Program / Project", report.programInfo.projectName],
    ["Camp / Scope", report.programInfo.campName],
    ["Reporting Period", report.meta.periodLabel],
    ["Generated At", formatReportDateTime(report.meta.generatedAt)],
    ["Generated By", report.meta.generatedBy],
    ["Applied Filters", report.methodology.appliedFiltersSummary],
  ];
  metaRows.forEach(([k, v]) => {
    const r = summaryWs.addRow([sanitizeSpreadsheetValue(k), sanitizeSpreadsheetValue(v)]);
    r.getCell(1).font = { bold: true, color: { argb: "FF344054" }, size: 10 };
  });

  summaryWs.addRow([]);
  const kpiHeaderRowIdx = summaryWs.rowCount + 1;
  summaryWs.addRow(["Indicator", "Value", "Context / Denominator", "Metric Definition"]);
  styleTableHeader(summaryWs, kpiHeaderRowIdx);

  report.kpis.forEach((kpi) => {
    const r = summaryWs.addRow([
      sanitizeSpreadsheetValue(kpi.label),
      sanitizeSpreadsheetValue(kpi.formattedValue),
      sanitizeSpreadsheetValue(kpi.sublabel || kpi.denominator || ""),
      sanitizeSpreadsheetValue(kpi.definition),
    ]);
    r.eachCell((c: any) => {
      c.border = bodyBorder;
      c.alignment = { vertical: "top", wrapText: true };
    });
    r.getCell(2).alignment = { horizontal: "right", vertical: "top" };
  });

  // 2. Demographics Sheet
  if (report.demographics) {
    const demoWs = workbook.addWorksheet("Demographics");
    demoWs.columns = [
      { width: 24 },
      { width: 30 },
      { width: 16 },
      { width: 16 },
    ];
    demoWs.addRow(["Dimension", "Category", "Count", "Share (%)"]);
    styleTableHeader(demoWs, 1);

    const groups: Array<[string, typeof report.demographics.gender]> = [
      ["Gender", report.demographics.gender],
      ["Age Group", report.demographics.ageGroups],
      ["Insurance Coverage", report.demographics.insurance],
      ["Geographic Region", report.demographics.regions],
    ];
    groups.forEach(([dim, buckets]) => {
      buckets.forEach((b) => {
        const r = demoWs.addRow([
          sanitizeSpreadsheetValue(dim),
          sanitizeSpreadsheetValue(b.label),
          b.count,
          Number((b.percentage / 100).toFixed(4)),
        ]);
        r.getCell(3).numFmt = "#,##0";
        r.getCell(4).numFmt = "0.0%";
        r.eachCell((c: any) => {
          c.border = bodyBorder;
        });
      });
    });
  }

  // 3. Clinical Screening Sheet
  if (report.clinicalScreening) {
    const clinWs = workbook.addWorksheet("Clinical Screening");
    clinWs.columns = [
      { width: 24 },
      { width: 28 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
      { width: 16 },
      { width: 16 },
      { width: 14 },
    ];
    clinWs.addRow([
      "Domain",
      "Assessment / Indicator",
      "Performed",
      "Not Performed",
      "Normal / Neg",
      "Finding Count",
      "Finding Rate",
      "Referrals",
    ]);
    styleTableHeader(clinWs, 1);

    report.clinicalScreening.domains.forEach((d) => {
      const r = clinWs.addRow([
        sanitizeSpreadsheetValue(d.domain),
        sanitizeSpreadsheetValue(d.indicator),
        d.performedCount,
        d.notPerformedCount,
        d.normalOrNegativeCount,
        d.abnormalOrReactiveCount,
        Number((d.findingRate / 100).toFixed(4)),
        d.referralCount,
      ]);
      [3, 4, 5, 6, 8].forEach((idx) => {
        r.getCell(idx).numFmt = "#,##0";
      });
      r.getCell(7).numFmt = "0.0%";
      r.eachCell((c: any) => {
        c.border = bodyBorder;
      });
    });
  }

  // 4. Camp Comparison Sheet
  if (report.campComparisons && report.campComparisons.length > 0) {
    const campWs = workbook.addWorksheet("Camp Comparison");
    campWs.columns = [
      { width: 28 },
      { width: 24 },
      { width: 18 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 14 },
    ];
    campWs.addRow([
      "Camp Name",
      "Project",
      "Location",
      "Registered",
      "Encounters",
      "Completed",
      "Completion Rate",
      "Referrals",
    ]);
    styleTableHeader(campWs, 1);

    report.campComparisons.forEach((c) => {
      const r = campWs.addRow([
        sanitizeSpreadsheetValue(c.campName),
        sanitizeSpreadsheetValue(c.projectName),
        sanitizeSpreadsheetValue(c.location),
        c.registered,
        c.encounters,
        c.completed,
        Number((c.completionRate / 100).toFixed(4)),
        c.referrals,
      ]);
      [4, 5, 6, 8].forEach((idx) => {
        r.getCell(idx).numFmt = "#,##0";
      });
      r.getCell(7).numFmt = "0.0%";
      r.eachCell((cell: any) => {
        cell.border = bodyBorder;
      });
    });
  }

  // 5. Wellness Sheet
  if (report.wellness) {
    const wellWs = workbook.addWorksheet("Wellness Analysis");
    wellWs.columns = [
      { width: 28 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 48 },
    ];
    wellWs.addRow(["Indicator Band", "Score Range", "Count", "Share (%)", "Guidance Note"]);
    styleTableHeader(wellWs, 1);
    report.wellness.scoreBands.forEach((b) => {
      const r = wellWs.addRow([
        sanitizeSpreadsheetValue(b.band),
        sanitizeSpreadsheetValue(b.range),
        b.count,
        Number((b.percentage / 100).toFixed(4)),
        sanitizeSpreadsheetValue(b.interpretationNote),
      ]);
      r.getCell(3).numFmt = "#,##0";
      r.getCell(4).numFmt = "0.0%";
      r.eachCell((cell: any) => {
        cell.border = bodyBorder;
      });
    });
  }

  // 6. Custom Form Analysis Sheet
  if (report.customProject) {
    const cfWs = workbook.addWorksheet("Custom Form Analysis");
    cfWs.columns = [
      { width: 28 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 42 },
    ];
    cfWs.addRow([
      "Field Label",
      "Type",
      "Responses",
      "Missing",
      "Completeness",
      "Distribution / Numeric Summary",
    ]);
    styleTableHeader(cfWs, 1);

    report.customProject.fields.forEach((f) => {
      let summaryText = f.redactedFreeText
        ? "Free-text withheld for privacy"
        : "—";
      if (f.numericSummary) {
        summaryText = `Mean ${f.numericSummary.avg} | Median ${f.numericSummary.median ?? "—"} | Min ${f.numericSummary.min} | Max ${f.numericSummary.max} (n=${f.numericSummary.count})`;
      } else if (f.distribution) {
        summaryText = Object.entries(f.distribution)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ");
      }
      const r = cfWs.addRow([
        sanitizeSpreadsheetValue(f.label),
        sanitizeSpreadsheetValue(f.type),
        f.totalResponses,
        f.missingCount,
        Number((f.completionRate / 100).toFixed(4)),
        sanitizeSpreadsheetValue(summaryText),
      ]);
      r.getCell(3).numFmt = "#,##0";
      r.getCell(4).numFmt = "#,##0";
      r.getCell(5).numFmt = "0.0%";
      r.eachCell((cell: any) => {
        cell.border = bodyBorder;
      });
    });
  }

  // 7. Methodology & Governance Sheet (always included)
  const methWs = workbook.addWorksheet("Methodology");
  methWs.columns = [{ width: 28 }, { width: 72 }];
  methWs.addRow(["Item", "Detail"]);
  styleTableHeader(methWs, 1);
  const methRows = [
    ["Confidentiality Notice", report.methodology.confidentialityNotice],
    ["Data Source", report.methodology.dataSource],
    ["Reporting Period", report.methodology.reportingPeriod],
    ["Applied Filters", report.methodology.appliedFiltersSummary],
    ["Missing-Data Policy", report.methodology.missingDataHandling],
    ...report.methodology.metricDefinitions.map((m) => [m.term, m.definition]),
    ...report.methodology.limitations.map((l, i) => [`Limitation ${i + 1}`, l]),
  ];
  methRows.forEach(([k, v]) => {
    const r = methWs.addRow([sanitizeSpreadsheetValue(k), sanitizeSpreadsheetValue(v)]);
    r.eachCell((c: any) => {
      c.border = bodyBorder;
      c.alignment = { vertical: "top", wrapText: true };
    });
  });

  // Unused color reference check keep TS strict happy
  void REPORT_COLORS;
  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

export async function downloadReportXlsx(
  report: StructuredReportPayload
): Promise<void> {
  const buffer = await buildReportXlsxBuffer(report);
  const slug = safeFilenameSlug(report.programInfo.projectName);
  const datePart = report.meta.generatedAt.slice(0, 10);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBrowserDownload(
    blob,
    `afyacheck-${report.meta.reportType}-${slug}-${datePart}.xlsx`
  );
}
