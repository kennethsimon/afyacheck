// components/MainFilters.tsx
"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { FilterField, useFilters } from "@/lib/hooks/use-filters";
import { Calendar } from "lucide-react";

interface MainFiltersProps {
  filterFields: FilterField[];
  dateRanges?: string[];
}

export function MainFilters({ filterFields, dateRanges }: MainFiltersProps) {
  const { updateFilter, resetFilters, getFilterValue, getDateRangeValue } =
    useFilters(filterFields, dateRanges);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Filter patient records by date range
          </span>
        </div>
        <Button
          aria-label="Reset filters"
          variant="outline"
          size="sm"
          className="h-8 px-3"
          onClick={resetFilters}
        >
          <Cross2Icon className="mr-2 size-4" aria-hidden="true" />
          Reset
        </Button>
      </div>
      
      {filterFields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filterFields.map((field) => (
            <div key={field.value} className="space-y-2">
              <Label htmlFor={field.value} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </Label>
              {field.type === "input" && (
                <Input
                  id={field.value}
                  placeholder={field.placeholder}
                  onChange={(e) => updateFilter(field.value, e.target.value)}
                  value={getFilterValue(field.value)}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500"
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  onValueChange={(value) => updateFilter(field.value, value)}
                  value={getFilterValue(field.value)}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}
      
      {dateRanges && dateRanges.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {dateRanges.map((dateRange) => {
              const field = filterFields.find((f) => f.value === dateRange);
              return (
                <div key={dateRange} className="space-y-2">
                  {field && (
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </Label>
                  )}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md">
                    <CalendarDatePicker
                      date={
                        getDateRangeValue(dateRange) || {
                          from: new Date(),
                          to: new Date(),
                        }
                      }
                      onDateSelect={(range) => updateFilter(dateRange, range)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
