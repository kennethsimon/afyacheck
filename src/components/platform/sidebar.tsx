"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FolderKanban,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canAccessClinical,
  canManageUsers,
  isAdminSession,
} from "@/lib/permissions";
import { useWorkspace } from "@/lib/workspace-context";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefixes: string[];
  visible: boolean;
}

export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "";
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar } = useWorkspace();

  const collapsed = mobile ? false : sidebarCollapsed;
  const isAdmin = isAdminSession(session as any);
  const showClinical = canAccessClinical(session as any);
  const showTeam = canManageUsers(session as any);

  const workspaceItems: NavItem[] = [
    {
      label: "Overview",
      href: "/overview",
      icon: LayoutDashboard,
      matchPrefixes: ["/overview"],
      visible: true,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
      matchPrefixes: ["/projects", "/project"],
      visible: true,
    },
    {
      label: "Camps",
      href: "/camps",
      icon: MapPin,
      matchPrefixes: ["/camps"],
      visible: true,
    },
    {
      label: "Patients",
      href: "/patients",
      icon: Users,
      matchPrefixes: ["/patients"],
      visible: true,
    },
    {
      label: "Clinical",
      href: "/clinical",
      icon: Stethoscope,
      matchPrefixes: ["/clinical"],
      visible: showClinical,
    },
    {
      label: "Wellness",
      href: "/wellness",
      icon: HeartPulse,
      matchPrefixes: ["/wellness", "/mental-health"],
      visible: true,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      matchPrefixes: ["/analytics"],
      visible: true,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: FileSpreadsheet,
      matchPrefixes: ["/reports"],
      visible: true,
    },
  ].filter((item) => item.visible);

  const managementItems: NavItem[] = [
    {
      label: "Form Templates",
      href: "/form-templates",
      icon: Wand2,
      matchPrefixes: ["/form-templates"],
      visible: isAdmin,
    },
    {
      label: "Team & Access",
      href: "/team",
      icon: ShieldCheck,
      matchPrefixes: ["/team"],
      visible: showTeam,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      matchPrefixes: ["/settings"],
      visible: true,
    },
  ].filter((item) => item.visible);

  const isActive = (item: NavItem) => {
    // Handle camp detail nested under /projects/[id]/camps/[campId] cleanly
    if (
      item.href === "/camps" &&
      /^\/projects\/[^/]+\/camps/.test(pathname)
    ) {
      return true;
    }
    if (
      item.href === "/projects" &&
      /^\/projects\/[^/]+\/camps/.test(pathname)
    ) {
      return false;
    }
    return item.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  };

  const renderGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-0.5">
      {!collapsed && (
        <div className="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/75">
          {title}
        </div>
      )}
      {collapsed && <div className="my-1.5 border-t border-border/60" />}
      {items.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        const linkEl = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "justify-center px-0",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        }
        return linkEl;
      })}
    </div>
  );

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-[58px]" : "w-[228px]",
        mobile && "w-full border-r-0"
      )}
    >
      {/* Brand Bar */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/overview"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-none tracking-tight text-foreground">
                AfyaCheck
              </div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground">
                Clinical Operations
              </div>
            </div>
          )}
        </Link>
        {!mobile && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {renderGroup("Workspace", workspaceItems)}
        {managementItems.length > 0 && renderGroup("Management", managementItems)}
      </nav>

      {/* Footer Collapse Control when collapsed */}
      {!mobile && collapsed && (
        <div className="flex justify-center border-t border-border py-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Expand sidebar
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
