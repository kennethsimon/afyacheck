"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MainFilters } from "@/components/analytics/main-filters";
import { FloatingFilterButton } from "@/components/analytics/floating-filter-button";
import { FilterField } from "@/lib/hooks/use-filters";
import { useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface FiltersDrawerProps {
  filterFields: FilterField[];
  dateRanges?: string[];
}

export function FiltersDrawer({ filterFields, dateRanges }: FiltersDrawerProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    
    // Count date range filters
    if (dateRanges) {
      dateRanges.forEach((range) => {
        const from = searchParams.get(`${range}-from`);
        const to = searchParams.get(`${range}-to`);
        if (from && to) {
          count++;
        }
      });
    }
    
    // Count other filters
    filterFields.forEach((field) => {
      if (field.type !== "date") {
        const value = searchParams.get(field.value);
        if (value) {
          count++;
        }
      }
    });
    
    setActiveFiltersCount(count);
  }, [searchParams, filterFields, dateRanges]);

  return (
    <>
      <FloatingFilterButton
        onClick={() => setOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-semibold">
                  Filters
                </DrawerTitle>
                <DrawerDescription>
                  Filter patient records by date range and other criteria
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 py-6">
            <MainFilters filterFields={filterFields} dateRanges={dateRanges} />
          </div>
          <DrawerFooter className="border-t">
            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              Apply Filters
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

