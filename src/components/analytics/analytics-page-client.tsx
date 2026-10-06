"use client";

import { DownloadReportButton } from "./download-report-button";

interface AnalyticsPageClientProps {
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

export function AnalyticsPageClient({
  projectName,
  campName,
  stats,
  analytics,
}: AnalyticsPageClientProps) {
  return (
    <DownloadReportButton
      projectName={projectName}
      campName={campName}
      stats={stats}
      analytics={analytics}
    />
  );
}
