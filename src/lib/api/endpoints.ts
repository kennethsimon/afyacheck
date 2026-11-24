import { apiRequest, type QueryParamValue } from "./client";
import type {
  Camp,
  CampAnalytics,
  CampStats,
  DiagnosisRecord,
  FormAnalyticsDashboard,
  FormFieldRecord,
  FormSchemaRecord,
  FormSubmissionRecord,
  FormSubmissionStatus,
  PaginatedResult,
  PatientRecord,
  PermissionRecord,
  Project,
  RoleRecord,
  UserRecord,
  WellnessQuestion,
  WellnessResponseDetail,
  WellnessResponseRecord,
} from "./types";

// ---------------------------------------------------------------------------
// Projects & Custom Projects
// ---------------------------------------------------------------------------

export async function listProjects(
  params?: { active?: boolean; page?: number; limit?: number },
  signal?: AbortSignal
): Promise<{ projects: Project[]; count: number }> {
  const res = await apiRequest<any>("/projects", {
    params: {
      active: params?.active === true ? "true" : undefined,
      page: params?.page,
      limit: params?.limit,
    },
    signal,
  });
  return {
    projects: res?.data?.projects ?? [],
    count: res?.data?.count ?? (res?.data?.projects?.length ?? 0),
  };
}

export async function getProject(
  projectId: string,
  signal?: AbortSignal
): Promise<Project | null> {
  const res = await apiRequest<any>(`/projects/${projectId}`, { signal });
  return res?.data?.project ?? null;
}

export async function createProject(payload: {
  name: string;
  description?: string;
  active?: boolean;
}): Promise<Project> {
  const res = await apiRequest<any>("/projects", {
    method: "POST",
    body: payload,
  });
  return res?.project ?? res?.data?.project;
}

export async function updateProject(
  projectId: string,
  payload: Partial<Pick<Project, "name" | "description" | "active">>
): Promise<void> {
  await apiRequest(`/projects/edit/${projectId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteProject(projectId: string): Promise<{
  deletedCamps?: number;
  projectId?: string;
}> {
  const res = await apiRequest<any>(`/projects/${projectId}`, {
    method: "DELETE",
  });
  return {
    deletedCamps: res?.deletedCamps,
    projectId: res?.projectId ?? projectId,
  };
}

export async function listCustomProjects(
  signal?: AbortSignal
): Promise<Project[]> {
  const res = await apiRequest<any>("/custom-projects", { signal });
  return res?.data?.customProjects ?? [];
}

export async function createCustomProject(payload: {
  name: string;
  description?: string;
}): Promise<Project> {
  const res = await apiRequest<any>("/custom-projects", {
    method: "POST",
    body: payload,
  });
  return res?.customProject ?? res?.project;
}

// ---------------------------------------------------------------------------
// Camps
// ---------------------------------------------------------------------------

/**
 * Always uses `/camps/project/:id` (`id="all"` or projectId) because
 * `atosclone`'s `GET /camps` filter builder sets `filters.camp` on the Camp model.
 */
export async function listCamps(
  projectId?: string,
  signal?: AbortSignal
): Promise<{ camps: Camp[]; count: number }> {
  const target = projectId && projectId !== "all" ? projectId : "all";
  const res = await apiRequest<any>(`/camps/project/${target}`, { signal });
  const camps: Camp[] = res?.data?.camps ?? [];
  return {
    camps,
    count: res?.data?.count ?? camps.length,
  };
}

export async function getCamp(
  campId: string,
  signal?: AbortSignal
): Promise<Camp | null> {
  const res = await apiRequest<any>(`/camps/camp/${campId}`, { signal });
  return res?.data?.camp ?? null;
}

export async function createCamp(payload: {
  name: string;
  description?: string;
  project: string;
  createdBy?: string;
}): Promise<Camp> {
  const res = await apiRequest<any>("/camps", {
    method: "POST",
    body: payload,
  });
  return res?.camp ?? res?.data?.camp;
}

export async function updateCamp(
  campId: string,
  payload: Partial<Pick<Camp, "name" | "description" | "active">>
): Promise<void> {
  await apiRequest(`/camps/${campId}`, {
    method: "PUT",
    body: payload,
  });
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export interface PatientListParams {
  projectId?: string;
  campId?: string;
  name?: string;
  phoneNumber?: string;
  gender?: string;
  insurance?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function listPatients(
  params: PatientListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResult<PatientRecord>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  // Backend requires projectId whenever campId is omitted or "all".
  const projectId = params.projectId || "all";
  const campId = params.campId && params.campId !== "all" ? params.campId : "all";

  const query: Record<string, QueryParamValue> = {
    projectId,
    campId,
    name: params.name,
    phoneNumber: params.phoneNumber,
    gender: params.gender && params.gender !== "all" ? params.gender : undefined,
    insurance: params.insurance,
    location: params.location,
    "createdAt-from": params.dateFrom,
    "createdAt-to": params.dateTo,
    sortBy: params.sortBy,
    order: params.order,
    page,
    limit,
    per_page: limit,
  };

  const res = await apiRequest<any>("/patients", { params: query, signal });
  const items: PatientRecord[] = res?.data?.patients ?? [];
  const total: number = res?.data?.count ?? items.length;
  const pageCount: number =
    res?.data?.pageCount ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { items, total, pageCount, page, limit };
}

/**
 * Fetches full matching patient dataset across pages (capped defensively) for authorized exports.
 */
export async function fetchAllMatchingPatients(
  params: Omit<PatientListParams, "page" | "limit">,
  signal?: AbortSignal
): Promise<PatientRecord[]> {
  const first = await listPatients({ ...params, page: 1, limit: 250 }, signal);
  const all = [...first.items];
  const maxPages = Math.min(first.pageCount, 40);
  for (let p = 2; p <= maxPages; p++) {
    const next = await listPatients({ ...params, page: p, limit: 250 }, signal);
    all.push(...next.items);
  }
  return all;
}

export async function getPatient(
  patientId: string,
  signal?: AbortSignal
): Promise<PatientRecord | null> {
  const res = await apiRequest<any>(`/patients/${patientId}`, { signal });
  return res?.data?.patient ?? null;
}

export async function createPatient(payload: {
  name: string;
  gender: "male" | "female" | "others";
  dateOfBirth: string;
  phoneNumber: string;
  region?: string;
  district?: string;
  location?: string;
  address: string;
  insurance?: string;
  camp: string;
  createdBy: string;
  [key: string]: unknown;
}): Promise<PatientRecord> {
  const res = await apiRequest<any>("/patients", {
    method: "POST",
    body: payload,
  });
  return res?.patient ?? res?.data?.patient;
}

/**
 * `atosclone`'s `PUT /patients/:id` Joi schema accepts only specific fields
 * and rejects `region`, `district`, and extended screening keys. We map
 * `region`/`district` into `location` cleanly so updates never fail validation.
 */
export async function updatePatient(
  patientId: string,
  payload: {
    name?: string;
    gender?: "male" | "female" | "others";
    dateOfBirth?: string;
    phoneNumber?: string;
    location?: string;
    region?: string;
    district?: string;
    address?: string;
    insurance?: string;
  }
): Promise<PatientRecord> {
  const locationValue =
    payload.location ||
    [payload.region, payload.district].filter(Boolean).join(", ") ||
    undefined;

  const safeBody: Record<string, unknown> = {};
  if (payload.name !== undefined) safeBody.name = payload.name;
  if (payload.gender !== undefined) safeBody.gender = payload.gender;
  if (payload.dateOfBirth !== undefined) safeBody.dateOfBirth = payload.dateOfBirth;
  if (payload.phoneNumber !== undefined) safeBody.phoneNumber = payload.phoneNumber;
  if (locationValue !== undefined) safeBody.location = locationValue;
  if (payload.address !== undefined) safeBody.address = payload.address;
  if (payload.insurance !== undefined) safeBody.insurance = payload.insurance;

  const res = await apiRequest<any>(`/patients/${patientId}`, {
    method: "PUT",
    body: safeBody,
  });
  return res?.patient ?? res?.data?.patient;
}

// ---------------------------------------------------------------------------
// Clinical Screening & Diagnosis
// ---------------------------------------------------------------------------

export interface DiagnosisListParams {
  projectId?: string;
  campId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function listDiagnoses(
  params: DiagnosisListParams = {},
  signal?: AbortSignal
): Promise<PaginatedResult<DiagnosisRecord>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const projectId = params.projectId || "all";
  const campId = params.campId && params.campId !== "all" ? params.campId : "all";

  const res = await apiRequest<any>("/patients/diagnosis", {
    params: {
      projectId,
      campId,
      "createdAt-from": params.dateFrom,
      "createdAt-to": params.dateTo,
      sortBy: params.sortBy,
      order: params.order,
      page,
      limit,
      per_page: limit,
    },
    signal,
  });

  const items: DiagnosisRecord[] = res?.data?.diagnoses ?? [];
  const total: number = res?.data?.count ?? items.length;
  const pageCount: number =
    res?.data?.pageCount ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return { items, total, pageCount, page, limit };
}

export async function upsertDiagnosis(payload: {
  patientIdentifier: string;
  camp: string;
  createdBy: string;
  status?: "pending" | "completed";
  screening?: Record<string, unknown> | null;
  clinicalFindings?: Record<string, unknown> | null;
  doctorComments?: Record<string, unknown> | null;
}): Promise<DiagnosisRecord> {
  const res = await apiRequest<any>("/patients/diagnosis", {
    method: "POST",
    body: payload,
  });
  return res?.diagnosis ?? res?.data?.diagnosis;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface AnalyticsQueryParams {
  projectId?: string;
  campId?: string;
  dateFrom?: string;
  dateTo?: string;
  gender?: string;
  location?: string;
  insurance?: string;
}

export async function getCampStats(
  params: AnalyticsQueryParams = {},
  signal?: AbortSignal
): Promise<CampStats | null> {
  const res = await apiRequest<any>("/camps/camp-stats/stats", {
    params: {
      projectId: params.projectId || "all",
      campId: params.campId || "all",
      "createdAt-from": params.dateFrom,
      "createdAt-to": params.dateTo,
      gender: params.gender && params.gender !== "all" ? params.gender : undefined,
      location: params.location,
      insurance: params.insurance,
    },
    signal,
  });
  return res?.data?.stats ?? null;
}

export async function getCampAnalytics(
  params: AnalyticsQueryParams = {},
  signal?: AbortSignal
): Promise<CampAnalytics | null> {
  const res = await apiRequest<any>("/camps/camp-stats/analytics", {
    params: {
      projectId: params.projectId || "all",
      campId: params.campId || "all",
      "createdAt-from": params.dateFrom,
      "createdAt-to": params.dateTo,
      gender: params.gender && params.gender !== "all" ? params.gender : undefined,
      location: params.location,
      insurance: params.insurance,
    },
    signal,
  });
  return res?.data?.stats ?? null;
}

export async function getFormAnalyticsDashboard(
  projectId: string,
  params?: { status?: string; limit?: number },
  signal?: AbortSignal
): Promise<FormAnalyticsDashboard> {
  const res = await apiRequest<any>(`/form-analytics/dashboard/${projectId}`, {
    params: {
      status: params?.status,
      // Pass a high limit so backend's default limit=50 does not truncate aggregates
      limit: params?.limit ?? 10000,
    },
    signal,
  });
  return (
    res?.dashboard ?? {
      totalSubmissions: 0,
      submittedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      draftCount: 0,
      totalSchemas: 0,
      activeSchemas: 0,
    }
  );
}

// ---------------------------------------------------------------------------
// Dynamic Forms (Fields, Schemas, Submissions)
// ---------------------------------------------------------------------------

export async function listFormFields(
  projectId?: string,
  signal?: AbortSignal
): Promise<FormFieldRecord[]> {
  const res = await apiRequest<any>("/form-fields", {
    params: projectId ? { project: projectId } : undefined,
    signal,
  });
  return res?.data?.formFields ?? [];
}

export async function createFormField(
  payload: Omit<FormFieldRecord, "_id" | "createdAt" | "updatedAt">
): Promise<FormFieldRecord> {
  const res = await apiRequest<any>("/form-fields", {
    method: "POST",
    body: payload,
  });
  return res?.data?.formField ?? res?.formField;
}

export async function updateFormField(
  fieldId: string,
  payload: Partial<Omit<FormFieldRecord, "_id">>
): Promise<void> {
  await apiRequest(`/form-fields/${fieldId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteFormField(fieldId: string): Promise<void> {
  await apiRequest(`/form-fields/${fieldId}`, { method: "DELETE" });
}

export async function listFormSchemas(
  projectId?: string,
  includeInactive = true,
  signal?: AbortSignal
): Promise<FormSchemaRecord[]> {
  const res = await apiRequest<any>("/form-schemas", {
    params: {
      project: projectId && projectId !== "all" ? projectId : undefined,
      includeInactive: includeInactive ? "true" : undefined,
    },
    signal,
  });
  return res?.schemas ?? res?.data?.schemas ?? [];
}

export async function getFormSchema(
  schemaId: string,
  signal?: AbortSignal
): Promise<FormSchemaRecord | null> {
  const res = await apiRequest<any>(`/form-schemas/${schemaId}`, { signal });
  return res?.schema ?? res?.data?.schema ?? null;
}

export async function createFormSchema(payload: {
  project: string;
  name: string;
  description?: string;
  isActive?: boolean;
  fields?: string[];
  sections?: FormSchemaRecord["sections"];
}): Promise<FormSchemaRecord> {
  const res = await apiRequest<any>("/form-schemas", {
    method: "POST",
    body: payload,
  });
  return res?.schema ?? res?.data?.schema;
}

export async function updateFormSchema(
  schemaId: string,
  payload: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    fields: string[];
    sections: FormSchemaRecord["sections"];
  }>
): Promise<FormSchemaRecord> {
  const res = await apiRequest<any>(`/form-schemas/${schemaId}`, {
    method: "PUT",
    body: payload,
  });
  return res?.schema ?? res?.data?.schema;
}

export async function deleteFormSchema(schemaId: string): Promise<void> {
  await apiRequest(`/form-schemas/${schemaId}`, { method: "DELETE" });
}

export async function listFormSubmissions(
  params: {
    project?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
  signal?: AbortSignal
): Promise<PaginatedResult<FormSubmissionRecord>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  const res = await apiRequest<any>("/form-submissions", {
    params: {
      project: params.project && params.project !== "all" ? params.project : undefined,
      status: params.status && params.status !== "all" ? params.status : undefined,
      page,
      limit,
    },
    signal,
  });
  const items: FormSubmissionRecord[] = res?.submissions ?? [];
  const total: number = res?.total ?? items.length;
  return {
    items,
    total,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / Math.max(1, limit))),
  };
}

export async function getFormSubmission(
  submissionId: string,
  signal?: AbortSignal
): Promise<FormSubmissionRecord | null> {
  const res = await apiRequest<any>(`/form-submissions/${submissionId}`, { signal });
  return res?.submission ?? null;
}

export async function createFormSubmission(payload: {
  project: string;
  formSchema: string;
  submittedBy: { _id: string; name: string; username?: string };
  patient?: { _id?: string; name?: string; patientIdentifier?: string };
  status?: FormSubmissionStatus;
  responses: Record<string, unknown>;
  notes?: string;
}): Promise<FormSubmissionRecord> {
  const res = await apiRequest<any>("/form-submissions", {
    method: "POST",
    body: payload,
  });
  return res?.submission;
}

export async function updateFormSubmissionStatus(
  submissionId: string,
  payload: { status: FormSubmissionStatus; notes?: string }
): Promise<FormSubmissionRecord> {
  const res = await apiRequest<any>(`/form-submissions/${submissionId}/status`, {
    method: "PATCH",
    body: payload,
  });
  return res?.submission;
}

// ---------------------------------------------------------------------------
// Wellness (Mental Health)
// ---------------------------------------------------------------------------

export async function listWellnessQuestions(
  signal?: AbortSignal
): Promise<WellnessQuestion[]> {
  const res = await apiRequest<any>("/questions", { signal });
  return res?.data?.questions ?? [];
}

export async function createWellnessQuestion(payload: {
  question_text: string;
  options: string[];
}): Promise<WellnessQuestion> {
  const res = await apiRequest<any>("/questions", {
    method: "POST",
    body: payload,
  });
  return res?.question;
}

export async function listWellnessResponses(
  params?: { page?: number; limit?: number },
  signal?: AbortSignal
): Promise<{ responses: WellnessResponseRecord[]; count: number }> {
  const res = await apiRequest<any>("/responses", {
    params: {
      page: params?.page,
      limit: params?.limit,
    },
    signal,
  });
  const responses: WellnessResponseRecord[] = res?.data?.responses ?? [];
  return {
    responses,
    count: res?.data?.count ?? responses.length,
  };
}

export async function getWellnessResponse(
  id: string,
  signal?: AbortSignal
): Promise<WellnessResponseDetail | null> {
  const res = await apiRequest<any>(`/responses/${id}`, { signal });
  if (!res?.data?.response) return null;
  return {
    response: res.data.response,
    total_score: res.data.total_score ?? 0,
    mental_status: res.data.mental_status ?? "Unscored",
  };
}

export async function createWellnessResponse(payload: {
  user: {
    name: string;
    date: string;
    education_level: string;
    age: number;
    gender: string;
  };
  answers: { question: string; answer: string }[];
}): Promise<WellnessResponseRecord> {
  const res = await apiRequest<any>("/responses", {
    method: "POST",
    body: payload,
  });
  return res?.response;
}

// ---------------------------------------------------------------------------
// Team & Access (Users, Roles, Permissions)
// ---------------------------------------------------------------------------

export async function listUsers(
  params?: { active?: boolean; page?: number; limit?: number },
  signal?: AbortSignal
): Promise<{ users: UserRecord[]; count: number }> {
  const res = await apiRequest<any>("/auth/admin", {
    params: {
      active: params?.active === true ? "true" : undefined,
      page: params?.page,
      limit: params?.limit,
    },
    signal,
  });
  const users: UserRecord[] = res?.data?.users ?? [];
  return {
    users,
    count: res?.data?.count ?? users.length,
  };
}

export async function getUser(
  userId: string,
  signal?: AbortSignal
): Promise<UserRecord | null> {
  const res = await apiRequest<any>(`/auth/admin/${userId}`, { signal });
  return res?.data?.user ?? null;
}

export async function createUser(payload: {
  name: string;
  username: string;
  password: string;
  camp?: string;
  roles: string[];
  permissions: string[];
}): Promise<void> {
  await apiRequest("/auth/user", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(
  userId: string,
  payload: {
    name?: string;
    username?: string;
    password?: string;
    camp?: string;
    roles?: string[];
    permissions?: string[];
    active?: boolean;
  }
): Promise<UserRecord | null> {
  const res = await apiRequest<any>(`/auth/admin/${userId}`, {
    method: "PUT",
    body: payload,
  });
  return res?.data?.user ?? null;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiRequest(`/auth/admin/${userId}`, { method: "DELETE" });
}

export async function listRolesAndPermissions(
  signal?: AbortSignal
): Promise<{ roles: RoleRecord[]; permissions: PermissionRecord[] }> {
  const res = await apiRequest<any>("/auth/roles", { signal });
  return {
    roles: res?.data?.roles ?? [],
    permissions: res?.data?.permissions ?? [],
  };
}

// ---------------------------------------------------------------------------
// Institutional Structured Reporting (Backend Source of Truth)
// ---------------------------------------------------------------------------

import type {
  PatientClinicalReportPayload,
  ReportTypeId,
  StructuredReportPayload,
} from "@/lib/reports/types";

export interface StructuredReportQueryParams {
  type: ReportTypeId;
  projectId?: string;
  campId?: string;
  schemaId?: string;
  dateFrom?: string;
  dateTo?: string;
  gender?: string;
  insurance?: string;
  location?: string;
}

export async function generateStructuredReport(
  params: StructuredReportQueryParams,
  signal?: AbortSignal
): Promise<StructuredReportPayload> {
  const res = await apiRequest<any>("/reports/generate", {
    params: {
      type: params.type,
      projectId: params.projectId && params.projectId !== "all" ? params.projectId : undefined,
      campId: params.campId && params.campId !== "all" ? params.campId : undefined,
      schemaId: params.schemaId && params.schemaId !== "all" ? params.schemaId : undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      gender: params.gender && params.gender !== "all" ? params.gender : undefined,
      insurance: params.insurance && params.insurance !== "all" ? params.insurance : undefined,
      location: params.location || undefined,
    },
    signal,
  });
  return res?.data as StructuredReportPayload;
}

export async function generatePatientClinicalReport(
  patientId: string,
  signal?: AbortSignal
): Promise<PatientClinicalReportPayload> {
  const res = await apiRequest<any>(`/reports/patient/${patientId}`, { signal });
  return res?.data as PatientClinicalReportPayload;
}
