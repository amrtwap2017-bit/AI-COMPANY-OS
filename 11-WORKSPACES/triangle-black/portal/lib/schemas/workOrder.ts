import { z } from "zod";

export const WorkOrderSchema = z.object({
  title:        z.string().min(3, "Title must be at least 3 characters"),
  description:  z.string().optional(),
  priority:     z.enum(["low", "medium", "high", "critical", "emergency"]).default("medium"),
  category:     z.string().optional(),
  asset_id:     z.string().optional(),
  site_id:      z.string().optional(),
  technician_id: z.string().optional(),
  due_date:     z.string().optional(),
  estimated_hours: z.number().optional(),
});

export type WorkOrderFormData = z.infer<typeof WorkOrderSchema>;
