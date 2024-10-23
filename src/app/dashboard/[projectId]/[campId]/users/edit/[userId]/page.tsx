import Image from "next/image";
import { getPermissions } from "@/services/projects";
import EditUserForm from "@/components/form/edit-user-form";

export default async function EditUser({
  params,
}: {
  params: { campId: string };
}) {
  const { items } = await getPermissions();
  return (
    <div className=" mx-auto p-8 ">
      <div className="text-start">
      <Image
          src="/logo.png"
          alt="AfyaCheck Logo"
          className="mx-auto mb-4"
          width={200}
          height={100}
        />
        <h1 className="text-2xl font-bold text-center">Edit User FORM</h1>
      </div>
      <EditUserForm permissions={items} campId={params.campId} />
    </div>
  );
}
