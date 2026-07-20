// @ts-nocheck
import { tbFetch, toList, toPagination } from "./tb-client";

export interface Lead {
  id:           string;
  company_name: string;
  contact_name: string;
  email:        string;
  phone?:       string;
  status:       "new"|"qualified"|"negotiation"|"won"|"lost";
  source?:      string;
  notes?:       string;
  created_at:   string;
  updated_at:   string;
}

export const leadsApi = {
  async list(params?: { limit?: number; status?: string; search?: string }) {
    // TB Admin real endpoint: /api/v1/actions/leads/search
    const r = await tbFetch("/api/v1/actions/leads/search", { params });
    return { data: toList<Lead>(r.data), ...r };
  },

  async get(id: string) {
    return tbFetch<Lead>(`/api/v1/actions/leads/${id}`);
  },

  async create(data: Partial<Lead>) {
    return tbFetch<Lead>("/api/v1/actions/leads/create", {
      method: "POST", body: data,
    });
  },

  async qualify(id: string) {
    return tbFetch(`/api/v1/actions/leads/${id}/qualify`, { method: "POST" });
  },

  async assign(id: string, agentId: string) {
    return tbFetch(`/api/v1/actions/leads/${id}/assign`, {
      method: "POST", body: { agent_id: agentId },
    });
  },

  async timeline(id: string) {
    return tbFetch(`/api/v1/actions/leads/${id}/timeline`);
  },

  async addNote(id: string, note: string) {
    return tbFetch(`/api/v1/actions/leads/${id}/note`, {
      method: "POST", body: { note },
    });
  },

  async pipelineSummary() {
    return tbFetch("/api/v1/actions/pipeline/summary");
  },

  async checkDuplicate(email: string) {
    return tbFetch("/api/v1/actions/leads/check-duplicate", {
      method: "POST", body: { email },
    });
  },
};
