"use client";

import * as React from "react";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { getColumns } from "./diagnosis-table-columns";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { DataTableFilterField } from "@/types/general";
import { CustomFilters } from "@/components/table-filters/custom-filters";
import { getDiagnosis } from "../../services/projects";
import { useTasksTable } from "./tasks-table-provider";

interface TasksTableProps {
  patientPromise: ReturnType<typeof getDiagnosis>;
}

export function DiagnosisTable({ patientPromise }: TasksTableProps) {
  const { featureFlags } = useTasksTable();

  let data: any[] = [];
  let pageCount: number = 0;

  try {
    const result = React.use(patientPromise);
    data = result?.data || [];
    pageCount = result?.pageCount || 0;
  } catch (error) {
    console.error("Error loading diagnosis data:", error);
    data = [];
    pageCount = 0;
  }

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  const filterFields: DataTableFilterField<any>[] = [
    {
      label: "Patient Id",
      value: "patientIdentifier",
      placeholder: "Search Patient Id...",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    defaultPerPage: 10,
    defaultSort: "dateCreated.desc",
  });

  return (
    <div className="w-full space-y-4">
      <DataTableToolbar table={table} filterFields={filterFields}>
        <TasksTableToolbarActions table={table} />
      </DataTableToolbar>
      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <DataTable table={table} />
      </div>
    </div>
  );
}
