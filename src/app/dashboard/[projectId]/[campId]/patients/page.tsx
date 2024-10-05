import PatientFilters from "@/components/analytics/patient-filters";
import { getPatients } from "@/services/projects";
import PatientsTable from "@/components/patients-page";
import { TasksTableProvider } from "@/components/table/tasks-table-provider";
import React from "react";
import { TasksTable } from "@/components/table/tasks-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { MainFilters } from "@/components/analytics/main-filters";
import { FilterField } from "@/lib/hooks/use-filters";

export default async function PatientsPage({
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

  // Extract createdAt-from and createdAt-to from searchParams
  let rangeCreatedAtFrom = foundSearchParams["createdAt-from"] as string;
  let rangeCreatedAtTo = foundSearchParams["createdAt-to"] as string;

  // Set default values if not present
  if (!rangeCreatedAtFrom || !rangeCreatedAtTo) {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    rangeCreatedAtFrom = lastMonth.toISOString().split("T")[0];
    rangeCreatedAtTo = today.toISOString().split("T")[0];
  }

  const patientsPromise = getPatients(combinedParams);

  const filterFields: FilterField[] = [
    {
      label: "Created Date Range",
      value: "createdAt",
      type: "date",
      defaultValue: {
        from: new Date(rangeCreatedAtFrom),
        to: new Date(rangeCreatedAtTo),
      },
    },
  ];

  const dateRanges = ["createdAt"];

  return (
    <div className="flex min-h-screen w-full px-2 flex-col">
      <main className=" flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 ">
        <div className=" auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <h2 className="text-xl text-center py-4 font-semibold">
            Patients Table
          </h2>

          <div className="mb-2">
            <MainFilters filterFields={filterFields} dateRanges={dateRanges} />
          </div>

          <TasksTableProvider>
            <React.Suspense
              fallback={
                <DataTableSkeleton
                  columnCount={3}
                  searchableColumnCount={2}
                  filterableColumnCount={1}
                  cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                  shrinkZero
                />
              }
            >
              <TasksTable patientPromise={patientsPromise} />
            </React.Suspense>
          </TasksTableProvider>
        </div>
      </main>
    </div>
  );
}
