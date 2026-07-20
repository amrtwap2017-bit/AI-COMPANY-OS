// @ts-nocheck
// Service Requests API — Triangle Black (Self-Service Portal)
import { api } from "@/lib/api";

export interface ServiceRequest {
  id:              string;
  hotel_id:        string;
  title:           string;
  description:     string | null;
  category:        string;
  urgency:         "low" | "normal" | "high" | "emergency";
  status:          "new" | "assigned" | "in_progress" | "resolved" | "closed";
  submitted_by:    string | null;
  contact_phone:   string | null;
  preferred_date:  string | null;
  resolved_at:     string | null;
  created_at:      string;
}

export interface ServiceRequestCreate {
  title:          string;
  description?:   string;
  category:       string;
  urgency:        string;
  submitted_by?:  string;
  contact_phone?: string;
  preferred_date?: string;
}

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  const res = await api.get<any>("/service-requests/");
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

export async function createServiceRequest(data: ServiceRequestCreate): Promise<ServiceRequest> {
  const res = await api.post<any>("/service-requests/", data);
  return res.data;
}
