import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>

  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null
}

export function DataTable<TData>({
  table,
  floatingBar = null,
}: DataTableProps<TData>) {
  // Safe access with null checks - all hooks must be called unconditionally
  const rows = React.useMemo(() => {
    if (!table) return [];
    try {
      return table.getRowModel()?.rows || [];
    } catch (error) {
      console.error("Error getting table rows:", error);
      return [];
    }
  }, [table]);

  const headerGroups = React.useMemo(() => {
    if (!table) return [];
    try {
      return table.getHeaderGroups() || [];
    } catch (error) {
      console.error("Error getting header groups:", error);
      return [];
    }
  }, [table]);

  const allColumns = React.useMemo(() => {
    if (!table) return [];
    try {
      return table.getAllColumns() || [];
    } catch (error) {
      console.error("Error getting columns:", error);
      return [];
    }
  }, [table]);

  React.useEffect(() => {
    if (table && rows) {
      console.log("🎯 DataTable - Rendering:", {
        rowsLength: rows.length,
        dataLength: table.options?.data?.length || 0,
        pageCount: table.getPageCount(),
        pageIndex: table.getState()?.pagination?.pageIndex || 0,
        firstRow: rows[0]?.original,
      });
    }
  }, [rows, table]);

  // Safety check after all hooks
  if (!table) {
    return (
      <div className="w-full space-y-2.5 overflow-auto">
        <div className="rounded-md border p-8 text-center text-gray-500">
          Table data is not available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5 overflow-auto">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows && rows.length > 0 ? (
              rows.map((row) => {
                try {
                  const visibleCells = row.getVisibleCells() || [];
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {visibleCells.map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                } catch (error) {
                  console.error("Error rendering table row:", error);
                  return null;
                }
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length || 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel()?.rows?.length > 0 && floatingBar}
      </div>
    </div>
  )
}
