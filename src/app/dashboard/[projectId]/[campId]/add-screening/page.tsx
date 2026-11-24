"use client";

import { ClinicalWorkspaceView } from "@/components/workspaces/clinical-workspace-view";

export default function LegacyDashboardAddScreeningPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <ClinicalWorkspaceView
      initialSection="vitals"
      scopedCampId={params.campId !== "all" ? params.campId : undefined}
    />
  );
}
