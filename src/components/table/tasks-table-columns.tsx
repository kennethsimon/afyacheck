"use client";

import * as React from "react";
import { MoreHorizontal, Eye, Copy, User } from "lucide-react";
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
import { PreviewPatientSheet } from "./preview-patient-sheet";
import { differenceInYears, parseISO, format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function getGenderBadge(gender: string) {
  if (!gender) return <span className="text-gray-400">—</span>;
  
  const genderLower = gender.toLowerCase();
  if (genderLower === "male") {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Male</Badge>;
  } else if (genderLower === "female") {
    return <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-xs">Female</Badge>;
  } else {
    return <Badge variant="outline" className="text-xs">{gender}</Badge>;
  }
}

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  try {
    const dob = parseISO(dateOfBirth);
    return differenceInYears(new Date(), dob);
  } catch {
    return null;
  }
}

export function getColumns(): ColumnDef<any>[] {
  return [
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [showPreviewSheet, setShowPreviewSheet] = React.useState(false);
        const [copied, setCopied] = React.useState(false);
        const [mounted, setMounted] = React.useState(false);

        // Ensure component only renders interactive elements after mount to prevent hydration issues
        React.useEffect(() => {
          setMounted(true);
        }, []);

        const copyToClipboard = React.useCallback((text: string) => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }, []);

        const handleOpenChange = React.useCallback((open: boolean) => {
          setShowPreviewSheet(open);
        }, []);

        const handleViewDetails = React.useCallback(() => {
          setShowPreviewSheet(true);
        }, []);

        const handleCopy = React.useCallback(() => {
          copyToClipboard(row.original.patientIdentifier);
        }, [row.original.patientIdentifier, copyToClipboard]);

        // Render a placeholder during SSR to prevent hydration mismatch
        if (!mounted) {
          return (
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="Open menu"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <>
            <PreviewPatientSheet
              key={row.original.patientIdentifier}
              open={showPreviewSheet}
              onOpenChange={handleOpenChange}
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
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy Patient ID"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleViewDetails}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
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
        <div className="font-mono font-semibold text-sm text-blue-600 dark:text-blue-400">
          {formatValue(row?.original?.patientIdentifier)}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      size: 140,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const initials = name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "??";
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {formatValue(name)}
            </div>
          </div>
        );
      },
      enableSorting: true,
      size: 200,
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gender" />
      ),
      cell: ({ row }) => getGenderBadge(row.original.gender),
      enableSorting: true,
      size: 100,
    },
    {
      accessorKey: "dateOfBirth",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Age" />
      ),
      cell: ({ row }) => {
        const age = calculateAge(row.original.dateOfBirth);
        if (age === null) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{age}</span>
            <span className="text-xs text-gray-500">years</span>
          </div>
        );
      },
      enableSorting: true,
      size: 90,
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {formatValue(row.original.phoneNumber)}
        </div>
      ),
      enableSorting: true,
      size: 130,
    },
    {
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const region = row.original.region;
        const district = row.original.district;
        
        if (!region && !district) return <span className="text-gray-400">—</span>;
        
        return (
          <div className="text-sm">
            {district && (
              <div className="font-medium text-gray-900 dark:text-gray-100">{district}</div>
            )}
            {region && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{region}</div>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registered" />
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
