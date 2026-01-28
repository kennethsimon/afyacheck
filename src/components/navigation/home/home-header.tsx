"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTextAfterLastSlash } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Activity, Stethoscope, Heart, LogOut, User, CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomeHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const finalPage =
    getTextAfterLastSlash(pathname) === "camps" ? "Medical Camps" : "Health Programs";

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "AC";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/project" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/AFYACHECK-transformed.png"
                  alt="AfyaCheck"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  AfyaCheck
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Health Management</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
              {pathname.includes("camps") ? (
                <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {finalPage}
              </h2>
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
              <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Health Platform</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarImage src={session?.user?.image || "/placeholder-user.jpg"} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email || session?.user?.username || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/project" className="cursor-pointer">
                    <CircleUser className="mr-2 h-4 w-4" />
                    Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                      redirect: true,
                    })
                  }
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
