// @ts-nocheck
"use client";

import { RecentEntitiesPanel } from "../../../../../components/workspace/RecentEntitiesPanel";
import { PinnedEntitiesPanel } from "../../../../../components/workspace/PinnedEntitiesPanel";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { WorkflowLauncherPanel } from "../../../../../components/workspace/WorkflowLauncherPanel";
import { EnterpriseGraphNavigator } from "../../../../../components/workspace/EnterpriseGraphNavigator";
import { InsightStack } from "../../../../../components/workspace/InsightStack";
import { ActionQueueList } from "../../../../../components/workspace/ActionQueueList";

export default function MyDayWorkspacePage() {
  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Workspace Hub"
        title="My Day Workspace"
        subtitle="A practical daily surface for resuming important objects, launching workflows, and moving quickly between enterprise workbenches."
        badges={[
          "My Day",
          "Recent Entities",
          "Pinned Objects",
          "Workflow Launcher",
        ]}
      />

      <ActionQueueList
        title="Daily Launch Actions"
        subtitle="Start your day from these role-oriented workbenches and orchestration surfaces."
        items={[
          { title: "Executive Workbench", value: "Open", detail: "Review strategic signals, risks, and portfolio visibility.", href: "/executive/workbench", tone: "success" },
          { title: "Commercial Workbench", value: "Open", detail: "Review lead, quote, and contract momentum.", href: "/commercial/workbench", tone: "warning" },
          { title: "Operations Workbench", value: "Open", detail: "Review execution queues, technicians, and demand pressure.", href: "/operations/workbench", tone: "warning" },
          { title: "Supply Chain Workbench", value: "Open", detail: "Review procurement queues, suppliers, and item readiness.", href: "/supply-chain/workbench", tone: "neutral" },
          { title: "Recommendations", value: "Open", detail: "Review cross-object recommendations and next actions.", href: "/recommendations", tone: "success" },
          { title: "Actions Center", value: "Open", detail: "Launch cross-object actions from one place.", href: "/actions/center", tone: "neutral" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentEntitiesPanel />
        <PinnedEntitiesPanel />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkflowLauncherPanel
          title="My Day Workflow Launchers"
          subtitle="Re-enter important enterprise workflows quickly."
          workflows={[
            {
              title: "Customer Review Flow",
              detail: "Move through customer, contract, and invoice continuity.",
              href: "/workflows/launcher",
              stages: ["Customer", "Contract", "Invoice"],
            },
            {
              title: "Execution Review Flow",
              detail: "Move through request, work order, technician, and report.",
              href: "/workflows/launcher",
              stages: ["Request", "Work Order", "Technician", "Report"],
            },
            {
              title: "Supplier Review Flow",
              detail: "Move through request, PO, receipt, and supplier support.",
              href: "/workflows/launcher",
              stages: ["Request", "PO", "Receipt", "Vendor"],
            },
          ]}
        />

        <InsightStack
          title="How to Use My Day"
          subtitle="This page should become your operational entry point every morning."
          items={[
            {
              title: "Resume recent work",
              detail: "Use Recent Entities to continue where you left off.",
            },
            {
              title: "Pin high-priority objects",
              detail: "Use Pinned Entities for customers, contracts, vendors, and work orders that need repeated attention.",
            },
            {
              title: "Launch by workflow",
              detail: "Use workflows instead of jumping between disconnected pages.",
            },
          ]}
        />
      </div>

      <EnterpriseGraphNavigator
        title="My Day Navigation Graph"
        subtitle="Jump directly into the core 360 and command workspaces."
        nodes={[
          {
            title: "Customer 360",
            detail: "Commercial, contract, and finance relationship view.",
            href: "/customers/360",
            badge: "360",
            connections: ["Leads", "Quotes", "Contracts", "Invoices"],
          },
          {
            title: "Contract 360",
            detail: "Commitment to execution and finance realization.",
            href: "/contracts/360",
            badge: "360",
            connections: ["Customer", "Work Orders", "Requests", "Invoices"],
          },
          {
            title: "Work Order 360",
            detail: "Execution, technician, and service proof detail.",
            href: "/operations/work-orders/360",
            badge: "360",
            connections: ["Requests", "Technicians", "Reports", "Contracts"],
          },
          {
            title: "Vendor 360",
            detail: "Supplier support across procurement and inventory.",
            href: "/supply-chain/vendors/360",
            badge: "360",
            connections: ["Requests", "Orders", "Receipts", "Items"],
          },
        ]}
      />
    </div>
  );
}
