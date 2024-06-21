import AddPatientForm from "@/components/form/patient-form";

export default function AddPatientPage({
  params,
}: {
  params: { campId: string };
}) {
  return <AddPatientForm />;
}
