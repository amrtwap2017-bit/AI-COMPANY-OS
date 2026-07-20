// @ts-nocheck
// Triangle Black API — Master Index
// All real TB Admin endpoints, authenticated

export { authApi }       from "./auth";
export { leadsApi }      from "./leads";
export { dashboardApi }  from "./dashboard";
export { inventoryApi }  from "./inventory";
export { procurementApi }from "./procurement";
export { quotesApi }     from "./quotes";
export { reportsApi }    from "./reports";
export { tbFetch, toList, toPagination } from "./tb-client";
export type { Lead } from "./leads";
