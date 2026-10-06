import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddPatientForm } from "@/components/form/patient-form";
import { getServerSession } from "next-auth";
import { UserPlus, FileEdit, Stethoscope, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProjectConfig } from "@/services/projectConfig";

export default async function AddPatientPage({
  params,
  searchParams,
}: {
  params: { campId: string; projectId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const foundSearchParams = searchParams || {};
  let patientId = foundSearchParams["patientId"] as string;

  console.log("params add patient page: ", params);
  const session: any = await getServerSession(authOptions);
  // if campId is al or not a valid uuid, tell user to select camp
  if (params.campId === "all" || !params.campId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-md">
          <Stethoscope className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Select a Medical Camp
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select a medical camp to add a patient record.
          </p>
          <Link href={`/dashboard/${params.projectId}/${params.campId}`}>
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isEditMode = !!patientId;

  // Fetch project config for custom fields
  let projectConfig: any = null;
  try {
    const configData = await getProjectConfig(params.projectId);
    projectConfig = configData?.config || configData?.data?.config || null;
  } catch (error) {
    console.error("Error fetching project config:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-green-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/${params.projectId}/${params.campId}`}>
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl">
              {isEditMode ? (
                <FileEdit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? "Update Patient Record" : "New Patient Registration"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEditMode 
                  ? "Update patient information and medical details"
                  : "Register a new patient for medical screening and care"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <AddPatientForm
              campId={params.campId}
              session={session}
              patientId={patientId}
              projectId={params.projectId}
              projectConfig={projectConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
