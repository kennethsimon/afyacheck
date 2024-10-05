import PatientStats from "@/components/analytics/patient-stats";
import { getCampStats, getPatients } from "@/services/projects";
import PatientFilters from "@/components/analytics/patient-filters";
import ChartsComponent from "@/components/analytics/patient-charts";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: { campId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log({ searchParams });
  const foundSearchParams = searchParams || {};

  // Combine foundSearchParams and params
  const combinedParams = { ...foundSearchParams, ...params };

  params = { ...foundSearchParams, ...params };
  const { items: userStats } = await getCampStats(combinedParams);
  const { data: patients } = await getPatients(combinedParams);
  console.log("params : ", params);
  console.log("User Stats in dashboard page : ", userStats);

  // Map the API response to the expected structure
  const mappedUserStats = {
    attended: userStats.stats.attended,
    male: userStats.stats.male,
    female: userStats.stats.female,
    others: userStats.stats.others || 0,
    children: userStats.stats.children,
    teenagers: userStats.stats.teenagers,
    adults: userStats.stats.adults,
    seniors: userStats.stats.seniors,
    newPatientsToday: userStats.stats.newPatientsToday,
    prevNewPatientsToday: userStats.stats.newPatientsYesterday || 0,
    newPatientsThisWeek: userStats.stats.newPatientsThisWeek,
    prevNewPatientsThisWeek: userStats.stats.newPatientsLastWeek || 0,
    newPatientsThisMonth: userStats.stats.newPatientsThisMonth,
    prevNewPatientsThisMonth: userStats.stats.newPatientsLastMonth || 0,
    newPatientsThisYear: userStats.stats.newPatientsThisYear,
    prevNewPatientsThisYear: userStats.stats.newPatientsLastYear || 0,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Camp Dashboard</h2>
          <p className="text-muted-foreground">
            Filter and explore patient Insights.
          </p>
        </div>
        {/* <PatientFilters isDashboardPage={true} /> */}
        {userStats && <PatientStats UserStats={{ stats: mappedUserStats }} />}
      </main>
    </div>
  );
}

// V0 Links
// https://v0.dev/r/sE7ByzrwKiT
// https://v0.dev/r/K7ko7IZUvbp
