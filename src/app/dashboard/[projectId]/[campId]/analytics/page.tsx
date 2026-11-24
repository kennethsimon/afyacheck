"use client";

import { AnalyticsWorkspaceView } from "@/components/workspaces/analytics-workspace-view";

export default function LegacyDashboardAnalyticsPage({
  params,
}: {
  params: { projectId: string; campId: string };
}) {
  return (
    <AnalyticsWorkspaceView
      scopedProjectId={params.projectId}
      scopedCampId={params.campId}
    />
  );
}
