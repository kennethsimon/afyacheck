import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill, 
  CheckCircle2,
  Copy,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

interface PreviewPatientSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  patient: any;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return value;
}

function getStatusBadge(status: string) {
  if (!status) return null;
  
  const statusLower = status.toLowerCase();
  if (statusLower === "completed") {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
  } else if (statusLower === "pending") {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="mt-0.5">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        <div className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{formatValue(value)}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    </div>
  );
}

export function PreviewDiagnosisSheet({
  patient,
  ...props
}: PreviewPatientSheetProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!patient) return null;

  const screening = patient.screening || {};
  const clinical = patient.clinicalFindings || {};
  const doctorComments = patient.doctorComments || {};

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <SheetTitle className="text-2xl">Diagnosis Details</SheetTitle>
                <SheetDescription className="mt-1">
                  Complete medical diagnosis information
                </SheetDescription>
              </div>
            </div>
            {getStatusBadge(patient.status)}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Patient Information */}
          <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <SectionHeader title="Patient Information" icon={User} />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <InfoRow 
                  label="Patient Identifier" 
                  value={patient.patientIdentifier}
                  icon={Copy}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(patient.patientIdentifier)}
                  className="h-8"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
              <InfoRow 
                label="Created Date" 
                value={patient.createdAt ? format(new Date(patient.createdAt), "PPpp") : "N/A"}
                icon={Calendar}
              />
            </div>
          </section>

          {/* Vitals & Screening */}
          <section>
            <SectionHeader title="Vitals & Screening" icon={Activity} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-blue-900 dark:text-blue-100">Vital Signs</h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Height" value={clinical.height || screening.height ? `${formatValue(clinical.height || screening.height)} cm` : "Not provided"} />
                  <InfoRow label="Weight" value={clinical.weight || screening.weight ? `${formatValue(clinical.weight || screening.weight)} kg` : "Not provided"} />
                  <InfoRow label="BMI" value={clinical.bmi || screening.bmi} />
                  <InfoRow label="Blood Pressure" value={clinical.bloodPressure || screening.bloodPressure} />
                  <InfoRow label="Hemoglobin (HB)" value={clinical.hb || screening.hb} />
            </div>
            </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-green-900 dark:text-green-100">Health History</h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Illness" value={screening.illness} />
                  <InfoRow label="Medication" value={screening.medication} />
                  <InfoRow label="Alcohol/Smoke Usage" value={screening.alcoholOrSmokeUsage} />
                  <InfoRow label="Chronic Diseases" value={screening.chronicDiseases} />
                  <InfoRow label="Vaccination History" value={screening.vaccinationHistory} />
            </div>
            </div>
            </div>
          </section>

          {/* Clinical Findings */}
          <section>
            <SectionHeader title="Clinical Findings" icon={Stethoscope} />
            
            {/* TB Screening */}
            {clinical.tbScreening && (
              <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm mb-3 text-orange-900 dark:text-orange-100">TB Screening</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoRow label="Status" value={clinical.tbScreening.status} />
                  <InfoRow label="Medication Status" value={clinical.tbScreening.medicationStatus} />
            </div>
            </div>
            )}

            {/* HIV Testing */}
            {clinical.hivTesting && (
              <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm mb-3 text-red-900 dark:text-red-100">HIV Testing</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoRow label="Testing" value={clinical.hivTesting} />
                  <InfoRow label="Result" value={clinical.hivResult} />
                  <InfoRow label="Case Type" value={clinical.hivCase} />
                  <InfoRow label="Known Case Medication" value={clinical.hivKnownCaseMedication} />
                  <InfoRow label="New Case Medication" value={clinical.hivNewCaseMedication} />
            </div>
            </div>
            )}

            {/* Specialty Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {clinical.physioStatus && (
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-purple-900 dark:text-purple-100">Physiotherapy</h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Status" value={clinical.physioStatus} />
                    <InfoRow label="Diagnosis" value={clinical.physioDiagnosis} />
                    <InfoRow label="Referral" value={clinical.physioReferral} />
            </div>
            </div>
              )}
              
              {clinical.dentalStatus && (
                <div className="bg-teal-50 dark:bg-teal-950 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-teal-900 dark:text-teal-100">Dental</h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Status" value={clinical.dentalStatus} />
                    <InfoRow label="Diagnosis" value={clinical.dentalDiagnosis} />
            </div>
            </div>
              )}
              
              {clinical.ophthalmologyStatus && (
                <div className="bg-cyan-50 dark:bg-cyan-950 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-cyan-900 dark:text-cyan-100">Ophthalmology</h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Status" value={clinical.ophthalmologyStatus} />
                    <InfoRow label="Diagnosis" value={clinical.ophthalmologyDiagnosis} />
                    <InfoRow label="Referral" value={clinical.ophthalmologyReferral} />
            </div>
            </div>
              )}
              
              {clinical.orthoStatus && (
                <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-indigo-900 dark:text-indigo-100">Orthopedics</h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Status" value={clinical.orthoStatus} />
                    <InfoRow label="Diagnosis" value={clinical.orthoDiagnosis} />
                    <InfoRow label="Referral" value={clinical.orthoReferral} />
            </div>
            </div>
              )}
            </div>

            {/* Radiology */}
            {(clinical.echoStatus || clinical.ecgStatus || clinical.xrayStatus || clinical.ultrasoundStatus) && (
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm mb-3 text-yellow-900 dark:text-yellow-100">Radiology</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {clinical.echoStatus && (
            <div>
                      <InfoRow label="Echo Status" value={clinical.echoStatus} />
                      <InfoRow label="Echo Diagnosis" value={clinical.echoDiagnosis} />
            </div>
                  )}
                  {clinical.ecgStatus && (
            <div>
                      <InfoRow label="ECG Status" value={clinical.ecgStatus} />
                      <InfoRow label="ECG Diagnosis" value={clinical.ecgDiagnosis} />
            </div>
                  )}
                  {clinical.xrayStatus && (
            <div>
                      <InfoRow label="X-ray Status" value={clinical.xrayStatus} />
                      <InfoRow label="X-ray Diagnosis" value={clinical.xrayDiagnosis} />
            </div>
                  )}
                  {clinical.ultrasoundStatus && (
            <div>
                      <InfoRow label="Ultrasound Status" value={clinical.ultrasoundStatus} />
                      <InfoRow label="Ultrasound Diagnosis" value={clinical.ultrasoundDiagnosis} />
            </div>
                  )}
            </div>
            </div>
            )}

            {/* Cancer Screening */}
            {clinical.cancerScreening && (
              <div className="bg-pink-50 dark:bg-pink-950 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm mb-3 text-pink-900 dark:text-pink-100">Cancer Screening</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Type" value={clinical.cancerScreening} />
                  {clinical.breastCancerStatus && (
                    <>
                      <InfoRow label="Breast Cancer Status" value={clinical.breastCancerStatus} />
                      <InfoRow label="Breast Cancer Referred" value={clinical.breastCancerReferred} />
                    </>
                  )}
                  {clinical.cervicalCancerStatus && (
                    <>
                      <InfoRow label="Cervical Cancer Status" value={clinical.cervicalCancerStatus} />
                      <InfoRow label="Cervical Cancer Treatment" value={clinical.cervicalCancerTreatment} />
                    </>
                  )}
                  {clinical.prostateCancerStatus && (
                    <InfoRow label="Prostate Cancer Status" value={clinical.prostateCancerStatus} />
                  )}
            </div>
            </div>
            )}

            {/* Other Clinical Info */}
            {(clinical.comments || clinical.prescription || clinical.referral || clinical.preventiveMeasure) && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Additional Information</h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Comments" value={clinical.comments} />
                  <InfoRow label="Prescription" value={clinical.prescription} />
                  <InfoRow label="Referral" value={clinical.referral} />
                  <InfoRow label="Preventive Measure" value={clinical.preventiveMeasure} />
                  <InfoRow label="Preventive Details" value={clinical.preventiveMeasureDetails} />
                  <InfoRow label="Education & Counseling" value={clinical.educationCounseling} />
                  <InfoRow label="Blood Donation" value={clinical.bloodDonation} />
            </div>
            </div>
            )}
          </section>

          {/* Doctor Comments */}
          {(doctorComments.doctorsComment || doctorComments.prescription) && (
          <section>
              <SectionHeader title="Doctor's Comments" icon={FileText} />
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="space-y-3 text-sm">
                  {doctorComments.doctorsComment && (
            <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Doctor&apos;s Comment</div>
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {formatValue(doctorComments.doctorsComment)}
                      </div>
            </div>
                  )}
                  {doctorComments.prescription && (
            <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Prescription
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {formatValue(doctorComments.prescription)}
                      </div>
            </div>
                  )}
            </div>
            </div>
          </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
