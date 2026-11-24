import { redirect } from "next/navigation";

export default function LegacyDashboardEditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  redirect(`/team/${params.userId}/edit`);
}
