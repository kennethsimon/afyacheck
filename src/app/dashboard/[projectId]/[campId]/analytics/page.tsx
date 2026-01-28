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

  let userStats = null;
  let analyticsData = null;
  let analyticsError = null;

  try {
    const statsResult = await getCampStats(combinedParams);
    userStats = statsResult?.items || null;
  } catch (error) {
    console.error("Error loading camp stats:", error);
  }

  try {
    const analyticsResult = await getPatientAnalyticsData(combinedParams);
    analyticsData = analyticsResult?.items || null;
    analyticsError = analyticsResult?.error || null;
  } catch (error) {
    console.error("Error loading analytics data:", error);
    analyticsError = "Failed to load analytics data";
  }

  console.log("ANALYTICS PAGE");
  console.log("params : ", params);
  console.log("User Stats in analytics page : ", userStats);
  console.log("Analytics Data: ", analyticsData);
  console.log("Analytics Error: ", analyticsError);

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
        
        {analyticsError ? (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">Error loading analytics: {analyticsError}</p>
          </div>
        ) : analyticsData?.stats ? (
          <AnalyticCharts params={params} analyticsData={analyticsData.stats} />
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">No analytics data available for this camp.</p>
          </div>
        )}
      </main>
    </div>
  );
}
