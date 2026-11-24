"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function RecordDetailLayout({
  header,
  sidebar,
  children,
  className,
}: {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      {header}
      <div
        className={cn(
          "grid gap-5",
          sidebar ? "lg:grid-cols-[1fr_320px]" : "grid-cols-1"
        )}
      >
        <div className="min-w-0 space-y-5">{children}</div>
        {sidebar && <aside className="space-y-4">{sidebar}</aside>}
      </div>
    </div>
  );
}

export function SectionedForm({
  title,
  description,
  badge,
  children,
  className,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StickyFormActions({
  children,
  helperText,
  className,
}: {
  children: React.ReactNode;
  helperText?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className
      )}
    >
      <div className="text-xs text-muted-foreground">{helperText}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function KeyValueGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 2 | 3 | 4;
}) {
  const gridCols =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2";

  return (
    <dl className={cn("grid gap-x-6 gap-y-3.5", gridCols)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <dt className="text-[11px] font-medium text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-xs font-medium text-foreground">
            {item.value ?? <span className="text-muted-foreground">Not recorded</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
