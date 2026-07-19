
import { entityBackendMatrix } from "../../../../../lib/entity-backend-matrix";
import { BackendAlignmentPanel } from "../../../../../components/workspace/BackendAlignmentPanel";
import { RoleWorkspaceBanner } from "../../../../../components/workspace/RoleWorkspaceBanner";
import { InsightStack } from "../../../../../components/workspace/InsightStack";

export default function BackendIntegrationWorkspacePage() {
  const mockDisconnected = (labels: string[]) =>
    labels.map((label) => ({
      label,
      ok: false,
      detail: "This workspace documents the target backend contract for future implementation.",
    }));

  return (
    <div className="space-y-6">
      <RoleWorkspaceBanner
        role="Backend Alignment Workspace"
        title="Backend alignment workspace is active"
        description="Use this page to review the target entity detail contract the portal is now designed to consume."
        actions={[
          "Review entity detail targets",
          "Align backend APIs",
          "Reduce frontend inference logic",
          "Prepare true enterprise linking",
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <InsightStack
          title="Why this workspace exists"
          subtitle="The portal currently infers entity detail from aggregate feeds. This workspace defines the next backend-aligned step."
          items={[
            {
              title: "Current model",
              detail: "The portal safely derives 360 views from broad list feeds and relationship filtering.",
            },
            {
              title: "Target model",
              detail: "The backend should expose true detail endpoints for each enterprise object and its related records.",
            },
            {
              title: "Result",
              detail: "Cleaner data loading, stronger drill-downs, and fewer frontend assumptions.",
            },
          ]}
        />

        <InsightStack
          title="Implementation guidance"
          subtitle="How to use these contracts in the next backend phase."
          items={[
            {
              title: "Start with primary detail endpoints",
              detail: "Implement direct detail routes for customer, contract, work order, and vendor first.",
            },
            {
              title: "Then add related collections",
              detail: "Add sub-routes for invoices, work orders, receipts, and reports.",
            },
            {
              title: "Then enrich scoring",
              detail: "Once detail routes exist, add health, scorecard, and recommendation endpoints.",
            },
          ]}
        />
      </div>

      <BackendAlignmentPanel
        title={entityBackendMatrix.customer.title}
        subtitle={entityBackendMatrix.customer.subtitle}
        currentFeeds={mockDisconnected(entityBackendMatrix.customer.currentFeeds)}
        targetEndpoints={entityBackendMatrix.customer.targetEndpoints}
        relatedObjects={entityBackendMatrix.customer.relatedObjects}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.contract.title}
        subtitle={entityBackendMatrix.contract.subtitle}
        currentFeeds={mockDisconnected(entityBackendMatrix.contract.currentFeeds)}
        targetEndpoints={entityBackendMatrix.contract.targetEndpoints}
        relatedObjects={entityBackendMatrix.contract.relatedObjects}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix["work-order"].title}
        subtitle={entityBackendMatrix["work-order"].subtitle}
        currentFeeds={mockDisconnected(entityBackendMatrix["work-order"].currentFeeds)}
        targetEndpoints={entityBackendMatrix["work-order"].targetEndpoints}
        relatedObjects={entityBackendMatrix["work-order"].relatedObjects}
      />

      <BackendAlignmentPanel
        title={entityBackendMatrix.vendor.title}
        subtitle={entityBackendMatrix.vendor.subtitle}
        currentFeeds={mockDisconnected(entityBackendMatrix.vendor.currentFeeds)}
        targetEndpoints={entityBackendMatrix.vendor.targetEndpoints}
        relatedObjects={entityBackendMatrix.vendor.relatedObjects}
      />
    </div>
  );
}
