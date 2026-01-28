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
      
      // Find all chart cards - look for Card components containing charts
      const allCards = Array.from(document.querySelectorAll('[class*="Card"]'));
      
      for (const card of allCards) {
        // Check if this card contains a chart (has SVG or recharts elements)
        const hasChart = card.querySelector('svg') || 
                        card.querySelector('[class*="recharts"]') || 
                        card.querySelector('[data-chart]') ||
                        card.querySelector('canvas');
        
        if (hasChart) {
          try {
            // Get chart title from CardTitle or h3
            const titleElement = card.querySelector('[class*="CardTitle"], h3, h2');
            const title = titleElement?.textContent?.trim() || 'Chart';

            // Wait a bit for charts to render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the entire card as image
            const canvas = await html2canvas(card as HTMLElement, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true,
              windowWidth: card.scrollWidth,
              windowHeight: card.scrollHeight,
            });

            const imageData = canvas.toDataURL('image/png');
            chartImages.push({
              title,
              imageData,
              width: canvas.width,
              height: canvas.height,
            });
          } catch (error) {
            console.warn(`Failed to capture chart "${card.textContent?.substring(0, 30)}":`, error);
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
