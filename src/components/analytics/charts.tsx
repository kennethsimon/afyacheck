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
    { ageRange: "Children (0-12)", count: Number(children) || 0, color: "hsl(var(--chart-1))" },
    { ageRange: "Teenagers (13-19)", count: Number(teenagers) || 0, color: "hsl(var(--chart-2))" },
    { ageRange: "Adults (20-60)", count: Number(adults) || 0, color: "hsl(var(--chart-3))" },
    { ageRange: "Seniors (60+)", count: Number(seniors) || 0, color: "hsl(var(--chart-4))" },
  ].filter(item => item.count > 0); // Only show age groups with data

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
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
      {ageDistributionData.length > 0 && (
        <div className="flex flex-col">
          <BarChart
            data={ageDistributionData}
            xKey="ageRange"
            yKey="count"
            color="hsl(var(--chart-1))"
            title="Age Distribution"
            description={
              "Breakdown of patients by age groups: Children (0-12), Teenagers (13-19), Adults (20-60), and Seniors (60+)"
            }
          />
        </div>
      )}
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

      {/* Clinical Findings - HIV Testing */}
      {analyticsData.hivTested !== undefined && analyticsData.hivTested > 0 && (
        <div className="flex flex-col">
          <NewPieChart
            name="HIV Tests"
            data={{
              positive: Number(analyticsData.hivPositive) || 0,
              negative: Number(analyticsData.hivNegative) || 0,
            }}
            title="HIV Testing Results"
            description="Distribution of HIV test results"
            totalCount={Number(analyticsData.hivTested) || 0}
            chartConfig={{
              positive: { label: "Positive", color: "hsl(0, 70%, 50%)" },
              negative: { label: "Negative", color: "hsl(120, 70%, 50%)" },
            }}
          />
        </div>
      )}

      {/* Specialty Referrals */}
      {(analyticsData.physioAbnormal || analyticsData.dentalAbnormal || analyticsData.ophthalmologyAbnormal || analyticsData.orthoAbnormal) && (
        <div className="flex flex-col">
          <BarChart
            data={[
              { specialty: "Physiotherapy", abnormal: Number(analyticsData.physioAbnormal) || 0 },
              { specialty: "Dental", abnormal: Number(analyticsData.dentalAbnormal) || 0 },
              { specialty: "Ophthalmology", abnormal: Number(analyticsData.ophthalmologyAbnormal) || 0 },
              { specialty: "Orthopedic", abnormal: Number(analyticsData.orthoAbnormal) || 0 },
            ].filter(item => item.abnormal > 0)}
            xKey="specialty"
            yKey="abnormal"
            color="hsl(var(--chart-2))"
            title="Abnormal Findings by Specialty"
            description="Number of patients with abnormal findings requiring specialty referral"
          />
        </div>
      )}

      {/* Radiology Findings */}
      {(analyticsData.echoAbnormal || analyticsData.ecgAbnormal || analyticsData.xrayAbnormal || analyticsData.ultrasoundAbnormal) && (
        <div className="flex flex-col">
          <BarChart
            data={[
              { type: "ECG", abnormal: Number(analyticsData.ecgAbnormal) || 0 },
              { type: "Echo", abnormal: Number(analyticsData.echoAbnormal) || 0 },
              { type: "X-Ray", abnormal: Number(analyticsData.xrayAbnormal) || 0 },
              { type: "Ultrasound", abnormal: Number(analyticsData.ultrasoundAbnormal) || 0 },
            ].filter(item => item.abnormal > 0)}
            xKey="type"
            yKey="abnormal"
            color="hsl(var(--chart-3))"
            title="Abnormal Radiology Findings"
            description="Number of patients with abnormal radiology test results"
          />
        </div>
      )}

      {/* Cancer Screening Breakdown */}
      {(analyticsData.breastCancerScreened || analyticsData.cervicalCancerScreened || analyticsData.prostateCancerScreened) && (
        <div className="flex flex-col">
          <BarChart
            data={[
              { type: "Breast Cancer", screened: Number(analyticsData.breastCancerScreened) || 0 },
              { type: "Cervical Cancer", screened: Number(analyticsData.cervicalCancerScreened) || 0 },
              { type: "Prostate Cancer", screened: Number(analyticsData.prostateCancerScreened) || 0 },
            ].filter(item => item.screened > 0)}
            xKey="type"
            yKey="screened"
            color="hsl(var(--chart-4))"
            title="Cancer Screening by Type"
            description="Number of patients screened for different types of cancer"
          />
        </div>
      )}

      {/* TB Screening Results */}
      {analyticsData.tbPositive !== undefined && (analyticsData.tbPositive > 0 || (analyticsData.tbNegative !== undefined && analyticsData.tbNegative > 0)) && (
        <div className="flex flex-col">
          <NewPieChart
            name="TB Tests"
            data={{
              positive: Number(analyticsData.tbPositive) || 0,
              negative: Number(analyticsData.tbNegative || 0) || 0,
            }}
            title="TB Screening Results"
            description="Distribution of TB screening test results"
            totalCount={(Number(analyticsData.tbPositive) || 0) + (Number(analyticsData.tbNegative || 0) || 0)}
            chartConfig={{
              positive: { label: "Positive", color: "hsl(30, 70%, 50%)" },
              negative: { label: "Negative", color: "hsl(200, 70%, 50%)" },
            }}
          />
        </div>
      )}

      {/* Health Interventions Summary */}
      {(analyticsData.preventiveMeasures || analyticsData.bloodDonation) && (
        <div className="flex flex-col md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Health Interventions & Preventive Care</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsData.preventiveMeasures !== undefined && analyticsData.preventiveMeasures > 0 && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {analyticsData.preventiveMeasures.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Preventive Measures</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {attended > 0 ? ((analyticsData.preventiveMeasures / attended) * 100).toFixed(1) : 0}% of patients
                  </div>
                </div>
              )}
              {analyticsData.bloodDonation !== undefined && analyticsData.bloodDonation > 0 && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {analyticsData.bloodDonation.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Blood Donations</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {attended > 0 ? ((analyticsData.bloodDonation / attended) * 100).toFixed(1) : 0}% of patients
                  </div>
                </div>
              )}
              {analyticsData.hivTested !== undefined && analyticsData.hivTested > 0 && (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analyticsData.hivTested.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">HIV Tests</div>
                  {analyticsData.hivPositive !== undefined && analyticsData.hivPositive > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                      {analyticsData.hivPositive} Positive ({attended > 0 ? ((analyticsData.hivPositive / attended) * 100).toFixed(2) : 0}%)
                    </div>
                  )}
                </div>
              )}
              {analyticsData.cancerScreened !== undefined && analyticsData.cancerScreened > 0 && (
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-950 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    {analyticsData.cancerScreened.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Cancer Screened</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {attended > 0 ? ((analyticsData.cancerScreened / attended) * 100).toFixed(1) : 0}% of patients
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
