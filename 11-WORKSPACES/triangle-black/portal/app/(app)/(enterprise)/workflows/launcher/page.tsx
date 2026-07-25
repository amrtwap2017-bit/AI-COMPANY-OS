// @ts-nocheck
"use client";

import { PageWrapper, PageHeader, SectionCard, EmptyState, Button } from "@/components/ui";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WorkflowLauncherPage = () => {
  const router = useRouter();
  const [hoveredWorkflow, setHoveredWorkflow] = useState<string | null>(null);

  const workflows = [
    {
      category: "OPERATIONS WORKFLOWS",
      items: [
        { name: "New Work Order", description: "Create a new work order.", path: "/operations/work-orders/new" },
        { name: "Dispatch Technician", description: "Dispatch a technician to the site.", path: "/operations/dispatch" },
        { name: "Create Service Request", description: "Report an asset fault.", path: "/operations/service-requests" }
      ]
    },
    {
      category: "PROCUREMENT WORKFLOWS",
      items: [
        { name: "Create Purchase Request", description: "Request materials for procurement.", path: "/supply-chain/purchase-requests" },
        { name: "Send RFQ", description: "Send a request for quotation.", path: "/supply-chain/rfqs" },
        { name: "Receive Goods", description: "Record the receipt of goods.", path: "/supply-chain/goods-receipts" }
      ]
    },
    {
      category: "MAINTENANCE WORKFLOWS",
      items: [
        { name: "Schedule PM", description: "Plan preventive maintenance tasks.", path: "/maintenance/pm-plans" },
        { name: "Report Asset Fault", description: "Report an asset fault.", path: "/operations/work-orders/new" },
        { name: "View Schedule", description: "View the maintenance schedule.", path: "/maintenance/schedule" }
      ]
    }
  ];

  const handleLaunch = (path: string) => {
    router.push(path);
  };

  return (
    <PageWrapper>
      <PageHeader title="Workflow Launcher" description="Start a workflow from anywhere in the platform" />
      {(workflows || []).map((category, index) => (
        <SectionCard key={index} title={category.category}>
          {(Array.isArray(category.items) ? category.items : []).map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-4 hover:bg-gray-100 rounded-md ${
                hoveredWorkflow === item.name ? "bg-gray-200" : ""
              }`}
              onMouseEnter={() => setHoveredWorkflow(item.name)}
              onMouseLeave={() => setHoveredWorkflow(null)}
            >
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <Button onClick={() => handleLaunch(item.path)}>Launch</Button>
            </div>
          ))}
        </SectionCard>
      ))}
    </PageWrapper>
  );
};

export default WorkflowLauncherPage;