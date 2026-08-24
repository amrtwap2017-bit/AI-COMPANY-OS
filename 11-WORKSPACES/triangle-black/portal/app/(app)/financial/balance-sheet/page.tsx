"use client";
// Triangle Black — Financial GL Balance Sheet
// Sprint-027: Balance Sheet Portal Page
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtEGP = (n: any) => `EGP ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const SECTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  assets:      { label: "Assets",      color: "text-blue-700",  bg: "bg-blue-50 border-blue-200",  icon: "🏦" },
  liabilities: { label: "Liabilities", color: "text-red-700",   bg: "bg-red-50 border-red-200",    icon: "📋" },
  equity:      { label: "Equity",      color: "text-purple-700",bg: "bg-purple-50 border-purple-200",icon: "💼" },
  revenue:     { label: "Revenue",     color: "text-green-700", bg: "bg-green-50 border-green-200", icon: "📈" },
  expenses:    { label: "Expenses",    color: "text-orange-700",bg: "bg-orange-50 border-orange-200",icon: "📉" },
};

function AccountSection({ sectionKey, data, defaultOpen = false }: { sectionKey: string; data: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = (SECTION_CONFIG as Record<string, any>)[sectionKey] || { label: sectionKey, color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: "📂" };
  const accounts = data?.accounts || [];

  return (
    <div className={`border rounded-xl overflow-hidden ${cfg.bg}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
            <p className="text-xs text-gray-500">{data?.count || 0} accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-lg font-bold ${cfg.color}`}>{fmtEGP(data?.total || 0)}</span>
          <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && accounts.length > 0 && (
        <div className="border-t border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                <th className="px-5 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.map((acc: any, i: number) => (
                <tr key={`${acc.code}-${i}`} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-500">{acc.code}</td>
                  <td className="px-5 py-2.5 text-[var(--color-text-1)]">{acc.name}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-[var(--color-text-1)]">{fmtEGP(acc.balance || 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={2} className="px-5 py-2.5 text-sm font-semibold text-gray-700">Total {cfg.label}</td>
                <td className={`px-5 py-2.5 text-right font-bold ${cfg.color}`}>{fmtEGP(data?.total || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {open && accounts.length === 0 && (
        <div className="border-t border-gray-200 bg-white px-5 py-6 text-center text-gray-400 text-sm">
          No accounts in this category yet
        </div>
      )}
    </div>
  );
}

export default function BalanceSheetPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [genAt, setGenAt]     = useState<string>("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/financial/gl/balance-sheet")
      .then(r => r.data ?? r)
      .then((d: any) => {
        setData(d);
        if (d.generated_at) {
          const dt = new Date(d.generated_at);
          setGenAt(dt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }));
        }
      })
      .catch(() => setError("Failed to load balance sheet"))
      .finally(() => setLoading(false));
  }, [mounted]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto" />
        <p className="text-gray-400 text-sm">Loading balance sheet...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-gray-500 hover:text-gray-700">
          Try again
        </button>
      </div>
    </div>
  );

  const netIncome = data?.net_income ?? 0;
  const isProfit  = netIncome >= 0;
  const summary   = data?.summary || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => router.push("/financial/gl")}
              className="text-sm text-gray-500 hover:text-gray-700">← GL</button>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-medium">Balance Sheet</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Balance Sheet</h1>
          {genAt && <p className="text-xs text-gray-400 mt-1">Generated: {genAt}</p>}
        </div>
        <button
          onClick={() => { setLoading(true); tbFetch("/api/v1/financial/gl/balance-sheet").then(r => r.data ?? r).then(setData).finally(()=>setLoading(false)); }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets",    value: fmtEGP(data?.total_assets || 0),                    color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "Liabilities+Equity", value: fmtEGP(data?.total_liabilities_equity || 0),     color: "text-purple-700", bg: "bg-purple-50" },
          { label: "Net Income",      value: fmtEGP(netIncome),                                  color: isProfit ? "text-green-700" : "text-red-700", bg: isProfit ? "bg-green-50" : "bg-red-50" },
          { label: "Total Accounts",  value: Object.values(summary).reduce((a:any,b:any)=>a+b,0), color: "text-gray-700",   bg: "bg-gray-50" },
        ].map((kpi: any) => (
          <div key={kpi.label} className={`${kpi.bg} border border-gray-200 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Net Income Banner */}
      <div className={`rounded-xl p-5 border ${isProfit ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isProfit ? "📈" : "📉"}</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income (Revenue − Expenses)</p>
              <p className={`text-2xl font-bold ${isProfit ? "text-green-700" : "text-red-700"}`}>
                {isProfit ? "+" : ""}{fmtEGP(netIncome)}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-1">
            <p>Revenue accounts: {summary.revenue_count || 0}</p>
            <p>Expense accounts: {summary.expense_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Account Sections */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Breakdown</h2>
        {["assets", "liabilities", "equity", "revenue", "expenses"].map((key: any, i: any) => (
          <AccountSection
            key={key}
            sectionKey={key}
            data={data?.[key]}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        Triangle Black Financial Report · {summary.asset_count || 0} asset · {summary.liability_count || 0} liability · {summary.equity_count || 0} equity accounts
      </div>
    </div>
  );
}
