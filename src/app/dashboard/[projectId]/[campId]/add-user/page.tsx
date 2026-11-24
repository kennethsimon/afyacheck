import { redirect } from "next/navigation";

export default function LegacyDashboardAddUserPage() {
  redirect("/team/new");
}
