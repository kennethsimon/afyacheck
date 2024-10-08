"use client";
import { File, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { IconUser } from "./ui/icons";
import { usePathname, useParams } from "next/navigation";

type PatientsTableProps = {
  patients: any;
  patientsData: any;
};

function PatientRow({ patient }: { patient: any }) {
  const pathname = usePathname();
  const params = useParams();
  const campId = params.campId as string;
  const projectId = params.projectId as string;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{patient.name}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {patient.phoneNumber}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {patient.dateOfBirth}
      </TableCell>
      {/* <TableCell className="hidden sm:table-cell">
        <Badge className="text-xs" variant="outline">
          {patient.status.label}
        </Badge>
      </TableCell> */}
      <TableCell className="hidden md:table-cell">{patient.address}</TableCell>
      <TableCell className="hidden md:table-cell">{patient.location}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Link
          href={`/dashboard/${projectId}/${campId}/patients/${patient._id}`}
        >
          <Button variant="outline" size="icon" className="">
            <IconUser className="h-4 w-4" />
            <span className="sr-only">View Patient Details</span>
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default function PatientsTable({
  patients,
  patientsData,
}: PatientsTableProps) {
  console.log(patientsData);
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Tabs defaultValue="week">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-sm"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Fulfilled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </Button>
          </div>
        </div>
        <TabsContent value="week">
          <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader className="px-7">
              <CardTitle>Patients</CardTitle>
              <CardDescription>
                {/* Recent Patients from your store. */}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name/phone</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Date of birth
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsData?.patients?.map((patient: any) => (
                    <PatientRow key={patient._id} patient={patient} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
