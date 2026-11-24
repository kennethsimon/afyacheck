"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  denominator?: string;
  delta?: {
    value: string;
    direction: "up" | "down" | "flat";
    positiveIsGood?: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  denominator,
  delta,
  icon: Icon,
  className,
}: MetricCardProps) {
  const deltaTone = (() => {
    if (!delta || delta.direction === "flat") return "text-muted-foreground";
    const positiveGood = delta.positiveIsGood ?? true;
    const isGood =
      (delta.direction === "up" && positiveGood) ||
      (delta.direction === "down" && !positiveGood);
    return isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  })();

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-border/80",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 tabular-nums text-xs font-medium",
              deltaTone
            )}
          >
            {delta.direction === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
            {delta.direction === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta.direction === "flat" && <Minus className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {(sublabel || denominator) && (
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{sublabel}</span>
          {denominator && (
            <span className="shrink-0 tabular-nums font-mono text-[10px] text-muted-foreground/80">
              {denominator}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
