import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "lucide-react";

type GenericCardProps = {
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
};

export default function DashboardCard({
  title,
  icon: IconComponent,
  content,
}: GenericCardProps) {
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <IconComponent className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>{content}</CardContent>
  </Card>;
}
