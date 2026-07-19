// Contract Renewal Pipeline API — Triangle Black
import { api } from "@/lib/api";

export interface ContractPipelineItem {
  id:               string;
  title:            string;
  status:           string;
  end_date:         string | null;
  start_date:       string | null;
  total_value:      number;
  monthly_value:    number;
  duration_months:  number;
  renewal_count:    number;
  days_until_expiry:number;
  urgency:          "critical" | "high" | "medium" | "low";
}

export interface PipelineSummary {
  total_active:       number;
  expiring_30_days:   number;
  expiring_60_days:   number;
  expiring_90_days:   number;
  value_at_risk_30d:  number;
  value_at_risk_60d:  number;
  total_monthly_value:number;
}

export interface RenewalPipeline {
  summary:      PipelineSummary;
  expiring_30:  ContractPipelineItem[];
  expiring_60:  ContractPipelineItem[];
  expiring_90:  ContractPipelineItem[];
  later:        ContractPipelineItem[];
}

export async function fetchRenewalPipeline(): Promise<RenewalPipeline> {
  const res = await api.get<any>("/contracts/renewal-pipeline");
  return res.data;
}

export async function renewContract(contractId: string): Promise<any> {
  const res = await api.post<any>("/contracts/" + contractId + "/renew", {});
  return res.data;
}
