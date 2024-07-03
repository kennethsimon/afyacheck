import PatientStats from "@/components/analytics/patient-stats";
import { getCampStats } from "../../../../services/projects";
import PatientFilters from "@/components/analytics/patient-filtes";

export default async function DashboardPage({
  params,
}: {
  params: { campId: string };
}) {
  const { items: userStats } = await getCampStats(params.campId);
  console.log("params : ", params);
  console.log("User Stats : ", userStats);

  // return <PatientStats UserStats={userStats} />;
  // PatientFilters
  // filters, patient stats & charts
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PatientFilters isAnalyticsPage={true} />
        <PatientStats UserStats={userStats} />
      </main>
    </div>
  );
}

// V0 Links
// https://v0.dev/r/sE7ByzrwKiT
// https://v0.dev/r/K7ko7IZUvbp
