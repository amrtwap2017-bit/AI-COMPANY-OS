// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { asText, formatCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { QueueBoardMatrix } from "../../../../../components/workspace/QueueBoardMatrix";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

export default function SupplyChainQueuePage() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [itemsRes, vendorsRes, prRes, poRes] = await Promise.all([
        enterpriseApi.supplyChain.items(),
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.supplyChain.purchaseRequests(),
        enterpriseApi.supplyChain.purchaseOrders(),
      ]);

      if (!active) return;
      setItems(toList(itemsRes.data));
      setVendors(toList(vendorsRes.data));
      setPurchaseRequests(toList(prRes.data));
      setPurchaseOrders(toList(poRes.data));
    })();

    return () => {
      active = false;
    };
  }, []);

  const columns = useMemo(() => {
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
        title="Supply Chain Queue Board"
        subtitle="A queue-oriented supply chain surface for requests, purchase orders, suppliers, and item readiness."
        badges={[
          "Supply Queue",
          "Requests",
          "Orders",
          "Suppliers",
          "Items",
        ]}
      />

      <QueueBoardMatrix
        title="Supply Chain Queue Matrix"
        subtitle="Review the visible purchasing and support queues before drilling into supplier or item detail."
        columns={columns}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Supply Queue Workflows"
          subtitle="Move from supply queue review into the right enterprise workflow."
          workflows={[
            {
              title: "Request to Purchase Order",
              detail: "Move from identified demand to supplier commitment.",
              href: "/workflows/launcher",
              stages: ["Request", "Vendor", "PO"],
            },
            {
              title: "Supplier Review Workflow",
              detail: "Move from supplier pressure into vendor detail and support analysis.",
              href: "/workflows/launcher",
              stages: ["Vendor", "PO", "Receipt", "Support"],
            },
            {
              title: "Item Readiness Workflow",
              detail: "Move from item visibility into operational support continuity.",
              href: "/workflows/launcher",
              stages: ["Item", "PO", "Receipt", "Execution"],
            },
          ]}
        />

        <InsightStack
          title="Supply Queue Guidance"
          subtitle="How to use the supply chain queue board effectively."
          items={[
            {
              title: "Start with requests",
              detail: "Requests tell you where current demand is building.",
            },
            {
              title: "Then inspect supplier continuity",
              detail: "Use vendors and orders to understand whether supply can keep up with demand.",
            },
            {
              title: "Then validate item readiness",
              detail: "Use item visibility to understand operational support risk.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Supply Queue Navigation"
        subtitle="Move from queue review into the correct execution or supplier detail workspace."
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
  );
}
