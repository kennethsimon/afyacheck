"use client";

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getGenderBackgroundColor } from "@/lib/utils";

import Link from "next/link";
import { Patient } from "@/types/general";
import { differenceInYears, parseISO } from "date-fns";
import { getCampById } from "@/services/camps";
import { getUserById } from "@/services/users";
import { PreviewPatientSheet } from "./preview-patient-sheet";

function CampNameCell({ campId }: { campId: string }) {
  const [campName, setCampName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCampName = async () => {
      try {
        const { items: campDetails } = await getCampById(campId);
        setCampName(campDetails.camp.name);
      } catch (error) {
        console.error("Failed to fetch camp name:", error);
        setCampName("Error loading camp name");
      }
    };
    fetchCampName();
  }, [campId]);

  return <div>{campName || "Loading..."}</div>;
}

function CreatedByCell({ userId }: { userId: string }) {
  const [userName, setUserName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { items: userDetails } = await getUserById(userId);
        setUserName(userDetails.user.name);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUserName("Error loading user name");
      }
    };
    fetchUserName();
  }, [userId]);

  return <div>{userName || "Loading..."}</div>;
}

export function getColumns(): ColumnDef<Patient>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [showPreviewPatientSheet, setShowPreviewPatientSheet] =
          React.useState(false);
        const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
        const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const handleMouseEnter = () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
          }
          if (!isDropdownOpen) {
            setIsDropdownOpen(true);
          }
        };

        const handleMouseLeave = () => {
          closeTimeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
          }, 200); // Adjust the delay as needed
        };

        return (
          <>
            <PreviewPatientSheet
              open={showPreviewPatientSheet}
              onOpenChange={setShowPreviewPatientSheet}
              patient={row.original}
            />
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <DotsHorizontalIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(row.original._id)
                  }
                >
                  Copy Patient ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowPreviewPatientSheet(true)}
                >
                  Preview Patient
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/dashboard/patients/${row.original._id}`}>
                    Open Patient
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/dashboard/patients/edit/${row.original._id}`}>
                    Edit Patient
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="View Patient" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/patients/${row.original._id}`}
          className="text-primary underline"
        >
          View Patient
        </Link>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: "campId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Camp Name" />
      ),
      cell: ({ row }) => <CampNameCell campId={row.original.camp} />,
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gender" />
      ),
      cell: ({ row }) => {
        const gender = row.original.gender;
        const bgColor = getGenderBackgroundColor(gender);
        return (
          <div className={`p-1 text-center font-[500] ${bgColor} rounded`}>
            {gender}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "dateOfBirth",
      header: "Age",
      cell: ({ row }) => {
        const dateOfBirth = parseISO(row.original.dateOfBirth);
        const age = differenceInYears(new Date(), dateOfBirth);
        return age;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone Number" />
      ),
      cell: ({ row }) => <div>{row.original.phoneNumber}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => <div>{row.original.location}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => <CreatedByCell userId={row.original.createdBy} />,
      enableSorting: true,
      enableHiding: true,
    },
  ];
}
