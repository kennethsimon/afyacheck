import projectApi from "./config";

// get user details by userId
export const getUserById = async (userId: any) => {
  console.log("getUserById User ID: ", userId);
  let results: any = {};

  await projectApi
    .get(`/auth/admin/${userId}`)
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
