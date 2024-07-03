"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
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

export default function PatientFilters({
  isAnalyticsPage,
}: {
  isAnalyticsPage: boolean;
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

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const updateUrlParams = useCallback(
    (name: string, value: string) => {
      const updatedQueryString = createQueryString(name, value);
      router.push(`${pathname}?${updatedQueryString}`);
    },
    [createQueryString, pathname, router]
  );

  // Handle changes in the input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUrlParams(e.target.id, e.target.value);
  };

  // Handle changes in the select fields
  const handleSelectChange = (id: string, value: string) => {
    updateUrlParams(id, value);
  };

  // Handle changes in the date range fields
  const handleDateRangeChange = (
    id: string,
    dateRange: { from: Date; to: Date }
  ) => {
    const from = dateRange.from.toISOString().split("T")[0];
    const to = dateRange.to.toISOString().split("T")[0];
    updateUrlParams(`${id}-from`, from);
    updateUrlParams(`${id}-to`, to);
  };

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Demographic Insights</h2>
          <p className="text-muted-foreground">
            Filter and explore patient demographics.
          </p>
        </div>
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
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="active">Active</Label>
            <Select
              onValueChange={(value) => handleSelectChange("active", value)}
            >
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="created-range">Created Range</Label>
            <CalendarDatePicker
              date={createdAtDateRange}
              onDateSelect={(dateRange) => {
                setCreatedAtDateRange(dateRange);
                handleDateRangeChange("created-range", dateRange);
              }}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="birth-date-range">Birth Date Range </Label>
            <CalendarDatePicker
              date={birthDateDateRange}
              onDateSelect={(dateRange) => {
                setBirthDateDateRange(dateRange);
                handleDateRangeChange("birth-date-range", dateRange);
              }}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="gender">Gender</Label>
            <Select
              onValueChange={(value) => handleSelectChange("gender", value)}
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
            />
          </div>
          {!isAnalyticsPage && (
            <>
              <div className="grid gap-1">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("sort-by", value)
                  }
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
      </div>
    </div>
  );
}
