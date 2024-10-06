import AnalyticCharts from "@/components/analytics/charts";
import PatientStats from "@/components/analytics/patient-stats";
import {
  getCampStats,
  getPatientAnalyticsData,
  getPatients,
} from "@/services/projects";

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
  // const get analytics data
  const { items: analyticsData } = await getPatientAnalyticsData(
    combinedParams
  );
  console.log("ANALYTICS PAGE");
  console.log("params : ", params);
  console.log("User Stats in analytics page : ", userStats);

  console.log("Analytics Data: ", JSON.stringify(analyticsData));

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
        {analyticsData ? (
          <AnalyticCharts params={params} analyticsData={analyticsData.stats} />
        ) : (
          <p>Charts Loading...</p>
        )}
      </main>
    </div>
  );
}
