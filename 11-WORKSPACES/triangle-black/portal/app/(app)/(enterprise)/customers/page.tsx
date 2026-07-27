"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString()}`;

export default function CustomersHub() {
  const router = useRouter();
  const { data: contractRaw } = useQuery(["cu-contracts"], () => authFetch("/api/v1/contracts/").then(r => r.json()));
  const { data: invoiceRaw } = useQuery(["cu-invoices"], () => authFetch("/api/v1/invoices/").then(r => r.json()));
  const { data: woRaw } = useQuery(["cu-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srRaw } = useQuery(["cu-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: leadRaw } = useQuery(["cu-leads"], () => authFetch("/api/v1/leads/").then(r => r.json()));

  const contracts = toArr(contractRaw);
  const invoices = toArr(invoiceRaw);
  const wos = toArr(woRaw);
  const srs = toArr(srRaw);
  const leads = toArr(leadRaw);

  const activeContracts = contracts.filter((c: any) => c.status === "active");
  const totalRevenue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const openSRs = srs.filter((s: any) => s.status === "open" || s.status === "new");
  const wonLeads = leads.filter((l: any) => l.status === "won");

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Customer Management</div>
        <h1 className="text-3xl font-black text-primary">Customer Hub</h1>
        <p className="text-secondary mt-1">Customer health, contracts, and service history</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Clients", value: activeContracts.length, sub: "with active contracts", color: "emerald", path: "/commercial/contracts" },
          { label: "Total Revenue", value: fmtEGP(totalRevenue), sub: "collected to date", color: "amber", path: "/invoices" },
          { label: "Open Requests", value: openSRs.length, sub: "service requests", color: "blue", path: "/operations/service-requests" },
          { label: "Customers Won", value: wonLeads.length, sub: "converted leads", color: "purple", path: "/commercial/leads" },
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
        {/* Active contracts */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Active Client Contracts</h2>
            <button onClick={() => router.push("/commercial/contracts")} className="text-xs text-amber-500 hover:underline">All →</button>
          </div>
          <div className="space-y-2">
            {activeContracts.slice(0, 8).map((c: any, i: number) => (
              <button key={i} onClick={() => router.push(`/commercial/contracts/${c.id}`)}
                className="w-full flex items-center justify-between p-3 bg-base-alt dark:bg-surface-alt rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left">
                <div>
                  <div className="text-sm font-semibold text-primary truncate">{c.title || `Contract ${c.id?.slice(0, 8)}`}</div>
                  <div className="text-xs text-tertiary mt-0.5">Expires {fmtDate(c.end_date)}</div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-sm font-bold text-emerald-600">{fmtEGP(c.total_value)}</div>
                  <div className="text-xs text-tertiary">/month</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Open service requests */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Open Service Requests</h2>
            <button onClick={() => router.push("/operations/service-requests")} className="text-xs text-amber-500 hover:underline">All →</button>
          </div>
          {openSRs.length === 0 ? (
            <div className="text-center py-8 text-tertiary text-sm">✅ No open service requests</div>
          ) : openSRs.slice(0, 8).map((sr: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 truncate">{sr.title}</div>
                <div className="text-xs text-blue-500 mt-0.5">{sr.status} · {sr.urgency || "normal"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Customer 360", icon: "🔍", path: "/customers/360" },
          { label: "Review History", icon: "📋", path: "/customers/review" },
          { label: "Renewals", icon: "🔄", path: "/customers/renewals" },
          { label: "Invoices", icon: "💰", path: "/invoices" },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-center hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-3xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-primary">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
