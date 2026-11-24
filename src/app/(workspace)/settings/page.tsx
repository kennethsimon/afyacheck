"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/platform/page-header";
import {
  KeyValueGrid,
  SectionedForm,
} from "@/components/platform/record-detail-layout";
import { StatusBadge } from "@/components/platform/states";
import { useWorkspace } from "@/lib/workspace-context";
import {
  getUserPermissionNames,
  getUserRoleLabel,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, setSidebarCollapsed, projectId, campId } =
    useWorkspace();

  const user = session?.user as any;
  const permissions = getUserPermissionNames(session as any);
  const roleLabel = getUserRoleLabel(session as any);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Workspace Settings"
        description="Configure interface preferences, review your clinical permissions, and inspect security posture."
        breadcrumbs={[
          { label: "Management", href: "/overview" },
          { label: "Settings" },
        ]}
      />

      <SectionedForm
        title="Appearance & Navigation"
        description="Preferences are saved locally per browser session."
      >
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <div className="text-xs font-medium text-foreground">Theme</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.id;
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    variant="outline"
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "h-9 justify-start gap-2 text-xs",
                      active && "border-primary bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
            <div>
              <div className="text-xs font-medium text-foreground">
                Compact Collapsed Sidebar
              </div>
              <div className="text-[11px] text-muted-foreground">
                Keep the navigation rail collapsed with hover tooltips for wider clinical tables.
              </div>
            </div>
            <Switch
              checked={sidebarCollapsed}
              onCheckedChange={setSidebarCollapsed}
            />
          </div>
        </div>
      </SectionedForm>

      <SectionedForm
        title="Account & Granted Permissions"
        description="Your active session identity and role-based access rights."
      >
        <div className="space-y-4">
          <KeyValueGrid
            columns={3}
            items={[
              { label: "Full Name", value: user?.name || "—" },
              {
                label: "Username",
                value: user?.username ? `@${user.username}` : "—",
              },
              { label: "Assigned Role(s)", value: roleLabel },
              {
                label: "Active Project Scope",
                value: projectId === "all" ? "All Projects" : projectId,
              },
              {
                label: "Active Camp Scope",
                value: campId === "all" ? "All Camps" : campId,
              },
              {
                label: "Account Status",
                value: <StatusBadge tone="success">Active Session</StatusBadge>,
              },
            ]}
          />

          <div className="border-t border-border pt-4 space-y-2">
            <div className="text-xs font-medium text-foreground">
              Granted Permissions ({permissions.length})
            </div>
            {permissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No granular permissions attached to this session.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((perm) => (
                  <StatusBadge key={perm} tone="neutral" dot={false}>
                    {perm}
                  </StatusBadge>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionedForm>

      <SectionedForm
        title="Security & Clinical Data Safeguards"
        description="Active architectural safeguards protecting patient information."
      >
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="space-y-1.5 leading-relaxed">
            <p>
              • <strong className="text-foreground">Server-Side API Boundary:</strong> All browser data requests route through <code className="rounded bg-muted px-1">/api/backend/*</code>; raw backend JWTs remain inside HttpOnly encrypted session cookies.
            </p>
            <p>
              • <strong className="text-foreground">Zero PHI Console Logging:</strong> Credentials, tokens, and patient records are scrubbed from application logs.
            </p>
            <p>
              • <strong className="text-foreground">Privacy-First Reporting:</strong> Standard report and CSV exports exclude patient identifiers by default.
            </p>
          </div>
        </div>
      </SectionedForm>
    </div>
  );
}
