"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR  = {pending:"#B07A2A",submitted:"#5B7C8C",approved:"#547C4D",rejected:"#A84A3D",cancelled:"#6D5F53"};
const URGENCY_COLOR = {urgent:"#A84A3D",high:"#B07A2A",normal:"#6D5F53",low:"rgba(148,163,184,0.4)"};

const prFields = [
  {key:"title",         label:"Title",         type:"text",     required:true,  placeholder:"e.g. HVAC Filters Restock"},
  {key:"justification", label:"Justification", type:"textarea", required:false, placeholder:"Why is this purchase needed?"},
  {key:"department",    label:"Department",    type:"select",   required:true,  defaultValue:"Engineering", options:[{label:"Engineering",value:"Engineering"},{label:"Operations",value:"Operations"},{label:"Maintenance",value:"Maintenance"},{label:"Administration",value:"Administration"}]},
  {key:"urgency",       label:"Urgency",       type:"select",   required:true,  defaultValue:"normal", options:[{label:"Urgent",value:"urgent"},{label:"High",value:"high"},{label:"Normal",value:"normal"},{label:"Low",value:"low"}]},
  {key:"required_date", label:"Required By",   type:"date",     required:false},
];

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("all");
  const [urgencyF,   setUrgencyF]   = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: raw, isLoading } = useQuery(
    ["pr-list"], () => authFetch("/api/v1/purchase-requests-portal").then(r=>r.json())
  );
  const prs = toArr(raw);

  const pending  = prs.filter(p=>p.status==="pending"||p.status==="submitted");
  const approved = prs.filter(p=>p.status==="approved");
  const urgent   = prs.filter(p=>p.urgency==="urgent");
  const autoPRs  = prs.filter(p=>p.title?.startsWith("Auto-PR:"));

  const filtered = prs.filter(p => {
    const ms = !search||p.title?.toLowerCase().includes(search.toLowerCase())||p.pr_number?.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||p.status===statusF) && (urgencyF==="all"||p.urgency===urgencyF);
  });

  if (isLoading) return <div className="tb-canvas"><div className="tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Purchase Request" icon="🛒"
        endpoint="/api/v1/purchase-requests-portal" fields={prFields} invalidateKeys={["pr-list"]}
        successPath="/supply-chain/purchase-requests/"/>

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Purchase Requests</h1>
              <p className="tb-hero-description">{prs.length} total · {pending.length} pending · {urgent.length} urgent · {autoPRs.length} auto-generated</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>router.push("/workflows/launcher")} className="tb-btn tb-btn-secondary">⚡ Auto-PR</button>
              <button onClick={()=>setShowCreate(true)} className="tb-btn tb-btn-primary">+ New PR</button>
            </div>
          </div>
          <div className="mt-6" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
            {[
              {label:"Pending",  value:pending.length,  color:pending.length>0?"var(--color-warning)":"var(--color-text-3)",  f:"pending"},
              {label:"Approved", value:approved.length, color:"var(--color-success)",                                          f:"approved"},
              {label:"Urgent",   value:urgent.length,   color:urgent.length>0?"var(--color-danger)":"var(--color-text-3)",    f:"all"},
              {label:"Auto-PR",  value:autoPRs.length,  color:"var(--color-brand)",                                            f:"all"},
              {label:"Total",    value:prs.length,      color:"var(--color-text-2)",                                           f:"all"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>setStatusF(k.f)} className="tb-hero-kpi cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {urgent.length > 0 && (
          <div className="tb-alert tb-alert-danger mb-4">
            <span className="text-xl">🚨</span>
            <div className="flex-1 text-sm font-bold">
              {urgent.length} Urgent Purchase Request{urgent.length>1?"s":""} Need Immediate Approval — {urgent.slice(0,2).map(p=>p.title).join(" · ")}
            </div>
            <button onClick={()=>setUrgencyF("urgent")} className="tb-btn tb-btn-danger tb-btn-sm ml-auto">Show Urgent</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search purchase requests..."
            className="tb-input" style={{maxWidth:"320px"}}/>
          <div className="tb-tabs border-0 mb-0">
            {["all","pending","submitted","approved","rejected"].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-tab ${statusF===s?"active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <select value={urgencyF} onChange={e=>setUrgencyF(e.target.value)} className="tb-select" style={{width:"auto"}}>
            <option value="all">All Urgency</option>
            {["urgent","high","normal","low"].map(u=><option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
          </select>
          {(search||statusF!=="all"||urgencyF!=="all")&&<button onClick={()=>{setSearch("");setStatusF("all");setUrgencyF("all");}} className="tb-btn tb-btn-ghost tb-btn-sm">Clear ×</button>}
          <span className="text-xs text-tertiary ml-auto">{filtered.length} requests</span>
        </div>

        <div className="tb-section">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🛒</div>
              <div className="tb-empty-title">No purchase requests found</div>
              <div className="tb-empty-desc">Run automation to auto-generate PRs for low stock</div>
              <button onClick={()=>router.push("/workflows/launcher")} className="tb-btn tb-btn-primary mt-4">⚡ Run Automation</button>
            </div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th style={{textAlign:"center"}}>PR Number</th>
                    <th style={{textAlign:"center"}}>Status</th>
                    <th style={{textAlign:"center"}}>Urgency</th>
                    <th style={{textAlign:"center"}}>Department</th>
                    <th style={{textAlign:"center"}}>Required By</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pr,i)=>{
                    const sc = STATUS_COLOR[pr.status]||"#6D5F53";
                    const uc = URGENCY_COLOR[pr.urgency]||"rgba(148,163,184,0.4)";
                    return (
                      <tr key={i} onClick={()=>router.push(`/supply-chain/purchase-requests/${pr.id}`)} className="cursor-pointer">
                        <td>
                          <div className="text-sm font-semibold text-primary truncate">{pr.title||pr.pr_number}</div>
                          <div className="text-xs text-tertiary mt-0.5">{pr.requester||"—"}</div>
                        </td>
                        <td className="text-center text-xs font-mono text-secondary">{pr.pr_number||"—"}</td>
                        <td className="text-center">
                          <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{pr.status||"—"}</span>
                        </td>
                        <td className="text-center">
                          <span className="tb-badge" style={{background:`${uc}18`,color:uc,border:`1px solid ${uc}30`,fontSize:"0.625rem"}}>{pr.urgency||"—"}</span>
                        </td>
                        <td className="text-center text-xs text-secondary">{pr.department||"—"}</td>
                        <td className="text-center text-xs text-secondary">{fmtDate(pr.required_date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
