"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PatientDetailsDialog } from "./patient-details-dialog";
import { format, parseISO, differenceInYears } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface PatientsTableProps {
  patients: any[];
  pageCount: number;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function getGenderBadge(gender: string) {
  if (!gender) return <span className="text-gray-400">—</span>;
  
  const genderLower = gender.toLowerCase();
  if (genderLower === "male") {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Male</Badge>;
  } else if (genderLower === "female") {
    return <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 text-xs">Female</Badge>;
  } else {
    return <Badge variant="outline" className="text-xs">{gender}</Badge>;
  }
}

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  try {
    const dob = parseISO(dateOfBirth);
    return differenceInYears(new Date(), dob);
  } catch {
    return null;
  }
}

export function PatientsTable({ patients, pageCount }: PatientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "10");

  const handleViewDetails = (patient: any) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => {
                const age = calculateAge(patient.dateOfBirth);
                const initials = patient.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "??";

                return (
                  <TableRow key={patient._id || patient.id}>
                    <TableCell className="font-mono font-semibold text-sm text-blue-600 dark:text-blue-400">
                      {formatValue(patient.patientIdentifier)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {formatValue(patient.name)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getGenderBadge(patient.gender)}</TableCell>
                    <TableCell>
                      {age !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{age}</span>
                          <span className="text-xs text-gray-500">years</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                      {formatValue(patient.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      {patient.district || patient.region ? (
                        <div className="text-sm">
                          {patient.district && (
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {patient.district}
                            </div>
                          )}
                          {patient.region && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {patient.region}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.createdAt ? (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(patient.createdAt), "MMM dd, yyyy")}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            aria-label="Open menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(patient)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <PatientDetailsDialog
          patient={selectedPatient}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}

