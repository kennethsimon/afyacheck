import projectApi from "./config";

export const getCampsByProjectId = async (projectId: string) => {
  // console.log("getCampsByProjectId Project ID: ", projectId);
  let results: any = {};

  await projectApi
    .get(`/camps/project/${projectId}`)
    .then(({ data }) => {
      if (data.status) {
        // console.log("DATA HERE :", data);
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return results;
};

// get camp by campid
export const getCampById = async (campId: string) => {
  console.log("getCampById Camp ID: ", campId);
  let results: any = {};

  await projectApi
    .get(`/camps/camp/${campId}`)
    .then(({ data }) => {
      if (data.status) {
        // console.log(data);
        results.items = data.data;
      }
    })
    .catch((error) => {
      console.error(error);
    });

  return results;
};
