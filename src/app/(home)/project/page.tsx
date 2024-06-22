import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddForm } from "@/components/add-form";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { getProjects } from "../../../../services/projects";
import { AddProjectOrCampDialog } from "@/components/add-project-camp-dialog";

export default async function Page() {
  const session: any = await getServerSession(authOptions);
  const { items } = await getProjects();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="py-8 text-center items-center">
        Select a Project to view it&lsquo;s Camps
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items?.data?.projects?.map((project: any) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
      <div className="text-center item-center py-12">
        <AddProjectOrCampDialog
          type={"Project"}
          projectId=""
          id={session?.user?._id}
        />
      </div>
    </main>
  );
}
