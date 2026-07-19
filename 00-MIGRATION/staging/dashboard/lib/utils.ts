import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(0);
  return `${mins}m ${secs}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    success: "text-green-400",
    healthy: "text-green-400",
    running: "text-blue-400",
    pending: "text-yellow-400",
    failed: "text-red-400",
    partial: "text-orange-400",
    active: "text-green-400",
    closed: "text-gray-400",
    indexed: "text-green-400",
    processing: "text-blue-400",
    error: "text-red-400",
    ok: "text-green-400",
  };
  return map[status] || "text-gray-400";
}
