// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enterpriseApi, type SafeApiResult } from "../../../../../lib/enterprise-api";
import { asText, formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { filterByField, resolveById } from "../../../../../lib/entity-relations";
import { Entity360Hero } from "../../../../../components/workspace/Entity360Hero";
import { EnterpriseHealthStrip } from "../../../../../components/workspace/EnterpriseHealthStrip";
import { RelationshipGrid } from "../../../../../components/workspace/RelationshipGrid";
import { RecordListCard } from "../../../../../components/workspace/RecordListCard";
import { LinkedScenarioPanel } from "../../../../../components/workspace/LinkedScenarioPanel";
import { IntegrationStatusPanel } from "../../../../../components/workspace/IntegrationStatusPanel";
import { AIInsightPanel } from "../../../../../components/workspace/AIInsightPanel";
import { RelationshipTimeline } from "../../../../../components/workspace/RelationshipTimeline";
import { ActivityGraphSummary } from "../../../../../components/workspace/ActivityGraphSummary";
import { EntityDetailTabs } from "../../../../../components/workspace/EntityDetailTabs";
import { KnowledgePanel } from "../../../../../components/workspace/KnowledgePanel";
import { EntitySummaryCards } from "../../../../../components/workspace/EntitySummaryCards";
import { RelatedRecordsPanel } from "../../../../../components/workspace/RelatedRecordsPanel";
import { DetailStateBanner } from "../../../../../components/workspace/DetailStateBanner";
import { buildContractRecommendations, buildReadinessLabel } from "../../../../../lib/entity-intelligence";
import { BackendAlignmentPanel } from "../../../../../components/workspace/BackendAlignmentPanel";
import { entityBackendMatrix } from "../../../../../lib/entity-backend-matrix";
import { entityViewApi } from "../../../../../lib/entity-view-api";
import { resolveContractDetailPayload } from "../../../../../lib/entity-detail-resolver";
import { EntityActionDock } from "../../../../../components/workspace/EntityActionDock";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";
import { EntityContextRail } from "../../../../../components/workspace/EntityContextRail";

type State = {
  contracts: SafeApiResult | null;
  invoices: SafeApiResult | null;
  workOrders: SafeApiResult | null;
  serviceRequests: SafeApiResult | null;
};

export default function Contract360Page() {
  const searchParams = useSearchParams();
  const [directPayload, setDirectPayload] = useState<any>(null);
  const focusId = searchParams.get("id") || "";

  const [state, setState] = useState<State>({
    contracts: null,
    invoices: null,
    workOrders: null,
    serviceRequests: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [contracts, invoices, workOrders, serviceRequests] = await Promise.all([
        enterpriseApi.commercial.contracts(),
        enterpriseApi.finance.invoices(),
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.serviceRequests(),
      ]);
      if (!active) return;
      setState({ contracts, invoices, workOrders, serviceRequests });
    })();
    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    let active = true;

    if (!focusId) {
      setDirectPayload(null);
      return;
    }

    (async () => {
      const res = await entityViewApi.contract(focusId);
      if (!active) return;
      setDirectPayload(res.ok ? resolveContractDetailPayload(res.data) : null);
    })();

    return () => {
      active = false;
    };
  }, [focusId]);

  const contracts = toList(state.contracts?.data);
  const invoices = toList(state.invoices?.data);
  const workOrders = toList(state.workOrders?.data);
  const serviceRequests = toList(state.serviceRequests?.data);

  const focusContract = useMemo(
    () => resolveById(contracts, focusId) || contracts[0] || null,
    [state, focusId]
  );

  const relatedInvoices = useMemo(
    () => filterByField(invoices, "contract_id", asText(focusContract?.id)),
    [state, asText(focusContract?.id)]
  );

  const relatedWorkOrders = useMemo(
    () => filterByField(workOrders, "contract_id", asText(focusContract?.id)),
    [state, asText(focusContract?.id)]
  );

  const relatedRequests = useMemo(
    () => filterByField(serviceRequests, "contract_id", asText(focusContract?.id)),
    [state, asText(focusContract?.id)]
  );

  const focusTitle = focusContract?.customer_name || focusContract?.client_name || focusContract?.id || "Contract 360";

  const workOrderPreview = relatedWorkOrders.slice(0, 6).map((item: any) => ({
    title: asText(item.title || item.work_order_number || item.id),
    meta: asText(item.status, "work order"),
    detail: `Priority: ${asText(item.priority)} • Type: ${asText(item.type)}`,
    href: "/operations/work-orders/360",
    entityType: "work-order",
    entityId: asText(item.id, ""),
    entityName: asText(item.title || item.work_order_number || item.id),
    connections: ["Technician", "Service Report", "Request"],
  }));

  const invoicePreview = relatedInvoices.slice(0, 6).map((item: any) => ({
    title: asText(item.invoice_number || item.id),
    meta: asText(item.status, "invoice"),
    detail: `Contract ID: ${asText(item.contract_id)} • Total: ${asText(item.total_amount || item.total || item.amount)}`,
    href: "/customers/360",
    entityType: "invoice",
    entityId: asText(item.id, ""),
    entityName: asText(item.invoice_number || item.id),
    connections: ["Contract", "Customer", "Cash"],
  }));

  const requestPreview = relatedRequests.slice(0, 6).map((item: any) => ({
    title: asText(item.title || item.id),
    meta: asText(item.status, "request"),
    detail: `Priority: ${asText(item.priority)} • Category: ${asText(item.category)}`,
    href: "/operations/command",
    entityType: "service-request",
    entityId: asText(item.id, ""),
    entityName: asText(item.title || item.id),
    connections: ["Customer", "Work Order", "SLA"],
  }));

  const statusItems = [
    { label: "Contracts", ok: !!state.contracts?.ok, detail: state.contracts?.ok ? "Contract feed connected" : state.contracts?.error || "Contract feed unavailable" },
    { label: "Invoices", ok: !!state.invoices?.ok, detail: state.invoices?.ok ? "Invoice feed connected" : state.invoices?.error || "Invoice feed unavailable" },
    { label: "Work Orders", ok: !!state.workOrders?.ok, detail: state.workOrders?.ok ? "Work order feed connected" : state.workOrders?.error || "Work order feed unavailable" },
    { label: "Service Requests", ok: !!state.serviceRequests?.ok, detail: state.serviceRequests?.ok ? "Service request feed connected" : state.serviceRequests?.error || "Service request feed unavailable" },
  ];

  return (
    <div className="space-y-6">
      <Entity360Hero
        eyebrow="Commercial + Operations"
        title={focusTitle}
        subtitle="Contract 360 connects the customer commitment to execution, service demand, and financial realization."
        badges={[
          "Contract 360",
          "Commercial + Operations + Finance",
          focusId ? "Focused by Contract ID" : "Enterprise Delivery View",
        ]}
      />


      <DetailStateBanner
        title="Focused contract state"
        subtitle="This page is resolving a contract context from the current enterprise navigation state."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from contract context" : "Default contract resolution")}
      />

      <EntityDetailTabs
        title="Contract 360 Navigation"
        subtitle="A shared enterprise tab model keeps every 360 page structured the same way."
        tabs={[
          { key: "overview", label: "Overview", description: "Contract value, execution signal, and finance realization." },
          { key: "operations", label: "Operations", description: "Work orders, service requests, and delivery pressure." },
          { key: "timeline", label: "Timeline", description: "How commitment becomes execution and billing." },
          { key: "ai", label: "AI Insights", description: "Decision support across execution, finance, and retention." },
          { key: "knowledge", label: "Knowledge", description: "Scope, SLA, standards, and contract support documents." },
        ]}
      />


      <DetailStateBanner
        title="Focused contract state"
        subtitle="This page is resolving a contract context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from contract context" : "Default contract resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.contract.title}
        subtitle={entityBackendMatrix.contract.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.contract.targetEndpoints}
        relatedObjects={entityBackendMatrix.contract.relatedObjects}
      />


      <DetailStateBanner
        title="Focused contract state"
        subtitle="This page is resolving a contract context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from contract context" : "Default contract resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.contract.title}
        subtitle={entityBackendMatrix.contract.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.contract.targetEndpoints}
        relatedObjects={entityBackendMatrix.contract.relatedObjects}
      />

      <EntityActionDock
        title="Contract Action Dock"
        subtitle="Use direct contract context to move between delivery, finance, and support flows."
        actions={[
          { title: "Open Customer 360", detail: "Inspect the wider relationship behind this contract.", href: "/customers/360", tone: "success" },
          { title: "Open Work Order 360", detail: "Inspect execution and delivery proof behind this contract.", href: "/operations/work-orders/360", tone: "warning" },
          { title: "Open Supply Chain Command", detail: "Inspect item and vendor support for delivery continuity.", href: "/supply-chain/command", tone: "neutral" },
          { title: "Open Recommendations", detail: "Review recommendation logic for this contract context.", href: "/recommendations", tone: "neutral" },
        ]}
      />

      <EntitySummaryCards
        title="Focused Contract Summary"
        subtitle="These summary cards are built from the currently focused contract context."
        items={[
          { label: "Contract", value: asText(focusContract?.id, "—"), detail: "Focused contract id" },
          { label: "Customer", value: focusTitle || "—", detail: "Focused contract customer context" },
          { label: "Work Orders", value: formatCount(toCount(relatedWorkOrders)), detail: "Operational work linked by contract id" },
          { label: "Requests", value: formatCount(toCount(relatedRequests)), detail: "Service demand linked by contract id" },
          { label: "Invoices", value: formatCount(toCount(relatedInvoices)), detail: "Billing records linked by contract id" },
        ]}
      />


      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <EnterpriseGraphNavigator
          title="Contract Navigation Graph"
          subtitle="Move across the business objects connected to this contract context."
          nodes={[
            {
              title: "Customer 360",
              detail: "Return to the broader customer relationship for this contract.",
              href: "/customers/360",
              badge: "360",
              connections: ["Customer", "Finance", "Growth"],
            },
            {
              title: "Work Order 360",
              detail: "Inspect execution and service continuity behind this contract.",
              href: "/operations/work-orders/360",
              badge: "360",
              connections: ["Execution", "Technicians", "Reports"],
            },
            {
              title: "Supply Chain Command",
              detail: "Inspect procurement and support dependencies behind delivery.",
              href: "/supply-chain/command",
              badge: "Command",
              connections: ["Items", "Vendors", "Requests"],
            },
          ]}
        />

        <EntityContextRail
          title="Contract Context Rail"
          subtitle="Focused context and next navigation clues for this contract."
          sections={[
            {
              title: "Focused Context",
              items: [
                { label: "Contract ID", value: asText(focusContract?.id, "—"), detail: "Focused contract identifier." },
                { label: "Customer", value: focusTitle || "—", detail: "Resolved customer context for this contract." },
              ],
            },
            {
              title: "Related Counts",
              items: [
                { label: "Work Orders", value: formatCount(toCount(relatedWorkOrders)), detail: "Execution records linked by contract id." },
                { label: "Requests", value: formatCount(toCount(relatedRequests)), detail: "Demand records linked by contract id." },
                { label: "Invoices", value: formatCount(toCount(relatedInvoices)), detail: "Financial records linked by contract id." },
              ],
            },
          ]}
        />
      </div>

      <EnterpriseHealthStrip
        title="Contract 360 Signals"
        subtitle="Current contract-related visibility across the enterprise."
        items={[
          { label: "Contracts", value: formatCount(toCount([focusContract].filter(Boolean))), tone: "success" },
          { label: "Work Orders", value: formatCount(toCount(relatedWorkOrders)), tone: "warning" },
          { label: "Service Requests", value: formatCount(toCount(relatedRequests)), tone: "warning" },
          { label: "Invoices", value: formatCount(toCount(relatedInvoices)), tone: "neutral" },
        ]}
      />

      <ActivityGraphSummary
        title="Contract Activity Graph"
        subtitle="A contract should be visible as the center of execution and financial realization."
        nodes={[
          { label: "Contract", value: formatCount(toCount([focusContract].filter(Boolean))), detail: "Commercial commitment visibility." },
          { label: "Execution", value: formatCount(toCount(relatedWorkOrders)), detail: "Operational realization through work orders." },
          { label: "Demand", value: formatCount(toCount(relatedRequests)), detail: "Reactive load against the contract." },
          { label: "Finance", value: formatCount(toCount(relatedInvoices)), detail: "Invoice realization linked to the contract." },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
  
      <AIInsightPanel
        title="AI Contract Insight Cards"
        subtitle="AI-style contract insight should connect execution pressure, service demand, and finance realization."
        insights={buildContractRecommendations({
          relatedWorkOrders: relatedWorkOrders.length,
          relatedRequests: relatedRequests.length,
          relatedInvoices: relatedInvoices.length,
          connectedFeeds: statusItems.filter((i) => i.ok).length,
          totalFeeds: statusItems.length,
        })}
      />


      <RelationshipTimeline
          title="Contract Relationship Timeline"
          subtitle="This timeline shows how a contract should move through the enterprise operating model."
          events={[
            { time: "Commercial", title: "Contract created", detail: "A quotation becomes a committed commercial relationship.", tone: "success" },
            { time: "Execution", title: "Service demand arrives", detail: "Planned or reactive work begins to test the contract's delivery model.", tone: "warning" },
            { time: "Operations", title: "Work executes", detail: "Technicians and teams prove the contract through field execution.", tone: "neutral" },
            { time: "Finance", title: "Invoice realized", detail: "Commercial value becomes financial realization and collections visibility.", tone: "success" },
          ]}
        />

        <KnowledgePanel
          title="Contract Knowledge and Documents"
          subtitle="Bring contract governance, SLA logic, and service documents into the 360 view."
          sections={[
            {
              title: "Commercial Governance",
              items: [
                { label: "Scope Definition", detail: "Commercial scope, service coverage, and exclusions should be visible here." },
                { label: "Approval History", detail: "Approval path and major commercial decisions should be retained here." },
              ],
            },
            {
              title: "Execution Knowledge",
              items: [
                { label: "SLA Rules", detail: "Response and completion expectations attached to the contract." },
                { label: "Service Standards", detail: "Expected service quality and review criteria for delivery." },
              ],
            },
            {
              title: "Financial Support",
              items: [
                { label: "Billing Rules", detail: "Invoice cadence, special terms, and finance dependencies." },
                { label: "Renewal Support", detail: "Renewal preparation notes and performance review context." },
              ],
            },
          ]}
        />
      </div>

      <RelationshipGrid
        title="Contract Relationship Map"
        subtitle="Contracts should be understood as the bridge between commercial commitment and real delivery."
        items={[
          {
            title: "Customer",
            value: "Linked",
            detail: "The contract defines the relationship framework and customer commitment.",
            links: ["Customer", "Quote", "Approvals", "Renewal"],
          },
          {
            title: "Execution",
            value: formatCount(toCount(relatedWorkOrders)),
            detail: "Operational work should prove that the contract is being delivered.",
            links: ["Work Orders", "Technicians", "Reports", "SLA"],
          },
          {
            title: "Demand",
            value: formatCount(toCount(relatedRequests)),
            detail: "Reactive service demand tests how the contract performs in real life.",
            links: ["Requests", "Escalations", "Incidents", "Service Quality"],
          },
          {
            title: "Finance",
            value: formatCount(toCount(relatedInvoices)),
            detail: "Invoices represent commercial realization and collections exposure.",
            links: ["Invoices", "Payments", "Cash Signal", "Risk"],
          },
          {
            title: "Supply Chain",
            value: "Mapped",
            detail: "The contract should ultimately connect to materials, vendors, and procurement support.",
            links: ["Items", "Vendors", "Purchase Orders", "Receipts"],
          },
          {
            title: "Retention",
            value: "Next",
            detail: "The contract should become the foundation for renewal intelligence.",
            links: ["Health", "Recommendations", "Performance", "Renewal"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <IntegrationStatusPanel
          title="Integration Status"
          subtitle="Contract 360 should expose every dependency clearly."
          items={statusItems}
        />

        <LinkedScenarioPanel
          title="Contract Scenarios"
          subtitle="Representative enterprise flows for contract-driven work."
          scenarios={[
            {
              title: "Contract to Execution",
              detail: "A contract should drive work creation, resource allocation, and service proof.",
              chain: ["Contract", "Work Order", "Technician", "Service Report", "Customer Outcome"],
            },
            {
              title: "Contract to Finance",
              detail: "A contract should translate into invoice generation and commercial realization.",
              chain: ["Contract", "Invoice", "Payment Signal", "Executive Review"],
            },
          ]}
        />
      </div>

      <RelatedRecordsPanel
        title="Live Related Records"
        subtitle="These records are filtered around the focused contract id using available live relations."
        groups={[
          {
            title: "Related Work Orders",
            countLabel: formatCount(toCount(relatedWorkOrders)),
            records: workOrderPreview,
            emptyMessage: "No work orders are linked to the focused contract id.",
          },
          {
            title: "Related Service Requests",
            countLabel: formatCount(toCount(relatedRequests)),
            records: requestPreview,
            emptyMessage: "No service requests are linked to the focused contract id.",
          },
          {
            title: "Related Invoices",
            countLabel: formatCount(toCount(relatedInvoices)),
            records: invoicePreview,
            emptyMessage: "No invoices are linked to the focused contract id.",
          },
        ]}
      />
    </div>
  );
}
