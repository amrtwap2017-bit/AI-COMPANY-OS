"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function WorkflowLauncher() {
  const router = useRouter();
  const { data: woData } = useQuery(["wfl-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srData } = useQuery(["wfl-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: prData } = useQuery(["wfl-prs"], () => authFetch("/api/v1/purchase-requests/").then(r => r.json()));
  const { data: pmData } = useQuery(["wfl-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));

  const wos = toArr(woData);
  const srs = toArr(srData);
  const prs = toArr(prData);
  const pms = toArr(pmData);

  const launchers = [
    { title: "Create Work Order", desc: "New corrective or reactive maintenance task", path: "/engineering/new-work-order", icon: "🔧", count: wos.filter((w: any) => w.status === "open").length + " open" },
    { title: "New Service Request", desc: "Log a new customer or internal service request", path: "/operations/service-requests", icon: "📋", count: srs.filter((s: any) => s.status === "open" || s.status === "new").length + " pending" },
    { title: "Create Purchase Request", desc: "Request materials or spare parts", path: "/supply-chain/purchase-requests", icon: "🛒", count: prs.filter((p: any) => p.status === "pending" || p.status === "open").length + " pending" },
    { title: "Schedule PM", desc: "Review and schedule preventive maintenance", path: "/engineering/pm-plans", icon: "📅", count: pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date()).length + " overdue" },
    { title: "Dispatch Technician", desc: "Assign and dispatch field technicians", path: "/operations/dispatch", icon: "👷", count: wos.filter((w: any) => w.status === "in_progress").length + " dispatched" },
    { title: "Review Contracts", desc: "Check contract status and renewals", path: "/commercial/contracts", icon: "📄", count: "" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workflow Launcher</h1>
      <p className="text-gray-500">Quick access to platform workflows</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {launchers.map((l, i) => (
          <button key={i} onClick={() => router.push(l.path)} className="bg-white dark:bg-zinc-900 rounded-lg border p-6 text-left hover:border-blue-400 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">{l.icon}</div>
            <div className="font-semibold text-lg">{l.title}</div>
            <div className="text-sm text-gray-500 mt-1">{l.desc}</div>
            {l.count && <div className="text-xs text-blue-600 mt-2 font-medium">{l.count}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
