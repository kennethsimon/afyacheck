"use client";

import * as React from "react";
// import { tasks, type Task } from "@/db/schema"
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

// import { formatDate, getChannelColor, getServiceIdColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { cn, getGenderBackgroundColor } from "@/lib/utils";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Order, Patient } from "@/types/general";
import { differenceInYears, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { getCampById } from "@/services/camps";
import { PreviewPatientSheet } from "./preview-patient-sheet";

function CampNameCell({ campId }: { campId: string }) {
  const [campName, setCampName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCampName = async () => {
      const { items: campDetails } = await getCampById(campId);
      // console.log({ campDetails });
      setCampName(campDetails.camp.name);
    };
    fetchCampName();
  }, [campId]);

  return <div>{campName || "Loading..."}</div>;
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/patients/${row.original._id}`}
            className="text-primary underline"
          >
            View Patient
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return <div>{row.original.name}</div>;
      },
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
          <div className={`p-1 text-center ${bgColor} rounded`}>{gender}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "dateOfBirth",
      header: "Age",
      cell: ({ row }) => {
        const dob = parseISO(row.original.dateOfBirth);
        const age = differenceInYears(new Date(), dob);
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
      cell: ({ row }) => {
        return <div>{row.original.phoneNumber}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        return <div>{row.original.location}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },

    // {
    //   accessorKey: "dateCreated",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Date Created" />
    //   ),
    //   cell: ({ row }) => {
    //     const date = new Date(row.getValue("dateCreated"));
    //     const formatted = date.toLocaleDateString();
    //     return <div className="font-medium">{formatted}</div>;
    //   },
    // },
    // {
    //   accessorKey: "channel",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Channel / Service Id" />
    //   ),
    //   cell: ({ row }) => {
    //     // const channel1: any = row.getValue("channel");
    //     const channel: any = row.original.channel;
    //     const serviceId: any = row.original.serviceId;
    //     const channelColor = getChannelColor(channel);
    //     // console.log({ channel1 });
    //     const serviceColor = getServiceIdColor(serviceId);

    //     // console.log({ channel });
    //     // console.log({ serviceId });
    //     // console.log({ channel1 });

    //     return (
    //       <>
    //         <Badge variant="secondary" className={`${channelColor}`}>
    //           {channel}
    //         </Badge>{" "}
    //         /{" "}
    //         <Badge variant="secondary" className={`${serviceColor}`}>
    //           {serviceId}
    //         </Badge>
    //       </>
    //     );
    //   },
    // },
  ];
}
