// Triangle Black — Unified API Barrel Export
// Single import point for all API modules

// Core client — fetch-based, typed
export {
  api,
  setAccessToken,
  getAccessToken,
  clearTokens,
  buildParams,
  TBApiError,
} from "./client";
export type { ApiResponse, ApiError } from "./client";

// Domain API modules
export * from "./auth";
export * from "./commercial";
export * from "./maintenance";
export * from "./operations";
export * from "./supply-chain";
export * from "./analytics";
export * from "./workflows";

// Shared types
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined | null;
}
