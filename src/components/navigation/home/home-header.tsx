"use client";
import { AddForm } from "@/components/add-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTextAfterLastSlash } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AddProjectOrCampDialog } from "@/components/add-project-camp-dialog";

export default function HomeHeader() {
  const pathname = usePathname();
  const finalPage =
    getTextAfterLastSlash(pathname) === "camps" ? "Camp" : "Project";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-semibold">{finalPage}</h1>
      </div>
      <AddProjectOrCampDialog type={finalPage} projectId="" id="" />
    </header>
  );
}
