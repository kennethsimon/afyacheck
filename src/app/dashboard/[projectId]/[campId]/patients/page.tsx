import { getPatients } from "@/services/projects";
import React from "react";
import { FilterField } from "@/lib/hooks/use-filters";
import { HeartPulse } from "lucide-react";
import { FiltersDrawer } from "@/components/analytics/filters-drawer";
import { PatientsTableWrapper } from "@/components/patients-table-wrapper";

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: { campId: string; projectId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const foundSearchParams = searchParams || {};

  // Combine foundSearchParams and params
  const combinedParams: any = { ...foundSearchParams, ...params };

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
  // Don't set default date ranges - let users filter if needed, or show all data
  // This supports both old data (2024) and new data (2026+)
  let rangeCreatedAtFrom = foundSearchParams["createdAt-from"] as string;
  let rangeCreatedAtTo = foundSearchParams["createdAt-to"] as string;

  // Only set date filters if explicitly provided by user
  // This ensures backward compatibility with old data
  if (rangeCreatedAtFrom) {
    combinedParams["createdAt-from"] = rangeCreatedAtFrom;
  }
  if (rangeCreatedAtTo) {
    combinedParams["createdAt-to"] = rangeCreatedAtTo;
  }

  const patientsPromise = getPatients(combinedParams);

  const filterFields: FilterField[] = [
    {
      label: "Registration Date Range",
      value: "createdAt",
      type: "date",
      // Don't set default values - let users filter if needed
      // This supports both old data (2024) and new data (2026+)
      defaultValue: rangeCreatedAtFrom && rangeCreatedAtTo ? {
        from: new Date(rangeCreatedAtFrom),
        to: new Date(rangeCreatedAtTo),
      } : undefined,
    },
  ];

  const dateRanges = ["createdAt"];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
        <div className="auto-rows-max items-start gap-4 md:gap-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
                <HeartPulse className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Patient Records
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View and manage all patient records in this medical camp
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
                    <div className="text-gray-500">Loading patients...</div>
                  </div>
                }
              >
                <PatientsTableWrapper patientPromise={patientsPromise} />
              </React.Suspense>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Filter Button and Drawer */}
      <FiltersDrawer filterFields={filterFields} dateRanges={dateRanges} />
    </div>
  );
}
