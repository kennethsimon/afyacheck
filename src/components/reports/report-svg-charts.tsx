"use client";

import React from "react";
import {
  formatRateOrNA,
  REPORT_CHART_SERIES_HEX,
  REPORT_COLORS,
} from "@/lib/reports/tokens";

/**
 * Pure SVG print-matched charts for the AfyaCheck WYSIWYG Report Preview.
 * Uses identical palette, geometry, denominators, and grayscale-safe luminance
 * contrast as `src/lib/reports/pdf-charts.ts`.
 */

export function ReportHorizontalBarSvg({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Array<{ label: string; count: number; percentage: number | null }>;
}) {
  const rows = items.slice(0, 10);
  const maxVal = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
      <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
      )}
      {rows.length === 0 || rows.every((r) => r.count === 0) ? (
        <div className="mt-4 py-3 text-[11px] italic text-[#667085]">
          No recorded observations for this reporting scope.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((item, idx) => {
            const isUnrecorded = item.label.toLowerCase().includes("unrecorded");
            const color = isUnrecorded
              ? "#94A3B8"
              : REPORT_CHART_SERIES_HEX[idx % 3];
            const widthPct = item.count > 0 ? Math.max(2, (item.count / maxVal) * 100) : 0;
            return (
              <div
                key={`${item.label}-${idx}`}
                className="grid grid-cols-[140px_1fr_92px] items-center gap-2.5 text-[10.5px]"
              >
                <span
                  className={
                    isUnrecorded
                      ? "truncate italic text-[#667085]"
                      : "truncate text-[#344054]"
                  }
                  title={item.label}
                >
                  {item.label}
                </span>
                <div className="h-3 w-full overflow-hidden rounded-[3px] bg-[#F5F7F9]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{ width: `${widthPct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="text-right font-semibold tabular-nums text-[#101828]">
                  {item.count.toLocaleString()} ({formatRateOrNA(item.percentage)})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReportDonutSvg({
  title,
  subtitle,
  centerLabel = "Total",
  items,
}: {
  title: string;
  subtitle?: string;
  centerLabel?: string;
  items: Array<{ label: string; count: number; percentage: number | null }>;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  const radius = 38;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = items
    .filter((i) => i.count > 0)
    .map((item, idx) => {
      const fraction = total > 0 ? item.count / total : 0;
      const dash = fraction * circumference;
      const offset = -cumulative * circumference;
      cumulative += fraction;
      const color = item.label.toLowerCase().includes("unrecorded")
        ? "#CBD5E1"
        : REPORT_CHART_SERIES_HEX[idx % REPORT_CHART_SERIES_HEX.length];
      return { ...item, dash, offset, color };
    });

  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
      <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
      )}
      {total === 0 ? (
        <div className="mt-4 py-3 text-[11px] italic text-[#667085]">
          No recorded observations for this reporting scope.
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-4">
          <svg
            width="104"
            height="104"
            viewBox="0 0 104 104"
            className="shrink-0"
            role="img"
            aria-label={title}
          >
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke="#F5F7F9"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg, i) => (
              <circle
                key={`${seg.label}-${i}`}
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dash} ${circumference}`}
                strokeDashoffset={seg.offset}
                transform="rotate(-90 52 52)"
              />
            ))}
            <text
              x="52"
              y="50"
              textAnchor="middle"
              className="fill-[#101828] text-[13px] font-bold"
            >
              {total.toLocaleString()}
            </text>
            <text
              x="52"
              y="62"
              textAnchor="middle"
              className="fill-[#667085] text-[8.5px]"
            >
              {centerLabel}
            </text>
          </svg>
          <div className="min-w-0 flex-1 space-y-1.5">
            {items.slice(0, 6).map((item, idx) => {
              const color = item.label.toLowerCase().includes("unrecorded")
                ? "#CBD5E1"
                : REPORT_CHART_SERIES_HEX[idx % REPORT_CHART_SERIES_HEX.length];
              return (
                <div
                  key={`${item.label}-${idx}`}
                  className="flex items-center justify-between gap-2 text-[10.5px]"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate text-[#344054]">{item.label}</span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-[#101828]">
                    {item.count.toLocaleString()} ({formatRateOrNA(item.percentage)})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportStackedBarSvg({
  title,
  subtitle,
  segments,
}: {
  title: string;
  subtitle?: string;
  segments: Array<{ label: string; count: number; color: string }>;
}) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);

  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
      <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
      {subtitle && (
        <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
      )}
      <div className="mt-3 flex h-4 w-full overflow-hidden rounded bg-[#F5F7F9]">
        {total > 0 &&
          segments.map((seg, idx) => {
            if (seg.count <= 0) return null;
            const pct = (seg.count / total) * 100;
            return (
              <div
                key={`${seg.label}-${idx}`}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="h-full"
              />
            );
          })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[10.5px] text-[#344054]">
        {segments.map((seg, idx) => {
          const pct = total > 0 ? ((seg.count / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={`${seg.label}-${idx}`} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: seg.color }}
              />
              <span>
                {seg.label}:{" "}
                <strong className="tabular-nums text-[#101828]">
                  {seg.count.toLocaleString()} ({pct}%)
                </strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportLineTrendSvg({
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  points,
}: {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  points: Array<{ label: string; primary: number; secondary?: number }>;
}) {
  const sampled =
    points.length > 24
      ? points.filter(
          (_, i) =>
            i === 0 ||
            i === points.length - 1 ||
            i % Math.ceil(points.length / 20) === 0
        )
      : points;

  const w = 620;
  const h = 155;
  const padL = 40;
  const padR = 16;
  const padT = 14;
  const padB = 26;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const maxVal = Math.max(
    1,
    ...sampled.map((p) => Math.max(p.primary, p.secondary ?? 0))
  );
  const niceMax = Math.ceil(maxVal / 5) * 5 || maxVal;

  const coord = (idx: number, val: number) => ({
    x: padL + (idx / Math.max(1, sampled.length - 1)) * plotW,
    y: padT + plotH - (val / niceMax) * plotH,
  });

  const primaryPath = sampled
    .map((p, i) => {
      const c = coord(i, p.primary);
      return `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    })
    .join(" ");

  const secondaryPath = secondaryLabel
    ? sampled
        .map((p, i) => {
          const c = coord(i, p.secondary ?? 0);
          return `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
        })
        .join(" ")
    : "";

  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#344054]">
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-3.5"
              style={{ backgroundColor: REPORT_COLORS.primaryTeal }}
            />
            {primaryLabel}
          </span>
          {secondaryLabel && (
            <span className="flex items-center gap-1.5 text-[#667085]">
              <span className="h-0.5 w-3.5 bg-[#64748B]" />
              {secondaryLabel}
            </span>
          )}
        </div>
      </div>

      {sampled.length < 2 ? (
        <div className="mt-3 py-3 text-[11px] italic text-[#667085]">
          Insufficient time-series points for trend visualization.
        </div>
      ) : (
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img" aria-label={title}>
          {[0, 0.33, 0.67, 1].map((frac, idx) => {
            const gy = padT + plotH - frac * plotH;
            return (
              <g key={idx}>
                <line
                  x1={padL}
                  y1={gy}
                  x2={w - padR}
                  y2={gy}
                  stroke="#EAECF0"
                  strokeWidth="1"
                />
                <text
                  x={padL - 6}
                  y={gy + 3}
                  textAnchor="end"
                  className="fill-[#667085] text-[9px]"
                >
                  {Math.round(niceMax * frac).toLocaleString()}
                </text>
              </g>
            );
          })}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
          )}
          <path
            d={primaryPath}
            fill="none"
            stroke={REPORT_COLORS.primaryTeal}
            strokeWidth="2.2"
          />
          {sampled.map((p, i) => {
            const c = coord(i, p.primary);
            return (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="2.8"
                fill={REPORT_COLORS.primaryTeal}
              />
            );
          })}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
            const idx = Math.round(frac * (sampled.length - 1));
            const c = coord(idx, 0);
            return (
              <text
                key={i}
                x={c.x}
                y={h - 6}
                textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
                className="fill-[#667085] text-[9px]"
              >
                {sampled[idx].label}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function ReportGroupedBarSvg({
  title,
  subtitle,
  seriesALabel,
  seriesBLabel,
  groups,
}: {
  title: string;
  subtitle?: string;
  seriesALabel: string;
  seriesBLabel: string;
  groups: Array<{ label: string; valueA: number; valueB: number }>;
}) {
  const items = groups.slice(0, 7);
  const w = 620;
  const h = 165;
  const padL = 40;
  const padR = 14;
  const padT = 12;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const maxVal = Math.max(1, ...items.map((g) => Math.max(g.valueA, g.valueB)));
  const niceMax = Math.ceil(maxVal / 5) * 5 || maxVal;
  const slotW = plotW / Math.max(1, items.length);
  const barW = Math.min(20, slotW * 0.3);

  return (
    <div className="rounded-md border border-[#E2E8F0] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-semibold text-[#101828]">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-[10px] text-[#667085]">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#344054]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#084C53]" />
            {seriesALabel}
          </span>
          <span className="flex items-center gap-1.5 text-[#667085]">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2F8F9D]" />
            {seriesBLabel}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full" role="img" aria-label={title}>
        {[0, 0.33, 0.67, 1].map((frac, idx) => {
          const gy = padT + plotH - frac * plotH;
          return (
            <g key={idx}>
              <line x1={padL} y1={gy} x2={w - padR} y2={gy} stroke="#EAECF0" />
              <text
                x={padL - 6}
                y={gy + 3}
                textAnchor="end"
                className="fill-[#667085] text-[9px]"
              >
                {Math.round(niceMax * frac).toLocaleString()}
              </text>
            </g>
          );
        })}
        {items.map((g, idx) => {
          const cx = padL + slotW * (idx + 0.5);
          const hA = (g.valueA / niceMax) * plotH;
          const hB = (g.valueB / niceMax) * plotH;
          const shortLabel =
            g.label.length > 14 ? `${g.label.slice(0, 13)}…` : g.label;
          return (
            <g key={`${g.label}-${idx}`}>
              <rect
                x={cx - barW - 2}
                y={padT + plotH - hA}
                width={barW}
                height={hA}
                rx="2"
                fill="#084C53"
              />
              <rect
                x={cx + 2}
                y={padT + plotH - hB}
                width={barW}
                height={hB}
                rx="2"
                fill="#2F8F9D"
              />
              <text
                x={cx}
                y={h - 8}
                textAnchor="middle"
                className="fill-[#344054] text-[9px]"
              >
                {shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
