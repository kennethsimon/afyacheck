import { z } from "zod";

export const PatientInfoSchema = z.object({
  name: z.string().min(1, "Patient name is required"),
  gender: z.enum(["male", "female", "others"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Telephone number is required"),
  region: z.string().min(1, "region is required"),
  district: z.string().min(1, "district is required"),
  insurance: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

export const ScreeningQuestionsSchema = z.object({
  screening: z.object({
    patientIdentifier: z.string().min(1, "Patient Id is required"),
    illness: z.enum(["yes", "no", "dont-know"]),
    medication: z.enum(["yes", "no", "stopped"]),
    alcoholOrSmokeUsage: z.enum(["yes", "no", "stopped"]),
    chronicDiseases: z.enum(["yes", "no", "dont-know"]),
    vaccinationHistory: z.enum(["yes", "no", "ready", "refuse"]),
     // Height (cm)
     height: z.number().min(0, "Height must be a positive number").optional(),

     // Weight (kg)
     weight: z.number().min(0, "Weight must be a positive number").optional(),
 
     // BMI is calculated dynamically based on height and weight
     bmi: z.string().optional(), // Will be calculated in the client
 
     // Blood pressure with select options (low, normal, high)
     bloodPressure: z.enum(["low", "normal", "high"], {
       errorMap: () => ({ message: "Select a valid blood pressure option" }),
     }).optional(),
 
     // Hemoglobin (HB) status (low, normal, high)
     hb: z.enum(["low", "normal", "high"], {
       errorMap: () => ({ message: "Select a valid hemoglobin status" }),
     }).optional(),
 
  }),
});

export const ClinicalFindingsSchema = z.object({
  clinicalFindings: z.object({
    // Patient number (optional if it's included in the form)
    patientNumber: z.string().optional(),

    // TB Screening with dynamic medication status
    tbScreening: z.object({
      status: z.enum(["negative", "suspicious", "positive", "knownCase"], {
        errorMap: () => ({ message: "Select a valid TB screening status" }),
      }).optional(),
      medicationStatus: z.enum(["started", "notStarted", "onMedication", "notOnMedication"]).optional(),
    }).optional(),

    // Physio
    physioStatus: z.enum(["normal", "abnormal"]).optional().nullable(), // Optional, can be null if not selected

    // Physio Diagnosis (if abnormal)
    physioDiagnosis: z.string().optional().nullable(), // Optional, can be null if status is normal

    // Physio Referral Status
    physioReferral: z.enum(["referred", "not-referred", "given-medication"]).optional().nullable(),


    // Dental Screening Status
    dentalStatus: z.enum(["normal", "abnormal"]).optional().nullable(),

    // Dental Diagnosis (if abnormal)
    dentalDiagnosis: z.string().optional().nullable(),

    // Ophthalmology Status
    ophthalmologyStatus: z.enum(["normal", "abnormal"]).optional().nullable(),

    // Ophthalmology Diagnosis (if abnormal)
    ophthalmologyDiagnosis: z.string().optional().nullable(),

    // Ophthalmology Referral Status (if abnormal)
    ophthalmologyReferral: z.enum(["referred", "not-referred", "given-medication"]).optional().nullable(),

    // Orthopedic Status
    orthoStatus: z.enum(["normal", "abnormal"]).optional().nullable(),

    // Orthopedic Diagnosis (if abnormal)
    orthoDiagnosis: z.string().optional().nullable(),

    // Orthopedic Referral Status
    orthoReferral: z.enum(["referred", "not-referred", "given-medication"]).optional().nullable(),

    // Comments
    comments: z.string().optional(),

    // Prescription
    prescription: z.string().optional(),

    // Referral
    referral: z.string().optional(),

    // HIV Testing
    hivTesting: z.enum(["not-tested", "tested"], {
      errorMap: () => ({ message: "Select a valid HIV testing status" }),
    }).optional(),

    // HIV Result (only required if tested)
    hivResult: z.enum(["negative", "positive"]).optional().nullable(),

    // HIV Case (only applicable if HIV result is positive)
    hivCase: z.enum(["known-case", "new-case"]).optional().nullable(),

    // Known Case Medication Status (only applicable if HIV case is known-case)
    hivKnownCaseMedication: z.enum(["on-medication", "not-on-medication"]).optional().nullable(),

    // New Case Medication Status (only applicable if HIV case is new-case)
    hivNewCaseMedication: z.enum(["started", "not-started", "linked-to-care"]).optional().nullable(),

    // Preventive Measure
    preventiveMeasure: z.enum(["no", "yes", "education-and-counseling"]).optional(),

    // Preventive Measure Details (only applicable if preventive measure is yes)
    preventiveMeasureDetails: z.enum(["self-test-kit", "condom", "pep"]).optional().nullable(),

    // Education and Counseling Follow-Up (only applicable if preventive measure is education-and-counseling)
    educationCounseling: z.enum(["yes", "no"]).optional().nullable(),

    // Blood Donation
    bloodDonation: z.enum(["yes", "no", "not-reported"]).optional(),

    // Cancer Screening Type
    cancerScreening: z.enum(["breast-cancer", "cervical-cancer", "prostate-cancer"]).optional().nullable(),

    // Breast Cancer Status
    breastCancerStatus: z.enum(["normal", "suspicious"]).optional().nullable(),

    // Referred for Breast Cancer (if suspicious)
    breastCancerReferred: z.enum(["further-investigation", "not-referred"]).optional().nullable(),

    // Cervical Cancer Status
    cervicalCancerStatus: z.enum(["normal", "suspicious", "positive"]).optional().nullable(),

    // Referred for Cervical Cancer Treatment (if positive)
    cervicalCancerTreatment: z.enum(["referred-for-treatment", "not-referred"]).optional().nullable(),

    // Prostate Cancer Status
    prostateCancerStatus: z.enum(["normal", "suspicious", "positive"]).optional().nullable(),

    // Radiology Type
    radiologyType: z.enum(["echo", "ecg", "x-ray", "ultrasound"]).optional().nullable(),

    // Radiology Status
    echoStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
    ecgStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
    xrayStatus: z.enum(["normal", "abnormal"]).optional().nullable(),
    ultrasoundStatus: z.enum(["normal", "abnormal"]).optional().nullable(),

    // Diagnosis for each radiology test
    echoDiagnosis: z.string().optional().nullable(),
    ecgDiagnosis: z.string().optional().nullable(),
    xrayDiagnosis: z.string().optional().nullable(),
    ultrasoundDiagnosis: z.string().optional().nullable(),
  }),
});








export const DoctorCommentsSchema = z.object({
  doctorComments: z.object({
    patientIdentifier: z.string().min(1, "patient id  is required"),
    doctorsComment: z
      .string()
      .min(1, "Doctors comment and/or diagnosis is required"),
    prescription: z.string().min(1, "Prescription if any is required"),
  }),
});
