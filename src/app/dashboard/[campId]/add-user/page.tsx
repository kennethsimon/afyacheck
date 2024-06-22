import Image from "next/image";
import { AddUserForm } from "@/components/form/add-user-form";

export default function AddUser({ params }: { params: { campId: string } }) {
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
        <h1 className="text-2xl font-bold text-center">Add User FORM</h1>
      </div>
      <AddUserForm campId={params.campId} />
    </div>
  );
}
