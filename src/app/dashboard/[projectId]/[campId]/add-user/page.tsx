import Image from "next/image";
import { AddUserForm } from "@/components/form/add-user-form";
import { getPermissions } from "@/services/projects";

export default async function AddUser({
  params,
}: {
  params: { campId: string };
}) {
  const { items } = await getPermissions();
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
      <AddUserForm permissions={items} campId={params.campId} />
    </div>
  );
}
