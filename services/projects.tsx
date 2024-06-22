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