"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const STAGES = [{key:"new",label:"New",color:"#60A5FA"},{key:"qualified",label:"Qualified",color:"#A78BFA"},{key:"proposal",label:"Proposal",color:"#818CF8"},{key:"negotiation",label:"Negotiation",color:"#FBBF24"},{key:"won",label:"Won",color:"#34D399"},{key:"lost",label:"Lost",color:"#F87171"}];
export default function PipelinePage() {
  const router = useRouter();
  const { data: leadRaw } = useQuery(["pl-leads"], () => authFetch("/api/v1/leads-portal-v2").then(r=>r.json()));
  const { data: contRaw } = useQuery(["pl-conts"], () => authFetch("/api/v1/contracts-portal").then(r=>r.json()));
  const leads = toArr(leadRaw); const contracts = toArr(contRaw);
  const totalValue = leads.reduce((s,l)=>s+Number(l.estimated_value||l.value||0),0);
  const wonValue   = leads.filter(l=>l.status==="won").reduce((s,l)=>s+Number(l.estimated_value||l.value||0),0);
  const convRate   = leads.length>0?Math.round(leads.filter(l=>l.status==="won").length/leads.length*100):0;
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Commercial</div>
          <h1 className="tb-hero-title">Sales Pipeline</h1>
          <p className="tb-hero-description">{leads.length} leads · {fmtEGP(totalValue)} pipeline value</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Leads",value:leads.length,color:"#F1F5F9"},{label:"Pipeline Value",value:fmtEGP(totalValue),color:"#60A5FA"},{label:"Won Value",value:fmtEGP(wonValue),color:"#34D399"},{label:"Conv. Rate",value:convRate+"%",color:convRate>=20?"#34D399":"#FBBF24"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Pipeline Stages</div>
          <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
            {STAGES.map((stage,i)=>{
              const stageLeads = leads.filter(l=>l.status===stage.key);
              const stageVal = stageLeads.reduce((s,l)=>s+Number(l.estimated_value||l.value||0),0);
              return (
                <button key={i} onClick={()=>router.push("/commercial/leads")} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="text-2xl font-black mb-1" style={{color:stage.color}}>{stageLeads.length}</div>
                  <div className="text-xs font-semibold text-primary mb-1">{stage.label}</div>
                  {stageVal>0 && <div className="text-xs text-tertiary">{fmtEGP(stageVal)}</div>}
                  <div className="tb-progress mt-2"><div className="tb-progress-bar" style={{background:stage.color,width:leads.length>0?(stageLeads.length/leads.length*100)+"%":"0%"}}/></div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigation</div>
          <div className="tb-grid-4">
            {[{label:"All Leads",icon:"👤",path:"/commercial/leads"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Customers",icon:"🏢",path:"/customers"},{label:"Invoices",icon:"💰",path:"/invoices"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span><span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
