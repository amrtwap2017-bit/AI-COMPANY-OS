"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { executiveIntelligenceApi } from "../../../../../lib/executive-intelligence-api";
import { asText, formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { SupplyReviewMatrix } from "../../../../../components/workspace/SupplyReviewMatrix";
import { QueueBoardMatrix } from "../../../../../components/workspace/QueueBoardMatrix";
import { WatchlistPanel } from "../../../../../components/workspace/WatchlistPanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

export default function SupplyChainReviewPage() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [itemsRes, vendorsRes, prRes, poRes, watchRes] = await Promise.all([
        enterpriseApi.supplyChain.items(),
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.supplyChain.purchaseRequests(),
        enterpriseApi.supplyChain.purchaseOrders(),
        executiveIntelligenceApi.watchlists(),
      ]);

      if (!active) return;
      setItems(toList(itemsRes.data));
      setVendors(toList(vendorsRes.data));
      setPurchaseRequests(toList(prRes.data));
      setPurchaseOrders(toList(poRes.data));

      const allWatch = Array.isArray((watchRes as any)?.watchlists) ? (watchRes as any).watchlists : Array.isArray((watchRes as any)?.data?.watchlists) ? (watchRes as any).data.watchlists : [];
      const filtered = allWatch.filter((item: any) => {
        const title = String(item?.title || "").toLowerCase();
        const detail = String(item?.detail || "").toLowerCase();
        return title.includes("supply") || title.includes("vendor") || title.includes("supplier") || detail.includes("supplier") || detail.includes("purchase");
      });
      setWatchlists(filtered);
    })();

    return () => {
      active = false;
    };
  }, []);

  const reviewItems = useMemo(() => {
    const itemCount = toCount(items);
    const vendorCount = toCount(vendors);
    const prCount = toCount(purchaseRequests);
    const poCount = toCount(purchaseOrders);

    return [
      {
        title: "Item Visibility",
        value: formatCount(itemCount),
        detail: "Visible item records supporting procurement and execution continuity.",
        emphasis: itemCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Supplier Coverage",
        value: formatCount(vendorCount),
        detail: "Visible supplier records supporting procurement continuity.",
        emphasis: vendorCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Request Pressure",
        value: formatCount(prCount),
        detail: "Visible purchase requests indicating demand pressure.",
        emphasis: prCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Order Pressure",
        value: formatCount(poCount),
        detail: "Visible purchase orders indicating active supplier commitment.",
        emphasis: poCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Request-to-Supplier Signal",
        value: formatCount(Math.max(0, Math.floor(prCount * 0.6))),
        detail: "Estimated demand likely to turn into supplier action.",
        emphasis: prCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Item Support Signal",
        value: formatCount(Math.max(0, Math.floor(itemCount * 0.4))),
        detail: "Estimated visible item subset likely to matter for near-term delivery support.",
        emphasis: itemCount > 0 ? "success" as const : "neutral" as const,
      },
    ];
  }, [items, vendors, purchaseRequests, purchaseOrders]);

  const queueColumns = useMemo(() => {
    const requestQueue = purchaseRequests.slice(0, 6).map((item) => ({
      title: asText(item.request_number || item.title || item.id),
      meta: asText(item.status, "request"),
      detail: `Need: ${asText(item.category || item.type)} • Required: ${asText(item.required_date)}`,
      badges: ["request"],
    }));

    const orderQueue = purchaseOrders.slice(0, 6).map((item) => ({
      title: asText(item.po_number || item.id),
      meta: asText(item.status, "po"),
      detail: `Vendor: ${asText(item.vendor_id)} • Total: ${asText(item.total_amount || item.total)}`,
      badges: ["order"],
    }));

    const vendorQueue = vendors.slice(0, 6).map((item) => ({
      title: asText(item.company_name || item.name || item.id),
      meta: asText(item.category || item.specialty || "vendor"),
      detail: `Terms: ${asText(item.payment_terms)} • Lead time: ${asText(item.lead_time_days)}`,
      badges: ["vendor"],
    }));

    const itemQueue = items.slice(0, 6).map((item) => ({
      title: asText(item.name || item.item_name || item.code || item.id),
      meta: asText(item.category || item.unit || "item"),
      detail: `Min stock: ${asText(item.min_stock)} • Cost: ${asText(item.standard_cost || item.cost)}`,
      badges: ["item"],
    }));

    return [
      {
        title: "Request Queue",
        subtitle: `${formatCount(purchaseRequests.length)} visible purchase requests`,
        tone: "warning" as const,
        cards: requestQueue,
      },
      {
        title: "Order Queue",
        subtitle: `${formatCount(purchaseOrders.length)} visible purchase orders`,
        tone: "success" as const,
        cards: orderQueue,
      },
      {
        title: "Supplier Queue",
        subtitle: `${formatCount(vendors.length)} visible vendors`,
        tone: "neutral" as const,
        cards: vendorQueue,
      },
      {
        title: "Item Queue",
        subtitle: `${formatCount(items.length)} visible items`,
        tone: "neutral" as const,
        cards: itemQueue,
      },
    ];
  }, [items, vendors, purchaseRequests, purchaseOrders]);

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Supply Chain Center"
        title="Supply Chain Review Intelligence"
        subtitle="A review-oriented supply surface for procurement pressure, supplier continuity, item readiness, and escalated attention."
        badges={[
          "Supply Review",
          "Procurement Pressure",
          "Supplier Continuity",
          "Item Readiness",
        ]}
      />

      <SupplyReviewMatrix
        title="Supply Review Matrix"
        subtitle="Use this review board to understand where supply continuity and procurement attention are required."
        items={reviewItems}
      />

      <QueueBoardMatrix
        title="Supply Review Queues"
        subtitle="Review the visible purchasing and supplier queues before drilling into vendor or item detail."
        columns={queueColumns}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WatchlistPanel
          title="Supply Watchlist"
          subtitle="Visible supply and vendor-related watch items from the current executive watchlist layer."
          items={watchlists}
        />

        <WorkflowLauncherPanel
          title="Supply Review Workflows"
          subtitle="Move from review into the right supply action path."
          workflows={[
            {
              title: "Request Pressure Workflow",
              detail: "Move from purchase request pressure into supplier and ordering follow-through.",
              href: "/workflows/launcher",
              stages: ["Request", "Vendor", "PO", "Receipt"],
            },
            {
              title: "Supplier Continuity Workflow",
              detail: "Move from supplier concern into vendor detail and support analysis.",
              href: "/workflows/launcher",
              stages: ["Vendor", "PO", "Receipt", "Support"],
            },
            {
              title: "Item Readiness Workflow",
              detail: "Move from item visibility into support continuity and execution impact.",
              href: "/workflows/launcher",
              stages: ["Item", "PO", "Receipt", "Execution"],
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightStack
          title="Supply Review Guidance"
          subtitle="How to use the supply review surface effectively."
          items={[
            {
              title: "Start with demand pressure",
              detail: "Requests and purchase orders tell you where supply demand is building first.",
            },
            {
              title: "Then inspect supplier continuity",
              detail: "Use vendor context to understand whether supplier support is strong enough.",
            },
            {
              title: "Then validate operational support",
              detail: "Escalate into Work Order 360 if supply continuity affects real execution outcomes.",
            },
          ]}
        />

        <EnterpriseGraphNavigator
          title="Supply Review Navigation"
          subtitle="Move from review into the right supplier, item, or execution surface."
          nodes={[
            {
              title: "Supply Chain Workbench",
              detail: "Daily supply control surface.",
              href: "/supply-chain/workbench",
              badge: "Workbench",
              connections: ["Items", "Vendors", "POs"],
            },
            {
              title: "Supply Chain Command",
              detail: "Broader procurement and inventory command surface.",
              href: "/supply-chain/command",
              badge: "Command",
              connections: ["Requests", "Orders", "Receipts"],
            },
            {
              title: "Vendor 360",
              detail: "Supplier detail and support continuity.",
              href: "/supply-chain/vendors/360",
              badge: "360",
              connections: ["Orders", "Receipts", "Items"],
            },
            {
              title: "Work Order 360",
              detail: "Execution detail if supply continuity is impacting delivery.",
              href: "/operations/work-orders/360",
              badge: "360",
              connections: ["Execution", "Item Need", "Support"],
            },
          ]}
        />
      </div>
    </div>
  );
}
