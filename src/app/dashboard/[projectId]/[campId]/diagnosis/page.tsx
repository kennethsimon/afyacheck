"use client";

import { ClinicalWorkspaceView } from "@/components/workspaces/clinical-workspace-view";

export default function LegacyDashboardDiagnosisPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <ClinicalWorkspaceView
      initialTab="register"
      scopedCampId={params.campId !== "all" ? params.campId : undefined}
    />
  );
}
