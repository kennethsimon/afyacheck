"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  ClipboardCheck,
  HeartPulse,
  Lock,
  Plus,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/platform/page-header";
import { MetricCard } from "@/components/platform/metric-card";
import { DataToolbar } from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { SectionedForm } from "@/components/platform/record-detail-layout";
import { AnalyticsChart } from "@/components/platform/analytics-chart";
import {
  useCreateWellnessQuestion,
  useWellnessQuestions,
  useWellnessResponses,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { isAdminSession } from "@/lib/permissions";
import type { WellnessResponseRecord } from "@/lib/api/types";

export default function WellnessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = isAdminSession(session as any);

  const [search, setSearch] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptionsText, setNewOptionsText] = useState(
    "Never, Rarely, Sometimes, Often, Always"
  );

  const questionsQuery = useWellnessQuestions();
  const responsesQuery = useWellnessResponses({ page: 1, limit: 200 });
  const createQuestion = useCreateWellnessQuestion();

  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data]
  );
  const responses = useMemo(
    () => responsesQuery.data?.responses ?? [],
    [responsesQuery.data?.responses]
  );

  const filteredResponses = useMemo(() => {
    if (!search.trim()) return responses;
    const q = search.trim().toLowerCase();
    return responses.filter(
      (r) =>
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.education_level?.toLowerCase().includes(q) ||
        r.user?.gender?.toLowerCase().includes(q)
    );
  }, [responses, search]);

  const genderBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of responses) {
      const g = r.user?.gender || "Unspecified";
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [responses]);

  const educationBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of responses) {
      const ed = r.user?.education_level || "Unspecified";
      counts.set(ed, (counts.get(ed) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [responses]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = newOptionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!newQuestionText.trim() || options.length < 2) {
      toast.error("Provide a question prompt and at least 2 comma-separated scale options.");
      return;
    }
    try {
      await createQuestion.mutateAsync({
        question_text: newQuestionText.trim(),
        options,
      });
      toast.success("Assessment question added");
      setNewQuestionText("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add question"));
    }
  };

  const responseColumns: ColumnDef<WellnessResponseRecord>[] = useMemo(
    () => [
      {
        id: "participant",
        header: "Participant",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.user?.name || "Anonymous"}
          </span>
        ),
      },
      {
        id: "ageGender",
        header: "Age / Gender",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground capitalize">
            {row.original.user?.age ?? "—"} yrs · {row.original.user?.gender || "—"}
          </span>
        ),
      },
      {
        id: "education",
        header: "Education",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.user?.education_level || "—"}
          </span>
        ),
      },
      {
        id: "answered",
        header: "Questions Answered",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs">
            {row.original.answers?.length ?? 0}
          </span>
        ),
      },
      {
        id: "date",
        header: "Submitted",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.user?.date || row.original.createdAt
              ? format(
                  new Date(row.original.user?.date || row.original.createdAt!),
                  "MMM d, yyyy"
                )
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
                router.push(`/wellness/responses/${row.original._id}`);
              }}
            >
              Review
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Wellness & Mental Health"
        description="Standardized wellness assessments, confidential participant responses, and aggregated trends."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Wellness" },
        ]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/wellness/assessments">
              <ClipboardCheck className="h-3.5 w-3.5" />
              New Assessment
            </Link>
          </Button>
        }
      />

      {/* Clinical & Privacy Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <span className="font-semibold text-foreground">
            Confidential Wellness Module:
          </span>{" "}
          Mental-health responses carry heightened privacy controls. Assessment
          scores are screening indicators only and are{" "}
          <strong>not clinical diagnoses</strong>. Follow approved institutional
          referral protocols for follow-ups.
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Questions"
          value={questions.length}
          sublabel="Published assessment items"
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Submitted Assessments"
          value={responsesQuery.data?.count ?? responses.length}
          sublabel="Recorded participant responses"
          icon={Users}
        />
        <MetricCard
          label="Scoring Scale"
          value="Validated"
          sublabel="Preserves exact item wording & scales"
          icon={HeartPulse}
        />
        <MetricCard
          label="Follow-up Workflow"
          value="Clinician Review"
          sublabel="Manual review required — never automated"
          icon={ShieldAlert}
        />
      </div>

      <Tabs defaultValue="responses" className="space-y-4">
        <TabsList className="h-9 bg-muted/60 p-0.5">
          <TabsTrigger value="responses" className="text-xs">
            Responses ({responses.length})
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-xs">
            Assessment Instrument ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            Wellness Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-4">
          <DataToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search responses by participant, gender, or education..."
          />

          <EnterpriseDataTable
            columns={responseColumns}
            data={filteredResponses}
            isLoading={responsesQuery.isLoading}
            error={
              responsesQuery.isError
                ? `${getErrorMessage(
                    responsesQuery.error
                  )} — Note: if the backend returns an injection error on /api/responses, coordinate the responseModel DI token fix in atosclone.`
                : null
            }
            onRetry={() => responsesQuery.refetch()}
            totalCount={filteredResponses.length}
            emptyTitle="No wellness responses recorded"
            emptyDescription="Complete a wellness assessment to record participant responses."
            emptyAction={
              <Button asChild size="sm" className="h-8 text-xs">
                <Link href="/wellness/assessments">Start Assessment</Link>
              </Button>
            }
            onRowClick={(row) => router.push(`/wellness/responses/${row._id}`)}
          />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <SectionedForm
            title="Current Assessment Questions"
            description="Exact validated question prompts and response scales returned by /api/questions."
          >
            {questionsQuery.isLoading ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : questionsQuery.isError ? (
              <ErrorState
                description={getErrorMessage(questionsQuery.error)}
                onRetry={() => questionsQuery.refetch()}
              />
            ) : questions.length === 0 ? (
              <EmptyState
                title="No wellness questions configured"
                description="Add validated assessment questions below to enable participant screening."
              />
            ) : (
              <ol className="divide-y divide-border rounded-md border border-border">
                {questions.map((q, idx) => (
                  <li key={q._id} className="px-4 py-3 text-xs space-y-1.5">
                    <div className="font-medium text-foreground">
                      <span className="mr-2 font-mono text-muted-foreground">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      {q.question_text}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      {q.options.map((opt) => (
                        <StatusBadge key={opt} tone="neutral" dot={false}>
                          {opt}
                        </StatusBadge>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionedForm>

          {isAdmin && (
            <SectionedForm
              title="Add Assessment Question"
              description="Admins can append validated items with preserved response scales."
            >
              <form onSubmit={handleAddQuestion} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Question Prompt</Label>
                  <Input
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Enter exact validated question text..."
                    className="h-9 bg-background text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Response Scale Options (comma-separated, min 2)
                  </Label>
                  <Input
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    className="h-9 bg-background text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createQuestion.isPending}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                  </Button>
                </div>
              </form>
            </SectionedForm>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="grid gap-4 lg:grid-cols-2">
          <AnalyticsChart
            title="Participants by Gender"
            description="Distribution across submitted wellness assessments."
            type="horizontal-bar"
            data={genderBreakdown}
            valueLabel="Participants"
            denominator={`n = ${responses.length}`}
            sampleSize={responses.length}
          />
          <AnalyticsChart
            title="Participants by Education Level"
            description="Demographic breakdown of recorded assessments."
            type="horizontal-bar"
            data={educationBreakdown}
            valueLabel="Participants"
            denominator={`n = ${responses.length}`}
            sampleSize={responses.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
