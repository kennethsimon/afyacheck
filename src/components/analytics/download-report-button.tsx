"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateAnalyticsReport } from "@/lib/report-generator";
import { toast } from "sonner";

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
      toast.info("Generating report...", {
        description: "Please wait while we compile your analytics report.",
      });

      await generateAnalyticsReport({
        projectName,
        campName,
        generatedAt: new Date(),
        stats,
        analytics,
      });

      toast.success("Report downloaded successfully!", {
        description: "Your analytics report has been saved to your downloads folder.",
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
