"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/platform/page-header";
import {
  KeyValueGrid,
  RecordDetailLayout,
  SectionedForm,
} from "@/components/platform/record-detail-layout";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/components/platform/states";
import { useWellnessResponse } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";

export default function WellnessResponseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const detailQuery = useWellnessResponse(params.id);

  if (detailQuery.isLoading) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (detailQuery.isError) {
    return (
      <ErrorState
        title="Unable to load wellness response"
        description={getErrorMessage(detailQuery.error)}
        onRetry={() => detailQuery.refetch()}
      />
    );
  }

  const data = detailQuery.data;
  if (!data?.response) {
    return (
      <EmptyState
        title="Wellness response not found"
        description="The requested assessment record could not be located."
        action={
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href="/wellness">Back to Wellness</Link>
          </Button>
        }
      />
    );
  }

  const { response, total_score, mental_status } = data;
  const riskTone = mental_status.toLowerCase().includes("low")
    ? "success"
    : mental_status.toLowerCase().includes("moderate")
    ? "warning"
    : "critical";

  return (
    <RecordDetailLayout
      header={
        <PageHeader
          title={response.user?.name || "Participant Response"}
          description="Confidential wellness assessment record and item-level answers."
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Wellness", href: "/wellness" },
            { label: "Response Detail" },
          ]}
          badge={<StatusBadge tone={riskTone}>{mental_status}</StatusBadge>}
          actions={
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/wellness">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Wellness
              </Link>
            </Button>
          }
        />
      }
      sidebar={
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Screening Indicator
            </div>
            <div className="tabular-nums text-3xl font-semibold text-foreground">
              {total_score}
            </div>
            <StatusBadge tone={riskTone}>{mental_status}</StatusBadge>
            <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
              Computed by backend scoring rules. This score is a screening
              indicator only and does not constitute a clinical diagnosis.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-[11px] text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
              Follow-up Guidance
            </div>
            <p>
              Elevated indicator bands should be reviewed by a qualified mental
              health professional in accordance with program referral guidelines.
            </p>
          </div>
        </div>
      }
    >
      <SectionedForm title="Participant Details">
        <KeyValueGrid
          columns={3}
          items={[
            { label: "Name", value: response.user?.name },
            { label: "Age", value: `${response.user?.age ?? "—"} years` },
            { label: "Gender", value: response.user?.gender },
            { label: "Education", value: response.user?.education_level },
            {
              label: "Assessment Date",
              value: response.user?.date
                ? format(new Date(response.user.date), "MMMM d, yyyy")
                : "—",
            },
          ]}
        />
      </SectionedForm>

      <SectionedForm
        title="Item Responses"
        description="Preserved question wording and selected responses."
      >
        <ol className="divide-y divide-border rounded-md border border-border">
          {response.answers.map((ans, idx) => {
            const qText =
              typeof ans.question === "object"
                ? ans.question.question_text
                : `Question ${idx + 1}`;
            return (
              <li
                key={idx}
                className="flex flex-col gap-1 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-foreground">
                  <span className="mr-2 font-mono text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  {qText}
                </span>
                <StatusBadge tone="info" dot={false} className="self-start sm:self-auto">
                  {ans.answer}
                </StatusBadge>
              </li>
            );
          })}
        </ol>
      </SectionedForm>
    </RecordDetailLayout>
  );
}
