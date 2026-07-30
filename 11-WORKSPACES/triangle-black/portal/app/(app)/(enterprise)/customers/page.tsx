"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function CustomersPage() {
  const router = useRouter();
  const { data: contRaw } = useQuery(["cust-conts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: leadRaw } = useQuery(["cust-leads"], () => authFetch("/api/v1/leads-portal").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["cust-inv"],   () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const contracts = toArr(contRaw); const leads = toArr(leadRaw); const inv = toArr(invRaw);
  const clients = [...new Set(contracts.map(c=>c.client_name).filter(Boolean))];
  const activeContracts = contracts.filter(c=>c.status==="active");
  const revenue = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0F28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Commercial</div>
          <h1 className="tb-hero-title">Customers</h1>
          <p className="tb-hero-description">{clients.length} clients · {activeContracts.length} active contracts · {fmtEGP(revenue)} collected</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Clients",value:clients.length,color:"#221D1A"},{label:"Active Contracts",value:activeContracts.length,color:"#547C4D"},{label:"Total Leads",value:leads.length,color:"#5B7C8C"},{label:"Revenue",value:fmtEGP(revenue),color:"#B07A2A"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"0.9rem"}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Client List</div>
          <div className="tb-grid-3">
            {clients.slice(0,9).map((client,i)=>{
              const clientContracts = contracts.filter(c=>c.client_name===client&&c.status==="active");
              const clientRevenue = inv.filter(inv_i=>inv_i.status==="paid").reduce((s,inv_i)=>s+Number(inv_i.total_amount||0),0);
              return (
                <button key={i} onClick={()=>router.push("/commercial/contracts")} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-base-alt flex items-center justify-center text-sm font-black text-secondary mb-3">{client.charAt(0).toUpperCase()}</div>
                  <div className="text-sm font-bold text-primary mb-1 truncate">{client}</div>
                  <div className="text-xs text-tertiary">{clientContracts.length} active contract{clientContracts.length!==1?"s":""}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Customer Modules</div>
          <div className="tb-grid-4">
            {[{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Leads",icon:"👤",path:"/commercial/leads"},{label:"Pipeline",icon:"📊",path:"/commercial/pipeline"},{label:"Invoices",icon:"💰",path:"/invoices"}].map((a,i)=>(
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
