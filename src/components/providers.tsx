"use client";

import { SessionProvider } from "next-auth/react";
import Providers from "@/components/ProgressBarProvider";
import { SessionMonitor } from "@/components/session-monitor";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Providers>
        {children}
        <SessionMonitor />
      </Providers>
    </SessionProvider>
  );
}

