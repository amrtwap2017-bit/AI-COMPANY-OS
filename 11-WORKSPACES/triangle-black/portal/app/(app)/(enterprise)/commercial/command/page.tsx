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
import { asText, formatCount, toCount, toList } from "../../../../../lib/enterprise-format";

type State = {
  leads: SafeApiResult | null;
  quotes: SafeApiResult | null;
  contracts: SafeApiResult | null;
};

export default function CommercialCommandPage() {
  const [state, setState] = useState<State>({
    leads: null,
    quotes: null,
    contracts: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [leads, quotes, contracts] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
      ]);
      if (!active) return;
      setState({ leads, quotes, contracts });
    })();
    return () => {
      active = false;
    };
  }, []);

  const leads = toList(state.leads?.data);
  const quotes = toList(state.quotes?.data);
  const contracts = toList(state.contracts?.data);

  const leadPreview = useMemo(
    () =>
      leads.slice(0, 6).map((item: any) => ({
        title: asText(item.company_name || item.name || item.email || item.id),
        meta: asText(item.status, "lead"),
        detail: `Source: ${asText(item.source)} • Priority: ${asText(item.priority)}`,
        href: "/commercial/command",
        entityType: "lead",
        entityId: asText(item.id, ""),
        entityName: asText(item.company_name || item.name || item.email || item.id),
        connections: ["Quote", "Visit", "Customer", "Timeline"],
      })),
    [state.leads]
  );

  const quotePreview = useMemo(
    () =>
      quotes.slice(0, 6).map((item: any) => ({
        title: asText(item.title || item.customer_name || item.id),
        meta: asText(item.status, "quote"),
        detail: `Total: ${asText(item.total)} • Lead ID: ${asText(item.lead_id)}`,
        href: "/commercial/command",
        entityType: "quote",
        entityId: asText(item.id, ""),
        entityName: asText(item.title || item.customer_name || item.id),
        connections: ["Lead", "Contract", "Approval", "Revenue"],
      })),
    [state.quotes]
  );

  const statusItems = [
    {
      label: "Leads Feed",
      ok: !!state.leads?.ok,
      detail: state.leads?.ok ? "Lead records connected" : state.leads?.error || "Lead feed unavailable",
    },
    {
      label: "Quotes Feed",
      ok: !!state.quotes?.ok,
      detail: state.quotes?.ok ? "Quote records connected" : state.quotes?.error || "Quote feed unavailable",
    },
    {
      label: "Contracts Feed",
      ok: !!state.contracts?.ok,
      detail: state.contracts?.ok ? "Contract records connected" : state.contracts?.error || "Contract feed unavailable",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkspaceBanner
        role="Commercial Manager / Admin"
        title="Commercial command mode is active"
        description="Use this workspace to control pipeline movement, quotation pressure, contract continuity, and customer relationship momentum."
        actions={[
          "Review lead momentum",
          "Unblock quotations",
          "Track contract progression",
          "Coordinate account actions",
        ]}
      />

      <EntityLinkDeck
        title="Enterprise Drill-down"
        subtitle="Jump directly into customer and contract-centered enterprise views."
        items={[
          { title: "Customer 360", detail: "See the relationship across commercial, contracts, and finance.", href: "/customers/360", badge: "360" },
          { title: "Contract 360", detail: "See the commercial promise become operational delivery.", href: "/contracts/360", badge: "360" },
          { title: "Work Order 360", detail: "See execution follow-through and service detail.", href: "/operations/work-orders/360", badge: "360" },
          { title: "Vendor 360", detail: "See supply support and supplier dependency in context.", href: "/supply-chain/vendors/360", badge: "360" },
        ]}
      />

      <FilterBar
        title="Commercial Filters"
        subtitle="Shape the commercial command surface around priority, status, source, and conversion pressure."
        groups={[
          {
            title: "Lead Status",
            options: [
              { label: "All", value: "all" },
              { label: "New", value: "new" },
              { label: "Qualified", value: "qualified" },
              { label: "Assigned", value: "assigned" },
            ],
          },
          {
            title: "Quote Status",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Review", value: "review" },
              { label: "Sent", value: "sent" },
              { label: "Approved", value: "approved" },
            ],
          },
          {
            title: "Source",
            options: [
              { label: "Referral", value: "referral" },
              { label: "Direct", value: "direct" },
              { label: "Web", value: "web" },
            ],
          },
        ]}
      />

      <ObjectJourneyRibbon
        title="Commercial Object Journey"
        subtitle="This is how customer acquisition should move through the enterprise platform."
        steps={[
          { label: "Lead", detail: "Demand enters the company", tone: "success" },
          { label: "Visit", detail: "Site and need qualification", tone: "neutral" },
          { label: "Quote", detail: "Commercial and technical offer", tone: "warning" },
          { label: "Contract", detail: "Formal commitment", tone: "success" },
          { label: "Operations", detail: "Execution handoff", tone: "warning" },
          { label: "Growth", detail: "Retention and upsell", tone: "neutral" },
        ]}
      />

      <SignalStrip
        title="Commercial Signals"
        subtitle="Core commercial signals built from live lead, quote, and contract data."
        items={[
          { label: "Leads", value: formatCount(toCount(leads)), detail: "Current visible lead records", tone: "success" },
          { label: "Quotes", value: formatCount(toCount(quotes)), detail: "Current visible quotation records", tone: "warning" },
          { label: "Contracts", value: formatCount(toCount(contracts)), detail: "Current visible contract records", tone: "neutral" },
          { label: "Connected Feeds", value: String(statusItems.filter((i) => i.ok).length), detail: "Commercial backend feeds online", tone: "success" },
        ]}
      />

      <ObjectLinkMap
        title="Connected Commercial Object Map"
        subtitle="Commercial work should be visible as a connected customer progression model."
        nodes={[
          {
            title: "Leads",
            value: formatCount(toCount(leads)),
            detail: "Demand entry point for the commercial engine.",
            connections: ["Accounts", "Site Visits", "Quotes", "Activity Timeline"],
            tone: "success",
          },
          {
            title: "Quotes",
            value: formatCount(toCount(quotes)),
            detail: "Commercial proposals linking customer need to service scope.",
            connections: ["Leads", "Approvals", "Contracts", "Revenue Forecast"],
            tone: "warning",
          },
          {
            title: "Contracts",
            value: formatCount(toCount(contracts)),
            detail: "Commercial success converted into operational responsibility.",
            connections: ["Quotes", "Work Orders", "Invoices", "Customer Health"],
            tone: "neutral",
          },
          {
            title: "Customer Timeline",
            value: "Active",
            detail: "Commercial history should connect meetings, visits, quotations, and execution outcomes.",
            connections: ["Leads", "Quotes", "Contracts", "Operations"],
            tone: "success",
          },
          {
            title: "Operations Handoff",
            value: "Mapped",
            detail: "Commercial closure must hand into service execution without fragmentation.",
            connections: ["Contracts", "Work Orders", "Service Requests", "SLA"],
            tone: "warning",
          },
          {
            title: "Growth Signals",
            value: "Next",
            detail: "The platform should turn service outcomes into retention and upsell intelligence.",
            connections: ["Contracts", "Service Reports", "Recommendations", "Renewals"],
            tone: "neutral",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <QueueBoard
            title="Commercial Command Board"
            subtitle="Prioritized commercial actions grouped by customer journey."
            columns={[
              {
                title: "Lead Momentum",
                subtitle: "Top-of-funnel pressure",
                cards: [
                  { title: "Lead Feed Status", value: state.leads?.ok ? "Live" : "Check", detail: statusItems[0].detail },
                  { title: "Visible Leads", value: formatCount(toCount(leads)), detail: "Current lead visibility available to the workspace." },
                ],
              },
              {
                title: "Quote Control",
                subtitle: "Mid-funnel pressure",
                cards: [
                  { title: "Quote Feed Status", value: state.quotes?.ok ? "Live" : "Check", detail: statusItems[1].detail },
                  { title: "Visible Quotes", value: formatCount(toCount(quotes)), detail: "Quotation visibility for management review." },
                ],
              },
              {
                title: "Contract Conversion",
                subtitle: "Late-funnel pressure",
                cards: [
                  { title: "Contract Feed Status", value: state.contracts?.ok ? "Live" : "Check", detail: statusItems[2].detail },
                  { title: "Visible Contracts", value: formatCount(toCount(contracts)), detail: "Contracts represented in the command surface." },
                ],
              },
            ]}
          />

          <LinkedScenarioPanel
            title="Linked Business Scenarios"
            subtitle="Commercial work should be understood as linked business movement, not page-by-page work."
            scenarios={[
              {
                title: "Commercial to Operations Handoff",
                detail: "A successful quote should become a contract, then a service program, then an operational relationship.",
                chain: ["Lead", "Quote", "Contract", "Work Order", "Service Report", "Customer Health"],
              },
              {
                title: "Customer Growth Loop",
                detail: "Customer history should influence future proposals, renewals, and account planning.",
                chain: ["Customer", "Meetings", "Quote", "Contract", "Recommendations", "Renewal"],
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntegrationStatusPanel
              title="Integration Status"
              subtitle="Commercial surfaces now expose feed quality instead of failing silently."
              items={statusItems}
            />

            <RecordListCard
              title="Lead Preview"
              subtitle="Live lead records currently available to the command workspace."
              items={leadPreview}
              emptyMessage="No lead records are currently available from the live backend feed."
            />
          </div>

          <RecordListCard
            title="Quote Preview"
            subtitle="Live quotation records currently available to the command workspace."
            items={quotePreview}
            emptyMessage="No quotation records are currently available from the live backend feed."
          />
        </div>

        <div className="space-y-6">
          <SavedViewsPanel
            title="Saved Views"
            subtitle="Reusable commercial lenses for pipeline management."
            views={[
              { name: "Commercial Default", detail: "Balanced command view across leads, quotes, and contracts.", status: "Default" },
              { name: "Quote Pressure", detail: "Prioritize review and sent-stage quotations requiring action.", status: "Team" },
              { name: "Qualified Lead Watch", detail: "Focus on qualified leads needing next-step progression.", status: "Personal" },
            ]}
          />

          <InsightStack
            title="Commercial Insights"
            subtitle="Management-oriented observations from the commercial command surface."
            items={[
              {
                title: "Lead visibility",
                detail: state.leads?.ok ? "The new commercial workspace can now inspect live lead records." : "Lead integration remains unstable and should be hardened before broad team rollout.",
              },
              {
                title: "Quote pipeline",
                detail: state.quotes?.ok ? "Quote data is now present inside the center-native command workspace." : "Quotation integration requires backend review.",
              },
              {
                title: "Lifecycle continuity",
                detail: state.contracts?.ok ? "Commercial to contract continuity is visible in the center layer." : "Contract visibility is still incomplete and needs further integration work.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
