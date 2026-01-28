"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTextAfterLastSlash } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Activity, Stethoscope, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomeHeader() {
  const pathname = usePathname();
  const finalPage =
    getTextAfterLastSlash(pathname) === "camps" ? "Medical Camps" : "Health Programs";

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

          {/* Right side - User Avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
              <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Health Platform</span>
            </div>
            <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                AC
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
