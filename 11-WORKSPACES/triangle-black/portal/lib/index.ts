// @ts-nocheck
/**
 * Triangle Black — Portal lib barrel
 * Prefer this import point for domain APIs wired to real backend routes.
 */
export {
  api,
  setAccessToken,
  getAccessToken,
  clearTokens,
  buildParams,
  TBApiError,
} from "./api/client";
export type { ApiResponse, ApiError } from "./api/client";

export {
  workOrdersApi,
  techniciansApi,
  serviceRequestsApi,
} from "./ops-api";
export type {
  WorkOrder,
  Technician,
  ServiceRequest,
  WOStatus,
  WOPriority,
  ListParams,
} from "./ops-api";

export {
  purchaseOrdersApi,
  purchaseRequestsApi,
  inventoryApi,
  vendorsApi,
} from "./inventory-api";
export type {
  PurchaseOrder,
  PurchaseRequest,
  InventoryItem,
  Vendor,
} from "./inventory-api";

export { executiveIntelligenceApi } from "./executive-intelligence-api";
export { procurementIntelligenceApi } from "./procurement-intelligence-api";
export { customerSuccessApi } from "./customer-success-api";
export { aiAssistantApi } from "./ai-assistant-api";
export { approvalCenterApi } from "./approval-center-api";

export { api as default } from "./api/client";
