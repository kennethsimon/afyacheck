"use client";

import * as React from "react";
import { useDataTable } from "@/lib/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { getColumns } from "./diagnosis-table-columns";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { DataTableFilterField } from "@/types/general";
import { CustomFilters } from "@/components/table-filters/custom-filters";
import { getPatients } from "../../services/projects";
import { useTasksTable } from "./tasks-table-provider";

interface TasksTableProps {
  patientPromise: ReturnType<typeof getPatients>;
}

export function DiagnosisTable({ patientPromise }: TasksTableProps) {
  const { featureFlags } = useTasksTable();

  const { data, pageCount } = React.use(patientPromise);

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
    <div className="w-full space-y-2.5">
      <DataTableToolbar table={table} filterFields={filterFields}>
        <TasksTableToolbarActions table={table} />
      </DataTableToolbar>
      {/* Container for horizontal scroll */}
      <div style={{width: 'calc(100vw - 250px)'}}>
        <DataTable
          table={table}
        />
      </div>
    </div>
  );
}
