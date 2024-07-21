import { AddForm } from "@/components/add-form";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { getCampsByProjectId } from "@/services/camps";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { AddCampForm } from "@/components/add-camp";
import { AddProjectOrCampDialog } from "@/components/add-project-camp-dialog";
import { getProjectById } from "@/services/projects";

export default async function Page({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const session: any = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const { items } = await getCampsByProjectId(projectId);
  const project = await getProjectById(projectId);
  const projectName = project?.items?.data?.project?.name;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="py-8 text-center items-center">
        Camps for project {projectName || projectId}
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

        <AddProjectOrCampDialog
          type={"Camp"}
          projectId={projectId}
          id={session?.user._id}
        />
      </div>
    </main>
  );
}
