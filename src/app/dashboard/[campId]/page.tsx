import Homepage from "@/components/home";

export default function DashboardPage({
  params,
}: {
  params: { campId: string };
}) {
  return <Homepage />;
}
