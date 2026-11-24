"use client";

import { CampDetailView } from "@/components/workspaces/camp-detail-view";

export default function LegacyDashboardCampOverviewPage({
  params,
}: {
  params: { projectId: string; campId: string };
}) {
  return <CampDetailView projectId={params.projectId} campId={params.campId} />;
}
