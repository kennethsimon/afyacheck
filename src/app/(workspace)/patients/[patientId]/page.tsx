"use client";

import { PatientProfileView } from "@/components/workspaces/patient-profile-view";

export default function PatientDetailPage({
  params,
}: {
  params: { patientId: string };
}) {
  return <PatientProfileView patientId={params.patientId} />;
}
