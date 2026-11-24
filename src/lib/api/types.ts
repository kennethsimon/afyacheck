export interface Project {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Camp {
  _id: string;
  name: string;
  description?: string;
  project: string | Project;
  projectDetails?: Project[];
  createdBy?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScreeningData {
  patientIdentifier?: string;
  illness?: string;
  medication?: string;
  alcoholOrSmokeUsage?: string;
  chronicDiseases?: string;
  vaccinationHistory?: string;
  height?: number;
  weight?: number;
  bmi?: string;
  bloodPressure?: string;
  hb?: string;
  [key: string]: unknown;
}

export interface ClinicalFindingsData {
  patientNumber?: string;
  tbScreening?: {
    status?: string;
    medicationStatus?: string;
    knownCaseMedication?: string;
  };
  physioStatus?: string | null;
  physioDiagnosis?: string | null;
  physioReferral?: string | null;
  dentalStatus?: string | null;
  dentalDiagnosis?: string | null;
  ophthalmologyStatus?: string | null;
  ophthalmologyDiagnosis?: string | null;
  ophthalmologyReferral?: string | null;
  orthoStatus?: string | null;
  orthoDiagnosis?: string | null;
  orthoReferral?: string | null;
  comments?: string;
  prescription?: string;
  referral?: string;
  hivTesting?: string;
  hivResult?: string | null;
  hivCase?: string | null;
  hivKnownCaseMedication?: string | null;
  hivNewCaseMedication?: string | null;
  preventiveMeasure?: string;
  preventiveMeasureDetails?: string | null;
  educationCounseling?: string | null;
  bloodDonation?: string;
  cancerScreening?: string | null;
  breastCancerStatus?: string | null;
  breastCancerReferred?: string | null;
  cervicalCancerStatus?: string | null;
  cervicalCancerTreatment?: string | null;
  prostateCancerStatus?: string | null;
  radiologyType?: string | null;
  echoStatus?: string | null;
  ecgStatus?: string | null;
  xrayStatus?: string | null;
  ultrasoundStatus?: string | null;
  echoDiagnosis?: string | null;
  ecgDiagnosis?: string | null;
  xrayDiagnosis?: string | null;
  ultrasoundDiagnosis?: string | null;
  // Legacy fields present on Patient.clinicalFindings
  height?: number;
  weight?: number;
  bmi?: number;
  bloodPressure?: string;
  rbgFbs?: string;
  bloodGroup?: string;
  cholesterol?: string;
  [key: string]: unknown;
}

export interface DoctorCommentsData {
  patientIdentifier?: string;
  doctorsComment?: string;
  prescription?: string;
  referral?: string;
  [key: string]: unknown;
}

export interface PatientRecord {
  _id: string;
  patientIdentifier?: string;
  name: string;
  gender: "male" | "female" | "others";
  dateOfBirth: string;
  phoneNumber: string;
  location?: string;
  region?: string;
  district?: string;
  address: string;
  insurance?: string;
  screening?: ScreeningData;
  clinicalFindings?: ClinicalFindingsData;
  doctorComments?: DoctorCommentsData;
  camp: string | Camp;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisRecord {
  _id: string;
  patientIdentifier: string;
  status: "pending" | "completed";
  screening?: ScreeningData;
  clinicalFindings?: ClinicalFindingsData;
  doctorComments?: DoctorCommentsData;
  camp: string | Camp;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRecord {
  _id: string;
  name: string;
  active: boolean;
}

export interface PermissionRecord {
  _id: string;
  name: string;
  active: boolean;
}

export interface UserRecord {
  _id: string;
  name: string;
  username: string;
  camp?: string | Camp | null;
  roles: RoleRecord[];
  permissions: PermissionRecord[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type FormFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "textarea"
  | "boolean"
  | "radio"
  | "checkbox";

export type FormFieldSection =
  | "patientInfo"
  | "screening"
  | "clinicalFindings"
  | "doctorComments"
  | "custom";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FormFieldRecord {
  _id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  order: number;
  section: FormFieldSection;
  project?: string;
  customProject?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSchemaSection {
  name: string;
  label: string;
  order: number;
  enabled: boolean;
  fields: string[];
}

export interface FormSchemaRecord {
  _id: string;
  project: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  fields: (FormFieldRecord | string)[];
  sections: FormSchemaSection[];
  createdAt?: string;
  updatedAt?: string;
}

export type FormSubmissionStatus = "draft" | "submitted" | "approved" | "rejected";

export interface FormSubmissionRecord {
  _id: string;
  project: string;
  formSchema: FormSchemaRecord | string;
  submittedBy: {
    _id: string | UserRecord;
    name: string;
    username?: string;
  };
  patient?: {
    _id?: string;
    name?: string;
    patientIdentifier?: string;
  };
  status: FormSubmissionStatus;
  responses: Record<string, unknown>;
  notes?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormAnalyticsDashboard {
  totalSubmissions: number;
  submittedCount: number;
  approvedCount: number;
  rejectedCount: number;
  draftCount: number;
  totalSchemas: number;
  activeSchemas: number;
}

export interface WellnessQuestion {
  _id: string;
  question_text: string;
  options: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WellnessAnswer {
  question: string | { _id: string; question_text: string };
  answer: string;
}

export interface WellnessResponseRecord {
  _id: string;
  user: {
    name: string;
    date: string;
    education_level: string;
    age: number;
    gender: string;
  };
  answers: WellnessAnswer[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WellnessResponseDetail {
  response: WellnessResponseRecord;
  total_score: number;
  mental_status: string;
}

export interface CampStats {
  attended: number;
  male: number;
  female: number;
  others: number;
  children: number;
  teenagers: number;
  adults: number;
  seniors: number;
  newPatientsToday: number;
  newPatientsThisWeek: number;
  newPatientsThisMonth: number;
  newPatientsThisYear: number;
  prevNewPatientsToday: number;
  prevNewPatientsThisWeek: number;
  prevNewPatientsThisMonth: number;
  prevNewPatientsThisYear: number;
}

export interface CampAnalytics {
  attended: number;
  male: number;
  female: number;
  children: number;
  teenagers: number;
  adults: number;
  seniors: number;
  withInsurance: number;
  withoutInsurance: number;
  newPatientsOverTime: { date: string; count: number }[];
  hivTested: number;
  hivPositive: number;
  hivNegative: number;
  tbPositive: number;
  tbNegative: number;
  cancerScreened: number;
  breastCancerScreened: number;
  cervicalCancerScreened: number;
  prostateCancerScreened: number;
  preventiveMeasures: number;
  bloodDonation: number;
  physioAbnormal: number;
  dentalAbnormal: number;
  ophthalmologyAbnormal: number;
  orthoAbnormal: number;
  echoAbnormal: number;
  ecgAbnormal: number;
  xrayAbnormal: number;
  ultrasoundAbnormal: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  pageCount: number;
  page: number;
  limit: number;
}
