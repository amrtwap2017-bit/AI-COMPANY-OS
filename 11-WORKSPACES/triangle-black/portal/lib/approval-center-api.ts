import { api } from "./api/client";

export const approvalCenterApi = {
  inbox: () => api.get("/approvals/inbox"),
  stats: () => api.get("/approvals/stats"),
  activity: (limit = 50) => api.get("/approvals/activity", { params: { limit } }),
};
