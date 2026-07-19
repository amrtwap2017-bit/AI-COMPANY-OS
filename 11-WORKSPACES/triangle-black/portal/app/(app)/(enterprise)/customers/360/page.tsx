
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enterpriseApi, type SafeApiResult } from "../../../../../lib/enterprise-api";
import { asText, formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { customerKeyOf, filterByField, firstText, resolveById, sameText, uniqueNonEmpty } from "../../../../../lib/entity-relations";
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
import { buildCustomerRecommendations, buildReadinessLabel } from "../../../../../lib/entity-intelligence";
import { BackendAlignmentPanel } from "../../../../../components/workspace/BackendAlignmentPanel";
import { entityBackendMatrix } from "../../../../../lib/entity-backend-matrix";
import { entityViewApi } from "../../../../../lib/entity-view-api";
import { resolveCustomerDetailPayload } from "../../../../../lib/entity-detail-resolver";
import { EntityActionDock } from "../../../../../components/workspace/EntityActionDock";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";
import { EntityContextRail } from "../../../../../components/workspace/EntityContextRail";

type State = {
  leads: SafeApiResult | null;
  quotes: SafeApiResult | null;
  contracts: SafeApiResult | null;
  invoices: SafeApiResult | null;
};

export default function Customer360Page() {
  const searchParams = useSearchParams();
  const [directPayload, setDirectPayload] = useState<any>(null);
  const entity = searchParams.get("entity") || "";
  const focusId = searchParams.get("id") || "";

  const [state, setState] = useState<State>({
    leads: null,
    quotes: null,
    contracts: null,
    invoices: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [leads, quotes, contracts, invoices] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
        enterpriseApi.finance.invoices(),
      ]);
      if (!active) return;
      setState({ leads, quotes, contracts, invoices });
    })();
    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    let active = true;

    if (!entity || !focusId) {
      setDirectPayload(null);
      return;
    }

    (async () => {
      const res = await entityViewApi.customerContext(entity, focusId);
      if (!active) return;
      setDirectPayload(res.ok ? resolveCustomerDetailPayload(res.data) : null);
    })();

    return () => {
      active = false;
    };
  }, [entity, focusId]);

  const leads = toList(state.leads?.data);
  const quotes = toList(state.quotes?.data);
  const contracts = toList(state.contracts?.data);
  const invoices = toList(state.invoices?.data);

  const focusRecord = useMemo(() => {
    if (entity === "lead") return resolveById(leads, focusId);
    if (entity === "quote") return resolveById(quotes, focusId);
    if (entity === "contract") return resolveById(contracts, focusId);
    if (entity === "invoice") return resolveById(invoices, focusId);
    return contracts[0] || quotes[0] || leads[0] || invoices[0] || null;
  }, [entity, focusId, state]);

  const focusCustomerKey = customerKeyOf(focusRecord) || customerKeyOf(contracts[0]) || customerKeyOf(quotes[0]) || customerKeyOf(leads[0]) || "Enterprise Customer";

  const relatedContracts = useMemo(
    () => contracts.filter((item: any) => sameText(customerKeyOf(item), focusCustomerKey)),
    [state, focusCustomerKey]
  );

  const contractIds = uniqueNonEmpty(relatedContracts.map((item: any) => item?.id));

  const relatedQuotes = useMemo(
    () =>
      quotes.filter((item: any) => {
        if (sameText(customerKeyOf(item), focusCustomerKey)) return true;
        if (entity === "lead" && focusId && asText(item.lead_id) === focusId) return true;
        return false;
      }),
    [state, focusCustomerKey, entity, focusId]
  );

  const relatedLeads = useMemo(
    () => leads.filter((item: any) => sameText(customerKeyOf(item), focusCustomerKey)),
    [state, focusCustomerKey]
  );

  const relatedInvoices = useMemo(
    () =>
      invoices.filter((item: any) => {
        const contractId = asText(item.contract_id);
        return contractIds.includes(contractId);
      }),
    [state, contractIds.join("|")]
  );

  const focusName = firstText(
    customerKeyOf(focusRecord),
    customerKeyOf(relatedContracts[0]),
    customerKeyOf(relatedQuotes[0]),
    customerKeyOf(relatedLeads[0]),
    "Enterprise Customer 360"
  );

  const contractPreview = relatedContracts.slice(0, 6).map((item: any) => ({
    title: asText(item.customer_name || item.client_name || item.id),
    meta: asText(item.status, "contract"),
    detail: `Contract ID: ${asText(item.id)} • Value: ${asText(item.total_value || item.total || item.value)}`,
    href: "/contracts/360",
    entityType: "contract",
    entityId: asText(item.id, ""),
    entityName: asText(item.customer_name || item.client_name || item.id),
    connections: ["Work Orders", "Invoices", "Health"],
  }));

  const quotePreview = relatedQuotes.slice(0, 6).map((item: any) => ({
    title: asText(item.title || item.customer_name || item.id),
    meta: asText(item.status, "quote"),
    detail: `Lead ID: ${asText(item.lead_id)} • Total: ${asText(item.total)}`,
    href: "/commercial/command",
    entityType: "quote",
    entityId: asText(item.id, ""),
    entityName: asText(item.title || item.customer_name || item.id),
    connections: ["Lead", "Contract", "Revenue"],
  }));

  const invoicePreview = relatedInvoices.slice(0, 6).map((item: any) => ({
    title: asText(item.invoice_number || item.id),
    meta: asText(item.status, "invoice"),
    detail: `Contract ID: ${asText(item.contract_id)} • Total: ${asText(item.total_amount || item.total || item.amount)}`,
    href: "/customers/360",
    entityType: "invoice",
    entityId: asText(item.id, ""),
    entityName: asText(item.invoice_number || item.id),
    connections: ["Contract", "Cash", "Health"],
  }));

  const statusItems = [
    { label: "Leads", ok: !!state.leads?.ok, detail: state.leads?.ok ? "Lead feed connected" : state.leads?.error || "Lead feed unavailable" },
    { label: "Quotes", ok: !!state.quotes?.ok, detail: state.quotes?.ok ? "Quote feed connected" : state.quotes?.error || "Quote feed unavailable" },
    { label: "Contracts", ok: !!state.contracts?.ok, detail: state.contracts?.ok ? "Contract feed connected" : state.contracts?.error || "Contract feed unavailable" },
    { label: "Invoices", ok: !!state.invoices?.ok, detail: state.invoices?.ok ? "Invoice feed connected" : state.invoices?.error || "Invoice feed unavailable" },
  ];

  return (
    <div className="space-y-6">
      <Entity360Hero
        eyebrow="Customer Success Center"
        title={focusName}
        subtitle="Customer 360 connects commercial history, contracts, financial records, and execution readiness into one enterprise account view."
        badges={[
          "Customer 360",
          "Commercial + Contracts + Finance",
          entity ? `Focused by ${entity}` : "Enterprise Relationship View",
        ]}
      />


      <DetailStateBanner
        title="Focused customer state"
        subtitle="This page is resolving a customer context from the current enterprise navigation state."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (entity ? `Focused from ${entity}` : "Default customer resolution")}
      />

      <EntityDetailTabs
        title="Customer 360 Navigation"
        subtitle="A shared enterprise tab model keeps every 360 page structured the same way."
        tabs={[
          { key: "overview", label: "Overview", description: "Relationship health, contract value, and finance visibility." },
          { key: "relationships", label: "Relationships", description: "How leads, quotes, contracts, invoices, and operations connect around the customer." },
          { key: "timeline", label: "Timeline", description: "How the relationship evolves from acquisition to value realization." },
          { key: "ai", label: "AI Insights", description: "Decision support across growth, finance, and retention signals." },
          { key: "knowledge", label: "Knowledge", description: "Account plans, reviews, policies, and customer-facing deliverables." },
        ]}
      />


      <DetailStateBanner
        title="Focused customer state"
        subtitle="This page is resolving a customer context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (entity ? `Focused from ${entity}` : "Default customer resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.customer.title}
        subtitle={entityBackendMatrix.customer.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.customer.targetEndpoints}
        relatedObjects={entityBackendMatrix.customer.relatedObjects}
      />


      <DetailStateBanner
        title="Focused customer state"
        subtitle="This page is resolving a customer context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (entity ? `Focused from ${entity}` : "Default customer resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.customer.title}
        subtitle={entityBackendMatrix.customer.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.customer.targetEndpoints}
        relatedObjects={entityBackendMatrix.customer.relatedObjects}
      />

      <EntityActionDock
        title="Customer Action Dock"
        subtitle="Use direct entity context to move from relationship review into the next best enterprise action."
        actions={[
          { title: "Open Commercial Command", detail: "Return to commercial control for this relationship.", href: "/commercial/command", tone: "success" },
          { title: "Open Contract 360", detail: "Inspect the strongest related contract commitment.", href: "/contracts/360", tone: "neutral" },
          { title: "Open Recommendations", detail: "Review recommendation logic for this relationship context.", href: "/recommendations", tone: "warning" },
          { title: "Open My Day", detail: "Return to your personal workspace and continue multi-object review.", href: "/workspace/my-day", tone: "neutral" },
        ]}
      />

      <EntitySummaryCards
        title="Focused Customer Summary"
        subtitle="These summary cards are built from the currently focused customer context."
        items={[
          { label: "Customer", value: focusName || "—", detail: "Focused relationship context" },
          { label: "Leads", value: formatCount(toCount(relatedLeads)), detail: "Lead records related to this customer context" },
          { label: "Quotes", value: formatCount(toCount(relatedQuotes)), detail: "Quote records related to this customer context" },
          { label: "Contracts", value: formatCount(toCount(relatedContracts)), detail: "Contract records related to this customer context" },
          { label: "Invoices", value: formatCount(toCount(relatedInvoices)), detail: "Invoice records linked through related contracts" },
        ]}
      />


      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <EnterpriseGraphNavigator
          title="Customer Navigation Graph"
          subtitle="Move across the business objects connected to this customer context."
          nodes={[
            {
              title: "Commercial Command",
              detail: "Return to the lead, quote, and contract control surface.",
              href: "/commercial/command",
              badge: "Command",
              connections: ["Leads", "Quotes", "Pipeline"],
            },
            {
              title: "Contract 360",
              detail: "Inspect customer commitments and delivery continuity.",
              href: "/contracts/360",
              badge: "360",
              connections: ["Contracts", "Invoices", "Execution"],
            },
            {
              title: "Work Order 360",
              detail: "Inspect the execution layer affecting customer experience.",
              href: "/operations/work-orders/360",
              badge: "360",
              connections: ["Work Orders", "Reports", "SLA"],
            },
          ]}
        />

        <EntityContextRail
          title="Customer Context Rail"
          subtitle="Focused context and next navigation clues for this customer."
          sections={[
            {
              title: "Focused Context",
              items: [
                { label: "Entity Type", value: entity || "customer", detail: "Current query-param source for this page focus." },
                { label: "Focused Key", value: focusName || "—", detail: "Resolved customer-facing relationship name." },
              ],
            },
            {
              title: "Related Counts",
              items: [
                { label: "Leads", value: formatCount(toCount(relatedLeads)), detail: "Lead records linked to this customer context." },
                { label: "Contracts", value: formatCount(toCount(relatedContracts)), detail: "Contract records linked to this customer context." },
                { label: "Invoices", value: formatCount(toCount(relatedInvoices)), detail: "Billing records linked through related contracts." },
              ],
            },
          ]}
        />
      </div>

      <EnterpriseHealthStrip
        title="Customer 360 Signals"
        subtitle="Current customer-related visibility across the enterprise."
        items={[
          { label: "Leads", value: formatCount(toCount(relatedLeads)), tone: "success" },
          { label: "Quotes", value: formatCount(toCount(relatedQuotes)), tone: "warning" },
          { label: "Contracts", value: formatCount(toCount(relatedContracts)), tone: "success" },
          { label: "Invoices", value: formatCount(toCount(relatedInvoices)), tone: "neutral" },
        ]}
      />

      <ActivityGraphSummary
        title="Relationship Activity Graph"
        subtitle="A customer relationship should be visible as a connected growth graph across the enterprise."
        nodes={[
          { label: "Demand", value: formatCount(toCount(relatedLeads)), detail: "Lead signals entering the commercial engine." },
          { label: "Commercial", value: formatCount(toCount(relatedQuotes)), detail: "Quotes building the relationship commercially." },
          { label: "Commitment", value: formatCount(toCount(relatedContracts)), detail: "Contracts turning demand into delivery promises." },
          { label: "Finance", value: formatCount(toCount(relatedInvoices)), detail: "Invoices representing realized value and customer financial signal." },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
  
      <AIInsightPanel
        title="AI Customer Insight Cards"
        subtitle="AI-native account thinking should connect commercial, financial, and delivery signals."
        insights={buildCustomerRecommendations({
          relatedLeads: relatedLeads.length,
          relatedQuotes: relatedQuotes.length,
          relatedContracts: relatedContracts.length,
          relatedInvoices: relatedInvoices.length,
          connectedFeeds: statusItems.filter((i) => i.ok).length,
          totalFeeds: statusItems.length,
        })}
      />


      <RelationshipTimeline
          title="Customer Relationship Timeline"
          subtitle="This timeline shows the enterprise journey from commercial demand to value realization."
          events={[
            { time: "Lead", title: "Demand captured", detail: "Customer interest enters the platform through lead intake and qualification.", tone: "success" },
            { time: "Quote", title: "Commercial offer created", detail: "Technical-commercial quotation frames the relationship opportunity.", tone: "warning" },
            { time: "Contract", title: "Commitment formalized", detail: "Commercial promise becomes a contract ready for operational follow-through.", tone: "success" },
            { time: "Invoice", title: "Financial realization", detail: "The relationship moves into billable value and payment visibility.", tone: "neutral" },
          ]}
        />

        <KnowledgePanel
          title="Customer Knowledge and Documents"
          subtitle="Bring customer-facing knowledge, templates, and relationship assets into the 360 view."
          sections={[
            {
              title: "Account Knowledge",
              items: [
                { label: "Account Plan", detail: "Strategic customer notes, relationship goals, and growth posture." },
                { label: "Meeting Notes", detail: "Meeting summaries, calls, and account history should live here over time." },
              ],
            },
            {
              title: "Commercial Documents",
              items: [
                { label: "Quotes and Proposals", detail: "Commercial proposals and customer-facing offer documents." },
                { label: "Contracts and Amendments", detail: "Active agreement set and future change history." },
              ],
            },
            {
              title: "Service Intelligence", 
              items: [
                { label: "Service Reviews", detail: "Periodic reviews and executive summaries should be attached here over time." },
                { label: "Recommendations", detail: "Future upsell and improvement proposals should enrich this layer." },
              ],
            },
          ]}
        />
      </div>

      <RelationshipGrid
        title="Customer Relationship Map"
        subtitle="The customer should be visible as a connected enterprise relationship, not only as a sales record."
        items={[
          {
            title: "Commercial",
            value: formatCount(toCount(relatedLeads)),
            detail: "Lead and quote activity represent customer acquisition and relationship momentum.",
            links: ["Leads", "Quotes", "Site Visits", "Timeline"],
          },
          {
            title: "Contracts",
            value: formatCount(toCount(relatedContracts)),
            detail: "Contracts are the commercial backbone of the customer relationship.",
            links: ["Approvals", "Execution", "Renewal", "Value"],
          },
          {
            title: "Finance",
            value: formatCount(toCount(relatedInvoices)),
            detail: "Invoices reflect realized financial relationship and payment exposure.",
            links: ["Invoices", "Cash Signal", "Collections", "Health"],
          },
          {
            title: "Operations",
            value: "Connected",
            detail: "Customer experience depends on execution quality, responsiveness, and SLA discipline.",
            links: ["Work Orders", "Requests", "Service Reports", "SLA"],
          },
          {
            title: "Assets",
            value: "Next",
            detail: "Assets and hotel systems should become part of the customer context.",
            links: ["Hotels", "Assets", "Maintenance", "Warranty"],
          },
          {
            title: "Growth",
            value: "Next",
            detail: "Recommendations, renewals, and upsell intelligence should complete the loop.",
            links: ["Recommendations", "Renewal", "Upsell", "AI"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <IntegrationStatusPanel
          title="Integration Status"
          subtitle="Customer 360 surfaces should never fail silently."
          items={statusItems}
        />

        <LinkedScenarioPanel
          title="Customer Scenarios"
          subtitle="Representative cross-system journeys for an enterprise customer."
          scenarios={[
            {
              title: "Acquire to Execute",
              detail: "A customer enters as demand, receives a quote, signs a contract, and moves into operational delivery.",
              chain: ["Lead", "Quote", "Contract", "Work Order", "Service Report"],
            },
            {
              title: "Value to Renewal",
              detail: "Delivered work and commercial value should eventually influence retention and expansion.",
              chain: ["Contract", "Invoice", "Service Outcome", "Customer Health", "Renewal"],
            },
          ]}
        />
      </div>

      <RelatedRecordsPanel
        title="Live Related Records"
        subtitle="These records are filtered around the focused customer context using available live IDs and customer keys."
        groups={[
          {
            title: "Related Contracts",
            countLabel: formatCount(toCount(relatedContracts)),
            records: contractPreview,
            emptyMessage: "No contract records are related to the focused customer context.",
          },
          {
            title: "Related Quotes",
            countLabel: formatCount(toCount(relatedQuotes)),
            records: quotePreview,
            emptyMessage: "No quote records are related to the focused customer context.",
          },
          {
            title: "Related Invoices",
            countLabel: formatCount(toCount(relatedInvoices)),
            records: invoicePreview,
            emptyMessage: "No invoice records are linked to the focused customer context.",
          },
        ]}
      />
    </div>
  );
}
