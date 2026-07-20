// @ts-nocheck
// Technician Team Management API — Triangle Black
import { api } from "@/lib/api";

export interface Technician {
  id:                  string;
  name:                string;
  email:               string;
  phone:               string;
  specializations:     string[];
  is_active:           boolean;
  max_work_orders:     number;
  current_work_orders: number;
}

export interface TechnicianCapacity extends Technician {
  active_work_orders: number;
  completed_today:    number;
  open:               number;
  in_progress:        number;
  emergency:          number;
  capacity_pct:       number;
  load_status:        "available" | "moderate" | "busy" | "overloaded";
}

export interface TeamSummary {
  total:          number;
  active:         number;
  busy:           number;
  available:      number;
  total_open_wos: number;
  emergency_wos:  number;
}

export async function fetchTechnicians(): Promise<Technician[]> {
  const res = await api.get<any>("/technicians/");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function fetchTeamCapacity(): Promise<{
  technicians: TechnicianCapacity[];
  summary:     TeamSummary;
}> {
  const res = await api.get<any>("/technicians/capacity");
  return res.data;
}

export async function updateTechnician(id: string, data: Partial<Technician>) {
  const res = await api.patch<any>("/technicians/" + id, data);
  return res.data;
}
