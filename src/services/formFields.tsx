"use server";

import backend from "@/app/api/auth/[...nextauth]/backend";
import { unstable_noStore as noStore } from "next/cache";

export const getFormFields = async (projectId?: string) => {
  noStore();
  const results: any = { formFields: [] };
  try {
    const url = projectId ? `/form-fields?project=${encodeURIComponent(projectId)}` : "/form-fields";
    const { data } = await backend.get(url);
    if (data?.status) {
      results.formFields = data.data?.formFields || [];
    }
  } catch {
    // Handled gracefully
  }
  return results;
};

export const getFormFieldsBySection = async (projectId: string, section: string) => {
  noStore();
  const { formFields } = await getFormFields(projectId);
  return {
    formFields: (formFields || []).filter((f: any) => f.section === section),
  };
};

export const createFormField = async (projectId: string, formField: any) => {
  noStore();
  const { data } = await backend.post("/form-fields", { ...formField, project: projectId });
  return data;
};

export const updateFormField = async (id: string, formField: any) => {
  noStore();
  const { data } = await backend.put(`/form-fields/${id}`, formField);
  return data;
};

export const deleteFormField = async (id: string) => {
  noStore();
  const { data } = await backend.delete(`/form-fields/${id}`);
  return data;
};
