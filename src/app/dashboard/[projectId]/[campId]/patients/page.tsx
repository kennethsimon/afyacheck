import PatientFilters from "@/components/analytics/patient-filtes";
import { getPatients } from "../../../../../../services/projects";
import PatientsTable from "@/components/patients-page";

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: { campId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // const patients = [
  //   {
  //     id: "3",
  //     name: "Bob Williams",
  //     email: "bob@example.com",
  //     type: "Sale",
  //     status: {
  //       label: "Fulfilled",
  //       variant: "secondary",
  //     },
  //     date: "2023-07-01",
  //     amount: "$200.00",
  //   },
  //   {
  //     id: "4",
  //     name: "Charlie Brown",
  //     email: "charlie@example.com",
  //     type: "Purchase",
  //     status: {
  //       label: "Pending",
  //       variant: "primary",
  //     },
  //     date: "2023-07-02",
  //     amount: "$150.00",
  //   },
  //   {
  //     id: "5",
  //     name: "David Johnson",
  //     email: "david@example.com",
  //     type: "Sale",
  //     status: {
  //       label: "Cancelled",
  //       variant: "danger",
  //     },
  //     amount: "$100.00",
  //   },
  //   {
  //     id: "6",
  //     name: "Emily Davis",
  //     email: "emily@example.com",
  //     type: "Sale",
  //     status: {
  //       label: "Fulfilled",
  //       variant: "secondary",
  //     },
  //     date: "2023-07-04",
  //     amount: "$250.00",
  //   },
  //   {
  //     id: "7",
  //     name: "Frank Miller",
  //     email: "frank@example.com",
  //     type: "Purchase",
  //     status: {
  //       label: "Pending",
  //       variant: "primary",
  //     },
  //     date: "2023-07-05",
  //     amount: "$300.00",
  //   },
  //   {
  //     id: "8",
  //     name: "Grace Lee",
  //     email: "grace@example.com",
  //     type: "Sale",
  //     status: {
  //       label: "Cancelled",
  //       variant: "danger",
  //     },
  //     date: "2023-07-06",
  //     amount: "$100.00",
  //   },
  // ];
  const foundSearchParams = searchParams || {};

  // Combine foundSearchParams and params
  const combinedParams: any = { ...foundSearchParams, ...params };

  const { items: patients } = await getPatients(combinedParams);
  // remove project id from the params
  // delete combinedParams.projectId;
  console.log(patients);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Patients Table</h2>
        </div>
        <PatientFilters isDashboardPage={false} />
        <PatientsTable patientsData={patients} patients={patients} />;
      </main>
    </div>
  );
}
