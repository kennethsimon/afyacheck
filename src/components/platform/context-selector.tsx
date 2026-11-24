"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FolderKanban, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCamps, useProjects } from "@/lib/api/hooks";
import { useWorkspace } from "@/lib/workspace-context";
import { getUserAssignedCampId, isAdminSession } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function ContextSelector({ compact = false }: { compact?: boolean }) {
  const { projectId, campId, setProjectId, setCampId } = useWorkspace();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = isAdminSession(session as any);
  const assignedCampId = getUserAssignedCampId(session as any);

  const { data: projectsData } = useProjects();
  const { data: campsData } = useCamps(projectId);

  const projects = useMemo(
    () => projectsData?.projects ?? [],
    [projectsData?.projects]
  );

  const camps = useMemo(() => {
    const raw = campsData?.camps ?? [];
    if (!isAdmin && assignedCampId) {
      return raw.filter((c) => c._id === assignedCampId);
    }
    return raw;
  }, [campsData?.camps, isAdmin, assignedCampId]);

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);

    // Keep deep-linked dashboard routes synced without losing current tab
    const dashboardMatch = pathname?.match(/^\/dashboard\/([^/]+)\/([^/]+)(.*)$/);
    if (dashboardMatch) {
      const suffix = dashboardMatch[3] || "";
      router.push(`/dashboard/${nextProjectId}/all${suffix}`);
      return;
    }

    const projectDetailMatch = pathname?.match(/^\/projects\/([^/]+)$/);
    if (projectDetailMatch && nextProjectId !== "all") {
      router.push(`/projects/${nextProjectId}`);
    }
  };

  const handleCampChange = (nextCampId: string) => {
    setCampId(nextCampId);

    const dashboardMatch = pathname?.match(/^\/dashboard\/([^/]+)\/([^/]+)(.*)$/);
    if (dashboardMatch) {
      const currentProj = dashboardMatch[1];
      const suffix = dashboardMatch[3] || "";
      router.push(`/dashboard/${currentProj}/${nextCampId}${suffix}`);
      return;
    }

    const campDetailMatch = pathname?.match(
      /^\/projects\/([^/]+)\/camps\/([^/]+)$/
    );
    if (campDetailMatch && nextCampId !== "all") {
      router.push(`/projects/${campDetailMatch[1]}/camps/${nextCampId}`);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", compact && "flex-wrap")}>
      <div className="flex items-center">
        <Select value={projectId} onValueChange={handleProjectChange}>
          <SelectTrigger
            aria-label="Select active project"
            className="h-8 w-[150px] gap-1.5 border-border bg-background text-xs font-medium sm:w-[175px]"
          >
            <FolderKanban className="h-3.5 w-3.5 shrink-0 text-primary" />
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-xs text-muted-foreground/50">/</span>

      <div className="flex items-center">
        <Select value={campId} onValueChange={handleCampChange}>
          <SelectTrigger
            aria-label="Select active camp"
            className={cn(
              "h-8 w-[150px] gap-1.5 border-border bg-background text-xs font-medium sm:w-[180px]",
              campId !== "all" && "border-primary/40 bg-accent/40 text-foreground"
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <SelectValue placeholder="All camps" />
          </SelectTrigger>
          <SelectContent>
            {isAdmin && <SelectItem value="all">All camps</SelectItem>}
            {camps.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
            {camps.length === 0 && !isAdmin && (
              <SelectItem value="all">No camp assigned</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
