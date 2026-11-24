"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Download,
  Loader2,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/platform/page-header";
import {
  AdvancedFilterPanel,
  DataToolbar,
  FilterPopover,
  type ActiveFilterChip,
} from "@/components/platform/data-toolbar";
import { EnterpriseDataTable } from "@/components/platform/data-table";
import { StatusBadge } from "@/components/platform/states";
import { useCamps, useDiagnoses, usePatients } from "@/lib/api/hooks";
import { fetchAllMatchingPatients } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/client";
import { useWorkspace } from "@/lib/workspace-context";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  canAccessClinical,
  canRegisterPatient,
  isAdminSession,
} from "@/lib/permissions";
import { calculateAge } from "@/lib/utils";
import type { PatientRecord } from "@/lib/api/types";

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (val: string | number) => {
    const str = String(val ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PatientsRegisterView({
  scopedProjectId,
  scopedCampId,
  embedded = false,
}: {
  scopedProjectId?: string;
  scopedCampId?: string;
  embedded?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const workspace = useWorkspace();

  const effectiveProjectId = scopedProjectId ?? workspace.projectId ?? "all";
  const effectiveCampId = scopedCampId ?? workspace.campId ?? "all";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [gender, setGender] = useState<string>("all");
  const [insurance, setInsurance] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [exporting, setExporting] = useState(false);

  const isAdmin = isAdminSession(session as any);
  const canAdd = canRegisterPatient(session as any);
  const canScreen = canAccessClinical(session as any);

  const queryParams = useMemo(
    () => ({
      projectId: effectiveProjectId,
      campId: effectiveCampId,
      name: debouncedSearch.trim() || undefined,
      gender: gender !== "all" ? gender : undefined,
      insurance: insurance.trim() || undefined,
      location: location.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy,
      order,
      page,
      limit,
    }),
    [
      effectiveProjectId,
      effectiveCampId,
      debouncedSearch,
      gender,
      insurance,
      location,
      dateFrom,
      dateTo,
      sortBy,
      order,
      page,
      limit,
    ]
  );

  const patientsQuery = usePatients(queryParams);
  const campsQuery = useCamps(effectiveProjectId);
  // Fetch recent diagnoses in scope to reflect screening status accurately
  const diagnosesQuery = useDiagnoses({
    projectId: effectiveProjectId,
    campId: effectiveCampId,
    page: 1,
    limit: 500,
  });

  const campMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campsQuery.data?.camps ?? []) {
      map.set(c._id, c.name);
    }
    return map;
  }, [campsQuery.data?.camps]);

  const diagnosisByPatientId = useMemo(() => {
    const map = new Map<string, "completed" | "pending">();
    for (const d of diagnosesQuery.data?.items ?? []) {
      if (!d.patientIdentifier) continue;
      const existing = map.get(d.patientIdentifier);
      if (d.status === "completed" || !existing) {
        map.set(d.patientIdentifier, d.status);
      }
    }
    return map;
  }, [diagnosesQuery.data?.items]);

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    if (gender !== "all") {
      list.push({
        key: "gender",
        label: "Gender",
        value: gender,
        onRemove: () => {
          setGender("all");
          setPage(1);
        },
      });
    }
    if (insurance.trim()) {
      list.push({
        key: "insurance",
        label: "Insurance",
        value: insurance.trim(),
        onRemove: () => {
          setInsurance("");
          setPage(1);
        },
      });
    }
    if (location.trim()) {
      list.push({
        key: "location",
        label: "Location",
        value: location.trim(),
        onRemove: () => {
          setLocation("");
          setPage(1);
        },
      });
    }
    if (dateFrom) {
      list.push({
        key: "dateFrom",
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
        key: "dateTo",
        label: "To",
        value: dateTo,
        onRemove: () => {
          setDateTo("");
          setPage(1);
        },
      });
    }
    return list;
  }, [gender, insurance, location, dateFrom, dateTo]);

  const clearAllFilters = () => {
    setGender("all");
    setInsurance("");
    setLocation("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleExport = async (includeIdentifiers: boolean) => {
    if (!isAdmin) {
      toast.error("Export requires administrator privileges.");
      return;
    }
    setExporting(true);
    try {
      const { page: _p, limit: _l, ...filterParams } = queryParams;
      const allRecords = await fetchAllMatchingPatients(filterParams);
      if (allRecords.length === 0) {
        toast.info("No matching patient records to export.");
        return;
      }

      const headers = includeIdentifiers
        ? [
            "Patient Identifier",
            "Full Name",
            "Age",
            "Gender",
            "Phone",
            "Region",
            "District",
            "Insurance",
            "Camp",
            "Screening Status",
            "Registered At",
          ]
        : [
            "Record Index",
            "Age",
            "Gender",
            "Region",
            "District",
            "Has Insurance",
            "Camp",
            "Screening Status",
            "Registered Date",
          ];

      const rows = allRecords.map((p, idx) => {
        const age = p.dateOfBirth ? calculateAge(p.dateOfBirth) : "";
        const campName =
          typeof p.camp === "object"
            ? p.camp?.name || ""
            : campMap.get(p.camp) || "";
        const status =
          (p.patientIdentifier && diagnosisByPatientId.get(p.patientIdentifier)) ||
          "not-screened";
        const regDate = p.createdAt ? format(new Date(p.createdAt), "yyyy-MM-dd") : "";

        if (includeIdentifiers) {
          return [
            p.patientIdentifier || "",
            p.name || "",
            age,
            p.gender || "",
            p.phoneNumber || "",
            p.region || p.location || "",
            p.district || "",
            p.insurance || "",
            campName,
            status,
            regDate,
          ];
        }
        return [
          idx + 1,
          age,
          p.gender || "",
          p.region || p.location || "",
          p.district || "",
          p.insurance ? "Yes" : "No",
          campName,
          status,
          regDate,
        ];
      });

      const suffix = includeIdentifiers ? "authorized-identifiable" : "deidentified";
      downloadCsv(
        `afyacheck-patients-${suffix}-${format(new Date(), "yyyy-MM-dd")}.csv`,
        headers,
        rows
      );
      toast.success(
        `Exported ${allRecords.length.toLocaleString()} ${
          includeIdentifiers ? "authorized patient" : "de-identified"
        } records`
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to export patient dataset"));
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnDef<PatientRecord>[] = useMemo(
    () => [
      {
        accessorKey: "patientIdentifier",
        header: "Patient ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {row.original.patientIdentifier || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Patient Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name || "—"}
          </span>
        ),
      },
      {
        id: "age",
        header: "Age",
        cell: ({ row }) => {
          const dob = row.original.dateOfBirth;
          if (!dob) return <span className="text-muted-foreground">—</span>;
          const age = calculateAge(dob);
          return (
            <span className="tabular-nums text-xs">
              {Number.isNaN(age) ? "—" : `${age} yrs`}
            </span>
          );
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.dateOfBirth
              ? format(new Date(row.original.dateOfBirth), "yyyy-MM-dd")
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
          <span className="capitalize text-xs text-foreground">
            {row.original.gender || "—"}
          </span>
        ),
      },
      {
        id: "camp",
        header: "Camp",
        cell: ({ row }) => {
          const campName =
            typeof row.original.camp === "object"
              ? row.original.camp?.name
              : campMap.get(row.original.camp);
          return (
            <span className="text-xs text-muted-foreground">
              {campName || "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.region || row.original.location || "—"}
          </span>
        ),
      },
      {
        accessorKey: "insurance",
        header: "Insurance",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.insurance || "None"}
          </span>
        ),
      },
      {
        id: "screeningStatus",
        header: "Screening Status",
        cell: ({ row }) => {
          const pid = row.original.patientIdentifier;
          const status = pid ? diagnosisByPatientId.get(pid) : undefined;
          if (status === "completed") {
            return <StatusBadge tone="success">Finalized</StatusBadge>;
          }
          if (status === "pending") {
            return <StatusBadge tone="warning">In Progress</StatusBadge>;
          }
          return <StatusBadge tone="neutral">Not Screened</StatusBadge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ row }) => (
          <span className="tabular-nums text-xs text-muted-foreground">
            {row.original.createdAt
              ? format(new Date(row.original.createdAt), "MMM d, yyyy")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {canScreen && row.original.patientIdentifier && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  const cid =
                    typeof row.original.camp === "string"
                      ? row.original.camp
                      : row.original.camp?._id || effectiveCampId;
                  router.push(
                    `/clinical?patientIdentifier=${encodeURIComponent(
                      row.original.patientIdentifier!
                    )}&campId=${encodeURIComponent(cid || "")}`
                  );
                }}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Screen
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/patients/${row.original._id}`);
              }}
            >
              Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [campMap, diagnosisByPatientId, canScreen, effectiveCampId, router]
  );

  const registerHref =
    effectiveCampId && effectiveCampId !== "all"
      ? `/patients/new?campId=${encodeURIComponent(effectiveCampId)}`
      : "/patients/new";

  return (
    <div className="space-y-4">
      {!embedded && (
        <PageHeader
          title="Patient Register"
          description="Search, filter, and manage registered patients across active health projects and camps."
          breadcrumbs={[
            { label: "Workspace", href: "/overview" },
            { label: "Patients" },
          ]}
          actions={
            <>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exporting}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {exporting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Export CSV
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="text-xs">
                      Full Matching Dataset Export
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleExport(false)}
                      className="cursor-pointer text-xs"
                    >
                      De-identified CSV (Recommended)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport(true)}
                      className="cursor-pointer text-xs text-amber-700 dark:text-amber-400"
                    >
                      Authorized Patient-Level CSV (Includes PII)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {canAdd && (
                <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                  <Link href={registerHref}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Register Patient
                  </Link>
                </Button>
              )}
            </>
          }
        />
      )}

      <DataToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search patient by name..."
        chips={chips}
        onClearFilters={clearAllFilters}
        filters={
          <>
            <FilterPopover activeCount={chips.length}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Gender</Label>
                  <Select
                    value={gender}
                    onValueChange={(val) => {
                      setGender(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
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

            <AdvancedFilterPanel
              title="Advanced Patient Filters"
              description="Filter by insurance, location, or adjust server sort order."
              activeCount={
                (insurance.trim() ? 1 : 0) + (location.trim() ? 1 : 0)
              }
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Insurance / Bima</Label>
                  <Input
                    value={insurance}
                    onChange={(e) => {
                      setInsurance(e.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g., NHIF, Strategis"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Filter by location..."
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sort Field</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => {
                        setSortBy(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Registration Date</SelectItem>
                        <SelectItem value="name">Patient Name</SelectItem>
                        <SelectItem value="dateOfBirth">Date of Birth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Order</Label>
                    <Select
                      value={order}
                      onValueChange={(v: any) => {
                        setOrder(v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest first</SelectItem>
                        <SelectItem value="asc">Oldest first</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </AdvancedFilterPanel>
          </>
        }
        actions={
          embedded && canAdd ? (
            <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={registerHref}>
                <UserPlus className="h-3.5 w-3.5" />
                Register Patient
              </Link>
            </Button>
          ) : undefined
        }
      />

      <EnterpriseDataTable
        columns={columns}
        data={patientsQuery.data?.items ?? []}
        isLoading={patientsQuery.isLoading}
        error={
          patientsQuery.isError ? getErrorMessage(patientsQuery.error) : null
        }
        onRetry={() => patientsQuery.refetch()}
        initialColumnVisibility={{
          dateOfBirth: false,
          region: false,
          insurance: false,
        }}
        page={page}
        pageCount={patientsQuery.data?.pageCount ?? 1}
        pageSize={limit}
        totalCount={patientsQuery.data?.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        emptyTitle="No patients registered in this scope"
        emptyDescription="Select a different project or camp, clear active filters, or register a new patient."
        emptyAction={
          canAdd ? (
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href={registerHref}>Register Patient</Link>
            </Button>
          ) : undefined
        }
        onRowClick={(row) => router.push(`/patients/${row._id}`)}
      />
    </div>
  );
}
