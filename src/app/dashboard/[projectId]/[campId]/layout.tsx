import React, { Suspense } from "react";
import { AppShell } from "@/components/platform/app-shell";
import { LoadingSkeleton } from "@/components/platform/states";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSkeleton variant="detail" />}>
        {children}
      </Suspense>
    </AppShell>
  );
}
