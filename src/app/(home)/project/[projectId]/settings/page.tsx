import { redirect } from "next/navigation";

export default function LegacyProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}?tab=settings`);
}
