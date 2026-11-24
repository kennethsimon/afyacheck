"use server";

import backend from "@/app/api/auth/[...nextauth]/backend";
import { unstable_noStore as noStore } from "next/cache";

export const getProjects = async () => {
  noStore();
  const results: any = {};
  try {
    const { data } = await backend.get("/projects");
    if (data?.status) {
      results.items = data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const getProjectById = async (projectId: string) => {
  noStore();
  const results: any = {};
  try {
    const { data } = await backend.get(`/projects/${projectId}`);
    if (data?.status) {
      results.items = data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const deleteProject = async (projectId: string) => {
  const { data } = await backend.delete(`/projects/${projectId}`);
  return data;
};

export const getAddPatientFormPermissions = async () => ({
  PatientInfo: true,
  ScreeningQuestions: true,
  ClinicalFindings: true,
  DoctorComments: true,
});

export const getPermissions = async () => {
  noStore();
  const results: any = {};
  try {
    const { data } = await backend.get("/auth/roles");
    if (data?.status) {
      results.items = data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const getPatients = async (
  queryParams?: Record<string, any>
): Promise<{ data: any[]; pageCount: number; count?: number }> => {
  noStore();
  const results = { data: [] as any[], pageCount: 0, count: 0 };
  try {
    const params = {
      projectId: queryParams?.projectId || "all",
      campId: queryParams?.campId || "all",
      ...queryParams,
    };
    const { data } = await backend.get("/patients", { params });
    if (data?.status && data?.data) {
      results.data = data.data.patients || [];
      results.pageCount = data.data.pageCount || 0;
      results.count = data.data.count || results.data.length;
    }
  } catch {
    // Handled gracefully by callers without logging PHI
  }
  return results;
};

export const getDiagnosis = async (
  queryParams?: Record<string, any>
): Promise<{ data: any[]; pageCount: number; count?: number }> => {
  noStore();
  const results = { data: [] as any[], pageCount: 0, count: 0 };
  try {
    const params = {
      projectId: queryParams?.projectId || "all",
      campId: queryParams?.campId || "all",
      ...queryParams,
    };
    const { data } = await backend.get("/patients/diagnosis", { params });
    if (data?.status && data?.data) {
      results.data = data.data.diagnoses || [];
      results.pageCount = data.data.pageCount || 0;
      results.count = data.data.count || results.data.length;
    }
  } catch {
    // Handled gracefully by callers without logging PHI
  }
  return results;
};

export const getCampStats = async (queryParams?: Record<string, any>) => {
  noStore();
  const results: any = {};
  try {
    const params = {
      projectId: queryParams?.projectId || "all",
      campId: queryParams?.campId || "all",
      ...queryParams,
    };
    const { data } = await backend.get("/camps/camp-stats/stats", { params });
    if (data?.status) {
      results.items = data.data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const getPatientAnalyticsData = async (queryParams?: Record<string, any>) => {
  noStore();
  const results: any = { items: null };
  try {
    const params = {
      projectId: queryParams?.projectId || "all",
      campId: queryParams?.campId || "all",
      ...queryParams,
    };
    const { data } = await backend.get("/camps/camp-stats/analytics", { params });
    if (data?.status && data?.data) {
      results.items = data.data;
    }
  } catch (error: any) {
    results.error = error?.response?.data?.message || "Failed to fetch analytics";
  }
  return results;
};
