"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title: string;
  description: string;
  footerTrendDescription?: string;
  footerDescription?: string;
}

export interface BarChartConfig {
  xKey: string;
  yKey: string;
  color?: string;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = "hsl(var(--chart-1))", // Updated default color to use CSS variable
  title,
  description,
  footerTrendDescription,
  footerDescription,
}: BarChartProps) {
  const chartConfig: ChartConfig = {
    [xKey]: {
      label: xKey,
      icon: undefined,
      color: color,
    },
  };

  // Calculate total for percentage display
  const total = data.reduce((sum, item) => sum + (item[yKey] || 0), 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-2">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{
                left: 100,
                right: 30,
                top: 20,
                bottom: 20,
              }}
            >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              dataKey={yKey} 
              type="number" 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              dataKey={xKey}
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={70}
              tickFormatter={(value) => {
                // Shorten long labels
                if (value.length > 15) {
                  return value.substring(0, 12) + '...';
                }
                return value;
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload[xKey]}</p>
                      <p className="text-sm text-muted-foreground">
                        Count: {value.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Percentage: {percentage}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey={yKey} 
              fill={color} 
              radius={[0, 8, 8, 0]}
              barSize={50}
            >
              <LabelList
                dataKey={yKey}
                position="right"
                offset={15}
                className="fill-foreground font-semibold"
                fontSize={13}
                formatter={(value: number) => {
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${value.toLocaleString()} (${percentage}%)`;
                }}
              />
            </Bar>
          </RechartsBarChart>
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
            {footerDescription}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
