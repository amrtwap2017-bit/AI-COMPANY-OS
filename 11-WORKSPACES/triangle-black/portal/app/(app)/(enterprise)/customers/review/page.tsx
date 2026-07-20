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

export default function CustomerReviewBoardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [leadsRes, quotesRes, contractsRes, invoicesRes] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
        enterpriseApi.finance.invoices(),
      ]);

      if (!active) return;
      setLeads(toList(leadsRes.data));
      setQuotes(toList(quotesRes.data));
      setContracts(toList(contractsRes.data));
      setInvoices(toList(invoicesRes.data));
    })();

    return () => {
      active = false;
    };
  }, []);

  const reviewItems = useMemo(() => {
    const leadCount = toCount(leads);
    const quoteCount = toCount(quotes);
    const contractCount = toCount(contracts);
    const invoiceCount = toCount(invoices);

    return [
      {
        title: "Commercial Relationship",
        value: formatCount(leadCount),
        detail: "Lead-level relationship visibility currently available to the customer review surface.",
        emphasis: leadCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Quote Pressure",
        value: formatCount(quoteCount),
        detail: "Visible quote volume that may require commercial follow-up or conversion.",
        emphasis: quoteCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Contract Continuity",
        value: formatCount(contractCount),
        detail: "Visible contract continuity attached to customer-facing relationships.",
        emphasis: contractCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Billing Continuity",
        value: formatCount(invoiceCount),
        detail: "Visible invoice continuity attached to customer value realization.",
        emphasis: invoiceCount > 0 ? "neutral" as const : "warning" as const,
      },
    ];
  }, [leads, quotes, contracts, invoices]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Customer Success Center"
        title="Customer Success Review Board"
        subtitle="A review-oriented customer success surface for relationship continuity, contract coverage, and financial follow-through."
        badges={[
          "Customer Review",
          "Relationship Health",
          "Contract Continuity",
          "Billing Follow-through",
        ]}
      />

      <ReviewBoardPanel
        title="Customer Review Matrix"
        subtitle="Use this board to understand where customer continuity needs attention."
        items={reviewItems}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Customer Review Workflows"
          subtitle="Move from customer review into the right enterprise workflow."
          workflows={[
            {
              title: "Customer Continuity Workflow",
              detail: "Move from customer relationship review into contract and billing continuity.",
              href: "/workflows/launcher",
              stages: ["Customer", "Contract", "Invoice"],
            },
            {
              title: "Growth Review Workflow",
              detail: "Move from commercial visibility into conversion and renewal opportunity review.",
              href: "/workflows/launcher",
              stages: ["Lead", "Quote", "Contract", "Growth"],
            },
            {
              title: "Delivery Review Workflow",
              detail: "Move from customer relationship concern into execution and service proof review.",
              href: "/workflows/launcher",
              stages: ["Contract", "Work Order", "Service Report"],
            },
          ]}
        />

        <InsightStack
          title="Customer Review Guidance"
          subtitle="How to use the customer review board effectively."
          items={[
            {
              title: "Start with continuity",
              detail: "Use the board to understand whether commercial, contract, and billing continuity are visible together.",
            },
            {
              title: "Escalate to 360 for explanation",
              detail: "Use Customer 360 and Contract 360 when the relationship needs real explanation.",
            },
            {
              title: "Treat billing gaps seriously",
              detail: "Weak invoice visibility often means the relationship health picture is incomplete.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Customer Review Navigation"
        subtitle="Move from relationship review into the best explanatory workspace."
        nodes={[
          {
            title: "Customer 360",
            detail: "Customer relationship, contract, and invoice continuity.",
            href: "/customers/360",
            badge: "360",
            connections: ["Leads", "Quotes", "Contracts", "Invoices"],
          },
          {
            title: "Contract 360",
            detail: "Contract continuity and delivery context.",
            href: "/contracts/360",
            badge: "360",
            connections: ["Customer", "Execution", "Finance"],
          },
          {
            title: "Commercial Workbench",
            detail: "Daily commercial review surface.",
            href: "/commercial/workbench",
            badge: "Workbench",
            connections: ["Leads", "Quotes", "Contracts"],
          },
          {
            title: "Recommendations",
            detail: "Cross-object recommendations for next best action.",
            href: "/recommendations",
            badge: "Hub",
            connections: ["Actions", "Health", "Growth"],
          },
        ]}
      />
    </div>
  );
}
