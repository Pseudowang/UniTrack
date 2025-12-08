import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceCent?: number | null) {
  if (priceCent === null || priceCent === undefined) {
    return "—";
  }
  return `¥ ${(priceCent / 100).toFixed(2)}`;
}

export function formatDate(input?: Date | string | null) {
  if (!input) {
    return "尚未抓取";
  }
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleString("zh-CN", { hour12: false });
}
