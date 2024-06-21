import { AddForm } from "@/components/add-form";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { getCamps } from "../../../../../../services/camps";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { AddCampForm } from "@/components/add-camp";
import { AddProjectOrCampDialog } from "@/components/add-project-camp-dialog";

export default async function Page({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const session = await getServerSession(authOptions);
  const { items } = await getCamps({projectId});
  console.log(items)

  if (!session) {
    redirect("/login");
  } 

  const projects = [
    {
      id: 0,
      title: "Camp A",
      description: "A brief description of Camp A.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PA",
      updatedTime: "Updated 3 days ago",
    },
    {
      id: 2,
      title: "Camp B",
      description: "A brief description of Camp B.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PB",
      updatedTime: "Updated 1 week ago",
    },
    {
      id: 3,
      title: "Camp C",
      description: "A brief description of Camp C.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PC",
      updatedTime: "Updated 2 weeks ago",
    },
    {
      id: 4,
      title: "Camp D",
      description: "A brief description of Camp D.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PD",
      updatedTime: "Updated 1 month ago",
    },
    {
      id: 5,
      title: "Camp E",
      description: "A brief description of Camp E.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PE",
      updatedTime: "Updated 2 months ago",
    },
    {
      id: 6,
      title: "Camp F",
      description: "A brief description of Camp F.",
      avatarSrc: "/placeholder-user.jpg",
      avatarFallback: "PF",
      updatedTime: "Updated 3 months ago",
    },
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="py-8 text-center items-center">
        Camps for project {projectId}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items?.camps.map((camp: any) => (
          <ProjectCard key={camp.name} {...camp} />
        ))}
      </div>
      <div className="text-center item-center py-12">
        <Link href={"/project"} className="mr-6">
          <Button
            variant="ghost"
            className="bg-primary  text-primary-foreground"
          >
            Change Project
          </Button>
        </Link>

        <AddProjectOrCampDialog type={"Camp"} />
      </div>
    </main>
  );
}
