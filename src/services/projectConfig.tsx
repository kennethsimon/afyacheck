"use server";

import projectApi from "./config";
import { unstable_noStore as noStore } from "next/cache";

export const getProjectConfig = async (projectId: string) => {
  noStore();
  let results: any = {};
  await projectApi
    .get(`/project-configs/project/${projectId}`)
    .then(({ data }) => {
      if (data.status) {
        results = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return results;
};

export const createProjectConfig = async (config: any) => {
  noStore();
  let results: any = {};
  await projectApi
    .post("/project-configs", config)
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

export const updateProjectConfig = async (projectId: string, config: any) => {
  noStore();
  let results: any = {};
  await projectApi
    .put(`/project-configs/project/${projectId}`, config)
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

export const updateFormConfig = async (projectId: string, formConfig: any) => {
  noStore();
  let results: any = {};
  await projectApi
    .put(`/project-configs/project/${projectId}/form-config`, formConfig)
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

export const updateAnalyticsConfig = async (projectId: string, analyticsConfig: any) => {
  noStore();
  let results: any = {};
  await projectApi
    .put(`/project-configs/project/${projectId}/analytics-config`, analyticsConfig)
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

