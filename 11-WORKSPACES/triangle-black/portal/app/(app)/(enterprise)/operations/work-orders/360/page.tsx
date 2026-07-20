// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { enterpriseApi, type SafeApiResult } from "../../../../../../lib/enterprise-api";
import { asText, formatCount, toCount, toList } from "../../../../../../lib/enterprise-format";
import { filterByField, filterByAnyField, resolveById } from "../../../../../../lib/entity-relations";
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
import { buildWorkOrderRecommendations, buildReadinessLabel } from "../../../../../../lib/entity-intelligence";
import { BackendAlignmentPanel } from "../../../../../../components/workspace/BackendAlignmentPanel";
import { entityBackendMatrix } from "../../../../../../lib/entity-backend-matrix";
import { entityViewApi } from "../../../../../../lib/entity-view-api";
import { resolveWorkOrderDetailPayload } from "../../../../../../lib/entity-detail-resolver";
import { EntityActionDock } from "../../../../../../components/workspace/EntityActionDock";
import { EnterpriseGraphNavigator } from "../../../../../../components/workspace/EnterpriseGraphNavigator";
import { EntityContextRail } from "../../../../../../components/workspace/EntityContextRail";

type State = {
  workOrders: SafeApiResult | null;
  technicians: SafeApiResult | null;
  serviceRequests: SafeApiResult | null;
  serviceReports: SafeApiResult | null;
};

export default function WorkOrder360Page() {
  const searchParams = useSearchParams();
  const [directPayload, setDirectPayload] = useState<any>(null);
  const focusId = searchParams.get("id") || "";

  const [state, setState] = useState<State>({
    workOrders: null,
    technicians: null,
    serviceRequests: null,
    serviceReports: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [workOrders, technicians, serviceRequests, serviceReports] = await Promise.all([
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.technicians(),
        enterpriseApi.operations.serviceRequests(),
        enterpriseApi.operations.serviceReports(),
      ]);
      if (!active) return;
      setState({ workOrders, technicians, serviceRequests, serviceReports });
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
      const res = await entityViewApi.workOrder(focusId);
      if (!active) return;
      setDirectPayload(res.ok ? resolveWorkOrderDetailPayload(res.data) : null);
    })();

    return () => {
      active = false;
    };
  }, [focusId]);

  const workOrders = toList(state.workOrders?.data);
  const technicians = toList(state.technicians?.data);
  const serviceRequests = toList(state.serviceRequests?.data);
  const serviceReports = toList(state.serviceReports?.data);

  const focusWorkOrder = useMemo(
    () => resolveById(workOrders, focusId) || workOrders[0] || null,
    [state, focusId]
  );

  const relatedTechnicians = useMemo(
    () => filterByField(technicians, "id", asText(focusWorkOrder?.assigned_technician_id)),
    [state, asText(focusWorkOrder?.assigned_technician_id)]
  );

  const relatedRequests = useMemo(
    () => {
      const byConverted = filterByAnyField(serviceRequests, ["converted_work_order_id"], asText(focusWorkOrder?.id));
      const byRequestId = filterByField(serviceRequests, "id", asText(focusWorkOrder?.service_request_id));
      const merged = [...byConverted, ...byRequestId];
      const seen = new Set();
      return merged.filter((item: any) => {
        const key = asText(item?.id);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [state, asText(focusWorkOrder?.id), asText(focusWorkOrder?.service_request_id)]
  );

  const relatedReports = useMemo(
    () => filterByField(serviceReports, "work_order_id", asText(focusWorkOrder?.id)),
    [state, asText(focusWorkOrder?.id)]
  );

  const focusTitle = focusWorkOrder?.title || focusWorkOrder?.work_order_number || focusWorkOrder?.id || "Work Order 360";

  const technicianPreview = relatedTechnicians.slice(0, 6).map((item: any) => ({
    title: asText(item.name || item.email || item.id),
    meta: asText(item.specialization || item.role || "technician"),
    detail: `Region: ${asText(item.region)} • Active: ${asText(item.is_active)}`,
    href: "/operations/command",
    entityType: "technician",
    entityId: asText(item.id, ""),
    entityName: asText(item.name || item.email || item.id),
    connections: ["Work Orders", "Schedules", "Regions"],
  }));

  const requestPreview = relatedRequests.slice(0, 6).map((item: any) => ({
    title: asText(item.title || item.id),
    meta: asText(item.status, "request"),
    detail: `Priority: ${asText(item.priority)} • Category: ${asText(item.category)}`,
    href: "/operations/command",
    entityType: "service-request",
    entityId: asText(item.id, ""),
    entityName: asText(item.title || item.id),
    connections: ["Customer", "SLA", "Escalation"],
  }));

  const reportPreview = relatedReports.slice(0, 6).map((item: any) => ({
    title: asText(item.summary || item.id),
    meta: asText(item.client_visible, "report"),
    detail: `Technician${asText(item.technician_id)} • Work Order: ${asText(item.work_order_id)}`,
    href: "/operations/work-orders/360",
    entityType: "service-report",
    entityId: asText(item.id, ""),
    entityName: asText(item.summary || item.id),
    connections: ["Work Order", "Customer", "Knowledge"],
  }));

  const statusItems = [
    { label: "Work Orders", ok: !!state.workOrders?.ok, detail: state.workOrders?.ok ? "Work order feed connected" : state.workOrders?.error || "Work order feed unavailable" },
    { label: "Technicians", ok: !!state.technicians?.ok, detail: state.technicians?.ok ? "Technician feed connected" : state.technicians?.error || "Technician feed unavailable" },
    { label: "Service Requests", ok: !!state.serviceRequests?.ok, detail: state.serviceRequests?.ok ? "Service request feed connected" : state.serviceRequests?.error || "Service request feed unavailable" },
    { label: "Service Reports", ok: !!state.serviceReports?.ok, detail: state.serviceReports?.ok ? "Service report feed connected" : state.serviceReports?.error || "Service report feed unavailable" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <Entity360Hero
        eyebrow="Operations Center"
        title={focusTitle}
        subtitle="Work Order 360 connects service demand, technician execution, reporting, and future supply support into one operational detail view."
        badges={[
          "Work Order 360",
          "Operations + Technicians + Service Reports",
          focusId ? "Focused by Work Order ID" : "Execution Detail View",
        ]}
      />


      <DetailStateBanner
        title="Focused work-order state"
        subtitle="This page is resolving a work-order context from the current enterprise navigation state."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from work-order context" : "Default work-order resolution")}
      />

      <EntityDetailTabs
        title="Work Order 360 Navigation"
        subtitle="A shared enterprise tab model keeps every 360 page structured the same way."
        tabs={[
          { key: "overview", label: "Overview", description: "Execution readiness, demand pressure, and closure quality." },
          { key: "execution", label: "Execution", description: "Technician linkage, service demand, and delivery flow." },
          { key: "timeline", label: "Timeline", description: "How service work moves from demand to documented outcome." },
          { key: "ai", label: "AI Insights", description: "Decision support across readiness, closure, and support dependencies." },
          { key: "knowledge", label: "Knowledge", description: "SOPs, safety notes, methods, and reporting standards." },
        ]}
      />


      <DetailStateBanner
        title="Focused work-order state"
        subtitle="This page is resolving a work-order context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from work-order context" : "Default work-order resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix["work-order"].title}
        subtitle={entityBackendMatrix["work-order"].subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix["work-order"].targetEndpoints}
        relatedObjects={entityBackendMatrix["work-order"].relatedObjects}
      />


      <DetailStateBanner
        title="Focused work-order state"
        subtitle="This page is resolving a work-order context from current enterprise navigation and live related records."
        state={buildReadinessLabel(statusItems.filter((i) => i.ok).length, statusItems.length)}
        source={directPayload ? "Direct backend entity payload" : (focusId ? "Focused from work-order context" : "Default work-order resolution")}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix["work-order"].title}
        subtitle={entityBackendMatrix["work-order"].subtitle}
        currentFeeds={statusItems}
        targetEndpoints={entityBackendMatrix["work-order"].targetEndpoints}
        relatedObjects={entityBackendMatrix["work-order"].relatedObjects}
      />

      <EntityActionDock
        title="Work Order Action Dock"
        subtitle="Use direct work-order context to move between execution, supplier support, and contract review."
        actions={[
          { title: "Open Operations Command", detail: "Return to execution and dispatch control.", href: "/operations/command", tone: "warning" },
          { title: "Open Contract 360", detail: "Inspect the contract behind this execution.", href: "/contracts/360", tone: "neutral" },
          { title: "Open Vendor 360", detail: "Inspect supplier support for this execution chain.", href: "/supply-chain/vendors/360", tone: "neutral" },
          { title: "Open Recommendations", detail: "Review recommendation logic for this work-order context.", href: "/recommendations", tone: "success" },
        ]}
      />

      <EntitySummaryCards
        title="Focused Work Order Summary"
        subtitle="These summary cards are built from the currently focused work order context."
        items={[
          { label: "Work Order", value: asText(focusWorkOrder?.id, "—"), detail: "Focused work order id" },
          { label: "Status", value: asText(focusWorkOrder?.status, "—"), detail: "Focused work order execution state" },
          { label: "Technicians", value: formatCount(toCount(relatedTechnicians)), detail: "Assigned or linked technicians" },
          { label: "Requests", value: formatCount(toCount(relatedRequests)), detail: "Linked demand records" },
          { label: "Rts", value: formatCount(toCount(relatedReports)), detail: "Linked closure and proof records" },
        ]}
      />


      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <EnterpriseGraphNavigator
          title="Work Order Navigation Graph"
          subtitle="Move across the business objects connected to this execution context."
          nodes={[
            {
              title: "Operations Command",
              detail: "Return to execution and dispatch control.",
              href: "/operations/command",
              badge: "Command",
              connections: ["Work Orders", "Requests", "Technicians"],
            },
            {
              title: "Contract 360",
              detail: "Inspect the commercial commitment behind this execution.",
              href: "/contracts/360",
              badge: "360",
              connections: ["Customer", "Invoices", "Performance"],
            },
            {
              title: "Vendor 360",
              detail: "Inspect the supplier context that may support this execution.",
              href: "/supply-chain/vendors/360",
              badge: "360",
              connections: ["Items", "Requests", "Receipts"],
            },
          ]}
        />

        <EntityContextRail
          title="Work Order Context Rail"
          subtitle="Focused context and next navigation clues for this work order."
          sections={[
            {
              title: "Focused Context",
              items: [
                { label: "Work Order ID", value: asText(focusWorkOrder?.id, "—"), detail: "Focused work-order identifier." },
                { label: "Status", value: asText(focusWorkOrder?.status, "—"), detail: "Current work-order execution state." },
              ],
            },
            {
              title: "Related Counts",
              items: [
                { label: "Technicians", value: formatCount(toCount(relatedTechnicians)), detail: "Assigned or linked technician records." },
                { label: "Requests", value: formatCount(toCount(relatedRequests)), detail: "Demand records linked to this work order." },
                { label: "Reports", value: formatCount(toCount(relatedReports)), detail: "Closure proof records linked to this work order." },
              ],
            },
          ]}
        />
      </div>

      <EnterpriseHealthStrip
        title="Work Order 360 Signals"
        subtitle="Current execution-layer visibility across the enterprise."
        items={[
          { label: "Work Orders", value: formatCount(toCount([focusWorkOrder].filter(Boolean))), tone: "success" },
          { label: "Technicians", value: formatCount(toCount(relatedTechnicians)), tone: "neutral" },
          { label: "Requests", value: formatCount(toCount(relatedRequests)), tone: "warning" },
          { label: "Reports", value: formatCount(toCount(relatedReports)), tone: "success" },
        ]}
      />

      <ActivityGraphSummary
        title="Work Order Activity Graph"
        subtitle="Execution should be visible as a connected operational graph, not a standalone task."
        nodes={[
          { label: "Request", value: formatCount(toCount(relatedRequests)), detail: "Demand entering execution." },
          { label: "Work Order", value: formatCount(toCount([focusWorkOrder].filter(Boolean))), detail: "Operational execution unit." },
          { label: "Technician", value: formatCount(toCount(relatedTechnicians)), detail: "Assigned workforce and field capacity." },
          { label: "Report", value: formatCount(toCount(relatedReports)), detail: "Closure, proof, and service knowledge." },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
  
      <AIInsightPanel
        title="AI Work Order Insight Cards"
        subtitle="AI-style execution insight should connect demand, technician readiness, and closure quality."
        insights={buildWorkOrderRecommendations({
          relatedTechnicians: relatedTechnicians.length,
          relatedRequests: relatedRequests.length,
          relatedReports: relatedReports.length,
          connectedFeeds: statusItems.filter((i) => i.ok).length,
          totalFeeds: statusItems.length,
        })}
      />


      <RelationshipTimeline
          title="Work Order Relationship Timeline"
          subtitle="This timeline shows how execution should move from demand to service proof."
          events={[
            { time: "Demand", title: "Request or planned trigger", detail: "A customer request or maintenance plan creates execution demand.", tone: "warning" },
            { time: "Execution", title: "Work order created", detail: "The service need becomes an actionable work unit.", tone: "success" },
            { time: "Field", title: "Technician assignment", detail: "A field resource becomes responsible for the work.", tone: "neutral" },
            { time: "Proof", title: "Service report closes the loop", detail: "Execution becomes documented service outcome and organizational knowledge.", tone: "success" },
          ]}
        />

        <KnowledgePanel
          title="Work Order Knowledge and Documents"
          subtitle="Bring execution knowledge, field documents, and closure standards into the 360 view."
          sections={[
            {
              title: "Execution Standards",
              items: [
                { label: "Method Statement", detail: "Recommended execution approach and operational method guidance." },
                { label: "Safety Notes", detail: "Site and task-specific safety expectations for the work order layer." },
              ],
            },
            {
              title: "Technical Support",
              items: [
                { label: "Troubleshooting Guides", detail: "Typical failure guidance and resolution references." },
                { label: "Asset Manuals", detail: "Relevant manuals and technical notes should attach here over time." },
              ],
            },
            {
              title: "Closure Quality",
              items: [
                { label: "Service Report Standard", detail: "Expected reporting quality, findings structure, and customer proof rules." },
                { label: "Parts and Support Notes", detail: "Future link to stock, vendor, and support actions for execution continuity." },
              ],
            },
          ]}
        />
      </div>

      <RelationshipGrid
        title="Work Order Relationship Map"
        subtitle="A work order should be understood as the center of an execution graph."
        items={[
          {
            title: "Demand Source",
            value: formatCount(toCount(relatedRequests)),
            detail: "A work order should emerge from either a request or a planned maintenance trigger.",
            links: ["Service Request", "SLA", "Escalation", "Customer"],
          },
          {
            title: "Execution",
            value: formatCount(toCount(relatedTechnicians)),
            detail: "Technicians and teams are the operational execution layer.",
            links: ["Technicians", "Dispatch", "Schedule", "Completion"],
          },
          {
            title: "Reporting",
            value: formatCount(toCount(relatedReports)),
            detail: "Completed work should create durable service proof and knowledge.",
            links: ["Service Reports", "Findings", "Recommendations", "Customer Visibility"],
          },
          {
            title: "Asset Context",
            value: "Next",
            detail: "Work orders should eventually link to site assets, manuals, warranty, and history.",
            links: ["Assets", "History", "Warranty", "Manuals"],
          },
          {
            title: "Supply Support",
            value: "Next",
            detail: "Execution should eventually connect to parts, stock, and procurement support.",
            links: ["Items", "Reservations", "Purchase Requests", "Vendors"],
          },
          {
            title: "Commercial Impact",
            value: "Mapped",
            detail: "Execution quality should influence contract health and customer growth.",
            links: ["Contracts", "Invoices", "Renewals", "Customer Health"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <IntegrationStatusPanel
          title="Integration Status"
          subtitle="Work Order 360 should expose every execution dependency clearly."
          items={statusItems}
        />

        <LinkedScenarioPanel
          title="Work Order Scenarios"
          subtitle="Representative enterprise flows for execution detail."
          scenarios={[
            {
              title: "Reactive Execution Flow",
              detail: "Customer demand becomes a request, then a work order, then field execution, then a report.",
              chain: ["Request", "Work Order", "Technician", "Service Report", "Customer Outcome"],
            },
            {
              title: "Execution Support Flow",
              detail: "A work order may require stock, procurement, and supplier support before successful closure.",
              chain: ["Work Order", "Item Need", "Request", "Vendor", "Receipt", "Completion"],
            },
          ]}
        />
      </div>

      <RelatedRecordsPanel
        title="Live Related Records"
        subtitle="These records are filtered around the focused work-order id using available live relations."
        groups={[
          {
            title: "Related Technicians",
            countLabel: formatCount(toCount(relatedTechnicians)),
            records: technicianPreview,
            emptyMessage: "No technicians are linked to the focused work order.",
          },
          {
            title: "Related Service Requests",
            countLabel: formatCount(toCount(relatedRequests)),
            records: requestPreview,
            emptyMessage: "No service requests are linked to the focused work order.",
          },
          {
            title: "Related Service Reports",
            countLabel: formatCount(toCount(relatedReports)),
            records: reportPreview,
            emptyMessage: "No service reports are linked to the focused work order.",
          },
        ]}
      />
    </div>
  );
}
