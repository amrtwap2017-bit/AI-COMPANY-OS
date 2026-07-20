// @ts-nocheck

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
  workOrders: SafeApiResult | null;
  technicians: SafeApiResult | null;
  serviceRequests: SafeApiResult | null;
};

export default function OperationsCommandPage() {
  const [state, setState] = useState<State>({
    workOrders: null,
    technicians: null,
    serviceRequests: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const [workOrders, technicians, serviceRequests] = await Promise.all([
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.technicians(),
        enterpriseApi.operations.serviceRequests(),
      ]);
      if (!active) return;
      setState({ workOrders, technicians, serviceRequests });
    })();
    return () => {
      active = false;
    };
  }, []);

  const workOrders = toList(state.workOrders?.data);
  const technicians = toList(state.technicians?.data);
  const serviceRequests = toList(state.serviceRequests?.data);

  const workOrderPreview = useMemo(
    () =>
      workOrders.slice(0, 6).map((item: any) => ({
        title: asText(item.title || item.work_order_number || item.id),
        meta: asText(item.status, "work order"),
        detail: `Priority: ${asText(item.priority)} • Type: ${asText(item.type)}`,
        href: "/operations/work-orders/360",
        entityType: "work-order",
        entityId: asText(item.id, ""),
        entityName: asText(item.title || item.work_order_number || item.id),
        connections: ["Request", "Technician", "Asset", "Service Report"],
      })),
    [state.workOrders]
  );

  const technicianPreview = useMemo(
    () =>
      technicians.slice(0, 6).map((item: any) => ({
        title: asText(item.name || item.email || item.id),
        meta: asText(item.specialization || item.role || "technician"),
        detail: `Region: ${asText(item.region)} • Active: ${asText(item.is_active)}`,
        href: "/operations/command",
        entityType: "technician",
        entityId: asText(item.id, ""),
        entityName: asText(item.name || item.email || item.id),
        connections: ["Work Orders", "Schedules", "Regions", "Execution"],
      })),
    [state.technicians]
  );

  const statusItems = [
    {
      label: "Work Orders",
      ok: !!state.workOrders?.ok,
      detail: state.workOrders?.ok ? "Work order feed connected" : state.workOrders?.error || "Work order feed unavailable",
    },
    {
      label: "Technicians",
      ok: !!state.technicians?.ok,
      detail: state.technicians?.ok ? "Technician feed connected" : state.technicians?.error || "Technician feed unavailable",
    },
    {
      label: "Service Requests",
      ok: !!state.serviceRequests?.ok,
      detail: state.serviceRequests?.ok ? "Service request feed connected" : state.serviceRequests?.error || "Service request feed unavailable",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkspaceBanner
        role="Operations Manager / Dispatch"
        title="Operations command mode is active"
        description="Use this workspace to control execution flow, workforce visibility, service demand, and operational readiness."
        actions={[
          "Track execution queues",
          "Review technician readiness",
          "Inspect service demand",
          "Monitor integration quality",
        ]}
      />

      <EntityLinkDeck
        title="Enterprise Drill-down"
        subtitle="Jump directly into the most important execution-centered 360 workspaces."
        items={[
          { title: "Work Order 360", detail: "See request, technician, report, and supply support in one detail workspace.", href: "/operations/work-orders/360", badge: "360" },
          { title: "Contract 360", detail: "See how execution supports the commercial commitment.", href: "/contracts/360", badge: "360" },
          { title: "Customer 360", detail: "See how service performance shapes customer health.", href: "/customers/360", badge: "360" },
          { title: "Vendor 360", detail: "See how supply support affects execution continuity.", href: "/supply-chain/vendors/360", badge: "360" },
        ]}
      />

      <FilterBar
        title="Operations Filters"
        subtitle="Shape the operations workspace around urgency, execution state, and field readiness."
        groups={[
          {
            title: "Priority",
            options: [
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Emergency", value: "emergency" },
            ],
          },
          {
            title: "Status",
            options: [
              { label: "Draft", value: "draft" },
              { label: "Assigned", value: "assigned" },
              { label: "In Progress", value: "in_progress" },
              { label: "Completed", value: "completed" },
            ],
          },
          {
            title: "Execution View",
            options: [
              { label: "Dispatch", value: "dispatch" },
              { label: "Field Team", value: "field" },
              { label: "SLA", value: "sla" },
            ],
          },
        ]}
      />

      <ObjectJourneyRibbon
        title="Operations Object Journey"
        subtitle="This is how service execution should move through the enterprise platform."
        steps={[
          { label: "Request", detail: "Customer or planned demand enters", tone: "warning" },
          { label: "Work Order", detail: "Execution unit is created", tone: "success" },
          { label: "Technician", detail: "Field resource is assigned", tone: "neutral" },
          { label: "Asset", detail: "Work happens against a site or asset", tone: "neutral" },
          { label: "Supply", detail: "Vendor or item support may be needed", tone: "warning" },
          { label: "Report", detail: "Closure becomes knowledge and proof", tone: "success" },
        ]}
      />

      <SignalStrip
        title="Operations Signals"
        subtitle="Execution indicators derived from live operational endpoints where available."
        items={[
          { label: "Work Orders", value: formatCount(toCount(workOrders)), detail: "Current work order visibility", tone: "warning" },
          { label: "Technicians", value: formatCount(toCount(technicians)), detail: "Current technician visibility", tone: "success" },
          { label: "Service Requests", value: formatCount(toCount(serviceRequests)), detail: "Current visible request demand", tone: "warning" },
          { label: "Connected Feeds", value: String(statusItems.filter((i) => i.ok).length), detail: "Operational backend feeds online", tone: "success" },
        ]}
      />

      <ObjectLinkMap
        title="Connected Operations Object Map"
        subtitle="Operations should be visible as a connected execution chain, not isolated service pages."
        nodes={[
          {
            title: "Service Requests",
            value: formatCount(toCount(serviceRequests)),
            detail: "Reactive or planned demand entering the execution engine.",
            connections: ["Work Orders", "Customers", "Contracts", "SLA"],
            tone: "warning",
          },
          {
            title: "Work Orders",
            value: formatCount(toCount(workOrders)),
            detail: "Core operational execution objects for field delivery.",
            connections: ["Technicians", "Assets", "Service Reports", "Contracts"],
            tone: "success",
          },
          {
            title: "Technicians",
            value: formatCount(toCount(technicians)),
            detail: "Workforce capacity and field execution visibility.",
            connections: ["Work Orders", "Schedules", "Regions", "Service Quality"],
            tone: "neutral",
          },
          {
            title: "Assets",
            value: "Mapped",
            detail: "Operational jobs should connect to hotel assets, systems, and maintenance history.",
            connections: ["Work Orders", "Contracts", "Vendors", "Manuals"],
            tone: "neutral",
          },
          {
            title: "Supply Support",
            value: "Next",
            detail: "Execution should eventually connect to parts, stock, and procurement support.",
            connections: ["Items", "Reservations", "Purchase Requests", "Vendors"],
            tone: "warning",
          },
          {
            title: "Service Reports",
            value: "Next",
            detail: "Completed work should become customer proof and institutional knowledge.",
            connections: ["Work Orders", "Customers", "Knowledge Center", "Renewal Signals"],
            tone: "success",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <QueueBoard
            title="Operations Command Board"
            subtitle="Operational priorities grouped by execution responsibility."
            columns={[
              {
                title: "Dispatch Control",
                subtitle: "Who should act now",
                cards: [
                  { title: "Technician Feed", value: state.technicians?.ok ? "Live" : "Check", detail: statusItems[1].detail },
                  { title: "Visible Technicians", value: formatCount(toCount(technicians)), detail: "Current workforce visibility available to the center." },
                ],
              },
              {
                title: "Execution Control",
                subtitle: "What should be completed",
                cards: [
                  { title: "Work Order Feed", value: state.workOrders?.ok ? "Live" : "Check", detail: statusItems[0].detail },
                  { title: "Visible Work Orders", value: formatCount(toCount(workOrders)), detail: "Current execution queue represented in the command surface." },
                ],
              },
              {
                title: "Demand Control",
                subtitle: "What should be triaged",
                cards: [
                  { title: "Service Request Feed", value: state.serviceRequests?.ok ? "Live" : "Check", detail: statusItems[2].detail },
                  { title: "Visible Requests", value: formatCount(toCount(serviceRequests)), detail: "Incoming service demand visible to the center." },
                ],
              },
            ]}
          />

          <LinkedScenarioPanel
            title="Linked Business Scenarios"
            subtitle="Operations should be understood as connected service execution, not isolated tasks."
            scenarios={[
              {
                title: "Reactive Service Flow",
                detail: "A customer issue should become a request, then an executable job, then a report, then knowledge.",
                chain: ["Customer", "Service Request", "Work Order", "Technician", "Service Report", "Knowledge"],
              },
              {
                title: "Execution to Supply Chain Loop",
                detail: "Field execution should eventually connect to material need, vendor support, and stock accountability.",
                chain: ["Work Order", "Item Need", "Purchase Request", "Vendor", "Receipt", "Completion"],
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <IntegrationStatusPanel
              title="Integration Status"
              subtitle="Operations integrations should fail safely and visibly."
              items={statusItems}
            />

            <RecordListCard
              title="Work Order Preview"
              subtitle="Current work order records visible to the operations command workspace."
              items={workOrderPreview}
              emptyMessage="No work order records are currently available from the live backend feed."
            />
          </div>

          <RecordListCard
            title="Technician Preview"
            subtitle="Current technician records visible to the operations command workspace."
            items={technicianPreview}
            emptyMessage="No technician records are currently available from the live backend feed."
          />
        </div>

        <div className="space-y-6">
          <SavedViewsPanel
            title="Saved Views"
            subtitle="Reusable operational lenses for dispatch and execution management."
            views={[
              { name: "Operations Default", detail: "Balanced command view for daily operations control.", status: "Default" },
              { name: "Dispatch Watch", detail: "Focus on technician readiness and workload visibility.", status: "Team" },
              { name: "SLA Watch", detail: "Prioritize service demand and operational urgency.", status: "Personal" },
            ]}
          />

          <InsightStack
            title="Operations Insights"
            subtitle="Command-level observations for execution leadership."
            items={[
              {
                title: "Execution resilience",
                detail: "This workspace remains stable even when one operational integration is incomplete.",
              },
              {
                title: "Workforce visibility",
                detail: state.technicians?.ok ? "Technician data is available for operations planning." : "Technician integration should be hardened before dispatch expansion.",
              },
              {
                title: "Demand visibility",
                detail: state.serviceRequests?.ok ? "Service demand is visible to the center." : "Service request workflow still needs deeper backend alignment.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
