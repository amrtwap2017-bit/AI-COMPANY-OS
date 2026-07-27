"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmt = (n: any) => Number(n || 0).toLocaleString();
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutivePortfolio() {
  const router = useRouter();
  const { data: dash } = useQuery(["ep-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: contractRaw } = useQuery(["ep-contracts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["ep-invoices"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: leadRaw } = useQuery(["ep-leads"], () => authFetch("/api/v1/leads/").then(r => r.json()));
  const { data: projectRaw } = useQuery(["ep-projects"], () => authFetch("/api/v1/projects/").then(r => r.json()));

  const contracts = toArr(contractRaw);
  const invoices = toArr(invoiceRaw);
  const leads = toArr(leadRaw);
  const projects = toArr(projectRaw);
  const d = dash || {};

  const totalContractValue = contracts.filter((c: any) => c.status === "active").reduce((s: number, c: any) => s + Number(c.total_value || 0), 0);
  const totalInvoiceValue = invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const paidValue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const pendingValue = invoices.filter((i: any) => i.status === "pending").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const expiring = contracts.filter((c: any) => {
    if (!c.end_date || c.status !== "active") return false;
    const d = new Date(c.end_date);
    const now = new Date();
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  });
  const wonLeads = leads.filter((l: any) => l.status === "won");

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Portfolio</div>
        <h1 className="text-page-title text-primary">Business Portfolio</h1>
        <p className="text-secondary mt-1">Revenue, contracts, and commercial performance</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Contract Value", value: fmtEGP(totalContractValue), sub: `${contracts.filter((c: any) => c.status === "active").length} contracts`, color: "emerald" },
          { label: "Total Invoiced", value: fmtEGP(totalInvoiceValue), sub: `${invoices.length} invoices`, color: "blue" },
          { label: "Collected", value: fmtEGP(paidValue), sub: `${Math.round(paidValue / Math.max(totalInvoiceValue, 1) * 100)}% collection rate`, color: "amber" },
          { label: "Pending Collection", value: fmtEGP(pendingValue), sub: `${d.finance?.overdue ?? 0} overdue`, color: "red" },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-secondary mb-2 font-medium">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contracts by Status */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Contract Portfolio</h2>
            <button onClick={() => router.push("/commercial/contracts")} className="text-xs text-amber-500 hover:underline">Manage →</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Active", count: contracts.filter((c: any) => c.status === "active").length, color: "emerald", total: contracts.length },
              { label: "Pending Signature", count: contracts.filter((c: any) => c.status === "pending_signature").length, color: "amber", total: contracts.length },
              { label: "Expired", count: contracts.filter((c: any) => c.status === "expired").length, color: "red", total: contracts.length },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">{s.label}</span>
                  <span className="font-bold text-primary">{s.count}</span>
                </div>
                <div className="w-full bg-base-alt rounded-full h-2">
                  <div className={`h-2 rounded-full bg-${s.color}-500`} style={{ width: `${(s.count / Math.max(s.total, 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {expiring.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">⚠️ {expiring.length} contracts expiring within 30 days</div>
              {expiring.slice(0, 2).map((c: any, i: number) => (
                <div key={i} className="text-xs text-amber-600 mt-1">{c.title || c.id?.slice(0, 8)} — expires {fmtDate(c.end_date)}</div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Active Projects</h2>
            <button onClick={() => router.push("/projects-center")} className="text-xs text-amber-500 hover:underline">View all →</button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total", value: projects.length, color: "blue" },
              { label: "Active", value: projects.filter((p: any) => p.status === "active").length, color: "emerald" },
              { label: "Leads Won", value: wonLeads.length, color: "amber" },
            ].map((s, i) => (
              <div key={i} className="bg-base-alt dark:bg-surface-alt rounded-xl p-3 text-center">
                <div className={`text-2xl font-black text-${s.color}-500`}>{s.value}</div>
                <div className="text-xs text-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {projects.slice(0, 5).map((p: any, i: number) => (
              <button key={p.id || i} onClick={() => router.push(`/projects-center/${p.id}`)}
                className="w-full flex items-center justify-between p-3 bg-base-alt dark:bg-surface-alt rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left">
                <div className="text-sm font-medium text-primary truncate">{p.name || p.title || p.id}</div>
                <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-secondary"}`}>{p.status || "—"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Sales Pipeline</h2>
          <button onClick={() => router.push("/commercial/pipeline")} className="text-xs text-amber-500 hover:underline">Full pipeline →</button>
        </div>
        <div className="flex gap-2">
          {[
            { label: "New", count: leads.filter((l: any) => l.status === "new").length, color: "slate" },
            { label: "Qualified", count: leads.filter((l: any) => l.status === "qualified").length, color: "blue" },
            { label: "Proposal", count: leads.filter((l: any) => l.status === "proposal").length, color: "purple" },
            { label: "Negotiation", count: leads.filter((l: any) => l.status === "negotiation").length, color: "amber" },
            { label: "Won", count: wonLeads.length, color: "emerald" },
            { label: "Lost", count: leads.filter((l: any) => l.status === "lost").length, color: "red" },
          ].map((stage, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`text-2xl font-black text-${stage.color}-500`}>{stage.count}</div>
              <div className="text-xs text-secondary mt-1">{stage.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
