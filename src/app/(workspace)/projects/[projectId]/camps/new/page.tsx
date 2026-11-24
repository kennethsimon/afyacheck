"use client";

import { CreateCampView } from "@/components/workspaces/create-camp-view";

export default function NewProjectCampPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <CreateCampView defaultProjectId={params.projectId} />;
}
