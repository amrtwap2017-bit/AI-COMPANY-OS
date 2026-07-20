// @ts-nocheck
export const dynamic = "force-dynamic";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { NotificationRuleStudio } from "../../../../../components/workspace/NotificationRuleStudio";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";

export default function NotificationRulesPage() {
  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Administration Center"
        title="Notification Rules Studio"
        subtitle="Design how signals move across the enterprise, who owns them, and where they should appear."
        badges={[
          "Administration",
          "Rules Studio",
          "Attention Design",
          "Enterprise Routing",
        ]}
      />

      <NotificationRuleStudio
        title="Enterprise Rule Matrix"
        subtitle="This matrix defines how the enterprise workspace should route attention across centers and roles."
        rows={[
          {
            event: "Quote waiting approval",
            owner: "Commercial Manager",
            destination: "Commercial Workbench + Inbox",
            severity: "High",
            detail: "Surface all quotes in review or approval state to commercial ownership and leadership visibility when aging rises.",
            status: "Active",
          },
          {
            event: "Contract without billing continuity",
            owner: "Executive / Finance",
            destination: "Executive Intelligence + Inbox",
            severity: "Critical",
            detail: "Escalate contracts with visible operational activity but weak invoice continuity.",
            status: "Review",
          },
          {
            event: "Work order without closure report",
            owner: "Operations Manager",
            destination: "Operations Workbench + Inbox",
            severity: "High",
            detail: "Route completed work without service proof into the operations attention flow.",
            status: "Active",
          },
          {
            event: "Supplier delivery continuity risk",
            owner: "Supply Chain Manager",
            destination: "Supply Chain Workbench + Inbox",
            severity: "Medium",
            detail: "Raise attention when ordering and receipt continuity appears weak around visible suppliers.",
            status: "Draft",
          },
          {
            event: "Customer growth opportunity",
            owner: "Commercial + Customer Success",
            destination: "Recommendations + Customer 360",
            severity: "Medium",
            detail: "Route accounts with contract value but weak recommendation or growth continuity into guided follow-up.",
            status: "Review",
          },
          {
            event: "Portfolio score deterioration",
            owner: "Executive",
            destination: "Executive Intelligence + Alerts Center",
            severity: "Critical",
            detail: "Escalate when enterprise scorecards and watchlists suggest broad operational or commercial decline.",
            status: "Active",
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Rules Design Workflows"
          subtitle="Use workflow thinking to design signal routing across the enterprise."
          workflows={[
            {
              title: "Commercial Signal Routing",
              detail: "Move approval and conversion pressure into the right ownership lane.",
              href: "/workflows/launcher",
              stages: ["Lead", "Quote", "Approval", "Inbox"],
            },
            {
              title: "Execution Signal Routing",
              detail: "Move SLA and closure pressure into operations ownership.",
              href: "/workflows/launcher",
              stages: ["Request", "Work Order", "Report", "Inbox"],
            },
            {
              title: "Supply Signal Routing",
              detail: "Move supplier and item continuity pressure into supply ownership.",
              href: "/workflows/launcher",
              stages: ["Request", "PO", "Receipt", "Inbox"],
            },
          ]}
        />

        <InsightStack
          title="Rules Studio Guidance"
          subtitle="How to think about notifications in an enterprise operating system."
          items={[
            {
              title: "Route by ownership",
              detail: "Every important event should land with the role best positioned to act.",
            },
            {
              title: "Escalate by business impact",
              detail: "Severity should reflect operational, commercial, or financial consequence.",
            },
            {
              title: "Design for measurable follow-through",
              detail: "Signals should move into inboxes, workbenches, and 360 views where action can be tracked.",
            },
          ]}
        />
      </div>
    </div>
  );
}
