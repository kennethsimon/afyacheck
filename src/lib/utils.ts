import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getTextAfterLastSlash(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

