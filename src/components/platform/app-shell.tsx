"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { ContextSelector } from "./context-selector";
import { CommandPalette } from "./command-palette";
import { useWorkspace } from "@/lib/workspace-context";
import { getUserRoleLabel } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview",
  projects: "Projects",
  project: "Projects",
  camps: "Camps",
  patients: "Patients",
  clinical: "Clinical Screening",
  wellness: "Wellness",
  "mental-health": "Wellness",
  analytics: "Analytics",
  reports: "Reports",
  "form-templates": "Form Templates",
  team: "Team & Access",
  settings: "Settings",
  dashboard: "Camp Operations",
  new: "New",
};

export function AppShell({
  children,
  showContextSelector = true,
  fullBleed = false,
}: {
  children: React.ReactNode;
  showContextSelector?: boolean;
  fullBleed?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() || "";
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { setCommandOpen } = useWorkspace();

  const userName = session?.user?.name || "Clinician";
  const userUsername = (session?.user as any)?.username || "";
  const roleLabel = getUserRoleLabel(session as any);
  const initials = useMemo(() => {
    return userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "AC";
  }, [userName]);

  const topBreadcrumb = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0] || "overview";
    return ROUTE_LABELS[first] || "Workspace";
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/85">
          <div className="flex min-w-0 items-center gap-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="h-8 w-8 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              {topBreadcrumb}
            </span>

            {showContextSelector && (
              <>
                <span className="hidden h-4 w-px bg-border sm:inline-block" />
                <ContextSelector />
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="h-8 gap-2 border-border bg-background px-2.5 text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Search workspace...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                ⌘K
              </kbd>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 gap-2 px-2 text-left hover:bg-muted/70"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                    {initials}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-xs font-medium text-foreground xl:inline">
                    {userName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {userName}
                    </p>
                    {userUsername && (
                      <p className="text-[11px] text-muted-foreground">
                        @{userUsername}
                      </p>
                    )}
                    <p className="text-[10px] font-medium uppercase tracking-wide text-primary">
                      {roleLabel}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-xs">
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Workspace Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings?tab=account" className="cursor-pointer text-xs">
                    <UserIcon className="mr-2 h-3.5 w-3.5" />
                    Account & Permissions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="cursor-pointer text-xs text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            fullBleed ? "p-0" : "px-4 py-5 sm:px-6 lg:px-8"
          )}
        >
          <div className={cn(!fullBleed && "mx-auto max-w-[1440px] space-y-5")}>
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
