// @ts-nocheck
import { z } from "zod";

export const WO_CATEGORIES = [
  "electrical", "plumbing", "hvac", "mechanical",
  "civil", "it", "cleaning", "security", "other",
] as const;

// String array for API / form values
export const WO_PRIORITY_VALUES = [
  "low", "medium", "high", "critical", "emergency",
] as const;

export type WOPriority = typeof WO_PRIORITY_VALUES[number];

// Object array for UI rendering (value + color + label)
export const WO_PRIORITIES = [
  { value: "low",       color: "#6b7280", label: "Low — Routine maintenance"            },
  { value: "medium",    color: "#3b82f6", label: "Medium — Standard response required"  },
  { value: "high",      color: "#f59e0b", label: "High — Urgent attention needed"       },
  { value: "critical",  color: "#ef4444", label: "Critical — Immediate action required" },
  { value: "emergency", color: "#dc2626", label: "Emergency — All-hands response"       },
] as const;

export const WorkOrderSchema = z.object({
  title:            z.string().min(3, "Title must be at least 3 characters"),
  description:      z.string().optional(),
  priority:         z.enum(WO_PRIORITY_VALUES).default("medium"),
  category:         z.string().optional(),
  location:         z.string().optional(),
  asset_id:         z.string().optional(),
  site_id:          z.string().optional(),
  technician_id:    z.string().optional(),
  due_date:         z.string().optional(),
  estimated_hours:  z.number().optional(),
});

export const createWorkOrderSchema = WorkOrderSchema;

export type CreateWorkOrderInput = z.input<typeof WorkOrderSchema>;
export type WorkOrderFormData    = z.output<typeof WorkOrderSchema>;
