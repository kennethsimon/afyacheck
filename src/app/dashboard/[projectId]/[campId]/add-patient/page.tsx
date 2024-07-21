import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddPatientForm } from "@/components/form/patient-form";
import { getServerSession } from "next-auth";
import Image from "next/image";

export default async function AddPatientPage({
  params,
}: {
  params: { campId: string };
}) {
  console.log("params add patient page: ", params);
  const session: any = await getServerSession(authOptions);
  // if campId is al or not a valid uuid, tell user to select camp
  if (params.campId === "all" || !params.campId) {
    return <div>Please select a camp to add a patient</div>;
  }

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