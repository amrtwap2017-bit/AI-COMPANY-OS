// ARCHIVED: 2026-07-20
// This file had zero page imports and has been archived.
// Original content preserved below.

// @ts-nocheck
import { safeApiJson } from "./enterprise-api";

export const entityViewApi = {
  customerContext: (entity: string, id: string) =>
    safeApiJson(`/entity-view/customer-context?entity=${encodeURIComponent(entity)}&id=${encodeURIComponent(id)}`),

  contract: (id: string) =>
    safeApiJson(`/entity-view/contracts/${encodeURIComponent(id)}`),

  workOrder: (id: string) =>
    safeApiJson(`/entity-view/work-orders/${encodeURIComponent(id)}`),

  vendor: (id: string) =>
    safeApiJson(`/entity-view/vendors/${encodeURIComponent(id)}`),
};
