"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { useCreateFormSubmission, useFormSchema } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import type { FormFieldRecord } from "@/lib/api/types";

export default function FillDynamicFormPage({
  params,
}: {
  params: { schemaId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const schemaQuery = useFormSchema(params.schemaId);
  const createSubmission = useCreateFormSubmission();

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [patientIdentifier, setPatientIdentifier] = useState("");
  const [notes, setNotes] = useState("");

  const schema = schemaQuery.data;

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormFieldRecord>();
    for (const f of schema?.fields ?? []) {
      if (typeof f === "object" && f?._id) map.set(f._id, f);
    }
    return map;
  }, [schema?.fields]);

  const setFieldValue = (key: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (status: "draft" | "submitted") => {
    if (!schema) return;
    const user = session?.user as any;
    if (!user?._id) {
      toast.error("Active user session required.");
      return;
    }

    if (status === "submitted") {
      const missing: string[] = [];
      for (const f of Array.from(fieldMap.values())) {
        if (!f.required) continue;
        const v = values[f.name];
        const empty =
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0);
        if (empty) missing.push(f.label);
      }
      if (missing.length > 0) {
        toast.error(`Complete required fields: ${missing.slice(0, 3).join(", ")}`);
        return;
      }
    }

    try {
      await createSubmission.mutateAsync({
        project: schema.project,
        formSchema: schema._id,
        submittedBy: {
          _id: user._id,
          name: user.name || "Staff",
          username: user.username,
        },
        patient: patientIdentifier.trim()
          ? { patientIdentifier: patientIdentifier.trim().toUpperCase() }
          : undefined,
        status,
        responses: values,
        notes: notes.trim() || undefined,
      });
      toast.success(
        status === "submitted"
          ? "Form submitted successfully"
          : "Draft saved successfully"
      );
      router.push("/form-templates");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save form submission"));
    }
  };

  if (schemaQuery.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (schemaQuery.isError) {
    return (
      <ErrorState
        description={getErrorMessage(schemaQuery.error)}
        onRetry={() => schemaQuery.refetch()}
      />
    );
  }
  if (!schema) {
    return (
      <EmptyState
        title="Form template not found"
        action={
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/form-templates">Return to Templates</Link>
          </Button>
        }
      />
    );
  }

  const sections =
    schema.sections && schema.sections.length > 0
      ? schema.sections.filter((s) => s.enabled !== false)
      : [
          {
            name: "general",
            label: "Form Fields",
            order: 0,
            enabled: true,
            fields: (schema.fields || []).map((f) =>
              typeof f === "string" ? f : f._id
            ),
          },
        ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={schema.name}
        description={schema.description || "Structured custom form data entry."}
        breadcrumbs={[
          { label: "Form Templates", href: "/form-templates" },
          { label: schema.name },
        ]}
        badge={<StatusBadge tone="info">v{schema.version ?? 1}</StatusBadge>}
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/form-templates">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        }
      />

      <SectionedForm
        title="Optional Patient Link"
        description="Link this form submission to a registered Patient ID if applicable."
      >
        <div className="max-w-sm space-y-1.5">
          <Label className="text-xs">Patient Identifier (Optional)</Label>
          <Input
            value={patientIdentifier}
            onChange={(e) => setPatientIdentifier(e.target.value.toUpperCase())}
            placeholder="e.g., AC000000000001"
            className="h-9 bg-background font-mono text-xs"
          />
        </div>
      </SectionedForm>

      {sections.map((sec) => (
        <SectionedForm key={sec.name} title={sec.label}>
          <div className="grid gap-4 sm:grid-cols-2">
            {sec.fields.map((fid) => {
              const f = fieldMap.get(fid);
              if (!f) return null;
              const current = values[f.name];

              return (
                <div
                  key={f._id}
                  className={
                    f.type === "textarea" || f.type === "checkbox"
                      ? "space-y-1.5 sm:col-span-2"
                      : "space-y-1.5"
                  }
                >
                  <Label className="text-xs font-medium">
                    {f.label}
                    {f.required && <span className="ml-0.5 text-destructive">*</span>}
                  </Label>

                  {f.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={current !== undefined && current !== null ? String(current) : ""}
                      onChange={(e) => setFieldValue(f.name, e.target.value)}
                      className="bg-background text-xs"
                    />
                  ) : f.type === "number" ? (
                    <Input
                      type="number"
                      min={f.validation?.min}
                      max={f.validation?.max}
                      placeholder={f.placeholder}
                      value={current !== undefined && current !== null ? String(current) : ""}
                      onChange={(e) =>
                        setFieldValue(
                          f.name,
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="h-9 bg-background tabular-nums text-xs"
                    />
                  ) : f.type === "date" ? (
                    <Input
                      type="date"
                      value={current !== undefined && current !== null ? String(current) : ""}
                      onChange={(e) => setFieldValue(f.name, e.target.value)}
                      className="h-9 bg-background text-xs"
                    />
                  ) : f.type === "boolean" ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <Switch
                        checked={Boolean(current)}
                        onCheckedChange={(checked) => setFieldValue(f.name, checked)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {current === true ? "Yes" : "No"}
                      </span>
                    </div>
                  ) : f.type === "select" || f.type === "radio" ? (
                    <Select
                      value={current !== undefined && current !== null ? String(current) : ""}
                      onValueChange={(v) => setFieldValue(f.name, v)}
                    >
                      <SelectTrigger className="h-9 bg-background text-xs">
                        <SelectValue placeholder={f.placeholder || "Select option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "multiselect" || f.type === "checkbox" ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      {(f.options ?? []).map((opt) => {
                        const selectedArr = Array.isArray(current)
                          ? (current as string[])
                          : [];
                        const checked = selectedArr.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 text-xs text-foreground"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(next) => {
                                const updated = next
                                  ? [...selectedArr, opt.value]
                                  : selectedArr.filter((x) => x !== opt.value);
                                setFieldValue(f.name, updated);
                              }}
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Input
                      placeholder={f.placeholder}
                      value={current !== undefined && current !== null ? String(current) : ""}
                      onChange={(e) => setFieldValue(f.name, e.target.value)}
                      className="h-9 bg-background text-xs"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SectionedForm>
      ))}

      <SectionedForm title="Submission Notes (Optional)">
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add operational context or reviewer notes..."
          className="bg-background text-xs"
        />
      </SectionedForm>

      <StickyFormActions helperText="Drafts can be reviewed before final submission.">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={createSubmission.isPending}
          onClick={() => handleSubmit("draft")}
          className="h-8 gap-1.5 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={createSubmission.isPending}
          onClick={() => handleSubmit("submitted")}
          className="h-8 gap-1.5 text-xs"
        >
          {createSubmission.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Submit Form
        </Button>
      </StickyFormActions>
    </div>
  );
}
