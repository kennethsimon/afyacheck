import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { getProjectById } from "@/services/projects";
import { getProjectConfig } from "@/services/projectConfig";
import { ProjectSettingsClient } from "@/components/project-settings-client";
import { isAdmin } from "@/lib/utils";

export default async function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session: any = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user is admin - only admins can access settings
  if (!isAdmin(session)) {
    redirect("/project");
  }

  const projectPromise = getProjectById(params.projectId);
  const configPromise = getProjectConfig(params.projectId);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectSettingsClient 
          projectPromise={projectPromise}
          configPromise={configPromise}
        />
      </main>
    </div>
  );
}

