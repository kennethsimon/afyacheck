import Homepage from "@/components/home";
import { getCampStats } from "../../../../services/projects";

export default async function DashboardPage({
  params,
}: {
  params: { campId: string };
}) {
  const { items: userStats } = await getCampStats(params.campId);

  return <Homepage UserStats={userStats} />;
}
