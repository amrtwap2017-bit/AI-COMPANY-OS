"use client"; // @ts-nocheck

import { useState } from "react";
import Link from "next/link";

import {
  PageWrapper,
  PageHeader,
  SectionCard,
  EmptyState,
  Button,
} from "@/components/ui";

const WorkflowTemplates = [
  {
    name: "New Work Order → Auto Dispatch",
    trigger: "WO created",
    action: "dispatch recommendation",
    status: "Active",
  },
  {
    name: "Low Stock → Auto PR",
    trigger: "stock below min",
    action: "create purchase request",
    status: "Configure",
  },
  {
    name: "Critical Signal → Alert Manager",
    trigger: "critical signal",
    action: "notify operations",
    status: "Active",
  },
  {
    name: "Contract Expiring → Renewal Pipeline",
    trigger: "30 days before end",
    action: "flag for renewal",
    status: "Configure",
  },
];

const WorkflowDesignerPage = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  return (
    <PageWrapper>
      <PageHeader title="Workflow Designer (Beta)" />
      <div className="mt-4">
        {WorkflowTemplates.map((template) => (
          <SectionCard key={template.name} className="mb-4">
            <h3>{template.name}</h3>
            <p>Trigger: {template.trigger}</p>
            <p>Action: {template.action}</p>
            <Button
              onClick={() => setActiveTemplate(template.status === "Active" ? null : template.name)}
              variant={activeTemplate === template.name ? "primary" : "secondary"}
            >
              {template.status === "Active" ? "Deactivate" : "Configure"}
            </Button>
          </SectionCard>
        ))}
      </div>
      <p className="mt-8 text-center">
        Workflows are automatically executed by the Triangle Black AI Engine
      </p>
      <Link href="/operations/workflows" passHref>
        <Button variant="outline">Back to List View</Button>
      </Link>
    </PageWrapper>
  );
};

export default WorkflowDesignerPage;