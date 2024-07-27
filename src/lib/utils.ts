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

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

// export function isAdmin(session: any): boolean {
//   return session.some(
//     (role: { name: string; active: boolean }) =>
//       role.name === "Admin" && role.active
//   );
// }

// Utility function to check if the user is an admin
export function isAdmin(session: any): boolean {
  // console.log("Checking if user is an admin", session);
  return session.user.roles.some(
    (role: { name: string; active: boolean }) =>
      role.name === "Admin" && role.active
  );
}

// check if string is a uuid, for example if it is asd33 it will be false if 6675342f31f8c70caf1e91d7 ti will be true
export function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  return uuidRegex.test(str);
}

export function getGenderBackgroundColor(gender: string): string {
  switch (gender.toLowerCase()) {
    case "male":
      return "bg-blue-100";
    case "female":
      return "bg-pink-100";
    case "other":
      return "bg-gradient-to-r from-red-400 via-yellow-400 to-green-400";
    default:
      return "bg-gray-100";
  }
}
