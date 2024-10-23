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
  StethoscopeIcon,
  FilePlusIcon,
  ClipboardListIcon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function DashboardSidebar({
  session,
  permissions,
  sidestate
}: {
  session: any;
  permissions: any;
  sidestate?: any
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
    userPermissions: Array<{ name: string; active: boolean }>
  ) {
    let items = [
      {
        href: `/dashboard/${projectId}/${campId}`,
        icon: <HomeIcon />,
        label: "Dashboard",
      },
    ];

    if (isAdmin(userRoles) && hasPermission(userPermissions, "Edit patient info step")) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-patient`,
        icon: <UserIcon />,
        label: "Add Patient",
      });
    }

    if (
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit screening questions step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-screening`,
        icon: <FilePlusIcon />,
        label: "Add Screening",
      });
    }

    if (
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit clinical findings step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/add-clinical`,
        icon: <StethoscopeIcon />,
        label: "Clinical Findings",
      });
    }

    if (
      isAdmin(userRoles) &&
      hasPermission(userPermissions, "Edit doctor comments step")
    ) {
      items.push({
        href: `/dashboard/${projectId}/${campId}/doctorscomments`,
        icon: <ClipboardListIcon />,
        label: "Doctors Comments",
      });
    }

    if (isAdmin2(userRoles)) {
      items.push(
        {
          href: `/dashboard/${projectId}/${campId}/patients`,
          icon: <StethoscopeIcon />,
          label: "Patients",
        },
        {
          href: `/dashboard/${projectId}/${campId}/diagnosis`,
          icon: <StethoscopeIcon />,
          label: "Diagnosis",
        },
        {
          href: `/dashboard/${projectId}/${campId}/analytics`,
          icon: <BarChartIcon />,
          label: "Analytics",
        },
        {
          href: `/dashboard/${projectId}/${campId}/users`,
          icon: <Users />,
          label: "Users",
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
        }
      );
    }

    console.log("Sidebar items: ", items);
    return items;
  }

  return (
    <div className={`${sidestate} border-r bg-muted/40 lg:block`}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link
            href="#"
            className="flex items-center gap-2 font-semibold"
            prefetch={false}
          >
            <Image
              src="/logo.png"
              alt="AfyaCheck Logo"
              className="mx-auto mb-4"
              width={200}
              height={100}
            />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {getSidebarItems(
              projectId,
              campId,
              permissions.roles,
              permissions.permissions
            ).map((item) => (
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
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}