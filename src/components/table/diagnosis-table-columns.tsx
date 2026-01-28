"use client";

import * as React from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { PreviewDiagnosisSheet } from "./preview-diagnosis-sheet";
import { format } from "date-fns";

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function getStatusBadge(status: string) {
  if (!status) return null;
  
  const statusLower = status.toLowerCase();
  if (statusLower === "completed") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
  } else if (statusLower === "pending") {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

function getHealthStatusBadge(value: any, type: "normal" | "abnormal" | "positive" | "negative" = "normal") {
  if (!value || value === "N/A" || value === "—") return <span className="text-gray-400">—</span>;
  
  const valueLower = String(value).toLowerCase();
  
  if (type === "normal") {
    if (valueLower.includes("normal")) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Normal</Badge>;
    } else if (valueLower.includes("abnormal")) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Abnormal</Badge>;
    }
  } else if (type === "positive") {
    if (valueLower.includes("positive")) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">Positive</Badge>;
    } else if (valueLower.includes("negative")) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Negative</Badge>;
    }
  }
  
  return <span className="text-sm">{formatValue(value)}</span>;
}

export function getColumns(): ColumnDef<any>[] {
  return [
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [showPreviewSheet, setShowPreviewSheet] = React.useState(false);

        return (
          <>
            <PreviewDiagnosisSheet
              open={showPreviewSheet}
              onOpenChange={setShowPreviewSheet}
              patient={row.original}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  aria-label="Open menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(
                      row.original.patientIdentifier
                    )
                  }
                >
                  Copy Patient ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowPreviewSheet(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "patientIdentifier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient ID" />
      ),
      cell: ({ row }) => (
        <div className="font-mono font-medium text-sm">
          {formatValue(row?.original?.patientIdentifier)}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 140,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
      enableSorting: true,
      size: 120,
    },
    {
      id: "vitals",
      header: "Vitals",
      cell: ({ row }) => {
        const screening = row.original.screening || {};
        const clinical = row.original.clinicalFindings || {};
        const height = clinical.height || screening.height;
        const weight = clinical.weight || screening.weight;
        const bmi = clinical.bmi || screening.bmi;
        const bp = clinical.bloodPressure || screening.bloodPressure;
        
        return (
          <div className="flex flex-col gap-1 text-xs">
            {height && <div><span className="text-gray-500">H:</span> {height}cm</div>}
            {weight && <div><span className="text-gray-500">W:</span> {weight}kg</div>}
            {bmi && <div><span className="text-gray-500">BMI:</span> {bmi}</div>}
            {bp && <div><span className="text-gray-500">BP:</span> {formatValue(bp)}</div>}
          </div>
        );
      },
      size: 140,
    },
    {
      id: "screening",
      header: "Screening",
      cell: ({ row }) => {
        const clinical = row.original.clinicalFindings || {};
        const hb = clinical.hb || row.original.screening?.hb;
        const tbStatus = clinical.tbScreening?.status;
        const hivResult = clinical.hivResult;
        
        return (
          <div className="flex flex-col gap-1">
            {hb && (
              <div className="text-xs">
                <span className="text-gray-500">HB:</span> {getHealthStatusBadge(hb)}
              </div>
            )}
            {tbStatus && (
              <div className="text-xs">
                <span className="text-gray-500">TB:</span> {getHealthStatusBadge(tbStatus, "positive")}
              </div>
            )}
            {hivResult && (
              <div className="text-xs">
                <span className="text-gray-500">HIV:</span> {getHealthStatusBadge(hivResult, "positive")}
              </div>
            )}
          </div>
        );
      },
      size: 140,
    },
    {
      id: "specialties",
      header: "Specialties",
      cell: ({ row }) => {
        const clinical = row.original.clinicalFindings || {};
        const specialties = [];
        
        if (clinical.physioStatus) specialties.push({ name: "Physio", status: clinical.physioStatus });
        if (clinical.dentalStatus) specialties.push({ name: "Dental", status: clinical.dentalStatus });
        if (clinical.ophthalmologyStatus) specialties.push({ name: "Eye", status: clinical.ophthalmologyStatus });
        if (clinical.orthoStatus) specialties.push({ name: "Ortho", status: clinical.orthoStatus });
        
        if (specialties.length === 0) return <span className="text-gray-400 text-xs">—</span>;
        
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((spec, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs"
              >
                {spec.name}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 2}
              </Badge>
            )}
          </div>
        );
      },
      size: 150,
    },
    {
      id: "radiology",
      header: "Radiology",
      cell: ({ row }) => {
        const clinical = row.original.clinicalFindings || {};
        const radiology = [];
        
        if (clinical.echoStatus) radiology.push({ name: "Echo", status: clinical.echoStatus });
        if (clinical.ecgStatus) radiology.push({ name: "ECG", status: clinical.ecgStatus });
        if (clinical.xrayStatus) radiology.push({ name: "X-ray", status: clinical.xrayStatus });
        if (clinical.ultrasoundStatus) radiology.push({ name: "US", status: clinical.ultrasoundStatus });
        
        if (radiology.length === 0) return <span className="text-gray-400 text-xs">—</span>;
        
        return (
          <div className="flex flex-wrap gap-1">
            {radiology.slice(0, 2).map((rad, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs"
              >
                {rad.name}
              </Badge>
            ))}
            {radiology.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{radiology.length - 2}
              </Badge>
          )}
        </div>
        );
      },
      size: 140,
    },
    {
      id: "cancer",
      header: "Cancer Screening",
      cell: ({ row }) => {
        const clinical = row.original.clinicalFindings || {};
        const cancer = clinical.cancerScreening;
        
        if (!cancer) return <span className="text-gray-400 text-xs">—</span>;
        
        const cancerType = cancer.replace("-cancer", "").replace("Cancer", "");
        return (
          <Badge variant="outline" className="text-xs capitalize">
            {cancerType}
          </Badge>
        );
      },
      size: 130,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return <span className="text-gray-400">—</span>;
        return (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        );
      },
      enableSorting: true,
      size: 120,
    },
  ];
}
