import React from "react";
// import AnalyticsComponent from "@/components/AnalyticsComponent";
import { getPatientAnalyticsData } from "../../../../../services/projects";
import { PatientFilters } from "@/types/general";

// Extend the params type to include all possible filters
interface AnalyticsPageParams extends PatientFilters {
  campId: string; // Ensure campId is always required
}

export default async function AnalyticsPage({
  params,
}: {
  params: AnalyticsPageParams;
}) {
  // Directly use params as filters, assuming all keys in params match the expected filter keys
  const filters: PatientFilters = { ...params };
  console.log({ filters });

  const { items: userStats, count } = await getPatientAnalyticsData(filters);

  // Assuming `AnalyticsComponent` expects a prop named `data` with the patient data
  //   return <AnalyticsComponent data={{ userStats, count }} />;
  return null;
}

// V0 Links
// https://v0.dev/r/sE7ByzrwKiT
// https://v0.dev/r/K7ko7IZUvbp
