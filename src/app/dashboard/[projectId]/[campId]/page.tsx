import PatientStats from "@/components/analytics/patient-stats";
import { getCampStats, getPatients } from "@/services/projects";
import { Activity, Stethoscope, Heart, Users, TrendingUp } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: { campId: string; projectId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log({ searchParams });
  const foundSearchParams = searchParams || {};

  // Combine foundSearchParams and params
  const combinedParams = { ...foundSearchParams, ...params };

  params = { ...foundSearchParams, ...params } as any;
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
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Medical Camp Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive overview of patient care and health metrics
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mappedUserStats.attended || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mappedUserStats.newPatientsToday || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mappedUserStats.newPatientsThisWeek || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mappedUserStats.newPatientsThisMonth || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Stethoscope className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Statistics Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Patient Statistics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed breakdown of patient demographics and health metrics
              </p>
            </div>
          </div>
          {userStats && <PatientStats UserStats={{ stats: mappedUserStats }} />}
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <AnalyticsDashboard projectId={params.projectId} campId={params.campId} />
        </div>
      </main>
    </div>
  );
}

// V0 Links
// https://v0.dev/r/sE7ByzrwKiT
// https://v0.dev/r/K7ko7IZUvbp
