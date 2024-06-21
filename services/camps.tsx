import projectApi from "./config";


export const getCamps = async (queryParams?: any) => {
    let results: any = {};
    await projectApi
          .get("/camps", { params: queryParams })
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