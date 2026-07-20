// @ts-nocheck
// Work Orders API — Triangle Black
import { api } from "@/lib/api";

export interface WorkOrder {
  id:             string;
  hotel_id:       string;
  title:          string;
  description:    string | null;
  priority:       "low" | "medium" | "high" | "critical" | "emergency";
  status:         "open" | "in_progress" | "completed" | "cancelled";
  type:           string | null;
  technician_id:  string | null;
  due_date:       string | null;
  created_at:     string;
  updated_at:     string;
}

export interface AssignResult {
  id:             string;
  title:          string;
  status:         string;
  technician_id:  string | null;
  assigned:       boolean;
}

export async function fetchWorkOrders(params?: {
  status?: string;
  priority?: string;
  limit?: number;
}): Promise<WorkOrder[]> {
  const q = new URLSearchParams();
  if (params?.status)   q.set("status",   params.status);
  if (params?.priority) q.set("priority", params.priority);
  q.set("limit", String(params?.limit ?? 100));
  const res = await api.get<any>("/work-orders/?" + q.toString());
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function assignTechnician(
  workOrderId: string,
  technicianId: string | null,
): Promise<AssignResult> {
  const res = await api.patch<any>("/work-orders/" + workOrderId + "/assign", {
    technician_id: technicianId,
  });
  return res.data;
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: string,
): Promise<WorkOrder> {
  const res = await api.patch<any>("/work-orders/" + workOrderId, { status });
  return res.data;
}
