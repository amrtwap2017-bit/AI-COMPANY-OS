"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function WorkflowDesignerPage() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["wd-wos"], () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: srRaw } = useQuery(["wd-srs"], () => authFetch("/api/v1/service-requests/").then(r => (r as any).data ?? r));
  const wos = toArr(woRaw); const srs = toArr(srRaw);
  const workflows = [
    {label:"SR → Work Order",    icon:"🎫→🔧", desc:"Service request creates work order automatically", active:srs.filter((s: any) =>s.work_order_id).length, total:srs.length, color:"#5B7C8C"},
    {label:"PM → Work Order",    icon:"📅→🔧", desc:"Overdue PM plan triggers work order creation",     active:wos.filter((w: any) =>w.title?.startsWith("PM:")).length, total:wos.length, color:"#8D7443"},
    {label:"WO → Invoice",       icon:"🔧→💰", desc:"Completed work order creates invoice draft",       active:wos.filter((w: any) =>w.status==="completed").length, total:wos.length, color:"#547C4D"},
    {label:"Contract → Renewal", icon:"📄→🔄", desc:"Expiring contract triggers renewal notification",  active:0, total:0, color:"#B07A2A"},
    {label:"Stock Alert → PR",   icon:"📦→📋", desc:"Low stock triggers purchase request",             active:0, total:0, color:"#B07A2A"},
    {label:"WO → Notification",  icon:"🔧→🔔", desc:"Work order status change sends notification",     active:wos.filter((w: any) =>w.status!=="completed").length, total:wos.length, color:"#A84A3D"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0A1A30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Platform · Automation</div>
          <h1 className="tb-hero-title">Workflow Designer</h1>
          <p className="tb-hero-description">Automated workflow rules and business process automation</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Workflows",value:workflows.length,color:"#5B7C8C"},{label:"Active WOs",value:wos.filter((w: any) =>w.status!=="completed").length,color:"#B07A2A"},{label:"Linked SRs",value:srs.filter((s: any) =>s.work_order_id).length,color:"#547C4D"},{label:"Auto-created",value:wos.filter((w: any) =>w.title?.startsWith("PM:")).length,color:"#8D7443"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Workflow Rules</div>
          <div className="tb-grid-3">
            {workflows.map((wf: any, i: any) =>(
              <div key={i} className="tb-section">
                <div className="text-lg mb-2">{wf.icon}</div>
                <div className="text-sm font-bold text-primary mb-1">{wf.label}</div>
                <div className="text-xs text-tertiary mb-3">{wf.desc}</div>
                {wf.total>0 && (
                  <div>
                    <div className="tb-flex-between mb-1"><span className="text-xs text-secondary">Active</span><span className="text-xs font-bold" style={{color:wf.color}}>{wf.active}/{wf.total}</span></div>
                    <div className="tb-progress"><div className="tb-progress-bar" style={{background:wf.color,width:(wf.active/Math.max(wf.total,1)*100)+"%"}}/></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate</div>
          <div className="tb-grid-4">
            {[{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"},{label:"Service Requests",icon:"🎫",path:"/operations/service-requests"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"},{label:"Automation",icon:"⚡",path:"/workspace"}].map((a: any, i: number) =>(
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
