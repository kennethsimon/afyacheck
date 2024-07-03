import PatientStats from "@/components/analytics/patient-stats";
import { getCampStats, getPatients } from "../../../../services/projects";
import PatientFilters from "@/components/analytics/patient-filtes";
import ChartsComponent from "@/components/analytics/patient-charts";
// Assuming the context is to modify the DashboardPage function to use a different method for handling searchParams

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
  const { items: patients } = await getPatients(combinedParams);
  console.log("params : ", params);
  console.log("User Stats : ", userStats);
  // console.log(" patients : ", patients);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PatientFilters isAnalyticsPage={true} />
        {userStats && <PatientStats UserStats={userStats} />}
        {patients ? (
          patients.patients && patients.patients.length > 0 ? (
            <ChartsComponent patients={patients.patients} />
          ) : (
            <p>No data to create charts</p>
          )
        ) : (
          <p>Charts Loading...</p>
        )}
      </main>
    </div>
  );
}

// V0 Links
// https://v0.dev/r/sE7ByzrwKiT
// https://v0.dev/r/K7ko7IZUvbp
