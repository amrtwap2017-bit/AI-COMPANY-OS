export type Role = "admin" | "manager" | "agent" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export type LeadStatus = "new" | "qualified" | "assigned" | "converted" | "lost";
export type LeadPriority = "high" | "medium" | "low";
export type LeadSource = "web" | "referral" | "direct";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type QuoteStatus = "draft" | "review" | "sent" | "approved" | "rejected";

export interface QuoteItem {
  service: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  lead_id?: string;
  title: string;
  description?: string;
  items: QuoteItem[];
  total: number;
  status: QuoteStatus;
  validity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  max_leads: number;
  current_leads: number;
  is_active: boolean;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  actor: string;
  created_at: string;
}

export interface Dashboard {
  period: string;
  leads: {
    total: number;
    this_month: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
    by_priority: Record<string, number>;
  };
  quotes: {
    total: number;
    total_value: number;
    approved_value: number;
    by_status: Record<string, number>;
  };
  agents: {
    total: number;
    active: number;
    capacity: Record<string, { current: number; max: number; available: number }>;
  };
  conversion_rate: number;
  revenue_pipeline: number;
}

export type ContractStatus =
  | "pending_signature" | "active" | "renewed" | "expired" | "cancelled";

export interface Contract {
  id: string;
  quote_id: string;
  lead_id: string;
  title: string;
  description?: string;
  services: QuoteItem[];
  total_value: number;
  monthly_value: number;
  status: ContractStatus;
  start_date?: string;
  end_date?: string;
  duration_months: number;
  renewal_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
