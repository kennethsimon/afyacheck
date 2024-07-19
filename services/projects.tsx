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

// get single project by it's id
export const getProjectById = async (projectId: string) => {
  let results: any = {};
  await projectApi
    .get(`/projects/${projectId}`)
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
  // console.log("getPatients Query params: ", queryParams);
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

export const getCampStats = async (queryParams?: any) => {
  let results: any = {};

  console.log("getCampStats Query params: ", queryParams);
  const campId = queryParams?.campId;

  if (!campId) {
    throw new Error("campId is required in queryParams");
  }

  // console.log("we are going with campId : ", campId);

  await projectApi
    .get(`/camps/camp-stats/stats`, { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        console.log(data);
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  // console.log("Stats results: ", results.items);

  return results;
};

export const getPatientAnalyticsData = async (queryParams?: any) => {
  let results: any = {};
  const campId = queryParams?.campId;

  if (!campId) {
    throw new Error("campId is required in queryParams");
  }

  await projectApi
    .get("/patients", { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        results.items = data.data.patients;
        results.count = data.data.count;
      }
    })
    .catch((error: any) => {
      console.error(error);
    });

  // console.log("Stats results: ", results.items);

  return results;
};
