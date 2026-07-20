"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { executiveIntelligenceApi } from "../../../../../lib/executive-intelligence-api";
import { asText, formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { SLARiskBoard } from "../../../../../components/workspace/SLARiskBoard";
import { QueueBoardMatrix } from "../../../../../components/workspace/QueueBoardMatrix";
import { WatchlistPanel } from "../../../../../components/workspace/WatchlistPanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

export default function OperationsSLAReviewPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [woRes, reqRes, techRes, watchRes] = await Promise.all([
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.serviceRequests(),
        enterpriseApi.operations.technicians(),
        executiveIntelligenceApi.watchlists(),
      ]);

      if (!active) return;

      setWorkOrders(toList(woRes.data));
      setRequests(toList(reqRes.data));
      setTechnicians(toList(techRes.data));

      const allWatch = Array.isArray((watchRes as any)?.watchlists) ? (watchRes as any).watchlists : Array.isArray((watchRes as any)?.data?.watchlists) ? (watchRes as any).data.watchlists : [];
      const filtered = allWatch.filter((item: any) => {
        const title = String(item?.title || "").toLowerCase();
        const detail = String(item?.detail || "").toLowerCase();
        return title.includes("execution") || title.includes("work") || title.includes("service") || detail.includes("work order") || detail.includes("execution");
      });
      setWatchlists(filtered);
    })();

    return () => {
      active = false;
    };
  }, []);

  const slaItems = useMemo(() => {
    const workOrderCount = toCount(workOrders);
    const requestCount = toCount(requests);
    const technicianCount = toCount(technicians);
    const openPressure = Math.max(0, Math.floor(workOrderCount * 0.4));
    const demandPressure = Math.max(0, Math.floor(requestCount * 0.5));

    return [
      {
        title: "Execution Load",
        value: formatCount(workOrderCount),
        detail: "Visible work-order volume influencing SLA posture.",
        severity: workOrderCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Demand Load",
        value: formatCount(requestCount),
        detail: "Visible service demand currently pressing the operations layer.",
        severity: requestCount > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Technician Capacity",
        value: formatCount(technicianCount),
        detail: "Visible technician records supporting current service continuity.",
        severity: technicianCount > 0 ? "success" as const : "warning" as const,
      },
      {
        title: "Open Pressure Signal",
        value: formatCount(openPressure),
        detail: "Estimated visible subset likely needing stronger execution follow-up.",
        severity: openPressure > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Demand Pressure Signal",
        value: formatCount(demandPressure),
        detail: "Estimated visible subset likely needing stronger SLA attention.",
        severity: demandPressure > 0 ? "warning" as const : "neutral" as const,
      },
      {
        title: "Watch Items",
        value: formatCount(watchlists.length),
        detail: "Visible operations watch items requiring review.",
        severity: watchlists.length > 0 ? "warning" as const : "success" as const,
      },
    ];
  }, [workOrders, requests, technicians, watchlists]);

  const queueColumns = useMemo(() => {
    const workOrderQueue = workOrders.slice(0, 6).map((item) => ({
      title: asText(item.title || item.work_order_number || item.id),
      meta: asText(item.status, "work order"),
      detail: `Priority: ${asText(item.priority)} • Type: ${asText(item.type)}`,
      badges: ["execution"],
    }));

    const requestQueue = requests.slice(0, 6).map((item) => ({
      title: asText(item.title || item.id),
      meta: asText(item.status, "request"),
      detail: `Priority: ${asText(item.priority)} • Category: ${asText(item.category)}`,
      badges: ["demand"],
    }));

    const technicianQueue = technicians.slice(0, 6).map((item) => ({
      title: asText(item.name || item.email || item.id),
      meta: asText(item.specialization || "technician"),
      detail: `Region: ${asText(item.region)} • Active: ${asText(item.is_active)}`,
      badges: ["capacity"],
    }));

    const watchQueue = watchlists.slice(0, 6).map((item: any) => ({
      title: asText(item.title || "Watch Item"),
      meta: asText(item.severity || "watch"),
      detail: asText(item.detail || item.recommended_action),
      badges: ["attention"],
    }));

    return [
      {
        title: "Execution Queue",
        subtitle: `${formatCount(workOrders.length)} visible work orders`,
        tone: "warning" as const,
        cards: workOrderQueue,
      },
      {
        title: "Demand Queue",
        subtitle: `${formatCount(requests.length)} visible service requests`,
        tone: "warning" as const,
        cards: requestQueue,
      },
      {
        title: "Capacity Queue",
        subtitle: `${formatCount(technicians.length)} visible technicians`,
        tone: "success" as const,
        cards: technicianQueue,
      },
      {
        title: "Watch Queue",
        subtitle: `${formatCount(watchlists.length)} visible SLA-related watch items`,
        tone: "neutral" as const,
        cards: watchQueue,
      },
    ];
  }, [workOrders, requests, technicians, watchlists]);

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Operations Center"
        title="Operations SLA Review Board"
        subtitle="A review-oriented service quality surface for execution pressure, demand load, workforce capacity, and SLA-related attention."
        badges={[
          "SLA Review",
          "Execution Load",
          "Demand Load",
          "Capacity View",
        ]}
      />

      <SLARiskBoard
        title="SLA Risk Matrix"
        subtitle="Use this board to understand where delivery continuity may be under pressure."
        items={slaItems}
      />

      <QueueBoardMatrix
        title="SLA Review Queues"
        subtitle="Review execution, demand, capacity, and watch queues before drilling into detail."
        columns={queueColumns}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WatchlistPanel
          title="Operations Watchlist"
          subtitle="Visible operations and execution watch items from the current executive watchlist layer."
          items={watchlists}
        />

        <WorkflowLauncherPanel
          title="SLA Review Workflows"
          subtitle="Move from SLA review into the right operations action path."
          workflows={[
            {
              title: "Demand to Dispatch Workflow",
              detail: "Move service demand into assignment and operational follow-through.",
              href: "/workflows/launcher",
              stages: ["Request", "Assign", "Dispatch", "Track"],
            },
            {
              title: "Execution Recovery Workflow",
              detail: "Move visible execution pressure into follow-up and closure proof.",
              href: "/workflows/launcher",
              stages: ["Work Order", "Execution", "Report", "Recover"],
            },
            {
              title: "Capacity Balancing Workflow",
              detail: "Move capacity pressure into technician and dispatch review.",
              href: "/workflows/launcher",
              stages: ["Queue", "Capacity", "Assign", "Monitor"],
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightStack
          title="SLA Review Guidance"
          subtitle="How to use the SLA review surface effectively."
          items={[
            {
              title: "Start with demand versus capacity",
              detail: "The most important review question is whether visible demand is outpacing visible technician coverage.",
            },
            {
              title: "Use work orders as execution proof",
              detail: "Visible work-order pressure is the best current proxy for service delivery risk.",
            },
            {
              title: "Use watchlists for urgency",
              detail: "When watch items appear, move quickly into command or 360 views to validate the root issue.",
            },
          ]}
        />

        <EnterpriseGraphNavigator
          title="SLA Review Navigation"
          subtitle="Move from SLA review into the best execution or customer-detail workspace."
          nodes={[
            {
              title: "Operations Workbench",
              detail: "Daily execution and service coordination surface.",
              href: "/operations/workbench",
              badge: "Workbench",
              connections: ["Queues", "Requests", "Technicians"],
            },
            {
              title: "Operations Command",
              detail: "Broader execution command surface.",
              href: "/operations/command",
              badge: "Command",
              connections: ["Work Orders", "Dispatch", "SLA"],
            },
            {
              title: "Work Order 360",
              detail: "Execution detail and service proof surface.",
              href: "/operations/work-orders/360",
              badge: "360",
              connections: ["Requests", "Technicians", "Reports"],
            },
            {
              title: "Customer 360",
              detail: "Customer continuity surface if SLA issues threaten relationship quality.",
              href: "/customers/360",
              badge: "360",
              connections: ["Contracts", "Invoices", "Experience"],
            },
          ]}
        />
      </div>
    </div>
  );
}
