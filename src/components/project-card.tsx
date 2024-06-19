
"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTextAfterLastSlash } from "@/lib/utils";

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  avatarSrc: string;
  avatarFallback: string;
  updatedTime: string;
}

export default function ProjectCard({
  id,
  title,
  description,
  avatarSrc,
  avatarFallback,
  updatedTime,
}: ProjectCardProps) {
    const pathname = usePathname();
    const finalPage = getTextAfterLastSlash(pathname)

  return (
    <Link href={finalPage === "camps" ? `/dashboard/${id}` : `/project/${id}/camps`} >
      <Card className="bg-background shadow-lg rounded-lg overflow-hidden">
        <CardContent className="flex flex-col gap-4 pt-2">
          <div className="flex gap-4 items-center my-2">
            <Avatar className="mr-4">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-2 text-sm">
            Description of {description}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-accent-foreground">
            <ClockIcon className="w-4 h-4" />
            <span>{updatedTime}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
