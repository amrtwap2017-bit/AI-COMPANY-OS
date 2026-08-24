"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const TYPE_META: Record<string, {icon:string;color:string;label:string}> = {
  work_order_created:{icon:"🔧",color:"#5B7C8C",label:"Work Order Created"},
  work_order_completed:{icon:"✅",color:"#547C4D",label:"Work Order Completed"},
  contract_expiring:{icon:"⏰",color:"#B07A2A",label:"Contract Expiring"},
  purchase_request_created:{icon:"🛒",color:"#B07A2A",label:"PR Created"},
  pm_overdue:{icon:"📅",color:"#B07A2A",label:"PM Overdue"},
  asset_fault:{icon:"⚙️",color:"#A84A3D",label:"Asset Fault"},
};
export default function NotificationRulesPage() {
  const router = useRouter();
  const { data: notifRaw } = useQuery(["nr-notifs"], () => authFetch("/api/v1/notifications-portal?limit=200").then((r: any) => r.r()));
  const notifs = toArr(notifRaw);
  const types = [...new Set(notifs.map((n: any) => n.n).filter(Boolean))];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0E28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Admin</div>
          <h1 className="tb-hero-title">Notification Rules</h1>
          <p className="tb-hero-description">{notifs.length} notifications · {types.length} types · {notifs.filter((n: any)=>!n.is_read).length} unread</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:notifs.length,color:"#221D1A"},{label:"Unread",value:notifs.filter((n: any)=>!n.is_read).length,color:"#B07A2A"},{label:"Types",value:types.length,color:"#8D7443"},{label:"Rules Active",value:types.length,color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Active Notification Types</div><button onClick={()=>router.push("/notifications")} className="tb-section-link">All →</button></div>
          <div className="tb-grid-3 mt-4">
            {types.map((type: any,i: number)=>{
              const meta = TYPE_META[type as string]||{icon:"🔔",color:"#6D5F53",label:type};
              const cnt = notifs.filter((n: any) => n.n===type).length;
              const unread = notifs.filter((n: any) => n.n===type&&!n.is_read).length;
              return (
                <div key={i} className="tb-section">
                  <div className="flex items-center gap-2 mb-3"><span style={{fontSize:"1.5rem"}}>{meta.icon}</span><div><div className="text-sm font-bold text-primary">{meta.label}</div><div className="text-xs text-tertiary">{type}</div></div></div>
                  <div className="tb-flex-between"><span className="text-2xl font-black" style={{color:meta.color}}>{cnt}</span>{unread>0&&<span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem"}}>{unread} unread</span>}</div>
                  <div className="tb-progress mt-2"><div className="tb-progress-bar" style={{background:meta.color,width:Math.min((cnt/notifs.length)*100,100)+"%"}}/></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
          <div className="tb-section-title">Navigation</div>
          <div className="space-y-2">
            {[{label:"All Notifications",icon:"🔔",path:"/notifications"},{label:"Inbox",icon:"📬",path:"/inbox"},{label:"Workspace",icon:"🏠",path:"/workspace"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
