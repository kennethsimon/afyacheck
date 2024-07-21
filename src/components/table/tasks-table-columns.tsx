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
import { cn } from "@/lib/utils";

// import { updateTask } from "../_lib/actions";
// import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types/general";
// import { DeleteTasksDialog } from "./delete-tasks-dialog"
// import { UpdateTaskSheet } from "./update-task-sheet"

export function getColumns(): ColumnDef<Order>[] {
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
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(row.original.trackingNumber)
                }
              >
                Copy Tracking Number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Customer</DropdownMenuItem>
              <DropdownMenuItem>View Transactions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="View Order" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/orders/${row.original._id}`}
            className="text-primary underline"
          >
            View Order
          </Link>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "trackingNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tracking Number" />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "dateCreated",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("dateCreated"));
        const formatted = date.toLocaleDateString();
        return <div className="font-medium">{formatted}</div>;
      },
    },
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

    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Placed By" />
      ),
      cell: ({ row }) => {
        const createdBy: any = row.getValue("createdBy");
        const name = createdBy?.name ?? "Na";
        return <div>{name}</div>;
      },
    },

    {
      accessorKey: "instructions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Instructions" />
      ),
      cell: ({ row }) => {
        const shippingAddress: any = row.getValue("shippingAddress");
        const instructions = shippingAddress?.instructions ?? "NA";
        return <div>{instructions}</div>;
      },
    },
    {
      accessorKey: "recipient_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recipient Name" />
      ),
      cell: ({ row }) => {
        const shippingAddress: any = row.getValue("shippingAddress");
        const recipient_name = shippingAddress?.recipient_name ?? "NA";
        return <div>{recipient_name}</div>;
      },
    },
  ];
}
