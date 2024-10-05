import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  User2Icon,
  Users,
  ActivityIcon,
  UsersIcon,
  Baby,
  PersonStanding,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PatientStatsProps = {
  UserStats: {
    stats: {
      attended: number;
      male: number;
      female: number;
      others: number;
      children: number;
      teenagers: number;
      adults: number;
      seniors: number;
    };
  };
};
export default function PatientStats({
  UserStats: {
    stats: {
      attended,
      male,
      female,
      others,
      children,
      teenagers,
      adults,
      seniors,
    },
  },
}: PatientStatsProps) {
  console.log("User Stats : ", {
    attended,
    male,
    female,
    others,
    children,
    teenagers,
    adults,
    seniors,
  });
  const cardData = [
    {
      title: "People Attended",
      icon: UsersIcon,
      value: `${attended ?? 0}`,
      chunk: "dashboard-01-chunk-0",
      additionalText: "",
      iconClass: "text-green-500", // Color for People Attended
    },
    {
      title: "Males",
      icon: User2Icon,
      value: `${male ?? 0}`,
      chunk: "dashboard-01-chunk-1",
      additionalText: "",
      iconClass: "text-blue-500", // Color for Males
    },
    {
      title: "Female",
      icon: User2Icon,
      value: `${female ?? 0}`,
      chunk: "dashboard-01-chunk-2",
      additionalText: "",
      iconClass: "text-pink-500", // Color for Female
    },
    {
      title: "Others",
      icon: User2Icon,
      value: `${others ?? 0}`,
      chunk: "dashboard-01-chunk-3",
      additionalText: "",
      iconClass: "text-purple-500", // Color for Others
    },
    {
      title: "Children (0-12)",
      icon: Baby,
      value: `${children ?? 0}`,
      chunk: "dashboard-01-chunk-4",
      additionalText: "",
    },
    {
      title: "Teenagers (13-19)",
      icon: PersonStanding,
      value: `${teenagers ?? 0}`,
      chunk: "dashboard-01-chunk-5",
      additionalText: "",
    },
    {
      title: "Adults (20-60)",
      icon: PersonStanding,
      value: `${adults ?? 0}`,
      chunk: "dashboard-01-chunk-6",
      additionalText: "",
    },
    {
      title: "Seniors (60+)",
      icon: PersonStanding,
      value: `${seniors ?? 0}`,
      chunk: "dashboard-01-chunk-7",
      additionalText: "",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {cardData.map((card) => (
        <Card x-chunk={card.chunk} key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon
              className={`h-4 w-4  ${
                card.iconClass ?? "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.additionalText}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
