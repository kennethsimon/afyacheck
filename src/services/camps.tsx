"use server";

import backend from "@/app/api/auth/[...nextauth]/backend";
import { unstable_noStore as noStore } from "next/cache";

export const getCampsByProjectId = async (projectId: string) => {
  noStore();
  const results: any = {};
  try {
    const target = projectId && projectId !== "all" ? projectId : "all";
    const { data } = await backend.get(`/camps/project/${target}`);
    if (data?.status) {
      results.items = data.data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const getAllCamps = async () => {
  noStore();
  const results: any = {};
  try {
    const { data } = await backend.get("/camps/project/all");
    if (data?.status) {
      results.items = data.data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};

export const getCampById = async (campId: string) => {
  noStore();
  const results: any = {};
  try {
    const { data } = await backend.get(`/camps/camp/${campId}`);
    if (data?.status) {
      results.items = data.data;
    }
  } catch {
    // Handled gracefully by callers
  }
  return results;
};
