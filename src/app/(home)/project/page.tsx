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
  const session = await getServerSession(authOptions);
  const { items } = await getProjects();
  const projects = [
    {
      id: 100,
      title: "Project A",
      description: "A brief description of Project A.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PA",
      updatedTime: "Updated 3 days ago",
    },
    {
      id: 0,
      title: "Project B",
      description: "A brief description of Project B.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PB",
      updatedTime: "Updated 1 week ago",
    },
    {
      id: 1,
      title: "Project C",
      description: "A brief description of Project C.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PC",
      updatedTime: "Updated 2 weeks ago",
    },
    {
      id: 2,
      title: "Project D",
      description: "A brief description of Project D.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PD",
      updatedTime: "Updated 1 month ago",
    },
    {
      id: 3,
      title: "Project E",
      description: "A brief description of Project E.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PE",
      updatedTime: "Updated 2 months ago",
    },
    {
      id: 4,
      title: "Project F",
      description: "A brief description of Project F.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PF",
      updatedTime: "Updated 3 months ago",
    },
  ];

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

        <AddProjectOrCampDialog type={"Project"} projectId="" />

      </div>
    </main>
  );
}
