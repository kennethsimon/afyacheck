import { redirect } from "next/navigation";

export default function LegacyProjectCampsPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}?tab=camps`);
}
