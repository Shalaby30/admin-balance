import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  // تحويل القيمة لرقم لضمان عدم ظهور NaN
  const val = Number(amount) || 0; 
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory", // إجبار التقويم الميلادي
  }).format(new Date(date));
}
