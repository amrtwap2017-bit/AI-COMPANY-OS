/**
 * Triangle Black — Shared TypeScript Interfaces
 * Sprint 186 — Type Safety Foundation
 */

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "completed" | "cancelled";
  technician_id?: string;
  asset_id?: string;
  estimated_hours?: number;
  hotel_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  due_date?: string;
  notes?: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description?: string;
  category: string;
  urgency: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  submitted_by?: string;
  contact_phone?: string;
  hotel_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  priority: "critical" | "high" | "medium" | "low";
  score: number;
  notes?: string;
  hotel_id: string;
  created_at: string;
  updated_at: string;
  agent_id?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: "Operational" | "Under Maintenance" | "In Fault" | "Decommissioned";
  criticality?: "critical" | "high" | "medium" | "low";
  location?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  hotel_id: string;
  created_at: string;
  installation_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

export interface Invoice {
  id: string;
  invoice_number?: string;
  title?: string;
  amount: number;
  tax_amount?: number;
  total_amount?: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  hotel_id: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  title: string;
  client_name?: string;
  contract_number?: string;
  contract_type?: string;
  total_value?: number;
  value?: number;
  status: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  hotel_id: string;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  name: string;
  specialization?: string;
  trade?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  current_work_orders?: number;
  max_work_orders?: number;
  hotel_id?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  status: string;
  budget?: number;
  spent?: number;
  actual_cost?: number;
  progress_pct?: number;
  completion_percentage?: number;
  start_date?: string;
  end_date?: string;
  manager?: string;
  site_name?: string;
  hotel_id?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "warning" | "info" | "success" | "reminder";
  entity_id?: string;
  entity_type?: string;
  recipient_role?: string;
  is_read: boolean;
  hotel_id: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface PMPlan {
  id: string;
  title: string;
  plan_type?: string;
  frequency?: string;
  next_due_date?: string;
  last_completed_date?: string;
  status: "active" | "overdue" | "inactive" | "completed";
  owner?: string;
  notes?: string;
  asset_node_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper type for API responses
export type ApiList<T> = T[] | { items: T[] } | { data: T[] } | { results: T[] };

// Safe array extraction
export function toArr<T>(d: ApiList<T> | null | undefined): T[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if ("items" in d && Array.isArray(d.items)) return d.items;
  if ("data" in d && Array.isArray(d.data)) return d.data;
  if ("results" in d && Array.isArray(d.results)) return d.results;
  return [];
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB"); }
  catch { return String(d).slice(0, 10); }
}

export function fmtNum(n: number | null | undefined): string {
  try { return Number(n || 0).toLocaleString(); }
  catch { return "0"; }
}
