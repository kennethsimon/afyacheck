import Homepage from "@/components/home";
import PatientsTable from "@/components/patients-page";
import { getPatients } from "../../../../../services/projects";

export default async function PatientsPage({ params }: any) {
  const patients = [
    {
      id: "3",
      name: "Bob Williams",
      email: "bob@example.com",
      type: "Sale",
      status: {
        label: "Fulfilled",
        variant: "secondary",
      },
      date: "2023-07-01",
      amount: "$200.00",
    },
    {
      id: "4",
      name: "Charlie Brown",
      email: "charlie@example.com",
      type: "Purchase",
      status: {
        label: "Pending",
        variant: "primary",
      },
      date: "2023-07-02",
      amount: "$150.00",
    },
    {
      id: "5",
      name: "David Johnson",
      email: "david@example.com",
      type: "Sale",
      status: {
        label: "Cancelled",
        variant: "danger",
      },
      amount: "$100.00",
    },
    {
      id: "6",
      name: "Emily Davis",
      email: "emily@example.com",
      type: "Sale",
      status: {
        label: "Fulfilled",
        variant: "secondary",
      },
      date: "2023-07-04",
      amount: "$250.00",
    },
    {
      id: "7",
      name: "Frank Miller",
      email: "frank@example.com",
      type: "Purchase",
      status: {
        label: "Pending",
        variant: "primary",
      },
      date: "2023-07-05",
      amount: "$300.00",
    },
    {
      id: "8",
      name: "Grace Lee",
      email: "grace@example.com",
      type: "Sale",
      status: {
        label: "Cancelled",
        variant: "danger",
      },
      date: "2023-07-06",
      amount: "$100.00",
    },
  ];
  const { items } = await getPatients({ campId: params?.campId });
  return (
    <div>
      <PatientsTable patientsdata={items} patients={patients} />;
    </div>
  );
}
