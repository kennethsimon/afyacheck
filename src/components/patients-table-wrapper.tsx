"use client";

import * as React from "react";
import { PatientsTable } from "./patients-table";
import { getPatients } from "@/services/projects";

interface PatientsTableWrapperProps {
  patientPromise: ReturnType<typeof getPatients>;
}

export function PatientsTableWrapper({
  patientPromise,
}: PatientsTableWrapperProps) {
  const result = React.use(patientPromise);
  const patients = result.data || [];
  const pageCount = result.pageCount || 0;

  return <PatientsTable patients={patients} pageCount={pageCount} />;
}

