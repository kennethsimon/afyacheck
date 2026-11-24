"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import * as api from "./endpoints";
import type {
  AnalyticsQueryParams,
  DiagnosisListParams,
  PatientListParams,
} from "./endpoints";

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function useProjects(params?: { active?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: ({ signal }) => api.listProjects(params, signal),
  });
}

export function useCustomProjects() {
  return useQuery({
    queryKey: queryKeys.projects.custom(),
    queryFn: ({ signal }) => api.listCustomProjects(signal),
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId || ""),
    queryFn: ({ signal }) => api.getProject(projectId!, signal),
    enabled: Boolean(projectId && projectId !== "all"),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useCreateCustomProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCustomProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateProject>[1]) =>
      api.updateProject(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.invalidateQueries({ queryKey: queryKeys.camps.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Camps
// ---------------------------------------------------------------------------

export function useCamps(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.camps.byProject(projectId || "all"),
    queryFn: ({ signal }) => api.listCamps(projectId, signal),
  });
}

export function useCamp(campId?: string) {
  return useQuery({
    queryKey: queryKeys.camps.detail(campId || ""),
    queryFn: ({ signal }) => api.getCamp(campId!, signal),
    enabled: Boolean(campId && campId !== "all"),
  });
}

export function useCreateCamp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCamp,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.camps.all });
    },
  });
}

export function useUpdateCamp(campId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateCamp>[1]) =>
      api.updateCamp(campId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.camps.all });
      qc.invalidateQueries({ queryKey: queryKeys.camps.detail(campId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export function usePatients(params: PatientListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.patients.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => api.listPatients(params, signal),
    enabled,
  });
}

export function usePatient(patientId?: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(patientId || ""),
    queryFn: ({ signal }) => api.getPatient(patientId!, signal),
    enabled: Boolean(patientId),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdatePatient(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updatePatient>[1]) =>
      api.updatePatient(patientId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
    },
  });
}

// ---------------------------------------------------------------------------
// Diagnoses / Clinical
// ---------------------------------------------------------------------------

export function useDiagnoses(params: DiagnosisListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.diagnoses.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => api.listDiagnoses(params, signal),
    enabled,
  });
}

export function useUpsertDiagnosis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.upsertDiagnosis,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.diagnoses.all });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export function useCampStats(params: AnalyticsQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analytics.stats(params as Record<string, unknown>),
    queryFn: ({ signal }) => api.getCampStats(params, signal),
    enabled,
  });
}

export function useCampAnalytics(params: AnalyticsQueryParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analytics.camp(params as Record<string, unknown>),
    queryFn: ({ signal }) => api.getCampAnalytics(params, signal),
    enabled,
  });
}

export function useFormAnalyticsDashboard(projectId?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.customForm(projectId || ""),
    queryFn: ({ signal }) => api.getFormAnalyticsDashboard(projectId!, undefined, signal),
    enabled: Boolean(projectId && projectId !== "all"),
  });
}

// ---------------------------------------------------------------------------
// Dynamic Forms
// ---------------------------------------------------------------------------

export function useFormFields(projectId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.forms.fields(projectId),
    queryFn: ({ signal }) => api.listFormFields(projectId, signal),
    enabled,
  });
}

export function useCreateFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createFormField,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useUpdateFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateFormField>[1] }) =>
      api.updateFormField(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useDeleteFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFormField,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useFormSchemas(projectId?: string, includeInactive = true) {
  return useQuery({
    queryKey: queryKeys.forms.schemas(projectId, includeInactive),
    queryFn: ({ signal }) => api.listFormSchemas(projectId, includeInactive, signal),
  });
}

export function useFormSchema(schemaId?: string) {
  return useQuery({
    queryKey: queryKeys.forms.schema(schemaId || ""),
    queryFn: ({ signal }) => api.getFormSchema(schemaId!, signal),
    enabled: Boolean(schemaId),
  });
}

export function useCreateFormSchema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createFormSchema,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

export function useUpdateFormSchema(schemaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateFormSchema>[1]) =>
      api.updateFormSchema(schemaId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
      qc.invalidateQueries({ queryKey: queryKeys.forms.schema(schemaId) });
    },
  });
}

export function useDeleteFormSchema() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFormSchema,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useFormSubmissions(
  params: Parameters<typeof api.listFormSubmissions>[0] = {},
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.forms.submissions(params as Record<string, unknown>),
    queryFn: ({ signal }) => api.listFormSubmissions(params, signal),
    enabled,
  });
}

export function useCreateFormSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createFormSubmission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useUpdateFormSubmissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof api.updateFormSubmissionStatus>[1];
    }) => api.updateFormSubmissionStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.forms.all });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Wellness
// ---------------------------------------------------------------------------

export function useWellnessQuestions() {
  return useQuery({
    queryKey: queryKeys.wellness.questions(),
    queryFn: ({ signal }) => api.listWellnessQuestions(signal),
  });
}

export function useCreateWellnessQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createWellnessQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wellness.questions() });
    },
  });
}

export function useWellnessResponses(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.wellness.responses(params),
    queryFn: ({ signal }) => api.listWellnessResponses(params, signal),
  });
}

export function useWellnessResponse(id?: string) {
  return useQuery({
    queryKey: queryKeys.wellness.response(id || ""),
    queryFn: ({ signal }) => api.getWellnessResponse(id!, signal),
    enabled: Boolean(id),
  });
}

export function useCreateWellnessResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createWellnessResponse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wellness.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Users & Access
// ---------------------------------------------------------------------------

export function useUsers(params?: { active?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: ({ signal }) => api.listUsers(params, signal),
  });
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId || ""),
    queryFn: ({ signal }) => api.getUser(userId!, signal),
    enabled: Boolean(userId),
  });
}

export function useRolesAndPermissions() {
  return useQuery({
    queryKey: queryKeys.users.roles(),
    queryFn: ({ signal }) => api.listRolesAndPermissions(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof api.updateUser>[1]) =>
      api.updateUser(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Structured Reports
// ---------------------------------------------------------------------------

export function useStructuredReport(
  params: api.StructuredReportQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.reports.structured(params as unknown as Record<string, unknown>),
    queryFn: ({ signal }) => api.generateStructuredReport(params, signal),
    enabled,
  });
}
