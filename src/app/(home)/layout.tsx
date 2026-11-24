import type { Metadata } from "next";
import { AppShell } from "@/components/platform/app-shell";

export const metadata: Metadata = {
  title: "Workspace",
  description: "AfyaCheck Clinical Operations Platform",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
