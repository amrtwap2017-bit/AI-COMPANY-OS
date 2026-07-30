"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR = {
  new:"#5B7C8C", qualified:"#8D7443", proposal:"#818CF8",
  negotiation:"#B07A2A", won:"#547C4D", lost:"#A84A3D"
};

const leadFields = [
  {key:"name",     label:"Full Name",  type:"text",   required:true,  placeholder:"Ahmed Hassan"},
  {key:"company",  label:"Company",    type:"text",   required:false, placeholder:"Cairo MEP Solutions"},
  {key:"email",    label:"Email",      type:"email",  required:false, placeholder:"ahmed@company.com"},
  {key:"phone",    label:"Phone",      type:"tel",    required:false, placeholder:"+20..."},
  {key:"source",   label:"Source",     type:"select", required:false, defaultValue:"manual", options:[{label:"Manual",value:"manual"},{label:"Referral",value:"referral"},{label:"Website",value:"website"},{label:"Exhibition",value:"exhibition"}]},
  {key:"priority", label:"Priority",   type:"select", required:false, defaultValue:"medium", options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}]},
];

export default function LeadsPage() {
  const router = useRouter();
  const [search,      setSearch]      = useState("");
  const [statusF,     setStatusF]     = useState("all");
  const [showCreate,  setShowCreate]  = useState(false);

  const { data: raw, isLoading } = useQuery(["leads-list"], () => authFetch("/api/v1/leads-portal-v2").then(r=>r.json()));
  const leads = toArr(raw);

  const filtered = leads.filter(l => {
    const ms = !search||l.name?.toLowerCase().includes(search.toLowerCase())||l.company?.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||l.status===statusF);
  });

  const stages = ["new","qualified","proposal","negotiation","won","lost"];
  const hotLeads = leads.filter(l=>(l.score||0)>=70&&l.status!=="won"&&l.status!=="lost");
  const wonLeads = leads.filter(l=>l.status==="won");

  if (isLoading) return <div className="tb-page"><div className="tb-section animate-pulse" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Lead" icon="👤"
        endpoint="/api/v1/leads-portal-v2" fields={leadFields} invalidateKeys={["leads-list"]}
        successPath="/commercial/leads/"/>

      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1520 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-amber-500 mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Lead Pipeline</h1>
              <p className="tb-hero-description">{leads.length} leads · {hotLeads.length} hot · {wonLeads.length} converted</p>
            </div>
            <button onClick={()=>setShowCreate(true)} className="tb-hero-btn tb-hero-btn--primary">+ New Lead</button>
          </div>

          {/* Pipeline strip */}
          <div className="tb-grid-6 mt-6">
            {stages.map((s,i)=>{
              const count = leads.filter(l=>l.status===s).length;
              const c = STATUS_COLOR[s]||"rgba(148,163,184,0.8)";
              const active = statusF===s;
              return (
                <button key={i} onClick={()=>setStatusF(active?"all":s)}
                  className="tb-hero-kpi"
                  style={{background:active?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${active?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}>
                  <div className="tb-hero-kpi-value" style={{color:c}}>{count}</div>
                  <div className="tb-hero-kpi-label capitalize">{s}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Hot leads alert */}
        {hotLeads.length > 0 && (
          <div className="tb-ai-insight">
            <div className="tb-ai-insight-icon">🔥</div>
            <div className="tb-ai-insight-text">
              {hotLeads.length} hot lead{hotLeads.length>1?"s":""} with score ≥70 ready for conversion — {hotLeads.slice(0,2).map(l=>l.name).join(", ")}
            </div>
            <button onClick={()=>setStatusF("negotiation")} className="tb-ai-insight-action">Focus →</button>
          </div>
        )}

        {/* Filters */}
        <div className="tb-flex-gap-3 flex-wrap">
          <div className="tb-search" style={{maxWidth:320}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads by name or company..."
              style={{background:"transparent",border:"none",outline:"none",flex:1,fontSize:"0.8125rem",color:"var(--color-text-1)"}}/>
          </div>
          <div className="tb-flex-gap-2">
            {["all",...stages].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)}
                className={`tb-pill ${statusF===s?"tb-pill--active":""}`}
                style={statusF===s&&s!=="all"?{borderColor:STATUS_COLOR[s],color:STATUS_COLOR[s],background:`${STATUS_COLOR[s]}18`}:{}}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-tertiary ml-auto">{filtered.length} leads</span>
          <ExportButton data={toArr(raw)} filename="leads" title="Leads"/>
        </div>

        {/* Table */}
        <div className="tb-table">
          {filtered.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">👤</div>
              <div className="tb-empty-title">No leads found</div>
              <div className="tb-empty-desc">Add your first lead to start the pipeline</div>
              <button onClick={()=>setShowCreate(true)} className="tb-hero-btn tb-hero-btn--primary mt-4">+ Add Lead</button>
            </div>
          ) : (
            <>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 140px 90px 80px 100px"}}>
                {["Lead","Company","Stage","Score","Updated"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {filtered.map((l,i)=>{
                const score   = Number(l.score||0);
                const isHot   = score>=70&&l.status!=="won"&&l.status!=="lost";
                const sc      = STATUS_COLOR[l.status]||"rgba(148,163,184,0.8)";
                return (
                  <button key={i} onClick={()=>router.push(`/commercial/leads/${l.id}`)}
                    className="tb-table-row"
                    style={{gridTemplateColumns:"1fr 140px 90px 80px 100px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:sc,height:32}}/>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-primary truncate">{l.name}</div>
                          {isHot&&<span className="tb-badge tb-badge--danger" style={{fontSize:"0.5rem",padding:"1px 5px"}}>🔥 HOT</span>}
                        </div>
                        <div className="text-xs text-tertiary mt-0.5">{l.source||"—"} · {l.email||"—"}</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-secondary truncate">{l.company||"—"}</div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{l.status||"—"}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-black" style={{color:score>=70?"#547C4D":score>=50?"#B07A2A":"#5B7C8C"}}>{score}</div>
                      <div className="tb-progress tb-progress--sm mt-1">
                        <div className="tb-progress-bar" style={{background:score>=70?"#547C4D":score>=50?"#B07A2A":"#5B7C8C",width:`${score}%`}}/>
                      </div>
                    </div>
                    <div className="text-center text-xs text-tertiary">{fmtDate(l.updated_at)}</div>
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
