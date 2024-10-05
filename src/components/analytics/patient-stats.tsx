import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  User2Icon,
  Users,
  ActivityIcon,
  UsersIcon,
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
    };
  };
};
export default function PatientStats({
  UserStats: {
    stats: { attended, male, female, others },
  },
}: PatientStatsProps) {
  console.log("User Stats : ", { attended, male, female, others });
  const cardData = [
    {
      title: "People Attended",
      icon: UsersIcon,
      value: `${attended ?? 0}`,
      chunk: "dashboard-01-chunk-0",
      additionalText: "",
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
