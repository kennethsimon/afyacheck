// components/charts/new-line-chart.tsx
"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
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
import { TrendingUp } from "lucide-react";
import { ChartContainer } from "../ui/chart";

interface LineChartProps {
  data: any[];
  xKey: string;
  title: string;
  description: string;
  footerTrendDescription?: string;
  footerDescription?: string;
}

export function LineChart({
  data,
  xKey,
  title,
  description,
  footerTrendDescription,
  footerDescription,
}: LineChartProps) {
  // Example of building line configuration inside the component
  // This should be adjusted based on your specific needs
  const lineConfigs = data.map((item, index) => ({
    key: `line-${index}`, // Example key, replace with your logic
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color, replace with your logic
  }));

  const chartConfig = {
    [xKey]: {
      label: xKey,
      icon: undefined,
      color: "hsl(var(--chart-1))",
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
          <RechartsLineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lineConfigs.map((lineConfig) => (
              <Line
                key={lineConfig.key}
                type="monotone"
                dataKey={lineConfig.key}
                stroke={lineConfig.color}
              />
            ))}
          </RechartsLineChart>
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
