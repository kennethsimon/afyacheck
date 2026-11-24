"use client";

import { ClinicalWorkspaceView } from "@/components/workspaces/clinical-workspace-view";

export default function LegacyDashboardDoctorsCommentsPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <ClinicalWorkspaceView
      initialSection="doctor"
      scopedCampId={params.campId !== "all" ? params.campId : undefined}
    />
  );
}
