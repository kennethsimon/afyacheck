// components/charts/new-radar-chart.tsx
"use client";

import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
// Import ChartContainer

interface NewRadarChartProps {
  data: any[];
  chartConfig: ChartConfig;
  title: string;
  description: string;
  footerTrendDescription?: string;
  footerDescription?: string;
}

export function NewRadarChart({
  data,
  chartConfig,
  title,
  description,
  footerTrendDescription,
  footerDescription,
}: NewRadarChartProps) {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {/* Wrap RadarChart with ChartContainer */}
        <ChartContainer className="w-full h-96" config={chartConfig}>
          <RadarChart data={data} width={500} height={300}>
            <PolarGrid />
            <PolarAngleAxis dataKey="month" />
            <PolarRadiusAxis angle={60} />
            {Object.keys(chartConfig).map((key) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={chartConfig[key].color}
                fill={chartConfig[key].color}
                fillOpacity={0.6}
              />
            ))}
            <Tooltip />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {footerTrendDescription && (
          <div className="flex items-center gap-2 font-medium leading-none">
            {footerTrendDescription} <TrendingUp className="h-4 w-4" />
          </div>
        )}
        {footerDescription && (
          <div className="flex items-center gap-2 leading-none text-muted-foreground">
            {footerDescription}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
