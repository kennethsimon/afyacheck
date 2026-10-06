import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { AddScreeningForm } from "@/components/form/screening-form";
import { getServerSession } from "next-auth";
import { getProjectConfig } from "@/services/projectConfig";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AddScreeningPage({
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
    return <div>Please select a camp to add a patient</div>;
  }

  // Fetch project config to check if screening is enabled
  let projectConfig: any = null;
  try {
    const configData = await getProjectConfig(params.projectId);
    projectConfig = configData?.config || configData?.data?.config || null;
  } catch (error) {
    console.error("Error fetching project config:", error);
  }

  // Check if screening section is enabled
  const enableScreening = projectConfig?.formConfig?.enableScreening !== false;
  if (!enableScreening) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Screening Section Disabled
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The screening section has been disabled for this project. Please enable it in project settings to use this feature.
          </p>
          <Link href={`/dashboard/${params.projectId}/${params.campId}`}>
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AddScreeningForm
      campId={params.campId}
      session={session}
      patientId={patientId}
      projectId={params.projectId}
      projectConfig={projectConfig}
    />
  );
}
