"use client";

import * as React from "react";
import { DiagnosisTable } from "./diagnosis-table";
import { getDiagnosis } from "@/services/projects";

interface DiagnosisTableWrapperProps {
  diagnosisPromise: ReturnType<typeof getDiagnosis>;
}

export function DiagnosisTableWrapper({
  diagnosisPromise,
}: DiagnosisTableWrapperProps) {
  const result = React.use(diagnosisPromise);
  const diagnoses = result.data || [];
  const pageCount = result.pageCount || 0;

  return <DiagnosisTable diagnoses={diagnoses} pageCount={pageCount} />;
}

