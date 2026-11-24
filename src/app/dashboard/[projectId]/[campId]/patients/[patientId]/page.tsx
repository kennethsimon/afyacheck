"use client";

import { PatientProfileView } from "@/components/workspaces/patient-profile-view";

export default function LegacyDashboardPatientDetailPage({
  params,
}: {
  params: { patientId: string };
}) {
  return <PatientProfileView patientId={params.patientId} />;
}
