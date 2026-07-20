// @ts-nocheck

"use client";
import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { asText, formatCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { ServiceCalendarBoard } from "../../../../../components/workspace/ServiceCalendarBoard";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

function parseDate(value: any) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function OperationsCalendarPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [woRes, reqRes] = await Promise.all([
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.serviceRequests(),
      ]);

      if (!active) return;
      setWorkOrders(toList(woRes.data));
      setRequests(toList(reqRes.data));
    })();

    return () => {
      active = false;
    };
  }, []);

  const buckets = useMemo(() => {
    const now = new Date();

    const scheduledToday = workOrders.filter((item) => {
      const d = parseDate(item?.scheduled_date || item?.due_date);
      return d ? isSameDay(d, now) : false;
    });

    const overdue = workOrders.filter((item) => {
      const d = parseDate(item?.due_date || item?.scheduled_date);
      const status = String(item?.status || "").toLowerCase();
      return d && d < now && !["completed", "closed", "cancelled"].includes(status);
    });

    const upcoming = workOrders.filter((item) => {
      const d = parseDate(item?.scheduled_date || item?.due_date);
      return d && d > now;
    });

    const unscheduled = workOrders.filter((item) => !item?.scheduled_date && !item?.due_date);

    return [
      {
        label: "Today",
        count: formatCount(scheduledToday.length),
        detail: "Jobs scheduled for today based on visible schedule or due dates.",
        tone: "success" as const,
        items: scheduledToday.slice(0, 5).map((item) => ({
          title: asText(item.title || item.work_order_number || item.id),
          meta: asText(item.status, "work order"),
          detail: `Priority: ${asText(item.priority)} • Type: ${asText(item.type)}`,
        })),
      },
      {
        label: "Overdue",
        count: formatCount(overdue.length),
        detail: "Open jobs whose due date appears to be in the past.",
        tone: "warning" as const,
        items: overdue.slice(0, 5).map((item) => ({
          title: asText(item.title || item.work_order_number || item.id),
          meta: asText(item.status, "overdue"),
          detail: `Due: ${asText(item.due_date || item.scheduled_date)} • Priority: ${asText(item.priority)}`,
        })),
      },
      {
        label: "Upcoming",
        count: formatCount(upcoming.length),
        detail: "Future scheduled jobs currently visible in the operations layer.",
        tone: "neutral" as const,
        items: upcoming.slice(0, 5).map((item) => ({
          title: asText(item.title || item.work_order_number || item.id),
          meta: asText(item.status, "scheduled"),
          detail: `Scheduled: ${asText(item.scheduled_date || item.due_date)} • Priority: ${asText(item.priority)}`,
        })),
      },
      {
        label: "Unscheduled",
        count: formatCount(unscheduled.length),
        detail: "Jobs without visible scheduling metadata.",
        tone: "warning" as const,
        items: unscheduled.slice(0, 5).map((item) => ({
          title: asText(item.title || item.work_order_number || item.id),
          meta: asText(item.status, "unscheduled"),
          detail: `Priority: ${asText(item.priority)} • Type: ${asText(item.type)}`,
        })),
      },
    ];
  }, [workOrders]);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Operations Center"
        title="Enterprise Service Calendar"
        subtitle="A calendar-oriented operational surface for today, overdue work, future work, and unscheduled execution demand."
        badges={[
          "Operations Calendar",
          "Today",
          "Overdue",
          "Upcoming",
          "Unscheduled",
        ]}
      />

      <ServiceCalendarBoard
        title="Service Calendar Board"
        subtitle="Use the calendar board to understand operational timing before drilling into execution detail."
        buckets={buckets}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Calendar Workflows"
          subtitle="Move from scheduling visibility into the appropriate operations workflow."
          workflows={[
            {
              title: "Today Execution Workflow",
              detail: "Review scheduled work and ensure assignment continuity.",
              href: "/operations/workbench",
              stages: ["Today", "Dispatch", "Execution", "Closure"],
            },
            {
              title: "Overdue Recovery Workflow",
              detail: "Review jobs that have crossed their expected service date.",
              href: "/operations/command",
              stages: ["Overdue", "Escalation", "Dispatch", "Completion"],
            },
            {
              title: "Unscheduled Triage Workflow",
              detail: "Review jobs that lack clear scheduling metadata.",
              href: "/operations/command",
              stages: ["Unscheduled", "Review", "Assign", "Schedule"],
            },
          ]}
        />

        <InsightStack
          title="Calendar Guidance"
          subtitle="How to use the service calendar effectively."
          items={[
            {
              title: "Use this page for timing",
              detail: "This is the best place to understand what needs attention today versus what is slipping.",
            },
            {
              title: "Use dispatch board for allocation",
              detail: "Move into dispatch when scheduling must become technician ownership.",
            },
            {
              title: "Use Work Order 360 for explanation",
              detail: "When one scheduled item becomes risky, drill into the related work-order entity page.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Operations Calendar Navigation"
        subtitle="Move from timing visibility into execution and support views."
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
            detail: "Execution command surface for broader queue and demand control.",
            href: "/operations/command",
            badge: "Command",
            connections: ["Work Orders", "Dispatch", "SLA"],
          },
          {
            title: "Work Order 360",
            detail: "Execution detail and service proof surface.",
            href: "/operations/work-orders/360",
            badge: "360",
            connections: ["Reports", "Requests", "Contract"],
          },
        ]}
      />
    </div>
  );
}
