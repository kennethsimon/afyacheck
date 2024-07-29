// hooks/useFilters.ts
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface FilterField {
  label?: string;
  value: string;
  type: "input" | "select" | "date" | string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string | { from: Date; to: Date };
}

export function useFilters(filterFields: FilterField[], dateRanges?: string[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRangeStates, setDateRangeStates] = useState<{
    [key: string]: { from: Date; to: Date };
  }>({});

  const createQueryString = useCallback(
    (params: { [key: string]: string }) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateFilter = useCallback(
    (key: string, value: string | { from: Date; to: Date }) => {
      if (typeof value === "string") {
        const newQueryString = createQueryString({ [key]: value });
        router.push(`?${newQueryString}`);
      } else {
        const from = value.from.toISOString().split("T")[0];
        const to = value.to.toISOString().split("T")[0];
        const newQueryString = createQueryString({
          [`${key}-from`]: from,
          [`${key}-to`]: to,
        });
        router.push(`?${newQueryString}`);
        setDateRangeStates((prev) => ({ ...prev, [key]: value }));
      }
    },
    [createQueryString, router]
  );

  const resetFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  // Initialize filters with default values or from URL
  useEffect(() => {
    filterFields.forEach((field) => {
      if (field.defaultValue) {
        const currentValue = searchParams.get(field.value);
        if (!currentValue) {
          updateFilter(field.value, field.defaultValue as string);
        }
      }
    });

    dateRanges?.forEach((range) => {
      const fromParam = searchParams.get(`${range}-from`);
      const toParam = searchParams.get(`${range}-to`);
      if (!fromParam || !toParam) {
        const defaultDateRange = filterFields.find((f) => f.value === range)
          ?.defaultValue as { from: Date; to: Date } | undefined;
        if (defaultDateRange) {
          updateFilter(range, defaultDateRange);
        }
      } else {
        setDateRangeStates((prev) => ({
          ...prev,
          [range]: { from: new Date(fromParam), to: new Date(toParam) },
        }));
      }
    });
  }, [filterFields, dateRanges, searchParams, updateFilter]);

  return {
    updateFilter,
    resetFilters,
    dateRangeStates,
    getFilterValue: (key: string) => searchParams.get(key) || "",
    getDateRangeValue: (key: string) => dateRangeStates[key],
  };
}
