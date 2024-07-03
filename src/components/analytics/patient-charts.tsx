"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { calculateAge } from "@/lib/utils";
import { ChartProps } from "@/types/general";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DotChart } from "@/components/charts/dot-chart";
interface PatientInfo {
  _id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  clinicalFindings: {
    bmi: string;
    bloodPressure: string;
  };
}

interface ChartsComponentProps {
  patients: PatientInfo[];
}

const ChartsComponent: React.FC<ChartsComponentProps> = ({ patients }) => {
  const patientInfo = patients.map((patient) => ({
    id: patient._id,
    age: calculateAge(patient.dateOfBirth),
    gender: patient.gender,
    bmi: parseFloat(patient.clinicalFindings.bmi),
    bloodPressure: parseFloat(patient.clinicalFindings.bloodPressure),
  }));

  const ageDistributionData = patientInfo.reduce((acc, patient) => {
    const ageRange = `${Math.floor(patient.age / 10) * 10}-${
      Math.floor(patient.age / 10) * 10 + 9
    }`;
    if (!acc[ageRange]) {
      acc[ageRange] = 0;
    }
    acc[ageRange]++;
    return acc;
  }, {} as { [key: string]: number });

  const ageDistributionChartData = Object.entries(ageDistributionData).map(
    ([ageRange, count]) => ({
      ageRange,
      count,
    })
  );

  const genderDistributionData = patientInfo.reduce((acc, patient) => {
    if (!acc[patient.gender]) {
      acc[patient.gender] = 0;
    }
    acc[patient.gender]++;
    return acc;
  }, {} as { [key: string]: number });

  const genderDistributionChartData = Object.entries(
    genderDistributionData
  ).map(([gender, count]: [string, number]) => ({
    id: gender as string,
    value: count,
  }));

  const healthMetricsData = patientInfo.map((patient) => ({
    id: patient.id,
    data: [{ x: patient.bmi, y: patient.bloodPressure }],
  }));

  return (
    <div className="grid min-h-screen w-full grid-cols-1 gap-6 bg-background p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Demographic Breakdown</CardTitle>
          <CardDescription>
            Distribution of patients across different demographic groups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart
            data={genderDistributionChartData}
            className="aspect-square"
          />
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>
            Age distribution of patients, showing the number of patients within
            different age ranges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={ageDistributionChartData} className="aspect-[4/3]" />
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Health Metrics Correlation</CardTitle>
          <CardDescription>
            Explores the relationships between different health metrics, such as
            the correlation between BMI and blood pressure levels among
            patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DotChart data={healthMetricsData} className="aspect-[4/3]" />
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Health Metrics Correlation</CardTitle>
          <CardDescription>
            Explores the relationships between different health metrics, such as
            the correlation between BMI and blood pressure levels among
            patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DotChart data={healthMetricsData} className="aspect-[4/3]" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsComponent;
