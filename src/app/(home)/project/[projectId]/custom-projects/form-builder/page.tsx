import { redirect } from "next/navigation";

export default function LegacyCustomFormBuilderPage({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/form-templates/builder?projectId=${params.projectId}`);
}
