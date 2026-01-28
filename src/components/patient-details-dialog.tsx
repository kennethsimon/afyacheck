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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Patient } from "@/types/general";
import { parseISO, differenceInYears, format } from "date-fns";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  CheckCircle2,
  HeartPulse,
} from "lucide-react";

interface PatientDetailsDialogProps {
  patient: Patient | any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return value;
}

function getGenderBadge(gender: string) {
  if (!gender) return null;

  const genderLower = gender.toLowerCase();
  if (genderLower === "male") {
    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Male
      </Badge>
    );
  } else if (genderLower === "female") {
    return (
      <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
        Female
      </Badge>
    );
  }
  return <Badge variant="outline">{gender}</Badge>;
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: any;
  icon?: any;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="mt-0.5">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
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

function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: any;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
  );
}

export function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = React.useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 2000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!open && copied) {
      setCopied(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [open, copied]);

  if (!patient) return null;

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    try {
      const dob = parseISO(dateOfBirth);
      return differenceInYears(new Date(), dob);
    } catch {
      return "N/A";
    }
  };

  const age = calculateAge(patient.dateOfBirth);
  const initials = patient.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {patient.name || "Patient"}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Complete patient information and medical records
                </DialogDescription>
              </div>
            </div>
            {getGenderBadge(patient.gender)}
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
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
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <InfoRow
                label="Age"
                value={age !== "N/A" ? `${age} years` : "N/A"}
                icon={Calendar}
              />
              <InfoRow
                label="Date of Birth"
                value={
                  patient.dateOfBirth
                    ? format(parseISO(patient.dateOfBirth), "MMMM dd, yyyy")
                    : "Not provided"
                }
                icon={Calendar}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <SectionHeader title="Contact Information" icon={Phone} />
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <InfoRow
                  label="Phone Number"
                  value={patient.phoneNumber}
                  icon={Phone}
                />
              </div>
            </div>
          </section>

          {/* Location Information */}
          <section>
            <SectionHeader title="Location" icon={MapPin} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 text-green-900 dark:text-green-100">
                  Address
                </h4>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Region" value={patient.region} />
                  <InfoRow label="District" value={patient.district} />
                  <InfoRow label="Full Address" value={patient.address} />
                </div>
              </div>
              {patient.insurance && (
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Insurance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <InfoRow
                      label="Insurance/Bima Number"
                      value={patient.insurance}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Metadata */}
          <section>
            <SectionHeader title="Record Information" icon={HeartPulse} />
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow
                  label="Registration Date"
                  value={
                    patient.createdAt
                      ? format(new Date(patient.createdAt), "PPpp")
                      : "N/A"
                  }
                  icon={Calendar}
                />
                <InfoRow
                  label="Last Updated"
                  value={
                    patient.updatedAt
                      ? format(new Date(patient.updatedAt), "PPpp")
                      : "N/A"
                  }
                  icon={Calendar}
                />
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

