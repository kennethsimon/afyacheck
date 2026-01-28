import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { getProjectById } from "@/services/projects";
import { getProjectConfig } from "@/services/projectConfig";
import { ProjectSettingsClient } from "@/components/project-settings-client";

export default async function ProjectSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const session: any = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const projectPromise = getProjectById(params.id);
  const configPromise = getProjectConfig(params.id);

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

