"use client";
// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function AlertsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: notifRaw, isLoading } = useQuery(["alerts-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const notifs = toArr(notifRaw);

  const markAllRead = async () => {
    await authFetch("/api/v1/notifications/read-all", { method: "POST" });
    qc.invalidateQueries(["alerts-notifs"]);
  };

  const types = [...new Set(notifs.map((n: any) => n.type || "general"))];
  const filtered = typeFilter === "all" ? notifs : notifs.filter((n: any) => (n.type || "general") === typeFilter);
  const unread = notifs.filter((n: any) => !n.is_read);

  const typeConfig: any = {
    work_order_created: { icon: "🔧", color: "blue", label: "Work Order" },
    contract_expiring: { icon: "📄", color: "amber", label: "Contract" },
    purchase_request_created: { icon: "🛒", color: "purple", label: "Purchase" },
    contract_activation_requested: { icon: "✍️", color: "emerald", label: "Contract" },
    contract_acknowledged: { icon: "✅", color: "emerald", label: "Contract" },
    quote_sent: { icon: "💬", color: "blue", label: "Quote" },
    quote_approved: { icon: "✅", color: "emerald", label: "Quote" },
    client_message: { icon: "💬", color: "cyan", label: "Message" },
    info: { icon: "ℹ️", color: "slate", label: "Info" },
    general: { icon: "🔔", color: "slate", label: "General" },
  };

  if (isLoading) return <div className="p-6 text-slate-400">Loading alerts...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Platform Alerts</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Alert Center</h1>
          <p className="text-slate-500 mt-1">All platform notifications and system alerts</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-center">
            <div className="text-2xl font-black text-amber-500">{unread.length}</div>
            <div className="text-xs text-slate-500">Unread</div>
          </div>
          <button onClick={markAllRead}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">
            Mark All Read
          </button>
        </div>
      </div>

      {/* Type summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts", value: notifs.length, color: "blue" },
          { label: "Unread", value: unread.length, color: "amber" },
          { label: "Alert Types", value: types.length, color: "purple" },
          { label: "System Generated", value: notifs.filter((n: any) => n.type === "work_order_created" || n.type === "purchase_request_created").length, color: "emerald" },
        ].map((k, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs text-slate-500 mb-1">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === "all" ? "bg-amber-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600"}`}>
          All ({notifs.length})
        </button>
        {types.slice(0, 8).map(type => {
          const cfg = typeConfig[type] || typeConfig.general;
          const count = notifs.filter((n: any) => (n.type || "general") === type).length;
          return (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === type ? "bg-amber-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600"}`}>
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {filtered.slice(0, 50).map((n: any, i: number) => {
            const cfg = typeConfig[n.type || "general"] || typeConfig.general;
            return (
              <div key={n.id || i} className={`flex items-start gap-4 px-5 py-4 ${!n.is_read ? "bg-amber-50/50 dark:bg-amber-900/10" : ""} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{n.title}</div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.is_read && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                      <span className={`text-xs px-2 py-0.5 rounded font-medium bg-${cfg.color}-100 text-${cfg.color}-700`}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</div>
                  <div className="text-xs text-slate-400 mt-1">{fmtDate(n.created_at)}</div>
                </div>
              </div>
            );
          })}
          {filtered.length > 50 && (
            <div className="text-center py-4 text-xs text-slate-400">Showing 50 of {filtered.length} alerts</div>
          )}
        </div>
      </div>
    </div>
  );
}
