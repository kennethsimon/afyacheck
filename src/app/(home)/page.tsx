import { redirect } from "next/navigation";

export default function Page({ params }: { params: { campId: string } }) {
  redirect("/project");
}
