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