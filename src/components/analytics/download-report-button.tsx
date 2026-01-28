"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateAnalyticsReport } from "@/lib/report-generator";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface DownloadReportButtonProps {
  projectName?: string;
  campName?: string;
  stats: {
    attended: number;
    male: number;
    female: number;
    others: number;
    children: number;
    teenagers: number;
    adults: number;
    seniors: number;
    newPatientsToday: number;
    newPatientsThisWeek: number;
    newPatientsThisMonth: number;
    newPatientsThisYear: number;
    prevNewPatientsToday?: number;
    prevNewPatientsThisWeek?: number;
    prevNewPatientsThisMonth?: number;
    prevNewPatientsThisYear?: number;
  };
  analytics: {
    attended: number;
    male: number;
    female: number;
    children: number;
    teenagers: number;
    adults: number;
    seniors: number;
    withInsurance: number;
    withoutInsurance: number;
    newPatientsOverTime: { date: string; count: number }[];
    hivTested?: number;
    hivPositive?: number;
    hivNegative?: number;
    tbPositive?: number;
    tbNegative?: number;
    cancerScreened?: number;
    breastCancerScreened?: number;
    cervicalCancerScreened?: number;
    prostateCancerScreened?: number;
    preventiveMeasures?: number;
    bloodDonation?: number;
    physioAbnormal?: number;
    dentalAbnormal?: number;
    ophthalmologyAbnormal?: number;
    orthoAbnormal?: number;
    echoAbnormal?: number;
    ecgAbnormal?: number;
    xrayAbnormal?: number;
    ultrasoundAbnormal?: number;
  };
}

export function DownloadReportButton({
  projectName,
  campName,
  stats,
  analytics,
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      toast.info("Capturing charts...", {
        description: "Please wait while we capture chart images.",
      });

      // Capture all chart elements from the page
      const chartImages: Array<{ title: string; imageData: string; width: number; height: number }> = [];
      
      // Find all chart cards
      const chartCards = document.querySelectorAll('[data-chart]');
      const chartContainers = document.querySelectorAll('.flex.flex-col');
      
      // Try to find charts by their Card components
      const allCharts = Array.from(document.querySelectorAll('div')).filter((el) => {
        const card = el.closest('[class*="Card"]') || el.querySelector('[class*="Card"]');
        const hasChart = el.querySelector('svg') || el.querySelector('canvas') || el.querySelector('[class*="recharts"]');
        return card && hasChart;
      });

      // Capture each chart
      for (let i = 0; i < allCharts.length; i++) {
        const chartElement = allCharts[i];
        const card = chartElement.closest('[class*="Card"]') || chartElement.querySelector('[class*="Card"]');
        
        if (card) {
          try {
            // Get chart title
            const titleElement = card.querySelector('h3, [class*="CardTitle"], [class*="title"]');
            const title = titleElement?.textContent?.trim() || `Chart ${i + 1}`;

            // Capture the chart as image
            const canvas = await html2canvas(card as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false,
              useCORS: true,
            });

            const imageData = canvas.toDataURL('image/png');
            chartImages.push({
              title,
              imageData,
              width: canvas.width,
              height: canvas.height,
            });
          } catch (error) {
            console.warn(`Failed to capture chart ${i + 1}:`, error);
          }
        }
      }

      // If no charts found, try alternative method - find by ChartContainer
      if (chartImages.length === 0) {
        const chartContainers = document.querySelectorAll('[data-chart]');
        for (let i = 0; i < chartContainers.length; i++) {
          const container = chartContainers[i];
          const parentCard = container.closest('[class*="Card"]');
          
          if (parentCard) {
            try {
              const titleElement = parentCard.querySelector('h3, [class*="CardTitle"]');
              const title = titleElement?.textContent?.trim() || `Chart ${i + 1}`;

              const canvas = await html2canvas(parentCard as HTMLElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
              });

              const imageData = canvas.toDataURL('image/png');
              chartImages.push({
                title,
                imageData,
                width: canvas.width,
                height: canvas.height,
              });
            } catch (error) {
              console.warn(`Failed to capture chart container ${i + 1}:`, error);
            }
          }
        }
      }

      toast.info("Generating report...", {
        description: `Including ${chartImages.length} charts in the report.`,
      });

      await generateAnalyticsReport({
        projectName,
        campName,
        generatedAt: new Date(),
        stats,
        analytics,
        chartImages: chartImages.length > 0 ? chartImages : undefined,
      });

      toast.success("Report downloaded successfully!", {
        description: `Your analytics report with ${chartImages.length} charts has been saved.`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report", {
        description: "An error occurred while generating the report. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className="gap-2"
      variant="default"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download Report
        </>
      )}
    </Button>
  );
}
