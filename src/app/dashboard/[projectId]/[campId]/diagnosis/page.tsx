import { getDiagnosis } from "@/services/projects";
import React from "react";
import { Stethoscope } from "lucide-react";
import { DiagnosisTableWrapper } from "@/components/diagnosis-table-wrapper";

export default async function DiagnosisPage({
  params,
  searchParams,
}: {
  params: { campId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const foundSearchParams = searchParams || {};

  // Combine foundSearchParams and params
  const combinedParams: any = { ...foundSearchParams, ...params };
  console.log(combinedParams);

  let per_page = foundSearchParams["per_page"] as string;
  let page = foundSearchParams["page"] as string;

  if (!per_page) {
    per_page = "10";
  }
  
  if (!page) {
    page = "1";
  }

  combinedParams["per_page"] = per_page;
  combinedParams["page"] = page;

  // Extract createdAt-from and createdAt-to from searchParams
  let rangeCreatedAtFrom = foundSearchParams["createdAt-from"] as string;
  let rangeCreatedAtTo = foundSearchParams["createdAt-to"] as string;

  // Set default values if not present
  // Set default values if not present
  if (!rangeCreatedAtFrom || !rangeCreatedAtTo) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // January 1st
    const endOfYear = new Date(currentYear, 11, 31); // December 31st

    rangeCreatedAtFrom = startOfYear.toISOString().split("T")[0];
    rangeCreatedAtTo = endOfYear.toISOString().split("T")[0];
  }

  const diagnosisPromise = getDiagnosis(combinedParams);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
        <div className="auto-rows-max items-start gap-4 md:gap-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Diagnosis Records
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View and manage patient diagnosis records
                </p>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading diagnosis records...</div>
                  </div>
                }
              >
                <DiagnosisTableWrapper diagnosisPromise={diagnosisPromise} />
              </React.Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
