import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTextAfterLastSlash(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export function getCampId(url: string): string {
  const dashboardIndex = url.indexOf("/dashboard");
  if (dashboardIndex === -1) return "";
  const idPart = url.substring(dashboardIndex + "/dashboard".length);
  const parts = idPart.split("/");
  return parts[1];
}

export function getPatientId(url: string): string {
  const patientsIndex = url.indexOf("/patients");
  if (patientsIndex === -1) return "";
  const idPart = url.substring(patientsIndex + "/patients".length);
  const parts = idPart.split("/");
  return parts[1];
}

// upercase first letter of string
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
