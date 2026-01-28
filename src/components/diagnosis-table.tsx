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
import { MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiagnosisDetailsDialog } from "./diagnosis-details-dialog";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface DiagnosisTableProps {
  diagnoses: any[];
  pageCount: number;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function getStatusBadge(status: string) {
  if (!status) return <span className="text-gray-400">—</span>;
  
  const statusLower = status.toLowerCase();
  if (statusLower === "completed" || statusLower === "done") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Completed</Badge>;
  } else if (statusLower === "pending" || statusLower === "in-progress") {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">Pending</Badge>;
  } else {
    return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getHealthStatusBadge(value: any, type: "normal" | "abnormal" | "positive" | "negative" = "normal") {
  if (!value) return <span className="text-gray-400 text-xs">—</span>;
  
  const valueStr = String(value).toLowerCase();
  if (type === "positive") {
    if (valueStr === "positive" || valueStr === "yes") {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Positive</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Negative</Badge>;
    }
  } else {
    if (valueStr === "normal" || valueStr === "good") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Normal</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Abnormal</Badge>;
    }
  }
}

export function DiagnosisTable({ diagnoses, pageCount }: DiagnosisTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("per_page") || "10");

  const handleViewDetails = (diagnosis: any) => {
    setSelectedDiagnosis(diagnosis);
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
              <TableHead>Status</TableHead>
              <TableHead>Vitals</TableHead>
              <TableHead>Screening</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Radiology</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnoses.length > 0 ? (
              diagnoses.map((diagnosis) => {
                const screening = diagnosis.screening || {};
                const clinical = diagnosis.clinicalFindings || {};
                const height = clinical.height || screening.height;
                const weight = clinical.weight || screening.weight;
                const bmi = clinical.bmi || screening.bmi;
                const bp = clinical.bloodPressure || screening.bloodPressure;
                const hb = clinical.hb || screening.hb;
                const tbStatus = clinical.tbScreening?.status;
                const hivResult = clinical.hivResult;

                const specialties = [];
                if (clinical.physioStatus) specialties.push({ name: "Physio", status: clinical.physioStatus });
                if (clinical.dentalStatus) specialties.push({ name: "Dental", status: clinical.dentalStatus });
                if (clinical.ophthalmologyStatus) specialties.push({ name: "Eye", status: clinical.ophthalmologyStatus });
                if (clinical.orthoStatus) specialties.push({ name: "Ortho", status: clinical.orthoStatus });

                const radiology = [];
                if (clinical.echoStatus) radiology.push({ name: "Echo", status: clinical.echoStatus });
                if (clinical.ecgStatus) radiology.push({ name: "ECG", status: clinical.ecgStatus });
                if (clinical.xrayStatus) radiology.push({ name: "X-ray", status: clinical.xrayStatus });
                if (clinical.ultrasoundStatus) radiology.push({ name: "US", status: clinical.ultrasoundStatus });

                return (
                  <TableRow key={diagnosis._id || diagnosis.id}>
                    <TableCell className="font-mono font-medium text-sm">
                      {formatValue(diagnosis.patientIdentifier)}
                    </TableCell>
                    <TableCell>{getStatusBadge(diagnosis.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {height && <div><span className="text-gray-500">H:</span> {height}cm</div>}
                        {weight && <div><span className="text-gray-500">W:</span> {weight}kg</div>}
                        {bmi && <div><span className="text-gray-500">BMI:</span> {bmi}</div>}
                        {bp && <div><span className="text-gray-500">BP:</span> {formatValue(bp)}</div>}
                        {!height && !weight && !bmi && !bp && <span className="text-gray-400">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {hb && (
                          <div className="text-xs">
                            <span className="text-gray-500">HB:</span> {getHealthStatusBadge(hb)}
                          </div>
                        )}
                        {tbStatus && (
                          <div className="text-xs">
                            <span className="text-gray-500">TB:</span> {getHealthStatusBadge(tbStatus, "positive")}
                          </div>
                        )}
                        {hivResult && (
                          <div className="text-xs">
                            <span className="text-gray-500">HIV:</span> {getHealthStatusBadge(hivResult, "positive")}
                          </div>
                        )}
                        {!hb && !tbStatus && !hivResult && <span className="text-gray-400 text-xs">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {specialties.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {specialties.slice(0, 2).map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec.name}
                            </Badge>
                          ))}
                          {specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {radiology.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {radiology.slice(0, 2).map((rad, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {rad.name}
                            </Badge>
                          ))}
                          {radiology.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{radiology.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {diagnosis.createdAt ? (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(diagnosis.createdAt), "MMM dd, yyyy")}
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
                          <DropdownMenuItem onClick={() => handleViewDetails(diagnosis)}>
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
                  No diagnosis records found.
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

      {/* Diagnosis Details Dialog */}
      {selectedDiagnosis && (
        <DiagnosisDetailsDialog
          diagnosis={selectedDiagnosis}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
}

