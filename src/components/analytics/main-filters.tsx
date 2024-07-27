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

interface MainFiltersProps {
  filterFields: FilterField[];
  dateRanges?: string[];
}

export function MainFilters({ filterFields, dateRanges }: MainFiltersProps) {
  const { updateFilter, resetFilters, getFilterValue, getDateRangeValue } =
    useFilters(filterFields, dateRanges);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          aria-label="Reset filters"
          variant="ghost"
          className="h-8 px-2 lg:px-3"
          onClick={resetFilters}
        >
          Reset Filters
          <Cross2Icon className="ml-2 size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filterFields.map((field) => (
          <div key={field.value} className="space-y-2">
            <Label htmlFor={field.value}>{field.label}</Label>
            {field.type === "input" && (
              <Input
                id={field.value}
                placeholder={field.placeholder}
                onChange={(e) => updateFilter(field.value, e.target.value)}
                value={getFilterValue(field.value)}
              />
            )}
            {field.type === "select" && field.options && (
              <Select
                onValueChange={(value) => updateFilter(field.value, value)}
                value={getFilterValue(field.value)}
              >
                <SelectTrigger>
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
      {dateRanges && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dateRanges.map((dateRange) => (
            <div key={dateRange} className="space-y-2">
              <Label>
                {filterFields.find((f) => f.value === dateRange)?.label ||
                  dateRange}
              </Label>
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
          ))}
        </div>
      )}
    </div>
  );
}
