"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, FolderKanban, MapPin, Plus } from "lucide-react";
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
import { StatusBadge } from "@/components/platform/states";
import { useCamps, useProjects } from "@/lib/api/hooks";
import { useWorkspace } from "@/lib/workspace-context";
import { canManageCamps } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/api/client";
import type { Camp } from "@/lib/api/types";

interface CampRow extends Camp {
  parentProjectId: string;
  parentProjectName: string;
}

export default function CampsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { projectId, setContext } = useWorkspace();

  const [search, setSearch] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>(
    projectId || "all"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const projectsQuery = useProjects();
  const campsQuery = useCamps(selectedProjectFilter);

  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects]
  );

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p._id, p.name])),
    [projects]
  );

  const rows: CampRow[] = useMemo(() => {
    const raw = campsQuery.data?.camps ?? [];
    return raw
      .map((camp) => {
        const parentProjectId =
          typeof camp.project === "string"
            ? camp.project
            : camp.project?._id || camp.projectDetails?.[0]?._id || "all";
        const parentProjectName =
          (typeof camp.project === "object" && camp.project?.name) ||
          camp.projectDetails?.[0]?.name ||
          projectMap.get(parentProjectId) ||
          "Unassigned Project";

        return {
          ...camp,
          parentProjectId,
          parentProjectName,
        };
      })
      .filter((c) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !c.name?.toLowerCase().includes(q) &&
            !c.description?.toLowerCase().includes(q) &&
            !c.parentProjectName.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        if (statusFilter === "active" && c.active === false) return false;
        if (statusFilter === "inactive" && c.active !== false) return false;
        return true;
      });
  }, [campsQuery.data?.camps, projectMap, search, statusFilter]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (selectedProjectFilter !== "all") {
      list.push({
        key: "project",
        label: "Project",
        value: projectMap.get(selectedProjectFilter) || selectedProjectFilter,
        onRemove: () => setSelectedProjectFilter("all"),
      });
    }
    if (statusFilter !== "all") {
      list.push({
        key: "status",
        label: "Status",
        value: statusFilter === "active" ? "Active" : "Inactive",
        onRemove: () => setStatusFilter("all"),
      });
    }
    return list;
  }, [selectedProjectFilter, statusFilter, projectMap]);

  const canCreate = canManageCamps(session as any);
  const createHref =
    selectedProjectFilter !== "all"
      ? `/projects/${selectedProjectFilter}/camps/new`
      : "/camps/new";

  const columns: ColumnDef<CampRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Camp",
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{row.original.name}</span>
            </div>
            {row.original.description && (
              <div className="mt-0.5 max-w-md truncate text-[11px] text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "parentProjectName",
        header: "Parent Project",
        cell: ({ row }) => (
          <Link
            href={`/projects/${row.original.parentProjectId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>{row.original.parentProjectName}</span>
          </Link>
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
                setContext(row.original.parentProjectId, row.original._id);
                router.push(
                  `/projects/${row.original.parentProjectId}/camps/${row.original._id}`
                );
              }}
            >
              Open camp
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [router, setContext]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Health Camps"
        description="First-class field outreach sites linked to health projects. Open any camp to view participants, screenings, and analytics."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Camps" },
        ]}
        actions={
          canCreate ? (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={createHref}>
                <Plus className="h-3.5 w-3.5" />
                Create Camp
              </Link>
            </Button>
          ) : undefined
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search camps by name, description, or project..."
        chips={chips}
        onClearFilters={() => {
          setSelectedProjectFilter("all");
          setStatusFilter("all");
        }}
        filters={
          <FilterPopover activeCount={chips.length}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Parent Project</Label>
                <Select
                  value={selectedProjectFilter}
                  onValueChange={setSelectedProjectFilter}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
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
            </div>
          </FilterPopover>
        }
      />

      <EnterpriseDataTable
        columns={columns}
        data={rows}
        isLoading={campsQuery.isLoading}
        error={campsQuery.isError ? getErrorMessage(campsQuery.error) : null}
        onRetry={() => campsQuery.refetch()}
        totalCount={rows.length}
        emptyTitle="No camps found"
        emptyDescription="Create a camp under an active project to begin patient registration and clinical screening."
        emptyAction={
          canCreate ? (
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href={createHref}>Create Camp</Link>
            </Button>
          ) : undefined
        }
        onRowClick={(row) => {
          setContext(row.parentProjectId, row._id);
          router.push(`/projects/${row.parentProjectId}/camps/${row._id}`);
        }}
      />
    </div>
  );
}
