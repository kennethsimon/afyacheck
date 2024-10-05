import { getDiagnosis } from "@/services/projects";
import { TasksTableProvider } from "@/components/table/tasks-table-provider";
import React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

import { DiagnosisTable } from "@/components/table/diagnosis-table";

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

  if (!per_page) {
    per_page = "10";
  }

  combinedParams["per_page"] = per_page;

  const diagnosisPromise = getDiagnosis(combinedParams);

  return (
    <div className="flex min-h-screen w-full px-2 flex-col">
      <main className=" flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
        <div className=" auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          {/* mention the total count */}
          <h2 className="text-xl text-center py-4 font-semibold">
            Diagnosis Table
          </h2>

          <TasksTableProvider>
            <React.Suspense
              fallback={
                <DataTableSkeleton
                  columnCount={3}
                  searchableColumnCount={1}
                  filterableColumnCount={2}
                  cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                  shrinkZero
                />
              }
            >
              <DiagnosisTable patientPromise={diagnosisPromise} />
            </React.Suspense>
          </TasksTableProvider>
        </div>
      </main>
    </div>
  );
}
