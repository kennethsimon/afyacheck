"use client";

import { PatientsRegisterView } from "@/components/workspaces/patients-register-view";

export default function LegacyDashboardPatientsPage({
  params,
}: {
  params: { projectId: string; campId: string };
}) {
  return (
    <PatientsRegisterView
      scopedProjectId={params.projectId}
      scopedCampId={params.campId}
    />
  );
}
