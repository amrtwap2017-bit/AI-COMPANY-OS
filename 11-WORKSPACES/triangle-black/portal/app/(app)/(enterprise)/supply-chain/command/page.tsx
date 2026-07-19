
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
  inventoryDashboard: SafeApiResult | null;
  items: SafeApiResult | null;
  vendors: SafeApiResult | null;
  purchaseRequests: SafeApiResult | null;
  purchaseOrders: SafeApiResult | null;
};

export default function SupplyChainCommandPage() {
  const [state, setState] = useState<State>({
    inventoryDashboard: null,
    items: null,
    vendors: null,
    purchaseRequests: null,
    purchaseOrders: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [inventoryDashboard, items, vendors, purchaseRequests, purchaseOrders] = await Promise.all([
        enterpriseApi.supplyChain.inventoryDashboard(),
        enterpriseApi.supplyChain.items(),
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.supplyChain.purchaseRequests(),
        enterpriseApi.supplyChain.purchaseOrders(),
      ]);
      if (!active) return;
      setState({ inventoryDashboard, items, vendors, purchaseRequests, purchaseOrders });
    })();
    return () => {
      active = false;
    };
  }, []);

  const items = toList(state.items?.data);
  const vendors = toList(state.vendors?.data);
  const purchaseRequests = toList(state.purchaseRequests?.data);
  const purchaseOrders = toList(state.purchaseOrders?.data);

  const itemPreview = useMemo(
    () =>
      items.slice(0, 6).map((item: any) => ({
        title: asText(item.name || item.item_name || item.code || item.id),
        meta: asText(item.category || item.unit || "item"),
        detail: `Min stock: ${asText(item.min_stock)} • Cost: ${asText(item.standard_cost || item.last_purchase_cost || item.cost)}`,
        href: "/supply-chain/command",
        entityType: "item",
        entityId: asText(item.id, ""),
        entityName: asText(item.name || item.item_name || item.code || item.id),
        connections: ["Vendor", "Warehouse", "Stock", "Execution"],
      })),
    [state.items]
  );

  const vendorPreview = useMemo(
    () =>
      vendors.slice(0, 6).map((item: any) => ({
        title: asText(item.company_name || item.name || item.id),
        meta: asText(item.category || item.specialty || "vendor"),
        detail: `Terms: ${asText(item.payment_terms)} • Lead time: ${asText(item.lead_time_days)}`,
        href: "/supply-chain/vendors/360",
        entityType: "vendor",
        entityId: asText(item.id, ""),
        entityName: asText(item.company_name || item.name || item.id),
        connections: ["Items", "Purchase Orders", "Receipts", "Risk"],
      })),
    [state.vendors]
  );  const statusItems = [
    {
      label: "Inventory Dashboard",
      ok: !!state.inventoryDashboard?.ok,
      detail: state.inventoryDashboard?.ok ? "Inventory dashboard feed connected" : state.inventoryDashboard?.error || "Inventory dashboard unavailable",
    },
    {
      label: "Items",
      ok: !!state.items?.ok,
      detail: state.items?.ok ? "Item feed connected" : state.items?.error || "Item feed unavailable",
    },
    {
      label: "Vendors",
      ok: !!state.vendors?.ok,
      detail: state.vendors?.ok ? "Vendor feed connected" : state.vendors?.error || "Vendor feed unavailable",
    },
    {
      label: "Purchase Requests",
      ok: !!state.purchaseRequests?.ok,
      detail: state.purchaseRequests?.ok ? "Purchase request feed connected" : state.purchaseRequests?.error || "Purchase request feed unavailable",
    },
    {
      label: "Purchase Orders",
      ok: !!state.purchaseOrders?.ok,
      detail: state.purchaseOrders?.ok ? "Purchase order feed connected" : state.purchaseOrders?.error || "Purchase order feed unavailable",
    },
  ];

  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Procurement / Supply Chain"
        title="Supply chain command mode is active"
        description="Use this workspace to control procurement pressure, supplier visibility, item readiness, and purchasing coordination."
        actions={[
          "Track supplier visibility",
          "Review item readiness",
          "Inspect request pressure",
          "Monitor procurement stability",
        ]}
      />

      <EntityLinkDeck
        title="Enterprise Drill-down"
        subtitle="Jump directly into supplier, customer, contract, and execution perspectives."
        items={[
          { title: "Vendor 360", detail: "See supplier activity across purchasing, receipts, and operational support.", href: "/supply-chain/vendors/360", badge: "360" },
          { title: "Work Order 360", detail: "See how supply support eventually affects field execution.", href: "/operations/work-orders/360", badge: "360" },
          { title: "Contract 360", detail: "See how procurement and delivery support contract realization.", href: "/contracts/360", badge: "360" },
          { title: "Customer 360", detail: "See how supplier reliability affects customer outcomes.", href: "/customers/360", badge: "360" },
        ]}
      />

      <FilterBar
        title="Supply Chain Filters"
        subtitle="Shape the supply chain workspace around procurement stage, sourcing pressure, and inventory visibility."
        groups={[
          {
            title: "Procurement Stage",
            options: [
              { label: "Requests", value: "requests" },
              { label: "RFQ", value: "rfq" },
              { label: "Orders", value: "orders" },
              { label: "Receipts", value: "receipts" },
            ],
          },
          {
            title: "Supplier",
            options: [
              { label: "Preferred", value: "preferred" },
              { label: "At Risk", value: "risk" },
              { label: "New", value: "new" },
            ],
          },
          {
            title: "Inventory",
            options: [
              { label: "All Items", value: "all" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Reserved", value: "reserved" },
            ],
          },
        ]}
      />

      <ObjectJourneyRibbon
        title="Supply Chain Object Journey"
        subtitle="This is how procurement and inventory should support the wider operating system."
        steps={[
          { label: "Request", detail: "Demand enters the buying system", tone: "warning" },
          { label: "Supplier", detail: "Vendor sourcing and qualification", tone: "neutral" },
          { label: "Order", detail: "Commercial commitment to buy", tone: "success" },
          { label: "Receipt", detail: "Physical delivery and verification", tone: "neutral" },
          { label: "Stock", detail: "Inventory or allocation visibility", tone: "success" },
          { label: "Use", detail: "Execution support for contracts and work orders", tone: "warning" },
        ]}
      />

      <SignalStrip
        title="Supply Chain Signals"
        subtitle="Current procurement and inventory signals derived from live backend feeds where available."
        items={[
          { label: "Items", value: formatCount(toCount(items)), detail: "Current item records visible to the workspace", tone: "success" },
          { label: "Vendors", value: formatCount(toCount(vendors)), detail: "Current vendor records visible to the workspace", tone: "neutral" },
          { label: "Purchase Requests", value: formatCount(toCount(purchaseRequests)), detail: "Current PR visibility", tone: "warning" },
          { label: "Purchase Orders", value: formatCount(toCount(purchaseOrders)), detail: "Current PO visibility", tone: "warning" },
        ]}
      />

      <ObjectLinkMap
        title="Connected Supply Chain Object Map"
        subtitle="Procurement and inventory should be visible as part of delivery, not as isolated administration."
        nodes={[
          {
            title: "Purchase Requests",
            value: formatCount(toCount(purchaseRequests)),
            detail: "Operational or commercial demand entering procurement flow.",
            connections: ["Items", "Vendors", "Purchase Orders", "Approvals"],
            tone: "warning",
          },
          {
            title: "Purchase Orders",
            value: formatCount(toCount(purchaseOrders)),
            detail: "Committed purchasing activity requiring supplier execution and receipt control.",
            connections: ["Vendors", "Receipts", "Inventory", "Spend"],
            tone: "success",
          },
          {
            title: "Vendors",
            value: formatCount(toCount(vendors)),
            detail: "Supplier network supporting engineering delivery and service continuity.",
            connections: ["Requests", "Orders", "Certificates", "Scorecards"],
            tone: "neutral",
          },
          {
            title: "Items",
            value: formatCount(toCount(items)),
            detail: "Material visibility needed for stock planning and execution support.",
            connections: ["Warehouses", "Reservations", "Work Orders", "Contracts"],
            tone: "success",
          },
          {
            title: "Operational Support",
            value: "Mapped",
            detail: "Supply chain should support work orders, technicians, and service continuity directly.",
            connections: ["Work Orders", "Service Requests", "Assets", "Teams"],
            tone: "warning",
          },
          {
            title: "Commercial Support",
            value: "Mapped",
            detail: "Supply chain should support quotations, contract readiness, and margin discipline.",
            connections: ["Quotes", "Contracts", "Costing", "Executive Reporting"],
            tone: "neutral",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <QueueBoard
            title="Supply Chain Command Board"
            subtitle="Supply-chain actions grouped into request, order, and supplier control."
            columns={[
              {
                title: "Request Control",
                subtitle: "What should be approved and sourced",
                cards: [
                  { title: "Purchase Requests", value: formatCount(toCount(purchaseRequests)), detail: state.purchaseRequests?.ok ? "Live purchase request feed connected." : statusItems[3].detail },
                  { title: "Inventory Dashboard", value: state.inventoryDashboard?.ok ? "Live" : "Check", detail: statusItems[0].detail },
                ],
              },
              {
                title: "Order Control",
                subtitle: "What should be tracked and received",
                cards: [
                  { title: "Purchase Orders", value: formatCount(toCount(purchaseOrders)), detail: state.purchaseOrders?.ok ? "Live purchase order feed connected." : statusItems[4].detail },
                  { title: "Item Visibility", value: formatCount(toCount(items)), detail: state.items?.ok ? "Live item feed connected." : statusItems[1].detail },
                ],
              },
              {
                title: "Supplier Control",
                subtitle: "Who should be monitored",
                cards: [
                  { title: "Vendor Feed", value: state.vendors?.ok ? "Live" : "Check", detail: statusItems[2].detail },
                  { title: "Visible Vendors", value: formatCount(toCount(vendors)), detail: "Current supplier records visible to the command workspace." },
                ],
              },
            ]}
          />

          <LinkedScenarioPanel
            title="Linked Business Scenarios"
            subtitle="Supply chain should be understood as a support engine for delivery and commercial performance."
            scenarios={[
              {
                title: "Procurement to Execution Flow",
                detail: "A material need should become a request, then a supplier action, then stock or delivery, then execution support.",
                chain: ["Work Order", "Purchase Request", "Vendor", "Purchase Order", "Receipt", "Execution"],
              },
              {
                title: "Commercial to Cost Control Flow",
                detail: "Commercial commitments should eventually align with procurement cost and vendor behavior.",
                chain: ["Quote", "Contract", "Purchase Request", "Supplier", "Spend", "Executive Insight"],
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntegrationStatusPanel
              title="Integration Status"
              subtitle="Supply-chain backend feeds are exposed clearly instead of breaking the workspace."
              items={statusItems}
            />

            <RecordListCard
              title="Item Preview"
              subtitle="Current item records visible to the supply-chain command workspace."
              items={itemPreview}
              emptyMessage="No inventory items are currently available from the live backend feed."
            />
          </div>

          <RecordListCard
            title="Vendor Preview"
            subtitle="Current vendor records visible to the supply-chain command workspace."
            items={vendorPreview}
            emptyMessage="No vendor records are currently available from the live backend feed."
          />
        </div>

        <div className="space-y-6">
          <SavedViewsPanel
            title="Saved Views"
            subtitle="Reusable procurement and inventory lenses for daily control."
            views={[
              { name: "Supply Chain Default", detail: "Balanced command view across items, vendors, and purchasing flows.", status: "Default" },
              { name: "Procurement Pressure", detail: "Focus on requests, sourcing, and purchase order readiness.", status: "Team" },
              { name: "Vendor Watch", detail: "Focus on supplier visibility and integration readiness.", status: "Personal" },
            ]}
          />

          <InsightStack
            title="Supply Chain Insights"
            subtitle="Control-layer observations for procurement and inventory leadership."
            items={[
              {
                title: "Procurement resilience",
                detail: "The supply-chain workspace now remains stable even if one purchasing integration is incomplete.",
              },
              {
                title: "Vendor visibility",
                detail: state.vendors?.ok ? "Vendor data is visible inside the command workspace." : "Vendor integration still needs hardening before broader rollout.",
              },
              {
                title: "Inventory visibility",
                detail: state.items?.ok ? "Item data is visible inside the command workspace." : "Inventory item integration remains unstable and needs backend review.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
