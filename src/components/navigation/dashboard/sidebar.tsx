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

export default function DashboardSidebar() {
  const pathname = usePathname();
  const campId = getCampId(pathname);

  function getSidebarItems(campId: string) {
    return [
      { href: `/dashboard/${campId}`, icon: HomeIcon, label: "Dashboard" },
      {
        href: `/dashboard/${campId}/patients`,
        icon: UserIcon,
        label: "Patients",
      },
      {
        href: `/dashboard/${campId}/add-patient`,
        icon: PlusIcon,
        label: "Add Patient",
      },
      {
        href: `/dashboard/${campId}/analytics`,
        icon: BarChartIcon,
        label: "Analytics",
      },
      {
        href: `/dashboard/${campId}/settings`,
        icon: SettingsIcon,
        label: "Settings",
      },
    ];
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
            {getSidebarItems(campId).map((item) => (
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
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
