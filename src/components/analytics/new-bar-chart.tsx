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
          <RechartsBarChart
            width={300}
            height={300}
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <YAxis
              dataKey={xKey}
              type="category"
              tickLine={false}
              tickMargin={20}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey={yKey} type="number" hide />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend />
            <Bar dataKey={yKey} fill={color} radius={8}>
              <LabelList
                dataKey={xKey}
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey={yKey}
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </RechartsBarChart>
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
