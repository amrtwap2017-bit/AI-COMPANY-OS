// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { IntegrationStatusPanel } from "../../../../../components/workspace/IntegrationStatusPanel";
import { RecordListCard } from "../../../../../components/workspace/RecordListCard";
import { SignalStrip } from "../../../../../components/workspace/SignalStrip";
import { QueueBoard } from "../../../../../components/workspace/QueueBoard";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { RoleWorkspaceBanner } from "../../../../../components/workspace/RoleWorkspaceBanner";
import { FilterBar } from "../../../../../components/workspace/FilterBar";
import { SavedViewsPanel } from "../../../../../components/workspace/SavedViewsPanel";
import { ObjectJourneyRibbon } from "../../../../../components/workspace/ObjectJourneyRibbon";
import { ObjectLinkMap } from "../../../../../components/workspace/ObjectLinkMap";
import { LinkedScenarioPanel } from "../../../../../components/workspace/LinkedScenarioPanel";
import { EntityLinkDeck } from "../../../../../components/workspace/EntityLinkDeck";
import { enterpriseApi, type SafeApiResult } from "../../../../../lib/enterprise-api";
import { asText, firstDefined, formatCount, formatCurrency, toCount, toList, toNumber } from "../../../../../lib/enterprise-format";

type State = {
  summary: SafeApiResult | null;
  pipeline: SafeApiResult | null;
  contracts: SafeApiResult | null;
};

export default function ExecutiveCommandPage() {
  const [state, setState] = useState<State>({
    summary: null,
    pipeline: null,
    contracts: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [summary, pipeline, contracts] = await Promise.all([
        enterpriseApi.executive.summary(),
        enterpriseApi.executive.pipeline(),
        enterpriseApi.executive.contracts(),
      ]);
      if (!active) return;
      setState({ summary, pipeline, contracts });
    })();
    return () => {
      active = false;
    };
  }, []);

  const contracts = toList(state.contracts?.data);

  const revenueValue = toNumber(
    state.summary?.data?.total_revenue,
    state.summary?.data?.revenue,
    state.summary?.data?.financials?.revenue,
    state.pipeline?.data?.revenue,
    state.pipeline?.data?.total_value,
  );

  const activeContractsValue = toNumber(
    state.summary?.data?.active_contracts,
    state.summary?.data?.contracts_active,
    toCount(contracts),
  );

  const openQuotesValue = toNumber(
    state.summary?.data?.open_quotes,
    state.summary?.data?.quotes_in_progress,
    state.pipeline?.data?.quotes,
    state.pipeline?.data?.open_quotes,
  );

  const riskValue = toNumber(
    state.summary?.data?.risk_alerts,
    state.summary?.data?.alerts,
    state.pipeline?.data?.risks,
  );

  const statusItems = [
    {
      label: "Executive Summary",
      ok: !!state.summary?.ok,
      detail: state.summary?.ok ? "Leadership metrics connected" : state.summary?.error || "Executive summary unavailable",
    },
    {
      label: "Pipeline Summary",
      ok: !!state.pipeline?.ok,
      detail: state.pipeline?.ok ? "Pipeline metrics connected" : state.pipeline?.error || "Pipeline summary unavailable",
    },
    {
      label: "Contracts Feed",
      ok: !!state.contracts?.ok,
      detail: state.contracts?.ok ? "Contract records connected" : state.contracts?.error || "Contract records unavailable",
    },
  ];

  const recentContracts = useMemo(
    () =>
      contracts.slice(0, 6).map((item: any) => ({
        title: asText(item.customer_name || item.client_name || item.name || item.id),
        meta: asText(item.status, "contract"),
        detail: `Contract ID: ${asText(item.id)} • Total: ${asText(firstDefined(item.total_value, item.value, item.total), "—")}`,
        href: "/contracts/360",
        entityType: "contract",
        entityId: asText(item.id, ""),
        entityName: asText(item.customer_name || item.client_name || item.name || item.id),
        connections: ["Customer", "Operations", "Invoices", "Renewal"],
      })),
    [state.contracts]
  );

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkspaceBanner
        role="Executive / Admin"
        title="Executive command mode is active"
        description="Use this leadership workspace to navigate the company through commercial momentum, contract visibility, operational signals, and supply chain pressure."
        actions={[
          "Review strategic signals",
          "Open leadership queues",
          "Inspect contract visibility",
          "Drive cross-center decisions",
        ]}
      />

      <EntityLinkDeck
        title="Enterprise Drill-down"
        subtitle="Jump directly into the most important enterprise 360 workspaces."
        items={[
          { title: "Customer 360", detail: "See the relationship across commercial, contracts, and finance.", href: "/customers/360", badge: "360" },
          { title: "Contract 360", detail: "See contract execution, demand, and financial realization.", href: "/contracts/360", badge: "360" },
          { title: "Work Order 360", detail: "See execution, technicians, and service outcomes.", href: "/operations/work-orders/360", badge: "360" },
          { title: "Vendor 360", detail: "See procurement, supplier support, and inventory relationships.", href: "/supply-chain/vendors/360", badge: "360" },
        ]}
      />

      <FilterBar
        title="Executive Filters"
        subtitle="Use future-ready controls to segment the enterprise by period, business capability, and risk posture."
        groups={[
          {
            title: "Period",
            options: [
              { label: "Today", value: "today" },
              { label: "This Week", value: "week" },
              { label: "This Month", value: "month" },
            ],
          },
          {
            title: "Risk",
            options: [
              { label: "All Risks", value: "all" },
              { label: "High", value: "high" },
              { label: "Escalated", value: "escalated" },
            ],
          },
          {
            title: "Capability",
            options: [
              { label: "Commercial", value: "commercial" },
              { label: "Operations", value: "operations" },
              { label: "Supply Chain", value: "supply-chain" },
            ],
          },
        ]}
      />

      <ObjectJourneyRibbon
        title="Enterprise Object Journey"
        subtitle="This is how leadership should understand business flow across the platform."
        steps={[
          { label: "Customer", detail: "Account and hotel relationship", tone: "success" },
          { label: "Contract", detail: "Commercial commitment and value", tone: "neutral" },
          { label: "Operations", detail: "Execution, SLA, and service outcomes", tone: "warning" },
          { label: "Supply Chain", detail: "Procurement and vendor support", tone: "warning" },
          { label: "Invoice", detail: "Commercial realization and cash signal", tone: "neutral" },
          { label: "Insight", detail: "Executive decision support", tone: "success" },
        ]}
      />

      <SignalStrip
        title="Executive Signals"
        subtitle="High-value signals derived from the currently available enterprise backend feeds."
        items={[
          { label: "Revenue Signal", value: formatCurrency(revenueValue), detail: "Current revenue or pipeline-derived value", tone: "success" },
          { label: "Active Contracts", value: formatCount(activeContractsValue), detail: "Current active or visible contracts", tone: "neutral" },
          { label: "Open Quote Signal", value: formatCount(openQuotesValue), detail: "Commercial pressure requiring leadership awareness", tone: "warning" },
          { label: "Risk Alerts", value: formatCount(riskValue), detail: "Known risk indicators from currently connected feeds", tone: "warning" },
        ]}
      />

      <ObjectLinkMap
        title="Connected Executive Object Map"
        subtitle="Leadership should see the business as a connected graph, not isolated departments."
        nodes={[
          {
            title: "Customers",
            value: formatCount(toCount(contracts)),
            detail: "Contracts currently provide the strongest visible leadership proxy for customer portfolio visibility.",
            connections: ["Contracts", "Invoices", "Operations", "Customer Health"],
            tone: "success",
          },
          {
            title: "Contracts",
            value: formatCount(activeContractsValue),
            detail: "Contracts are the bridge between commercial value and operational delivery.",
            connections: ["Customers", "Work Orders", "Procurement", "Executive Reporting"],
            tone: "neutral",
          },
          {
            title: "Operational Signals",
            value: formatCount(riskValue),
            detail: "Current risk pressure should eventually be tied to SLA, incidents, and service quality outcomes.",
            connections: ["Contracts", "Service Requests", "Technicians", "Escalations"],
            tone: "warning",
          },
          {
            title: "Commercial Pressure",
            value: formatCount(openQuotesValue),
            detail: "Pipeline and quote pressure should connect directly to forecast and revenue planning.",
            connections: ["Leads", "Quotes", "Contracts", "Forecast"],
            tone: "warning",
          },
          {
            title: "Supply Chain Exposure",
            value: "Mapped",
            detail: "The executive layer should connect spend, vendor dependency, and delivery risk to contracts and operations.",
            connections: ["Vendors", "Purchase Orders", "Inventory", "Operations"],
            tone: "neutral",
          },
          {
            title: "Executive Intelligence",
            value: "Active",
            detail: "The command workspace now presents enterprise links as a decision framework.",
            connections: ["Commercial", "Operations", "Supply Chain", "Analytics"],
            tone: "success",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <QueueBoard
            title="Decision Board"
            subtitle="Leadership priorities structured into command queues instead of isolated reports."
            columns={[
              {
                title: "Commercial Decisions",
                subtitle: "What leadership should unblock",
                cards: [
                  { title: "Open Quote Pressure", value: formatCount(openQuotesValue), detail: "Quotes and opportunities needing attention or acceleration." },
                  { title: "Pipeline Visibility", value: state.pipeline?.ok ? "Live" : "Check", detail: statusItems[1].detail },
                ],
              },
              {
                title: "Portfolio Control",
                subtitle: "What leadership should review",
                cards: [
                  { title: "Contracts In View", value: formatCount(toCount(contracts)), detail: "Contracts currently visible in the leadership workspace." },
                  { title: "Operational Escalation Signal", value: formatCount(riskValue), detail: "Use risk alerts as the executive escalation baseline." },
                ],
              },
              {
                title: "Enterprise Readiness",
                subtitle: "What needs stabilization",
                cards: [
                  { title: "Connected Executive Feeds", value: String(statusItems.filter((i) => i.ok).length), detail: "Connected executive feeds right now." },
                  { title: "Attention Required", value: String(statusItems.filter((i) => !i.ok).length), detail: "Executive integrations that still need hardening." },
                ],
              },
            ]}
          />

          <LinkedScenarioPanel
            title="Linked Business Scenarios"
            subtitle="These scenario chains show how enterprise decisions should flow across the platform."
            scenarios={[
              {
                title: "Customer Value Realization",
                detail: "A commercial relationship should become a contract, then service delivery, then financial realization, then executive insight.",
                chain: ["Customer", "Quote", "Contract", "Work Order", "Invoice", "Executive Insight"],
              },
              {
                title: "Service Risk Escalation",
                detail: "Operational issues should surface all the way to leadership when they threaten customer confidence or contract value.",
                chain: ["Service Request", "Work Order", "SLA", "Escalation", "Contract Risk", "Executive Review"],
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntegrationStatusPanel
              title="Integration Status"
              subtitle="Executive visibility must never fail silently."
              items={statusItems}
            />

            <RecordListCard
              title="Recent Contracts"
              subtitle="Leadership preview of live contract records."
              items={recentContracts}
              emptyMessage="No contract records are currently available from the live backend feed."
            />
          </div>
        </div>

        <div className="space-y-6">
          <SavedViewsPanel
            title="Saved Views"
            subtitle="Reusable leadership lenses for recurring strategic review."
            views={[
              { name: "Executive Default", detail: "Balanced strategic overview for leadership review.", status: "Default" },
              { name: "Risk Watch", detail: "Prioritize risk signals and unstable enterprise integrations.", status: "Team" },
              { name: "Commercial Pulse", detail: "Focus on quote pressure, pipeline, and contract momentum.", status: "Personal" },
            ]}
          />

          <InsightStack
            title="Executive Insights"
            subtitle="Enterprise-grade directional signals for leadership review."
            items={[
              {
                title: "Commercial priority",
                detail: state.pipeline?.ok ? "Pipeline data is connected and ready for leadership review." : "Pipeline integration still needs attention before full executive use.",
              },
              {
                title: "Contract visibility",
                detail: state.contracts?.ok ? "Contracts are visible inside the executive command workspace." : "Contract feed is not yet stable enough for leadership reliance.",
              },
              {
                title: "Platform maturity",
                detail: "The enterprise shell is stable; deeper intelligence can now be layered on top of these command surfaces.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
