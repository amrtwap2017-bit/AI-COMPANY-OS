"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function WorkflowLauncher() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const { data: woData } = useQuery(["wfl-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srData } = useQuery(["wfl-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: prData } = useQuery(["wfl-prs"], () => authFetch("/api/v1/purchase-requests/").then(r => r.json()));
  const { data: pmData } = useQuery(["wfl-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: autoStatus, refetch: refetchStatus } = useQuery(
    ["automation-status"],
    () => authFetch("/api/v1/automation/status").then(r => r.json())
  );

  const wos = toArr(woData);
  const srs = toArr(srData);
  const prs = toArr(prData);
  const pms = toArr(pmData);
  const pending = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s: number, v: any) => s + Number(v), 0);

  const runAutomation = async () => {
    setRunning(true);
    try {
      const res = await authFetch("/api/v1/automation/run", { method: "POST" });
      const data = await res.json();
      setLastResult(data);
      refetchStatus();
    } catch (e: any) {
      setLastResult({ error: e.message });
    } finally {
      setRunning(false);
    }
  };

  const launchers = [
    { title: "Create Work Order", desc: "New corrective or reactive maintenance task", path: "/engineering/new-work-order", icon: "🔧", count: `${wos.filter((w: any) => w.status === "open").length} open` },
    { title: "New Service Request", desc: "Log a new customer or internal service request", path: "/operations/service-requests", icon: "📋", count: `${srs.filter((s: any) => s.status === "open" || s.status === "new").length} pending` },
    { title: "Create Purchase Request", desc: "Request materials or spare parts", path: "/supply-chain/purchase-requests", icon: "🛒", count: `${prs.filter((p: any) => p.status === "pending").length} pending` },
    { title: "Schedule PM", desc: "Review and schedule preventive maintenance", path: "/engineering/pm-plans", icon: "📅", count: `${pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < new Date()).length} overdue` },
    { title: "Dispatch Technician", desc: "Assign and dispatch field technicians", path: "/operations/dispatch", icon: "👷", count: `${wos.filter((w: any) => w.status === "in_progress").length} dispatched` },
    { title: "Review Contracts", desc: "Check contract status and renewals", path: "/commercial/contracts", icon: "📄", count: "" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Launcher</h1>
          <p className="text-gray-500 text-sm mt-1">Quick access to platform workflows and automation</p>
        </div>
        <button
          onClick={runAutomation}
          disabled={running}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            running ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {running ? "⏳ Running..." : `⚡ Run Automation Engine${totalPending > 0 ? ` (${totalPending} pending)` : ""}`}
        </button>
      </div>

      {/* Automation Status */}
      {totalPending > 0 && !lastResult && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-4">
          <h2 className="font-semibold text-amber-700 mb-2">⚠️ Pending Automation Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(pending).map(([key, val]: [string, any]) => val > 0 && (
              <div key={key} className="text-center bg-white dark:bg-zinc-800 rounded p-2">
                <div className="text-xl font-bold text-amber-600">{val}</div>
                <div className="text-xs text-gray-500 capitalize">{key.replace(/wf\d+_/, "").replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Run Result */}
      {lastResult && !lastResult.error && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-700 mb-3">✅ Automation Complete — {lastResult.total_actions} Actions Taken</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="bg-white dark:bg-zinc-800 rounded p-2">
              <div className="text-xl font-bold text-blue-600">{lastResult.wf01_pm_to_wo?.created?.length || 0}</div>
              <div className="text-xs text-gray-500">PM → Work Orders</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded p-2">
              <div className="text-xl font-bold text-purple-600">{lastResult.wf02_contract_renewals?.notified?.length || 0}</div>
              <div className="text-xs text-gray-500">Renewal Alerts</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded p-2">
              <div className="text-xl font-bold text-orange-600">{lastResult.wf03_stock_auto_pr?.created?.length || 0}</div>
              <div className="text-xs text-gray-500">Auto PRs</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded p-2">
              <div className="text-xl font-bold text-green-600">{lastResult.wf04_wo_asset_sync?.synced || 0}</div>
              <div className="text-xs text-gray-500">Assets Synced</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded p-2">
              <div className="text-xl font-bold text-teal-600">{lastResult.wf05_sr_to_wo?.linked?.length || 0}</div>
              <div className="text-xs text-gray-500">SRs Linked</div>
            </div>
          </div>
        </div>
      )}

      {lastResult?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ❌ Error: {lastResult.error}
        </div>
      )}

      {/* Manual Workflow Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {launchers.map((l, i) => (
          <button key={i} onClick={() => router.push(l.path)}
            className="bg-white dark:bg-zinc-900 rounded-lg border p-6 text-left hover:border-blue-400 hover:shadow-md transition-all">
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
