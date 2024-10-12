"use server";

import projectApi from "./config";
import { unstable_noStore as noStore } from "next/cache";

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

export const getAddPatientFormPermissions = async () => {
  const results = {
    PatientInfo: true,
    ScreeningQuestions: true,
    ClinicalFindings: true,
    DoctorComments: true,
  };

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

export const getPatients = async (
  queryParams?: any
): Promise<{
  data: any[];
  pageCount: number;
}> => {
  noStore();

  console.log(queryParams);

  let results = { data: [], pageCount: 0 };
  await projectApi
    .get("/patients", { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        console.log("Patients Data : ", data);
        results.data = data.data.patients || [];
        results.pageCount = data.data.pageCount || 0;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  console.log("get Patients results pageCount : ", results.pageCount);
  console.log("get Patients results data : ", JSON.stringify(results.data));
  return results;
};
export const getDiagnosis = async (
  queryParams?: any
): Promise<{
  data: any[];
  pageCount: number;
}> => {
  noStore();

  console.log(queryParams);

  let results = { data: [], pageCount: 0 };
  await projectApi
    .get("/patients/diagnosis", { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        results.data = data.data.diagnoses || [];
        results.pageCount = data.data.pageCount || 0;
      }
    })
    .catch((error) => {
      console.error(error);
    });
  console.log("get Diagnosis results pageCount : ", results.pageCount);
  console.log("get Diagnosis results data : ", JSON.stringify(results.data));
  // results = { data: [], pageCount: 0 };
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
  console.log("getPatientAnalyticsData Query params: ", queryParams);
  let results: any = {};
  const campId = queryParams?.campId;

  if (!campId) {
    throw new Error("campId is required in queryParams");
  }

  await projectApi
    .get("camps/camp-stats/analytics", { params: queryParams })
    .then(({ data }) => {
      if (data.status) {
        console.log("Analytics Data HERE server : ", data);
        results.items = data.data;
      }
    })
    .catch((error: any) => {
      console.error(error);
    });

  // console.log("Stats results: ", results.items);

  return results;
};
