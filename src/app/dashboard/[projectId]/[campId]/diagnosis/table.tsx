import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  const patientData = {
    clinicalFindings: {
      tbScreening: {
        status: "suspicious",
        medicationStatus: "notStarted",
      },
      physioDiagnosis: null,
      dentalDiagnosis: null,
      ophthalmologyDiagnosis: null,
      orthoDiagnosis: null,
      hivResult: "positive",
      hivCase: "known-case",
      hivKnownCaseMedication: "on-medication",
      hivNewCaseMedication: null,
      preventiveMeasureDetails: "self-test-kit",
      educationCounseling: null,
      cancerScreening: "breast-cancer",
      breastCancerStatus: "normal",
      breastCancerReferred: null,
      cervicalCancerStatus: null,
      cervicalCancerTreatment: null,
      prostateCancerStatus: null,
      radiologyType: "echo",
      echoStatus: "normal",
      ecgStatus: null,
      xrayStatus: null,
      ultrasoundStatus: null,
      echoDiagnosis: null,
      ecgDiagnosis: null,
      xrayDiagnosis: null,
      ultrasoundDiagnosis: null,
      height: 123,
      weight: 90,
      bmi: "59.49",
      bloodPressure: "normal",
      hb: "normal",
      physioStatus: "normal",
      dentalStatus: "normal",
      ophthalmologyStatus: "normal",
      orthoStatus: "normal",
      hivTesting: "tested",
      preventiveMeasure: "yes",
      bloodDonation: "yes",
    },
    status: "pending",
    _id: "66fa49e6130e18853f371aac",
    patientIdentifier: "AC000000000002",
    camp: "66e53fd6aa38f7d91e219c08",
    createdBy: "66f527bbe331e30020f37124",
    createdAt: "2024-09-30T06:49:10.806Z",
    updatedAt: "2024-09-30T06:49:10.806Z",
    __v: 0,
  };
  
  export function PatientDataTable({patients}: any) {
    const { clinicalFindings, ...otherData } = patients;
    console.log(patients)
  
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Patient Data Overview</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Displaying patient identifier and other details */}
            <TableRow>
              <TableCell className="font-medium">Patient Identifier</TableCell>
              <TableCell>{otherData?.patientIdentifier}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>{otherData?.status}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Camp ID</TableCell>
              <TableCell>{otherData?.camp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Created At</TableCell>
              <TableCell>{new Date(otherData?.createdAt).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Updated At</TableCell>
              <TableCell>{new Date(otherData?.updatedAt).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HB Status</TableCell>
              <TableCell>{clinicalFindings?.hb}</TableCell>
            </TableRow>
            {/* Displaying clinical findings */}
            <TableRow>
              <TableCell>TB Screening Status</TableCell>
              <TableCell>{clinicalFindings?.tbScreening?.status}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>TB Medication Status</TableCell>
              <TableCell>{clinicalFindings?.tbScreening?.medicationStatus}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>HIV Result</TableCell>
              <TableCell>{clinicalFindings?.hivResult}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Height (cm)</TableCell>
              <TableCell>{clinicalFindings?.height}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Weight (kg)</TableCell>
              <TableCell>{clinicalFindings?.weight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>BMI</TableCell>
              <TableCell>{clinicalFindings?.bmi}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Blood Pressure</TableCell>
              <TableCell>{clinicalFindings?.bloodPressure}</TableCell>
            </TableRow>
            {/* Add more fields as necessary */}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={1}>Total Patient Records</TableCell>
              <TableCell className="text-right">1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
  