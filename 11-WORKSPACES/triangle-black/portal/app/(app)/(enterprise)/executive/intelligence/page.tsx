// @ts-nocheck
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { TrendingUp, Award, ArrowRight, RefreshCw, Brain } from "lucide-react";

const TB  = "http://localhost:8030/api/v1";
const AI  = "http://localhost:8001/api/v1/ai";

async function fetchJSON(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export default function ExecutiveIntelligencePage() {
  const [aiInsight,     setAiInsight]     = useState("");
  const [loadingInsight,setLoadingInsight]= useState(false);

  const { data: leads, isLoading: lL } = useQuery({
    queryKey: ["tb-leads"],
    queryFn: () => fetchJSON(`${TB}/leads/`),
    retry: 1,
  });
  const { data: workOrders, isLoading: wL } = useQuery({
    queryKey: ["tb-workorders"],
    queryFn: () => fetchJSON(`${TB}/work-orders/`),
    retry: 1,
  });
  const { data: technicians, isLoading: tL } = useQuery({
    queryKey: ["tb-technicians"],
    queryFn: () => fetchJSON(`${TB}/technicians/`),
    retry: 1,
  });
  const { data: analytics } = useQuery({
    queryKey: ["ai-analytics"],
    queryFn: () => fetchJSON(`${AI}/analytics/summary`),
    retry: 1,
  });

  const leadArr  = Array.isArray(leads)       ? leads       : [];
  const woArr    = Array.isArray(workOrders)  ? workOrders  : [];
  const techArr  = Array.isArray(technicians) ? technicians : [];

  const qualifiedLeads = leadArr.filter((l: any) => l.status === "qualified").length;
  const newLeads       = leadArr.filter((l: any) => l.status === "new").length;
  const completedWOs   = woArr.filter((w: any) => w.status === "completed" || w.status === "done").length;
  const pendingWOs     = woArr.filter((w: any) => w.status === "pending").length;
  const convRate       = leadArr.length > 0 ? Math.round(qualifiedLeads / leadArr.length * 100) : 0;
  const woRate         = woArr.length > 0 ? Math.round(completedWOs / woArr.length * 100) : 0;

  const askCEO = async (topic: string) => {
    setLoadingInsight(true);
    setAiInsight("");
    try {
      const resp = await fetch(`${AI}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: topic,
          agent: "ceo",
          stream: true,
          model: "qwen2.5-coder:7b",
        }),
      });
      const reader  = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.token && !d.done) { full += d.token; setAiInsight(full); }
          } catch {}
        }
      }
    } catch (e) { setAiInsight(`Error: ${e}`); }
    setLoadingInsight(false);
  };

  const STATUS_COLOR: Record<string,string> = {
    new:"#3b82f6", qualified:"#16a34a", negotiation:"#d97706",
    won:"#059669", lost:"#dc2626", pending:"#d97706",
    "in-progress":"#3b82f6", completed:"#16a34a",
  };

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n);

  const loading = lL || wL || tL;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Executive Center</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Business Intelligence</h1>
        <p className="mt-2 text-base text-slate-600">
          Real-time data from Triangle Black CRM · AI-powered strategic insights
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Leads",     value: leadArr.length,   color: "#3b82f6", icon: "👥" },
          { label: "Qualified",       value: qualifiedLeads,   color: "#16a34a", icon: "✅" },
          { label: "Conv. Rate",      value: `${convRate}%`,   color: "#d97706", icon: "📈" },
          { label: "Work Orders",     value: woArr.length,     color: "#8b5cf6", icon: "🔧" },
          { label: "WO Completion",   value: `${woRate}%`,     color: "#06b6d4", icon: "✔️" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Real Leads Pipeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-slate-900">📊 Leads Pipeline</div>
            <Link href="/leads" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : leadArr.length === 0 ? (
            <div className="text-slate-400 text-sm">No leads data available</div>
          ) : (
            <div className="space-y-3">
              {leadArr.map((lead: any) => (
                <div key={lead.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {lead.name || lead.company_name || `Lead #${lead.id}`}
                    </div>
                    <div className="text-xs text-slate-500">{lead.email || ""}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: (STATUS_COLOR[lead.status] ?? "#6366f1") + "20",
                      color: STATUS_COLOR[lead.status] ?? "#6366f1",
                    }}>
                    {lead.status ?? "new"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Work Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-slate-900">🔧 Work Orders</div>
            <Link href="/work-orders" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : woArr.length === 0 ? (
            <div className="text-slate-400 text-sm">No work orders</div>
          ) : (
            <div className="space-y-3">
              {woArr.map((wo: any) => (
                <div key={wo.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {wo.title || wo.description?.slice(0, 40) || `WO #${wo.id}`}
                    </div>
                    <div className="text-xs text-slate-500">{wo.service_type || wo.type || ""}</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: (STATUS_COLOR[wo.status] ?? "#d97706") + "20",
                      color: STATUS_COLOR[wo.status] ?? "#d97706",
                    }}>
                    {wo.status ?? "pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Technicians */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-slate-900">👷 Field Team</div>
            <Link href="/technicians" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading…</div>
          ) : techArr.length === 0 ? (
            <div className="text-slate-400 text-sm">No technicians data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 border-b border-slate-200">
                    <th className="pb-2 text-left">Technician</th>
                    <th className="pb-2 text-left">Specialty</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {techArr.map((tech: any) => (
                    <tr key={tech.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-900">👤 {tech.name}</td>
                      <td className="py-3 text-slate-600 text-xs">{tech.specialty || tech.role || "Field Tech"}</td>
                      <td className="py-3 text-right">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">
                          {tech.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CEO AI Insights Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <div className="font-semibold text-slate-900">CEO AI Strategic Insights</div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: "Lead Conversion Strategy",   msg: `We have ${leadArr.length} leads with ${convRate}% conversion. What should we prioritize this quarter?` },
              { label: "Work Order Efficiency",       msg: `We have ${woArr.length} work orders, ${completedWOs} completed (${woRate}%). How can we improve field efficiency?` },
              { label: "Growth Opportunities",        msg: `Triangle Black has ${qualifiedLeads} qualified leads and ${techArr.length} technicians. What are our top 3 growth opportunities?` },
              { label: "Risk Assessment",             msg: `With ${pendingWOs} pending work orders and ${newLeads} new leads, what are our main operational risks?` },
            ].map(q => (
              <button key={q.label}
                onClick={() => askCEO(q.msg)}
                disabled={loadingInsight}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300
                           hover:bg-purple-50 transition-all text-xs text-slate-700 font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed">
                🤖 {q.label}
              </button>
            ))}
          </div>

          {(aiInsight || loadingInsight) && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👔</span>
                <span className="font-semibold text-purple-700 text-xs">CEO Agent Response</span>
                {loadingInsight && (
                  <RefreshCw className="w-3 h-3 text-purple-500 animate-spin ml-auto" />
                )}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {aiInsight || "Thinking…"}
                {loadingInsight && (
                  <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm" />
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
