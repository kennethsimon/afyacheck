import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "AfyaCheck — Enterprise Clinical Operations",
    template: "%s | AfyaCheck",
  },
  description:
    "Enterprise healthcare operations platform for health projects, medical camps, patient registration, clinical screening, wellness assessments, and reporting.",
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontSans.variable
        )}
      >
        <AppProviders>
          <div vaul-drawer-wrapper="" className="min-h-screen bg-background">
            {children}
          </div>
        </AppProviders>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
