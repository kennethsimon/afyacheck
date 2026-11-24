"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/platform/states";
import {
  useCreateWellnessResponse,
  useWellnessQuestions,
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export default function WellnessAssessmentPage() {
  const questionsQuery = useWellnessQuestions();
  const createResponse = useCreateWellnessResponse();

  const [participant, setParticipant] = useState({
    name: "",
    date: format(new Date(), "yyyy-MM-dd"),
    education_level: "",
    age: "",
    gender: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data]
  );
  const answeredCount = useMemo(
    () => questions.filter((q) => Boolean(answers[q._id])).length,
    [questions, answers]
  );
  const progressPct =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !participant.name.trim() ||
      !participant.age ||
      !participant.gender ||
      !participant.education_level
    ) {
      toast.error("Complete all participant demographic fields.");
      return;
    }

    if (questions.length > 0 && answeredCount < questions.length) {
      toast.error(
        `Please answer all ${questions.length} assessment questions (${answeredCount} completed).`
      );
      return;
    }

    try {
      await createResponse.mutateAsync({
        user: {
          name: participant.name.trim(),
          date: participant.date,
          education_level: participant.education_level,
          age: Number(participant.age),
          gender: participant.gender,
        },
        answers: questions.map((q) => ({
          question: q._id,
          answer: answers[q._id],
        })),
      });
      toast.success("Wellness assessment submitted");
      setSubmitted(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit assessment"));
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="rounded-lg border border-emerald-500/30 bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Assessment Recorded
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Thank you. The wellness questionnaire response has been saved
                securely for authorized clinical review. Scores are screening
                indicators and do not represent a clinical diagnosis.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setAnswers({});
                setParticipant({
                  name: "",
                  date: format(new Date(), "yyyy-MM-dd"),
                  education_level: "",
                  age: "",
                  gender: "",
                });
                setSubmitted(false);
              }}
            >
              Start Another Assessment
            </Button>
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/wellness">Return to Wellness</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        title="Wellness Assessment Questionnaire"
        description="Structured self-report or clinician-assisted wellness intake preserving validated item scales."
        breadcrumbs={[
          { label: "Workspace", href: "/overview" },
          { label: "Wellness", href: "/wellness" },
          { label: "Assessment" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/wellness">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Wellness
            </Link>
          </Button>
        }
      />

      {/* Privacy Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <strong className="text-foreground">Privacy Notice:</strong> Responses
          are confidential and accessible only to authorized health staff. This
          questionnaire supports wellness screening and does not establish a
          psychiatric or medical diagnosis.
        </div>
      </div>

      {/* Progress Strip */}
      <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Completion Progress</span>
          <span className="tabular-nums text-muted-foreground">
            {answeredCount} of {questions.length} questions answered ({progressPct}%)
          </span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Participant Information */}
      <SectionedForm
        title="1. Participant Information"
        description="Basic demographics recorded alongside the assessment."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5 lg:col-span-2">
            <Label className="text-xs">
              Participant Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={participant.name}
              onChange={(e) =>
                setParticipant((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Full name"
              className="h-9 bg-background text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Age (years) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={5}
              max={120}
              value={participant.age}
              onChange={(e) =>
                setParticipant((p) => ({ ...p, age: e.target.value }))
              }
              placeholder="e.g., 28"
              className="h-9 bg-background tabular-nums text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={participant.gender}
              onValueChange={(v) => setParticipant((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger className="h-9 bg-background text-xs">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Education Level <span className="text-destructive">*</span>
            </Label>
            <Select
              value={participant.education_level}
              onValueChange={(v) =>
                setParticipant((p) => ({ ...p, education_level: v }))
              }
            >
              <SelectTrigger className="h-9 bg-background text-xs">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
                <SelectItem value="Diploma / Certificate">Diploma / Certificate</SelectItem>
                <SelectItem value="University">University</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionedForm>

      {/* Questions */}
      <SectionedForm
        title="2. Assessment Items"
        description="Select the response option that best describes the participant's experience."
      >
        {questionsQuery.isLoading ? (
          <LoadingSkeleton variant="form" rows={4} />
        ) : questionsQuery.isError ? (
          <ErrorState
            description={getErrorMessage(questionsQuery.error)}
            onRetry={() => questionsQuery.refetch()}
          />
        ) : questions.length === 0 ? (
          <EmptyState
            title="No assessment questions available"
            description="An administrator must add validated wellness questions before administering this form."
          />
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => {
              const selected = answers[q._id];
              return (
                <fieldset
                  key={q._id}
                  className="rounded-md border border-border bg-background/60 p-4 space-y-3"
                >
                  <legend className="text-xs font-medium text-foreground">
                    <span className="mr-2 font-mono text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    {q.question_text}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => {
                      const active = selected === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q._id]: option }))
                          }
                          aria-pressed={active}
                          className={cn(
                            "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:bg-muted/60"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        )}
      </SectionedForm>

      <StickyFormActions
        helperText={`${answeredCount} of ${questions.length} items completed`}
      >
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/wellness">Cancel</Link>
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createResponse.isPending || questions.length === 0}
          className="h-8 gap-1.5 text-xs"
        >
          {createResponse.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Submit Assessment
        </Button>
      </StickyFormActions>
    </form>
  );
}
