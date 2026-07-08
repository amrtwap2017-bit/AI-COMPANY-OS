import { clsx, type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]) { return clsx(inputs); }

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency", currency: "EGP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-EG", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function formatRelative(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export type QuoteStatus = "draft"|"review"|"sent"|"approved"|"rejected";
export const QUOTE_STATUS: Record<QuoteStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",    color: "text-gray-700",  bg: "bg-gray-100" },
  review:   { label: "In Review",color: "text-blue-700",  bg: "bg-blue-100" },
  sent:     { label: "Awaiting Approval", color: "text-amber-700", bg: "bg-amber-100" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700",   bg: "bg-red-100" },
};
