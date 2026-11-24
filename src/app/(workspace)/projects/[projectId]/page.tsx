"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import { MetricCard } from "@/components/platform/metric-card";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { SectionedForm } from "@/components/platform/record-detail-layout";
import { PatientsRegisterView } from "@/components/workspaces/patients-register-view";
import { AnalyticsWorkspaceView } from "@/components/workspaces/analytics-workspace-view";
import { ReportsWorkspaceView } from "@/components/workspaces/reports-workspace-view";
import {
  useCampAnalytics,
  useCamps,
  useCampStats,
  useDeleteProject,
  useFormSchemas,
  useProject,
  useUpdateProject,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { canManageCamps, canManageProjects, isAdminSession } from "@/lib/permissions";
import { useWorkspace } from "@/lib/workspace-context";

export default function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { setContext } = useWorkspace();

  const defaultTab = searchParams?.get("tab") || "overview";

  const projectQuery = useProject(params.projectId);
  const campsQuery = useCamps(params.projectId);
  const statsQuery = useCampStats({ projectId: params.projectId, campId: "all" });
  const analyticsQuery = useCampAnalytics({
    projectId: params.projectId,
    campId: "all",
  });
  const schemasQuery = useFormSchemas(params.projectId, true);

  const updateProject = useUpdateProject(params.projectId);
  const deleteProject = useDeleteProject();

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const p = projectQuery.data;
    if (!p) return;
    setEditName(p.name || "");
    setEditDescription(p.description || "");
    setEditActive(p.active !== false);
  }, [projectQuery.data]);

  const canEdit = canManageProjects(session as any);
  const canCreateCamp = canManageCamps(session as any);
  const isAdmin = isAdminSession(session as any);

  if (projectQuery.isLoading) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (projectQuery.isError) {
    return (
      <ErrorState
        title="Unable to load project"
        description={getErrorMessage(projectQuery.error)}
        onRetry={() => projectQuery.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project not found"
        description="This health project may have been deleted or is unavailable."
        action={
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/projects">Return to Projects</Link>
          </Button>
        }
      />
    );
  }

  const camps = campsQuery.data?.camps ?? [];
  const schemas = schemasQuery.data ?? [];
  const registered = statsQuery.data?.attended ?? 0;
  const screened = analyticsQuery.data?.attended ?? 0;
  const completionPct =
    registered > 0 ? Math.min(100, Math.round((screened / registered) * 100)) : 0;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Project name is required.");
      return;
    }
    try {
      await updateProject.mutateAsync({
        name: editName.trim(),
        description: editDescription.trim(),
        active: editActive,
      });
      toast.success("Project settings updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update project"));
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== project.name) {
      toast.error("Type the exact project name to confirm deletion.");
      return;
    }
    try {
      await deleteProject.mutateAsync(project._id);
      toast.success("Project deleted");
      router.push("/projects");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete project"));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={project.name}
        description={project.description || "Health outreach program workspace."}
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
        badge={
          <StatusBadge tone={project.active !== false ? "success" : "neutral"}>
            {project.active !== false ? "Active" : "Inactive"}
          </StatusBadge>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/projects">
                <ArrowLeft className="h-3.5 w-3.5" />
                Projects
              </Link>
            </Button>
            {canCreateCamp && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href={`/projects/${project._id}/camps/new`}>
                  <Plus className="h-3.5 w-3.5" />
                  New Camp
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="h-9 flex-wrap bg-muted/60 p-0.5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="camps" className="text-xs">Camps ({camps.length})</TabsTrigger>
          <TabsTrigger value="patients" className="text-xs">Patients</TabsTrigger>
          <TabsTrigger value="forms" className="text-xs">Forms ({schemas.length})</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          {canEdit && <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Camps"
              value={camps.length}
              sublabel={`${camps.filter((c) => c.active !== false).length} active`}
              icon={MapPin}
            />
            <MetricCard
              label="Registered Patients"
              value={registered}
              sublabel={`${statsQuery.data?.newPatientsThisMonth ?? 0} this month`}
              icon={Users}
            />
            <MetricCard
              label="Screening Activity"
              value={screened}
              sublabel={`${completionPct}% screening coverage`}
              denominator={`n = ${registered}`}
              icon={Activity}
            />
            <MetricCard
              label="Form Templates"
              value={schemas.length}
              sublabel={schemas.length > 0 ? "Custom forms enabled" : "Standard clinical schema"}
              icon={Wand2}
            />
          </div>

          <SectionedForm
            title="Active Camps in This Project"
            description="Select any camp to open its operational dashboard."
          >
            {camps.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No camps in this project"
                description="Create a camp to register patients and record clinical screenings."
                action={
                  canCreateCamp ? (
                    <Button asChild size="sm" className="h-8 text-xs">
                      <Link href={`/projects/${project._id}/camps/new`}>
                        Create First Camp
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="divide-y divide-border rounded-md border border-border">
                {camps.map((camp) => (
                  <Link
                    key={camp._id}
                    href={`/projects/${project._id}/camps/${camp._id}`}
                    onClick={() => setContext(project._id, camp._id)}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <div className="text-xs font-medium text-foreground">
                        {camp.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {camp.description || "No description"} · Created{" "}
                        {camp.createdAt
                          ? format(new Date(camp.createdAt), "MMM d, yyyy")
                          : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={camp.active !== false ? "success" : "neutral"}>
                        {camp.active !== false ? "Active" : "Inactive"}
                      </StatusBadge>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionedForm>
        </TabsContent>

        {/* CAMPS */}
        <TabsContent value="camps" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {camps.length} health camp{camps.length === 1 ? "" : "s"} under{" "}
              <strong className="text-foreground">{project.name}</strong>.
            </p>
            {canCreateCamp && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href={`/projects/${project._id}/camps/new`}>
                  <Plus className="h-3.5 w-3.5" />
                  Create Camp
                </Link>
              </Button>
            )}
          </div>
          {camps.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No camps configured"
              description="Add a camp to organize field operations."
            />
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {camps.map((camp) => (
                <Link
                  key={camp._id}
                  href={`/projects/${project._id}/camps/${camp._id}`}
                  onClick={() => setContext(project._id, camp._id)}
                  className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <StatusBadge tone={camp.active !== false ? "success" : "neutral"}>
                      {camp.active !== false ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                    {camp.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {camp.description || "Operational health camp"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PATIENTS */}
        <TabsContent value="patients">
          <PatientsRegisterView scopedProjectId={project._id} scopedCampId="all" embedded />
        </TabsContent>

        {/* FORMS */}
        <TabsContent value="forms" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Custom form templates bound to this project.
            </p>
            {isAdmin && (
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href={`/form-templates/builder?projectId=${project._id}`}>
                  <Plus className="h-3.5 w-3.5" />
                  Open Form Builder
                </Link>
              </Button>
            )}
          </div>
          {schemas.length === 0 ? (
            <EmptyState
              icon={Wand2}
              title="No custom form templates"
              description="This project uses the standard clinical screening workflow. Create a custom template to collect specialized program data."
              action={
                isAdmin ? (
                  <Button asChild size="sm" className="h-8 text-xs">
                    <Link href={`/form-templates/builder?projectId=${project._id}`}>
                      Create Form Template
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {schemas.map((schema) => (
                <div
                  key={schema._id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {schema.name}{" "}
                      <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                        v{schema.version}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {schema.description || "Custom form schema"} ·{" "}
                      {schema.fields?.length ?? 0} fields
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                      <Link href={`/form-templates/forms/${schema._id}`}>Fill Form</Link>
                    </Button>
                    {isAdmin && (
                      <Button asChild size="sm" className="h-7 text-xs">
                        <Link
                          href={`/form-templates/builder?projectId=${project._id}&schemaId=${schema._id}`}
                        >
                          Edit Schema
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <AnalyticsWorkspaceView
            scopedProjectId={project._id}
            scopedCampId="all"
            embedded
          />
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports">
          <ReportsWorkspaceView
            scopedProjectId={project._id}
            scopedCampId="all"
            embedded
          />
        </TabsContent>

        {/* SETTINGS */}
        {canEdit && (
          <TabsContent value="settings" className="space-y-5">
            <SectionedForm
              title="Project Configuration"
              description="Update core project details persisted to /api/projects/edit/:id."
            >
              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label className="text-xs">Project Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 bg-background text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-foreground">Active Status</div>
                    <div className="text-[11px] text-muted-foreground">
                      Deactivating archives the project from active outreach lists.
                    </div>
                  </div>
                  <Switch checked={editActive} onCheckedChange={setEditActive} />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateProject.isPending}
                  className="h-8 gap-1.5 text-xs"
                >
                  {updateProject.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Project Changes
                </Button>
              </form>
            </SectionedForm>

            {isAdmin && (
              <SectionedForm
                title="Danger Zone"
                description="Deleting a project permanently removes its associated camps and form schemas."
                className="border-destructive/30"
              >
                <div className="max-w-xl space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    Type <strong className="font-mono text-foreground">{project.name}</strong>{" "}
                    below to confirm permanent deletion.
                  </p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={project.name}
                    className="h-9 bg-background text-xs"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleteConfirm !== project.name || deleteProject.isPending}
                    onClick={handleDelete}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Project Permanently
                  </Button>
                </div>
              </SectionedForm>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
