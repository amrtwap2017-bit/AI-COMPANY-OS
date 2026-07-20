// @ts-nocheck
// Application constants

export const APP_NAME = "Triangle Black";
export const APP_VERSION = "2.0.0";
export const EGYPT_MARKET = "Egypt";

export const API_TIMEOUT = 30_000; // 30 seconds
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const LEAD_STATUSES = [
  { value: "new",         label: "New",          color: "purple"  },
  { value: "qualified",   label: "Qualified",    color: "blue"    },
  { value: "negotiation", label: "Negotiation",  color: "amber"   },
  { value: "won",         label: "Won",          color: "emerald" },
  { value: "lost",        label: "Lost",         color: "red"     },
] as const;

export const WO_STATUSES = [
  { value: "open",        label: "Open",         color: "blue"    },
  { value: "in_progress", label: "In Progress",  color: "amber"   },
  { value: "completed",   label: "Completed",    color: "emerald" },
  { value: "cancelled",   label: "Cancelled",    color: "red"     },
] as const;

export const PRIORITIES = [
  { value: "low",       label: "Low",       color: "#6b7280" },
  { value: "medium",    label: "Medium",    color: "#3b82f6" },
  { value: "high",      label: "High",      color: "#f59e0b" },
  { value: "critical",  label: "Critical",  color: "#ef4444" },
  { value: "emergency", label: "Emergency", color: "#dc2626" },
] as const;

export const EGYPT_HOTEL_TYPES = [
  "5-Star Hotel", "4-Star Hotel", "Resort",
  "Business Hotel", "Boutique Hotel", "Aparthotel",
] as const;

export const EGYPT_CITIES = [
  "Cairo", "Alexandria", "Sharm El Sheikh",
  "Hurghada", "Luxor", "Aswan", "Marsa Alam",
] as const;
