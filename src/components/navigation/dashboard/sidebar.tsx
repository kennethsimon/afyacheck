"use client";

import { Button } from "@/components/ui/button";
import { getTextAfterLastSlash, getCampId, getPatientId } from "@/lib/utils";
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
import { usePathname } from "next/navigation";

export default function DashboardSidebar({ session }: { session: any }) {
  const pathname = usePathname();
  const campId = getCampId(pathname);

  // Utility function to check if the user is an admin
  function isAdmin(session: any): boolean {
    // console.log("Checking if user is an admin", session);
    return session.some(
      (role: { name: string; active: boolean }) =>
        role.name === "Admin" && role.active
    );
  }

  function getSidebarItems(
    campId: string,
    userRoles: Array<{ name: string; active: boolean }>
  ) {
    let items = [
      { href: `/dashboard/${campId}`, icon: <HomeIcon />, label: "Dashboard" },
      {
        href: `/dashboard/${campId}/patients`,
        icon: <UserIcon />,
        label: "Patients",
      },
      {
        href: `/dashboard/${campId}/add-patient`,
        icon: <PlusIcon />,
        label: "Add Patient",
      },
    ];

    if (isAdmin(userRoles)) {
      // console.log("User is an admin");
      items = [
        ...items,
        {
          href: `/dashboard/${campId}/analytics`,
          icon: <PlusIcon />,
          label: "Analytics",
        },
        {
          href: `/dashboard/${campId}/add-user`,
          icon: <PlusIcon />,
          label: "Add User",
        },
        {
          href: `/dashboard/${campId}/settings`,
          icon: <SettingsIcon />,
          label: "Settings",
        },
      ];
    } else {
      // console.log("User is not an admin");
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
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <BellIcon className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {getSidebarItems(campId, session.user.roles).map((item) => (
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
