import AnalyticCharts from "@/components/analytics/charts";
import PatientStats from "@/components/analytics/patient-stats";
import { getCampStats, getPatients } from "@/services/projects";

export default async function AnalyticsPage({
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

  const { items: userStats } = await getCampStats(combinedParams);
  let { data: patients } = await getPatients(combinedParams);
  console.log("ANALYTICS PAGE");
  console.log("params : ", params);
  console.log("User Stats in analytics page : ", userStats);
  console.log("patients : ", patients);

  // Assuming analyticsData is derived from patients data
  const analyticsData = {
    attended: patients.length,
    male: patients.filter((p: any) => p.gender === "male").length,
    female: patients.filter((p: any) => p.gender === "female").length,
    children: patients.filter((p: any) => p.age <= 12).length,
    teenagers: patients.filter((p: any) => p.age >= 13 && p.age <= 19).length,
    adults: patients.filter((p: any) => p.age >= 20 && p.age <= 60).length,
    seniors: patients.filter((p: any) => p.age > 60).length,
    withInsurance: patients.filter((p: any) => p.insurance).length,
    withoutInsurance: patients.filter((p: any) => !p.insurance).length,
    newPatientsOverTime: patients.map((p: any) => ({
      date: p.registrationDate,
      count: 1,
    })),
  };

  console.log("Analytics Data: ", analyticsData);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Camp Patients Insights</h2>
          <p className="text-muted-foreground">
            Filter and explore patient Insights.
          </p>
        </div>

        {userStats && <PatientStats UserStats={userStats} />}
        {patients ? (
          patients.length > 0 ? (
            <AnalyticCharts params={params} analyticsData={analyticsData} />
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
