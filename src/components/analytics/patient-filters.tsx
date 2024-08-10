"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarDatePicker } from "@/components/calendar-date-picker";
import { Button } from "@/components/ui/button";

export default function PatientFilters({
  isDashboardPage,
}: {
  isDashboardPage: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [createdAtDateRange, setCreatedAtDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const [birthDateDateRange, setBirthDateDateRange] = useState({
    from: new Date(new Date().getFullYear() - 100, 0, 1),
    to: new Date(),
  });

  // Adjust createQueryString to accept an object of key-value pairs
  const createQueryString = useCallback(
    (paramsToUpdate: { [key: string]: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        params.set(key, value);
      });
      return params.toString();
    },
    [searchParams]
  );

  // Update updateUrlParams to handle an object of key-value pairs
  const updateUrlParams = useCallback(
    (paramsToUpdate: { [key: string]: string }) => {
      const updatedQueryString = createQueryString(paramsToUpdate);
      router.push(`${pathname}?${updatedQueryString}`);
    },
    [createQueryString, pathname, router]
  );

  // Handle changes in the input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUrlParams({ [e.target.id]: e.target.value });
  };

  // Handle changes in the select fields
  const handleSelectChange = (id: string, value: string) => {
    updateUrlParams({ [id]: value });
  };

  // Adjust handleDateRangeChange to use the new updateUrlParams format
  const handleDateRangeChange = (
    id: string,
    dateRange: { from: Date; to: Date }
  ) => {
    const from = dateRange.from.toISOString().split("T")[0];
    const to = dateRange.to.toISOString().split("T")[0];
    updateUrlParams({
      [`range-${id}-from`]: from,
      [`range-${id}-to`]: to,
    });
  };

  // Reset filters
  const resetFilters = () => {
    const defaultParams = {
      "range-createdAt-from": createdAtDateRange.from
        .toISOString()
        .split("T")[0],
      "range-createdAt-to": createdAtDateRange.to.toISOString().split("T")[0],
      "range-dateOfBirth-from": birthDateDateRange.from
        .toISOString()
        .split("T")[0],
      "range-dateOfBirth-to": birthDateDateRange.to.toISOString().split("T")[0],
    };
    const params = new URLSearchParams(defaultParams);
    router.push(`${pathname}?${params.toString()}`);
    // refresh page
    router.refresh();
  };

  // Initialize state from URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const createdAtFrom = params.get("range-createdAt-from");
    const createdAtTo = params.get("range-createdAt-to");
    const birthDateFrom = params.get("range-dateOfBirth-from");
    const birthDateTo = params.get("range-dateOfBirth-to");

    if (createdAtFrom && createdAtTo) {
      setCreatedAtDateRange({
        from: new Date(createdAtFrom),
        to: new Date(createdAtTo),
      });
    }

    if (birthDateFrom && birthDateTo) {
      setBirthDateDateRange({
        from: new Date(birthDateFrom),
        to: new Date(birthDateTo),
      });
    }
  }, [searchParams]);

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button className="px-4 py-2 rounded-md" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="campId">Camp ID</Label>
            <Input
              type="text"
              id="campId"
              placeholder="Camp ID"
              className="w-full sm:w-auto"
              onChange={handleInputChange}
              defaultValue={searchParams.get("campId") || ""}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="gender">Gender</Label>
            <Select
              onValueChange={(value) => handleSelectChange("gender", value)}
              defaultValue={searchParams.get("gender") || ""}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              type="text"
              id="phoneNumber"
              placeholder="Phone Number"
              className="w-full sm:w-auto"
              onChange={handleInputChange}
              defaultValue={searchParams.get("phoneNumber") || ""}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              placeholder="Location"
              className="w-full sm:w-auto"
              onChange={handleInputChange}
              defaultValue={searchParams.get("location") || ""}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="insurance">Insurance</Label>
            <Input
              type="text"
              id="insurance"
              placeholder="Insurance"
              className="w-full sm:w-auto"
              onChange={handleInputChange}
              defaultValue={searchParams.get("insurance") || ""}
            />
          </div>
          {!isDashboardPage && (
            <>
              <div className="grid gap-1">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("sort-by", value)
                  }
                  defaultValue={searchParams.get("sort-by") || ""}
                >
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="createdAt">Created At</SelectItem>
                    <SelectItem value="updatedAt">Updated At</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="order">Order</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("order", value)}
                  defaultValue={searchParams.get("order") || ""}
                >
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">Date filters</p>
          <div className="grid gap-1">
            <Label htmlFor="created-range">Created Range</Label>
            <CalendarDatePicker
              date={createdAtDateRange}
              onDateSelect={(dateRange) => {
                setCreatedAtDateRange(dateRange);
                handleDateRangeChange("createdAt", dateRange);
              }}
            />
          </div>
          {/* <div className="grid gap-1">
            <Label htmlFor="dateOfBirth-range">Birth Date Range </Label>
            <CalendarDatePicker
              date={birthDateDateRange}
              onDateSelect={(dateRange) => {
                setBirthDateDateRange(dateRange);
                handleDateRangeChange("dateOfBirth", dateRange);
              }}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
}
