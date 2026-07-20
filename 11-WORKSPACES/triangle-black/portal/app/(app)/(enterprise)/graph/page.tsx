// @ts-nocheck
export const dynamic = "force-dynamic";

import { RoleWorkspaceBanner } from "../../../../components/workspace/RoleWorkspaceBanner";
import { EnterpriseGraphNavigator } from "../../../../components/workspace/EnterpriseGraphNavigator";
import { LinkedScenarioPanel } from "../../../../components/workspace/LinkedScenarioPanel";
import { KnowledgePanel } from "../../../../components/workspace/KnowledgePanel";

export default function EnterpriseGraphPage() {
  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Enterprise Navigator"
        title="Enterprise graph navigation is active"
        description="Use this workspace to move across the connected business objects of Triangle Black: customers, contracts, work orders, vendors, procurement, and leadership surfaces."
        actions={[
          "Open 360 views",
          "Move across command workspaces",
          "Inspect relationship paths",
          "Navigate by business object",
        ]}
      />

      <EnterpriseGraphNavigator
        title="Core Enterprise Graph"
        subtitle="These nodes represent the current connected operating model."
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
          {
            title: "Executive Command",
            detail: "Leadership command surface.",
            href: "/executive/command",
            badge: "Command",
            connections: ["Portfolio", "Risk", "Revenue", "Decisions"],
          },
          {
            title: "Commercial Command",
            detail: "Lead, quote, and contract command surface.",
            href: "/commercial/command",
            badge: "Command",
            connections: ["Leads", "Quotes", "Contracts", "Customers"],
          },
          {
            title: "Operations Command",
            detail: "Execution and service demand command surface.",
            href: "/operations/command",
            badge: "Command",
            connections: ["Work Orders", "Technicians", "Requests", "SLA"],
          },
          {
            title: "Supply Chain Command",
            detail: "Procurement and inventory command surface.",
            href: "/supply-chain/command",
            badge: "Command",
            connections: ["Items", "Vendors", "Requests", "Orders"],
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <LinkedScenarioPanel
          title="Enterprise Navigation Scenarios"
          subtitle="Use these relationship chains to understand how users should move through the platform."
          scenarios={[
            {
              title: "Customer Value Chain",
              detail: "A customer should be navigable from demand to revenue realization.",
              chain: ["Lead", "Quote", "Contract", "Work Order", "Invoice"],
            },
            {
              title: "Execution Support Chain",
              detail: "A work order should connect naturally into the supply and vendor layers.",
              chain: ["Work Order", "Item Need", "Purchase Request", "Vendor", "Receipt"],
            },
            {
              title: "Leadership Review Chain",
              detail: "Executive users should move from risk or revenue into the exact business object driving it.",
              chain: ["Executive Command", "Contract 360", "Work Order 360", "Vendor 360"],
            },
          ]}
        />

        <KnowledgePanel
          title="Graph Navigation Guidance"
          subtitle="This panel explains how enterprise graph thinking should work."
          sections={[
            {
              title: "Navigation Principles",
              items: [
                { label: "Move by object", detail: "Start from the business object that matters most right now." },
                { label: "Preserve context", detail: "Use context drawers and 360 pages to avoid losing relationship information." },
              ],
            },
            {
              title: "Command vs 360",
              items: [
                { label: "Use command pages", detail: "Use command workspaces to control queues and priorities." },
                { label: "Use 360 pages", detail: "Use 360 pages to understand one object in full enterprise context." },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
