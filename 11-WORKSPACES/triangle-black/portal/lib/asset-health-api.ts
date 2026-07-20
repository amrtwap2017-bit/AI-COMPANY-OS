// @ts-nocheck
// Asset Health Monitoring API — Triangle Black
import { api } from "@/lib/api";

export interface AssetHealth {
  id:                      string;
  name:                    string;
  category:                string;
  status:                  string;
  criticality:             string;
  manufacturer:            string;
  model:                   string;
  service_frequency:       string;
  health_score:            number;
  health_grade:            string;
  open_work_orders:        number;
  completed_work_orders:   number;
  emergency_wos:           number;
  last_maintenance:        string | null;
  days_since_maintenance:  number | null;
}

export interface AssetHealthSummary {
  total:            number;
  operational:      number;
  needs_attention:  number;
  critical_assets:  number;
  avg_health_score: number;
}

export async function fetchAssetHealthSummary(): Promise<{
  assets:  AssetHealth[];
  summary: AssetHealthSummary;
}> {
  const res = await api.get<any>("/assets/health-summary");
  return res.data;
}

export async function fetchAssets() {
  const res = await api.get<any>("/assets/");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}
