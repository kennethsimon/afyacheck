"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { getTextAfterLastSlash } from "@/lib/utils";
import moment from "moment";

interface ProjectCardProps {
  _id: string;
  name: string;
  description: string;
  avatarSrc: any;
  avatarFallback: any;
  updatedAt: any;
}

export default function ProjectCard({
  _id,
  name,
  description,
  avatarSrc,
  avatarFallback,
  updatedAt,
}: ProjectCardProps) {
  const pathname = usePathname();
  const finalPage = getTextAfterLastSlash(pathname);
  const params = useParams();

  // console.log("finalPage : ", finalPage);
  // console.log("pathname : ", pathname);

  const projectId = pathname.split("/")[2];

  return (
    <Link
      href={
        finalPage === "camps"
          ? `/dashboard/${projectId}/${_id}`
          : `/project/${_id}/camps`
      }
    >
      <Card className="bg-background shadow-lg rounded-lg overflow-hidden">
        <CardContent className="flex flex-col gap-4 pt-2">
          <div className="flex gap-4 items-center my-2">
            <Avatar className="mr-4">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-medium">{name}</h3>
          </div>
          <p className="text-muted-foreground mb-2 text-sm">
            Description of {description}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-accent-foreground">
            <ClockIcon className="w-4 h-4" />
            <span>{moment(updatedAt).format("DD/MM/YYY")}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
