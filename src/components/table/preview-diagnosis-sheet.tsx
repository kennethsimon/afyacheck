import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { parseISO, differenceInYears } from "date-fns";
import { useParams } from "next/navigation";
// import { getCampById } from "@/services/camps";
// import { getUserById } from "@/services/users";
import Link from "next/link";

interface PreviewPatientSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  patient: any;
}

export function PreviewDiagnosisSheet({
  patient,
  ...props
}: PreviewPatientSheetProps) {
  const params = useParams();

  // const [campName, setCampName] = React.useState<string | null>(null);
  // const [creatorName, setCreatorName] = React.useState<string | null>(null);

  // React.useEffect(() => {
  //   const fetchCampName = async () => {
  //     if (patient.camp) {
  //       const { items: campDetails } = await getCampById(patient.camp);
  //       setCampName(campDetails?.camp?.name || "N/A");
  //     }
  //   };

  //   const fetchCreatorName = async () => {
  //     if (patient.createdBy) {
  //       const { items: userDetails } = await getUserById(patient.createdBy);
  //       setCreatorName(userDetails?.user?.name || "N/A");
  //     }
  //   };

  //   fetchCampName();
  //   fetchCreatorName();
  // }, [patient.camp, patient.createdBy]);

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const newDateOfBirth = parseISO(dateOfBirth);
    return differenceInYears(new Date(), newDateOfBirth);
  };

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Diagnosis Details Preview</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
          <section>
            <h3 className="text-xl font-bold mb-4">Basic Information</h3>
            <div>
              <strong>Patient ID:</strong> {patient.patientIdentifier || "N/A"}
            </div>
            {/* <div>
              <strong>Camp Name:</strong> {campName || "N/A"}
            </div> */}
            <div>
              <strong>Status:</strong> {patient.status || "N/A"}
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">Screening Information</h3>
            <div>
              <strong>Height:</strong> {patient.screening?.height || "N/A"}
            </div>
            <div>
              <strong>Weight:</strong> {patient.screening?.weight || "N/A"}
            </div>
            <div>
              <strong>BMI:</strong> {patient.screening?.bmi || "N/A"}
            </div>
            <div>
              <strong>Blood Pressure:</strong>{" "}
              {patient.screening?.bloodPressure || "N/A"}
            </div>
            <div>
              <strong>HB:</strong> {patient.screening?.hb || "N/A"}
            </div>
            <div>
              <strong>Illness:</strong> {patient.screening?.illness || "N/A"}
            </div>
            <div>
              <strong>Medication:</strong>{" "}
              {patient?.screening?.medication || "N/A"}
            </div>
            <div>
              <strong>Alcohol or Smoke Usage:</strong>{" "}
              {patient?.screening?.alcoholOrSmokeUsage || "N/A"}
            </div>
            <div>
              <strong>Chronic Diseases:</strong>{" "}
              {patient?.screening?.chronicDiseases || "N/A"}
            </div>
            <div>
              <strong>Vaccination History:</strong>{" "}
              {patient?.screening?.vaccinationHistory || "N/A"}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">Clinical Findings</h3>
            <div>
              <strong>TB Screening Status:</strong>{" "}
              {patient.clinicalFindings?.tbScreening?.status || "N/A"}
            </div>
            <div>
              <strong>TB Medication Status:</strong>{" "}
              {patient.clinicalFindings?.tbScreening?.medicationStatus || "N/A"}
            </div>
            <div>
              <strong>HIV Testing:</strong>{" "}
              {patient.clinicalFindings?.hivTesting || "N/A"}
            </div>
            <div>
              <strong>Physio Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.physioDiagnosis || "N/A"}
            </div>
            <div>
              <strong>Dental Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.dentalDiagnosis || "N/A"}
            </div>
            <div>
              <strong>Ophthalmology Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.ophthalmologyDiagnosis || "N/A"}
            </div>
            <div>
              <strong>Ortho Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.orthoDiagnosis || "N/A"}
            </div>
            <div>
              <strong>HIV Result:</strong>{" "}
              {patient.clinicalFindings?.hivResult || "N/A"}
            </div>
            <div>
              <strong>HIV Case:</strong>{" "}
              {patient.clinicalFindings?.hivCase || "N/A"}
            </div>
            <div>
              <strong>HIV Known Case Medication:</strong>{" "}
              {patient.clinicalFindings?.hivKnownCaseMedication || "N/A"}
            </div>
            <div>
              <strong>HIV New Case Medication:</strong>{" "}
              {patient.clinicalFindings?.hivNewCaseMedication || "N/A"}
            </div>
            <div>
              <strong>Preventive Measure Details:</strong>{" "}
              {patient.clinicalFindings?.preventiveMeasureDetails || "N/A"}
            </div>
            <div>
              <strong>Education Counseling:</strong>{" "}
              {patient.clinicalFindings?.educationCounseling || "N/A"}
            </div>
            <div>
              <strong>Cancer Screening:</strong>{" "}
              {patient.clinicalFindings?.cancerScreening || "N/A"}
            </div>
            <div>
              <strong>Breast Cancer Status:</strong>{" "}
              {patient.clinicalFindings?.breastCancerStatus || "N/A"}
            </div>
            <div>
              <strong>Breast Cancer Referred:</strong>{" "}
              {patient.clinicalFindings?.breastCancerReferred || "N/A"}
            </div>
            <div>
              <strong>Cervical Cancer Status:</strong>{" "}
              {patient.clinicalFindings?.cervicalCancerStatus || "N/A"}
            </div>
            <div>
              <strong>Cervical Cancer Treatment:</strong>{" "}
              {patient.clinicalFindings?.cervicalCancerTreatment || "N/A"}
            </div>
            <div>
              <strong>Prostate Cancer Status:</strong>{" "}
              {patient.clinicalFindings?.prostateCancerStatus || "N/A"}
            </div>
            <div>
              <strong>Radiology Type:</strong>{" "}
              {patient.clinicalFindings?.radiologyType || "N/A"}
            </div>
            <div>
              <strong>Echo Status:</strong>{" "}
              {patient.clinicalFindings?.echoStatus || "N/A"}
            </div>
            <div>
              <strong>ECG Status:</strong>{" "}
              {patient.clinicalFindings?.ecgStatus || "N/A"}
            </div>
            <div>
              <strong>X-ray Status:</strong>{" "}
              {patient.clinicalFindings?.xrayStatus || "N/A"}
            </div>
            <div>
              <strong>Ultrasound Status:</strong>{" "}
              {patient.clinicalFindings?.ultrasoundStatus || "N/A"}
            </div>
            <div>
              <strong>Echo Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.echoDiagnosis || "N/A"}
            </div>
            <div>
              <strong>ECG Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.ecgDiagnosis || "N/A"}
            </div>
            <div>
              <strong>X-ray Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.xrayDiagnosis || "N/A"}
            </div>
            <div>
              <strong>Ultrasound Diagnosis:</strong>{" "}
              {patient.clinicalFindings?.ultrasoundDiagnosis || "N/A"}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">Doctor&apos;s Comments</h3>
            <div>
              <strong>Doctor&apos;s Comment:</strong>{" "}
              {patient.doctorComments?.doctorsComment || "N/A"}
            </div>
            <div>
              <strong>Prescription:</strong>{" "}
              {patient.doctorComments?.prescription || "N/A"}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">Metadata</h3>
            {/* <div>
              <strong>Created By:</strong> {creatorName || "N/A"}
            </div> */}
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

        {/* <SheetFooter className="gap-2 pt-2 sm:space-x-0 flex-shrink-0 flex justify-end">
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
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
