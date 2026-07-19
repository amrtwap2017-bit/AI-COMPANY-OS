export const dynamic = "force-dynamic";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { InboxPresetCards } from "../../../../../components/workspace/InboxPresetCards";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";

export default function InboxPresetsPage() {
  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Inbox"
        title="Role Inbox Presets"
        subtitle="Design default inbox views for each business capability so every role sees the right attention model on day one."
        badges={[
          "Inbox Presets",
          "Role Design",
          "Attention Workflows",
          "Enterprise Identity",
        ]}
      />

      <InboxPresetCards
        title="Enterprise Role Presets"
        subtitle="Each preset defines the logic of attention for a specific business role."
        presets={[
          {
            title: "Executive Preset",
            audience: "Executive",
            detail: "High-severity alerts, portfolio watchlists, finance continuity, and cross-center escalations.",
            defaultView: "Critical and cross-center signals only",
            filters: ["critical", "portfolio", "finance", "executive"],
          },
          {
            title: "Commercial Preset",
            audience: "Commercial",
            detail: "Lead follow-up, quote approval, contract conversion, and customer growth opportunities.",
            defaultView: "Quotes and conversion pressure first",
            filters: ["leads", "quotes", "contracts", "growth"],
          },
          {
            title: "Operations Preset",
            audience: "Operations",
            detail: "Open demand, SLA pressure, closure gaps, and execution follow-through.",
            defaultView: "Unread + in-progress execution issues",
            filters: ["work-orders", "requests", "sla", "closure"],
          },
          {
            title: "Supply Chain Preset",
            audience: "Supply Chain",
            detail: "Supplier continuity, item readiness, ordering pressure, and receipt exceptions.",
            defaultView: "Procurement and supplier continuity first",
            filters: ["vendors", "items", "po", "receipts"],
          },
          {
            title: "Customer Success Preset",
            audience: "Customer Success",
            detail: "Relationship health, billing continuity, recommendation gaps, and escalation follow-up.",
            defaultView: "Customer risk and continuity first",
            filters: ["customer", "contract", "invoice", "health"],
          },
          {
            title: "Vendor Preset",
            audience: "Vendor Management",
            detail: "Qualification, scorecards, delivery quality, and contract support continuity.",
            defaultView: "Supplier reliability and support quality",
            filters: ["vendor", "scorecard", "delivery", "quality"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Preset Design Workflows"
          subtitle="Use workflow logic to design how each role sees attention."
          workflows={[
            {
              title: "Leadership Preset Workflow",
              detail: "Define how strategic alerts move into executive attention.",
              href: "/workflows/launcher",
              stages: ["Alert", "Severity", "Ownership", "Review"],
            },
            {
              title: "Execution Preset Workflow",
              detail: "Define how operational issues move into daily execution review.",
              href: "/workflows/launcher",
              stages: ["Request", "Work Order", "Inbox", "Follow-up"],
            },
            {
              title: "Supply Preset Workflow",
              detail: "Define how supplier and stock issues move into the right operational owner.",
              href: "/workflows/launcher",
              stages: ["Need", "PO", "Receipt", "Inbox"],
            },
          ]}
        />

        <InsightStack
          title="Preset Guidance"
          subtitle="How to design role inboxes in a true enterprise workspace."
          items={[
            {
              title: "Role before module",
              detail: "The inbox should reflect the person’s responsibility, not just the software module.",
            },
            {
              title: "Prioritize by consequence",
              detail: "Default views should prioritize the highest business impact first.",
            },
            {
              title: "Align with workbenches",
              detail: "Inbox presets should naturally send users into the right workbench or 360 view next.",
            },
          ]}
        />
      </div>
    </div>
  );
}
