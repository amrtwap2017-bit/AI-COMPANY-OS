"use client";

import { useEffect, useMemo, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { asText, formatCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { DispatchWorkspacePanel } from "../../../../../components/workspace/DispatchWorkspacePanel";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";

export default function OperationsDispatchPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [woRes, techRes, reqRes] = await Promise.all([
        enterpriseApi.operations.workOrders(),
        enterpriseApi.operations.technicians(),
        enterpriseApi.operations.serviceRequests(),
      ]);

      if (!active) return;
      setWorkOrders(toList(woRes.data));
      setTechnicians(toList(techRes.data));
      setRequests(toList(reqRes.data));
    })();

    return () => {
      active = false;
    };
  }, []);

  const lanes = useMemo(() => {
    const unassigned = workOrders.filter((item) => !item?.assigned_technician_id);
    const assigned = workOrders.filter((item) => !!item?.assigned_technician_id);
    const urgentRequests = requests.filter((item) =>
      ["high", "urgent", "emergency"].includes(String(item?.priority || "").toLowerCase())
    );

    const technicianUsage = technicians.slice(0, 6).map((tech) => {
      const count = workOrders.filter((wo) => String(wo?.assigned_technician_id || "") === String(tech?.id || "")).length;
      return {
        title: asText(tech?.name || tech?.email || tech?.id),
        meta: asText(tech?.specialization || "technician"),
        detail: `Assigned jobs: ${count} • Region: ${asText(tech?.region)}`,
        badges: [
          count > 3 ? "loaded" : "available",
          asText(tech?.is_active),
        ],
      };
    });

    return [
      {
        title: "Unassigned Queue",
        subtitle: "Jobs needing technician ownership",
        tone: "warning" as const,
        records: unassigned.slice(0, 8).map((item) => ({
          title: asText(item?.title || item?.work_order_number || item?.id),
          meta: asText(item?.status || "work order"),
          detail: `Priority: ${asText(item?.priority)} • Type: ${asText(item?.type)}`,
          badges: ["unassigned"],
        })),
      },
      {
        title: "Technician Capacity",
        subtitle: "Visible workforce allocation",
        tone: "success" as const,
        records: technicianUsage,
      },
      {
        title: "Urgent Demand",
        subtitle: "Requests likely to pressure dispatch",
        tone: "warning" as const,
        records: urgentRequests.slice(0, 8).map((item) => ({
          title: asText(item?.title || item?.id),
          meta: asText(item?.status || "request"),
          detail: `Priority: ${asText(item?.priority)} • Category: ${asText(item?.category)}`,
          badges: ["urgent"],
        })),
      },
    ];
  }, [workOrders, technicians, requests]);

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Operations Center"
        title="Dispatch Board Workspace"
        subtitle="A daily orchestration surface for assignment, technician capacity, and urgent service demand."
        badges={[
          "Dispatch Board",
          "Assignment",
          "Technician Capacity",
          "Urgent Demand",
        ]}
      />

      <DispatchWorkspacePanel
        title="Dispatch Board"
        subtitle="Use this board to understand what needs assigning, who has visible capacity, and what urgent demand may need escalation."
        lanes={lanes}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Dispatch Workflows"
          subtitle="Move from dispatch pressure into the right execution workflow."
          workflows={[
            {
              title: "Assignment Workflow",
              detail: "Move from unassigned jobs into workforce ownership.",
              href: "/operations/workbench",
              stages: ["Queue", "Assign", "Dispatch", "Track"],
            },
            {
              title: "Urgent Demand Workflow",
              detail: "Move urgent service requests into active operational attention.",
              href: "/operations/command",
              stages: ["Request", "Prioritize", "Assign", "Escalate"],
            },
            {
              title: "Execution Proof Workflow",
              detail: "Move active field work into closure and service reporting.",
              href: "/operations/work-orders/360",
              stages: ["Dispatch", "Execute", "Report", "Close"],
            },
          ]}
        />

        <InsightStack
          title="Dispatch Guidance"
          subtitle="How to use the dispatch board effectively."
          items={[
            {
              title: "Assign first",
              detail: "Unassigned jobs should be resolved before optimization of already assigned work.",
            },
            {
              title: "Watch urgent requests",
              detail: "Urgent demand should be visible as a separate dispatch attention lane.",
            },
            {
              title: "Drill into work-order detail when needed",
              detail: "Use Work Order 360 when a dispatch issue needs deeper explanation.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="Dispatch Navigation"
        subtitle="Move from dispatch into the correct execution or support workspace."
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
            title: "Operations Calendar",
            detail: "Timing and schedule-oriented execution view.",
            href: "/operations/calendar",
            badge: "Calendar",
            connections: ["Today", "Overdue", "Upcoming"],
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
