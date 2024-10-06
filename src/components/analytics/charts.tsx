// components/AnalyticCharts.tsx
"use client";

import React from "react";
import { NewPieChart } from "@/components/analytics/new-pie-chart";
import { LineChart } from "@/components/analytics/new-line-chart";
import { BarChart } from "@/components/analytics/new-bar-chart";
import { isValid, format } from "date-fns";

interface AnalyticsData {
  attended: number;
  male: number;
  female: number;
  children: number;
  teenagers: number;
  adults: number;
  seniors: number;
  withInsurance: number;
  withoutInsurance: number;
  newPatientsOverTime: { date: string; count: number }[];
}

const chartConfig = {
  male: {
    label: "Male",
    color: "hsl(var(--chart-1))",
  },
  female: {
    label: "Female",
    color: "hsl(var(--chart-2))",
  },
  others: {
    label: "Other",
    color: "hsl(var(--chart-3))",
  },
};

const insuranceChartConfig = {
  withInsurance: { label: "With Insurance", color: "hsl(var(--chart-1))" },
  withoutInsurance: {
    label: "Without Insurance",
    color: "hsl(var(--chart-2))",
  },
};

export default function AnalyticCharts({
  params,
  analyticsData,
}: {
  params: any;
  analyticsData: AnalyticsData;
}) {
  const {
    male,
    female,
    children,
    teenagers,
    adults,
    seniors,
    withInsurance,
    withoutInsurance,
    newPatientsOverTime,
  } = analyticsData;

  const genderDistributionData = {
    male,
    female,
    others: analyticsData.attended - male - female,
  };

  const ageDistributionData = [
    { ageRange: "Children (0-12)", count: children },
    { ageRange: "Teenagers (13-19)", count: teenagers },
    { ageRange: "Adults (20-60)", count: adults },
    { ageRange: "Seniors (60+)", count: seniors },
  ];

  const insuranceDistributionData = {
    withInsurance,
    withoutInsurance,
  };

  const rangeCreatedAtFrom = params["range-createdAt-from"] as string;
  const rangeCreatedAtTo = params["range-createdAt-to"] as string;

  const safeDateFormat = (dateInput: string | Date, dateFormat: string) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isValid(date)) {
      return format(date, dateFormat);
    }
    return "N/A";
  };

  const dateRangeDescription = `${safeDateFormat(
    rangeCreatedAtFrom,
    "MMMM d, yyyy"
  )} - ${safeDateFormat(rangeCreatedAtTo, "MMMM d, yyyy")}`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col">
        <NewPieChart
          name="Patients"
          data={genderDistributionData}
          title="Gender Demographic Breakdown"
          description={dateRangeDescription}
          totalCount={analyticsData.attended}
          chartConfig={chartConfig}
        />
      </div>
      <div className="flex flex-col">
        <NewPieChart
          name="Insurance"
          data={insuranceDistributionData}
          title="Patients with Insurance vs. Without Insurance"
          description={dateRangeDescription}
          totalCount={withInsurance + withoutInsurance}
          chartConfig={insuranceChartConfig}
        />
      </div>
      <div className="flex flex-col">
        <BarChart
          data={ageDistributionData}
          xKey="ageRange"
          yKey="count"
          title="Age Distribution"
          description={dateRangeDescription}
        />
      </div>
      <div className="flex flex-col">
        <LineChart
          data={newPatientsOverTime}
          xKey="date"
          key="count"
          title="New Patients Over Time"
          description={dateRangeDescription}
        />
      </div>
    </div>
  );
}
