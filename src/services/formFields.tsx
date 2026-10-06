"use server";

import backend from "@/app/api/auth/[...nextauth]/backend";
import { unstable_noStore as noStore } from "next/cache";

export const getFormFields = async (projectId?: string) => {
  noStore();
  let results: any = { formFields: [] };
  const url = projectId ? `/form-fields?project=${projectId}` : "/form-fields";
  await backend
    .get(url)
    .then(({ data }) => {
      if (data.status) {
        results.formFields = data.data.formFields || [];
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

export const getFormFieldsBySection = async (projectId: string, section: string) => {
  noStore();
  let results: any = { formFields: [] };
  await backend
    .get(`/form-fields/section/${section}?project=${projectId}`)
    .then(({ data }) => {
      if (data.status) {
        results.formFields = data.data.formFields || [];
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

export const createFormField = async (projectId: string, formField: any) => {
  noStore();
  let results: any = {};
  await backend
    .post("/form-fields", { ...formField, project: projectId })
    .then(({ data }) => {
      if (data.status) {
        results = data;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

export const updateFormField = async (id: string, formField: any) => {
  noStore();
  let results: any = {};
  await backend
    .put(`/form-fields/${id}`, formField)
    .then(({ data }) => {
      if (data.status) {
        results = data;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

export const deleteFormField = async (id: string) => {
  noStore();
  let results: any = {};
  await backend
    .delete(`/form-fields/${id}`)
    .then(({ data }) => {
      if (data.status) {
        results = data;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

