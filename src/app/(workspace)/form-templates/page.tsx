"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  FilePlus2,
  Plus,
  Wand2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import {
  DataToolbar,
  FilterPopover,
  type ActiveFilterChip,
} from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import { StatusBadge } from "@/components/platform/states";
import {
  useFormSchemas,
  useFormSubmissions,
  useProjects,
  useUpdateFormSubmissionStatus,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import type { FormSchemaRecord, FormSubmissionRecord } from "@/lib/api/types";

export default function FormTemplatesPage() {
  const router = useRouter();
  const { projectId } = useWorkspace();

  const [projectFilter, setProjectFilter] = useState<string>(projectId || "all");
  const [search, setSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [subPage, setSubPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmissionRecord | null>(null);

  const projectsQuery = useProjects();
  const schemasQuery = useFormSchemas(
    projectFilter !== "all" ? projectFilter : undefined,
    true
  );
  const submissionsQuery = useFormSubmissions({
    project: projectFilter !== "all" ? projectFilter : undefined,
    status: subStatusFilter !== "all" ? subStatusFilter : undefined,
    page: subPage,
    limit: 20,
  });
  const updateStatus = useUpdateFormSubmissionStatus();

  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p._id, p.name])),
    [projects]
  );

  const filteredSchemas = useMemo(() => {
    const raw = schemasQuery.data ?? [];
    if (!search.trim()) return raw;
    const q = search.trim().toLowerCase();
    return raw.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [schemasQuery.data, search]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (projectFilter !== "all") {
      list.push({
        key: "project",
        label: "Project",
        value: projectMap.get(projectFilter) || projectFilter,
        onRemove: () => setProjectFilter("all"),
      });
    }
    return list;
  }, [projectFilter, projectMap]);

  const handleReviewStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const updated = await updateStatus.mutateAsync({ id, payload: { status } });
      toast.success(`Submission marked ${status}`);
      if (updated) setSelectedSubmission(updated);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update submission status"));
    }
  };

  const schemaColumns: ColumnDef<FormSchemaRecord>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Template",
        cell: ({ row }) => (
          <div>
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
        id: "project",
        header: "Project",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {projectMap.get(row.original.project) || "Assigned Project"}
          </span>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            v{row.original.version ?? 1}
          </span>
        ),
      },
      {
        id: "fieldsCount",
        header: "Fields",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs">
            {row.original.fields?.length ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge tone={row.original.isActive !== false ? "success" : "neutral"}>
            {row.original.isActive !== false ? "Published" : "Archived"}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/form-templates/forms/${row.original._id}`);
              }}
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              Fill
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/form-templates/builder?projectId=${row.original.project}&schemaId=${row.original._id}`
                );
              }}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [projectMap, router]
  );

  const submissionColumns: ColumnDef<FormSubmissionRecord>[] = useMemo(
    () => [
      {
        id: "form",
        header: "Form Template",
        cell: ({ row }) => {
          const schema = row.original.formSchema;
          return (
            <span className="font-medium text-foreground">
              {typeof schema === "object"
                ? `${schema.name} (v${schema.version ?? 1})`
                : "Form Submission"}
            </span>
          );
        },
      },
      {
        id: "submittedBy",
        header: "Submitted By",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.submittedBy?.name || "Staff"}
          </span>
        ),
      },
      {
        id: "patient",
        header: "Linked Patient",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.patient?.patientIdentifier ||
              row.original.patient?.name ||
              "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          const tone =
            s === "approved"
              ? "success"
              : s === "rejected"
              ? "critical"
              : s === "submitted"
              ? "info"
              : "warning";
          return (
            <StatusBadge tone={tone} className="capitalize">
              {s}
            </StatusBadge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")
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
                setSelectedSubmission(row.original);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Inspect
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Form Templates & Custom Programs"
        description="Design versioned data-collection templates, fill custom forms, and review submitted program responses."
        breadcrumbs={[
          { label: "Management", href: "/overview" },
          { label: "Form Templates" },
        ]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
            <Link
              href={
                projectFilter !== "all"
                  ? `/form-templates/builder?projectId=${projectFilter}`
                  : "/form-templates/builder"
              }
            >
              <Plus className="h-3.5 w-3.5" />
              New Form Template
            </Link>
          </Button>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search form templates..."
        chips={chips}
        onClearFilters={() => setProjectFilter("all")}
        filters={
          <FilterPopover activeCount={chips.length}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Health Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
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
            </div>
          </FilterPopover>
        }
      />

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="h-9 bg-muted/60 p-0.5">
          <TabsTrigger value="templates" className="text-xs gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            Templates ({filteredSchemas.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Submissions ({submissionsQuery.data?.total ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <EnterpriseDataTable
            columns={schemaColumns}
            data={filteredSchemas}
            isLoading={schemasQuery.isLoading}
            error={
              schemasQuery.isError ? getErrorMessage(schemasQuery.error) : null
            }
            onRetry={() => schemasQuery.refetch()}
            totalCount={filteredSchemas.length}
            emptyTitle="No form templates created yet"
            emptyDescription="Build your first structured form template to collect custom clinical or program data."
            emptyAction={
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/form-templates/builder">Create Template</Link>
              </Button>
            }
            onRowClick={(row) =>
              router.push(
                `/form-templates/builder?projectId=${row.project}&schemaId=${row._id}`
              )
            }
          />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-3">
          <div className="flex items-center justify-end">
            <Select
              value={subStatusFilter}
              onValueChange={(v) => {
                setSubStatusFilter(v);
                setSubPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-44 bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All submission states</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <EnterpriseDataTable
            columns={submissionColumns}
            data={submissionsQuery.data?.items ?? []}
            isLoading={submissionsQuery.isLoading}
            error={
              submissionsQuery.isError
                ? getErrorMessage(submissionsQuery.error)
                : null
            }
            onRetry={() => submissionsQuery.refetch()}
            page={subPage}
            pageCount={submissionsQuery.data?.pageCount ?? 1}
            pageSize={20}
            totalCount={submissionsQuery.data?.total}
            onPageChange={setSubPage}
            emptyTitle="No submissions recorded"
            emptyDescription="Fill out a published form template to record submissions."
            onRowClick={(row) => setSelectedSubmission(row)}
          />
        </TabsContent>
      </Tabs>

      {/* Submission Review Slide-Over Sheet */}
      <Sheet
        open={Boolean(selectedSubmission)}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSubmission && (
            <div className="space-y-5">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle className="text-base">Submission Review</SheetTitle>
                <SheetDescription className="text-xs">
                  Submitted by {selectedSubmission.submittedBy?.name || "Staff"} on{" "}
                  {selectedSubmission.createdAt
                    ? format(new Date(selectedSubmission.createdAt), "MMM d, yyyy HH:mm")
                    : "—"}
                </SheetDescription>
              </SheetHeader>

              <div className="flex items-center justify-between">
                <StatusBadge
                  tone={
                    selectedSubmission.status === "approved"
                      ? "success"
                      : selectedSubmission.status === "rejected"
                      ? "critical"
                      : "info"
                  }
                  className="capitalize"
                >
                  {selectedSubmission.status}
                </StatusBadge>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      handleReviewStatus(selectedSubmission._id, "rejected")
                    }
                    className="h-7 gap-1 text-xs text-destructive"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      handleReviewStatus(selectedSubmission._id, "approved")
                    }
                    className="h-7 gap-1 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recorded Responses (Preserved Schema Keys)
                </div>
                <dl className="divide-y divide-border rounded-md border border-border">
                  {Object.entries(selectedSubmission.responses || {}).map(
                    ([key, val]) => (
                      <div key={key} className="px-3.5 py-2.5 text-xs">
                        <dt className="font-mono text-[11px] text-muted-foreground">
                          {key}
                        </dt>
                        <dd className="mt-0.5 font-medium text-foreground">
                          {Array.isArray(val)
                            ? val.join(", ")
                            : typeof val === "boolean"
                            ? val
                              ? "Yes"
                              : "No"
                            : val === null || val === undefined || val === ""
                            ? "—"
                            : String(val)}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
