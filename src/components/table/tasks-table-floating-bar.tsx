import * as React from "react";
// import { tasks, type Order } from "@/db/schema"
import {
  ArrowUpIcon,
  CheckCircledIcon,
  Cross2Icon,
  DownloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { SelectTrigger } from "@radix-ui/react-select";
import { type Table } from "@tanstack/react-table";

// import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/kbd";

// import { deleteTasks, updateTasks } from "../_lib/client-actions";
import { Order } from "@/types/general";
import { genders } from "@/data/options";

interface TasksTableFloatingBarProps {
  table: Table<Order>;
}

export function TasksTableFloatingBar({ table }: TasksTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const [isPending, startTransition] = React.useTransition();

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 w-full px-4">
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-2 shadow-2xl">
          <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
            <span className="whitespace-nowrap text-xs">
              {rows.length} selected
            </span>
            <Separator orientation="vertical" className="ml-2 mr-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 hover:border"
                  onClick={() => table.toggleAllRowsSelected(false)}
                >
                  <Cross2Icon
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex items-center border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p className="mr-2">Clear selection</p>
                <Kbd abbrTitle="Escape" variant="outline">
                  Esc
                </Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex items-center gap-1.5">
            <Select
              onValueChange={(value: Order["status"]) => {
                // startTransition(() => {
                //   updateTasks({
                //     rows,
                //     status: value,
                //     onSuccess: () => table.toggleAllRowsSelected(false),
                //   });
                // });
              }}
            >
              <Tooltip>
                <SelectTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                      disabled={isPending}
                    >
                      <CheckCircledIcon className="size-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update status</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {genders.map((gender) => (
                    <SelectItem
                      key={gender.value}
                      value={gender.value}
                      className="capitalize"
                    >
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* <Select
            // onValueChange={(value: Order["priority"]) => {
            // startTransition(() => {
            //   updateTasks({
            //     rows,
            //     priority: value,
            //     onSuccess: () => table.toggleAllRowsSelected(false),
            //   });
            // });
            // }}
            >
              <Tooltip>
                <SelectTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                      disabled={isPending}
                    >
                      <ArrowUpIcon className="size-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                </SelectTrigger>
                <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Update priority</p>
                </TooltipContent>
              </Tooltip>
              <SelectContent align="center">
                <SelectGroup>
                  {tasks.priority.enumValues.map((priority) => (
                    <SelectItem
                      key={priority}
                      value={priority}
                      className="capitalize"
                    >
                      {priority}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select> */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  // onClick={() => {
                  //   startTransition(() => {
                  //     exportTableToCSV(table, {
                  //       excludeColumns: ["select", "actions"],
                  //       onlySelected: true,
                  //     });
                  //   });
                  // }}
                  disabled={isPending}
                >
                  <DownloadIcon className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Export tasks</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                  onClick={() => {
                    // startTransition(() => {
                    //   deleteTasks({
                    //     rows,
                    //     onSuccess: () => table.toggleAllRowsSelected(false),
                    //   });
                    // });
                  }}
                  disabled={isPending}
                >
                  <TrashIcon className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className=" border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                <p>Delete tasks</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
