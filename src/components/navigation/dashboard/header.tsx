"use client";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  CircleUser,
  SearchIcon,
  Stethoscope,
  Activity,
  Menu,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 shadow-sm px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Back to Projects Button */}
        <Link href="/project">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 border border-gray-200 dark:border-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Back to Projects</span>
            <span className="sm:hidden text-sm font-medium">Projects</span>
          </Button>
        </Link>

        {/* Project and Camp Switchers */}
        <div className="flex-1 flex items-center gap-3">
          {projects && projects.length > 0 && (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Program</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[150px]">
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
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                    <Stethoscope className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Camp</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[150px]">
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
                </>
              )}
            </>
          )}

          {/* Search */}
          <div className="hidden lg:flex flex-grow max-w-[400px] ml-4">
            <form className="w-full">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search patients, records..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 pl-10 focus:bg-white dark:focus:bg-gray-950"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 border-2 border-blue-200 dark:border-blue-800">
                  <AvatarImage src={session?.user?.image} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CircleUser className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Stethoscope className="mr-2 h-4 w-4" />
                Medical Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/project">
                <DropdownMenuItem>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Back to Projects
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                    redirect: true,
                  })
                }
                className="text-red-600 dark:text-red-400"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
