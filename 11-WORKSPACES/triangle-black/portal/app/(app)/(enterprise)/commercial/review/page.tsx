// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { ReviewBoardPanel } from "../../../../../components/workspace/ReviewBoardPanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

export default function CommercialReviewBoardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [leadsRes, quotesRes, contractsRes] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
      ]);

      if (!active) return;
      setLeads(toList(leadsRes.data));
      setQuotes(toList(quotesRes.data));
      setContracts(toList(contractsRes.data));
    })();

    return () => {
      active = false;
    };
  }, []);

  const reviewItems = useMemo(() => {
    const leadCount = toCount(leads);
    const quoteCount = toCount(quotes);
    const contractCount = toCount(contracts);

    const qualifiedSignal = Math.max(0, Math.floor(leadCount * 0.5));
    const approvalSignal = Math.max(0, Math.floor(quoteCount * 0.4));
    const activationSignal = Math.max(0, Math.floor(contractCount * 0.3));

    return [
      {
        title: "Lead Momentum",
        value: formatCount(leadCount),
        detail: "Visible lead volume currently feeding the commercial engine.",
        emphasis: leadCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Quote Pressure",
        value: formatCount(quoteCount),
        detail: "Visible quote volume that may require review, send, or approval action.",
        emphasis: quoteCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Contract Readiness",
        value: formatCount(contractCount),
        detail: "Visible contract volume representing converted commercial commitment.",
        emphasis: contractCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Qualified Demand Signal",
        value: formatCount(qualifiedSignal),
        detail: "Estimated lead subset likely needing next-step commercial movement.",
        emphasis: qualifiedSignal > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Approval Signal",
        value: formatCount(approvalSignal),
        detail: "Estimated quote subset likely needing internal decision or approval.",
        emphasis: approvalSignal > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Activation Signal",
        value: formatCount(activationSignal),
        detail: "Estimated contract subset likely needing execution handoff attention.",
        emphasis: activationSignal > 0 ? "success" as const : "neutral" as const,
      },
    ];
  }, [leads, quotes, contracts]);

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Commercial Center"
        title="Commercial Review Board"
        subtitle="A review-oriented commercial surface for relationship momentum, quote pressure, and contract progression."
        badges={[
          "Commercial Review",
          "Lead Momentum",
          "Quote Pressure",
          "Contract Progression",
        ]}
      />

      <ReviewBoardPanel
        title="Commercial Review Matrix"
        subtitle="Use this board to understand where the commercial engine needs attention."
        items={reviewItems}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Commercial Review Workflows"
          subtitle="Move from review into the right commercial action path."
          workflows={[
            {
              title: "Lead Progression Workflow",
              detail: "Move demand from intake into qualification and quotation.",
              href: "/workflows/launcher",
              stages: ["Lead", "Qualification", "Quote"],
            },
            {
              title: "Quote Decision Workflow",
              detail: "Move visible quote pressure into review, send, and approval actions.",
              href: "/workflows/launcher",
              stages: ["Quote", "Review", "Send", "Approve"],
            },
            {
              title: "Contract Handoff Workflow",
              detail: "Move commercial commitment into execution and delivery readiness.",
              href: "/workflows/launcher",
              stages: ["Contract", "Activation", "Operations", "Delivery"],
            },
          ]}
        />

        <InsightStack
          title="Commercial Review Guidance"
          subtitle="How to use the commercial review board effectively."
          items={[
            {
              title: "Start with momentum",
              detail: "Use the board to see where lead and quote movement is building or slowing.",
            },
            {
              title: "Look for decision friction",
              detail: "Quote pressure often means approvals, review, or send flow needs attention.",
            },
            {
              title: "Complete the handoff",
              detail: "Commercial success should move cleanly into contract activation and execution readiness.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Commercial Review Navigation"
        subtitle="Move from commercial review into the best enterprise workspace for explanation or action."
        nodes={[
          {
            title: "Commercial Workbench",
            detail: "Daily sales and relationship operating surface.",
            href: "/commercial/workbench",
            badge: "Workbench",
            connections: ["Leads", "Quotes", "Contracts"],
          },
          {
            title: "Commercial Command",
            detail: "Lead, quote, and contract command surface.",
            href: "/commercial/command",
            badge: "Command",
            connections: ["Pipeline", "Approvals", "Progression"],
          },
          {
            title: "Customer 360",
            detail: "Customer relationship, contract, and finance continuity.",
            href: "/customers/360",
            badge: "360",
            connections: ["Customer", "Contracts", "Invoices"],
          },
          {
            title: "Contract 360",
            detail: "Commitment, execution, and finance realization.",
            href: "/contracts/360",
            badge: "360",
            connections: ["Execution", "Invoices", "Health"],
          },
        ]}
      />
    </div>
  );
}
