import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddPatientForm } from "@/components/form/patient-form";
import { getServerSession } from "next-auth";
import Image from "next/image";

export default async function AddPatientPage({
  params,
}: {
  params: { campId: string };
}) {
  const session: any = await getServerSession(authOptions);
  return (
    <div className=" mx-auto p-8 ">
      <div className="text-start">
        <Image
          src="/favicon.ico"
          alt="AfyaCheck Logo"
          className="mx-auto mb-4"
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold text-center">
          PATIENT SCREENING FORM
        </h1>
        <AddPatientForm campId={params.campId} session={session} />
      </div>
    </div>
  );
}
