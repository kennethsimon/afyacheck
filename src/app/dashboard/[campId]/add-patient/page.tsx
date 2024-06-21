import { AddPatientForm } from "@/components/form/patient-form";
import Image from "next/image";

export default function AddPatientPage({
  params,
}: {
  params: { campId: string };
}) {
  return (
    <div className=" mx-auto p-8 ">
      <div className="text-center">
        <Image
          src="/favicon.ico"
          alt="AfyaCheck Logo"
          className="mx-auto mb-4"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold">PATIENT SCREENING FORM</h1>
        <AddPatientForm />
      </div>
    </div>
  );
}
