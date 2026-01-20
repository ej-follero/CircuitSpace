import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toast(message: string, type: "success" | "error" | "info" = "info") {
  // This will be handled by sonner in the UI
  return { message, type };
}
