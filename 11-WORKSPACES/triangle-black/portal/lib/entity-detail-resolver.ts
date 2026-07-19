
import { toList } from "./enterprise-format";

export type DetailMode = "direct" | "inferred";

export function resolveCustomerDetailPayload(payload: any) {
  const focus = payload?.focus || {};
  const related = payload?.related || {};

  return {
    mode: "direct" as DetailMode,
    lead: focus.lead || null,
    quote: focus.quote || null,
    contract: focus.contract || null,
    invoice: focus.invoice || null,
    leads: toList(related.leads),
    quotes: toList(related.quotes),
    contracts: toList(related.contracts),
    invoices: toList(related.invoices),
    status: payload?.status || {},
  };
}

export function resolveContractDetailPayload(payload: any) {
  const focus = payload?.focus || {};
  const related = payload?.related || {};

  return {
    mode: "direct" as DetailMode,
    contract: focus.contract || null,
    quote: focus.quote || null,
    lead: focus.lead || null,
    invoices: toList(related.invoices),
    work_orders: toList(related.work_orders),
    service_requests: toList(related.service_requests),
    status: payload?.status || {},
  };
}

export function resolveWorkOrderDetailPayload(payload: any) {
  const focus = payload?.focus || {};
  const related = payload?.related || {};

  return {
    mode: "direct" as DetailMode,
    work_order: focus.work_order || null,
    technician: focus.technician || null,
    service_request: focus.service_request || null,
    contract: focus.contract || null,
    service_reports: toList(related.service_reports),
    status: payload?.status || {},
  };
}

export function resolveVendorDetailPayload(payload: any) {
  const focus = payload?.focus || {};
  const related = payload?.related || {};

  return {
    mode: "direct" as DetailMode,
    vendor: focus.vendor || null,
    purchase_orders: toList(related.purchase_orders),
    purchase_requests: toList(related.purchase_requests),
    items: toList(related.items),
    goods_receipts: toList(related.goods_receipts),
    status: payload?.status || {},
  };
}
