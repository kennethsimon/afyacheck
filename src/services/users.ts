import projectApi from "./config";

export const getUserById = async (userId: string | string[]) => {
  const id = Array.isArray(userId) ? userId[0] : userId;
  const results: any = {};
  try {
    const { data } = await projectApi.get(`/auth/admin/${id}`);
    if (data?.status) {
      results.items = data.data;
    }
  } catch {
    // Handled gracefully
  }
  return results;
};
