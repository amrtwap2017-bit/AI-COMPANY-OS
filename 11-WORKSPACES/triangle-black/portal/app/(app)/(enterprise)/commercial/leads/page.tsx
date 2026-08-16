"use client";
// @ts-nocheck
import { ExportButton } from "@/components/ui/ExportButton";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { CreateModal } from "@/components/ui/CreateModal";
import { FeatureGate } from "@/components/ui/FeatureGate";

const toArr  = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate= (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR = {
  new:"#5B7C8C",qualified:"#8D7443",proposal:"#818CF8",
  negotiation:"#B07A2A",won:"#547C4D",lost:"#A84A3D"
};

const leadFields = [
  {key:"name",    label:"Full Name", type:"text",   required:true,  placeholder:"Ahmed Hassan"},
  {key:"company", label:"Company",   type:"text",   required:false, placeholder:"Cairo MEP Solutions"},
  {key:"email",   label:"Email",     type:"email",  required:false, placeholder:"ahmed@company.com"},
  {key:"phone",   label:"Phone",     type:"tel",    required:false, placeholder:"+20..."},
  {key:"source",  label:"Source",    type:"select", required:false, defaultValue:"manual", options:[{label:"Manual",value:"manual"},{label:"Referral",value:"referral"},{label:"Website",value:"website"},{label:"Exhibition",value:"exhibition"}]},
  {key:"priority",label:"Priority",  type:"select", required:false, defaultValue:"medium", options:[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low",value:"low"}]},
];

function LeadsPageInner() {
  const router = useRouter();
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: raw, isLoading } = useQuery(["leads-list"],()=>authFetch("/api/v1/leads-portal-v2").then(r=>r.json()));
  const leads = toArr(raw);

  const filtered = leads.filter(l=>{
    const ms = !search||l.name?.toLowerCase().includes(search.toLowerCase())||l.company?.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||l.status===statusF);
  });

  const stages    = ["new","qualified","proposal","negotiation","won","lost"];
  const hotLeads  = leads.filter(l=>(l.score||0)>=70&&l.status!=="won"&&l.status!=="lost");
  const wonLeads  = leads.filter(l=>l.status==="won");

  if (isLoading) return <div className="tb-canvas"><div className="tb-shimmer-block" style={{height:60}}/></div>;

  return (
    <div className="min-h-screen bg-base">
      <CreateModal open={showCreate} onClose={()=>setShowCreate(false)} title="Lead" icon="👤"
        endpoint="/api/v1/leads-portal-v2" fields={leadFields} invalidateKeys={["leads-list"]}
        successPath="/commercial/leads/"/>

      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Commercial</div>
              <h1 className="tb-hero-title">Lead Pipeline</h1>
              <p className="tb-hero-description">{leads.length} leads · {hotLeads.length} hot · {wonLeads.length} converted</p>
            </div>
            <button onClick={()=>setShowCreate(true)} className="tb-btn tb-btn-primary">+ New Lead</button>
          </div>
          <div className="mt-6" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
            {stages.map((s,i)=>{
              const count  = leads.filter(l=>l.status===s).length;
              const c      = STATUS_COLOR[s]||"rgba(148,163,184,0.8)";
              const active = statusF===s;
              return (
                <button key={i} onClick={()=>setStatusF(active?"all":s)} className="tb-hero-kpi cursor-pointer">
                  <div className="tb-hero-kpi-value" style={{color:c}}>{count}</div>
                  <div className="tb-hero-kpi-label capitalize">{s}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {hotLeads.length>0&&(
          <div className="tb-alert tb-alert-warning mb-4">
            <span className="text-xl">🔥</span>
            <div className="flex-1 text-sm font-bold">
              {hotLeads.length} hot lead{hotLeads.length>1?"s":""} with score ≥70 ready for conversion — {hotLeads.slice(0,2).map(l=>l.name).join(", ")}
            </div>
            <button onClick={()=>setStatusF("negotiation")} className="tb-btn tb-btn-secondary tb-btn-sm ml-auto">Focus →</button>
          </div>
        )}

        <div className="flex gap-2.5 flex-wrap items-center mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads by name or company..."
            className="tb-input" style={{maxWidth:"320px"}}/>
          <div className="tb-tabs border-0 mb-0">
            {["all",...stages].map(s=>(
              <button key={s} onClick={()=>setStatusF(s)} className={`tb-tab ${statusF===s?"active":""}`}>
                {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-xs text-tertiary ml-auto">{filtered.length} leads</span>
          <ExportButton data={toArr(raw)} filename="leads" title="Leads"/>
        </div>

        <div className="tb-section">
          {filtered.length===0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">👤</div>
              <div className="tb-empty-title">No leads found</div>
              <div className="tb-empty-desc">Add your first lead to start the pipeline</div>
              <button onClick={()=>setShowCreate(true)} className="tb-btn tb-btn-primary mt-4">+ Add Lead</button>
            </div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th style={{textAlign:"center"}}>Company</th>
                    <th style={{textAlign:"center"}}>Stage</th>
                    <th style={{textAlign:"center"}}>Score</th>
                    <th style={{textAlign:"center"}}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l,i)=>{
                    const score = Number(l.score||0);
                    const isHot = score>=70&&l.status!=="won"&&l.status!=="lost";
                    const sc    = STATUS_COLOR[l.status]||"rgba(148,163,184,0.8)";
                    return (
                      <tr key={i} onClick={()=>router.push(`/commercial/leads/${l.id}`)} className="cursor-pointer">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{background:sc}}/>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-primary truncate">{l.name}</div>
                                {isHot&&<span className="tb-badge tb-badge-danger" style={{fontSize:"0.5rem",padding:"1px 5px"}}>🔥 HOT</span>}
                              </div>
                              <div className="text-xs text-tertiary mt-0.5">{l.source||"—"} · {l.email||"—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center text-xs text-secondary truncate">{l.company||"—"}</td>
                        <td className="text-center">
                          <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.625rem"}}>{l.status||"—"}</span>
                        </td>
                        <td className="text-center">
                          <div className="text-base font-black" style={{color:score>=70?"#547C4D":score>=50?"#B07A2A":"#5B7C8C"}}>{score}</div>
                          <div className="tb-progress mt-1">
                            <div className="tb-progress-bar" style={{background:score>=70?"#547C4D":score>=50?"#B07A2A":"#5B7C8C",width:`${score}%`}}/>
                          </div>
                        </td>
                        <td className="text-center text-xs text-tertiary">{fmtDate(l.updated_at)}</td>
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


export default function LeadsPage(props: any) {
  return (
    <FeatureGate feature="commercial">
      <LeadsPageInner {...props} />
    </FeatureGate>
  );
}
