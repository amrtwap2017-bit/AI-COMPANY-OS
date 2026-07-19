// Vendor Performance Analytics API — Triangle Black
import { api } from "@/lib/api";

export interface VendorPerformance {
  id:                     string;
  company_name:           string;
  purchase_orders_count:  number;
  purchase_orders_total:  number;
  supplier_invoices_count:number;
  avg_score:              number;
}

export interface SpendBySupplier {
  supplier_id:   string;
  company_name:  string;
  supplier_type: string;
  po_count:      number;
  total_spend:   number;
}

export interface ProcurementKPIs {
  total_pos:              number;
  total_spend:            number;
  approved_pos:           number;
  pending_pos:            number;
  approval_rate:          number;
  total_suppliers:        number;
  active_rfqs:            number;
  total_purchase_requests:number;
}

export interface SupplierScorecard {
  company_name:                string;
  on_time_delivery_score:      number;
  quality_score:               number;
  price_competitiveness_score: number;
  responsiveness_score:        number;
  overall_score:               number;
  risk_flag:                   string;
  period_key:                  string;
}

export async function fetchVendorPerformance(): Promise<VendorPerformance[]> {
  const res = await api.get<any>("/supply-intelligence/vendor-performance");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function fetchSpendBySupplier(): Promise<SpendBySupplier[]> {
  const res = await api.get<any>("/procurement-intelligence/spend/by-supplier");
  const data = res.data;
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function fetchProcurementKPIs(): Promise<ProcurementKPIs> {
  const res = await api.get<any>("/procurement-intelligence/kpis");
  return res.data?.kpis ?? res.data;
}

export async function fetchSupplierIntelligence() {
  const res = await api.get<any>("/procurement-intelligence/suppliers/intelligence");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}
