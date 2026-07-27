"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function WorkflowDesigner() {
  const { data: woData } = useQuery(["wfd-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srData } = useQuery(["wfd-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: prData } = useQuery(["wfd-prs"], () => authFetch("/api/v1/purchase-requests/").then(r => r.json()));
  const { data: pmData } = useQuery(["wfd-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));

  const wos = toArr(woData);
  const srs = toArr(srData);
  const prs = toArr(prData);
  const pms = toArr(pmData);

  const workflows = [
    { name: "Service Request → Work Order", from: "Service Requests", to: "Work Orders", fromCount: srs.length, toCount: wos.length, active: srs.filter((s: any) => s.status === "open" || s.status === "new").length, color: "blue" },
    { name: "PM Plan → Work Order", from: "PM Plans", to: "Work Orders", fromCount: pms.length, toCount: wos.length, active: pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date()).length, color: "amber" },
    { name: "Work Order → Purchase Request", from: "Work Orders", to: "Purchase Requests", fromCount: wos.length, toCount: prs.length, active: prs.filter((p: any) => p.status === "pending" || p.status === "open").length, color: "purple" },
    { name: "Work Order → Completion → Invoice", from: "Work Orders", to: "Invoices", fromCount: wos.length, toCount: wos.filter((w: any) => w.status === "completed").length, active: wos.filter((w: any) => w.status === "in_progress").length, color: "green" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workflow Designer</h1>
      <p className="text-gray-500">Platform workflow connections and their current throughput</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((wf, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4">{wf.name}</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{wf.fromCount}</div>
                <div className="text-xs text-gray-500">{wf.from}</div>
              </div>
              <div className="text-3xl text-gray-300">→</div>
              <div className="text-center">
                <div className="text-2xl font-bold">{wf.toCount}</div>
                <div className="text-xs text-gray-500">{wf.to}</div>
              </div>
            </div>
            <div className={`text-center p-2 rounded bg-${wf.color}-50 dark:bg-${wf.color}-900/20`}>
              <span className={`text-sm font-medium text-${wf.color}-700`}>{wf.active} currently active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
