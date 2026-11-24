import { redirect } from "next/navigation";

export default function LegacyCustomFormFillPage({
  params,
}: {
  params: { schemaId: string };
}) {
  redirect(`/form-templates/forms/${params.schemaId}`);
}
