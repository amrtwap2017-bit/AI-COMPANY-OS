
export type Recommendation = {
  title: string;
  detail: string;
  recommendation: string;
  severity: "info" | "success" | "warning";
};

export function buildReadinessLabel(connected: number, total: number) {
  if (connected === total) return "Fully Connected";
  if (connected === 0) return "Offline";
  return "Partially Connected";
}

export function buildCustomerRecommendations(params: {
  relatedLeads: number;
  relatedQuotes: number;
  relatedContracts: number;
  relatedInvoices: number;
  connectedFeeds: number;
  totalFeeds: number;
}): Recommendation[] {
  const out: Recommendation[] = [];

  out.push({
    title: "Integration readiness",
    detail:
      params.connectedFeeds === params.totalFeeds
        ? "Customer context is connected across all currently modeled commercial and finance feeds."
        : "Customer context is only partially connected across commercial and finance feeds.",
    recommendation:
      params.connectedFeeds === params.totalFeeds
        ? "Use Customer 360 as the default relationship surface."
        : "Review the missing feeds before relying on this page for executive or account decisions.",
    severity: params.connectedFeeds === params.totalFeeds ? "success" : "warning",
  });

  out.push({
    title: "Commercial maturity",
    detail:
      params.relatedContracts > 0
        ? "This customer has active contract-level continuity in the enterprise model."
        : params.relatedQuotes > 0
          ? "This customer is commercially active but not fully converted into contract value."
          : "This customer is still early in the commercial journey.",
    recommendation:
      params.relatedContracts > 0
        ? "Use Contract 360 and Work Order 360 to track delivery and retention."
        : params.relatedQuotes > 0
          ? "Push quotation follow-up and conversion workflow next."
          : "Increase lead qualification, site activity, and proposal momentum.",
    severity: params.relatedContracts > 0 ? "success" : "warning",
  });

  out.push({
    title: "Financial depth",
    detail:
      params.relatedInvoices > 0
        ? "Finance realization is visible in the customer context."
        : "Customer finance realization is still weak or not visible.",
    recommendation:
      params.relatedInvoices > 0
        ? "Use invoice visibility to support health, risk, and retention conversations."
        : "Strengthen the path from contract activation to billing continuity.",
    severity: params.relatedInvoices > 0 ? "success" : "warning",
  });

  return out;
}

export function buildContractRecommendations(params: {
  relatedWorkOrders: number;
  relatedRequests: number;
  relatedInvoices: number;
  connectedFeeds: number;
  totalFeeds: number;
}): Recommendation[] {
  return [
    {
      title: "Contract delivery readiness",
      detail:
        params.relatedWorkOrders > 0
          ? "Execution records are visible against this contract context."
          : "Execution visibility is weak against this contract context.",
      recommendation:
        params.relatedWorkOrders > 0
          ? "Inspect Work Order 360 for proof of delivery."
          : "Strengthen execution linkage for this contract.",
      severity: params.relatedWorkOrders > 0 ? "success" : "warning",
    },
    {
      title: "Reactive service pressure",
      detail:
        params.relatedRequests > 0
          ? "Reactive demand is visible against this contract."
          : "Reactive demand is not currently visible against this contract.",
      recommendation:
        params.relatedRequests > 0
          ? "Use request patterns to assess SLA and contract health."
          : "Review service request continuity against contract scope.",
      severity: params.relatedRequests > 0 ? "warning" : "info",
    },
    {
      title: "Billing continuity",
      detail:
        params.relatedInvoices > 0
          ? "Invoice realization is visible against this contract."
          : "Invoice visibility is weak against this contract.",
      recommendation:
        params.relatedInvoices > 0
          ? "Use finance signals to evaluate contract realization."
          : "Verify billing continuity and invoice generation path.",
      severity: params.relatedInvoices > 0 ? "success" : "warning",
    },
    {
      title: "Integration health",
      detail:
        params.connectedFeeds === params.totalFeeds
          ? "Contract context is fully connected across modeled feeds."
          : "Contract context is only partially connected across modeled feeds.",
      recommendation:
        params.connectedFeeds === params.totalFeeds
          ? "Use Contract 360 as the main contract intelligence surface."
          : "Review feed gaps before relying on the page for full decision support.",
      severity: params.connectedFeeds === params.totalFeeds ? "success" : "warning",
    },
  ];
}

export function buildWorkOrderRecommendations(params: {
  relatedTechnicians: number;
  relatedRequests: number;
  relatedReports: number;
  connectedFeeds: number;
  totalFeeds: number;
}): Recommendation[] {
  return [
    {
      title: "Execution readiness",
      detail:
        params.relatedTechnicians > 0
          ? "Technician visibility is present for this work-order context."
          : "Technician visibility is weak for this work-order context.",
      recommendation:
        params.relatedTechnicians > 0
          ? "Use technician context to verify execution ownership."
          : "Strengthen assignment continuity and technician visibility.",
      severity: params.relatedTechnicians > 0 ? "success" : "warning",
    },
    {
      title: "Demand linkage",
      detail:
        params.relatedRequests > 0
          ? "Service demand is linked to the focused work-order context."
          : "Request-to-work-order continuity is weak for this context.",
      recommendation:
        params.relatedRequests > 0
          ? "Use request visibility to understand urgency and customer impact."
          : "Improve request linkage for better operational traceability.",
      severity: params.relatedRequests > 0 ? "warning" : "info",
    },
    {
      title: "Closure quality",
      detail:
        params.relatedReports > 0
          ? "Service report visibility is present for this work-order context."
          : "Closure proof is weak for this work-order context.",
      recommendation:
        params.relatedReports > 0
          ? "Use reports to validate outcome quality and knowledge capture."
          : "Increase service report completeness to improve proof and learning.",
      severity: params.relatedReports > 0 ? "success" : "warning",
    },
    {
      title: "Integration health",
      detail:
        params.connectedFeeds === params.totalFeeds
          ? "Work-order context is fully connected across modeled feeds."
          : "Work-order context is only partially connected across modeled feeds.",
      recommendation:
        params.connectedFeeds === params.totalFeeds
          ? "Use Work Order 360 as the main execution detail surface."
          : "Review feed gaps before relying on the page for full execution intelligence.",
      severity: params.connectedFeeds === params.totalFeeds ? "success" : "warning",
    },
  ];
}

export function buildVendorRecommendations(params: {
  relatedPOs: number;
  relatedItems: number;
  relatedReceipts: number;
  connectedFeeds: number;
  totalFeeds: number;
}): Recommendation[] {
  return [
    {
      title: "Supplier transaction continuity",
      detail:
        params.relatedPOs > 0
          ? "Purchase order activity is visible for this supplier context."
          : "Supplier transaction continuity is weak for this context.",
      recommendation:
        params.relatedPOs > 0
          ? "Use PO visibility to review commercial support from the supplier."
          : "Strengthen PO linkage for meaningful supplier evaluation.",
      severity: params.relatedPOs > 0 ? "success" : "warning",
    },
    {
      title: "Receipt reliability",
      detail:
        params.relatedReceipts > 0
          ? "Receipt visibility is present for this supplier context."
          : "Receipt continuity is weak for this supplier context.",
      recommendation:
        params.relatedReceipts > 0
          ? "Use receipt continuity as an early supplier reliability signal."
          : "Strengthen PO-to-receipt traceability for supplier quality analysis.",
      severity: params.relatedReceipts > 0 ? "success" : "warning",
    },
    {
      title: "Inventory support depth",
      detail:
        params.relatedItems > 0
          ? "Items are linked to this supplier context."
          : "Supplier-to-item support visibility is weak.",
      recommendation:
        params.relatedItems > 0
          ? "Use item coverage to understand execution dependency on the supplier."
          : "Strengthen supplier-to-item mapping for operational continuity analysis.",
      severity: params.relatedItems > 0 ? "success" : "warning",
    },
    {
      title: "Integration health",
      detail:
        params.connectedFeeds === params.totalFeeds
          ? "Vendor context is fully connected across modeled feeds."
          : "Vendor context is only partially connected across modeled feeds.",
      recommendation:
        params.connectedFeeds === params.totalFeeds
          ? "Use Vendor 360 as the primary supplier intelligence surface."
          : "Review feed gaps before relying on the page for full supplier analysis.",
      severity: params.connectedFeeds === params.totalFeeds ? "success" : "warning",
    },
  ];
}
