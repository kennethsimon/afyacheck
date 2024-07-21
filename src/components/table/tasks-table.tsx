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

import { DateFilters } from "@/components/table-filters/date-filters";
import { CustomFilters } from "@/components/table-filters/custom-filters";
import { getPatients } from "../../services/projects";

interface TasksTableProps {
  patientPromise: ReturnType<typeof getPatients>;
}

export function TasksTable({ patientPromise }: TasksTableProps) {
  // Feature flags for showcasing some additional features. Feel free to remove them.
  const { featureFlags } = useTasksTable();

  const { data, pageCount } = React.use(patientPromise);

  console.log(data);
  console.log(data);

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
      label: "Tracking Number",
      value: "trackingNumber",
      placeholder: "Search Tracking Number...",
    },
    {
      label: "Customer Name",
      value: "recipient_name",
      placeholder: "Search Customer Name...",
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
    <div className="w-full space-y-2.5 overflow-auto">
      {/* {featureFlags.includes("advancedFilter") ? (
        <DataTableAdvancedToolbar table={table} filterFields={filterFields}>
          <TasksTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} filterFields={filterFields}>
          <TasksTableToolbarActions table={table} />
        </DataTableToolbar>
      )} */}

      <DataTableToolbar table={table} filterFields={filterFields}>
        <TasksTableToolbarActions table={table} />
      </DataTableToolbar>
      <DateFilters />
      <CustomFilters />

      <DataTable
        table={table}
        floatingBar={
          featureFlags.includes("floatingBar") ? (
            <TasksTableFloatingBar table={table} />
          ) : null
        }
      />
    </div>
  );
}
