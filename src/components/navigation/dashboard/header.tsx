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

interface DashboardHeaderProps {
  // { label: string; icon?: ReactNode; id: string; }[]'.
  projects: { label: string; icon?: React.ReactNode; id: string }[];
  camps: { label: string; icon?: React.ReactNode; id: string }[];
}

export default function DashboardHeader(props: DashboardHeaderProps) {
  const params = useParams();
  const projectId = params?.projectId as string;
  console.log("projectId : ", projectId);
  const { projects, camps } = props;
  // console.log("projects : ", projects);

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <Link href="#" className="lg:hidden" prefetch={false}>
        <Package2Icon className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Link>

      <div className="w-full flex gap-4">
        {projects && projects.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <Switcher
                isCollapsed={false}
                items={projects}
                queryName="projectId"
              />
            </div>
            {projectId !== "all" && camps && camps.length > 0 && (
              <div className="flex flex-col gap-2">
                <Switcher
                  isCollapsed={false}
                  items={camps}
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
            {/* <img src="/placeholder.svg" width="32" height="32" className="rounded-full" alt="Avatar" /> */}
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
            onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
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
  );
}
