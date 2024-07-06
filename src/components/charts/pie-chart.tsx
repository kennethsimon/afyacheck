"use client";
import { ResponsivePie } from "@nivo/pie";
import { ChartProps } from "@/types/general";

export const PieChart: React.FC<ChartProps> = ({ data, className }) => (
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
