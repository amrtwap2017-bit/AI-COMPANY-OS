"use client";

import { useEffect, useState } from "react";
import { executiveIntelligenceApi } from "../../../../lib/executive-intelligence-api";
import { RoleWorkbenchHero } from "../../../../components/workspace/RoleWorkbenchHero";
import { AlertCenterPanel } from "../../../../components/workspace/AlertCenterPanel";
import { EscalationLane } from "../../../../components/workspace/EscalationLane";
import { InsightStack } from "../../../../components/workspace/InsightStack";
import { WorkflowLauncherPanel } from "../../../../components/workspace/WorkflowLauncherPanel";

export default function AlertsCenterPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const res = await executiveIntelligenceApi.watchlists();
      if (!active) return;
      setWatchlists((res as any)?.watchlists || (Array.isArray(res) ? res : []));
    })();

    return () => {
      active = false;
    };
  }, []);

  const alerts: {title:string;severity:"critical"|"high"|"medium"|"low";domain:string;detail:string;action:string}[] = watchlists.map((item: any, index: number) => ({
    title: item.title || `Alert ${index + 1}`,
    severity: (item.severity === "warning" ? "high" : item.severity === "success" ? "low" : "medium") as "critical"|"high"|"medium"|"low",
    domain:
      (item.title || "").includes("Commercial") ? "Commercial" :
      (item.title || "").includes("Execution") ? "Operations" :
      (item.title || "").includes("Supply") ? "Supply Chain" :
      (item.title || "").includes("Finance") ? "Finance" :
      "Enterprise",
    detail: item.detail || "No detail available",
    action: item.recommended_action || "Review related workspace",
  }));

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Enterprise Alerts"
        title="Alert Center"
        subtitle="A unified attention surface for cross-center issues, escalation signals, and next-action guidance."
        badges={[
          "Alerts",
          "Escalations",
          "Enterprise Attention",
          "Next Actions",
        ]}
      />

      <AlertCenterPanel
        title="Current Enterprise Alerts"
        subtitle="These alerts are derived from the current executive watchlist logic."
        alerts={alerts}
      />

      <EscalationLane
        title="Escalation Lanes"
        subtitle="Organize enterprise attention by ownership lane."
        items={[
          {
            lane: "Leadership Review",
            owner: "Executive",
            count: String(alerts.filter((a) => a.severity === "critical" || a.severity === "high").length),
            detail: "High-impact issues requiring leadership attention.",
          },
          {
            lane: "Commercial Follow-up",
            owner: "Commercial",
            count: String(alerts.filter((a) => a.domain === "Commercial").length),
            detail: "Issues affecting conversion, quote flow, or contract readiness.",
          },
          {
            lane: "Execution Recovery",
            owner: "Operations",
            count: String(alerts.filter((a) => a.domain === "Operations").length),
            detail: "Issues affecting work execution, technicians, or SLA continuity.",
          },
          {
            lane: "Supply Support",
            owner: "Supply Chain",
            count: String(alerts.filter((a) => a.domain === "Supply Chain").length),
            detail: "Issues affecting vendor continuity, purchasing, or item readiness.",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Escalation Workflows"
          subtitle="Use workflows to move from an alert into coordinated action."
          workflows={[
            {
              title: "Commercial Escalation Workflow",
              detail: "Review issues affecting pipeline, quotations, and contract conversion.",
              href: "/workflows/launcher",
              stages: ["Commercial", "Quote", "Contract", "Executive Review"],
            },
            {
              title: "Execution Escalation Workflow",
              detail: "Review issues affecting work orders, technicians, and service delivery.",
              href: "/workflows/launcher",
              stages: ["Request", "Work Order", "Technician", "Escalation"],
            },
            {
              title: "Supply Escalation Workflow",
              detail: "Review issues affecting vendor continuity, purchasing, and stock support.",
              href: "/workflows/launcher",
              stages: ["Request", "PO", "Vendor", "Escalation"],
            },
          ]}
        />

        <InsightStack
          title="Alert Usage Guidance"
          subtitle="How to use alerts and escalation lanes effectively."
          items={[
            {
              title: "Start with severity",
              detail: "Use severity to determine what deserves immediate review.",
            },
            {
              title: "Then follow ownership",
              detail: "Use escalation lanes to send work to the correct business center.",
            },
            {
              title: "Then move into detail",
              detail: "Use 360 pages and command workspaces to explain the alert before acting.",
            },
          ]}
        />
      </div>
    </div>
  );
}
