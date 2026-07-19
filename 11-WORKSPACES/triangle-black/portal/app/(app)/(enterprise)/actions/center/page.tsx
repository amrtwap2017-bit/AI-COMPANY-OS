
import { RoleWorkspaceBanner } from "../../../../../components/workspace/RoleWorkspaceBanner";
import { CrossObjectActionCenter } from "../../../../../components/workspace/CrossObjectActionCenter";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { InsightStack } from "../../../../../components/workspace/InsightStack";

export default function ActionsCenterPage() {
  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Enterprise Operator"
        title="Cross-object action center is active"
        description="Use this workspace to launch actions that move across customers, contracts, operations, vendors, procurement, and executive review."
        actions={[
          "Open customer workflows",
          "Open contract workflows",
          "Open execution workflows",
          "Open supply workflows",
        ]}
      />

      <CrossObjectActionCenter
        title="Enterprise Action Grid"
        subtitle="These actions are designed to move the business across centers instead of trapping users inside isolated modules."
        actions={[
          { title: "Open Customer 360", detail: "Inspect the full commercial and finance relationship of a customer.", href: "/customers/360", group: "Customer", tone: "success" },
          { title: "Open Contract 360", detail: "Inspect delivery and finance continuity for a contract.", href: "/contracts/360", group: "Contract", tone: "neutral" },
          { title: "Open Work Order 360", detail: "Inspect execution readiness and closure quality.", href: "/operations/work-orders/360", group: "Operations", tone: "warning" },
          { title: "Open Vendor 360", detail: "Inspect supplier support, procurement, and inventory linkage.", href: "/supply-chain/vendors/360", group: "Supply", tone: "neutral" },
          { title: "Open Commercial Command", detail: "Return to pipeline and quotation control.", href: "/commercial/command", group: "Commercial", tone: "success" },
          { title: "Open Operations Command", detail: "Return to dispatch, execution, and service demand control.", href: "/operations/command", group: "Operations", tone: "warning" },
          { title: "Open Supply Chain Command", detail: "Return to procurement, vendors, and stock-facing control.", href: "/supply-chain/command", group: "Supply", tone: "neutral" },
          { title: "Open Executive Command", detail: "Return to enterprise decision surfaces and portfolio oversight.", href: "/executive/command", group: "Executive", tone: "success" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="Workflow Launchers"
          subtitle="Launch cross-center workflows from one orchestration surface."
          workflows={[
            {
              title: "Lead to Contract Workflow",
              detail: "Follow the journey from qualified demand to contractual commitment.",
              href: "/workflows/launcher",
              stages: ["Lead", "Quote", "Approval", "Contract"],
            },
            {
              title: "Contract to Execution Workflow",
              detail: "Follow the transition from commercial commitment to service delivery.",
              href: "/workflows/launcher",
              stages: ["Contract", "Work Order", "Technician", "Report"],
            },
            {
              title: "Execution to Supply Workflow",
              detail: "Follow how a work order becomes a procurement or stock need.",
              href: "/workflows/launcher",
              stages: ["Work Order", "Item Need", "Request", "Receipt"],
            },
          ]}
        />

        <InsightStack
          title="Action Center Guidance"
          subtitle="How to use this orchestration layer effectively."
          items={[
            {
              title: "Think in workflows",
              detail: "Use this center when work crosses more than one business capability.",
            },
            {
              title: "Think in relationships",
              detail: "Move from customer to contract to execution to supplier without losing context.",
            },
            {
              title: "Think in command surfaces",
              detail: "Use command workspaces for control and 360 pages for understanding.",
            },
          ]}
        />
      </div>
    </div>
  );
}
