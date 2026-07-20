// @ts-nocheck
import { tbFetch } from "./tb-client";

export const quotesApi = {
  async get(quoteId: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}`);
  },

  async submit(quoteId: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}/submit`, { method: "POST" });
  },

  async approve(quoteId: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}/approve`, { method: "POST" });
  },

  async reject(quoteId: string, reason?: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}/reject`, {
      method: "POST", body: { reason },
    });
  },

  async send(quoteId: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}/send`, { method: "POST" });
  },

  async pdf(quoteId: string) {
    return tbFetch(`/api/v1/actions/quotes/${quoteId}/pdf`);
  },

  async expireOverdue() {
    return tbFetch("/api/v1/actions/quotes/expire-overdue", { method: "POST" });
  },

  async createFromLead(leadId: string) {
    return tbFetch(`/api/v1/actions/leads/${leadId}/quote`, { method: "POST" });
  },
};
