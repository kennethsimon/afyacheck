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
  clinicalFindings?: {
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
  console.log("Unfiltered Patients:", patients);

  const filteredPatients = patients.filter((patient) => {
    const { dateOfBirth, gender, clinicalFindings } = patient;
    if (!clinicalFindings) {
      console.log("Patient excluded due to missing clinicalFindings:", patient);
      return false;
    }

    const { bmi, bloodPressure, lastCheckup, heartRate, respiratoryRate } =
      clinicalFindings;
    const isValidDateOfBirth = isValid(parseISO(dateOfBirth));
    const isValidLastCheckup = lastCheckup
      ? isValid(parseISO(lastCheckup))
      : false;

    if (!isValidDateOfBirth) {
      console.log("Patient excluded due to invalid dateOfBirth:", patient);
    }
    if (!gender) {
      console.log("Patient excluded due to missing gender:", patient);
    }
    if (!bmi) {
      console.log("Patient excluded due to missing bmi:", patient);
    }
    if (!bloodPressure) {
      console.log("Patient excluded due to missing bloodPressure:", patient);
    }
    if (!lastCheckup) {
      console.log("Patient excluded due to missing lastCheckup:", patient);
    }
    if (!isValidLastCheckup) {
      console.log("Patient excluded due to invalid lastCheckup:", patient);
    }
    if (heartRate === undefined) {
      console.log("Patient excluded due to missing heartRate:", patient);
    }
    if (respiratoryRate === undefined) {
      console.log("Patient excluded due to missing respiratoryRate:", patient);
    }

    return (
      isValidDateOfBirth &&
      gender &&
      bmi &&
      bloodPressure &&
      lastCheckup &&
      isValidLastCheckup &&
      heartRate !== undefined &&
      respiratoryRate !== undefined
    );
  });

  console.log("Filtered Patients:", filteredPatients);
  const patientInfo = useMemo(
    () =>
      filteredPatients.map((patient) => ({
        id: patient._id,
        age: calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        bmi: parseFloat(patient.clinicalFindings!.bmi),
        bloodPressure: parseFloat(patient.clinicalFindings!.bloodPressure),
        lastCheckup: new Date(patient.clinicalFindings!.lastCheckup),
        heartRate: patient.clinicalFindings!.heartRate,
        respiratoryRate: patient.clinicalFindings!.respiratoryRate,
      })),
    [filteredPatients]
  );

  console.log("Patient Info:", patientInfo);

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

  console.log("Gender Distribution Data:", genderDistributionData);

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

  const safeDateFormat = (dateInput: string | Date, dateFormat: string) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isValid(date)) {
      return format(date, dateFormat);
    }
    return "N/A";
  };

  const dateRangeDescription = useMemo(
    () =>
      `${safeDateFormat(rangeCreatedAtFrom, "MMMM d, yyyy")} - ${safeDateFormat(
        rangeCreatedAtTo,
        "MMMM d, yyyy"
      )}`,
    [rangeCreatedAtFrom, rangeCreatedAtTo]
  );

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

  console.log("Vital Signs Data:", vitalSignsData);

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

  console.log("Age Distribution Data:", ageDistributionData);

  const ageDistributionChartData = useMemo(
    () =>
      Object.entries(ageDistributionData).map(([ageRange, count]) => ({
        ageRange,
        count,
      })),
    [ageDistributionData]
  );

  console.log("Age Distribution Chart Data:", ageDistributionChartData);

  const bmiDistributionData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        age: patient.age,
        bmi: patient.bmi,
      })),
    [patientInfo]
  );

  console.log("BMI Distribution Data:", bmiDistributionData);

  const bloodPressureTrendsData = useMemo(
    () =>
      patientInfo.map((patient) => ({
        lastCheckup: safeDateFormat(patient.lastCheckup, "MMM"),
        bloodPressure: patient.bloodPressure,
      })),
    [patientInfo]
  );

  console.log("Blood Pressure Trends Data:", bloodPressureTrendsData);

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
          title="BMI Distribution Over Age"
          description={dateRangeDescription}
        />
      </div>
      <div className="flex flex-col">
        <LineChart
          data={bloodPressureTrendsData}
          xKey="lastCheckup"
          title="Blood Pressure Trends Over Time"
          description={dateRangeDescription}
        />
      </div>
    </div>
  );
}
