// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { executiveIntelligenceApi } from "../../../../../lib/executive-intelligence-api";
import { formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { ReviewSignalLane } from "../../../../../components/workspace/ReviewSignalLane";
import { WatchlistPanel } from "../../../../../components/workspace/WatchlistPanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";
import { ExecutiveSignalBoard } from "../../../../../components/workspace/ExecutiveSignalBoard";

export default function CommercialReviewIntelligencePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [leadsRes, quotesRes, contractsRes, watchRes] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
        executiveIntelligenceApi.watchlists(),
      ]);

      if (!active) return;

      setLeads(toList(leadsRes.data));
      setQuotes(toList(quotesRes.data));
      setContracts(toList(contractsRes.data));

      const allWatch = Array.isArray((watchRes as any)?.watchlists) ? (watchRes as any).watchlists : Array.isArray((watchRes as any)?.data?.watchlists) ? (watchRes as any).data.watchlists : [];
      const filtered = allWatch.filter((item: any) => {
        const title = String(item?.title || "").toLowerCase();
        const detail = String(item?.detail || "").toLowerCase();
        return (
          title.includes("commercial") ||
          title.includes("growth") ||
          title.includes("quote") ||
          title.includes("contract") ||
          detail.includes("quote") ||
          detail.includes("contract") ||
          detail.includes("commercial")
        );
      });
      setWatchlists(filtered);
    })();

    return () => {
      active = false;
    };
  }, []);

  const leadCount = toCount(leads);
  const quoteCount = toCount(quotes);
  const contractCount = toCount(contracts);

  const lanes = useMemo(() => {
    return [
      {
        title: "Demand Lane",
        subtitle: "Lead intake, qualification, and top-of-funnel signal",
        items: [
          {
            label: "Visible Leads",
            value: formatCount(leadCount),
            detail: "Lead volume visible to the commercial intelligence layer.",
            tone: leadCount > 0 ? "success" as const : "warning" as const,
          },
          {
            label: "Qualification Signal",
            value: formatCount(Math.max(0, Math.floor(leadCount * 0.5))),
            detail: "Estimated subset likely needing next-step progression.",
            tone: "warning" as const,
          },
        ],
      },
      {
        title: "Proposal Lane",
        subtitle: "Quotes, review, and approval pressure",
        items: [
          {
            label: "Visible Quotes",
            value: formatCount(quoteCount),
            detail: "Quote volume visible to the intelligence surface.",
            tone: quoteCount > 0 ? "warning" as const : "neutral" as const,
          },
          {
            label: "Review Pressure",
            value: formatCount(Math.max(0, Math.floor(quoteCount * 0.4))),
            detail: "Estimated subset likely requiring review or approval.",
            tone: "warning" as const,
          },
        ],
      },
      {
        title: "Commitment Lane",
        subtitle: "Contracts and conversion confidence",
        items: [
          {
            label: "Visible Contracts",
            value: formatCount(contractCount),
            detail: "Converted commitment visible to the portal.",
            tone: contractCount > 0 ? "success" as const : "warning" as const,
          },
          {
            label: "Handoff Signal",
            value: formatCount(Math.max(0, Math.floor(contractCount * 0.3))),
            detail: "Estimated subset likely needing strong delivery handoff.",
            tone: "success" as const,
          },
        ],
      },
      {
        title: "Attention Lane",
        subtitle: "Watch items and decision friction",
        items: [
          {
            label: "Commercial Watch Items",
            value: formatCount(watchlists.length),
            detail: "Watchlist entries related to growth, quotes, or contracts.",
            tone: watchlists.length > 0 ? "warning" as const : "success" as const,
          },
          {
            label: "Decision Friction",
            value: formatCount(Math.max(0, Math.floor((quoteCount + contractCount) * 0.25))),
            detail: "Estimated visible commercial friction needing human action.",
            tone: "warning" as const,
          },
        ],
      },
    ];
  }, [leadCount, quoteCount, contractCount, watchlists]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Commercial Center"
        title="Commercial Review Intelligence"
        subtitle="A higher-order review surface for commercial movement, proposal pressure, commitment visibility, and growth attention."
        badges={[
          "Commercial Intelligence",
          "Review Signals",
          "Decision Friction",
          "Growth Attention",
        ]}
      />

      <ExecutiveSignalBoard
        title="Commercial Core Signals"
        subtitle="Quick commercial signal visibility before deeper review."
        items={[
          { label: "Leads", value: formatCount(leadCount), detail: "Visible demand intake" },
          { label: "Quotes", value: formatCount(quoteCount), detail: "Visible proposal pressure" },
          { label: "Contracts", value: formatCount(contractCount), detail: "Visible converted commitment" },
          { label: "Watch Items", value: formatCount(watchlists.length), detail: "Visible commercial attention items" },
        ]}
      />

      <ReviewSignalLane
        title="Commercial Intelligence Lanes"
        subtitle="Review commercial health as a movement system, not a list of disconnected pages."
        columns={lanes}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WatchlistPanel
          title="Commercial Watchlist"
          subtitle="Visible commercial and contract-related watch items from the executive watchlist layer."
          items={watchlists}
        />

        <WorkflowLauncherPanel
          title="Commercial Intelligence Workflows"
          subtitle="Move from review into the right commercial action path."
          workflows={[
            {
              title: "Lead Acceleration Workflow",
              detail: "Move visible demand into qualification and proposal development.",
              href: "/workflows/launcher",
              stages: ["Lead", "Qualification", "Quote"],
            },
            {
              title: "Quote Decision Workflow",
              detail: "Move proposal pressure into review, approval, send, and conversion action.",
              href: "/workflows/launcher",
              stages: ["Quote", "Review", "Approve", "Send"],
            },
            {
              title: "Contract Progression Workflow",
              detail: "Move commercial commitment into activation and delivery confidence.",
              href: "/workflows/launcher",
              stages: ["Contract", "Activation", "Operations", "Delivery"],
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightStack
          title="Commercial Intelligence Guidance"
          subtitle="How to use this workspace effectively."
          items={[
            {
              title: "Use lanes to understand movement",
              detail: "Lanes show where demand, proposals, or contracts are slowing or building pressure.",
            },
            {
              title: "Use watchlists for urgency",
              detail: "Commercial watch items indicate where human decision-making should focus first.",
            },
            {
              title: "Use 360 views for explanation",
              detail: "Move into Customer 360 or Contract 360 when a review signal needs deeper context.",
            },
          ]}
        />

        <EnterpriseGraphNavigator
          title="Commercial Intelligence Navigation"
          subtitle="Move from intelligence review into the right explanatory or operational workspace."
          nodes={[
            {
              title: "Commercial Workbench",
              detail: "Daily relationship and commercial operating surface.",
              href: "/commercial/workbench",
              badge: "Workbench",
              connections: ["Leads", "Quotes", "Contracts"],
            },
            {
              title: "Commercial Review Board",
              detail: "Structured review of lead, quote, and contract movement.",
              href: "/commercial/review",
              badge: "Review",
              connections: ["Momentum", "Pressure", "Contracts"],
            },
            {
              title: "Customer 360",
              detail: "Inspect customer relationship and financial continuity.",
              href: "/customers/360",
              badge: "360",
              connections: ["Quotes", "Contracts", "Invoices"],
            },
            {
              title: "Contract 360",
              detail: "Inspect commitment, execution, and billing continuity.",
              href: "/contracts/360",
              badge: "360",
              connections: ["Execution", "Health", "Finance"],
            },
          ]}
        />
      </div>
    </div>
  );
}
