// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { executiveIntelligenceApi } from "../../../../../lib/executive-intelligence-api";
import { formatCount, formatCurrency, toCount, toList, toNumber } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { ReviewBoardPanel } from "../../../../../components/workspace/ReviewBoardPanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";
import { WatchlistPanel } from "../../../../../components/workspace/WatchlistPanel";

export default function ExecutiveDailyReviewPage() {
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
      setWatchlists((watchRes as any)?.watchlists || (watchRes as any)?.data?.watchlists || []);
    })();

    return () => {
      active = false;
    };
  }, []);

  const reviewItems = useMemo(() => {
    const contractCount = toCount(contracts);
    const workOrderCount = toCount(workOrders);
    const vendorCount = toCount(vendors);
    const invoiceCount = toCount(invoices);
    const revenueSignal = formatCurrency(toNumber(kpis?.revenue_signal));

    return [
      {
        title: "Revenue Signal",
        value: revenueSignal,
        detail: "Current visible backend-derived value signal for leadership review.",
        emphasis: "success" as const,
      },
      {
        title: "Contracts in View",
        value: formatCount(contractCount),
        detail: "Visible contract count that leadership can review today.",
        emphasis: contractCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Execution Load",
        value: formatCount(workOrderCount),
        detail: "Visible work-order volume affecting delivery confidence.",
        emphasis: workOrderCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Supplier Exposure",
        value: formatCount(vendorCount),
        detail: "Visible supplier footprint influencing delivery and procurement continuity.",
        emphasis: vendorCount > 0 ? "neutral" as const : "warning" as const,
      },
      {
        title: "Invoice Continuity",
        value: formatCount(invoiceCount),
        detail: "Visible invoice volume linked to commercial realization.",
        emphasis: invoiceCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Watch Items",
        value: formatCount(watchlists.length),
        detail: "Current watchlist items requiring leadership review.",
        emphasis: watchlists.length > 0 ? "warning" as const : "success" as const,
      },
    ];
  }, [contracts, workOrders, vendors, invoices, kpis, watchlists]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Executive Center"
        title="Executive Daily Review Board"
        subtitle="A leadership review surface for daily portfolio signals, visible risks, operational pressure, and finance continuity."
        badges={[
          "Executive Review",
          "Daily Leadership",
          "Portfolio Signals",
          "Watchlist Attention",
        ]}
      />

      <ReviewBoardPanel
        title="Executive Daily Review Matrix"
        subtitle="Use this board to understand where leadership attention is most needed today."
        items={reviewItems}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WatchlistPanel
          title="Leadership Watchlist"
          subtitle="Visible watch items that should influence the executive daily review."
          items={watchlists}
        />

        <WorkflowLauncherPanel
          title="Executive Daily Workflows"
          subtitle="Move from review into the right leadership action path."
          workflows={[
            {
              title: "Portfolio Review Workflow",
              detail: "Move from scorecards and watchlists into the entities driving portfolio risk.",
              href: "/workflows/launcher",
              stages: ["Signals", "Contracts", "Work Orders", "Executive Review"],
            },
            {
              title: "Commercial Pressure Workflow",
              detail: "Move from revenue or quote pressure into commercial and customer context.",
              href: "/workflows/launcher",
              stages: ["Revenue", "Commercial", "Customer", "Decision"],
            },
            {
              title: "Supply Exposure Workflow",
              detail: "Move from delivery or supplier concern into vendor and procurement detail.",
              href: "/workflows/launcher",
              stages: ["Exposure", "Vendor", "PO", "Action"],
            },
          ]}
        />
      </div>

      <InsightStack
        title="Executive Daily Guidance"
        subtitle="How leadership should use this review surface."
        items={[
          {
            title: "Start with watchlists",
            detail: "Use watchlists to identify immediate enterprise attention items.",
          },
          {
            title: "Then use review signals",
            detail: "Use contract, work-order, vendor, and invoice visibility to understand where risk is forming.",
          },
          {
            title: "Then drill into the right object",
            detail: "Use 360 pages and command workspaces to inspect what is driving the signal.",
          },
        ]}
      />

      <EnterpriseGraphNavigator
        title="Executive Review Navigation"
        subtitle="Move directly from the daily review board into the most relevant enterprise surfaces."
        nodes={[
          {
            title: "Executive Intelligence",
            detail: "Backend-fed scorecards, trends, and watchlists.",
            href: "/executive/intelligence",
            badge: "Intelligence",
            connections: ["Scorecards", "Trends", "Watchlists"],
          },
          {
            title: "Contract 360",
            detail: "Commitment, execution, and finance continuity.",
            href: "/contracts/360",
            badge: "360",
            connections: ["Customer", "Invoices", "Execution"],
          },
          {
            title: "Work Order 360",
            detail: "Execution detail and service proof.",
            href: "/operations/work-orders/360",
            badge: "360",
            connections: ["Requests", "Technicians", "Reports"],
          },
          {
            title: "Vendor 360",
            detail: "Supplier continuity and procurement support.",
            href: "/supply-chain/vendors/360",
            badge: "360",
            connections: ["Items", "POs", "Receipts"],
          },
          {
            title: "Alerts Center",
            detail: "Attention routing and escalation visibility.",
            href: "/alerts",
            badge: "Alerts",
            connections: ["Escalations", "Owners", "Severity"],
          },
        ]}
      />
    </div>
  );
}
