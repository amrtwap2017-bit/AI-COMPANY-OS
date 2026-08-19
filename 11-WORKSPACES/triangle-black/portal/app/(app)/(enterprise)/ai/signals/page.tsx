"use client";
// @ts-nocheck
// Triangle Black — AI Signals Dashboard
// Sprint-044
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";
import { FeatureGate } from "@/components/ui/FeatureGate";

function AISignalsPageInner() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLast] = useState("");

  const loadData = () => {
    setLoading(true);
    tbFetch("/api/v1/ai/signals/summary").then(r => r.data ?? r)
      .then((d: any) => { setSummary(d); setLast(new Date().toLocaleTimeString("en-GB")); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) loadData(); }, [mounted]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">AI Signals</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time AI alerts · {lastRefresh && `Updated ${lastRefresh}`}</p>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">↻ Refresh</button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"🔴 Critical", value:summary.critical||0, color:"bg-red-50 border-red-200" },
            { label:"🟠 High",     value:summary.high||0,     color:"bg-orange-50 border-orange-200" },
            { label:"🟡 Medium",   value:summary.medium||0,   color:"bg-yellow-50 border-yellow-200" },
            { label:"📊 Total",    value:summary.total||0,    color:"bg-gray-50 border-gray-200" },
          ].map((k: any) => (
            <div key={k.label} className={`${k.color} border rounded-xl p-4`}>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-3xl font-bold text-[var(--color-text-1)] mt-1">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-medium text-[var(--color-text-1)]">Triangle Black AI Engine</p>
            <p className="text-xs text-gray-500">Monitoring operations · Qwen 2.5 · Real-time analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"PM Maintenance", icon:"🔧", path:"/maintenance/pm-schedule", count:summary?.critical||0 },
          { label:"Inventory",      icon:"📦", path:"/supply-chain/inventory-alerts", count:summary?.high||0 },
          { label:"Operations",     icon:"⚙️", path:"/operations/work-orders", count:summary?.medium||0 },
        ].map((item: any) => (
          <button key={item.label} onClick={() => router.push(item.path)}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-1)]">{item.count}</p>
            <p className="text-xs text-gray-400 mt-1">signals detected</p>
          </button>
        ))}
      </div>
    </div>
  );
}


export default function AISignalsPage(props: any) {
  return (
    <FeatureGate feature="ai_assistant">
      <AISignalsPageInner {...props} />
    </FeatureGate>
  );
}
