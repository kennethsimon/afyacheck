"use client";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  CircleUser,
  HomeIcon,
  Package2Icon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react"; // Import useState for managing drawer state
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Switcher } from "@/components/navigation/dashboard/account-switcher";
import DashboardSidebar from "@/components/navigation/dashboard/sidebar"; // Import the Sidebar component

interface DashboardHeaderProps {
  projects: { name: string; icon?: React.ReactNode; _id: string }[];
  camps: { name: string; icon?: React.ReactNode; _id: string }[];
  session: any;
  permissions: any
}

export default function DashboardHeader(props: DashboardHeaderProps) {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { projects, camps, session, permissions } = props;

  const [isDrawerOpen, setDrawerOpen] = useState(false); // State to control the drawer

  return (
    <>
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden" // Only show on mobile
          onClick={() => setDrawerOpen(true)} // Open the drawer on click
        >
          <Package2Icon className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>

        <div className="w-full flex gap-4">
          {projects && projects.length > 0 && (
            <>
              <div className="flex flex-col gap-2">
                <Switcher
                  isCollapsed={false}
                  items={projects.map((project) => ({
                    name: project.name,
                    icon: project.icon,
                    _id: project._id,
                  }))}
                  queryName="projectId"
                />
              </div>
              {projectId !== "all" && camps && camps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Switcher
                    isCollapsed={false}
                    items={camps.map((camp) => ({
                      name: camp.name,
                      icon: camp.icon,
                      _id: camp._id,
                    }))}
                    queryName="campId"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex-grow flex-col gap-2 max-w-[400px]">
            <form>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="w-full bg-background shadow-none appearance-none pl-8"
                />
              </div>
            </form>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border w-8 h-8"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                signOut({
                  callbackUrl: "https://afya-check.smarcrib.site/login",
                  redirect: true,
                })
              }
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
          <BellIcon className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </header>

      {/* Sidebar Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="bg-black opacity-50" onClick={() => setDrawerOpen(false)}></div>
          <div className="fixed left-0 top-0 z-50 w-[80%] max-w-[300px] h-full bg-white shadow-lg">
            <DashboardSidebar sidestate={''} session={session} permissions={permissions} />
            <Button onClick={() => setDrawerOpen(false)} className="absolute top-2 right-2">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
