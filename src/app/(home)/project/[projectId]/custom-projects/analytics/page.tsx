import { redirect } from "next/navigation";

export default function LegacyCustomAnalyticsPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}?tab=analytics`);
}
