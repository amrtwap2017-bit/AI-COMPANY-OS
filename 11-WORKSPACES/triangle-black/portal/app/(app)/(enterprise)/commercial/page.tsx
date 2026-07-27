"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

export default function CommercialHub() {
  const router = useRouter();
  const { data: leadRaw } = useQuery(["ch-leads"], () => authFetch("/api/v1/leads/").then(r => r.json()));
  const { data: contractRaw } = useQuery(["ch-contracts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["ch-invoices"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: dash } = useQuery(["ch-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));

  const leads = toArr(leadRaw);
  const contracts = toArr(contractRaw);
  const invoices = toArr(invoiceRaw);
  const d = dash?.commercial || {};

  const activeContracts = contracts.filter((c: any) => c.status === "active");
  const totalValue = activeContracts.reduce((s: number, c: any) => s + Number(c.total_value || 0), 0);
  const paidValue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const expiring = contracts.filter((c: any) => {
    if (!c.end_date || c.status !== "active") return false;
    const dd = new Date(c.end_date);
    const now = new Date();
    return dd >= now && dd <= new Date(now.getTime() + 30 * 86400000);
  });
  const hotLeads = leads.filter((l: any) => (l.score ?? 0) >= 70 && l.status !== "won" && l.status !== "lost");

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Commercial Hub</div>
        <h1 className="text-3xl font-black text-primary">Commercial Overview</h1>
        <p className="text-secondary mt-1">Pipeline, contracts, and revenue performance</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Contracts", value: activeContracts.length, sub: fmtEGP(totalValue) + " value", color: "emerald", path: "/commercial/contracts" },
          { label: "Open Leads", value: leads.filter((l: any) => l.status !== "won" && l.status !== "lost").length, sub: `${hotLeads.length} hot leads`, color: "blue", path: "/commercial/leads" },
          { label: "Revenue Collected", value: fmtEGP(paidValue), sub: `${invoices.filter((i: any) => i.status === "paid").length} invoices paid`, color: "amber", path: "/invoices" },
          { label: "Expiring Soon", value: expiring.length, sub: "contracts in 30 days", color: expiring.length > 0 ? "red" : "emerald", path: "/commercial/contracts" },
        ].map((k, i) => (
          <button key={i} onClick={() => router.push(k.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline stages */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Sales Pipeline</h2>
            <button onClick={() => router.push("/commercial/pipeline")} className="text-xs text-amber-500 hover:underline">Full view →</button>
          </div>
          <div className="space-y-3">
            {[
              { stage: "New", count: leads.filter((l: any) => l.status === "new").length, color: "slate" },
              { stage: "Qualified", count: leads.filter((l: any) => l.status === "qualified").length, color: "blue" },
              { stage: "Proposal Sent", count: leads.filter((l: any) => l.status === "proposal").length, color: "purple" },
              { stage: "Negotiation", count: leads.filter((l: any) => l.status === "negotiation").length, color: "amber" },
              { stage: "Won", count: leads.filter((l: any) => l.status === "won").length, color: "emerald" },
              { stage: "Lost", count: leads.filter((l: any) => l.status === "lost").length, color: "red" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-secondary w-28 flex-shrink-0">{s.stage}</div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 relative">
                  <div className={`h-5 rounded-full bg-${s.color}-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(8, (s.count / Math.max(leads.length, 1)) * 100)}%` }}>
                    <span className="text-white text-xs font-bold">{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring contracts */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Contracts Expiring Soon</h2>
            <button onClick={() => router.push("/commercial/contracts")} className="text-xs text-amber-500 hover:underline">All contracts →</button>
          </div>
          {expiring.length === 0 ? (
            <div className="text-center py-8 text-tertiary text-sm">✅ No contracts expiring in 30 days</div>
          ) : expiring.slice(0, 6).map((c: any, i: number) => {
            const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
            return (
              <button key={i} onClick={() => router.push(`/commercial/contracts/${c.id}`)}
                className="w-full flex items-center justify-between p-3 mb-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 transition-colors text-left">
                <div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 truncate">{c.title || c.id?.slice(0, 12)}</div>
                  <div className="text-xs text-amber-600 mt-0.5">Expires {fmtDate(c.end_date)}</div>
                </div>
                <span className={`text-xs font-black px-2 py-1 rounded-lg ${daysLeft <= 7 ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>{daysLeft}d</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hot leads */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Hot Leads (Score ≥ 70)</h2>
          <button onClick={() => router.push("/commercial/leads")} className="text-xs text-amber-500 hover:underline">All leads →</button>
        </div>
        {hotLeads.length === 0 ? (
          <div className="text-tertiary text-sm text-center py-6">No hot leads at this time</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {hotLeads.slice(0, 6).map((l: any, i: number) => (
              <button key={i} onClick={() => router.push(`/commercial/leads/${l.id}`)}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-bold text-primary truncate">{l.name}</div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold ml-2 flex-shrink-0">{l.score}</span>
                </div>
                <div className="text-xs text-secondary">{l.company}</div>
                <div className="text-xs text-tertiary mt-1">{l.status} · {l.source}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
