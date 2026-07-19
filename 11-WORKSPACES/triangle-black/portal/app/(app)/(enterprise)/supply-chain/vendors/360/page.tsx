
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enterpriseApi, type SafeApiResult } from "../../../../../../lib/enterprise-api";
import { asText, formatCount, toCount, toList } from "../../../../../../lib/enterprise-format";
import { filterByField, resolveById } from "../../../../../../lib/entity-relations";
import { Entity360Hero } from "../../../../../../components/workspace/Entity360Hero";
import { EnterpriseHealthStrip } from "../../../../../../components/workspace/EnterpriseHealthStrip";
import { RelationshipGrid } from "../../../../../../components/workspace/RelationshipGrid";
import { RecordListCard } from "../../../../../../components/workspace/RecordListCard";
import { LinkedScenarioPanel } from "../../../../../../components/workspace/LinkedScenarioPanel";
import { IntegrationStatusPanel } from "../../../../../../components/workspace/IntegrationStatusPanel";
import { AIInsightPanel } from "../../../../../../components/workspace/AIInsightPanel";
import { RelationshipTimeline } from "../../../../../../components/workspace/RelationshipTimeline";
import { ActivityGraphSummary } from "../../../../../../components/workspace/ActivityGraphSummary";
import { EntityDetailTabs } from "../../../../../../components/workspace/EntityDetailTabs";
import { KnowledgePanel } from "../../../../../../components/workspace/KnowledgePanel";
import { EntitySummaryCards } from "../../../../../../components/workspace/EntitySummaryCards";
import { RelatedRecordsPanel } from "../../../../../../components/workspace/RelatedRecordsPanel";
import { DetailStateBanner } from "../../../../../../components/workspace/DetailStateBanner";
import { buildVendorRecommendations, buildReadinessLabel } from "../../../../../../lib/entity-intelligence";
import { BackendAlignmentPanel } from "../../../../../../components/workspace/BackendAlignmentPanel";
import { entityBackendMatrix } from "../../../../../../lib/entity-backend-matrix";
import { entityViewApi } from "../../../../../../lib/entity-view-api";
import { resolveVendorDetailPayload } from "../../../../../../lib/entity-detail-resolver";
import { EntityActionDock } from "../../../../../../components/workspace/EntityActionDock";
import { EnterpriseGraphNavigator } from "../../../../../../components/workspace/EnterpriseGraphNavigator";
import { EntityContextRail } from "../../../../../../components/workspace/EntityContextRail";

type State = {
  vendors: SafeApiResult | null;
  items: SafeApiResult | null;
  purchaseRequests: SafeApiResult | null;
  purchaseOrders: SafeApiResult | null;
  goodsReceipts: SafeApiResult | null;
};

export default function Vendor360Page() {
  const searchParams = useSearchParams();
  const [directPayload, setDirectPayload] = useState<any>(null);
  const focusId = searchParams.get("id") || "";

  const [state, setState] = useState<State>({
    vendors: null,
    items: null,
    purchaseRequests: null,
    purchaseOrders: null,
    goodsReceipts: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [vendors, items, purchaseRequests, purchaseOrders, goodsReceipts] = await Promise.all([
        enterpriseApi.supplyChain.vendors(),
        enterpriseApi.supplyChain.items(),
        enterpriseApi.supplyChain.purchaseRequests(),
        enterpriseApi.supplyChain.purchaseOrders(),
        enterpriseApi.supplyChain.goodsReceipts(),
      ]);
      if (!active) return;
      setState({ vendors, items, purchaseRequests, purchaseOrders, goodsReceipts });
    })();
    return () => {
      active = false;
    };
  }, []);


  useEffect(() => {
    let active = true;

    if (!focusId) {
      setDirectPayload(null);
      return;
    }

    (async () => {
      const res = await entityViewApi.vendor(focusId);
      if (!active) return;
      setDirectPayload(res.ok ? resolveVendorDetailPayload(res.data) : null);
    })();

    return () => {
      active = false;
    };
  }, [focusId]);

  const vendors = toList(state.vendors?.data);
  const items = toList(state.items?.data);
  const purchaseRequests = toList(state.purchaseRequests?.data);
  const purchaseOrders = toList(state.purchaseOrders?.data);
  const goodsReceipts = toList(state.goodsReceipts?.data);

  const focusVendor = useMemo(
    () => resolveById(vendors, focusId) || vendors[0] || null,
    [state, focusId]
  );

  const relatedPOs = useMemo(
    () => filterByField(purchaseOrders, "vendor_id", asText(focusVendor?.id)),
    [state, asText(focusVendor?.id)]
  );

  const relatedPRs = useMemo(
    () => filterByField(purchaseRequests, "vendor_id", asText(focusVendor?.id)),
    [state, asText(focusVendor?.id)]
  );

  const relatedItems = useMemo(
    () => {
      const itemsByVendor = filterByField(items, "vendor_id", asText(focusVendor?.id));
      const itemsByPreferred = filterByField(items, "preferred_vendor_id", asText(focusVendor?.id));
      const merged = [...itemsByVendor, ...itemsByPreferred];
      const seen = new Set();
      return merged.filter((item: any) => {
        const key = asText(item?.id);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [state, asText(focusVendor?.id)]
  );

  const poIds = relatedPOs.map((item: any) => asText(item?.id)).filter(Boolean);

  const relatedReceipts = useMemo(
    () => goodsReceipts.filter((item: any) => poIds.includes(asText(item?.purchase_order_id))),
    [state, poIds.join("|")]
  );

  const focusTitle = focusVendor?.company_name || focusVendor?.name || focusVendor?.id || "Vendor 360";

  const poPreview = relatedPOs.slice(0, 6).map((item: any) => ({
    title: asText(item.po_number || item.id),
    meta: asText(item.status, "purchase order"),
    detail: `Vendor: ${asText(item.vendor_id)} • Total: ${asText(item.total_amount || item.total)}`,
    href: "/supplchain/command",
    entityType: "purchase-order",
    entityId: asText(item.id, ""),
    entityName: asText(item.po_number || item.id),
    connections: ["Vendor", "Receipt", "Inventory"],
  }));

  const itemPreview = relatedItems.slice(0, 6).map((item: any) => ({
    title: asText(item.name || item.item_name || item.code || item.id),
    meta: asText(item.category || item.unit || "item"),
    detail: `Min stock: ${asText(item.min_stock)} • Cost: ${asText(item.standard_cost || item.cost)}`,
    href: "/sply-chain/command",
    entityType: "item",
    entityId: asText(item.id, ""),
    entityName: asText(item.name || item.item_name || item.code || item.id),
    connections: ["Vendor", "Stock", "Execution"],
  }));

  const receiptPreview = relatedReceipts.slice(0, 6).map((item: any) => ({
    title: asText(item.receipt_number || item.id),
    meta: asText(item.status, "receipt"),
    detail: `PO: ${asText(item.purchase_order_id)} • Received: ${asText(item.received_date)}`,
    href: "/supply-chain/command",
    entityType: "purchase-order",
    entityId: asText(item.purchase_order_id, ""),
    entityName: asText(item.receipt_number || item.id),
    connections: ["Vendor", "PO", "Warehouse"],
  }));

  const statusItems = [
    { label: "Vendors", ok: !!state.vendors?.ok, detail: state.vendors?.ok ? "Vendor feed connected" : state.vendors?.error || "Vendor feed unavailable" },
    { label: "Items", ok: !!state.items?.ok, detail: state.items?.ok ? "Item feed connected" : state.items?.error || "Item feed unavailable" },
    { label: "Purchase Requests", ok: !!state.purchaseRequests?.ok, detail: state.purchaseRequests?.ok ? "Purchase request feed connected" : state.purchaseRequests?.error || "Purchase request feed unavailable" },
    { label: "Purchase Orders", ok: !!state.purchaseOrders?.ok, detail: state.purchaseOrders?.ok ? "Purchase order feed connected" : state.purchaseOrders?.error || "Purchase order feed unavailable" },
    { label: "Goods Receipts", ok: !!state.goodsReceipts?.ok, detail: state.goodsReceipts?.ok ? "Receipt feed connected" : state.goodsReceipts?.error || "Receipt feed unavailable" },
  ];

  return (
    <div className="space-y-6">
      <Entity360Hero
        eyebrow="Vendor Center"
        title={focusTitle}
        subtitle="Vendor 360 connects supplier visibility to purchasing activity, item support, receipts, and enterprise operational impact."
        badges={[
          "Vendor 360",
          "Supply Chain + Procurement + Inventory",
          focusId ? "Focused by Vendor ID" : "Supplier Detail View",
        ]}
      />


      <DetailStateBanner
        title="Focused vendor state"
        subtitle="This page is resolving a vendor context from the current enterprise navigation state."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from vendor context" : "Default vendor resolution")}
      />

      <EntityDetailTabs
        title="Vendor 360 Navigation"
        subtitle="A shared enterprise tab model keeps every 360 page structured the same way."
        tabs={[
          { key: "overview", label: "Overview", description: "Supplier visibility, purchasing activity, and support readiness." },
          { key: "procurement", label: "Procurement", description: "Requests, orders, receipts, and supplier transaction flow." },
          { key: "timeline", label: "Timeline", description: "How supplier demand turns into delivery and operational support." },
          { key: "ai", label: "AI Insights", description: "Decision support across reliability, receipts, and support exposure." },
          { key: "knowledge", label: "Knowledge", description: "Certificates, catalogs, terms, and supplier governance documents." },
        ]}
      />


      <DetailStateBanner
        title="Focused vendor state"
        subtitle="This page is resolving a vendor context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from vendor context" : "Default vendor resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.vendor.title}
        subtitle={entityBackendMatrix.vendor.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.vendor.targetEndpoints}
        relatedObjects={entityBackendMatrix.vendor.relatedObjects}
      />


      <DetailStateBanner
        title="Focused vendor state"
        subtitle="This page is resolving a vendor context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from vendor context" : "Default vendor resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.vendor.title}
        subtitle={entityBackendMatrix.vendor.subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix.vendor.targetEndpoints}
        relatedObjects={entityBackendMatrix.vendor.relatedObjects}
      />

      <EntityActionDock
        title="Vendor Action Dock"
        subtitle="Use direct vendor context to move between procurement, inventory, and execution support."
        actions={[
          { title: "Open Supply Chain Command", detail: "Return to procurement and item control.", href: "/supply-chain/command", tone: "neutral" },
          { title: "Open Work Order 360", detail: "Inspect execution that may depend on this supplier.", href: "/operations/work-orders/360", tone: "warning" },
          { title: "Open Contract 360", detail: "Inspect the commitment affected by this supplier context.", href: "/contracts/360", tone: "success" },
          { title: "Open Recommendations", detail: "Review recommendation logic for this supplier context.", href: "/recommendations", tone: "neutral" },
        ]}
      />

      <EntitySummaryCards
        title="Focused Vendor Summary"
        subtitle="These summary cards are built from the currently focused vendor context."
        items={[
          { label: "Vendor", value: asText(focusVendor?.id, "—"), detail: "Focused vendor id" },
          { label: "Vendor Name", value: focusTitle || "—", detail: "Focused supplier context" },
          { label: "Purchase Orders", value: formatCount(toCount(relatedPOs)), detail: "Purchase orders linked by vendor id" },
          { label: "Items", value: formatCount(toCount(relatedItems)), detail: "Items linked by vendor id or preferred vendor id" },
          { label: "Receipts", value: formatCount(toCount(relatedReceipts)), detail: "Goods receipts linked through purchase orders" },
        ]}
      />


      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <EnterpriseGraphNavigator
          title="Vendor Navigation Graph"
          subtitle="Move across the business objects connected to this supplier context."
          nodes={[
            {
              title: "Supply Chain Command",
              detail: "Return to procurement and inventory command control.",
              href: "/supply-chain/command",
              badge: "Command",
              connections: ["Items", "Requests", "Orders"],
            },
            {
              title: "Work Order 360",
              detail: "Inspect the execution context that may depend on this supplier.",
              href: "/operations/work-orders/360",
              badge: "360",
              connections: ["Execution", "Support", "Items"],
            },
            {
              title: "Contract 360",
              detail: "Inspect contract delivery that may depend on procurement support.",
              href: "/contracts/360",
              badge: "360",
              connections: ["Delivery", "Finance", "Risk"],
            },
          ]}
        />

        <EntityContextRail
          title="Vendor Context Rail"
          subtitle="Focused context and next navigation clues for this supplier."
          sections={[
            {
              title: "Focused Context",
              items: [
                { label: "Vendor ID", value: asText(focusVendor?.id, "—"), detail: "Focused vendor identifier." },
                { label: "Vendor Name", value: focusTitle || "—", detail: "Resolved supplier context." },
              ],
            },
            {
              title: "Related Counts",
              items: [
                { label: "POs", value: formatCount(toCount(relatedPOs)), detail: "Purchase orders linked by vendor id." },
                { label: "Items", value: formatCount(toCount(relatedItems)), detail: "Items linked by vendor relations." },
                { label: "Receipts", value: formatCount(toCount(relatedReceipts)), detail: "Receipts linked through related purchase orders." },
              ],
            },
          ]}
        />
      </div>

      <EnterpriseHealthStrip
        title="Vendor 360 Signals"
        subtitle="Current supplier-related visibility across the enterprise."
        items={[
          { label: "Vendors", value: formatCount(toCount([focusVendor].filter(Boolean))), tone: "success" },
          { label: "Items", value: formatCount(toCount(relatedItems)), tone: "neutral" },
          { label: "Purchase Requests", value: formatCount(toCount(relatedPRs)), tone: "warning" },
          { label: "Purchase Orders", value: formatCount(toCount(relatedPOs)), tone: "success" },
        ]}
      />

      <ActivityGraphSummary
        title="Vendor Activity Graph"
        subtitle="A supplier should be visible as a support graph across procurement, stock, and delivery."
        nodes={[
          { label: "Supplier", value: formatCount(toCount([focusVendor].filter(Boolean))), detail: "Vendor profile visibility." },
          { label: "Requests", value: formatCount(toCount(relatedPRs)), detail: "Demand entering the supplier pipeline." },
          { label: "Orders", value: formatCount(toCount(relatedPOs)), detail: "Committed supplier transactions." },
          { label: "Receipts", value: formatCount(toCount(relatedReceipts)), detail: "Delivery realization and warehouse visibility." },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
  
      <AIInsightPanel
        title="AI Vendor Insight Cards"
        subtitle="AI-style supplier insight should connect procurement activity, inventory support, and delivery reliability."
        insights={buildVendorRecommendations({
          relatedPOs: relatedPOs.length,
          relatedItems: relatedItems.length,
          relatedReceipts: relatedReceipts.length,
          connectedFeeds: statusItems.filter((i) => i.ok).length,
          totalFeeds: statusItems.length,
        })}
      />


      <RelationshipTimeline
          title="Vendor Relationship Timeline"
          subtitle="This timeline shows how supplier value should move through the enterprise."
          events={[
            { time: "Demand", title: "Request created", detail: "Internal or operational demand creates procurement need.", tone: "warning" },
            { time: "Sourcing", title: "Supplier selected", detail: "Procurement routes demand into a vendor relationship.", tone: "neutral" },
            { time: "Commitment", title: "Purchase order issued", detail: "Commercial commitment to supplier is created.", tone: "success" },
            { time: "Delivery", title: "Goods received", detail: "Supplier follow-through becomes visible through receipt and stock readiness.", tone: "success" },
          ]}
        />

        <KnowledgePanel
          title="Vendor Knowledge and Documents"
          subtitle="Bring supplier governance, catalogs, and qualification support into the 360 view."
          sections={[
            {
              title: "Supplier Governance",
              items: [
                { label: "Qualification Profile", detail: "Approved categories, onboarding status, and governance context." },
                { label: "Certificates and Compliance", detail: "Insurance, compliance, or vendor documentation expectations." },
              ],
            },
            {
              title: "Commercial Support",
              items: [
                { label: "Price Lists and Terms", detail: "Commercial terms, pricing assumptions, and sourcing constraints." },
                { label: "Framework Agreements", detail: "Longer-term procurement context and approved buying relationships." },
              ],
            },
            {
              title: "Operational Support",
              items: [
                { label: "Catalogs and Items", detail: "Supplier-provided item coverage and supported categories." },
                { label: "Delivery Standards", detail: "Receipt, warehouse, and response expectations tied to supplier performance." },
              ],
            },
          ]}
        />
      </div>

      <RelationshipGrid
        title="Vendor Relationship Map"
        subtitle="A supplier should be understood as part of a broader execution and cost network."
        items={[
          {
            title: "Supplier Master",
            value: formatCount(toCount([focusVendor].filter(Boolean))),
            detail: "The vendor profile should unify qualification, category, and relationship context.",
            links: ["Qualification", "Certificates", "Contacts", "Scorecards"],
          },
          {
            title: "Purchasing",
            value: formatCount(toCount(relatedPOs)),
            detail: "Purchase orders represent direct commercial activity with suppliers.",
            links: ["Requests", "Orders", "Pricing", "Terms"],
          },
          {
            title: "Receipts",
            value: formatCount(toCount(relatedReceipts)),
            detail: "Goods receipts measure delivery follow-through and purchasing realization.",
            links: ["Orders", "Receipts", "Discrepancies", "Warehouse"],
          },
          {
            title: "Inventory Support",
            value: formatCount(toCount(relatedItems)),
            detail: "Vendors ultimately support item readiness and operational continuity.",
            links: ["Items", "Stock", "Reservations", "Usage"],
          },
          {
            title: "Operations Impact",
            value: "Mapped",
            detail: "Supplier performance should influence work order support and service reliability.",
            links: ["Work Orders", "Maintenance", "Assets", "SLA"],
          },
          {
            title: "Executive Impact",
            value: "Mapped",
            detail: "Supplier behavior should influence spend, exposure, and leadership risk review.",
            links: ["Spend", "Risk", "Analytics", "Executive Center"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <IntegrationStatusPanel
          title="Integration Status"
          subtitle="Vendor 360 should expose every supplier dependency clearly."
          items={statusItems}
        />

        <LinkedScenarioPanel
          title="Vendor Scenarios"
          subtitle="Representative enterprise flows for supplier-centered operations."
          scenarios={[
            {
              title: "Supplier Fulfillment Flow",
              detail: "Demand should become a request, then a supplier order, then receipt, then operational availability.",
              chain: ["Purchase Request", "Vendor", "Purchase Order", "Receipt", "Inventory", "Execution"],
            },
            {
              title: "Supplier Performance Loop",
              detail: "Vendor outcomes should eventually influence spend, operational trust, and executive decisions.",
              chain: ["Vendor", "Order", "Delivery", "Operational Impact", "Scorecard", "Executive Review"],
            },
          ]}
        />
      </div>

      <RelatedRecordsPanel
        title="Live Related Records"
        subtitle="These records are filtered around the focused vendor id using available live relations."
        groups={[
          {
            title: "Related Purchase Orders",
            countLabel: formatCount(toCount(relatedPOs)),
            records: poPreview,
            emptyMessage: "No purchase orders are linked to the focused vendor id.",
          },
          {
            title: "Related Items",
            countLabel: formatCount(toCount(relatedItems)),
            records: itemPreview,
            emptyMessage: "No items are linked to the focused vendor context.",
          },
          {
            title: "Related Goods Receipts",
            countLabel: formatCount(toCount(relatedReceipts)),
            records: receiptPreview,
            emptyMessage: "No receipts are linked to the focused vendor context.",
          },
        ]}
      />
    </div>
  );
}
