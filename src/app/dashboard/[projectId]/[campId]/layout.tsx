import DashboardHeader from "@/components/navigation/dashboard/header";
import DashboardSidebar from "@/components/navigation/dashboard/sidebar";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isAdmin, isUUID } from "@/lib/utils";
import { getProjects } from "@/services/projects";
import { getCampsByProjectId } from "@/services/camps";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getPermissions } from "@/services/projects";
import { redirect } from "next/navigation";
import { getProjectConfig } from "@/services/projectConfig";

export const metadata: Metadata = {
  title: "AfyaCheck",
  description: "AfyaCheck Dashboard",
};

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { projectId: string; campId: string };
}>) {
  let projectId = params?.projectId as string;
  let campId = params?.campId as string;
  console.log("projectId : ", projectId);
  console.log("campId : ", campId);
  const session: any = await getServerSession(authOptions);

  // Redirect to login if session is null or invalid
  if (!session || !session.user) {
    redirect("/login");
  }

  const permissions = await getPermissions();

  // console.log(
  //   "permissions in layout : ",
  //   JSON.stringify(permissions.items.data)
  // );

  // console.log("session : ", session);

  // Redirect logic without useEffect
  if (!isAdmin(session)) {
    if (!isUUID(projectId) || !isUUID(campId)) {
      //  error
      console.log("error, we will redirect to select project page");
    }
  }

  let projects = await getProjects();
  // get camps for the project by pass campId as all
  let camps = await getCampsByProjectId(projectId);

  console.log("projects : ", projects);
  console.log("camps : ", camps);

  const cleanedProjects = projects?.items?.data?.projects || [];
  console.log("cleanedProjects : ", cleanedProjects);
  // add a project call all as first option and it's value will be all

  let cleanedCamps = camps?.items?.camps || [];
  console.log("cleanedCamps : ", cleanedCamps);

  //  add an option to select all camps
  let cleanedCampsAll = [{ _id: "all", name: "All" }, ...cleanedCamps];
  let cleanedProjectsAll = [{ _id: "all", name: "All" }, ...cleanedProjects];
  
  // Fetch project config to check which sections are enabled
  let projectConfig: any = null;
  try {
    if (isUUID(projectId)) {
      const configData = await getProjectConfig(projectId);
      // Handle different response structures: configData.config or configData.data.config
      projectConfig = configData?.config || configData?.data?.config || null;
      console.log("Project config loaded:", projectConfig);
    }
  } catch (error) {
    console.error("Error fetching project config:", error);
  }
  
  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      <TooltipProvider>
        <DashboardSidebar
          session={session}
          permissions={{permissions: session?.user?.permissions, roles: session?.user?.roles}}
          sidestate={'hidden'}
          projectConfig={projectConfig}
        />
        <div className="flex flex-col flex-1 min-h-screen w-full lg:ml-0">
          <DashboardHeader
            projects={cleanedProjectsAll}
            camps={cleanedCampsAll}
            session={session}
            permissions={{permissions: session?.user?.permissions, roles: session?.user?.roles}}
          />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
