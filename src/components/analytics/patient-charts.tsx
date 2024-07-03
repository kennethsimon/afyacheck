"use client"

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

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
    </div>
  );
};

interface ChartProps {
  data: any;
  className?: string;
}

const PieChart: React.FC<ChartProps> = ({ data, className }) => (
  <div className={className}>
    <ResponsivePie
      data={data}
      sortByValue
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      cornerRadius={0}
      padAngle={0}
      borderWidth={1}
      borderColor={"#ffffff"}
      enableArcLinkLabels={false}
      arcLabel={(d: { id: any }) => `${d.id}`}
      arcLabelsTextColor={"#ffffff"}
      arcLabelsRadiusOffset={0.65}
      colors={["#2563eb"]}
      theme={{
        labels: {
          text: {
            fontSize: "18px",
          },
        },
        tooltip: {
          chip: {
            borderRadius: "9999px",
          },
          container: {
            fontSize: "12px",
            textTransform: "capitalize",
            borderRadius: "6px",
          },
        },
      }}
      role="application"
    />
  </div>
);

const BarChart: React.FC<ChartProps> = ({ data, className }) => (
  <div className={className}>
    <ResponsiveBar
      data={data}
      keys={["count"]}
      indexBy="ageRange"
      margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
      padding={0.3}
      colors={["#2563eb"]}
      axisBottom={{
        tickSize: 0,
        tickPadding: 16,
      }}
      axisLeft={{
        tickSize: 0,
        tickValues: 4,
        tickPadding: 16,
      }}
      gridYValues={4}
      theme={{
        tooltip: {
          chip: {
            borderRadius: "9999px",
          },
          container: {
            fontSize: "12px",
            textTransform: "capitalize",
            borderRadius: "6px",
          },
        },
        grid: {
          line: {
            stroke: "#f3f4f6",
          },
        },
      }}
      tooltipLabel={({ id }) => `${id}`}
      enableLabel={false}
      role="application"
      ariaLabel="A bar chart showing data"
    />
  </div>
);

const DotChart: React.FC<ChartProps> = ({ data, className }) => (
  <div className={className}>
    <ResponsiveScatterPlot
      data={data}
      margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
      xScale={{ type: "linear" }}
      yScale={{ type: "linear" }}
      blendMode="multiply"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 16,
      }}
      axisLeft={{
        tickSize: 0,
        tickValues: 5,
        tickPadding: 16,
      }}
      colors={["#2563eb", "#e11d48"]}
      useMesh={true}
      gridYValues={6}
      theme={{
        tooltip: {
          chip: {
            borderRadius: "9999px",
          },
          container: {
            fontSize: "12px",
            textTransform: "capitalize",
            borderRadius: "6px",
          },
        },
        grid: {
          line: {
            stroke: "#f3f4f6",
          },
        },
      }}
      role="application"
    />
  </div>
);

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export default ChartsComponent;
