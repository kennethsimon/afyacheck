"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types/general";
import { parseISO, differenceInYears } from "date-fns";
import { useParams } from "next/navigation";
import { getCampById } from "@/services/camps";
import { getUserById } from "@/services/users";
import Link from "next/link";

interface PreviewPatientSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  patient: Patient;
}

export function PreviewPatientSheet({
  patient,
  ...props
}: PreviewPatientSheetProps) {
  const params = useParams();

  const [campName, setCampName] = React.useState<string | null>(null);
  const [creatorName, setCreatorName] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCampName = async () => {
      if (patient.camp) {
        const { items: campDetails } = await getCampById(patient.camp);
        setCampName(campDetails?.camp?.name || "N/A");
      }
    };

    const fetchCreatorName = async () => {
      if (patient.createdBy) {
        const { items: userDetails } = await getUserById(patient.createdBy);
        setCreatorName(userDetails?.user?.name || "N/A");
      }
    };

    fetchCampName();
    fetchCreatorName();
  }, [patient.camp, patient.createdBy]);

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const newDateOfBirth = parseISO(dateOfBirth);
    return differenceInYears(new Date(), newDateOfBirth);
  };

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Patient Details Preview</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
          <section>
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div>
              <strong>Name:</strong> {patient.name || "N/A"}
            </div>
            <div>
              <strong>Age:</strong> {calculateAge(patient.dateOfBirth)}
            </div>
            <div>
              <strong>Gender:</strong> {patient.gender || "N/A"}
            </div>
            <div>
              <strong>Phone Number:</strong> {patient.phoneNumber || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {patient.email || "N/A"}
            </div>
            <div>
              <strong>Address:</strong> {patient.address || "N/A"}
            </div>
            <div>
              <strong>Location:</strong> {patient.location || "N/A"}
            </div>
            <div>
              <strong>Camp Name:</strong> {campName || "N/A"}
            </div>
          </section>
          {patient.insurance && (
            <section>
              <h3 className="text-xl font-bold mb-4">Insurance Information</h3>
              <div>
                <strong>Insurance:</strong> {patient.insurance || "N/A"}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xl font-bold mb-4">Screening Information</h3>
            <div>
              <strong>Illness:</strong> {patient.screening?.illness || "N/A"}
            </div>
            <div>
              <strong>Medication:</strong>{" "}
              {patient.screening?.medication || "N/A"}
            </div>
            <div>
              <strong>Alcohol or Smoke Usage:</strong>{" "}
              {patient.screening?.alcoholOrSmokeUsage || "N/A"}
            </div>
            <div>
              <strong>Chronic Diseases:</strong>{" "}
              {patient.screening?.chronicDiseases || "N/A"}
            </div>
            <div>
              <strong>Vaccination History:</strong>{" "}
              {patient.screening?.vaccinationHistory || "N/A"}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">Clinical Findings</h3>
            <div>
              <strong>Height:</strong>{" "}
              {patient.clinicalFindings?.height || "N/A"}
            </div>
            <div>
              <strong>Weight:</strong>{" "}
              {patient.clinicalFindings?.weight || "N/A"}
            </div>
            <div>
              <strong>BMI:</strong> {patient.clinicalFindings?.bmi || "N/A"}
            </div>
            <div>
              <strong>Blood Pressure:</strong>{" "}
              {patient.clinicalFindings?.bloodPressure || "N/A"}
            </div>
            <div>
              <strong>RBG/FBS:</strong>{" "}
              {patient.clinicalFindings?.rbgFbs || "N/A"}
            </div>
            <div>
              <strong>Blood Group:</strong>{" "}
              {patient.clinicalFindings?.bloodGroup || "N/A"}
            </div>
            <div>
              <strong>Cholesterol:</strong>{" "}
              {patient.clinicalFindings?.cholesterol || "N/A"}
            </div>
            <div>
              <strong>Physical Appearance:</strong>{" "}
              {patient.clinicalFindings?.physicalAppearance || "N/A"}
            </div>
            <div>
              <strong>Cancer:</strong>{" "}
              {patient.clinicalFindings?.cancer || "N/A"}
            </div>
            <div>
              <strong>ECG/Echo:</strong>{" "}
              {patient.clinicalFindings?.ecgEcho || "N/A"}
            </div>
            <div>
              <strong>MSE:</strong> {patient.clinicalFindings?.mse || "N/A"}
            </div>
            <div>
              <strong>Physio:</strong>{" "}
              {patient.clinicalFindings?.physio || "N/A"}
            </div>
            <div>
              <strong>OT:</strong> {patient.clinicalFindings?.ot || "N/A"}
            </div>
            <div>
              <strong>Dental:</strong>{" "}
              {patient.clinicalFindings?.dental || "N/A"}
            </div>
            <div>
              <strong>Ophthalmology:</strong>{" "}
              {patient.clinicalFindings?.ophthalmology || "N/A"}
            </div>
            <div>
              <strong>Comments:</strong>{" "}
              {patient.clinicalFindings?.comments || "N/A"}
            </div>
            <div>
              <strong>Prescription:</strong>{" "}
              {patient.clinicalFindings?.prescription || "N/A"}
            </div>
            <div>
              <strong>Referral:</strong>{" "}
              {patient.clinicalFindings?.referral || "N/A"}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">Metadata</h3>
            <div>
              <strong>Created By:</strong> {creatorName || "N/A"}
            </div>
            <div>
              <strong>Created At:</strong>{" "}
              {patient.createdAt
                ? new Date(patient.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {patient.updatedAt
                ? new Date(patient.updatedAt).toLocaleString()
                : "N/A"}
            </div>
          </section>
        </div>

        <SheetFooter className="gap-2 pt-2 sm:space-x-0 flex-shrink-0 flex justify-end">
          <Link href={`/dashboard/patients/edit/${patient._id}`} passHref>
            <Button type="button" variant="outline">
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/patients/${patient._id}`} passHref>
            <Button type="button" variant="outline">
              Open
            </Button>
          </Link>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
