"use client";

import {
  SettingsIcon,
  BarChartIcon,
  StethoscopeIcon,
  Users,
  Activity,
  Heart,
  ClipboardCheck,
  UserPlus,
  FileText,
  HeartPulse,
  UserCog,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardSidebar({
  session,
  permissions,
  sidestate,
  projectConfig
}: {
  session: any;
  permissions: any;
  sidestate?: any;
  projectConfig?: any;
}) {
  const pathname = usePathname();
  const params = useParams();
  const campId = params.campId as string;
  const projectId = params.projectId as string;

  function isAdmin(roles: any): boolean {
    return (
      Array.isArray(roles) &&
      roles.some(
        (role: { name: string; active: boolean }) =>
        (role.name === "Admin" && role.active || role.name === "User" && role.active)
      )
    );
  }

  function isAdmin2(roles: any): boolean {
    return (
      Array.isArray(roles) &&
      roles.some(
        (role: { name: string; active: boolean }) =>
        (role.name === "Admin" && role.active)
      )
    );
  }

  function hasPermission(permissions: any, permissionName: string): boolean {
    console.log(permissions);
    console.log(permissionName);
    return (
      Array.isArray(permissions) &&
      permissions.some(
        (permission: { name: string; active: boolean }) =>
          permission.name === permissionName && permission.active
      )
    );
  }

  function getSidebarItems(
    projectId: string,
    campId: string,
    userRoles: Array<{ name: string; active: boolean }>,
    userPermissions: Array<{ name: string; active: boolean }>,
    projectConfig?: any
  ) {
    // Debug: Log the project config to see what we're receiving
    if (projectConfig) {
      console.log("Sidebar - Project config:", projectConfig);
      console.log("Sidebar - Form config:", projectConfig.formConfig);
      console.log("Sidebar - enableScreening:", projectConfig.formConfig?.enableScreening);
      console.log("Sidebar - enableClinicalFindings:", projectConfig.formConfig?.enableClinicalFindings);
      console.log("Sidebar - enableDoctorComments:", projectConfig.formConfig?.enableDoctorComments);
    } else {
      console.log("Sidebar - No project config found, using defaults");
    }
    let items = [
      {
        href: `/dashboard/${projectId}/${campId}`,
        icon: <Activity className="w-5 h-5" />,
        label: "Dashboard",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950",
      },
    ];

    if (isAdmin(userRoles) && hasPermission(userPermissions, "Edit patient info step")) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-patient`,
        icon: <UserPlus className="w-5 h-5" />,
        label: "Add Patient",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950",
      });
    }

    // Check if screening is enabled in project config
    // If config doesn't exist, default to true (show). If config exists, only show if explicitly true
    const enableScreening = projectConfig?.formConfig?.enableScreening !== false;
    if (
      enableScreening &&
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit screening questions step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-screening`,
        icon: <FileText className="w-5 h-5" />,
        label: "Add Screening",
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-950",
      });
    }

    // Check if clinical findings is enabled in project config
    // If config doesn't exist, default to true (show). If config exists, only show if explicitly true
    const enableClinicalFindings = projectConfig?.formConfig?.enableClinicalFindings !== false;
    if (
      enableClinicalFindings &&
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit clinical findings step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-clinical`,
        icon: <StethoscopeIcon className="w-5 h-5" />,
        label: "Clinical Findings",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950",
      });
    }

    // Check if doctor comments is enabled in project config
    // If config doesn't exist, default to true (show). If config exists, only show if explicitly true
    const enableDoctorComments = projectConfig?.formConfig?.enableDoctorComments !== false;
    if (
      enableDoctorComments &&
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit doctor comments step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/doctorscomments`,
        icon: <ClipboardCheck className="w-5 h-5" />,
        label: "Doctor Comments",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950",
      });
    }

    if (isAdmin2(userRoles)) {
      items.push(
        {
          href: `/dashboard/${projectId}/${campId}/patients`,
          icon: <HeartPulse className="w-5 h-5" />,
          label: "Patients",
          color: "text-pink-600 dark:text-pink-400",
          bgColor: "bg-pink-50 dark:bg-pink-950",
        },
        {
          href: `/dashboard/${projectId}/${campId}/diagnosis`,
          icon: <StethoscopeIcon className="w-5 h-5" />,
          label: "Diagnosis",
          color: "text-indigo-600 dark:text-indigo-400",
          bgColor: "bg-indigo-50 dark:bg-indigo-950",
        },
        {
          href: `/dashboard/${projectId}/${campId}/analytics`,
          icon: <BarChartIcon className="w-5 h-5" />,
          label: "Analytics",
          color: "text-cyan-600 dark:text-cyan-400",
          bgColor: "bg-cyan-50 dark:bg-cyan-950",
        },
        {
          href: `/dashboard/${projectId}/${campId}/users`,
          icon: <Users className="w-5 h-5" />,
          label: "Users",
          color: "text-teal-600 dark:text-teal-400",
          bgColor: "bg-teal-50 dark:bg-teal-950",
        },
        {
          href: `/dashboard/${projectId}/${campId}/add-user`,
          icon: <UserCog className="w-5 h-5" />,
          label: "Add User",
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950",
        },
        {
          href: `/dashboard/${projectId}/${campId}/settings`,
          icon: <SettingsIcon className="w-5 h-5" />,
          label: "Settings",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-950",
        }
      );
    }

    console.log("Sidebar items: ", items);
    return items;
  }

  const sidebarItems = getSidebarItems(
    projectId,
    campId,
    permissions.roles,
    permissions.permissions,
    projectConfig
  );

  return (
    <div className={cn(
      `${sidestate} border-r bg-white dark:bg-gray-900 lg:block`,
      "shadow-sm",
      "sticky top-0 h-screen overflow-y-auto",
      "w-[220px] flex-shrink-0"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
          <Link
            href="/project"
            className="flex items-center gap-3 font-semibold w-full"
            prefetch={false}
          >
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                AfyaCheck
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Health Platform</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-3 gap-1">
            {/* Back to Projects Link */}
            <Link
              href="/project"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group mb-2 border-b border-gray-200 dark:border-gray-800 pb-3",
                "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              prefetch={false}
            >
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <LayoutGrid className="w-5 h-5" />
              </span>
              <span className="text-sm font-medium">All Projects</span>
            </Link>
            
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group",
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm font-semibold`
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  prefetch={false}
                >
                  <span className={cn(
                    "transition-colors",
                    isActive ? item.color : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Medical Camp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}