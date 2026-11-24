"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  FolderKanban,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/platform/page-header";
import {
  DataToolbar,
  FilterPopover,
  type ActiveFilterChip,
} from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { useCamps, useCustomProjects, useProjects } from "@/lib/api/hooks";
import { useWorkspace } from "@/lib/workspace-context";
import { canManageProjects } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";

interface ProjectRow extends Project {
  programType: "custom" | "standard";
  campCount: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setProjectId } = useWorkspace();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "standard" | "custom">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const projectsQuery = useProjects();
  const customProjectsQuery = useCustomProjects();
  const campsQuery = useCamps("all");

  const customIds = useMemo(
    () => new Set((customProjectsQuery.data ?? []).map((p) => p._id)),
    [customProjectsQuery.data]
  );

  const campCountsByProject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const camp of campsQuery.data?.camps ?? []) {
      const pid =
        typeof camp.project === "string"
          ? camp.project
          : camp.project?._id || camp.projectDetails?.[0]?._id;
      if (pid) counts.set(pid, (counts.get(pid) ?? 0) + 1);
    }
    return counts;
  }, [campsQuery.data?.camps]);

  const rows: ProjectRow[] = useMemo(() => {
    const all = projectsQuery.data?.projects ?? [];
    return all
      .map((p) => ({
        ...p,
        programType: customIds.has(p._id) ? ("custom" as const) : ("standard" as const),
        campCount: campCountsByProject.get(p._id) ?? 0,
      }))
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (statusFilter === "active" && p.active === false) return false;
        if (statusFilter === "inactive" && p.active !== false) return false;
        if (typeFilter !== "all" && p.programType !== typeFilter) return false;
        return true;
      });
  }, [projectsQuery.data?.projects, customIds, campCountsByProject, search, statusFilter, typeFilter]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (statusFilter !== "all") {
      list.push({
        key: "status",
        label: "Status",
        value: statusFilter === "active" ? "Active" : "Inactive",
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (typeFilter !== "all") {
      list.push({
        key: "type",
        label: "Program Type",
        value: typeFilter === "custom" ? "Custom Program" : "Clinical Camp",
        onRemove: () => setTypeFilter("all"),
      });
    }
    return list;
  }, [statusFilter, typeFilter]);

  const canCreate = canManageProjects(session as any);

  const columns: ColumnDef<ProjectRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium text-foreground">{row.original.name}</div>
            {row.original.description && (
              <div className="mt-0.5 max-w-md truncate text-[11px] text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "programType",
        header: "Program Type",
        cell: ({ row }) =>
          row.original.programType === "custom" ? (
            <StatusBadge tone="info" dot={false}>
              <Wand2 className="h-3 w-3" />
              Custom Forms
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral" dot={false}>
              Clinical Outreach
            </StatusBadge>
          ),
      },
      {
        accessorKey: "campCount",
        header: "Camps",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 tabular-nums text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.campCount}
          </span>
        ),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={row.original.active !== false ? "success" : "neutral"}>
            {row.original.active !== false ? "Active" : "Inactive"}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM d, yyyy")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setProjectId(row.original._id);
                router.push(`/projects/${row.original._id}`);
              }}
            >
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [router, setProjectId]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Health Projects"
        description="Manage outreach health programs, field camps, form configurations, and program-level reporting."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Projects" },
        ]}
        actions={
          canCreate ? (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/projects/new">
                <Plus className="h-3.5 w-3.5" />
                Create Project
              </Link>
            </Button>
          ) : undefined
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects by name or description..."
        chips={chips}
        onClearFilters={() => {
          setStatusFilter("all");
          setTypeFilter("all");
        }}
        filters={
          <FilterPopover activeCount={chips.length}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v: any) => setStatusFilter(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Program Type</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(v: any) => setTypeFilter(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All program types</SelectItem>
                    <SelectItem value="standard">Clinical Outreach</SelectItem>
                    <SelectItem value="custom">Custom Forms Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FilterPopover>
        }
        actions={
          <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("table")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      {viewMode === "table" ? (
        <EnterpriseDataTable
          columns={columns}
          data={rows}
          isLoading={projectsQuery.isLoading}
          error={
            projectsQuery.isError
              ? getErrorMessage(projectsQuery.error)
              : null
          }
          onRetry={() => projectsQuery.refetch()}
          totalCount={rows.length}
          emptyTitle="No health projects match your criteria"
          emptyDescription="Create a health project to organize camps, clinical screening forms, and analytics."
          emptyAction={
            canCreate ? (
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/projects/new">Create Project</Link>
              </Button>
            ) : undefined
          }
          onRowClick={(row) => {
            setProjectId(row._id);
            router.push(`/projects/${row._id}`);
          }}
        />
      ) : projectsQuery.isLoading ? (
        <LoadingSkeleton variant="cards" rows={6} />
      ) : projectsQuery.isError ? (
        <ErrorState
          description={getErrorMessage(projectsQuery.error)}
          onRetry={() => projectsQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No health projects match your criteria"
          description="Try clearing your filters or create a new health project."
          action={
            canCreate ? (
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/projects/new">Create Project</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              onClick={() => setProjectId(project._id)}
              className="group flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <StatusBadge
                    tone={project.active !== false ? "success" : "neutral"}
                  >
                    {project.active !== false ? "Active" : "Inactive"}
                  </StatusBadge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  {project.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 tabular-nums font-medium text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {project.campCount} camp{project.campCount === 1 ? "" : "s"}
                </span>
                <span>
                  {project.programType === "custom"
                    ? "Custom Forms"
                    : "Clinical Outreach"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
