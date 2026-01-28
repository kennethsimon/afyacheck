// components/analytics/new-pie-chart.tsx
"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

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
      <CardContent className="flex-1 pb-0 px-2">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[350px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value, entry: any) => {
                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : '0';
                return `${value}: ${entry.payload.value.toLocaleString()} (${percentage}%)`;
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={120}
              strokeWidth={3}
              paddingAngle={2}
            >
              <LabelList 
                dataKey="value" 
                position="outside" 
                formatter={(value: number) => {
                  const total = chartData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
                  return `${value} (${percentage}%)`;
                }}
                className="fill-foreground text-sm font-medium"
              />
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 28}
                          className="fill-muted-foreground text-sm"
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
          </ResponsiveContainer>
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
