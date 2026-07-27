"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR = {
  pending:"#FBBF24", submitted:"#60A5FA", approved:"#34D399", rejected:"#F87171", cancelled:"#94A3B8"
};
const URGENCY_COLOR = { urgent:"#F87171", high:"#FB923C", normal:"#94A3B8", low:"rgba(148,163,184,0.4)" };

const prFields = [
  {key:"title",         label:"Title",         type:"text",     required:true,  placeholder:"e.g. HVAC Filters Restock"},
  {key:"justification", label:"Justification", type:"textarea", required:false, placeholder:"Why is this purchase needed?"},
  {key:"department",    label:"Department",    type:"select",   required:true,  defaultValue:"Engineering", options:[{label:"Engineering",value:"Engineering"},{label:"Operations",value:"Operations"},{label:"Maintenance",value:"Maintenance"},{label:"Administration",value:"Administration"}]},
  {key:"urgency",       label:"Urgency",       type:"select",   required:true,  defaultValue:"normal", options:[{label:"Urgent",value:"urgent"},{label:"High",value:"high"},{label:"Normal",value:"normal"},{label:"Low",value:"low"}]},
  {key:"required_date", label:"Required By",   type:"date",     required:false},
];

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const [search,      setSearch]      = useState("");
  const [statusF,     setStatusF]     = useState("all");
  const [urgencyF,    setUrgencyF]    = useState("all");
  const [showCreate,  setShowCreate]  = useState(false);

  const { data: raw, isLoading } = useQuery(
    ["pr-list"], () => authFetch("/api/v1/purchase-requests-portal").then(r=>r.json())
  );
  const prs = toArr(raw);

  const pending   = prs.filter(p=>p.status==="pending"||p.status==="submitted");
  const approved  = prs.filter(p=>p.status==="approved");
  const urgent    = prs.filter(p=>p.urgency==="urgent");
  const autoPRs   = prs.filter(p=>p.title?.startsWith("Auto-PR:"));

  const filtered = prs.filter(p => {
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase())||p.pr_number?.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||p.status===statusF) && (urgencyF==="all"||p.urgency===urgencyF);
  });

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Purchase Request" icon="🛒"
        endpoint="/api/v1/purchase-requests-portal" fields={prFields} invalidateKeys={["pr-list"]}
        successPath="/supply-chain/purchase-requests/"/>

      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #161208 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-yellow-500 mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Purchase Requests</h1>
              <p className="tb-hero-description">{prs.length} total · {pending.length} pending · {urgent.length} urgent · {autoPRs.length} auto-generated</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>router.push("/workflows/launcher")} className="tb-hero-btn tb-hero-btn--glass">⚡ Auto-PR</button>
              <button onClick={()=>setShowCreate(true)} className="tb-hero-btn tb-hero-btn--primary">+ New PR</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              {label:"Pending",   value:pending.length,  color:pending.length>0?"#FBBF24":"#94A3B8", f:"pending",   sub:"awaiting"},
              {label:"Approved",  value:approved.length, color:"#34D399",                             f:"approved",  sub:"approved"},
              {label:"Urgent",    value:urgent.length,   color:urgent.length>0?"#F87171":"#94A3B8",  f:"all",       sub:"priority"},
              {label:"Auto-PR",   value:autoPRs.length,  color:"#A78BFA",                             f:"all",       sub:"system"},
              {label:"Total",     value:prs.length,      color:"rgba(148,163,184,0.9)",               f:"all",       sub:"all time"},
            ].map((k,i)=>{
              const act=statusF===k.f&&(i<2||(i>=2&&statusF==="all"));
              return (
                <button key={i} onClick={()=>setStatusF(act&&i<2?"all":k.f)}
                  className="tb-hero-kpi"
                  style={{background:act&&i<2?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                  <div className="tb-hero-kpi-label">{k.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {urgent.length > 0 && (
          <div className="tb-ai-insight" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)"}}>
            <div className="tb-ai-insight-icon" style={{background:"rgba(239,68,68,0.15)"}}>🚨</div>
            <div className="tb-ai-insight-text" style={{color:"#FCA5A5"}}>
              {urgent.length} Urgent Purchase Request{urgent.length>1?"s":""} Need Immediate Approval — {urgent.slice(0,2).map(p=>p.title).join(" · ")}
            </div>
            <button onClick={()=>setUrgencyF("urgent")} className="tb-ai-insight-action" style={{color:"#F87171",borderColor:"rgba(239,68,68,0.3)"}}>
              Show Urgent
            </button>
          </div>
        )}

        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search purchase requests..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <div className="tb-flex-gap-2">
            {["all","pending","submitted","approved","rejected"].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-pill ${statusF===s?"tb-pill--active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <select value={urgencyF} onChange={e=>setUrgencyF(e.target.value)} className="tb-pill" style={{cursor:"pointer"}}>
            <option value="all">All Urgency</option>
            {["urgent","high","normal","low"].map(u=><option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
          </select>
          {(search||statusF!=="all"||urgencyF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");setUrgencyF("all");}} className="tb-pill">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} requests</span>
        </div>

        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🛒</div>
              <div className="tb-empty-title">No purchase requests found</div>
              <div className="tb-empty-desc">Run automation to auto-generate PRs for low stock</div>
              <button onClick={()=>router.push("/workflows/launcher")} className="tb-hero-btn tb-hero-btn--primary mt-4">⚡ Run Automation</button>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 120px 100px 100px 110px 100px"}}>
                {["Request","PR Number","Status","Urgency","Department","Required By"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((pr,i)=>{
                const sc = STATUS_COLOR[pr.status]||"#94A3B8";
                const uc = URGENCY_COLOR[pr.urgency]||"rgba(148,163,184,0.4)";
                return (
                  <button key={i} onClick={()=>router.push(`/supply-chain/purchase-requests/${pr.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"1fr 120px 100px 100px 110px 100px"}}>
                    <div className="min-w-0 pr-4">
                      <div className="text-sm font-semibold text-primary truncate">{pr.title||pr.pr_number}</div>
                      <div className="text-xs text-tertiary mt-0.5">{pr.requester||"—"}</div>
                    </div>
                    <div className="text-center text-xs font-mono text-secondary">{pr.pr_number||"—"}</div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{pr.status||"—"}</span>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${uc}18`,color:uc,border:`1px solid ${uc}30`,fontSize:"0.625rem"}}>{pr.urgency||"—"}</span>
                    </div>
                    <div className="text-center text-xs text-secondary">{pr.department||"—"}</div>
                    <div className="text-center text-xs text-secondary">{fmtDate(pr.required_date)}</div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
