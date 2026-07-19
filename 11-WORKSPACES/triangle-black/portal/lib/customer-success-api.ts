import { api } from "./api/client";

export const customerSuccessApi = {
  healthSummary: () => api.get("/customers/health-summary"),
  get360: (leadId: string) => api.get(`/customers/${leadId}/360`),
  getHealth: (leadId: string) => api.get(`/customers/${leadId}/health`),
  getTimeline: (leadId: string) => api.get(`/customers/${leadId}/timeline`),
  getMeetings: (leadId: string) => api.get(`/customers/${leadId}/meetings`),
  createMeeting: (leadId: string, payload: unknown) =>
    api.post(`/customers/${leadId}/meetings`, payload),
  getSatisfaction: (leadId: string) => api.get(`/customers/${leadId}/satisfaction`),
  createSatisfaction: (leadId: string, payload: unknown) =>
    api.post(`/customers/${leadId}/satisfaction`, payload),
  getRenewals: (leadId: string) => api.get(`/customers/${leadId}/renewals`),
  getTasks: (leadId: string) => api.get(`/customers/${leadId}/tasks`),
  createTask: (leadId: string, payload: unknown) =>
    api.post(`/customers/${leadId}/tasks`, payload),
  completeTask: (leadId: string, taskId: string) =>
    api.patch(`/customers/${leadId}/tasks/${taskId}/complete`, {}),
};
