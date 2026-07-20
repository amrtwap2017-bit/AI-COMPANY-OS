// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { enterpriseApi } from "../../../../../lib/enterprise-api";
import { formatCount, toCount, toList } from "../../../../../lib/enterprise-format";
import { RoleWorkbenchHero } from "../../../../../components/workspace/RoleWorkbenchHero";
import { WorkbenchSummaryGrid } from "../../../../../components/workspace/WorkbenchSummaryGrid";
import { ActionQueueList } from "../../../../../components/workspace/ActionQueueList";
import { InsightStack } from "../../../../../components/workspace/InsightStack";

export default function CommercialWorkbenchPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [leadsRes, quotesRes, contractsRes] = await Promise.all([
        enterpriseApi.commercial.leads(),
        enterpriseApi.commercial.quotes(),
        enterpriseApi.commercial.contracts(),
      ]);
      if (!active) return;
      setLeads(toList(leadsRes.data));
      setQuotes(toList(quotesRes.data));
      setContracts(toList(contractsRes.data));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb/>
      <RoleWorkbenchHero
        eyebrow="Commercial Center"
        title="Commercial Workbench"
        subtitle="A focused daily sales and relationship workbench for moving demand into commercial commitment."
        badges={["Commercial", "Pipeline", "Quotes", "Contracts"]}
      />

      <WorkbenchSummaryGrid
        title="Commercial Summary"
        subtitle="Start the day by understanding where commercial pressure sits."
        items={[
          { label: "Leads", value: formatCount(toCount(leads)), detail: "Current visible lead volume" },
          { label: "Quotes", value: formatCount(toCount(quotes)), detail: "Current visible quote volume" },
          { label: "Contracts", value: formatCount(toCount(contracts)), detail: "Current visible contract volume" },
          { label: "Readiness", value: "Live", detail: "Commercial feeds are available to the workbench" },
        ]}
      />

      <ActionQueueList
        title="Commercial Action Queues"
        subtitle="Use these queues to move opportunities forward."
        items={[
          { title: "Open Commercial Command", value: "Now", detail: "Review leads, quotes, and contract movement in one command surface.", href: "/commercial/command", tone: "success" },
          { title: "Open Customer 360", value: "Now", detail: "Inspect relationship continuity and billing context.", href: "/customers/360", tone: "warning" },
          { title: "Open Contract 360", value: "Now", detail: "Inspect commitment-to-delivery continuity.", href: "/contracts/360", tone: "neutral" },
          { title: "Open Recommendations", value: "Now", detail: "Use recommendations to identify next enterprise actions.", href: "/recommendations", tone: "neutral" },
        ]}
      />

      <InsightStack
        title="Commercial Workbench Guidance"
        subtitle="Use this page to prioritize movement, not to replace detail analysis."
        items={[
          { title: "Start with movement", detail: "Use this page to identify where leads and quotes need action today." },
          { title: "Escalate to 360 pages", detail: "Use Customer 360 and Contract 360 when context matters more than queue count." },
          { title: "Link to execution early", detail: "Think about delivery continuity before the contract becomes a problem." },
        ]}
      />
    </div>
  );
}
