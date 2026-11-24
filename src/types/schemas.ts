import { z } from "zod";

export const PATIENT_ID_REGEX = /^AC\d{12}$/;

export const ProjectFormSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters"),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  active: z.boolean().optional(),
});

export const CampFormSchema = z.object({
  name: z.string().trim().min(2, "Camp name must be at least 2 characters"),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  project: z.string().min(1, "Parent project is required"),
  active: z.boolean().optional(),
});

export const PatientInfoSchema = z
  .object({
    name: z.string().trim().min(2, "Patient full name is required"),
    gender: z.enum(["male", "female", "others"], {
      errorMap: () => ({ message: "Select a valid gender" }),
    }),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => {
        const d = new Date(val);
        return !Number.isNaN(d.getTime()) && d <= new Date();
      }, "Date of birth cannot be in the future"),
    phoneNumber: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20, "Phone number is too long"),
    region: z.string().trim().min(1, "Region is required"),
    district: z.string().trim().min(1, "District is required"),
    insurance: z.string().trim().optional(),
    address: z.string().trim().min(2, "Residential address is required"),
    camp: z.string().optional(),
  })
  .passthrough();

export const ScreeningQuestionsSchema = z.object({
  screening: z
    .object({
      patientIdentifier: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, "Patient ID is required")
        .regex(
          PATIENT_ID_REGEX,
          "Patient ID must start with AC followed by exactly 12 digits"
        ),
      illness: z.enum(["yes", "no", "dont-know"]).optional(),
      medication: z.enum(["yes", "no", "stopped"]).optional(),
      alcoholOrSmokeUsage: z.enum(["yes", "no", "stopped"]).optional(),
      chronicDiseases: z.enum(["yes", "no", "dont-know"]).optional(),
      vaccinationHistory: z.enum(["yes", "no", "ready", "refuse"]).optional(),
      height: z
        .preprocess(
          (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
          z
            .number()
            .min(30, "Height must be at least 30 cm")
            .max(260, "Height must be at most 260 cm")
            .optional()
        ),
      weight: z
        .preprocess(
          (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
          z
            .number()
            .min(1, "Weight must be at least 1 kg")
            .max(350, "Weight must be at most 350 kg")
            .optional()
        ),
      bmi: z.string().optional(),
      bloodPressure: z
        .enum(["low", "normal", "high"], {
          errorMap: () => ({ message: "Select a valid blood pressure classification" }),
        })
        .optional(),
      hb: z
        .enum(["low", "normal", "high"], {
          errorMap: () => ({ message: "Select a valid hemoglobin status" }),
        })
        .optional(),
    })
    .passthrough(),
});

export const ClinicalFindingsSchema = z.object({
  clinicalFindings: z
    .object({
      patientNumber: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, "Patient ID is required")
        .regex(
          PATIENT_ID_REGEX,
          "Patient ID must start with AC followed by exactly 12 digits"
        ),
      tbScreening: z
        .object({
          status: z.enum(["negative", "suspicious", "positive", "knownCase"]).optional(),
          medicationStatus: z
            .enum(["started", "notStarted", "onMedication", "notOnMedication"])
            .optional(),
        })
        .optional(),
      physioStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      physioDiagnosis: z.string().optional().nullable(),
      physioReferral: z
        .enum(["referred", "not-referred", "given-medication"])
        .optional()
        .nullable(),
      dentalStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      dentalDiagnosis: z.string().optional().nullable(),
      ophthalmologyStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      ophthalmologyDiagnosis: z.string().optional().nullable(),
      ophthalmologyReferral: z
        .enum(["referred", "not-referred", "given-medication"])
        .optional()
        .nullable(),
      orthoStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      orthoDiagnosis: z.string().optional().nullable(),
      orthoReferral: z
        .enum(["referred", "not-referred", "given-medication"])
        .optional()
        .nullable(),
      comments: z.string().optional(),
      prescription: z.string().optional(),
      referral: z.string().optional(),
      hivTesting: z.enum(["not-tested", "tested"]).optional(),
      hivResult: z.enum(["negative", "positive"]).optional().nullable(),
      hivCase: z.enum(["known-case", "new-case"]).optional().nullable(),
      hivKnownCaseMedication: z
        .enum(["on-medication", "not-on-medication"])
        .optional()
        .nullable(),
      hivNewCaseMedication: z
        .enum(["started", "not-started", "linked-to-care"])
        .optional()
        .nullable(),
      preventiveMeasure: z
        .enum(["no", "yes", "education-and-counseling"])
        .optional(),
      preventiveMeasureDetails: z
        .enum(["self-test-kit", "condom", "pep"])
        .optional()
        .nullable(),
      educationCounseling: z.enum(["yes", "no"]).optional().nullable(),
      bloodDonation: z.enum(["yes", "no", "not-reported"]).optional(),
      cancerScreening: z
        .enum(["breast-cancer", "cervical-cancer", "prostate-cancer"])
        .optional()
        .nullable(),
      breastCancerStatus: z.enum(["normal", "suspicious"]).optional().nullable(),
      breastCancerReferred: z
        .enum(["further-investigation", "not-referred"])
        .optional()
        .nullable(),
      cervicalCancerStatus: z
        .enum(["normal", "suspicious", "positive"])
        .optional()
        .nullable(),
      cervicalCancerTreatment: z
        .enum(["referred-for-treatment", "not-referred"])
        .optional()
        .nullable(),
      prostateCancerStatus: z
        .enum(["normal", "suspicious", "positive"])
        .optional()
        .nullable(),
      radiologyType: z
        .enum(["echo", "ecg", "x-ray", "ultrasound"])
        .optional()
        .nullable(),
      echoStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      ecgStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      xrayStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      ultrasoundStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
      echoDiagnosis: z.string().optional().nullable(),
      ecgDiagnosis: z.string().optional().nullable(),
      xrayDiagnosis: z.string().optional().nullable(),
      ultrasoundDiagnosis: z.string().optional().nullable(),
    })
    .passthrough(),
});

export const DoctorCommentsSchema = z.object({
  doctorComments: z
    .object({
      patientIdentifier: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, "Patient ID is required")
        .regex(
          PATIENT_ID_REGEX,
          "Patient ID must start with AC followed by exactly 12 digits"
        ),
      doctorsComment: z
        .string()
        .trim()
        .min(1, "Doctor's clinical assessment or notes are required"),
      prescription: z
        .string()
        .trim()
        .min(1, "Prescription or management plan is required (enter 'None' if none)"),
    })
    .passthrough(),
});

export const UserCreateSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  camp: z.string().optional(),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export const UserUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.length >= 6,
      "New password must be at least 6 characters"
    ),
  camp: z.string().optional(),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
  active: z.boolean().optional(),
});
