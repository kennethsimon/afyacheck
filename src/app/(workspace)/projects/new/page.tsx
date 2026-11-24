"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/platform/page-header";
import {
  SectionedForm,
  StickyFormActions,
} from "@/components/platform/record-detail-layout";
import { ProjectFormSchema } from "@/types/schemas";
import {
  useCreateCustomProject,
  useCreateProject,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";

type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { setProjectId } = useWorkspace();
  const [programType, setProgramType] = useState<"standard" | "custom">("standard");

  const createProject = useCreateProject();
  const createCustomProject = useCreateCustomProject();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const active = watch("active") ?? true;

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const created =
        programType === "custom"
          ? await createCustomProject.mutateAsync({
              name: values.name,
              description: values.description,
            })
          : await createProject.mutateAsync({
              name: values.name,
              description: values.description,
              active: values.active ?? true,
            });

      toast.success("Project created successfully");
      if (created?._id) {
        setProjectId(created._id);
        router.push(
          programType === "custom"
            ? `/form-templates/builder?projectId=${created._id}`
            : `/projects/${created._id}`
        );
      } else {
        router.push("/projects");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create project"));
    }
  };

  const pending = isSubmitting || createProject.isPending || createCustomProject.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PageHeader
        title="Create Health Project"
        description="Configure a new health program to group camps, patient records, screening workflows, and reporting."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Projects", href: "/projects" },
          { label: "New Project" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/projects">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Projects
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <SectionedForm
            title="Project Details"
            description="Core metadata persisted directly to the AfyaCheck Project model."
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Northern Zone Outreach 2026"
                  {...register("name")}
                  className="h-9 bg-background text-sm"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the program scope, target population, and clinical objectives..."
                  {...register("description")}
                  className="bg-background text-sm"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                <div>
                  <div className="text-xs font-medium text-foreground">
                    Active Program
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Inactive projects remain archived for historical reporting.
                  </div>
                </div>
                <Switch
                  checked={active}
                  onCheckedChange={(checked) =>
                    setValue("active", checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </SectionedForm>

          <SectionedForm
            title="Program Configuration"
            description="Choose how teams will capture data under this project."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setProgramType("standard")}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  programType === "standard"
                    ? "border-primary bg-accent/50"
                    : "border-border bg-background hover:border-border/80"
                )}
              >
                <div className="text-xs font-semibold text-foreground">
                  Standard Clinical Outreach
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Uses structured medical camps, patient registration, vital
                  signs, TB/HIV/cancer screening, specialty findings, and doctor
                  reviews.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProgramType("custom")}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  programType === "custom"
                    ? "border-primary bg-accent/50"
                    : "border-border bg-background hover:border-border/80"
                )}
              >
                <div className="text-xs font-semibold text-foreground">
                  Custom Form Program
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Launches the Form Builder immediately after creation so you
                  can design custom schemas and collect structured submissions.
                </p>
              </button>
            </div>
          </SectionedForm>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              Schema Compatibility
            </div>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              The current backend stores <code className="rounded bg-muted px-1">name</code>,{" "}
              <code className="rounded bg-muted px-1">description</code>, and{" "}
              <code className="rounded bg-muted px-1">active</code> on Project
              records. Program dates and responsible organization fields require
              a coordinated backend schema extension before they can be stored.
            </p>
          </div>
        </aside>
      </div>

      <StickyFormActions
        helperText={
          isDirty ? "You have unsaved changes." : "Complete required fields to create project."
        }
      >
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/projects">Cancel</Link>
        </Button>
        <Button type="submit" size="sm" disabled={pending} className="h-8 gap-1.5 text-xs">
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {programType === "custom" ? "Create & Open Form Builder" : "Create Project"}
        </Button>
      </StickyFormActions>
    </form>
  );
}
