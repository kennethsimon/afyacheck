// components/analytics/new-pie-chart.tsx
"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Tooltip, Legend, LabelList } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface NewPieChartProps {
  name: string;
  data: { [key: string]: number };
  title: string;
  description: string;
  totalCount: number;
  chartConfig: ChartConfig;
  footerTrendDescription?: string;
  footerDescription?: string;
}

export function NewPieChart({
  name,
  data,
  title,
  description,
  footerTrendDescription,
  footerDescription,
  totalCount,
  chartConfig,
}: NewPieChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
    fill: chartConfig[key]?.color || "hsl(var(--chart-1))",
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <LabelList dataKey="value" position="outside" />
              {/* <Label
                content={({ value, percent }) => {
                  return `${value} (${(percent * 100).toFixed(0)}%)`;
                }}
              /> */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {name}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {footerTrendDescription && (
          <div className="flex items-center gap-2 font-medium leading-none">
            {footerTrendDescription}
            <TrendingUp className="h-4 w-4" />
          </div>
        )}

        {footerDescription && (
          <div className="leading-none text-muted-foreground">
            {description}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
