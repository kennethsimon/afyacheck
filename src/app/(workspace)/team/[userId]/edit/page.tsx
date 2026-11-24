"use client";

import { UserFormView } from "@/components/workspaces/user-form-view";

export default function EditTeamMemberPage({
  params,
}: {
  params: { userId: string };
}) {
  return <UserFormView userId={params.userId} />;
}
