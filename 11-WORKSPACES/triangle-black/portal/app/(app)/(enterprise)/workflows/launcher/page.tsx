export const dynamic = "force-dynamic";

import { RoleWorkspaceBanner } from "../../../../../components/workspace/RoleWorkspaceBanner";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { LinkedScenarioPanel } from "../../../../../components/workspace/LinkedScenarioPanel";
import { KnowledgePanel } from "../../../../../components/workspace/KnowledgePanel";

export default function WorkflowLauncherPage() {
  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Enterprise Workflow Launcher"
        title="Enterprise workflow launcher is active"
        description="Use this workspace to understand and launch cross-capability business flows across commercial, operations, supply chain, and executive oversight."
        actions={[
          "Launch commercial workflow",
          "Launch execution workflow",
          "Launch procurement workflow",
          "Launch executive review workflow",
        ]}
      />

      <WorkflowLauncherPanel
        title="Workflow Catalog"
        subtitle="Each workflow represents a real enterprise capability chain."
        workflows={[
          {
            title: "Lead to Quote Workflow",
            detail: "Commercial demand becomes a qualified opportunity and commercial proposal.",
            href: "/commercial/command",
            stages: ["Lead", "Qualification", "Visit", "Quote"],
          },
          {
            title: "Quote to Contract Workflow",
            detail: "Commercial offer becomes formal commitment and operational obligation.",
            href: "/contracts/360",
            stages: ["Quote", "Approval", "Contract", "Activation"],
          },
          {
            title: "Contract to Service Workflow",
            detail: "Commercial commitment becomes service execution and field follow-through.",
            href: "/operations/command",
            stages: ["Contract", "Request", "Work Order", "Report"],
          },
          {
            title: "Service to Supply Workflow",
            detail: "Execution pressure becomes item need, procurement activity, and supplier delivery.",
            href: "/supply-chain/command",
            stages: ["Work Order", "Item Need", "Purchase Request", "Receipt"],
          },
          {
            title: "Contract to Invoice Workflow",
            detail: "Operational and commercial continuity becomes billing and financial realization.",
            href: "/customers/360",
            stages: ["Contract", "Execution", "Invoice", "Customer Health"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <LinkedScenarioPanel
          title="Workflow Scenarios"
          subtitle="Use these scenario chains to understand enterprise transitions."
          scenarios={[
            {
              title: "Commercial Success Chain",
              detail: "Demand becomes commercial commitment and then delivery responsibility.",
              chain: ["Lead", "Quote", "Contract", "Execution"],
            },
            {
              title: "Execution Support Chain",
              detail: "Field work should be supported by supply and documented by reporting.",
              chain: ["Work Order", "Supplier", "Receipt", "Service Report"],
            },
            {
              title: "Customer Value Chain",
              detail: "Customer value should connect commercial effort, delivery, and billing outcome.",
              chain: ["Customer", "Contract", "Service", "Invoice"],
            },
          ]}
        />

        <KnowledgePanel
          title="Workflow Knowledge"
          subtitle="Future SOP, templates, and operating standards should be connected here."
          sections={[
            {
              title: "Commercial Workflows",
              items: [
                { label: "Qualification Rules", detail: "How demand should be assessed before quoting." },
                { label: "Approval Model", detail: "How quotes and contracts should move through governance." },
              ],
            },
            {
              title: "Operational Workflows",
              items: [
                { label: "Dispatch Standards", detail: "How execution readiness and ownership should be managed." },
                { label: "Closure Standards", detail: "How work should become proof and organizational knowledge." },
              ],
            },
            {
              title: "Supply Workflows",
              items: [
                { label: "Request-to-PO Rules", detail: "How demand should become procurement activity." },
                { label: "Receipt-to-Stock Rules", detail: "How supplier delivery should become usable support." },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
