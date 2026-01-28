"use client";

import * as React from "react";
// import { tasks, type Task } from "@/db/schema"
// import type { DataTableFilterField } from "@/types";

import { useDataTable } from "@/lib/hooks/use-data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/advanced/data-table-advanced-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

// import type { getTasks } from "../_lib/queries";
// import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { useTasksTable } from "./tasks-table-provider";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { DataTableFilterField, Order } from "@/types/general";
import { getPatients } from "../../services/projects";

interface TasksTableProps {
  patientPromise: ReturnType<typeof getPatients>;
}

export function TasksTable({ patientPromise }: TasksTableProps) {
  // Feature flags for showcasing some additional features. Feel free to remove them.
  const { featureFlags } = useTasksTable();

  // Use React.use() to unwrap the promise
  // Note: React.use() throws a Suspense exception as part of its normal operation
  // This exception is caught by React's Suspense boundary, not by try/catch
  const result = React.use(patientPromise);
  const data = result.data || [];
  const pageCount = result.pageCount || 0;

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<any>[] = [
    {
      label: "Patient Id",
      value: "patientIdentifier",
      placeholder: "Search Patient Id...",
    },
    {
      label: "Patient Name",
      value: "name",
      placeholder: "Search Patient Name...",
    },
    {
      label: "Phone Number",
      value: "phoneNumber",
      placeholder: "Search Phone Number...",
    },
    {
      label: "Location",
      value: "location",
      placeholder: "Search Location (Region, District)...",
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // optional props
    filterFields,
    // enableAdvancedFilter: featureFlags.includes("advancedFilter"),
    defaultPerPage: 10,
    defaultSort: "dateCreated.desc",
  });


  return (
    <div className="w-full space-y-4">
      <DataTableToolbar table={table} filterFields={filterFields}>
        <TasksTableToolbarActions table={table} />
      </DataTableToolbar>
      
      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <DataTable
          table={table}
          floatingBar={
            featureFlags.includes("floatingBar") ? (
              <TasksTableFloatingBar table={table} />
            ) : null
          }
        />
      </div>
    </div>
  );
}
