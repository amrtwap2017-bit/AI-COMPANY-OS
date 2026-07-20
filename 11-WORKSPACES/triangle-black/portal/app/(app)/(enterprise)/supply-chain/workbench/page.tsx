// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { WorkbenchSummaryGrid } from "../../../../../components/workspace/WorkbenchSummaryGrid";
import { ActionQueueList } from "../../../../../components/workspace/ActionQueueList";
import { InsightStack } from "../../../../../components/workspace/InsightStack";

export default function SupplyChainWorkbenchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [itemsRes, vendorsRes, purchaseOrdersRes] = await Promise.all([
        enterpriseApi.supplyChain.items(),
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.supplyChain.purchaseOrders(),
      ]);
      if (!active) return;
      setItems(toList(itemsRes.data));
      setVendors(toList(vendorsRes.data));
      setPurchaseOrders(toList(purchaseOrdersRes.data));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Supply Chain Center"
        title="Supply Chain Workbench"
        subtitle="A focused daily supply workbench for item readiness, supplier continuity, and purchasing control."
        badges={["Supply Chain", "Vendors", "Items", "Purchase Orders"]}
      />

      <WorkbenchSummaryGrid
        title="Supply Chain Summary"
        subtitle="Start the day by understanding supply continuity and procurement pressure."
        items={[
          { label: "Items", value: formatCount(toCount(items)), detail: "Current visible item records" },
          { label: "Vendors", value: formatCount(toCount(vendors)), detail: "Current visible vendor records" },
          { label: "POs", value: formatCount(toCount(purchaseOrders)), detail: "Current visible purchase orders" },
          { label: "Readiness", value: "Live", detail: "Supply feeds are available to the workbench" },
        ]}
      />

      <ActionQueueList
        title="Supply Action Queues"
        subtitle="Use these queues to control supplier continuity and material support."
        items={[
          { title: "Open Supply Chain Command", value: "Now", detail: "Review items, vendors, requests, and orders in one command surface.", href: "/supply-chain/command", tone: "neutral" },
          { title: "Open Vendor 360", value: "Now", detail: "Inspect supplier support and procurement continuity.", href: "/supply-chain/vendors/360", tone: "success" },
          { title: "Open Work Order 360", value: "Now", detail: "Inspect execution detail when supply issues affect delivery.", href: "/operations/work-orders/360", tone: "warning" },
          { title: "Open Recommendations", value: "Now", detail: "Use recommendations to identify the next enterprise action.", href: "/recommendations", tone: "neutral" },
        ]}
      />

      <InsightStack
        title="Supply Chain Workbench Guidance"
        subtitle="Use this page to identify supplier or item pressure before drilling deeper."
        items={[
          { title: "Start with continuity", detail: "Use this page to review whether supplier and item visibility is healthy enough for operations." },
          { title: "Use Vendor 360 for detail", detail: "Use Vendor 360 when receipts, orders, or support continuity need explanation." },
          { title: "Link supply to delivery", detail: "Escalate into Work Order 360 when supply quality affects customer outcomes." },
        ]}
      />
    </div>
  );
}
