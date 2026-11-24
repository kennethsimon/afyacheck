"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataToolbar,
  FilterPopover,
  type ActiveFilterChip,
} from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import { StatusBadge } from "@/components/platform/states";
import { useDiagnoses } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import type { DiagnosisRecord } from "@/lib/api/types";

export function DiagnosesRegisterView({
  scopedProjectId,
  scopedCampId,
  onSelectRecord,
}: {
  scopedProjectId?: string;
  scopedCampId?: string;
  onSelectRecord?: (record: DiagnosisRecord) => void;
}) {
  const router = useRouter();
  const workspace = useWorkspace();

  const effectiveProjectId = scopedProjectId ?? workspace.projectId ?? "all";
  const effectiveCampId = scopedCampId ?? workspace.campId ?? "all";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const diagnosesQuery = useDiagnoses({
    projectId: effectiveProjectId,
    campId: effectiveCampId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit,
  });

  const filteredItems = useMemo(() => {
    const raw = diagnosesQuery.data?.items ?? [];
    return raw.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!d.patientIdentifier?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [diagnosesQuery.data?.items, statusFilter, search]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (statusFilter !== "all") {
      list.push({
        key: "status",
        label: "Status",
        value: statusFilter === "completed" ? "Finalized" : "Pending",
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (dateFrom) {
      list.push({
        key: "from",
        label: "From",
        value: dateFrom,
        onRemove: () => {
          setDateFrom("");
          setPage(1);
        },
      });
    }
    if (dateTo) {
      list.push({
        key: "to",
        label: "To",
        value: dateTo,
        onRemove: () => {
          setDateTo("");
          setPage(1);
        },
      });
    }
    return list;
  }, [statusFilter, dateFrom, dateTo]);

  const columns: ColumnDef<DiagnosisRecord>[] = useMemo(
    () => [
      {
        accessorKey: "patientIdentifier",
        header: "Patient ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {row.original.patientIdentifier}
          </span>
        ),
      },
      {
        id: "camp",
        header: "Camp",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {typeof row.original.camp === "object"
              ? row.original.camp?.name || "—"
              : "Assigned camp"}
          </span>
        ),
      },
      {
        id: "vitals",
        header: "Vitals (BP / BMI / Hb)",
        cell: ({ row }) => {
          const s = row.original.screening;
          if (!s) return <span className="text-muted-foreground">Not recorded</span>;
          return (
            <span className="tabular-nums text-xs text-foreground">
              BP: {s.bloodPressure || "—"} · BMI: {s.bmi || "—"} · Hb: {s.hb || "—"}
            </span>
          );
        },
      },
      {
        id: "keyFindings",
        header: "Infectious / Cancer",
        cell: ({ row }) => {
          const cf = row.original.clinicalFindings;
          if (!cf) return <span className="text-muted-foreground">Not performed</span>;
          const parts = [
            cf.tbScreening?.status && `TB: ${cf.tbScreening.status}`,
            cf.hivResult && `HIV: ${cf.hivResult}`,
            cf.cancerScreening && `Cancer: ${cf.cancerScreening}`,
          ].filter(Boolean);
          return (
            <span className="text-xs text-muted-foreground">
              {parts.length > 0 ? parts.join(" · ") : "None flagged"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Record Status",
        cell: ({ row }) => (
          <StatusBadge
            tone={row.original.status === "completed" ? "success" : "warning"}
          >
            {row.original.status === "completed" ? "Finalized" : "Pending draft"}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Recorded",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectRecord) {
                  onSelectRecord(row.original);
                } else {
                  const cid =
                    typeof row.original.camp === "string"
                      ? row.original.camp
                      : row.original.camp?._id || "";
                  router.push(
                    `/clinical?patientIdentifier=${encodeURIComponent(
                      row.original.patientIdentifier
                    )}&campId=${encodeURIComponent(cid)}`
                  );
                }
              }}
            >
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [onSelectRecord, router]
  );

  return (
    <div className="space-y-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter visible records by Patient ID (AC...)..."
        chips={chips}
        onClearFilters={() => {
          setStatusFilter("all");
          setDateFrom("");
          setDateTo("");
          setPage(1);
        }}
        filters={
          <FilterPopover activeCount={chips.length}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Record Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v: any) => setStatusFilter(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending drafts</SelectItem>
                    <SelectItem value="completed">Finalized records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">From date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </FilterPopover>
        }
        actions={
          !onSelectRecord ? (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href="/clinical">
                <Stethoscope className="h-3.5 w-3.5" />
                New Screening
              </Link>
            </Button>
          ) : undefined
        }
      />

      <EnterpriseDataTable
        columns={columns}
        data={filteredItems}
        isLoading={diagnosesQuery.isLoading}
        error={
          diagnosesQuery.isError ? getErrorMessage(diagnosesQuery.error) : null
        }
        onRetry={() => diagnosesQuery.refetch()}
        page={page}
        pageCount={diagnosesQuery.data?.pageCount ?? 1}
        pageSize={limit}
        totalCount={diagnosesQuery.data?.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        emptyTitle="No clinical screening records found"
        emptyDescription="Start a clinical screening encounter in the workspace to capture vitals, screening findings, and doctor reviews."
        onRowClick={(row) => {
          if (onSelectRecord) {
            onSelectRecord(row);
          } else {
            const cid =
              typeof row.camp === "string" ? row.camp : row.camp?._id || "";
            router.push(
              `/clinical?patientIdentifier=${encodeURIComponent(
                row.patientIdentifier
              )}&campId=${encodeURIComponent(cid)}`
            );
          }
        }}
      />
    </div>
  );
}
