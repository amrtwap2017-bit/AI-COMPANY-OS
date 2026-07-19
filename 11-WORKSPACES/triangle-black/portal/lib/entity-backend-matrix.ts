
export type BackendFeedStatus = {
  label: string;
  ok: boolean;
  detail: string;
};

export type BackendTargetEndpoint = {
  label: string;
  route: string;
  purpose: string;
};

export type EntityBackendDefinition = {
  key: string;
  title: string;
  subtitle: string;
  currentFeeds: string[];
  targetEndpoints: BackendTargetEndpoint[];
  relatedObjects: string[];
};

export const entityBackendMatrix: Record<string, EntityBackendDefinition> = {
  customer: {
    key: "customer",
    title: "Customer Backend Alignment",
    subtitle: "Move from multi-feed inference to a true customer entity service.",
    currentFeeds: ["Leads", "Quotes", "Contracts", "Invoices"],
    targetEndpoints: [
      { label: "Customer Detail", route: "/customers/{id}", purpose: "Primary customer profile and relationship state" },
      { label: "Customer Contracts", route: "/customers/{id}/contracts", purpose: "Contract continuity by customer" },
      { label: "Customer Invoices", route: "/customers/{id}/invoices", purpose: "Finance realization by customer" },
      { label: "Customer Timeline", route: "/customers/{id}/timeline", purpose: "Meetings, quotes, contracts, and service history" },
    ],
    relatedObjects: ["Lead", "Quote", "Contract", "Invoice", "Work Order"],
  },
  contract: {
    key: "contract",
    title: "Contract Backend Alignment",
    subtitle: "Move from broad list filtering to a true contract detail service.",
    currentFeeds: ["Contracts", "Invoices", "Work Orders", "Service Requests"],
    targetEndpoints: [
      { label: "Contract Detail", route: "/contracts/{id}", purpose: "Primary contract state and scope" },
      { label: "Contract Work Orders", route: "/contracts/{id}/work-orders", purpose: "Execution linkage by contract" },
      { label: "Contract Invoices", route: "/contracts/{id}/invoices", purpose: "Billing and collections continuity" },
      { label: "Contract Health", route: "/contracts/{id}/health", purpose: "SLA, delivery, and renewal readiness" },
    ],
    relatedObjects: ["Customer", "Work Order", "Invoice", "Service Request"],
  },
  "work-order": {
    key: "work-order",
    title: "Work Order Backend Alignment",
    subtitle: "Move from aggregate feeds to a true execution-centric detail service.",
    currentFeeds: ["Work Orders", "Technicians", "Service Requests", "Service Reports"],
    targetEndpoints: [
      { label: "Work Order Detail", route: "/work-orders/{id}", purpose: "Primary execution object and field state" },
      { label: "Work Order Reports", route: "/work-orders/{id}/reports", purpose: "Closure proof and reporting continuity" },
      { label: "Work Order Timeline", route: "/work-orders/{id}/timeline", purpose: "Execution event history" },
      { label: "Work Order Support", route: "/work-orders/{id}/support", purpose: "Future items, vendors, and supply linkage" },
    ],
    relatedObjects: ["Service Request", "Technician", "Service Report", "Contract"],
  },
  vendor: {
    key: "vendor",
    title: "Vendor Backend Alignment",
    subtitle: "Move from broad supplier feeds to a true vendor intelligence service.",
    currentFeeds: ["Vendors", "Items", "Purchase Requests", "Purchase Orders", "Goods Receipts"],
    targetEndpoints: [
      { label: "Vendor Detail", route: "/vendors/{id}", purpose: "Primary supplier profile and qualification state" },
      { label: "Vendor Orders", route: "/vendors/{id}/purchase-orders", purpose: "Supplier transaction history" },
      { label: "Vendor Receipts", route: "/vendors/{id}/receipts", purpose: "Delivery continuity and receipt quality" },
      { label: "Vendor Scorecard", route: "/vendors/{id}/scorecard", purpose: "Delivery, price, and responsiveness intelligence" },
    ],
    relatedObjects: ["Purchase Order", "Goods Receipt", "Item", "Work Order"],
  },
};

export function countConnected(feeds: BackendFeedStatus[]) {
  return feeds.filter((item) => item.ok).length;
}
