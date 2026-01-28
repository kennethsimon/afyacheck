import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: "Afya Check",
  description: "Afya Check is a health care application",
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
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AppProviders>
          <div vaul-drawer-wrapper="" className="bg-background">
            {children}
          </div>
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
