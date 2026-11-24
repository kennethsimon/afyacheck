"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./states";

export interface ChartDatum {
  name: string;
  value: number;
  secondary?: number;
}

export interface AnalyticsChartProps {
  title: string;
  description?: string;
  type: "line" | "bar" | "horizontal-bar";
  data: ChartDatum[];
  valueLabel?: string;
  denominator?: string;
  periodLabel?: string;
  sampleSize?: number;
  height?: number;
  className?: string;
}

export function AnalyticsChart({
  title,
  description,
  type,
  data,
  valueLabel = "Count",
  denominator,
  periodLabel,
  sampleSize,
  height = 240,
  className,
}: AnalyticsChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  const lowSample = sampleSize !== undefined && sampleSize > 0 && sampleSize < 10;

  return (
    <div
      data-report-chart={title}
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {periodLabel && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
              {periodLabel}
            </span>
          )}
          {denominator && (
            <span className="tabular-nums font-mono text-[10px]">
              {denominator}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4">
        {!hasData ? (
          <EmptyState
            title="No recorded data for this period"
            description="Zero matching records were returned by the server for the active project, camp, and filter selection."
            className="py-8"
          />
        ) : (
          <div style={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(val: any) => [
                      Number(val).toLocaleString(),
                      valueLabel,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : type === "horizontal-bar" ? (
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(val: any) => [
                      Number(val).toLocaleString(),
                      valueLabel,
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              ) : (
                <BarChart
                  data={data}
                  margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(val: any) => [
                      Number(val).toLocaleString(),
                      valueLabel,
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {lowSample && (
        <div className="flex items-center gap-1.5 border-t border-border/60 bg-amber-500/5 px-4 py-2 text-[11px] text-amber-700 dark:text-amber-400">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Small sample size (n = {sampleSize}). Interpret percentages with caution.
        </div>
      )}
    </div>
  );
}
