"use server";

import backend from "@/app/api/auth/[...nextauth]/backend";

export const getCampsByProjectId = async (projectId: string) => {
  // console.log("getCampsByProjectId Project ID: ", projectId);
  let results: any = {};

  await backend
    .get(`/camps/project/${projectId}`)
    .then(({ data }) => {
      if (data.status) {
        // console.log("DATA HERE :", data);
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error("Error fetching camps:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      }
    });

  return results;
};

// get all camps
export const getAllCamps = async () => {
  let results: any = {};

  await backend
    .get(`/camps/project/all`)
    .then(({ data }) => {
      if (data.status) {
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error("Error fetching all camps:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      }
    });

  return results;
};

// get camp by campid
export const getCampById = async (campId: string) => {
  console.log("getCampById Camp ID: ", campId);
  let results: any = {};

  await backend
    .get(`/camps/camp/${campId}`)
    .then(({ data }) => {
      if (data.status) {
        // console.log(data);
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error("Error fetching camp:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      }
    });

  return results;
};
