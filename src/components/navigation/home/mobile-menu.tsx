"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { Icons } from "@/components/misc/icons";
import { navigationConfig } from "@/config/navigation";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/nav";
import { Sidebar } from "@/components/sidebar";
import { IconSidebar } from "@/components/ui/icons";

const { mainNav, dashboardSubHeaderNav, authNav } = navigationConfig;
export function MobileMenu() {
  const pathname = usePathname;

  let navItems: NavItem[] = mainNav;

  const currentPathname = pathname();
  if (currentPathname.startsWith("/dashboard")) {
    navItems = dashboardSubHeaderNav;
  }
  // ifpage is auth
  if (currentPathname.startsWith("/auth")) {
    navItems = authNav;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-ml-2 flex size-9 p-0 md:hidden">
          <IconSidebar className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex h-auto w-full flex-col p-0">
        <Sidebar className="flex" playlists={[]}>
          <div className="flex flex-col items-center justify-center space-y-4 px-4 py-6">
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center justify-center">
                {/* <Icons.logo className="size-6" /> */}
                <span className="ml-2 text-xl font-bold">
                  Afya Check
                </span>
              </Link>
            </div>

            {navItems.map((item: NavItem) => (
              <div className="space-y-2 px-2" key={item.title}>
                <Link
                  href={item.href || "#"}
                  className="flex items-center justify-between text-sm font-medium"
                >
                  <div className="flex items-center">
                    {/* get the string icon name and render the icon */}
                    {/* {item.icon && (
                     <item.icon className="h-6 w-6 text-gray-400" />
                   )} */}
                    <span
                      className={`ml-2 ${
                        currentPathname === item.href ||
                        item.tabs?.some((tab) => currentPathname === tab.href)
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Sidebar>
      </SheetContent>
    </Sheet>
  );
}