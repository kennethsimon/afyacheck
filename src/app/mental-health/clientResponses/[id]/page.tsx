import { redirect } from "next/navigation";

export default function LegacyClientResponseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/wellness/responses/${params.id}`);
}
