import { clsx, type ClassValue } from "clsx";
import { LeadStatus, QuoteStatus, LeadPriority } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new:       { label: "New",       color: "text-gray-700",   bg: "bg-gray-100" },
  qualified: { label: "Qualified", color: "text-blue-700",   bg: "bg-blue-100" },
  assigned:  { label: "Assigned",  color: "text-amber-700",  bg: "bg-amber-100" },
  converted: { label: "Converted", color: "text-green-700",  bg: "bg-green-100" },
  lost:      { label: "Lost",      color: "text-red-700",    bg: "bg-red-100" },
};

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",    color: "text-gray-700",   bg: "bg-gray-100" },
  review:   { label: "Review",   color: "text-blue-700",   bg: "bg-blue-100" },
  sent:     { label: "Sent",     color: "text-amber-700",  bg: "bg-amber-100" },
  approved: { label: "Approved", color: "text-green-700",  bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700",    bg: "bg-red-100" },
};

export const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string }> = {
  high:   { label: "High",   color: "text-red-600" },
  medium: { label: "Medium", color: "text-amber-600" },
  low:    { label: "Low",    color: "text-gray-500" },
};
