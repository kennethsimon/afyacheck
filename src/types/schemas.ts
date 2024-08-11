import { z } from "zod";

export const PatientInfoSchema = z.object({
  name: z.string().min(1, "Patient name is required"),
  gender: z.enum(["male", "female", "others"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Telephone number is required"),
  location: z.string().min(1, "Location is required"),
  insurance: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

export const ScreeningQuestionsSchema = z.object({
  screening: z.object({
    illness: z.enum(["yes", "no", "dont-know"]),
    medication: z.enum(["yes", "no", "stopped"]),
    alcoholOrSmokeUsage: z.enum(["yes", "no", "stopped"]),
    chronicDiseases: z.enum(["yes", "no", "dont-know"]),
    vaccinationHistory: z.enum(["yes", "no", "ready", "refuse"]),
  }),
});

export const ClinicalFindingsSchema = z.object({
  clinicalFindings: z.object({
    height: z.number(),
    weight: z.number(),
    bmi: z.number(),
    bloodPressure: z.string(),
    rbgFbs: z.string(),
    bloodGroup: z.string(),
    cholesterol: z.string(),
    physicalAppearance: z.string(),
    cancer: z.string(),
    ecgEcho: z.string(),
    mse: z.string(),
    physio: z.string(),
    ot: z.string(),
    dental: z.string(),
    ophthalmology: z.string(),
    comments: z.string(),
    prescription: z.string(),
    referral: z.string(),
  }),
});

export const DoctorCommentsSchema = z.object({
  doctorComments: z.object({
    ecgReport: z.string().min(1, "ECG/ECHO and report is required"),
    mse: z.string().min(1, "MSE is required"),
    physio: z.string().min(1, "PHYSIO is required"),
    ot: z.string().min(1, "OT is required"),
    dentalReport: z.string().min(1, "Dental screening and report is required"),
    ophthalmologyReport: z
      .string()
      .min(1, "Ophthalmology screening and report is required"),
    doctorsComment: z
      .string()
      .min(1, "Doctors comment and/or diagnosis is required"),
    prescription: z.string().min(1, "Prescription if any is required"),
    referral: z.enum(["yes", "no-need-counselled", "no-need-healthy"]),
  }),
});
