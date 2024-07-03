"use server";

import { PatientFilters } from "@/types/general";
import projectApi from "./config";

export const getProjects = async () => {
  let results: any = {};
  await projectApi
    .get("/projects")
    .then(({ data }) => {
      if (data.status) {
        console.log(data);
        results.items = data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return results;
};

export const getPermissions = async () => {
  let results: any = {};
  await projectApi
    .get("/auth/roles")
    .then(({ data }) => {
      if (data.status) {
        console.log(data);
        results.items = data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return results;
};

export const getPatients = async (queryParams?: any) => {
  console.log({ queryParams });
  let results: any = {};
  await projectApi
    .get("/patients", { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return results;
};

export const getCampStats = async (campId: string) => {
  let results: any = {};
  await projectApi
    .get(`/camps/stats/${campId}`)
    .then(({ data }) => {
      if (data.status) {
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  console.log("Stats results: ", results.items);

  return results;
};

export const getPatientAnalyticsData = async (filters: PatientFilters) => {
  let results: any = {};
  await projectApi
    .get("/patients", { params: filters })
    .then(({ data }) => {
      if (data.status) {
        results.items = data.data.patients;
        results.count = data.data.count;
      }
    })
    .catch((error: any) => {
      console.error(error);
    });

  console.log("Stats results: ", results.items);

  return results;
};
