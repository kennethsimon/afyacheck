// components/AnalyticCharts.tsx
"use client";

import React, { useMemo } from "react";
import { calculateAge } from "@/lib/utils";
import { NewPieChart } from "@/components/analytics/new-pie-chart";
import { LineChart } from "@/components/analytics/new-line-chart";
import { BarChart } from "@/components/analytics/new-bar-chart";
import { NewRadarChart } from "@/components/analytics/new-radar-chart";
import { isValid, format, parseISO, differenceInYears } from "date-fns";

interface PatientInfo {
  _id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  clinicalFindings: {
    bmi: string;
    bloodPressure: string;
    lastCheckup: string;
    heartRate: number;
    respiratoryRate: number;
  };
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

const vitalSignsConfig = {
  heartRate: {
    label: "Heart Rate",
    color: "hsl(var(--chart-1))",
  },
  respiratoryRate: {
    label: "Respiratory Rate",
    color: "hsl(var(--chart-2))",
  },
  bloodPressure: {
    label: "Blood Pressure",
    color: "hsl(var(--chart-3))",
  },
};

export default function AnalyticCharts({
  params,
  patients,
}: {
  params: any;
  patients: PatientInfo[];
}) {
  const patientsWithAge = patients?.map((patient) => {
    // console.log(patient.dateOfBirth);

    const dateOfBirth = parseISO(patient.dateOfBirth); // Assuming dateOfBirth is in ISO format
    // console.log({ dateOfBirth });

    const age = differenceInYears(new Date(), dateOfBirth);
    // console.log({ age });
    return { ...patient, age };
  });

  // console.log({ patientsWithAge });

  const patientInfo = useMemo(
    () =>
      patients.map((patient) => ({
        id: patient._id,
        age: calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        bmi: parseFloat(patient.clinicalFindings.bmi),
        bloodPressure: parseFloat(patient.clinicalFindings.bloodPressure),
        lastCheckup: new Date(patient.clinicalFindings.lastCheckup),
        heartRate: patient.clinicalFindings.heartRate,
        respiratoryRate: patient.clinicalFindings.respiratoryRate,
      })),
    [patients]
  );

  const genderDistributionData = useMemo(
    () =>
      patientInfo.reduce((acc, patient) => {
        if (!acc[patient.gender]) {
          acc[patient.gender] = 0;
        }
        acc[patient.gender]++;
        return acc;
      }, {} as { [key: string]: number }),
    [patientInfo]
  );

  const totalCount = useMemo(
    () =>
      Object.values(genderDistributionData).reduce(
        (acc, curr) => acc + curr,
        0
      ),
    [genderDistributionData]
  );

  const rangeCreatedAtFrom = params["range-createdAt-from"] as string;
  const rangeCreatedAtTo = params["range-createdAt-to"] as string;

  // Utility function to safely format dates
  const safeDateFormat = (dateInput: string | Date, dateFormat: string) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isValid(date)) {
      return format(date, dateFormat);
    }
    return "N/A"; // Placeholder for invalid or missing dates
  };

  const dateRangeDescription = useMemo(
    () =>
      `${safeDateFormat(rangeCreatedAtFrom, "MMMM d, yyyy")} - ${safeDateFormat(
        rangeCreatedAtTo,
        "MMMM d, yyyy"
      )}`,
    [rangeCreatedAtFrom, rangeCreatedAtTo]
  );

  // console.log("patientInfo", patientInfo);

  // Adjusted useMemo for vitalSignsData
  const vitalSignsData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        month: safeDateFormat(patient.lastCheckup, "MMM"),
        heartRate: patient.heartRate,
        respiratoryRate: patient.respiratoryRate,
        bloodPressure: patient.bloodPressure,
      })),
    [patientInfo]
  );

  // Age Distribution Data
  const ageDistributionData = useMemo(
    () =>
      patientInfo.reduce((acc, patient) => {
        const ageRange = `${Math.floor(patient.age / 10) * 10}-${
          Math.floor(patient.age / 10) * 10 + 9
        }`;
        if (!acc[ageRange]) {
          acc[ageRange] = 0;
        }
        acc[ageRange]++;
        return acc;
      }, {} as { [key: string]: number }),
    [patientInfo]
  );

  const ageDistributionChartData = useMemo(
    () =>
      Object.entries(ageDistributionData).map(([ageRange, count]) => ({
        ageRange,
        count,
      })),
    [ageDistributionData]
  );

  const testAgeDistributionChartData = {
    ageDistributionChartData: [
      { ageRange: "0-9", count: 5 },
      { ageRange: "10-19", count: 3 },
      { ageRange: "20-29", count: 2 },
      { ageRange: "30-39", count: 1 },
      { ageRange: "40-49", count: 1 },
      { ageRange: "50-59", count: 1 },
      { ageRange: "60-69", count: 1 },
      { ageRange: "70-79", count: 1 },
    ],
  };

  // console.log({ ageDistributionChartData });

  // BMI Distribution Data
  const bmiDistributionData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        age: patient.age,
        bmi: patient.bmi,
      })),
    [patientInfo]
  );

  // Blood Pressure Trends Data
  const bloodPressureTrendsData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        lastCheckup: safeDateFormat(patient.lastCheckup, "MMM"),
        bloodPressure: patient.bloodPressure,
      })),
    [patientInfo]
  );

  // Heart Rate vs. Respiratory Rate Data
  const heartRateVsRespiratoryRateData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        heartRate: patient.heartRate,
        respiratoryRate: patient.respiratoryRate,
      })),
    [patientInfo]
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col">
        <NewPieChart
          name="Patients"
          data={genderDistributionData}
          title="Gender Demographic Breakdown"
          description={dateRangeDescription}
          totalCount={totalCount}
          chartConfig={chartConfig}
        />
      </div>
      <div className="flex flex-col">
        <NewRadarChart
          data={vitalSignsData}
          chartConfig={vitalSignsConfig}
          title="Vital Signs Comparison"
          description={dateRangeDescription}
        />
      </div>
      <div className="flex flex-col">
        <BarChart
          data={ageDistributionChartData}
          xKey="ageRange"
          yKey="count"
          title="Age Distribution"
          description={dateRangeDescription}
        />
      </div>
      <div className="flex flex-col">
        <LineChart
          data={bmiDistributionData}
          xKey="age"
          // yKey="bmi"
          title="BMI Distribution Over Age"
          description={dateRangeDescription}
        />
      </div>
      <div className="flex flex-col">
        <LineChart
          data={bloodPressureTrendsData}
          xKey="lastCheckup"
          // yKey="bloodPressure"
          title="Blood Pressure Trends Over Time"
          description={dateRangeDescription}
        />
      </div>
    </div>
  );
}
