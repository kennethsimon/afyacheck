"use client";

import { PatientRegistrationView } from "@/components/workspaces/patient-registration-view";

export default function LegacyDashboardAddPatientPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <PatientRegistrationView
      defaultCampId={params.campId !== "all" ? params.campId : undefined}
    />
  );
}
