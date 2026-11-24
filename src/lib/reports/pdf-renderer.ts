import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  drawDonutChart,
  drawGroupedBarChart,
  drawHorizontalBarChart,
  drawLineTrendChart,
  drawStackedCompositionBar,
} from "./pdf-charts";
import {
  formatCount,
  formatRateOrNA,
  formatReportDate,
  formatReportDateTime,
  REPORT_PAGE,
  REPORT_RGB,
  safeFilenameSlug,
} from "./tokens";
import {
  DEFAULT_SECTIONS_BY_TYPE,
  type PatientClinicalReportPayload,
  type ReportSectionKey,
  type StructuredReportPayload,
} from "./types";

export interface PdfRenderOptions {
  includedSections?: ReportSectionKey[];
  /** Optional base64 PNG data URI for official AfyaCheck logo (auto-loaded in browser if omitted). */
  logoDataUri?: string | null;
}

let cachedBrowserLogo: string | null | undefined = undefined;

async function resolveBrowserLogo(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (cachedBrowserLogo !== undefined) return cachedBrowserLogo;
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) {
      cachedBrowserLogo = null;
      return null;
    }
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    cachedBrowserLogo = dataUrl;
    return dataUrl;
  } catch {
    cachedBrowserLogo = null;
    return null;
  }
}

class EditorialPdfBuilder {
  doc: jsPDF;
  y: number;
  hasCoverPage: boolean;
  private title: string;
  private reportRef: string;
  private periodLabel: string;
  private confidentiality: string;
  private logoDataUri: string | null;

  constructor(meta: {
    title: string;
    reportRef: string;
    periodLabel: string;
    confidentiality: string;
    logoDataUri: string | null;
    hasCoverPage: boolean;
  }) {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.title = meta.title;
    this.reportRef = meta.reportRef;
    this.periodLabel = meta.periodLabel;
    this.confidentiality = meta.confidentiality;
    this.logoDataUri = meta.logoDataUri;
    this.hasCoverPage = meta.hasCoverPage;
    this.y = REPORT_PAGE.marginTop;
  }

  ensureSpace(neededMm: number) {
    if (this.y + neededMm > REPORT_PAGE.heightMm - REPORT_PAGE.marginBottom) {
      this.doc.addPage();
      this.y = REPORT_PAGE.marginTop;
    }
  }

  addPageBreak() {
    this.doc.addPage();
    this.y = REPORT_PAGE.marginTop;
  }

  /**
   * Restrained WHO/UNICEF/Stripe editorial cover page — crisp white paper,
   * deep teal spine rule, official AfyaCheck logo, generous white space.
   */
  renderCoverPage(opts: {
    kicker: string;
    title: string;
    subtitle: string;
    organizationOrProject: string;
    campOrScope?: string;
    location?: string | null;
    periodLabel: string;
    generatedAt: string;
    generatedBy: string;
    reportRef: string;
    confidentiality: string;
  }) {
    const { doc } = this;
    const { widthMm, heightMm, marginX } = REPORT_PAGE;

    // Subtle deep-teal editorial spine bar on left edge
    doc.setFillColor(...REPORT_RGB.deepTeal);
    doc.rect(0, 0, 5, heightMm, "F");
    doc.setFillColor(...REPORT_RGB.primaryTeal);
    doc.rect(5, 0, 1.5, heightMm, "F");

    // Clean white editorial header band so the official AfyaCheck logo blends seamlessly
    doc.setFillColor(...REPORT_RGB.white);
    doc.rect(6.5, 0, widthMm - 6.5, 52, "F");
    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.3);
    doc.line(marginX + 2, 50, widthMm - marginX, 50);

    // Official AfyaCheck logo
    if (this.logoDataUri) {
      doc.addImage(this.logoDataUri, "PNG", marginX + 2, 18, 46, 13.5);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...REPORT_RGB.deepTeal);
      doc.text("AfyaCheck", marginX + 2, 27);
    }

    // Reference pill top-right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(`Ref: ${opts.reportRef}`, widthMm - marginX, 23, { align: "right" });
    doc.text(formatReportDate(opts.generatedAt), widthMm - marginX, 28, {
      align: "right",
    });

    // Editorial title block
    let cy = 84;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...REPORT_RGB.primaryTeal);
    doc.text(opts.kicker.toUpperCase(), marginX + 2, cy);
    cy += 9;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(...REPORT_RGB.darkNavy);
    const titleLines = doc.splitTextToSize(opts.title, widthMm - marginX * 2 - 6);
    doc.text(titleLines, marginX + 2, cy);
    cy += titleLines.length * 10.5 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    const subLines = doc.splitTextToSize(opts.subtitle, widthMm - marginX * 2 - 10);
    doc.text(subLines, marginX + 2, cy);
    cy += subLines.length * 6 + 10;

    // Subtle accent divider
    doc.setDrawColor(...REPORT_RGB.primaryTeal);
    doc.setLineWidth(0.9);
    doc.line(marginX + 2, cy, marginX + 34, cy);
    cy += 16;

    // Program & scope highlight card
    const cardW = widthMm - marginX * 2 - 2;
    const rows: Array<[string, string]> = [
      ["Program / Project", opts.organizationOrProject],
      ...(opts.campOrScope ? [["Camp / Site Scope", opts.campOrScope] as [string, string]] : []),
      ...(opts.location ? [["Location / Region", opts.location] as [string, string]] : []),
      ["Reporting Period", opts.periodLabel],
      ["Date Generated", formatReportDateTime(opts.generatedAt)],
      ["Prepared By", opts.generatedBy],
    ];

    const cardH = rows.length * 10.5 + 14;
    doc.setFillColor(...REPORT_RGB.lightNeutral);
    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX + 2, cy, cardW, cardH, 2.5, 2.5, "FD");

    let ry = cy + 10;
    rows.forEach(([label, val], idx) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      doc.setTextColor(...REPORT_RGB.mutedText);
      doc.text(label.toUpperCase(), marginX + 8, ry);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...REPORT_RGB.darkNavy);
      doc.text(String(val), marginX + 60, ry, { maxWidth: cardW - 66 });

      if (idx < rows.length - 1) {
        doc.setDrawColor(...REPORT_RGB.border);
        doc.setLineWidth(0.15);
        doc.line(marginX + 8, ry + 3.5, marginX + cardW - 4, ry + 3.5);
      }
      ry += 10.5;
    });

    // Cover bottom confidentiality block
    const footerBoxY = heightMm - 36;
    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.25);
    doc.line(marginX + 2, footerBoxY, widthMm - marginX, footerBoxY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...REPORT_RGB.deepTeal);
    doc.text(opts.confidentiality, marginX + 2, footerBoxY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(
      "Prepared using AfyaCheck Healthcare Operations Platform · Verified full-dataset reporting",
      marginX + 2,
      footerBoxY + 12
    );

    this.addPageBreak();
  }

  /**
   * Compact editorial banner for short reports (1-3 pages) when cover page is omitted.
   */
  renderCompactMasthead(opts: {
    kicker: string;
    title: string;
    subtitle: string;
    scopeLine: string;
    confidentiality: string;
  }) {
    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;

    // Top bar accent (start cleanly at top margin without duplicate running header)
    this.y = 14;
    doc.setFillColor(...REPORT_RGB.deepTeal);
    doc.rect(marginX, this.y, contentWidthMm, 1.4, "F");
    this.y += 5;

    if (this.logoDataUri) {
      doc.addImage(this.logoDataUri, "PNG", marginX, this.y, 34, 10);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...REPORT_RGB.deepTeal);
      doc.text("AfyaCheck", marginX, this.y + 6);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...REPORT_RGB.primaryTeal);
    doc.text(opts.kicker.toUpperCase(), marginX + contentWidthMm, this.y + 3.8, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(
      `Ref: ${this.reportRef} · ${this.periodLabel}`,
      marginX + contentWidthMm,
      this.y + 8.5,
      { align: "right" }
    );

    this.y += 17.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...REPORT_RGB.darkNavy);
    doc.text(opts.title, marginX, this.y);
    this.y += 5.8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(opts.subtitle, marginX, this.y, { maxWidth: contentWidthMm });
    this.y += 5.2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    doc.text(opts.scopeLine, marginX, this.y, { maxWidth: contentWidthMm });
    this.y += 4.5;

    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.3);
    doc.line(marginX, this.y, marginX + contentWidthMm, this.y);
    this.y += 6;
  }

  /**
   * Restrained editorial section header (no heavy colored banner boxes).
   * Always reserves room for the following visual/table so headings never orphan at page bottom.
   */
  addSectionHeading(
    numberLabel: string,
    title: string,
    description?: string,
    minFollowingMm = 48
  ) {
    this.ensureSpace((description ? 18 : 13) + minFollowingMm);
    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;

    doc.setFillColor(...REPORT_RGB.primaryTeal);
    doc.rect(marginX, this.y, 8, 1.1, "F");
    this.y += 4.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...REPORT_RGB.primaryTeal);
    doc.text(numberLabel.toUpperCase(), marginX, this.y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...REPORT_RGB.darkNavy);
    doc.text(title, marginX + doc.getTextWidth(numberLabel.toUpperCase()) + 3.5, this.y);
    this.y += 2.5;

    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.25);
    doc.line(marginX, this.y, marginX + contentWidthMm, this.y);
    this.y += 4;

    if (description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(...REPORT_RGB.mutedText);
      const lines = doc.splitTextToSize(description, contentWidthMm);
      doc.text(lines, marginX, this.y);
      this.y += lines.length * 3.8 + 2.5;
    }
  }

  addKpiGrid(kpis: Array<{ label: string; formattedValue: string; sublabel?: string; denominator?: string }>) {
    if (kpis.length === 0) return;
    const cols = kpis.length <= 4 ? kpis.length : 3;
    const gap = 3.5;
    const cardW = (REPORT_PAGE.contentWidthMm - gap * (cols - 1)) / cols;
    const cardH = 22.5;

    const rows = Math.ceil(kpis.length / cols);
    this.ensureSpace(rows * (cardH + gap) + 3);

    kpis.forEach((kpi, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = REPORT_PAGE.marginX + col * (cardW + gap);
      const cy = this.y + row * (cardH + gap);

      this.doc.setFillColor(...REPORT_RGB.white);
      this.doc.setDrawColor(...REPORT_RGB.border);
      this.doc.setLineWidth(0.25);
      this.doc.roundedRect(cx, cy, cardW, cardH, 1.8, 1.8, "FD");

      // Subtle top teal hairline accent
      this.doc.setFillColor(...REPORT_RGB.primaryTeal);
      this.doc.rect(cx, cy, cardW, 0.9, "F");

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(6.8);
      this.doc.setTextColor(...REPORT_RGB.mutedText);
      this.doc.text(kpi.label.toUpperCase(), cx + 3.5, cy + 5.2, { maxWidth: cardW - 7 });

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(14);
      this.doc.setTextColor(...REPORT_RGB.darkNavy);
      this.doc.text(kpi.formattedValue, cx + 3.5, cy + 12.6);

      const foot = kpi.sublabel || kpi.denominator || "";
      if (foot) {
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(6.7);
        this.doc.setTextColor(...REPORT_RGB.mutedText);
        this.doc.text(foot, cx + 3.5, cy + 18.2, { maxWidth: cardW - 7 });
      }
    });

    this.y += rows * (cardH + gap) + 3;
  }

  addCalloutBox(opts: {
    title: string;
    body: string;
    tone?: "neutral" | "warning" | "critical";
  }) {
    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;
    const lines = doc.splitTextToSize(opts.body, contentWidthMm - 10);
    const boxH = lines.length * 3.9 + 11;
    this.ensureSpace(boxH + 4);

    const fill =
      opts.tone === "critical"
        ? REPORT_RGB.criticalBg
        : opts.tone === "warning"
        ? REPORT_RGB.warningBg
        : REPORT_RGB.paleTealTint;
    const border =
      opts.tone === "critical"
        ? REPORT_RGB.criticalBorder
        : opts.tone === "warning"
        ? REPORT_RGB.warningBorder
        : REPORT_RGB.border;
    const accent =
      opts.tone === "critical"
        ? REPORT_RGB.critical
        : opts.tone === "warning"
        ? REPORT_RGB.warning
        : REPORT_RGB.primaryTeal;

    doc.setFillColor(...fill);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, this.y, contentWidthMm, boxH, 1.5, 1.5, "FD");

    doc.setFillColor(...accent);
    doc.rect(marginX, this.y, 1.3, boxH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accent);
    doc.text(opts.title, marginX + 4.5, this.y + 5.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    doc.text(lines, marginX + 4.5, this.y + 9.8);

    this.y += boxH + 4;
  }

  addBulletList(items: string[]) {
    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...REPORT_RGB.bodySlate);

    items.forEach((item) => {
      const lines = doc.splitTextToSize(item, contentWidthMm - 6);
      this.ensureSpace(lines.length * 4.2 + 2);
      doc.setFillColor(...REPORT_RGB.primaryTeal);
      doc.circle(marginX + 1.5, this.y - 1, 0.7, "F");
      doc.text(lines, marginX + 4.5, this.y);
      this.y += lines.length * 4.2 + 1.8;
    });
    this.y += 2;
  }

  addTwoColumnInfoCard(pairs: Array<[string, string]>) {
    const rows = Math.ceil(pairs.length / 2);
    const rowH = 10.5;
    const boxH = rows * rowH + 6;
    this.ensureSpace(boxH + 4);

    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;
    const colW = contentWidthMm / 2;

    doc.setFillColor(...REPORT_RGB.lightNeutral);
    doc.setDrawColor(...REPORT_RGB.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, this.y, contentWidthMm, boxH, 1.8, 1.8, "FD");

    pairs.forEach(([label, value], idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = marginX + 4 + col * colW;
      const py = this.y + 5.5 + row * rowH;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(...REPORT_RGB.mutedText);
      doc.text(label.toUpperCase(), px, py);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...REPORT_RGB.darkNavy);
      doc.text(String(value || "—"), px, py + 4.2, { maxWidth: colW - 8 });
    });

    this.y += boxH + 5;
  }

  /**
   * Shared institutional editorial table renderer:
   * - Repeating headers across pages
   * - Row page break avoidance
   * - Right-aligned numeric columns
   * - Subtle horizontal dividers (never heavy grid boxes)
   */
  addEditorialTable(opts: {
    title?: string;
    subtitle?: string;
    headers: string[];
    rows: Array<Array<string | number>>;
    numericColumns?: number[];
    boldLastRow?: boolean;
  }) {
    this.ensureSpace(24);
    const { doc } = this;
    const { marginX, contentWidthMm } = REPORT_PAGE;

    if (opts.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...REPORT_RGB.darkNavy);
      doc.text(opts.title, marginX, this.y);
      this.y += 4;
    }
    if (opts.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.4);
      doc.setTextColor(...REPORT_RGB.mutedText);
      doc.text(opts.subtitle, marginX, this.y, { maxWidth: contentWidthMm });
      this.y += 4;
    }

    const numericSet = new Set(opts.numericColumns ?? []);
    const columnStyles: Record<number, any> = {};
    numericSet.forEach((colIdx) => {
      columnStyles[colIdx] = { halign: "right" };
    });

    autoTable(doc, {
      head: [opts.headers],
      body: opts.rows.length > 0 ? opts.rows : [["No matching records", ...opts.headers.slice(1).map(() => "—")]],
      startY: this.y,
      margin: {
        left: marginX,
        right: marginX,
        top: REPORT_PAGE.marginTop,
        bottom: REPORT_PAGE.marginBottom,
      },
      showHead: "everyPage",
      rowPageBreak: "avoid",
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: { top: 2.5, right: 2.5, bottom: 2.5, left: 2.5 },
        textColor: REPORT_RGB.bodySlate,
        lineColor: REPORT_RGB.border,
        lineWidth: { bottom: 0.2 },
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: REPORT_RGB.lightNeutral,
        textColor: REPORT_RGB.darkNavy,
        fontStyle: "bold",
        fontSize: 7.4,
        lineColor: REPORT_RGB.primaryTeal,
        lineWidth: { bottom: 0.6 },
      },
      columnStyles,
      didParseCell: (hookData) => {
        if (hookData.section === "head" && numericSet.has(hookData.column.index)) {
          hookData.cell.styles.halign = "right";
        }
        if (
          opts.boldLastRow &&
          hookData.section === "body" &&
          hookData.row.index === opts.rows.length - 1
        ) {
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.fillColor = REPORT_RGB.paleTealTint;
          hookData.cell.styles.textColor = REPORT_RGB.darkNavy;
        }
      },
    });

    this.y = ((doc as any).lastAutoTable?.finalY ?? this.y) + 7;
  }

  /**
   * Stamps consistent running header & footer across all interior pages.
   */
  finalizeHeadersAndFooters() {
    const { doc } = this;
    const totalPages = doc.getNumberOfPages();
    const startPage = this.hasCoverPage ? 2 : 1;

    for (let p = startPage; p <= totalPages; p++) {
      doc.setPage(p);
      const { marginX, widthMm, headerY, footerY } = REPORT_PAGE;

      // Running header (skip on Page 1 when compact masthead is rendered)
      const showHeader = this.hasCoverPage ? p >= 2 : p >= 2;
      if (showHeader) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(...REPORT_RGB.deepTeal);
        doc.text("AFYACHECK", marginX, headerY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...REPORT_RGB.mutedText);
        doc.text(`  |  ${this.title}`, marginX + 16, headerY);

        doc.text(
          `${this.reportRef}  ·  ${this.periodLabel}`,
          widthMm - marginX,
          headerY,
          { align: "right" }
        );

        doc.setDrawColor(...REPORT_RGB.border);
        doc.setLineWidth(0.2);
        doc.line(marginX, headerY + 2.5, widthMm - marginX, headerY + 2.5);
      }

      // Running footer
      doc.setDrawColor(...REPORT_RGB.border);
      doc.setLineWidth(0.2);
      doc.line(marginX, footerY - 4, widthMm - marginX, footerY - 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...REPORT_RGB.mutedText);
      doc.text(this.confidentiality, marginX, footerY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...REPORT_RGB.bodySlate);
      doc.text(`Page ${p} of ${totalPages}`, widthMm - marginX, footerY, {
        align: "right",
      });
    }
  }
}

/**
 * Renders any of the 5 aggregate report types (`executive`, `project`, `camp`,
 * `wellness`, `custom-project`) into an institutional A4 PDF document.
 */
export async function renderStructuredReportPdf(
  report: StructuredReportPayload,
  options: PdfRenderOptions = {}
): Promise<jsPDF> {
  const logoDataUri =
    options.logoDataUri !== undefined
      ? options.logoDataUri
      : await resolveBrowserLogo();

  const sections = new Set<ReportSectionKey>(
    options.includedSections && options.includedSections.length > 0
      ? options.includedSections
      : DEFAULT_SECTIONS_BY_TYPE[report.meta.reportType]
  );
  // Mandatory methodology & confidentiality notices can never be disabled
  sections.add("methodology");

  // Do not waste a full cover page on short executive summaries unless explicitly enabled
  const hasCoverPage =
    sections.has("cover") &&
    !(report.meta.reportType === "executive" && !options.includedSections?.includes("cover"));

  const builder = new EditorialPdfBuilder({
    title: report.meta.title,
    reportRef: report.meta.reportRef,
    periodLabel: report.meta.periodLabel,
    confidentiality: report.meta.confidentiality,
    logoDataUri,
    hasCoverPage,
  });

  const kickerMap: Record<StructuredReportPayload["meta"]["reportType"], string> = {
    executive: "Executive Health Program Brief",
    project: "Health Program Report",
    camp: "Health Camp Operations Report",
    wellness: "Wellness Program Report",
    "custom-project": "Custom Health Program Report",
  };

  if (hasCoverPage) {
    builder.renderCoverPage({
      kicker: kickerMap[report.meta.reportType],
      title: report.meta.title,
      subtitle: report.meta.subtitle,
      organizationOrProject: report.programInfo.projectName,
      campOrScope: report.programInfo.campName,
      location:
        report.programInfo.campLocation ||
        (report.programInfo.regions.length > 0
          ? report.programInfo.regions.slice(0, 3).join(", ")
          : null),
      periodLabel: report.meta.periodLabel,
      generatedAt: report.meta.generatedAt,
      generatedBy: report.meta.generatedBy,
      reportRef: report.meta.reportRef,
      confidentiality: report.meta.confidentiality,
    });
  } else {
    builder.renderCompactMasthead({
      kicker: kickerMap[report.meta.reportType],
      title: report.meta.title,
      subtitle: report.meta.subtitle,
      scopeLine: `Program: ${report.programInfo.projectName} · Scope: ${report.programInfo.campName} · Generated ${formatReportDateTime(report.meta.generatedAt)}`,
      confidentiality: report.meta.confidentiality,
    });
  }

  let sectionIdx = 1;
  const nextSec = () => `Section ${String(sectionIdx++).padStart(2, "0")}`;

  // Small-sample caution banner when n < 10
  if (report.meta.smallSampleWarning) {
    builder.addCalloutBox({
      title: "Small-Sample Privacy & Interpretation Notice",
      body: `Fewer than ${report.meta.smallSampleThreshold} records matched the active filters. Interpret percentages cautiously and review privacy policy before distributing externally.`,
      tone: "warning",
    });
  }

  // 1. Executive Summary
  if (sections.has("executiveSummary")) {
    builder.addSectionHeading(
      nextSec(),
      "Executive Summary",
      "Verified key performance indicators and factual program observations derived from full-dataset server aggregations."
    );
    builder.addKpiGrid(report.kpis);
    if (report.executiveNarrative.length > 0) {
      builder.addBulletList(report.executiveNarrative);
    }
  }

  // 2. Program Information
  if (sections.has("programInfo")) {
    builder.addSectionHeading(
      nextSec(),
      "Program & Reporting Scope",
      "Structured context, geographic coverage, and applied query parameters."
    );
    const infoPairs: Array<[string, string]> = [
      ["Project / Program", report.programInfo.projectName],
      ["Program Type", report.programInfo.programType],
      ["Camp / Site Scope", report.programInfo.campName],
      ["Participating Sites", `${report.programInfo.campCount} (${report.programInfo.activeCampCount} active)`],
      ["Reporting Period", report.programInfo.reportingPeriod],
      ["Report Reference", report.meta.reportRef],
      [
        "Regions Covered",
        report.programInfo.regions.length > 0
          ? report.programInfo.regions.slice(0, 4).join(", ")
          : report.programInfo.campLocation || "—",
      ],
      ["Generated On", formatReportDateTime(report.meta.generatedAt)],
    ];
    if (report.programInfo.schemaName) {
      infoPairs.push([
        "Active Form Schema",
        `${report.programInfo.schemaName} (v${report.programInfo.schemaVersion ?? 1})`,
      ]);
    }
    infoPairs.push(["Applied Filters", report.methodology.appliedFiltersSummary]);
    builder.addTwoColumnInfoCard(infoPairs);
  }

  // 3. Demographic Analysis (Executive, Project, Camp)
  if (sections.has("demographics") && report.demographics) {
    const demo = report.demographics;
    builder.addSectionHeading(
      nextSec(),
      "Demographic Analysis",
      `Population profile across n = ${demo.totalRegistered.toLocaleString()} registered participants. Unrecorded values are explicitly retained.`
    );

    // Side-by-side Donut charts: Gender & Insurance
    builder.ensureSpace(60);
    const halfW = (REPORT_PAGE.contentWidthMm - 4) / 2;
    const endLeft = drawDonutChart(builder.doc, {
      x: REPORT_PAGE.marginX,
      y: builder.y,
      width: halfW,
      height: 54,
      title: "Gender Distribution",
      subtitle: `Denominator: n = ${demo.totalRegistered.toLocaleString()} participants`,
      items: demo.gender,
    });
    const endRight = drawDonutChart(builder.doc, {
      x: REPORT_PAGE.marginX + halfW + 4,
      y: builder.y,
      width: halfW,
      height: 54,
      title: "Health Insurance Coverage",
      subtitle: `Denominator: n = ${demo.totalRegistered.toLocaleString()} participants`,
      items: demo.insurance,
    });
    builder.y = Math.max(endLeft, endRight) + 5;

    // Horizontal Bar Chart: Age Groups
    builder.ensureSpace(58);
    builder.y =
      drawHorizontalBarChart(builder.doc, {
        x: REPORT_PAGE.marginX,
        y: builder.y,
        width: REPORT_PAGE.contentWidthMm,
        title: "Age-Group Distribution",
        subtitle: `Approved AfyaCheck age brackets (n = ${demo.totalRegistered.toLocaleString()} registered participants)`,
        items: demo.ageGroups,
      }) + 5;

    // Attendance trend line chart when multi-day data exists
    if (demo.attendanceTrend.length >= 2) {
      builder.ensureSpace(66);
      builder.y =
        drawLineTrendChart(builder.doc, {
          x: REPORT_PAGE.marginX,
          y: builder.y,
          width: REPORT_PAGE.contentWidthMm,
          title: "Participation & Clinical Encounter Trend",
          subtitle: `Daily volume across reporting period (${report.meta.periodLabel})`,
          primaryLabel: "Registrations",
          secondaryLabel: "Clinical Encounters",
          points: demo.attendanceTrend.map((t) => ({
            label: t.date.slice(5),
            primary: t.registrations,
            secondary: t.encounters,
          })),
        }) + 5;
    }

    if (sections.has("dataTables") && demo.regions.length > 0) {
      builder.addEditorialTable({
        title: "Geographic Coverage Distribution",
        subtitle: `Registered participants by recorded region/location (n = ${demo.totalRegistered.toLocaleString()})`,
        headers: ["Region / Location", "Participants", "Share (%)"],
        numericColumns: [1, 2],
        boldLastRow: true,
        rows: [
          ...demo.regions.map((r) => [
            r.label,
            r.suppressed || r.count === null
              ? r.displayCount || "Suppressed"
              : r.count.toLocaleString(),
            r.suppressed || r.count === null
              ? r.displayPercentage || "Suppressed"
              : formatRateOrNA(r.percentage),
          ]),
          ["Total", demo.totalRegistered.toLocaleString(), demo.totalRegistered > 0 ? "100.0%" : "N/A"],
        ],
      });
    }
  }

  // 4. Clinical Screening Analysis (Executive, Project, Camp)
  if (sections.has("clinicalScreening") && report.clinicalScreening) {
    const clin = report.clinicalScreening;
    builder.addSectionHeading(
      nextSec(),
      "Clinical Screening & Findings Analysis",
      `Summary of ${clin.encountersTotal.toLocaleString()} recorded encounters. Screening performed, not-performed, recorded findings, and explicit referrals are reported distinctly.`
    );

    builder.ensureSpace(38);
    builder.y =
      drawStackedCompositionBar(builder.doc, {
        x: REPORT_PAGE.marginX,
        y: builder.y,
        width: REPORT_PAGE.contentWidthMm,
        title: "Clinical Encounter Completion Status",
        subtitle: `Denominator: ${clin.encountersTotal.toLocaleString()} recorded encounters`,
        segments: [
          { label: "Completed", count: clin.encountersCompleted, color: REPORT_RGB.deepTeal },
          { label: "Pending Review", count: clin.encountersPending, color: [148, 163, 184] },
        ],
      }) + 5;

    if (clin.domains.length > 0) {
      builder.addEditorialTable({
        title: "Clinical Screening Activity by Active Domain",
        subtitle:
          "Finding rate denominator equals assessments performed in that specific domain (excludes not-performed entries).",
        headers: [
          "Domain",
          "Assessment",
          "Performed",
          "Not Perf.",
          "Normal / Neg",
          "Finding",
          "Rate",
          "Referrals",
        ],
        numericColumns: [2, 3, 4, 5, 6, 7],
        rows: clin.domains.map((d) => [
          d.domain,
          d.indicator,
          d.performedCount.toLocaleString(),
          d.notPerformedCount.toLocaleString(),
          d.normalOrNegativeCount.toLocaleString(),
          d.abnormalOrReactiveCount.toLocaleString(),
          `${formatRateOrNA(d.findingRate)}`,
          d.referralCount > 0 ? d.referralCount.toLocaleString() : "—",
        ]),
      });
    } else {
      builder.addCalloutBox({
        title: "No Domain-Specific Screening Findings Recorded",
        body: "No specialized infectious, cancer, specialty, or radiology screening entries were recorded in the selected scope and date window.",
        tone: "neutral",
      });
    }

    if (sections.has("dataTables")) {
      builder.addEditorialTable({
        title: "Vital Signs & Anthropometric Capture Completeness",
        subtitle: `Recorded measurements with standard clinical units across ${clin.encountersTotal.toLocaleString()} encounters`,
        headers: ["Measurement", "Unit", "Recorded", "Missing", "Completeness", "Mean Value"],
        numericColumns: [2, 3, 4, 5],
        rows: clin.vitalsCompleteness.map((v) => [
          v.metric,
          v.unit,
          v.recordedCount.toLocaleString(),
          v.missingCount.toLocaleString(),
          formatRateOrNA(v.completenessRate),
          v.meanValue !== undefined && v.meanValue !== null ? `${v.meanValue} ${v.unit}` : "—",
        ]),
      });
    }
  }

  // 5. Multi-Camp Comparisons (Executive, Project)
  if (
    sections.has("campComparisons") &&
    report.campComparisons &&
    report.campComparisons.length > 1
  ) {
    builder.addSectionHeading(
      nextSec(),
      "Participating Camp Comparison",
      `Side-by-side operational comparison across ${report.campComparisons.length} participating camps.`
    );

    builder.ensureSpace(68);
    builder.y =
      drawGroupedBarChart(builder.doc, {
        x: REPORT_PAGE.marginX,
        y: builder.y,
        width: REPORT_PAGE.contentWidthMm,
        title: "Registered Participants vs. Completed Clinical Encounters by Camp",
        subtitle: "Top camps ordered by registration volume",
        seriesALabel: "Registered Participants",
        seriesBLabel: "Completed Encounters",
        groups: report.campComparisons.slice(0, 7).map((c) => ({
          label: c.campName,
          valueA: c.registered,
          valueB: c.completed,
        })),
      }) + 5;

    builder.addEditorialTable({
      title: "Camp Performance Table",
      headers: [
        "Camp Name",
        "Location",
        "Registered",
        "Encounters",
        "Completed",
        "Completion",
        "Referrals",
      ],
      numericColumns: [2, 3, 4, 5, 6],
      boldLastRow: true,
      rows: [
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
          report.campComparisons.reduce((s, c) => s + c.registered, 0).toLocaleString(),
          report.campComparisons.reduce((s, c) => s + c.encounters, 0).toLocaleString(),
          report.campComparisons.reduce((s, c) => s + c.completed, 0).toLocaleString(),
          "—",
          report.campComparisons.reduce((s, c) => s + c.referrals, 0).toLocaleString(),
        ],
      ],
    });
  }

  // 6. Wellness Analysis (Wellness Report)
  if (sections.has("wellnessAnalysis") && report.wellness) {
    const w = report.wellness;
    builder.addSectionHeading(
      nextSec(),
      "Wellness Indicator Analysis",
      `Score distribution and respondent demographics across ${w.totalAssessments.toLocaleString()} completed assessments.`
    );

    builder.addCalloutBox({
      title: "Clinical Governance — Non-Diagnostic Indicator Scale",
      body: w.interpretationGuidance,
      tone: "warning",
    });

    builder.ensureSpace(56);
    builder.y =
      drawHorizontalBarChart(builder.doc, {
        x: REPORT_PAGE.marginX,
        y: builder.y,
        width: REPORT_PAGE.contentWidthMm,
        title: "Wellness Screening Indicator Band Distribution",
        subtitle: `Denominator: n = ${w.totalAssessments.toLocaleString()} assessments (Mean ${w.avgScore}, Median ${w.medianScore}, Range ${w.minScore}–${w.maxScore})`,
        items: w.scoreBands.map((b) => ({
          label: `${b.band} (${b.range})`,
          count: b.count,
          percentage: b.percentage,
        })),
      }) + 5;

    builder.addEditorialTable({
      title: "Indicator Band Breakdown & Approved Follow-Up Guidance",
      headers: ["Indicator Band", "Score Range", "Count", "Share (%)", "Program Guidance"],
      numericColumns: [2, 3],
      rows: w.scoreBands.map((b) => [
        b.band,
        b.range,
        b.count.toLocaleString(),
        formatRateOrNA(b.percentage),
        b.interpretationNote,
      ]),
    });

    // Respondent demographics
    builder.ensureSpace(58);
    const halfW = (REPORT_PAGE.contentWidthMm - 4) / 2;
    const endG = drawDonutChart(builder.doc, {
      x: REPORT_PAGE.marginX,
      y: builder.y,
      width: halfW,
      height: 52,
      title: "Respondent Gender",
      subtitle: `n = ${w.totalAssessments.toLocaleString()} assessments`,
      items: w.demographics.gender,
    });
    const endA = drawHorizontalBarChart(builder.doc, {
      x: REPORT_PAGE.marginX + halfW + 4,
      y: builder.y,
      width: halfW,
      title: "Respondent Age Groups",
      subtitle: `n = ${w.totalAssessments.toLocaleString()} assessments`,
      items: w.demographics.ageGroups,
    });
    builder.y = Math.max(endG, endA) + 5;
  }

  // 7. Custom Project Dynamic Form Analysis (Custom Project Report — zero hardcoded clinical sections!)
  if (sections.has("customFormAnalysis") && report.customProject) {
    const cf = report.customProject;
    builder.addSectionHeading(
      nextSec(),
      `Custom Form Analysis — ${cf.schemaName} (v${cf.schemaVersion})`,
      cf.versionNote
    );

    builder.ensureSpace(38);
    builder.y =
      drawStackedCompositionBar(builder.doc, {
        x: REPORT_PAGE.marginX,
        y: builder.y,
        width: REPORT_PAGE.contentWidthMm,
        title: "Form Submission Workflow Status",
        subtitle: `Total version-aligned submissions: n = ${cf.totalSubmissions.toLocaleString()}`,
        segments: [
          { label: "Approved", count: cf.statusBreakdown.approved, color: REPORT_RGB.deepTeal },
          { label: "Submitted", count: cf.statusBreakdown.submitted, color: REPORT_RGB.primaryTeal },
          { label: "Draft", count: cf.statusBreakdown.draft, color: [148, 163, 184] },
          { label: "Rejected", count: cf.statusBreakdown.rejected, color: REPORT_RGB.critical },
        ],
      }) + 5;

    // Render dynamic field visualizations adapted to each field type
    for (const field of cf.fields) {
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
        builder.ensureSpace(44);
        builder.y =
          drawHorizontalBarChart(builder.doc, {
            x: REPORT_PAGE.marginX,
            y: builder.y,
            width: REPORT_PAGE.contentWidthMm,
            title: `${field.label} (${field.type})`,
            subtitle: field.denominatorLabel,
            items: distItems,
          }) + 4;
      } else if (field.numericSummary) {
        builder.addEditorialTable({
          title: `${field.label} — Numeric Distribution`,
          subtitle: `Valid responses: ${field.numericSummary.count} · Missing: ${field.missingCount} · Completeness: ${field.completionRate}%`,
          headers: ["Statistic", "Value"],
          numericColumns: [1],
          rows: [
            ["Minimum", field.numericSummary.min],
            ["Maximum", field.numericSummary.max],
            ["Arithmetic Mean", field.numericSummary.avg],
            ["Median", field.numericSummary.median ?? "—"],
            ["Valid Response Count", field.numericSummary.count.toLocaleString()],
          ],
        });
      }
    }

    if (sections.has("dataTables") && cf.fields.length > 0) {
      builder.addEditorialTable({
        title: "Form Field Completeness & Missing-Data Audit",
        subtitle: `Schema ${cf.schemaName} (v${cf.schemaVersion}) · Free-text responses are excluded by default for privacy.`,
        headers: ["Field Label", "Type", "Required", "Responses", "Missing", "Completeness", "Privacy / Summary"],
        numericColumns: [3, 4, 5],
        rows: cf.fields.map((f) => [
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
        ]),
      });
    }
  }

  // 8. Mandatory Methodology, Metric Definitions & Confidentiality Notice
  builder.addSectionHeading(
    nextSec(),
    "Methodology, Definitions & Governance",
    "Authoritative data source notes, standardized indicator definitions, missing-data policy, and confidentiality classification."
  );

  builder.addTwoColumnInfoCard([
    ["Data Source", report.methodology.dataSource],
    ["Reporting Period", report.methodology.reportingPeriod],
    ["Applied Filters", report.methodology.appliedFiltersSummary],
    ["Missing-Data Policy", report.methodology.missingDataHandling],
  ]);

  if (report.methodology.metricDefinitions.length > 0) {
    builder.addEditorialTable({
      title: "Standardized Metric Definitions",
      headers: ["Indicator / Term", "Documented Definition"],
      rows: report.methodology.metricDefinitions.map((m) => [m.term, m.definition]),
    });
  }

  if (report.methodology.limitations.length > 0) {
    builder.addBulletList(report.methodology.limitations);
  }

  builder.addCalloutBox({
    title: "Confidentiality & Data Protection Notice",
    body: report.methodology.confidentialityNotice,
    tone: "neutral",
  });

  builder.finalizeHeadersAndFooters();
  return builder.doc;
}

export async function downloadStructuredReportPdf(
  report: StructuredReportPayload,
  options: PdfRenderOptions = {}
): Promise<void> {
  const doc = await renderStructuredReportPdf(report, options);
  const slug = safeFilenameSlug(report.programInfo.projectName);
  const datePart = report.meta.generatedAt.slice(0, 10);
  doc.save(`afyacheck-${report.meta.reportType}-${slug}-${datePart}.pdf`);
}

function formatClinicalVal(val: unknown, unit?: string): string {
  if (val === null || val === undefined || val === "") return "Not recorded";
  const text = String(val)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return unit ? `${text} ${unit}` : text;
}

/**
 * Renders an Authorized Patient-Level Clinical Encounter Summary PDF.
 * Strict PHI confidentiality classification; displays recorded measurements, findings,
 * documented referrals, and responsible clinician verbatim with zero automated diagnoses.
 */
export async function renderPatientClinicalReportPdf(
  report: PatientClinicalReportPayload,
  options: { logoDataUri?: string | null } = {}
): Promise<jsPDF> {
  const logoDataUri =
    options.logoDataUri !== undefined
      ? options.logoDataUri
      : await resolveBrowserLogo();

  const builder = new EditorialPdfBuilder({
    title: report.meta.title,
    reportRef: report.meta.reportRef,
    periodLabel: `Patient ID: ${report.patient.patientIdentifier}`,
    confidentiality: report.meta.confidentiality,
    logoDataUri,
    hasCoverPage: false,
  });

  builder.renderCompactMasthead({
    kicker: "Authorized Individual Clinical Record Extract",
    title: report.meta.title,
    subtitle: report.meta.subtitle,
    scopeLine: `Program: ${report.context.projectName} · Camp: ${report.context.campName} · Prepared by: ${report.meta.generatedBy}`,
    confidentiality: report.meta.confidentiality,
  });

  builder.addCalloutBox({
    title: report.meta.confidentiality,
    body: report.clinicalGovernanceNotice,
    tone: "critical",
  });

  builder.addSectionHeading(
    "Section 01",
    "Authorized Patient Identification",
    "Patient demographic and camp registration metadata as recorded in AfyaCheck."
  );

  builder.addTwoColumnInfoCard([
    ["Full Name", report.patient.name],
    ["Patient Identifier", report.patient.patientIdentifier],
    ["Gender", formatClinicalVal(report.patient.gender)],
    ["Date of Birth", formatReportDate(report.patient.dateOfBirth)],
    ["Phone Number", report.patient.phoneNumber],
    ["Health Insurance", report.patient.insurance],
    ["Region / District", `${report.patient.region} / ${report.patient.district}`],
    ["Registered On", `${formatReportDate(report.patient.registeredAt)} (by ${report.patient.registeredBy})`],
  ]);

  builder.addSectionHeading(
    "Section 02",
    `Recorded Clinical Encounters (${report.encounters.length})`,
    "Documented measurements, screening observations, recorded referrals, and clinician notes."
  );

  if (report.encounters.length === 0) {
    builder.addCalloutBox({
      title: "No Formal Clinical Encounters Recorded",
      body: "This patient has a registration record on file without a linked clinical screening encounter in this camp.",
      tone: "neutral",
    });
  } else {
    report.encounters.forEach((enc, idx) => {
      const s = enc.screening || {};
      const cf = enc.clinicalFindings || {};
      const dc = enc.doctorComments || {};
      const tb = (cf.tbScreening as Record<string, unknown> | undefined) || {};

      builder.addTwoColumnInfoCard([
        [`Encounter #${idx + 1} Status`, `${formatClinicalVal(enc.status)} (v${enc.version})`],
        ["Recorded Date", formatReportDateTime(enc.recordedAt)],
        ["Responsible Clinician", enc.recordedBy],
        ["Finalized By", enc.finalizedBy ? `${enc.finalizedBy} (${formatReportDate(enc.finalizedAt)})` : "Pending finalization"],
      ]);

      builder.addEditorialTable({
        title: `Encounter #${idx + 1} — Vital Signs & Anthropometric Measurements`,
        headers: ["Measurement", "Recorded Value", "Unit"],
        rows: [
          ["Height", s.height ? String(s.height) : "Not recorded", "cm"],
          ["Weight", s.weight ? String(s.weight) : "Not recorded", "kg"],
          ["Body Mass Index (BMI)", s.bmi ? String(s.bmi) : "Not recorded", "kg/m²"],
          ["Blood Pressure", s.bloodPressure ? String(s.bloodPressure) : "Not recorded", "mmHg"],
          ["Hemoglobin (Hb)", s.hb ? String(s.hb) : "Not recorded", "g/dL"],
        ],
      });

      const findingRows: Array<[string, string, string]> = [
        ["HIV Testing", formatClinicalVal(cf.hivTesting), formatClinicalVal(cf.hivResult)],
        ["TB Screening", formatClinicalVal(tb.status), formatClinicalVal(tb.medicationStatus)],
        ["Cancer Screening", formatClinicalVal(cf.cancerScreening), formatClinicalVal(cf.breastCancerStatus || cf.cervicalCancerStatus || cf.prostateCancerStatus)],
        ["Physiotherapy", formatClinicalVal(cf.physioStatus), formatClinicalVal(cf.physioReferral)],
        ["Dental Evaluation", formatClinicalVal(cf.dentalStatus), formatClinicalVal(cf.dentalDiagnosis)],
        ["Ophthalmology", formatClinicalVal(cf.ophthalmologyStatus), formatClinicalVal(cf.ophthalmologyReferral)],
        ["Orthopedics", formatClinicalVal(cf.orthoStatus), formatClinicalVal(cf.orthoReferral)],
        ["ECG / Echo", formatClinicalVal(cf.ecgStatus || cf.echoStatus), formatClinicalVal(cf.ecgDiagnosis || cf.echoDiagnosis)],
        ["X-Ray / Ultrasound", formatClinicalVal(cf.xrayStatus || cf.ultrasoundStatus), formatClinicalVal(cf.xrayDiagnosis || cf.ultrasoundDiagnosis)],
        ["General Referral", formatClinicalVal(cf.referral || dc.referral), formatClinicalVal(cf.preventiveMeasure)],
      ];

      builder.addEditorialTable({
        title: `Encounter #${idx + 1} — Documented Clinical Findings & Referrals`,
        headers: ["Clinical Domain", "Recorded Finding / Status", "Referral / Notes"],
        rows: findingRows,
      });

      const clinicianNote = String(dc.doctorsComment || cf.comments || "").trim();
      const prescription = String(dc.prescription || cf.prescription || "").trim();
      if (clinicianNote || prescription) {
        builder.addTwoColumnInfoCard([
          ["Clinician Notes", clinicianNote || "—"],
          ["Documented Prescription / Plan", prescription || "—"],
        ]);
      }
    });
  }

  builder.finalizeHeadersAndFooters();
  return builder.doc;
}

export async function downloadPatientClinicalReportPdf(
  report: PatientClinicalReportPayload
): Promise<void> {
  const doc = await renderPatientClinicalReportPdf(report);
  const idSlug = safeFilenameSlug(report.patient.patientIdentifier || report.patient.id);
  const datePart = report.meta.generatedAt.slice(0, 10);
  doc.save(`afyacheck-patient-clinical-${idSlug}-${datePart}.pdf`);
}

// Keep unused import lint-free
void formatCount;
