import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  // Format number with Arabic digits and return with "جنيه" text
  const formatted = new Intl.NumberFormat("ar-EG").format(amount);
  return `${formatted} جنيه`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
