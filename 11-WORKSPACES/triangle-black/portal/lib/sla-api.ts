// @ts-nocheck
// SLA Tracking API — Triangle Black
import { api } from "@/lib/api";

export interface SlaSummary {
  total_work_orders: number;
  resolved_work_orders: number;
  avg_response_hrs: number;
  avg_resolution_hrs: number;
  total_breaches: number;
  compliance_pct: number;
}

export interface ContractSla {
  contract_id: string;
  contract_name: string;
  status: string;
  total_wos: number;
  avg_response_hrs: number;
  avg_resolution_hrs: number;
  breaches: number;
  compliance_pct: number;
}

export async function fetchSlaSummary(): Promise<SlaSummary> {
  const res = await api.get<any>("/analytics/sla/summary");
  return res.data;
}

export async function fetchContractSlas(): Promise<ContractSla[]> {
  const res = await api.get<any>("/analytics/sla/contracts");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}
