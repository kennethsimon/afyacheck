"use client";
import { AddForm } from "@/components/add-form";
import AwesomeDrawer from "@/components/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTextAfterLastSlash } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function HomeHeader() {
  const pathname = usePathname();
  const finalPage = getTextAfterLastSlash(pathname);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-semibold">
          {finalPage === "camps" ? "Camps" : "Projects"}
        </h1>
      </div>
      <AwesomeDrawer
        openTrigger={
          <Button>Add {finalPage === "camps" ? "Camp" : "Project"}</Button>
        }
        title="Add Project"
        bodyText="form here"
        isForm={true}
      >
        <AddForm />
      </AwesomeDrawer>
    </header>
  );
}