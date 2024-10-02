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
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[180px_1fr]">
      <TooltipProvider>
        <DashboardSidebar
          session={session}
          permissions={permissions.items.data}
        />
        <div className="flex flex-col">
          <DashboardHeader
            projects={cleanedProjectsAll}
            camps={cleanedCampsAll}
          />
          {children}
        </div>
      </TooltipProvider>
    </div>
  );
}
