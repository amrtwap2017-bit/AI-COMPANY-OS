// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { formatCount, formatCurrency, toCount, toList, toNumber } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { WorkbenchSummaryGrid } from "../../../../../components/workspace/WorkbenchSummaryGrid";
import { ActionQueueList } from "../../../../../components/workspace/ActionQueueList";
import { InsightStack } from "../../../../../components/workspace/InsightStack";

export default function ExecutiveWorkbenchPage() {
  const [summary, setSummary] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [summaryRes, pipelineRes, contractsRes] = await Promise.all([
        enterpriseApi.executive.summary(),
        enterpriseApi.executive.pipeline(),
        enterpriseApi.executive.contracts(),
      ]);
      if (!active) return;
      setSummary(summaryRes.data || null);
      setPipeline(pipelineRes.data || null);
      setContracts(toList(contractsRes.data));
    })();
    return () => {
      active = false;
    };
  }, []);

  const revenue = toNumber(
    summary?.total_revenue,
    summary?.revenue,
    pipeline?.revenue,
    pipeline?.total_value
  );

  return (
    <div className="space-y-6">
      <RoleWorkbenchHero
        eyebrow="Executive Center"
        title="Executive Workbench"
        subtitle="A focused daily leadership workbench for strategic review, decision queues, and portfolio visibility."
        badges={["Executive", "Portfolio", "Decisions", "Morning Review"]}
      />

      <WorkbenchSummaryGrid
        title="Executive Summary"
        subtitle="Start the day with the leadership signals that matter most."
        items={[
          { label: "Revenue Signal", value: formatCurrency(revenue), detail: "Current visible revenue or pipeline value" },
          { label: "Contracts", value: formatCount(toCount(contracts)), detail: "Visible contract count in executive scope" },
          { label: "Pipeline", value: pipeline ? "Live" : "Check", detail: "Pipeline feed readiness" },
          { label: "Summary", value: summary ? "Live" : "Check", detail: "Executive dashboard readiness" },
        ]}
      />

      <ActionQueueList
        title="Executive Decision Queues"
        subtitle="Review these areas first before drilling deeper into detail workspaces."
        items={[
          { title: "Open Executive Command", value: "Now", detail: "Review strategic queues, risks, and cross-center visibility.", href: "/executive/command", tone: "success" },
          { title: "Review Contracts", value: formatCount(toCount(contracts)), detail: "Use Contract 360 for key commitments requiring review.", href: "/contracts/360", tone: "warning" },
          { title: "Open Recommendations", value: "Now", detail: "Use recommendations to identify next enterprise actions.", href: "/recommendations", tone: "neutral" },
          { title: "Open Backend Alignment", value: "Now", detail: "Review target backend contract needed for deeper intelligence.", href: "/integration/backend", tone: "neutral" },
        ]}
      />

      <InsightStack
        title="Executive Workbench Guidance"
        subtitle="Use the workbench as the leadership control surface, not the final drill-down destination."
        items={[
          { title: "Think in signals", detail: "Use this page for first-pass review before entering detailed 360 pages." },
          { title: "Think in commitments", detail: "Contracts are the strongest bridge between commercial value and execution." },
          { title: "Think in next action", detail: "Move from command and recommendations into the exact entity that needs attention." },
        ]}
      />
    </div>
  );
}
