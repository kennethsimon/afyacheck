"use client";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

export const DotChart: React.FC<ChartProps> = ({ data, className }) => (
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
