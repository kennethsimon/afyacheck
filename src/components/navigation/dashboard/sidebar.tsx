"use client";

import { Button } from "@/components/ui/button";
import {
  Package2Icon,
  BellIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
  PlusIcon,
  BarChartIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function DashboardSidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const params = useParams();
  const campId = params.campId as string; // Assuming campId is available in the params
  const projectId = params.projectId as string; // Assuming projectId is available in the params

  console.log("pathname : ", pathname);
  console.log("params : ", params);
  console.log("campId : ", campId, "projectId : ", projectId);
  
  // Utility function to check if the user is an admin
  function isAdmin(session: any): boolean {
    return session.some(
      (role: { name: string; active: boolean }) =>
        role.name === "Admin" && role.active
    );
  }

  function getSidebarItems(
    projectId: string,
    campId: string,
    userRoles: Array<{ name: string; active: boolean }>
  ) {
    let items = [
      {
        href: `/dashboard/${projectId}/${campId}`,
        icon: <HomeIcon />,
        label: "Dashboard",
      },
      {
        href: `/dashboard/${projectId}/${campId}/patients`,
        icon: <UserIcon />,
        label: "Patients",
      },
      {
        href: `/dashboard/${projectId}/${campId}/diagnosis`,
        icon: <UserIcon />,
        label: "Diagnosis",
      },
      {
        href: `/dashboard/${projectId}/${campId}/add-patient`,
        icon: <PlusIcon />,
        label: "Add Patient",
      },
      {
        href: `/dashboard/${projectId}/${campId}/add-screening`, // New route for adding screening
        icon: <PlusIcon />, // You can choose a different icon if you prefer
        label: "Add Screening",
      },
      {
        href: `/dashboard/${projectId}/${campId}/add-clinical`, // New route for adding screening
        icon: <PlusIcon />, // You can choose a different icon if you prefer
        label: "Clinical Findings",
      },
      {
        href: `/dashboard/${projectId}/${campId}/doctorscomments`, // New route for adding screening
        icon: <PlusIcon />, // You can choose a different icon if you prefer
        label: "Doctors comments",
      },
    ];

    if (isAdmin(userRoles)) {
      items = [
        ...items,
        {
          href: `/dashboard/${projectId}/${campId}/analytics`,
          icon: <BarChartIcon />,
          label: "Analytics",
        },
        {
          href: `/dashboard/${projectId}/${campId}/add-user`,
          icon: <PlusIcon />,
          label: "Add User",
        },
        {
          href: `/dashboard/${projectId}/${campId}/settings`,
          icon: <SettingsIcon />,
          label: "Settings",
        },
      ];
    }

    return items;
  }

  return (
    <div className="hidden border-r bg-muted/40 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link
            href="#"
            className="flex items-center gap-2 font-semibold"
            prefetch={false}
          >
            <Package2Icon className="h-6 w-6" />
            <span className="">Clinic</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {getSidebarItems(projectId, campId, session.user.roles).map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  } hover:text-primary`}
                  prefetch={false}
                >
                  <span className="h-4 w-4">{item.icon}</span>
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
