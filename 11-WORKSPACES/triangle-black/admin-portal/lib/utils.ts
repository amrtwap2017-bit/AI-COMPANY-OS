import { clsx, type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]) { return clsx(inputs); }

export function formatEGP(n: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency", currency: "EGP",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-EG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatRelative(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:   { label: "Admin",   color: "text-purple-700", bg: "bg-purple-100" },
  manager: { label: "Manager", color: "text-blue-700",   bg: "bg-blue-100" },
  agent:   { label: "Agent",   color: "text-green-700",  bg: "bg-green-100" },
  client:  { label: "Client",  color: "text-gray-700",   bg: "bg-gray-100" },
};

export const CONTRACT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending_signature: { label: "Pending",  color: "text-amber-700", bg: "bg-amber-100" },
  active:            { label: "Active",   color: "text-green-700", bg: "bg-green-100" },
  renewed:           { label: "Renewed",  color: "text-blue-700",  bg: "bg-blue-100" },
  expired:           { label: "Expired",  color: "text-gray-600",  bg: "bg-gray-100" },
  cancelled:         { label: "Cancelled",color: "text-red-700",   bg: "bg-red-100" },
};
