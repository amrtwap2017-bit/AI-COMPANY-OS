"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP  = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const STATUS_BADGE = {
  active:            "bg-emerald-100 text-emerald-700 font-semibold",
  pending_signature: "bg-amber-100 text-amber-700",
  expired:           "bg-red-100 text-red-700",
  draft:             "bg-slate-100 text-slate-600",
};

export default function ContractsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: raw, isLoading } = useQuery(
    ["contracts-list"],
    () => authFetch("/api/v1/contracts/").then(r => r.json()),
    { refetchInterval: 120000 }
  );
  const contracts = toArr(raw);
  const now = new Date();
  const in30 = new Date(now.getTime() + 30*86400000);
  const in90 = new Date(now.getTime() + 90*86400000);

  const active    = contracts.filter(c => c.status === "active");
  const pending   = contracts.filter(c => c.status === "pending_signature");
  const expired   = contracts.filter(c => c.status === "expired");
  const expiring30 = contracts.filter(c => c.status==="active" && c.end_date && new Date(c.end_date)>=now && new Date(c.end_date)<=in30);
  const expiring90 = contracts.filter(c => c.status==="active" && c.end_date && new Date(c.end_date)>=now && new Date(c.end_date)<=in90);
  const totalValue = active.reduce((s,c) => s+Number(c.total_value||0), 0);

  const filtered = contracts.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.id?.slice(0,8).includes(search.toLowerCase());
    const matchStatus = statusFilter==="all" || c.status===statusFilter ||
      (statusFilter==="expiring" && c.status==="active" && c.end_date && new Date(c.end_date)>=now && new Date(c.end_date)<=in30);
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-40"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border p-5 h-24"/>)}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1.5">Commercial</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Contracts</h1>
          <p className="text-slate-500 text-sm mt-1.5">{contracts.length} total · {active.length} active · {fmtEGP(totalValue)} portfolio value</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>router.push("/customers/renewals")}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-700 dark:text-slate-300 transition-all">
            🔄 Renewals
          </button>
          <button onClick={()=>router.push("/commercial/leads")}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all">
            + New Contract
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Active",         value:active.length,    color:"emerald", filter:"active",    sub:fmtEGP(totalValue) },
          { label:"Pending Sign",   value:pending.length,   color:"amber",   filter:"pending_signature", sub:"awaiting signature" },
          { label:"Expiring 30d",   value:expiring30.length,color:expiring30.length>0?"red":"slate", filter:"expiring", sub:"urgent renewals" },
          { label:"Expiring 90d",   value:expiring90.length,color:"blue",    filter:"expiring",  sub:"plan ahead" },
          { label:"Expired",        value:expired.length,   color:"slate",   filter:"expired",   sub:"closed" },
        ].map((k,i)=>(
          <button key={i} onClick={()=>setStatusFilter(statusFilter===k.filter?"all":k.filter)}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 text-center transition-all hover:shadow-md ${statusFilter===k.filter?`border-${k.color}-400 shadow-sm`:"border-slate-200 dark:border-slate-800 hover:border-amber-300"}`}>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{k.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{k.sub}</div>
          </button>
        ))}
      </div>

      {expiring30.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="text-2xl">⏰</div>
          <div className="flex-1">
            <div className="font-bold text-amber-800 dark:text-amber-300">{expiring30.length} Contracts Expiring Within 30 Days — Initiate Renewals</div>
            <div className="text-sm text-amber-600 mt-0.5">{expiring30.slice(0,2).map(c=>c.title||c.id?.slice(0,8)).join(" · ")}{expiring30.length>2?` +${expiring30.length-2} more`:""}</div>
          </div>
          <button onClick={()=>router.push("/customers/renewals")}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 flex-shrink-0">
            Manage Renewals
          </button>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search contracts by title or ID..."
          className="flex-1 min-w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending_signature">Pending Signature</option>
          <option value="expiring">Expiring (30d)</option>
          <option value="expired">Expired</option>
        </select>
        {(search||statusFilter!=="all") && (
          <button onClick={()=>{setSearch("");setStatusFilter("all");}}
            className="px-3 py-2 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">Clear ×</button>
        )}
        <div className="text-xs text-slate-400 self-center">{filtered.length} contracts</div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📄</div>
            <div className="font-bold text-slate-900 dark:text-white text-lg">No contracts found</div>
            <div className="text-slate-400 text-sm mt-1">Contracts are created from won leads</div>
            <button onClick={()=>router.push("/commercial/leads")} className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700">View Pipeline →</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_120px_120px_130px_130px] bg-slate-50 dark:bg-slate-800/50 px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div>Contract</div>
              <div className="text-center">Status</div>
              <div className="text-right">Value</div>
              <div className="text-center">Start Date</div>
              <div className="text-center">End Date</div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((c,i)=>{
                const isExpiring = c.status==="active" && c.end_date && new Date(c.end_date)>=now && new Date(c.end_date)<=in30;
                const isExpired  = c.status==="expired";
                const daysLeft   = c.end_date ? Math.ceil((new Date(c.end_date)-Date.now())/86400000) : null;
                return (
                  <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)}
                    className={`w-full grid grid-cols-[1fr_120px_120px_130px_130px] items-center px-5 py-4 text-left transition-colors group ${isExpiring?"bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-50":"hover:bg-amber-50/50 dark:hover:bg-amber-900/10"}`}>
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-amber-600">{c.title||`Contract ${c.id?.slice(0,8)}`}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.duration_months ? `${c.duration_months} months` : "—"} · Renewal #{c.renewal_count||0}</div>
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_BADGE[c.status]||"bg-slate-100 text-slate-600"}`}>{c.status?.replace("_"," ")||"—"}</span>
                    </div>
                    <div className="text-right text-sm font-bold text-emerald-600">{fmtEGP(c.total_value)}</div>
                    <div className="text-center text-xs text-slate-500">{fmtDate(c.start_date)}</div>
                    <div className={`text-center text-xs ${isExpiring?"text-amber-600 font-semibold":isExpired?"text-red-500":"text-slate-500"}`}>
                      {fmtDate(c.end_date)}
                      {isExpiring && daysLeft && <div className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded mt-0.5">{daysLeft}d left</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
