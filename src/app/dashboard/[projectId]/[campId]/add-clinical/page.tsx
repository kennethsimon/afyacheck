"use client";

import { ClinicalWorkspaceView } from "@/components/workspaces/clinical-workspace-view";

export default function LegacyDashboardAddClinicalPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <ClinicalWorkspaceView
      initialSection="infectious"
      scopedCampId={params.campId !== "all" ? params.campId : undefined}
    />
  );
}
