// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { executiveIntelligenceApi } from "../../../../../lib/executive-intelligence-api";
import { formatCount, formatCurrency, toCount, toNumber, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { ExceptionDashboardPanel } from "../../../../../components/workspace/ExceptionDashboardPanel";
import { ExecutiveSignalBoard } from "../../../../../components/workspace/ExecutiveSignalBoard";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

function mapSeverity(level: string) {
  if (level === "critical") return "critical" as const;
  if (level === "warning") return "high" as const;
  if (level === "success") return "low" as const;
  return "medium" as const;
}

export default function ExecutiveExceptionsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [
        contractsRes,
        workOrdersRes,
        vendorsRes,
        invoicesRes,
        kpiRes,
        watchRes,
      ] = await Promise.all([
        enterpriseApi.executive.contracts(),
        enterpriseApi.operations.workOrders(),
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.finance.invoices(),
        executiveIntelligenceApi.kpis(),
        executiveIntelligenceApi.watchlists(),
      ]);

      if (!active) return;

      setContracts(toList(contractsRes.data));
      setWorkOrders(toList(workOrdersRes.data));
      setVendors(toList(vendorsRes.data));
      setInvoices(toList(invoicesRes.data));
      setKpis((kpiRes as any)?.data ?? kpiRes ?? null);
      setWatchlists(Array.isArray((watchRes as any)?.watchlists) ? (watchRes as any).watchlists : Array.isArray((watchRes as any)?.data?.watchlists) ? (watchRes as any).data.watchlists : []);
    })();

    return () => {
      active = false;
    };
  }, []);

  const revenueSignal = toNumber(kpis?.revenue_signal);

  const exceptionItems = useMemo(() => {
    return watchlists.map((item: any, index: number) => {
      const title = String(item?.title || `Exception ${index + 1}`);
      const detail = String(item?.detail || "No detail available");
      const recommendedAction = String(item?.recommended_action || "Review the related workspace");
      const lower = title.toLowerCase() + " " + detail.toLowerCase();

      let domain = "Enterprise";
      let owner = "Executive Review";

      if (lower.includes("commercial") || lower.includes("quote") || lower.includes("growth")) {
        domain = "Commercial";
        owner = "Commercial Manager";
      } else if (lower.includes("execution") || lower.includes("work order") || lower.includes("service")) {
        domain = "Operations";
        owner = "Operations Manager";
      } else if (lower.includes("supply") || lower.includes("supplier") || lower.includes("vendor") || lower.includes("purchase")) {
        domain = "Supply Chain";
        owner = "Supply Chain Manager";
      } else if (lower.includes("finance") || lower.includes("invoice")) {
        domain = "Finance";
        owner = "Executive / Finance";
      }

      return {
        title,
        severity: mapSeverity(String(item?.severity || "medium")),
        domain,
        owner,
        detail,
        action: recommendedAction,
      };
    });
  }, [watchlists]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Executive Center"
        title="Executive Exception Dashboard"
        subtitle="A leadership surface for reviewing the highest-friction exceptions across commercial, operations, supply chain, and finance."
        badges={[
          "Executive Exceptions",
          "Priority Signals",
          "Ownership",
          "Action Routing",
        ]}
      />

      <ExecutiveSignalBoard
        title="Exception Signals"
        subtitle="Quick visibility into the current scale of portfolio exceptions and visible enterprise exposure."
        items={[
          { label: "Revenue Signal", value: formatCurrency(revenueSignal), detail: "Current visible backend-derived revenue signal" },
          { label: "Contracts", value: formatCount(toCount(contracts)), detail: "Visible contract base in review scope" },
          { label: "Work Orders", value: formatCount(toCount(workOrders)), detail: "Visible execution base in review scope" },
          { label: "Exceptions", value: formatCount(exceptionItems.length), detail: "Visible watchlist-derived exceptions" },
        ]}
      />

      <ExceptionDashboardPanel
        title="Current Exceptions"
        subtitle="These exceptions convert watchlist signals into ownership-oriented review cards."
        items={exceptionItems}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Exception Workflows"
          subtitle="Move from exception review into the correct leadership response path."
          workflows={[
            {
              title: "Commercial Exception Workflow",
              detail: "Move from quote, growth, or conversion exceptions into commercial review.",
              href: "/workflows/launcher",
              stages: ["Signal", "Commercial", "Customer", "Decision"],
            },
            {
              title: "Execution Exception Workflow",
              detail: "Move from operational exceptions into work-order and service proof review.",
              href: "/workflows/launcher",
              stages: ["Signal", "Work Order", "Technician", "Recovery"],
            },
            {
              title: "Supply Exception Workflow",
              detail: "Move from supplier or procurement exceptions into vendor continuity review.",
              href: "/workflows/launcher",
              stages: ["Signal", "Vendor", "PO", "Recovery"],
            },
          ]}
        />

        <InsightStack
          title="Exception Dashboard Guidance"
          subtitle="How to use the exception dashboard effectively."
          items={[
            {
              title: "Start with ownership",
              detail: "Every exception should have a natural owner before deeper analysis begins.",
            },
            {
              title: "Prioritize by business consequence",
              detail: "Commercial, execution, supply, and finance exceptions should be assessed by impact, not just by count.",
            },
            {
              title: "Move into the right object",
              detail: "Use 360 pages and command workspaces to explain the exception before taking action.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Executive Exception Navigation"
        subtitle="Move from exception review into the workspace that best explains the problem."
        nodes={[
          {
            title: "Executive Intelligence",
            detail: "Leadership intelligence and scorecard surface.",
            href: "/executive/intelligence",
            badge: "Intelligence",
            connections: ["Scorecards", "Watchlists", "Trends"],
          },
          {
            title: "Commercial Review Intelligence",
            detail: "Commercial movement, proposal pressure, and contract review.",
            href: "/commercial/review-intelligence",
            badge: "Review",
            connections: ["Leads", "Quotes", "Contracts"],
          },
          {
            title: "Operations SLA Review",
            detail: "Execution pressure, demand, and capacity review.",
            href: "/operations/sla-review",
            badge: "Review",
            connections: ["Work Orders", "Requests", "Capacity"],
          },
          {
            title: "Supply Chain Review Intelligence",
            detail: "Supplier continuity and procurement pressure review.",
            href: "/supply-chain/review",
            badge: "Review",
            connections: ["Vendors", "Items", "POs"],
          },
          {
            title: "Customer 360",
            detail: "Relationship continuity and finance view.",
            href: "/customers/360",
            badge: "360",
            connections: ["Contracts", "Invoices", "Health"],
          },
          {
            title: "Contract 360",
            detail: "Commitment, execution, and billing continuity.",
            href: "/contracts/360",
            badge: "360",
            connections: ["Execution", "Requests", "Finance"],
          },
        ]}
      />
    </div>
  );
}
