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
  const campId = params.campId as string;

  const campName = React.useMemo(() => {
    const fetchCampName = async () => {
      const { items: campDetails } = await getCampById(campId);
      return campDetails.camp.name;
    };
    return fetchCampName();
  }, [campId]);

  const creatorName = React.useMemo(() => {
    const fetchCreatorName = async () => {
      const { items: userDetails } = await getUserById(patient.createdBy);
      return userDetails.user.name;
    };
    return fetchCreatorName();
  }, [patient.createdBy]);

  const calculateAge = (dateOfBirth: string) => {
    const dob = parseISO(dateOfBirth);
    return differenceInYears(new Date(), dob);
  };

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Patient Details Preview</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
          <section>
            <h3 className="text-xl font-bold  mb-4">Basic Information</h3>
            {patient.name && (
              <div>
                <strong>Name:</strong> {patient.name}
              </div>
            )}
            {patient.dateOfBirth && (
              <div>
                <strong>Age:</strong> {calculateAge(patient.dateOfBirth)}
              </div>
            )}
            {patient.gender && (
              <div>
                <strong>Gender:</strong> {patient.gender}
              </div>
            )}
            {patient.phoneNumber && (
              <div>
                <strong>Phone Number:</strong> {patient.phoneNumber}
              </div>
            )}
            {patient.email && (
              <div>
                <strong>Email:</strong> {patient.email}
              </div>
            )}
            {patient.address && (
              <div>
                <strong>Address:</strong> {patient.address}
              </div>
            )}
            {patient.location && (
              <div>
                <strong>Location:</strong> {patient.location}
              </div>
            )}
            {campName && (
              <div>
                <strong>Camp Name:</strong> {campName}
              </div>
            )}
          </section>
          {patient.insurance && (
            <section>
              <h3 className="text-xl font-bold  mb-4">Insurance Information</h3>

              <div>
                <strong>Insurance:</strong> {patient.insurance}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xl font-bold  mb-4">Screening Information</h3>
            {patient.screening.illness && (
              <div>
                <strong>Illness:</strong> {patient.screening.illness}
              </div>
            )}
            {patient.screening.medication && (
              <div>
                <strong>Medication:</strong> {patient.screening.medication}
              </div>
            )}
            {patient.screening.alcoholOrSmokeUsage && (
              <div>
                <strong>Alcohol or Smoke Usage:</strong>{" "}
                {patient.screening.alcoholOrSmokeUsage}
              </div>
            )}
            {patient.screening.chronicDiseases && (
              <div>
                <strong>Chronic Diseases:</strong>{" "}
                {patient.screening.chronicDiseases}
              </div>
            )}
            {patient.screening.vaccinationHistory && (
              <div>
                <strong>Vaccination History:</strong>{" "}
                {patient.screening.vaccinationHistory}
              </div>
            )}
          </section>
          <section>
            <h3 className="text-xl font-bold  mb-4">Clinical Findings</h3>
            {patient.clinicalFindings.height && (
              <div>
                <strong>Height:</strong> {patient.clinicalFindings.height}
              </div>
            )}
            {patient.clinicalFindings.weight && (
              <div>
                <strong>Weight:</strong> {patient.clinicalFindings.weight}
              </div>
            )}
            {patient.clinicalFindings.bmi && (
              <div>
                <strong>BMI:</strong> {patient.clinicalFindings.bmi}
              </div>
            )}
            {patient.clinicalFindings.bloodPressure && (
              <div>
                <strong>Blood Pressure:</strong>{" "}
                {patient.clinicalFindings.bloodPressure}
              </div>
            )}
            {patient.clinicalFindings.rbgFbs && (
              <div>
                <strong>RBG/FBS:</strong> {patient.clinicalFindings.rbgFbs}
              </div>
            )}
            {patient.clinicalFindings.bloodGroup && (
              <div>
                <strong>Blood Group:</strong>{" "}
                {patient.clinicalFindings.bloodGroup}
              </div>
            )}
            {patient.clinicalFindings.cholesterol && (
              <div>
                <strong>Cholesterol:</strong>{" "}
                {patient.clinicalFindings.cholesterol}
              </div>
            )}
            {patient.clinicalFindings.physicalAppearance && (
              <div>
                <strong>Physical Appearance:</strong>{" "}
                {patient.clinicalFindings.physicalAppearance}
              </div>
            )}
            {patient.clinicalFindings.cancer && (
              <div>
                <strong>Cancer:</strong> {patient.clinicalFindings.cancer}
              </div>
            )}
            {patient.clinicalFindings.ecgEcho && (
              <div>
                <strong>ECG/Echo:</strong> {patient.clinicalFindings.ecgEcho}
              </div>
            )}
            {patient.clinicalFindings.mse && (
              <div>
                <strong>MSE:</strong> {patient.clinicalFindings.mse}
              </div>
            )}
            {patient.clinicalFindings.physio && (
              <div>
                <strong>Physio:</strong> {patient.clinicalFindings.physio}
              </div>
            )}
            {patient.clinicalFindings.ot && (
              <div>
                <strong>OT:</strong> {patient.clinicalFindings.ot}
              </div>
            )}
            {patient.clinicalFindings.dental && (
              <div>
                <strong>Dental:</strong> {patient.clinicalFindings.dental}
              </div>
            )}
            {patient.clinicalFindings.ophthalmology && (
              <div>
                <strong>Ophthalmology:</strong>{" "}
                {patient.clinicalFindings.ophthalmology}
              </div>
            )}
            {patient.clinicalFindings.comments && (
              <div>
                <strong>Comments:</strong> {patient.clinicalFindings.comments}
              </div>
            )}
            {patient.clinicalFindings.prescription && (
              <div>
                <strong>Prescription:</strong>{" "}
                {patient.clinicalFindings.prescription}
              </div>
            )}
            {patient.clinicalFindings.referral && (
              <div>
                <strong>Referral:</strong> {patient.clinicalFindings.referral}
              </div>
            )}
          </section>
          <section>
            <h3 className="text-xl font-bold  mb-4">Metadata</h3>
            {creatorName && (
              <div>
                <strong>Created By :</strong> {creatorName}
              </div>
            )}
            {patient.createdAt && (
              <div>
                <strong>Created At:</strong>{" "}
                {new Date(patient.createdAt).toLocaleString()}
              </div>
            )}
            {patient.updatedAt && (
              <div>
                <strong>Updated At:</strong>{" "}
                {new Date(patient.updatedAt).toLocaleString()}
              </div>
            )}
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
