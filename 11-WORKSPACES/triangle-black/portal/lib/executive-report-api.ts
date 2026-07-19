// Executive Reporting API — Triangle Black
import { api } from "@/lib/api";

export interface ExecSummary {
  hotel_id:    string;
  computed_at: string;
  currency:    string;
  financial: {
    total_invoiced:      number;
    total_collected:     number;
    collection_rate:     number;
    pipeline_value:      number;
  };
  commercial: {
    leads:                  number;
    quotes:                 number;
    contracts_active:       number;
    contracts_expiring_30d: number;
  };
  operations: {
    work_orders_open: number;
    active_rfqs:      number;
  };
  procurement: {
    total_spend:      number;
    pending_spend:    number;
    active_suppliers: number;
  };
}

export interface KpiItem {
  key:    string;
  label:  string;
  value:  number;
  unit:   string;
  status: "ok" | "warning" | "critical";
}

export interface KpiDomain {
  kpis:        KpiItem[];
  computed_at: string;
}

export async function fetchExecSummary(): Promise<ExecSummary> {
  const res = await api.get<any>("/analytics/executive/summary");
  return res.data;
}

export async function fetchKpis(domain: string): Promise<KpiDomain> {
  const res = await api.get<any>("/analytics/kpis/" + domain);
  return res.data;
}

export async function fetchAllKpis() {
  const [commercial, financial, operational, procurement] = await Promise.all([
    fetchKpis("commercial"),
    fetchKpis("financial"),
    fetchKpis("operational"),
    fetchKpis("procurement"),
  ]);
  return { commercial, financial, operational, procurement };
}
