// app/patients/page.tsx
import React from "react";
import { getDiagnosis } from "@/services/projects"; // Ensure this imports your fetching logic
import {PatientDataTable} from "./table"; // Import the Client Component for rendering

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: { campId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const foundSearchParams = searchParams || {};
  
  // Combine foundSearchParams and params
  const combinedParams: any = { ...foundSearchParams, ...params };
  delete combinedParams.sort;
  delete combinedParams.page;

  // Fetch data
  const { data } = await getDiagnosis(combinedParams);

  console.log(data)

  return (
    <div className="flex min-h-screen w-full px-2 flex-col">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:col-span-2">
        <PatientDataTable patients={data} />
      </main>
    </div>
  );
}
