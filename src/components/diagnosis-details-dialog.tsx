"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DiagnosisDetailsDialogProps {
  diagnosis: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return value;
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        <div className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">
          {formatValue(value)}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      {title}
    </h3>
  );
}

export function DiagnosisDetailsDialog({
  diagnosis,
  open,
  onOpenChange,
}: DiagnosisDetailsDialogProps) {
  if (!diagnosis) return null;

  const screening = diagnosis.screening || {};
  const clinical = diagnosis.clinicalFindings || {};
  const doctorComments = diagnosis.doctorComments || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-2xl">Diagnosis Details</DialogTitle>
          <DialogDescription className="mt-1">
            Complete diagnosis information for patient {diagnosis.patientIdentifier}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Patient Information */}
          <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <SectionHeader title="Patient Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Patient Identifier" value={diagnosis.patientIdentifier} />
              <InfoRow label="Status" value={diagnosis.status} />
            </div>
          </section>

          {/* Vitals */}
          {(clinical.height || clinical.weight || clinical.bmi || clinical.bloodPressure) && (
            <section>
              <SectionHeader title="Vitals" />
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Height" value={clinical.height ? `${clinical.height} cm` : null} />
                  <InfoRow label="Weight" value={clinical.weight ? `${clinical.weight} kg` : null} />
                  <InfoRow label="BMI" value={clinical.bmi} />
                  <InfoRow label="Blood Pressure" value={clinical.bloodPressure} />
                </div>
              </div>
            </section>
          )}

          {/* Screening */}
          {(clinical.hb || clinical.tbScreening || clinical.hivResult || screening.illness) && (
            <section>
              <SectionHeader title="Screening" />
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="HB Status" value={clinical.hb} />
                  {clinical.tbScreening && (
                    <>
                      <InfoRow label="TB Screening Status" value={clinical.tbScreening.status} />
                      <InfoRow label="TB Medication Status" value={clinical.tbScreening.medicationStatus} />
                    </>
                  )}
                  <InfoRow label="HIV Result" value={clinical.hivResult} />
                  <InfoRow label="Illness" value={screening.illness} />
                  <InfoRow label="Medication" value={screening.medication} />
                  <InfoRow label="Chronic Diseases" value={screening.chronicDiseases} />
                </div>
              </div>
            </section>
          )}

          {/* Clinical Findings */}
          {(clinical.physicalAppearance || clinical.cancer || clinical.mse) && (
            <section>
              <SectionHeader title="Clinical Findings" />
              <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Physical Appearance" value={clinical.physicalAppearance} />
                  <InfoRow label="Cancer Screening" value={clinical.cancer} />
                  <InfoRow label="MSE" value={clinical.mse} />
                  <InfoRow label="Cholesterol" value={clinical.cholesterol} />
                  <InfoRow label="Blood Group" value={clinical.bloodGroup} />
                  <InfoRow label="RBG/FBS" value={clinical.rbgFbs} />
                </div>
              </div>
            </section>
          )}

          {/* Specialties */}
          {(clinical.physioStatus || clinical.dentalStatus || clinical.ophthalmologyStatus || clinical.orthoStatus) && (
            <section>
              <SectionHeader title="Specialties" />
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Physio Status" value={clinical.physioStatus} />
                  <InfoRow label="Dental Status" value={clinical.dentalStatus} />
                  <InfoRow label="Ophthalmology Status" value={clinical.ophthalmologyStatus} />
                  <InfoRow label="Ortho Status" value={clinical.orthoStatus} />
                </div>
              </div>
            </section>
          )}

          {/* Radiology */}
          {(clinical.echoStatus || clinical.ecgStatus || clinical.xrayStatus || clinical.ultrasoundStatus) && (
            <section>
              <SectionHeader title="Radiology" />
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Echo Status" value={clinical.echoStatus} />
                  <InfoRow label="ECG Status" value={clinical.ecgStatus} />
                  <InfoRow label="X-ray Status" value={clinical.xrayStatus} />
                  <InfoRow label="Ultrasound Status" value={clinical.ultrasoundStatus} />
                  <InfoRow label="Echo Diagnosis" value={clinical.echoDiagnosis} />
                  <InfoRow label="ECG Diagnosis" value={clinical.ecgDiagnosis} />
                  <InfoRow label="X-ray Diagnosis" value={clinical.xrayDiagnosis} />
                  <InfoRow label="Ultrasound Diagnosis" value={clinical.ultrasoundDiagnosis} />
                </div>
              </div>
            </section>
          )}

          {/* Doctor Comments */}
          {(doctorComments.doctorsComment || doctorComments.prescription || doctorComments.referral) && (
            <section>
              <SectionHeader title="Doctor Comments" />
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="space-y-4">
                  <InfoRow label="Doctor's Comment" value={doctorComments.doctorsComment} />
                  <InfoRow label="Prescription" value={doctorComments.prescription} />
                  <InfoRow label="Referral" value={doctorComments.referral} />
                  <InfoRow label="ECG Report" value={doctorComments.ecgReport} />
                  <InfoRow label="MSE Report" value={doctorComments.mse} />
                  <InfoRow label="Physio Report" value={doctorComments.physio} />
                  <InfoRow label="OT Report" value={doctorComments.ot} />
                  <InfoRow label="Dental Report" value={doctorComments.dentalReport} />
                  <InfoRow label="Ophthalmology Report" value={doctorComments.ophthalmologyReport} />
                </div>
              </div>
            </section>
          )}

          {/* Metadata */}
          <section>
            <SectionHeader title="Record Information" />
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Created Date"
                  value={
                    diagnosis.createdAt
                      ? format(new Date(diagnosis.createdAt), "PPpp")
                      : "N/A"
                  }
                />
                <InfoRow
                  label="Last Updated"
                  value={
                    diagnosis.updatedAt
                      ? format(new Date(diagnosis.updatedAt), "PPpp")
                      : "N/A"
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

