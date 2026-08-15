"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];

export default function CustomerSuccessPage() {
  const router = useRouter();
  const { data: slaDash }   = useQuery(["cs-sla"],       ()=>authFetch("/api/v1/sla/dashboard").then(r=>r.json()),    {staleTime:60000});
  const { data: contracts } = useQuery(["cs-contracts"], ()=>authFetch("/api/v1/contracts/").then(r=>r.json()),       {staleTime:60000});

  const siteSla = slaDash?.site_sla || [];
  const cl      = toArr(contracts);
  const active  = cl.filter(c=>c.status==="active");

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Customers</div>
          <h1 className="tb-hero-title">Customer Success</h1>
          <p className="tb-hero-description">Client satisfaction, SLA performance, and contract health</p>
          <div className="tb-grid-3 mt-6">
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{siteSla.length}</div><div className="tb-hero-kpi-label">Client Sites</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-success">{active.length}</div><div className="tb-hero-kpi-label">Active Contracts</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-brand">{siteSla.filter(s=>s.sla_grade==="A").length}</div><div className="tb-hero-kpi-label">Grade A Sites</div></div>
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2">
          <div className="tb-section">
            <div className="tb-section-title">SLA by Client Site</div>
            {siteSla.length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-icon">📊</div><div className="tb-empty-desc">No SLA data available</div></div>
            ) : siteSla.map((s,i)=>{
              const gc = s.sla_grade==="A"?"#547C4D":s.sla_grade==="B"?"#5B7C8C":s.sla_grade==="C"?"#B07A2A":"#A84A3D";
              return (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-divider">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{background:`${gc}15`,border:`1px solid ${gc}30`,color:gc}}>
                    {s.sla_grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">{s.site_name}</div>
                    <div className="text-xs text-tertiary">{s.resolved}/{s.total_requests} resolved · Score: {s.sla_score}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tb-section">
            <div className="tb-section-title">Active Contracts</div>
            {active.length === 0 ? (
              <div className="tb-empty"><div className="tb-empty-desc">No active contracts</div></div>
            ) : active.map((c,i)=>(
              <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)}
                className="flex justify-between items-center py-3 border-b border-divider w-full text-left bg-transparent border-0 cursor-pointer">
                <span className="text-sm font-semibold text-primary truncate flex-1 pr-3">{c.title}</span>
                <span className="tb-badge tb-badge-success text-xs font-bold flex-shrink-0">Active</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
