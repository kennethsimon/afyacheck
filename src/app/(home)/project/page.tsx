import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import ProjectCard from "@/components/project-card";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getProjects } from "../../../services/projects";
import { AddProjectOrCampDialog } from "@/components/add-project-camp-dialog";
import { Activity, Heart, Stethoscope, Users, Brain, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

export default async function Page(): Promise<React.JSX.Element> {
  const session: any = await getServerSession(authOptions);
  const { items } = await getProjects();

  if (!session) {
    redirect("/login");
  }

  const projects = items?.data?.projects || [];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Health Programs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and access your healthcare projects and medical camps
            </p>
          </div>
        </div>
      </div>

      {/* Featured Services Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Mental Health Section - Prominent Card */}
        <Link href="/mental-health/viewClientData">
          <div className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Mental Health Services
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    Access mental health client data and view questionnaire responses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-semibold text-sm sm:text-base">View Clients</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </Link>

        {/* Custom Projects Section */}
        <Link href="/project/custom-projects">
          <div className="group relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    Custom Projects
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    Create custom forms, collect responses, and analyze healthcare data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform duration-300">
                <span className="font-semibold text-sm sm:text-base">Manage Projects</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        </Link>
      </div>

      {/* Stats Section */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Medical Camps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Health Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Select a Health Program
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a project to view its medical camps and patient data
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {projects.map((project: any) => (
              <ProjectCard key={project._id || project.name} {...project} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full">
              <Stethoscope className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Health Programs Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Get started by creating your first healthcare project to organize medical camps and patient care.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Button */}
      <div className="flex justify-center py-6">
        <AddProjectOrCampDialog
          type={"Project"}
          projectId=""
          id={session?.user?._id}
        />
      </div>
    </main>
  );
}
