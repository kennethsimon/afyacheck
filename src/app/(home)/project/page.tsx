import { redirect } from "next/navigation";

export default function LegacyProjectIndexPage() {
  redirect("/projects");
}
