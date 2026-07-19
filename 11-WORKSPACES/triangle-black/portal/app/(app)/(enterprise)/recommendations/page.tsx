"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Brain, RefreshCw, Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

const AI = "http://localhost:8001/api/v1/ai";
const TB = "http://localhost:8030/api/v1";

const SEVERITY_META = {
  success: { color: "#16a34a", bg: "#dcfce7", border: "#86efac", icon: <CheckCircle className="w-4 h-4" /> },
  warning: { color: "#d97706", bg: "#fef9c3", border: "#fde047", icon: <AlertTriangle className="w-4 h-4" /> },
  info:    { color: "#2563eb", bg: "#dbeafe", border: "#93c5fd", icon: <Info className="w-4 h-4" /> },
  critical:{ color: "#dc2626", bg: "#fee2e2", border: "#fca5a5", icon: <AlertTriangle className="w-4 h-4" /> },
};

type Severity = keyof typeof SEVERITY_META;

interface AIRecommendation {
  title: string;
  detail: string;
  severity: Severity;
  action: string;
  href: string;
}

const STATIC_RECS: AIRecommendation[] = [
  {
    title: "Customer to Contract Review",
    detail: "When customer health or financial realization requires delivery context, move from customer relationship review into Contract 360.",
    severity: "success",
    action: "Open Contract 360",
    href: "/contracts",
  },
  {
    title: "Contract to Execution Review",
    detail: "When contract fulfillment must be validated against field execution, move from Contract 360 into Work Order 360.",
    severity: "warning",
    action: "Open Work Orders",
    href: "/work-orders",
  },
  {
    title: "Execution to Supplier Review",
    detail: "When field delivery appears dependent on inventory or supplier support, escalate from Work Order into Vendor 360.",
    severity: "warning",
    action: "Open Suppliers",
    href: "/inventory/warehouses",
  },
  {
    title: "Executive Escalation Needed",
    detail: "When vendor exposure or spend risk escalates beyond operational scope, move into Executive Command.",
    severity: "info",
    action: "Executive Dashboard",
    href: "/executive",
  },
];

export default function RecommendationsPage() {
  const [pmInsight,   setPmInsight]   = useState("");
  const [ceoInsight,  setCeoInsight]  = useState("");
  const [loadingPm,   setLoadingPm]   = useState(false);
  const [loadingCeo,  setLoadingCeo]  = useState(false);
  const [activeRec,   setActiveRec]   = useState<string | null>(null);

  const { data: leads }      = useQuery({ queryKey: ["recs-leads"],   queryFn: () => fetch(`${TB}/leads/`).then(r => r.json()), retry: 1 });
  const { data: workOrders } = useQuery({ queryKey: ["recs-wos"],     queryFn: () => fetch(`${TB}/work-orders/`).then(r => r.json()), retry: 1 });
  const { data: analytics }  = useQuery({ queryKey: ["recs-ai"],      queryFn: () => fetch(`${AI}/analytics/summary`).then(r => r.json()), retry: 1 });

  const leadArr = Array.isArray(leads)      ? leads      : [];
  const woArr   = Array.isArray(workOrders) ? workOrders : [];

  const streamInsight = async (agent: string, msg: string, setter: (s: string) => void, loader: (b: boolean) => void) => {
    loader(true); setter("");
    try {
      const resp = await fetch(`${AI}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, agent, stream: true, model: "qwen2.5-coder:7b" }),
      });
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.token && !d.done) { full += d.token; setter(full); }
          } catch {}
        }
      }
    } catch (e) { setter(`Error: ${e}`); }
    loader(false);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Enterprise Decision Support</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">AI Recommendations</h1>
        <p className="mt-3 text-base text-slate-600">
          RAG-grounded recommendations from CEO and PM agents based on real Triangle Black data.
          Use this workspace to review cross-object recommendations and move into next best action.
        </p>
      </div>

      {/* Live Data Context */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Leads",  value: leadArr.length,   color: "#3b82f6" },
          { label: "Work Orders",  value: woArr.length,     color: "#8b5cf6" },
          { label: "AI Tasks",     value: (analytics as any)?.total_tasks     ?? 0, color: "#16a34a" },
          { label: "AI Agents",    value: (analytics as any)?.active_agents   ?? 0, color: "#d97706" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        {/* Static Workflow Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <div className="font-semibold text-slate-900">Enterprise Recommendations</div>
          </div>
          <div className="space-y-3">
            {STATIC_RECS.map((rec) => {
              const meta = SEVERITY_META[rec.severity];
              const isActive = activeRec === rec.title;
              return (
                <div key={rec.title}
                  onClick={() => setActiveRec(isActive ? null : rec.title)}
                  className="p-4 rounded-xl border cursor-pointer transition-all"
                  style={{
                    background: isActive ? meta.bg : "#f8fafc",
                    borderColor: isActive ? meta.border : "#e2e8f0",
                  }}>
                  <div className="flex items-start gap-3">
                    <span style={{ color: meta.color, marginTop: 2 }}>{meta.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900">{rec.title}</div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.detail}</div>
                      {isActive && (
                        <Link href={rec.href}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-bold"
                          style={{ color: meta.color }}>
                          {rec.action} <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PM Agent Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-5 h-5 text-purple-500" />
            <div className="font-semibold text-slate-900">PM Agent Recommendations</div>
            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
              ICE Scoring
            </span>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { label: "Product Priorities",  msg: `Triangle Black has ${leadArr.length} leads (${woArr.length} work orders). Using ICE scoring, what are our top 3 product priorities this quarter?` },
              { label: "Feature Roadmap",      msg: `What features should Triangle Black build next to grow in the Egypt hotel engineering market?` },
              { label: "User Journey Gaps",   msg: `What are the main friction points in the lead-to-work-order journey for hotel engineering companies in Egypt?` },
            ].map(q => (
              <button key={q.label} onClick={() => streamInsight("pm", q.msg, setPmInsight, setLoadingPm)}
                disabled={loadingPm}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300
                           hover:bg-purple-50 text-xs text-slate-700 font-medium transition-all
                           disabled:opacity-50">
                📋 {q.label}
              </button>
            ))}
          </div>
          {(pmInsight || loadingPm) && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span>📋</span>
                <span className="font-semibold text-purple-700 text-xs">PM Agent</span>
                {loadingPm && <RefreshCw className="w-3 h-3 text-purple-500 animate-spin ml-auto" />}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {pmInsight || "Thinking…"}
                {loadingPm && <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm" />}
              </p>
            </div>
          )}
        </div>

        {/* CEO Strategic Insights */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">👔</span>
            <div className="font-semibold text-slate-900">CEO Agent — Strategic Direction</div>
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
              RAG + Egypt Market Context
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Q3 Strategy",         msg: `As CEO of Triangle Black Egypt hotel engineering SaaS with ${leadArr.length} leads and ${woArr.length} work orders, what is our Q3 strategic priority?` },
              { label: "Competitive Moat",    msg: `What is Triangle Black's strongest competitive advantage in Egypt's hotel engineering services market?` },
              { label: "Scale to 10x",        msg: `We have ${leadArr.length} leads. What do we need to do to get to 30+ leads monthly in Egypt?` },
              { label: "Risk Mitigation",     msg: `What are the top 3 business risks for Triangle Black and how should we mitigate them?` },
              { label: "AI Investment ROI",   msg: `We invested in AI Company OS for Triangle Black. What is the expected ROI and how do we measure it?` },
              { label: "Next Hire Priority",  msg: `Triangle Black has ${(analytics as any)?.active_agents ?? 9} active AI agents and ${leadArr.length} leads. What role should we hire next?` },
            ].map(q => (
              <button key={q.label} onClick={() => streamInsight("ceo", q.msg, setCeoInsight, setLoadingCeo)}
                disabled={loadingCeo}
                className="p-3 rounded-xl border border-slate-200 hover:border-amber-300
                           hover:bg-amber-50 text-xs text-slate-700 font-medium transition-all text-left
                           disabled:opacity-50">
                👔 {q.label}
              </button>
            ))}
          </div>
          {(ceoInsight || loadingCeo) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👔</span>
                <span className="font-semibold text-amber-700">CEO Agent Strategic Response</span>
                {loadingCeo && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin ml-auto" />}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {ceoInsight || "Thinking…"}
                {loadingCeo && <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse rounded-sm" />}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
