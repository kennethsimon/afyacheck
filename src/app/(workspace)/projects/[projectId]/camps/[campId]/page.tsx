"use client";

import { CampDetailView } from "@/components/workspaces/camp-detail-view";

export default function ProjectCampDetailPage({
  params,
}: {
  params: { projectId: string; campId: string };
}) {
  return (
    <CampDetailView projectId={params.projectId} campId={params.campId} />
  );
}
