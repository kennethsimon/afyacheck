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
  // Clinical findings stats
  hivTested?: number;
  hivPositive?: number;
  hivNegative?: number;
  tbPositive?: number;
  tbNegative?: number;
  cancerScreened?: number;
  breastCancerScreened?: number;
  cervicalCancerScreened?: number;
  prostateCancerScreened?: number;
  preventiveMeasures?: number;
  bloodDonation?: number;
  physioAbnormal?: number;
  dentalAbnormal?: number;
  ophthalmologyAbnormal?: number;
  orthoAbnormal?: number;
  echoAbnormal?: number;
  ecgAbnormal?: number;
  xrayAbnormal?: number;
  ultrasoundAbnormal?: number;
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
  // Safe defaults for all values
  if (!analyticsData) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const {
    male = 0,
    female = 0,
    children = 0,
    teenagers = 0,
    adults = 0,
    seniors = 0,
    withInsurance = 0,
    withoutInsurance = 0,
    newPatientsOverTime = [],
    attended = 0,
  } = analyticsData;

  const genderDistributionData = {
    male: Number(male) || 0,
    female: Number(female) || 0,
    others: Math.max(0, (Number(attended) || 0) - (Number(male) || 0) - (Number(female) || 0)),
  };

  const ageDistributionData = [
    { ageRange: "Children (0-12)", count: Number(children) || 0 },
    { ageRange: "Teenagers (13-19)", count: Number(teenagers) || 0 },
    { ageRange: "Adults (20-60)", count: Number(adults) || 0 },
    { ageRange: "Seniors (60+)", count: Number(seniors) || 0 },
  ];

  const insuranceDistributionData = {
    withInsurance: Number(withInsurance) || 0,
    withoutInsurance: Number(withoutInsurance) || 0,
  };

  // Validate newPatientsOverTime is an array
  const safeNewPatientsOverTime = Array.isArray(newPatientsOverTime) 
    ? newPatientsOverTime.filter(item => item && item.date && typeof item.count === 'number')
    : [];

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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col">
        <NewPieChart
          name="Patients"
          data={genderDistributionData}
          title="Gender Demographic Breakdown"
          description={"Breakdown of patients by Gender"}
          totalCount={analyticsData.attended}
          chartConfig={chartConfig}
        />
      </div>
      <div className="flex flex-col">
        <NewPieChart
          name="Insurance"
          data={insuranceDistributionData}
          title="Patients with Insurance vs. Without Insurance"
          description={
            "patient with no insure name  provided vs patient with insurance name provided"
          }
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
          description={
            "Breakdown of patients by Age Range such as Children, Teenagers, Adults, and Seniors"
          }
        />
      </div>
      {safeNewPatientsOverTime.length > 0 && (
        <div className="flex flex-col">
          <LineChart
            data={safeNewPatientsOverTime}
            xKey="date"
            yKeys={["count"]}
            key="count"
            title="New Patients Over Time"
            description={`Number of new patients over time`}
          />
        </div>
      )}

      {/* Clinical Findings Stats */}
      {(analyticsData.hivTested || analyticsData.tbPositive || analyticsData.cancerScreened) && (
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Clinical Findings Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsData.hivTested !== undefined && (
                <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analyticsData.hivTested}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">HIV Tested</div>
                  {analyticsData.hivPositive !== undefined && (
                    <div className="text-xs text-red-700 dark:text-red-300 mt-1">{analyticsData.hivPositive} Positive</div>
                  )}
                </div>
              )}
              {analyticsData.tbPositive !== undefined && (
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analyticsData.tbPositive}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">TB Positive</div>
                </div>
              )}
              {analyticsData.cancerScreened !== undefined && (
                <div className="text-center p-3 bg-pink-50 dark:bg-pink-950 rounded">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{analyticsData.cancerScreened}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cancer Screened</div>
                </div>
              )}
              {analyticsData.preventiveMeasures !== undefined && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analyticsData.preventiveMeasures}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Preventive Measures</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
