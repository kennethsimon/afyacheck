import type jsPDF from "jspdf";
import {
  formatRateOrNA,
  REPORT_CHART_SERIES_RGB,
  REPORT_RGB,
  type RgbTuple,
} from "./tokens";

export interface ChartHeaderOpts {
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
}

function drawChartFrame(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  subtitle?: string
): number {
  doc.setDrawColor(...REPORT_RGB.border);
  doc.setFillColor(...REPORT_RGB.white);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...REPORT_RGB.darkNavy);
  doc.text(title, x + 5, y + 6.5);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(subtitle, x + 5, y + 10.8, { maxWidth: width - 10 });
    return y + 15.5;
  }
  return y + 11.5;
}

function truncateLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

/**
 * Vector Horizontal Bar Chart — ideal for age groups, regions, wellness bands,
 * and custom form distributions. Sharp at any zoom and legible in grayscale.
 */
export function drawHorizontalBarChart(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    title: string;
    subtitle?: string;
    items: Array<{
      label: string;
      count: number | null;
      percentage: number | null;
      suppressed?: boolean;
      displayCount?: string;
    }>;
    barColor?: RgbTuple;
  }
): number {
  const { x, y, width, title, subtitle, items } = opts;
  const rows = items.slice(0, 10);
  const rowHeight = 7.4;
  const headerH = subtitle ? 16 : 12;
  const height = Math.max(36, headerH + rows.length * rowHeight + 8);

  const startY = drawChartFrame(doc, x, y, width, height, title, subtitle);

  const hasAny = rows.some((r) => r.suppressed || (r.count !== null && r.count > 0));
  if (rows.length === 0 || !hasAny) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text("No recorded observations for this reporting scope.", x + 5, startY + 8);
    return y + height;
  }

  const labelColW = Math.min(54, width * 0.34);
  const valueColW = 30;
  const barX = x + 5 + labelColW + 2;
  const barMaxW = Math.max(20, width - labelColW - valueColW - 14);
  const maxVal = Math.max(
    ...rows.map((r) => (r.suppressed || r.count === null ? 0 : r.count)),
    1
  );

  rows.forEach((item, idx) => {
    const ry = startY + idx * rowHeight;
    const isSuppressed = Boolean(item.suppressed || item.count === null);
    const isUnrecorded = item.label.toLowerCase().includes("unrecorded");
    const fillRgb: RgbTuple = isUnrecorded
      ? [148, 163, 184]
      : opts.barColor ||
        REPORT_CHART_SERIES_RGB[idx % Math.min(3, REPORT_CHART_SERIES_RGB.length)];

    // Category label
    doc.setFont("helvetica", isUnrecorded || isSuppressed ? "italic" : "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...(isUnrecorded || isSuppressed ? REPORT_RGB.mutedText : REPORT_RGB.bodySlate));
    doc.text(truncateLabel(item.label, 28), x + 5, ry + 4);

    // Track background
    doc.setFillColor(...REPORT_RGB.lightNeutral);
    doc.roundedRect(barX, ry + 0.7, barMaxW, 4.4, 0.8, 0.8, "F");

    // Value bar (only for non-suppressed cells)
    const numericVal = isSuppressed ? 0 : item.count ?? 0;
    const barW = numericVal > 0 ? Math.max(1.2, (numericVal / maxVal) * barMaxW) : 0;
    if (barW > 0) {
      doc.setFillColor(...fillRgb);
      doc.roundedRect(barX, ry + 0.7, barW, 4.4, 0.8, 0.8, "F");
    }

    // Right-aligned count & percentage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(...REPORT_RGB.darkNavy);
    doc.text(
      isSuppressed
        ? item.displayCount || "Suppressed"
        : `${numericVal.toLocaleString()} (${formatRateOrNA(item.percentage)})`,
      x + width - 5,
      ry + 4,
      { align: "right" }
    );
  });

  return y + height;
}

/**
 * Vector Donut Chart with centered total callout and right-hand tabular legend.
 * Drawn via smooth vector polygon sectors — zero raster blur.
 */
export function drawDonutChart(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    height?: number;
    title: string;
    subtitle?: string;
    centerLabel?: string;
    items: Array<{
      label: string;
      count: number | null;
      percentage: number | null;
      suppressed?: boolean;
      displayCount?: string;
    }>;
  }
): number {
  const { x, y, width, title, subtitle, items, centerLabel = "Total" } = opts;
  const height = opts.height ?? 56;
  const startY = drawChartFrame(doc, x, y, width, height, title, subtitle);

  const total = items.reduce(
    (s, i) => s + (i.suppressed || i.count === null ? 0 : i.count),
    0
  );
  const hasSuppressed = items.some((i) => i.suppressed || i.count === null);
  if (total === 0 && !hasSuppressed) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text("No recorded observations for this reporting scope.", x + 5, startY + 10);
    return y + height;
  }

  const radius = Math.min(16, (height - (startY - y) - 6) / 2);
  const innerRadius = radius * 0.58;
  const cx = x + 6 + radius;
  const cy = startY + (y + height - startY) / 2 - 1;

  let startAngle = -Math.PI / 2;
  items.forEach((item, idx) => {
    if (item.suppressed || item.count === null || item.count <= 0 || total <= 0) return;
    const sweep = (item.count / total) * Math.PI * 2;
    const endAngle = startAngle + sweep;
    const rgb = item.label.toLowerCase().includes("unrecorded")
      ? ([203, 213, 225] as RgbTuple)
      : REPORT_CHART_SERIES_RGB[idx % REPORT_CHART_SERIES_RGB.length];

    const steps = Math.max(8, Math.ceil((sweep / (Math.PI * 2)) * 72));
    const lines: Array<[number, number]> = [];
    const x0 = cx + radius * Math.cos(startAngle);
    const y0 = cy + radius * Math.sin(startAngle);
    let prevX = x0;
    let prevY = y0;

    for (let s = 1; s <= steps; s++) {
      const a = startAngle + (sweep * s) / steps;
      const nx = cx + radius * Math.cos(a);
      const ny = cy + radius * Math.sin(a);
      lines.push([nx - prevX, ny - prevY]);
      prevX = nx;
      prevY = ny;
    }
    lines.push([cx - prevX, cy - prevY]);

    doc.setFillColor(...rgb);
    doc.setDrawColor(...REPORT_RGB.white);
    doc.setLineWidth(0.35);
    doc.lines(lines, x0, y0, [1, 1], "FD", true);

    startAngle = endAngle;
  });

  // Clean inner white hole
  doc.setFillColor(...REPORT_RGB.white);
  doc.circle(cx, cy, innerRadius, "F");

  // Center total callout
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...REPORT_RGB.darkNavy);
  doc.text(total > 0 ? total.toLocaleString() : "—", cx, cy + 0.8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...REPORT_RGB.mutedText);
  doc.text(hasSuppressed ? "Visible" : centerLabel, cx, cy + 4.3, { align: "center" });

  // Legend on right side
  const legendX = cx + radius + 7;
  const legendRowH = 6.2;
  const legendStartY = Math.max(startY + 2, cy - (items.length * legendRowH) / 2 + 2);

  items.slice(0, 6).forEach((item, idx) => {
    const ly = legendStartY + idx * legendRowH;
    const isSuppressed = Boolean(item.suppressed || item.count === null);
    const rgb = isSuppressed
      ? ([226, 232, 240] as RgbTuple)
      : item.label.toLowerCase().includes("unrecorded")
      ? ([203, 213, 225] as RgbTuple)
      : REPORT_CHART_SERIES_RGB[idx % REPORT_CHART_SERIES_RGB.length];

    doc.setFillColor(...rgb);
    doc.roundedRect(legendX, ly - 2.3, 2.8, 2.8, 0.5, 0.5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    doc.text(truncateLabel(item.label, width < 100 ? 12 : 20), legendX + 4.2, ly);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...REPORT_RGB.darkNavy);
    doc.text(
      isSuppressed
        ? item.displayCount || "Suppressed"
        : `${(item.count ?? 0).toLocaleString()} (${formatRateOrNA(item.percentage)})`,
      x + width - 4.5,
      ly,
      { align: "right" }
    );
  });

  return y + height;
}

/**
 * Vector Stacked Composition Bar — ideal for screening completion or submission status.
 */
export function drawStackedCompositionBar(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    title: string;
    subtitle?: string;
    segments: Array<{ label: string; count: number; color?: RgbTuple }>;
  }
): number {
  const { x, y, width, title, subtitle, segments } = opts;
  const height = 34;
  const startY = drawChartFrame(doc, x, y, width, height, title, subtitle);

  const total = segments.reduce((s, seg) => s + seg.count, 0);
  const barX = x + 5;
  const barW = width - 10;
  const barY = startY + 1;
  const barH = 6.5;

  doc.setFillColor(...REPORT_RGB.lightNeutral);
  doc.roundedRect(barX, barY, barW, barH, 1.2, 1.2, "F");

  if (total > 0) {
    let cursorX = barX;
    segments.forEach((seg, idx) => {
      if (seg.count <= 0) return;
      const segW = (seg.count / total) * barW;
      const rgb = seg.color || REPORT_CHART_SERIES_RGB[idx % REPORT_CHART_SERIES_RGB.length];
      doc.setFillColor(...rgb);
      doc.rect(cursorX, barY, segW, barH, "F");
      cursorX += segW;
    });
  }

  // Legend row beneath bar
  let lx = barX;
  const ly = barY + barH + 5.8;
  segments.forEach((seg, idx) => {
    const rgb = seg.color || REPORT_CHART_SERIES_RGB[idx % REPORT_CHART_SERIES_RGB.length];
    const pct = total > 0 ? ((seg.count / total) * 100).toFixed(1) : "0.0";
    const text = `${seg.label}: ${seg.count.toLocaleString()} (${pct}%)`;

    doc.setFillColor(...rgb);
    doc.roundedRect(lx, ly - 2.3, 2.5, 2.5, 0.4, 0.4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.3);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    doc.text(text, lx + 3.8, ly);
    lx += doc.getTextWidth(text) + 9;
  });

  return y + height;
}

/**
 * Vector Line Trend Chart — crisp print trend lines for registrations & clinical encounters.
 */
export function drawLineTrendChart(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    height?: number;
    title: string;
    subtitle?: string;
    points: Array<{ label: string; primary: number; secondary?: number }>;
    primaryLabel: string;
    secondaryLabel?: string;
  }
): number {
  const {
    x,
    y,
    width,
    title,
    subtitle,
    points,
    primaryLabel,
    secondaryLabel,
  } = opts;
  const height = opts.height ?? 62;
  const startY = drawChartFrame(doc, x, y, width, height, title, subtitle);

  // Sample down cleanly if too many dates so axis labels never overlap
  const sampled =
    points.length > 24
      ? points.filter(
          (_, idx) => idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 20) === 0
        )
      : points;

  if (sampled.length < 2) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(
      sampled.length === 1
        ? `Single recorded date (${sampled[0].label}): ${sampled[0].primary.toLocaleString()} ${primaryLabel.toLowerCase()}.`
        : "Insufficient time-series points for trend visualization.",
      x + 5,
      startY + 12
    );
    return y + height;
  }

  const plotLeft = x + 15;
  const plotRight = x + width - 7;
  const plotTop = startY + 5;
  const plotBottom = y + height - 11;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const maxVal = Math.max(
    1,
    ...sampled.map((p) => Math.max(p.primary, p.secondary ?? 0))
  );
  const niceMax = Math.ceil(maxVal / 5) * 5 || maxVal;

  // Legend top right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let legRight = plotRight;
  if (secondaryLabel) {
    const w2 = doc.getTextWidth(secondaryLabel);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(secondaryLabel, legRight, startY + 1.5, { align: "right" });
    doc.setDrawColor(...REPORT_CHART_SERIES_RGB[3]);
    doc.setLineWidth(0.7);
    doc.line(legRight - w2 - 6, startY + 0.7, legRight - w2 - 1.5, startY + 0.7);
    legRight -= w2 + 11;
  }
  const w1 = doc.getTextWidth(primaryLabel);
  doc.setTextColor(...REPORT_RGB.bodySlate);
  doc.text(primaryLabel, legRight, startY + 1.5, { align: "right" });
  doc.setDrawColor(...REPORT_RGB.primaryTeal);
  doc.setLineWidth(0.9);
  doc.line(legRight - w1 - 6, startY + 0.7, legRight - w1 - 1.5, startY + 0.7);

  // Horizontal grid lines & Y axis ticks
  for (let i = 0; i <= 3; i++) {
    const frac = i / 3;
    const gy = plotBottom - frac * plotH;
    doc.setDrawColor(...REPORT_RGB.subtleDivider);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, gy, plotRight, gy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(Math.round(niceMax * frac).toLocaleString(), plotLeft - 2, gy + 1, {
      align: "right",
    });
  }

  const getCoord = (idx: number, val: number) => ({
    px: plotLeft + (idx / Math.max(1, sampled.length - 1)) * plotW,
    py: plotBottom - (val / niceMax) * plotH,
  });

  // Secondary series
  if (secondaryLabel) {
    doc.setDrawColor(...REPORT_CHART_SERIES_RGB[3]);
    doc.setLineWidth(0.55);
    for (let i = 0; i < sampled.length - 1; i++) {
      const a = getCoord(i, sampled[i].secondary ?? 0);
      const b = getCoord(i + 1, sampled[i + 1].secondary ?? 0);
      doc.line(a.px, a.py, b.px, b.py);
    }
  }

  // Primary series
  doc.setDrawColor(...REPORT_RGB.primaryTeal);
  doc.setLineWidth(0.8);
  for (let i = 0; i < sampled.length - 1; i++) {
    const a = getCoord(i, sampled[i].primary);
    const b = getCoord(i + 1, sampled[i + 1].primary);
    doc.line(a.px, a.py, b.px, b.py);
  }
  doc.setFillColor(...REPORT_RGB.primaryTeal);
  sampled.forEach((pt, idx) => {
    const { px, py } = getCoord(idx, pt.primary);
    doc.circle(px, py, 0.85, "F");
  });

  // X axis labels (up to 5 evenly spaced)
  const tickCount = Math.min(5, sampled.length);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);
  doc.setTextColor(...REPORT_RGB.mutedText);
  for (let t = 0; t < tickCount; t++) {
    const idx = Math.round((t / Math.max(1, tickCount - 1)) * (sampled.length - 1));
    const { px } = getCoord(idx, 0);
    doc.text(sampled[idx].label, px, plotBottom + 5, {
      align: t === 0 ? "left" : t === tickCount - 1 ? "right" : "center",
    });
  }

  return y + height;
}

/**
 * Vector Grouped Bar Chart — ideal for Multi-Camp Comparison.
 */
export function drawGroupedBarChart(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    height?: number;
    title: string;
    subtitle?: string;
    seriesALabel: string;
    seriesBLabel: string;
    groups: Array<{ label: string; valueA: number; valueB: number }>;
  }
): number {
  const { x, y, width, title, subtitle, seriesALabel, seriesBLabel, groups } = opts;
  const height = opts.height ?? 64;
  const startY = drawChartFrame(doc, x, y, width, height, title, subtitle);

  const items = groups.slice(0, 7);
  if (items.length === 0) return y + height;

  const plotLeft = x + 15;
  const plotRight = x + width - 6;
  const plotTop = startY + 6;
  const plotBottom = y + height - 13;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const maxVal = Math.max(1, ...items.map((g) => Math.max(g.valueA, g.valueB)));
  const niceMax = Math.ceil(maxVal / 5) * 5 || maxVal;

  // Legend
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const wB = doc.getTextWidth(seriesBLabel);
  doc.setTextColor(...REPORT_RGB.mutedText);
  doc.text(seriesBLabel, plotRight, startY + 1.8, { align: "right" });
  doc.setFillColor(...REPORT_CHART_SERIES_RGB[2]);
  doc.rect(plotRight - wB - 4.5, startY - 0.5, 2.8, 2.8, "F");

  const legA = plotRight - wB - 9;
  const wA = doc.getTextWidth(seriesALabel);
  doc.setTextColor(...REPORT_RGB.bodySlate);
  doc.text(seriesALabel, legA, startY + 1.8, { align: "right" });
  doc.setFillColor(...REPORT_RGB.deepTeal);
  doc.rect(legA - wA - 4.5, startY - 0.5, 2.8, 2.8, "F");

  // Gridlines
  for (let i = 0; i <= 3; i++) {
    const frac = i / 3;
    const gy = plotBottom - frac * plotH;
    doc.setDrawColor(...REPORT_RGB.subtleDivider);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, gy, plotRight, gy);
    doc.setFontSize(6.8);
    doc.setTextColor(...REPORT_RGB.mutedText);
    doc.text(Math.round(niceMax * frac).toLocaleString(), plotLeft - 2, gy + 1, {
      align: "right",
    });
  }

  const slotW = plotW / items.length;
  const barW = Math.min(7.5, slotW * 0.32);

  items.forEach((g, idx) => {
    const center = plotLeft + slotW * (idx + 0.5);
    const hA = (g.valueA / niceMax) * plotH;
    const hB = (g.valueB / niceMax) * plotH;

    doc.setFillColor(...REPORT_RGB.deepTeal);
    if (hA > 0) doc.rect(center - barW - 0.6, plotBottom - hA, barW, hA, "F");

    doc.setFillColor(...REPORT_CHART_SERIES_RGB[2]);
    if (hB > 0) doc.rect(center + 0.6, plotBottom - hB, barW, hB, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.6);
    doc.setTextColor(...REPORT_RGB.bodySlate);
    doc.text(truncateLabel(g.label, 14), center, plotBottom + 4.8, {
      align: "center",
    });
  });

  return y + height;
}
