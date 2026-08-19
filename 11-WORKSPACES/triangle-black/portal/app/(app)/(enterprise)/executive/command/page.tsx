"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function CommandPage() {
  const router = useRouter();
  const { data: twin } = useQuery(["cmd-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash } = useQuery(["cmd-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()),{refetchInterval:30000});
  const score = twin?.health_score||0;
  const d = dash||{};
  const commands = [
    {section:"Operations",items:[{label:"Dispatch Board",icon:"📋",path:"/operations/dispatch"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"},{label:"Service Requests",icon:"🎫",path:"/operations/service-requests"},{label:"Technicians",icon:"👷",path:"/operations/technicians"}]},
    {section:"Maintenance",items:[{label:"Asset Tree",icon:"🌳",path:"/maintenance/asset-tree"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"},{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"Inspection",icon:"🔍",path:"/maintenance"}]},
    {section:"Commercial",items:[{label:"Pipeline",icon:"📊",path:"/commercial/pipeline"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"},{label:"Leads",icon:"👤",path:"/commercial/leads"},{label:"Customers",icon:"🏢",path:"/customers"}]},
    {section:"Supply Chain",items:[{label:"Purchase Orders",icon:"📦",path:"/supply-chain/purchase-orders"},{label:"Inventory",icon:"📦",path:"/supply-chain/inventory"},{label:"Suppliers",icon:"🏭",path:"/supply-chain/suppliers"},{label:"Warehouses",icon:"🏗️",path:"/supply-chain/warehouses"}]},
    {section:"Finance",items:[{label:"Invoices",icon:"💰",path:"/invoices"},{label:"Cost Analysis",icon:"📈",path:"/analytics/costs"},{label:"Payment Track",icon:"✅",path:"/payment-tracking"},{label:"Contracts",icon:"📄",path:"/commercial/contracts"}]},
    {section:"Intelligence",items:[{label:"Executive Hub",icon:"🧠",path:"/executive"},{label:"Scorecard",icon:"🏆",path:"/executive/scorecard"},{label:"Predictive",icon:"🔮",path:"/executive/predictive"},{label:"Exceptions",icon:"🚨",path:"/executive/exceptions"}]},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-purple-400 mb-1.5">Executive</div>
              <h1 className="tb-hero-title">Command Center</h1>
              <p className="tb-hero-description">Quick access to all platform modules</p>
            </div>
            <div className={"tb-score-badge "+(score>=95?"tb-score-badge--success":"tb-score-badge--warning")}>
              <div className="tb-score-value" style={{color:score>=95?"#547C4D":"#B07A2A"}}>{score}</div>
              <div className="tb-score-label">Twin Score</div>
            </div>
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {commands.map((section: any, i: any) =>(
          <div key={i} className="tb-section">
            <div className="text-label-upper text-tertiary mb-4">{section.section}</div>
            <div className="tb-grid-4">
              {section.items.map((item: any, j: any) =>(
                <button key={j} onClick={()=>router.push(item.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                  <span className="text-xl">{item.icon}</span><span className="text-xs font-medium text-secondary">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
