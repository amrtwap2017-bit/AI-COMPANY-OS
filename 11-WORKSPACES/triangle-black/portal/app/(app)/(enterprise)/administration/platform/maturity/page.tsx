// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, AlertCircle, TrendingUp, Target, Star, Award } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const MATURITY_BENCHMARKS = [
  {
    category: "Platform Foundation",
    items: [
      { name: "Multi-tenant Architecture",    status: "complete",  score: 10 },
      { name: "Authentication + RBAC",        status: "complete",  score: 10 },
      { name: "Enterprise Design System",     status: "complete",  score: 10 },
      { name: "Build Guard + CI",             status: "complete",  score: 10 },
      { name: "Progressive Web App",          status: "complete",  score: 8  },
    ],
  },
  {
    category: "Operational Intelligence",
    items: [
      { name: "AI Signals Engine (v2)",       status: "complete",  score: 10 },
      { name: "Predictive Maintenance AI",    status: "complete",  score: 9  },
      { name: "Digital Twin (8 domains)",     status: "complete",  score: 8  },
      { name: "Knowledge Graph (Qdrant)",     status: "complete",  score: 7  },
      { name: "AI Scheduling Engine",         status: "complete",  score: 9  },
    ],
  },
  {
    category: "Workflow Automation",
    items: [
      { name: "WO State Machine (7 states)",  status: "complete",  score: 10 },
      { name: "Project Phase Transitions",    status: "complete",  score: 9  },
      { name: "PR Approval Workflow",         status: "complete",  score: 9  },
      { name: "Bulk Operations Engine",       status: "complete",  score: 8  },
      { name: "Background Scheduler",         status: "partial",   score: 6  },
    ],
  },
  {
    category: "Financial Intelligence",
    items: [
      { name: "Cash Flow Engine (EGP)",       status: "complete",  score: 9  },
      { name: "Invoice Payment Tracking",     status: "complete",  score: 9  },
      { name: "Earned Value Analysis",        status: "complete",  score: 8  },
      { name: "Executive KPI Scorecard",      status: "complete",  score: 9  },
      { name: "Cost + Margin Tracking",       status: "complete",  score: 9  },
    ],
  },
  {
    category: "Customer & Supplier",
    items: [
      { name: "NPS + Renewal Engine",         status: "complete",  score: 9  },
      { name: "Warranty Management",          status: "complete",  score: 8  },
      { name: "Supplier Portal (RFQ+Quote)",  status: "complete",  score: 7  },
      { name: "Contract Renewal (1-click)",   status: "complete",  score: 9  },
      { name: "At-Risk Client Detection",     status: "complete",  score: 8  },
    ],
  },
  {
    category: "Enterprise UX",
    items: [
      { name: "175+ Pages (0 placeholders)",  status: "complete",  score: 10 },
      { name: "15 Entity Detail Pages",       status: "complete",  score: 10 },
      { name: "Global Search (8 entities)",   status: "complete",  score: 9  },
      { name: "Command Palette (/ key)",      status: "complete",  score: 8  },
      { name: "Dashboard Personalization",    status: "complete",  score: 7  },
    ],
  },
  {
    category: "Production Readiness",
    items: [
      { name: "CORS Restricted Origins",      status: "complete",  score: 9  },
      { name: "Rate Limiting (120 req/min)",  status: "complete",  score: 8  },
      { name: "Multi-tenant Middleware",      status: "complete",  score: 8  },
      { name: "Performance Audit API",        status: "complete",  score: 7  },
      { name: "Email Alert System",           status: "partial",   score: 5  },
    ],
  },
];

const ENTERPRISE_BENCHMARKS = [
  { name: "Microsoft Dynamics 365",    score: 95, color: "bg-blue-500" },
  { name: "ServiceNow",               score: 92, color: "bg-green-500" },
  { name: "IBM Maximo",               score: 88, color: "bg-red-500" },
  { name: "SAP Field Service",        score: 90, color: "bg-amber-500" },
  { name: "Triangle Black (Sprint 86)", score: 0,  color: "bg-slate-800" },
];

export default function PlatformMaturityPage() {
  const { data: version = {} } = useQuery({
    queryKey: ["maturity-version"],
    queryFn: () => authFetch("/api/v1/version").then(r => r.json()),
  });

  const { data: routes = {} } = useQuery({
    queryKey: ["maturity-routes"],
    queryFn: () => authFetch("/api/v1/health/detailed").then(r => r.json()),
  });

  // Calculate maturity scores
  const allItems = MATURITY_BENCHMARKS.flatMap(cat => cat.items);
  const totalScore  = toArr(allItems).reduce((s: any, i: any) => s + i.score, 0);
  const maxScore    = (allItems || []).length * 10;
  const maturityPct = Math.round(totalScore / maxScore * 100);

  const completeCount = toArr(allItems).filter(i => i.status === "complete").length;
  const partialCount  = toArr(allItems).filter(i => i.status === "partial").length;

  // Update Triangle Black benchmark
  ENTERPRISE_BENCHMARKS[4].score = maturityPct;

  const maxBenchmark = Math.max((...ENTERPRISE_BENCHMARKS || []).map(b  => b.score));

  return (
    <PageWrapper>
      <PageHeader
        title="Platform Maturity Report"
        subtitle={`Sprint ${version.sprint ?? 86} · Enterprise Operations Platform Assessment`}
        badge={`${maturityPct}% Maturity`}
      />

      {/* Overall score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
        <div className="lg:col-span-1 bg-white border-2 border-slate-200 rounded-2xl p-6 text-center">
          <Award className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <div className="text-5xl font-bold text-slate-800">{maturityPct}</div>
          <div className="text-slate-500 text-sm mt-1">/ 100 Maturity Score</div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${maturityPct >= 80 ? "bg-emerald-500" : maturityPct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${maturityPct}%` }}
            />
          </div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          {[
            { label: "Total Features",    value: (allItems || []).length,   icon: Target,     color: "text-slate-700" },
            { label: "Complete",          value: completeCount,     icon: CheckCircle, color: "text-emerald-600" },
            { label: "Partial / WIP",     value: partialCount,      icon: AlertCircle, color: "text-amber-600" },
            { label: "Backend Routes",    value: `200+`,            icon: TrendingUp, color: "text-blue-600" },
            { label: "Frontend Pages",    value: `175+`,            icon: Star,       color: "text-purple-600" },
            { label: "Programs Live",     value: "14/14",           icon: Award,      color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise benchmark comparison */}
      <SectionCard title="Benchmark vs Enterprise Platforms" className="mb-6">
        <div className="space-y-3">
          {toArr(ENTERPRISE_BENCHMARKS).map(b  => (
            <div key={b.name} className="flex items-center gap-4">
              <div className="w-48 text-sm font-medium text-slate-700 flex-shrink-0">{b.name}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-5 relative">
                <div
                  className={`${b.color} h-5 rounded-full flex items-center justify-end pr-2`}
                  style={{ width: `${Math.round(b.score / maxBenchmark * 100)}%` }}
                >
                  <span className="text-xs font-bold text-white">{b.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          * Triangle Black score based on feature completeness across 35 enterprise capabilities.
          Enterprise scores are estimated public benchmarks.
        </p>
      </SectionCard>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {toArr(MATURITY_BENCHMARKS).map(cat  => {
          const catScore = (Array.isArray(cat.items) ? cat.items : []).reduce((s: any, i: any) => s + i.score, 0);
          const catMax   = (cat.items || []).length * 10;
          const catPct   = Math.round(catScore / catMax * 100);
          return (
            <SectionCard key={cat.category} title={`${cat.category} — ${catPct}%`}>
              <div className="mb-3 w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${catPct >= 80 ? "bg-emerald-500" : catPct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${catPct}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {(Array.isArray(cat.items) ? cat.items : []).map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.status === "complete"
                        ? <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        : <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      <span className="text-xs text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{item.score}/10</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </PageWrapper>
  );
}
