"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckSquare,
  Calendar,
  Eye,
  Hash,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Radio,
  Save,
  ShieldCheck,
  ToggleLeft,
  Trash2,
  Type,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/platform/page-header";
import {
  EmptyState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import {
  useCreateFormField,
  useCreateFormSchema,
  useDeleteFormField,
  useFormFields,
  useFormSchema,
  useFormSubmissions,
  useProjects,
  useUpdateFormField,
  useUpdateFormSchema,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";
import type {
  FormFieldOption,
  FormFieldRecord,
  FormFieldSection,
  FormFieldType,
  FormSchemaSection,
} from "@/lib/api/types";

const FIELD_LIBRARY: {
  type: FormFieldType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "text", label: "Short Text", desc: "Single-line input", icon: Type },
  { type: "textarea", label: "Long Text", desc: "Multi-line notes", icon: AlignLeft },
  { type: "number", label: "Number / Metric", desc: "Numeric measurement", icon: Hash },
  { type: "date", label: "Date", desc: "Calendar date", icon: Calendar },
  { type: "select", label: "Single Select", desc: "Dropdown list", icon: ListChecks },
  { type: "multiselect", label: "Multi-Select", desc: "Multiple choices", icon: CheckSquare },
  { type: "radio", label: "Radio Group", desc: "Mutually exclusive", icon: Radio },
  { type: "checkbox", label: "Checkbox Group", desc: "Check multiple", icon: CheckSquare },
  { type: "boolean", label: "Yes / No Switch", desc: "Binary toggle", icon: ToggleLeft },
];

const DEFAULT_SECTIONS: FormSchemaSection[] = [
  { name: "general", label: "General Information", order: 0, enabled: true, fields: [] },
];

function slugifyKey(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || `field_${Date.now()}`
  );
}

export function FormBuilderCanvas({
  initialProjectId,
  initialSchemaId,
}: {
  initialProjectId?: string;
  initialSchemaId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectId: workspaceProjectId } = useWorkspace();

  const schemaIdParam = initialSchemaId || searchParams?.get("schemaId") || "";
  const projectIdParam =
    initialProjectId ||
    searchParams?.get("projectId") ||
    (workspaceProjectId !== "all" ? workspaceProjectId : "");

  const [selectedProjectId, setSelectedProjectId] = useState(projectIdParam);
  const [schemaName, setSchemaName] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [schemaActive, setSchemaActive] = useState(true);
  const [sections, setSections] = useState<FormSchemaSection[]>(DEFAULT_SECTIONS);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [newSectionLabel, setNewSectionLabel] = useState("");

  // Field property draft
  const [fieldDraft, setFieldDraft] = useState<{
    label: string;
    name: string;
    type: FormFieldType;
    placeholder: string;
    required: boolean;
    section: FormFieldSection;
    options: FormFieldOption[];
    min: string;
    max: string;
    minLength: string;
    maxLength: string;
    pattern: string;
  } | null>(null);

  const projectsQuery = useProjects();
  const schemaQuery = useFormSchema(schemaIdParam || undefined);
  const fieldsQuery = useFormFields(selectedProjectId || undefined, Boolean(selectedProjectId));
  const submissionsQuery = useFormSubmissions(
    { project: selectedProjectId || undefined, page: 1, limit: 1 },
    Boolean(schemaIdParam && selectedProjectId)
  );

  const createField = useCreateFormField();
  const updateField = useUpdateFormField();
  const deleteField = useDeleteFormField();
  const createSchema = useCreateFormSchema();
  const updateSchema = useUpdateFormSchema(schemaIdParam || "new");

  const projectFields = useMemo(
    () => fieldsQuery.data ?? [],
    [fieldsQuery.data]
  );

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormFieldRecord>();
    for (const f of projectFields) {
      map.set(f._id, f);
    }
    if (schemaQuery.data?.fields) {
      for (const f of schemaQuery.data.fields) {
        if (typeof f === "object" && f?._id) {
          map.set(f._id, f);
        }
      }
    }
    return map;
  }, [projectFields, schemaQuery.data?.fields]);

  // Hydrate schema when editing existing schema
  useEffect(() => {
    const s = schemaQuery.data;
    if (!s) return;
    setSelectedProjectId(s.project);
    setSchemaName(s.name || "");
    setSchemaDescription(s.description || "");
    setSchemaActive(s.isActive !== false);
    if (Array.isArray(s.sections) && s.sections.length > 0) {
      setSections(
        s.sections.map((sec, idx) => ({
          name: sec.name || `section_${idx}`,
          label: sec.label || `Section ${idx + 1}`,
          order: sec.order ?? idx,
          enabled: sec.enabled !== false,
          fields: Array.isArray(sec.fields) ? sec.fields : [],
        }))
      );
    } else {
      const ids = (s.fields || []).map((f) => (typeof f === "string" ? f : f._id));
      setSections([
        {
          name: "general",
          label: "General Information",
          order: 0,
          enabled: true,
          fields: ids,
        },
      ]);
    }
  }, [schemaQuery.data]);

  // Hydrate selected field draft into right inspector
  useEffect(() => {
    if (!selectedFieldId) {
      setFieldDraft(null);
      return;
    }
    const f = fieldMap.get(selectedFieldId);
    if (!f) {
      setFieldDraft(null);
      return;
    }
    setFieldDraft({
      label: f.label || "",
      name: f.name || "",
      type: f.type,
      placeholder: f.placeholder || "",
      required: Boolean(f.required),
      section: f.section || "custom",
      options: Array.isArray(f.options) ? f.options : [],
      min: f.validation?.min !== undefined ? String(f.validation.min) : "",
      max: f.validation?.max !== undefined ? String(f.validation.max) : "",
      minLength:
        f.validation?.minLength !== undefined ? String(f.validation.minLength) : "",
      maxLength:
        f.validation?.maxLength !== undefined ? String(f.validation.maxLength) : "",
      pattern: f.validation?.pattern || "",
    });
  }, [selectedFieldId, fieldMap]);

  const usedFieldIds = useMemo(() => {
    const set = new Set<string>();
    for (const sec of sections) {
      for (const fid of sec.fields) set.add(fid);
    }
    return set;
  }, [sections]);

  const unusedProjectFields = useMemo(
    () => projectFields.filter((f) => !usedFieldIds.has(f._id)),
    [projectFields, usedFieldIds]
  );

  const hasExistingSubmissions = (submissionsQuery.data?.total ?? 0) > 0;

  const handleAddFromLibrary = async (type: FormFieldType, defaultLabel: string) => {
    if (!selectedProjectId) {
      toast.error("Select a target project before adding fields.");
      return;
    }
    const needsOptions = ["select", "multiselect", "radio", "checkbox"].includes(type);
    const label = `${defaultLabel} ${projectFields.length + 1}`;
    const name = `${slugifyKey(defaultLabel)}_${Date.now().toString().slice(-4)}`;

    try {
      const created = await createField.mutateAsync({
        name,
        label,
        type,
        required: false,
        placeholder: "",
        section: "custom",
        order: usedFieldIds.size,
        project: selectedProjectId,
        customProject: selectedProjectId,
        options: needsOptions
          ? [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ]
          : undefined,
      });

      if (created?._id) {
        setSections((prev) =>
          prev.map((sec, idx) =>
            idx === activeSectionIndex
              ? { ...sec, fields: [...sec.fields, created._id] }
              : sec
          )
        );
        setSelectedFieldId(created._id);
        toast.success(`Added "${created.label}"`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to create field"));
    }
  };

  const handleAttachExistingField = (fieldId: string) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === activeSectionIndex
          ? { ...sec, fields: [...sec.fields, fieldId] }
          : sec
      )
    );
    setSelectedFieldId(fieldId);
  };

  const handleMoveField = (secIdx: number, fieldIdx: number, delta: -1 | 1) => {
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== secIdx) return sec;
        const target = fieldIdx + delta;
        if (target < 0 || target >= sec.fields.length) return sec;
        const nextFields = [...sec.fields];
        const [moved] = nextFields.splice(fieldIdx, 1);
        nextFields.splice(target, 0, moved);
        return { ...sec, fields: nextFields };
      })
    );
  };

  const handleRemoveFieldFromCanvas = (secIdx: number, fieldId: string) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === secIdx
          ? { ...sec, fields: sec.fields.filter((id) => id !== fieldId) }
          : sec
      )
    );
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleAddSection = () => {
    const label = newSectionLabel.trim();
    if (!label) return;
    const next: FormSchemaSection = {
      name: slugifyKey(label),
      label,
      order: sections.length,
      enabled: true,
      fields: [],
    };
    setSections((prev) => [...prev, next]);
    setActiveSectionIndex(sections.length);
    setNewSectionLabel("");
  };

  const handleSaveFieldProperties = async () => {
    if (!selectedFieldId || !fieldDraft) return;
    if (!fieldDraft.label.trim() || !fieldDraft.name.trim()) {
      toast.error("Field label and stable identifier are required.");
      return;
    }

    const validation: Record<string, unknown> = {};
    if (fieldDraft.min !== "") validation.min = Number(fieldDraft.min);
    if (fieldDraft.max !== "") validation.max = Number(fieldDraft.max);
    if (fieldDraft.minLength !== "") validation.minLength = Number(fieldDraft.minLength);
    if (fieldDraft.maxLength !== "") validation.maxLength = Number(fieldDraft.maxLength);
    if (fieldDraft.pattern.trim()) validation.pattern = fieldDraft.pattern.trim();

    try {
      await updateField.mutateAsync({
        id: selectedFieldId,
        payload: {
          label: fieldDraft.label.trim(),
          name: fieldDraft.name.trim(),
          type: fieldDraft.type,
          placeholder: fieldDraft.placeholder.trim() || undefined,
          required: fieldDraft.required,
          section: fieldDraft.section,
          options: ["select", "multiselect", "radio", "checkbox"].includes(
            fieldDraft.type
          )
            ? fieldDraft.options.filter((o) => o.label.trim() && o.value.trim())
            : undefined,
          validation: Object.keys(validation).length > 0 ? validation : undefined,
        },
      });
      toast.success("Field properties saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update field"));
    }
  };

  const handleDeleteFieldPermanently = async () => {
    if (!selectedFieldId) return;
    try {
      await deleteField.mutateAsync(selectedFieldId);
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          fields: sec.fields.filter((id) => id !== selectedFieldId),
        }))
      );
      setSelectedFieldId(null);
      toast.success("Field deleted from project library");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete field"));
    }
  };

  const handleSaveSchema = async (asNewVersion: boolean) => {
    if (!selectedProjectId) {
      toast.error("Select a project first.");
      return;
    }
    if (!schemaName.trim()) {
      toast.error("Enter a form template name.");
      return;
    }

    const orderedFields = sections.flatMap((s) => s.fields);
    const normalizedSections = sections.map((s, idx) => ({
      ...s,
      order: idx,
    }));

    try {
      if (schemaIdParam && !asNewVersion) {
        await updateSchema.mutateAsync({
          name: schemaName.trim(),
          description: schemaDescription.trim() || undefined,
          isActive: schemaActive,
          fields: orderedFields,
          sections: normalizedSections,
        });
        toast.success("Form schema updated");
      } else {
        const created = await createSchema.mutateAsync({
          project: selectedProjectId,
          name: schemaName.trim(),
          description: schemaDescription.trim() || undefined,
          isActive: schemaActive,
          fields: orderedFields,
          sections: normalizedSections,
        });
        toast.success(
          asNewVersion
            ? `Published new immutable version (v${created?.version ?? "next"})`
            : "Form template created"
        );
        if (created?._id) {
          router.replace(
            `/form-templates/builder?projectId=${selectedProjectId}&schemaId=${created._id}`
          );
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save form template"));
    }
  };

  if (schemaIdParam && schemaQuery.isLoading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const projects = projectsQuery.data?.projects ?? [];
  const saving = createSchema.isPending || updateSchema.isPending;

  return (
    <div className="space-y-4">
      <PageHeader
        title={schemaIdParam ? schemaName || "Edit Form Template" : "Form Template Builder"}
        description="Design structured data-collection schemas with stable field identifiers, validation rules, and version safety."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Form Templates", href: "/form-templates" },
          { label: schemaIdParam ? "Editor" : "New Template" },
        ]}
        badge={
          schemaQuery.data ? (
            <StatusBadge tone="info">v{schemaQuery.data.version}</StatusBadge>
          ) : undefined
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/form-templates">
                <ArrowLeft className="h-3.5 w-3.5" />
                Templates
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode((m) => (m === "edit" ? "preview" : "edit"))}
              className="h-8 gap-1.5 text-xs"
            >
              {mode === "edit" ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Back to Editor
                </>
              )}
            </Button>
            {schemaIdParam && hasExistingSubmissions && (
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => handleSaveSchema(true)}
                className="h-8 gap-1.5 text-xs"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Publish New Version
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant={schemaIdParam && hasExistingSubmissions ? "outline" : "default"}
              disabled={saving}
              onClick={() => handleSaveSchema(false)}
              className="h-8 gap-1.5 text-xs"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {schemaIdParam ? "Save Changes" : "Create Template"}
            </Button>
          </>
        }
      />

      {/* Schema Metadata Bar */}
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Target Project</Label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={Boolean(schemaIdParam)}
          >
            <SelectTrigger className="h-8 bg-background text-xs">
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Template Name</Label>
          <Input
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="e.g., Maternal Nutrition Intake"
            className="h-8 bg-background text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Description</Label>
          <Input
            value={schemaDescription}
            onChange={(e) => setSchemaDescription(e.target.value)}
            placeholder="Purpose of this form..."
            className="h-8 bg-background text-xs"
          />
        </div>

        <div className="flex items-end justify-between rounded-md border border-border bg-muted/30 px-3 py-1.5">
          <div>
            <div className="text-xs font-medium text-foreground">Published</div>
            <div className="text-[10px] text-muted-foreground">Accepting entries</div>
          </div>
          <Switch checked={schemaActive} onCheckedChange={setSchemaActive} />
        </div>
      </div>

      {/* Immutability Warning when submissions exist */}
      {schemaIdParam && hasExistingSubmissions && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <strong>Version Protection:</strong> This project already has recorded
            submissions. Use <strong>Publish New Version</strong> rather than
            mutating field keys in-place so historical submissions remain readable
            against their original schema version.
          </div>
        </div>
      )}

      {mode === "preview" ? (
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6 space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">
              {schemaName || "Untitled Form Preview"}
            </h2>
            {schemaDescription && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {schemaDescription}
              </p>
            )}
          </div>
          {sections
            .filter((s) => s.enabled)
            .map((sec) => (
              <div key={sec.name} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {sec.label}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sec.fields.map((fid) => {
                    const f = fieldMap.get(fid);
                    if (!f) return null;
                    return (
                      <div
                        key={fid}
                        className={cn(
                          "space-y-1",
                          f.type === "textarea" && "sm:col-span-2"
                        )}
                      >
                        <Label className="text-xs">
                          {f.label}
                          {f.required && <span className="ml-0.5 text-destructive">*</span>}
                        </Label>
                        {f.type === "textarea" ? (
                          <Textarea
                            disabled
                            rows={2}
                            placeholder={f.placeholder || "Multi-line text"}
                            className="bg-background text-xs"
                          />
                        ) : f.type === "boolean" ? (
                          <div className="flex items-center gap-2 pt-1">
                            <Switch disabled />
                            <span className="text-xs text-muted-foreground">Yes / No</span>
                          </div>
                        ) : f.type === "select" || f.type === "multiselect" ? (
                          <Input
                            disabled
                            placeholder={
                              f.options?.map((o) => o.label).join(", ") || "Select option..."
                            }
                            className="h-8 bg-background text-xs"
                          />
                        ) : (
                          <Input
                            disabled
                            type={
                              f.type === "number"
                                ? "number"
                                : f.type === "date"
                                ? "date"
                                : "text"
                            }
                            placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                            className="h-8 bg-background text-xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* 3-PANE FORM BUILDER LAYOUT */
        <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
          {/* LEFT: Field Library */}
          <aside className="rounded-lg border border-border bg-card p-3 space-y-4 self-start">
            <div>
              <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Add Field to Active Section
              </div>
              <div className="mt-2 grid gap-1.5">
                {FIELD_LIBRARY.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      disabled={!selectedProjectId || createField.isPending}
                      onClick={() => handleAddFromLibrary(item.type, item.label)}
                      className="flex items-center gap-2.5 rounded-md border border-border bg-background/70 px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 disabled:opacity-50"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {unusedProjectFields.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Project Field Library ({unusedProjectFields.length})
                </div>
                <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                  {unusedProjectFields.map((f) => (
                    <button
                      key={f._id}
                      type="button"
                      onClick={() => handleAttachExistingField(f._id)}
                      className="flex w-full items-center justify-between rounded-md border border-border/70 bg-background px-2.5 py-1.5 text-left text-xs hover:border-primary/40"
                    >
                      <span className="truncate font-medium">{f.label}</span>
                      <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* CENTER: Form Canvas */}
          <div className="space-y-4">
            {sections.map((sec, secIdx) => {
              const isActiveSec = secIdx === activeSectionIndex;
              return (
                <div
                  key={`${sec.name}-${secIdx}`}
                  onClick={() => setActiveSectionIndex(secIdx)}
                  className={cn(
                    "rounded-lg border bg-card transition-colors",
                    isActiveSec ? "border-primary/50" : "border-border"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {sec.label}
                      </span>
                      {isActiveSec && (
                        <StatusBadge tone="info" dot={false}>
                          Active target
                        </StatusBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-[11px] text-muted-foreground">
                        {sec.fields.length} field{sec.fields.length === 1 ? "" : "s"}
                      </span>
                      {sections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSections((prev) => prev.filter((_, i) => i !== secIdx));
                            setActiveSectionIndex(0);
                          }}
                          aria-label="Remove section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {sec.fields.length === 0 ? (
                      <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                        Click a field type on the left to add it to &ldquo;{sec.label}&rdquo;.
                      </div>
                    ) : (
                      sec.fields.map((fid, fIdx) => {
                        const f = fieldMap.get(fid);
                        if (!f) return null;
                        const selected = selectedFieldId === fid;
                        return (
                          <div
                            key={fid}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSectionIndex(secIdx);
                              setSelectedFieldId(fid);
                            }}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 cursor-pointer transition-colors",
                              selected
                                ? "border-primary bg-accent/50"
                                : "border-border bg-background/60 hover:bg-muted/40"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <span className="truncate">{f.label}</span>
                                {f.required && (
                                  <span className="text-destructive">*</span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="font-mono">{f.name}</span>
                                <span>•</span>
                                <span className="uppercase">{f.type}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={fIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveField(secIdx, fIdx, -1);
                                }}
                                aria-label="Move field up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={fIdx === sec.fields.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveField(secIdx, fIdx, 1);
                                }}
                                aria-label="Move field down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFieldFromCanvas(secIdx, fid);
                                }}
                                aria-label="Remove from canvas"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Section Row */}
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-card/60 p-3">
              <Input
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                placeholder="New section heading (e.g., Vital Signs, Follow-up)..."
                className="h-8 bg-background text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSection}
                className="h-8 shrink-0 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Section
              </Button>
            </div>
          </div>

          {/* RIGHT: Field Properties Inspector */}
          <aside className="rounded-lg border border-border bg-card p-4 space-y-4 self-start">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Field Properties
              </h3>
              {fieldDraft && (
                <StatusBadge tone="neutral" dot={false}>
                  {fieldDraft.type}
                </StatusBadge>
              )}
            </div>

            {!fieldDraft ? (
              <EmptyState
                title="Select a field"
                description="Click any field on the form canvas to edit its label, stable identifier, options, and validation rules."
                className="py-8"
              />
            ) : (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px]">Display Label</Label>
                  <Input
                    value={fieldDraft.label}
                    onChange={(e) =>
                      setFieldDraft((d) => (d ? { ...d, label: e.target.value } : d))
                    }
                    className="h-8 bg-background text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">
                    Stable Field Identifier (Key)
                  </Label>
                  <Input
                    value={fieldDraft.name}
                    onChange={(e) =>
                      setFieldDraft((d) =>
                        d ? { ...d, name: slugifyKey(e.target.value) } : d
                      )
                    }
                    className="h-8 bg-background font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Placeholder / Helper</Label>
                  <Input
                    value={fieldDraft.placeholder}
                    onChange={(e) =>
                      setFieldDraft((d) =>
                        d ? { ...d, placeholder: e.target.value } : d
                      )
                    }
                    className="h-8 bg-background text-xs"
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
                  <span className="font-medium text-foreground">Required field</span>
                  <Switch
                    checked={fieldDraft.required}
                    onCheckedChange={(checked) =>
                      setFieldDraft((d) => (d ? { ...d, required: checked } : d))
                    }
                  />
                </div>

                {["select", "multiselect", "radio", "checkbox"].includes(
                  fieldDraft.type
                ) && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px]">Choice Options</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-primary"
                        onClick={() =>
                          setFieldDraft((d) =>
                            d
                              ? {
                                  ...d,
                                  options: [
                                    ...d.options,
                                    {
                                      label: `Option ${d.options.length + 1}`,
                                      value: `option_${d.options.length + 1}`,
                                    },
                                  ],
                                }
                              : d
                          )
                        }
                      >
                        + Add option
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {fieldDraft.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Input
                            value={opt.label}
                            onChange={(e) => {
                              const nextLabel = e.target.value;
                              setFieldDraft((d) =>
                                d
                                  ? {
                                      ...d,
                                      options: d.options.map((item, i) =>
                                        i === idx
                                          ? {
                                              label: nextLabel,
                                              value: slugifyKey(nextLabel),
                                            }
                                          : item
                                      ),
                                    }
                                  : d
                              );
                            }}
                            placeholder="Option label"
                            className="h-7 bg-background text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setFieldDraft((d) =>
                                d
                                  ? {
                                      ...d,
                                      options: d.options.filter((_, i) => i !== idx),
                                    }
                                  : d
                              )
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fieldDraft.type === "number" && (
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Min value</Label>
                      <Input
                        type="number"
                        value={fieldDraft.min}
                        onChange={(e) =>
                          setFieldDraft((d) => (d ? { ...d, min: e.target.value } : d))
                        }
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Max value</Label>
                      <Input
                        type="number"
                        value={fieldDraft.max}
                        onChange={(e) =>
                          setFieldDraft((d) => (d ? { ...d, max: e.target.value } : d))
                        }
                        className="h-8 bg-background text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deleteField.isPending}
                    onClick={handleDeleteFieldPermanently}
                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={updateField.isPending}
                    onClick={handleSaveFieldProperties}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {updateField.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Save Field
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-md border border-border/70 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Backend Contract Note
              </div>
              <p className="mt-1 leading-relaxed">
                Conditional visibility rules require a backend schema extension
                and are intentionally not mocked on the frontend.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
