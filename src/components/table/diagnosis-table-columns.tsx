"use client";

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { getGenderBackgroundColor } from "@/lib/utils";
import Link from "next/link";
import { Patient } from "@/types/general";
import { differenceInYears, parseISO } from "date-fns";
import { getCampById } from "@/services/camps";
import { getUserById } from "@/services/users";
import { PreviewPatientSheet } from "./preview-patient-sheet";
import { PreviewDiagnosisSheet } from "./preview-diagnosis-sheet";

function formatValue(value: any) {
  return value !== null && value !== undefined ? value : "N/A";
}

function CampNameCell({ campId }: { campId: string }) {
  const [campName, setCampName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCampName = async () => {
      try {
        const { items: campDetails } = await getCampById(campId);
        setCampName(campDetails.camp.name);
      } catch (error) {
        console.error("Failed to fetch camp name:", error);
        setCampName("Error loading camp name");
      }
    };
    fetchCampName();
  }, [campId]);

  return <div>{campName || "Loading..."}</div>;
}

function CreatedByCell({ userId }: { userId: string }) {
  const [userName, setUserName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { items: userDetails } = await getUserById(userId);
        setUserName(userDetails.user.name);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUserName("Error loading user name");
      }
    };
    fetchUserName();
  }, [userId]);

  return <div>{userName || "Loading..."}</div>;
}

export function getColumns(): ColumnDef<any>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [showPreviewPatientSheet, setShowPreviewPatientSheet] =
          React.useState(false);
        const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
        const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

        const handleMouseEnter = () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
          }
          if (!isDropdownOpen) {
            setIsDropdownOpen(true);
          }
        };

        const handleMouseLeave = () => {
          closeTimeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
          }, 200); // Adjust the delay as needed
        };

        return (
          <>
            <PreviewDiagnosisSheet
              open={showPreviewPatientSheet}
              onOpenChange={setShowPreviewPatientSheet}
              patient={row.original}
            />
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <DotsHorizontalIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(row.original._id)
                  }
                >
                  Copy Patient ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setShowPreviewPatientSheet(true)}
                >
                  Preview Patient
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Link href={`/dashboard/patients/${row.original._id}`}>
                    Open Patient
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/dashboard/patients/edit/${row.original._id}`}>
                    Edit Patient
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
    {
      accessorKey: "patientIdentifier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient ID" />
      ),
      cell: ({ row }) => (
        <div>{formatValue(row?.original?.patientIdentifier)}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "screening.height",
      header: "Height",
      cell: ({ row }) => <div>{formatValue(row?.original?.screening?.height)}</div>,
    },
    {
      accessorKey: "screening.weight",
      header: "Weight",
      cell: ({ row }) => <div>{formatValue(row?.original?.screening?.weight)}</div>,
    },
    {
      accessorKey: "screening.bmi",
      header: "BMI",
      cell: ({ row }) => <div>{formatValue(row?.original?.screening?.bmi)}</div>,
    },
    {
      accessorKey: "screening.bloodPressure",
      header: "Blood Pressure",
      cell: ({ row }) => <div>{formatValue(row?.original?.screening?.bloodPressure)}</div>,
    },
    {
      accessorKey: "screening.hb",
      header: "Hemoglobin (HB)",
      cell: ({ row }) => <div>{formatValue(row?.original?.screening?.hb)}</div>,
    },
    {
      accessorKey: "clinicalFindings.tbScreening.status",
      header: "TB Screening Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.tbScreening?.status)}</div>,
    },
    {
      accessorKey: "clinicalFindings.tbScreening.medicationStatus",
      header: "TB Medication Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.tbScreening?.medicationStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioStatus",
      header: "Physio Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.physioStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioDiagnosis",
      header: "Physio Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.physioDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioReferral",
      header: "Physio Referral",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.physioReferral)}</div>,
    },
    {
      accessorKey: "clinicalFindings.dentalStatus",
      header: "Dental Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.dentalStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.dentalDiagnosis",
      header: "Dental Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.dentalDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ophthalmologyStatus",
      header: "Ophthalmology Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ophthalmologyStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ophthalmologyDiagnosis",
      header: "Ophthalmology Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ophthalmologyDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ophthalmologyReferral",
      header: "Ophthalmology Referral",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ophthalmologyReferral)}</div>,
    },
    {
      accessorKey: "clinicalFindings.orthoStatus",
      header: "Ortho Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.orthoStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.orthoDiagnosis",
      header: "Ortho Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.orthoDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.orthoReferral",
      header: "Ortho Referral",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.orthoReferral)}</div>,
    },
    {
      accessorKey: "clinicalFindings.comments",
      header: "Comments",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.comments)}</div>,
    },
    {
      accessorKey: "clinicalFindings.prescription",
      header: "Prescription",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.prescription)}</div>,
    },
    {
      accessorKey: "clinicalFindings.referral",
      header: "Referral",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.referral)}</div>,
    },
    {
      accessorKey: "clinicalFindings.hivTesting",
      header: "HIV Testing",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.hivTesting)}</div>,
    },
    {
      accessorKey: "clinicalFindings.hivResult",
      header: "HIV Result",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.hivResult)}</div>,
    },
    {
      accessorKey: "clinicalFindings.preventiveMeasure",
      header: "Preventive Measure",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.preventiveMeasure)}</div>,
    },
    {
      accessorKey: "clinicalFindings.bloodDonation",
      header: "Blood Donation",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.bloodDonation)}</div>,
    },
    {
      accessorKey: "clinicalFindings.cancerScreening",
      header: "Cancer Screening",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.cancerScreening)}</div>,
    },
    {
      accessorKey: "clinicalFindings.breastCancerStatus",
      header: "Breast Cancer Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.breastCancerStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.cervicalCancerStatus",
      header: "Cervical Cancer Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.cervicalCancerStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.prostateCancerStatus",
      header: "Prostate Cancer Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.prostateCancerStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.echoStatus",
      header: "Echo Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.echoStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ecgStatus",
      header: "ECG Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ecgStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.xrayStatus",
      header: "X-ray Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.xrayStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ultrasoundStatus",
      header: "Ultrasound Status",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ultrasoundStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.echoDiagnosis",
      header: "Echo Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.echoDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ecgDiagnosis",
      header: "ECG Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ecgDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.xrayDiagnosis",
      header: "X-ray Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.xrayDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.ultrasoundDiagnosis",
      header: "Ultrasound Diagnosis",
      cell: ({ row }) => <div>{formatValue(row?.original?.clinicalFindings?.ultrasoundDiagnosis)}</div>,
    }
,    
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.status)}</div>,
    },
    {
      accessorKey: "screening.illness",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Illness" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.screening?.illness)}</div>,
    },
    {
      accessorKey: "screening.medication",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Medication" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.screening?.medication)}</div>,
    },
    {
      accessorKey: "screening.alcoholOrSmokeUsage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alcohol/Smoke Usage" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.screening?.alcoholOrSmokeUsage)}</div>,
    },
    {
      accessorKey: "screening.chronicDiseases",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chronic Diseases" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.screening?.chronicDiseases)}</div>,
    },
    {
      accessorKey: "screening.vaccinationHistory",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vaccination History" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.screening?.vaccinationHistory)}</div>,
    },
    {
      accessorKey: "clinicalFindings.height",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Height" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.height)}</div>,
    },
    {
      accessorKey: "clinicalFindings.weight",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Weight" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.weight)}</div>,
    },
    {
      accessorKey: "clinicalFindings.bloodPressure",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Blood Pressure" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.bloodPressure)}</div>,
    },
    {
      accessorKey: "clinicalFindings.bmi",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BMI" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.bmi)}</div>,
    },
    {
      accessorKey: "clinicalFindings.tbScreening.status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TB Screening Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.tbScreening?.status)}</div>,
    },
    {
      accessorKey: "clinicalFindings.tbScreening.medicationStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TB Medication Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.tbScreening?.medicationStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Physio Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.physioStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioDiagnosis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Physio Diagnosis" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.physioDiagnosis)}</div>,
    },
    {
      accessorKey: "clinicalFindings.physioReferral",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Physio Referall" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.physioReferral)}</div>,
    },
    {
      accessorKey: "clinicalFindings.dentalStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dental Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.dentalStatus)}</div>,
    },
    {
      accessorKey: "clinicalFindings.dentalStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dental Status" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.clinicalFindings?.dentalStatus)}</div>,
    },
    {
      accessorKey: "doctorComments.doctorsComment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doctor comment" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.doctorComments?.doctorsComment)}</div>,
    },
    {
      accessorKey: "doctorComments.prescription",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doctor prescription" />
      ),
      cell: ({ row }) => <div>{formatValue(row.original.doctorComments?.prescription)}</div>,
    },
    // Add all other clinical findings similarly
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleString()}</div>,
    },
    {
      accessorKey: "camp",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Camp" />
      ),
      cell: ({ row }) => <CampNameCell campId={row.original.camp} />,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => <CreatedByCell userId={row.original.createdBy} />,
    },
  ];
}
