// @ts-nocheck
import { safeFetch } from "./safe-api";
const apiJson = safeFetch;
const safeApiJson = safeFetch;

export const inboxApi = {
  list: () => safeApiJson("/notifications/"),
  unread: () => safeApiJson("/notifications/unread"),
  markRead: (id: string) =>
    apiJson(`/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    apiJson("/notifications/read-all", {
      method: "POST",
    }),
  remove: (id: string) =>
    apiJson(`/notifications/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
