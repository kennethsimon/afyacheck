/**
 * AfyaCheck Unified Report Design System Tokens
 *
 * Restrained institutional palette designed for executive clarity,
 * print precision, and grayscale readability.
 */

export type RgbTuple = [number, number, number];

export const REPORT_COLORS = {
  primaryTeal: "#106D75",
  deepTeal: "#084C53",
  softTealTint: "#EDF6F7",
  paleTealTint: "#F4F9FA",
  darkNavy: "#101828",
  bodySlate: "#344054",
  mutedText: "#667085",
  lightNeutral: "#F5F7F9",
  border: "#E2E8F0",
  subtleDivider: "#EAECF0",
  white: "#FFFFFF",
  // Grayscale-differentiated semantic tones (distinct luminance steps)
  positive: "#166534",
  warning: "#B45309",
  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  critical: "#991B1B",
  criticalBg: "#FEF2F2",
  criticalBorder: "#FECACA",
} as const;

export const REPORT_RGB: Record<keyof typeof REPORT_COLORS, RgbTuple> = {
  primaryTeal: [16, 109, 117],
  deepTeal: [8, 76, 83],
  softTealTint: [237, 246, 247],
  paleTealTint: [244, 249, 250],
  darkNavy: [16, 24, 40],
  bodySlate: [52, 64, 84],
  mutedText: [102, 112, 133],
  lightNeutral: [245, 247, 249],
  border: [226, 232, 240],
  subtleDivider: [234, 236, 240],
  white: [255, 255, 255],
  positive: [22, 101, 52],
  warning: [180, 83, 9],
  warningBg: [255, 251, 235],
  warningBorder: [253, 230, 138],
  critical: [153, 27, 27],
  criticalBg: [254, 242, 242],
  criticalBorder: [254, 202, 202],
};

/**
 * Print-safe and grayscale-distinguishable chart series palette.
 * Luminance steps are deliberately separated so adjacent bars/slices remain legible in B&W print.
 */
export const REPORT_CHART_SERIES_HEX = [
  "#084C53", // Deep Teal (darkest)
  "#106D75", // Primary Teal
  "#2F8F9D", // Medium Teal
  "#64748B", // Neutral Slate
  "#94A3B8", // Light Slate
  "#CBD5E1", // Pale Mist (unrecorded / other)
] as const;

export const REPORT_CHART_SERIES_RGB: RgbTuple[] = [
  [8, 76, 83],
  [16, 109, 117],
  [47, 143, 157],
  [100, 116, 139],
  [148, 163, 184],
  [203, 213, 225],
];

export const REPORT_PAGE = {
  widthMm: 210,
  heightMm: 297,
  marginX: 16,
  marginTop: 22,
  marginBottom: 20,
  headerY: 11,
  footerY: 287,
  contentWidthMm: 210 - 32, // 178mm
} as const;

export function formatPct(part: number, total: number): string {
  if (!total || total <= 0) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

export function formatReportDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatReportDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Neutralizes spreadsheet formula injection (CWE-1236) before writing to CSV/XLSX.
 */
export function sanitizeSpreadsheetValue(value: unknown): string | number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(raw)) {
    return `'${raw}`;
  }
  return raw;
}

export function safeFilenameSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "report"
  );
}
