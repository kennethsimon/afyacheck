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
      others?: number;
      children: number;
      teenagers: number;
      adults: number;
      seniors: number;
      newPatientsToday: number;
      newPatientsThisWeek: number;
      newPatientsThisMonth: number;
      newPatientsThisYear: number;
      prevNewPatientsToday?: number;
      prevNewPatientsThisWeek?: number;
      prevNewPatientsThisMonth?: number;
      prevNewPatientsThisYear?: number;
    };
  };
};

export default function PatientStats({
  UserStats: {
    stats: {
      attended,
      male,
      female,
      others = 0, // Default value
      children,
      teenagers,
      adults,
      seniors,
      newPatientsToday,
      newPatientsThisWeek,
      newPatientsThisMonth,
      newPatientsThisYear,
      prevNewPatientsToday = 0, // Default value
      prevNewPatientsThisWeek = 0, // Default value
      prevNewPatientsThisMonth = 0, // Default value
      prevNewPatientsThisYear = 0, // Default value
    },
  },
}: PatientStatsProps) {
  console.log("User Stats in component: ", {
    attended,
    male,
    female,
    others,
    children,
    teenagers,
    adults,
    seniors,
    newPatientsToday,
    newPatientsThisWeek,
    newPatientsThisMonth,
    newPatientsThisYear,
    prevNewPatientsToday,
    prevNewPatientsThisWeek,
    prevNewPatientsThisMonth,
    prevNewPatientsThisYear,
  });

  const calculateChange = (current: number, previous: number) => {
    if (current === 0 && previous === 0) {
      return "No change";
    }
    const change = current - previous;
    let percentageChange;

    if (previous === 0) {
      percentageChange = current === 0 ? 0 : 100; // If previous is 0, treat it as 100% increase if current is not 0
    } else {
      percentageChange = Math.round((change / previous) * 100);
    }

    const formattedPercentage = percentageChange.toFixed(0).padStart(2, "0");

    return change > 0
      ? `+${formattedPercentage}% from last month`
      : change < 0
      ? `${formattedPercentage}% from last month`
      : "No change";
  };

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
    {
      title: "New Patients Today",
      icon: User2Icon,
      value: `${newPatientsToday ?? 0}`,
      chunk: "dashboard-01-chunk-8",
      additionalText: calculateChange(newPatientsToday, prevNewPatientsToday),
    },
    {
      title: "New Patients This Week",
      icon: User2Icon,
      value: `${newPatientsThisWeek ?? 0}`,
      chunk: "dashboard-01-chunk-9",
      additionalText: calculateChange(
        newPatientsThisWeek,
        prevNewPatientsThisWeek
      ),
    },
    {
      title: "New Patients This Month",
      icon: User2Icon,
      value: `${newPatientsThisMonth ?? 0}`,
      chunk: "dashboard-01-chunk-10",
      additionalText: calculateChange(
        newPatientsThisMonth,
        prevNewPatientsThisMonth
      ),
    },
    {
      title: "New Patients This Year",
      icon: User2Icon,
      value: `${newPatientsThisYear ?? 0}`,
      chunk: "dashboard-01-chunk-11",
      additionalText: calculateChange(
        newPatientsThisYear,
        prevNewPatientsThisYear
      ),
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
