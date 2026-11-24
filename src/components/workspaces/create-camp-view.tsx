"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  SectionedForm,
  StickyFormActions,
} from "@/components/platform/record-detail-layout";
import { CampFormSchema } from "@/types/schemas";
import { useCreateCamp, useFormSchemas, useProjects } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";

type CampFormValues = z.infer<typeof CampFormSchema>;

export function CreateCampView({
  defaultProjectId,
}: {
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { projectId: workspaceProjectId, setContext } = useWorkspace();

  const initialProject =
    defaultProjectId && defaultProjectId !== "all"
      ? defaultProjectId
      : workspaceProjectId !== "all"
      ? workspaceProjectId
      : "";

  const projectsQuery = useProjects();
  const createCamp = useCreateCamp();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CampFormValues>({
    resolver: zodResolver(CampFormSchema),
    defaultValues: {
      name: "",
      description: "",
      project: initialProject,
      active: true,
    },
  });

  const selectedProjectId = watch("project");
  const schemasQuery = useFormSchemas(selectedProjectId || undefined, false);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onSubmit = async (values: CampFormValues) => {
    try {
      const created = await createCamp.mutateAsync({
        name: values.name,
        description: values.description,
        project: values.project,
        createdBy: (session?.user as any)?._id,
      });
      toast.success("Health camp created successfully");
      if (created?._id) {
        setContext(values.project, created._id);
        router.push(`/projects/${values.project}/camps/${created._id}`);
      } else {
        router.push(`/projects/${values.project}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create camp"));
    }
  };

  const projects = projectsQuery.data?.projects ?? [];
  const linkedSchemas = schemasQuery.data ?? [];
  const pending = isSubmitting || createCamp.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PageHeader
        title="Create Health Camp"
        description="Set up a field camp under a parent health project to scope patient registrations and clinical screenings."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Camps", href: "/camps" },
          { label: "New Camp" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href={defaultProjectId ? `/projects/${defaultProjectId}` : "/camps"}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SectionedForm
            title="Basic Information & Project Link"
            description="Every camp belongs to a parent health project."
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Parent Health Project <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(val) =>
                    setValue("project", val, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="h-9 bg-background text-sm">
                    <SelectValue placeholder="Select parent project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project && (
                  <p className="text-xs text-destructive">
                    {errors.project.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Camp Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Arusha Central District Outreach — Site A"
                  {...register("name")}
                  className="h-9 bg-background text-sm"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium">
                  Location & Operational Notes
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Include venue/ward location, planned dates, and camp operational details..."
                  {...register("description")}
                  className="bg-background text-sm"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </SectionedForm>

          <SectionedForm
            title="Linked Forms & Screening Configuration"
            description="Inherited from the selected parent health project."
          >
            {!selectedProjectId ? (
              <p className="text-xs text-muted-foreground">
                Select a parent project to view active screening forms and custom
                form templates.
              </p>
            ) : linkedSchemas.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Standard clinical modules (Registration, Vital Signs & Screening,
                Clinical Findings, Doctor Comments) are enabled by default for
                this camp.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {linkedSchemas.map((schema) => (
                  <li
                    key={schema._id}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-foreground">
                      {schema.name}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      v{schema.version}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionedForm>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              Backend Field Alignment
            </div>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              The <code className="rounded bg-muted px-1">Camp</code> schema
              persists <code className="rounded bg-muted px-1">name</code>,{" "}
              <code className="rounded bg-muted px-1">description</code>,{" "}
              <code className="rounded bg-muted px-1">project</code>, and{" "}
              <code className="rounded bg-muted px-1">createdBy</code>. Staff are
              assigned to camps from{" "}
              <Link href="/team" className="text-primary underline">
                Team & Access
              </Link>
              . Structured start/end dates and GPS coordinates can be added once
              extended in the backend model.
            </p>
          </div>
        </aside>
      </div>

      <StickyFormActions
        helperText={
          isDirty ? "Unsaved camp draft" : "Fill in camp details to continue."
        }
      >
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href={defaultProjectId ? `/projects/${defaultProjectId}` : "/camps"}>
            Cancel
          </Link>
        </Button>
        <Button type="submit" size="sm" disabled={pending} className="h-8 gap-1.5 text-xs">
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create Camp
        </Button>
      </StickyFormActions>
    </form>
  );
}
