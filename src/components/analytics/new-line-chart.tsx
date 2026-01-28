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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { isValid } from "date-fns";

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  title: string;
  description: string;
  footerTrendDescription?: string;
  footerDescription?: string;
}

export function LineChart({
  data,
  xKey,
  yKeys,
  title,
  description,
  footerTrendDescription,
  footerDescription,
}: LineChartProps) {
  const chartConfig: ChartConfig = yKeys.reduce((config, key, index) => {
    config[key] = {
      label: key,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return config;
  }, {} as ChartConfig);

  // Format dates for better display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      // If data spans more than 3 months, show month/year
      // Otherwise show day/month
      const daysDiff = data.length > 0 
        ? (new Date(data[data.length - 1][xKey]).getTime() - new Date(data[0][xKey]).getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      
      if (daysDiff > 90) {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return dateStr;
    }
  };

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return null;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((sum, item) => sum + (item[yKeys[0]] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + (item[yKeys[0]] || 0), 0) / secondHalf.length;
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    return change;
  };

  const trend = calculateTrend();
  const totalPatients = data.reduce((sum, item) => sum + (item[yKeys[0]] || 0), 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RechartsLineChart
            width={500}
            height={350}
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={formatDate}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              cursor={{ stroke: chartConfig[yKeys[0]]?.color, strokeWidth: 2 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{formatDate(payload[0].payload[xKey])}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          {chartConfig[entry.dataKey || '']?.label || entry.dataKey}: {entry.value?.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key].color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                fillOpacity={0.1}
                fill={chartConfig[key].color}
              />
            ))}
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {trend !== null && (
          <div className={`flex items-center gap-2 font-medium leading-none ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% trend
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          </div>
        )}
        {footerDescription && (
          <div className="leading-none text-muted-foreground">
            Total: {totalPatients.toLocaleString()} patients over {data.length} time periods
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
