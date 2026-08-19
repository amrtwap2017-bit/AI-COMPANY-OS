"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function InboxPresetsPage() {
  const router = useRouter();
  const { data: notifRaw } = useQuery(["ip-notifs"], () => authFetch("/api/v1/notifications-portal?limit=100").then(r=>r.json()));
  const notifs = toArr(notifRaw);
  const presets = [
    {label:"Critical Alerts",    filter:"critical",    icon:"🚨", color:"#A84A3D", desc:"Work orders and PM plans requiring immediate action"},
    {label:"Contract Alerts",    filter:"contract",    icon:"📄", color:"#B07A2A", desc:"Expiring or renewed contracts"},
    {label:"Procurement",        filter:"purchase",    icon:"🛒", color:"#B07A2A", desc:"Purchase requests and approvals"},
    {label:"Maintenance",        filter:"pm",          icon:"📅", color:"#B07A2A", desc:"PM plans and asset maintenance"},
    {label:"CRM Updates",        filter:"lead",        icon:"👤", color:"#EC4899", desc:"Lead and customer notifications"},
    {label:"Work Orders",        filter:"work_order",  icon:"🔧", color:"#5B7C8C", desc:"Work order status updates"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #1A0E28 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-purple-400 mb-1.5">Inbox</div>
          <h1 className="tb-hero-title">Inbox Presets</h1>
          <p className="tb-hero-description">Filtered notification views by category</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:notifs.length,color:"#221D1A"},{label:"Unread",value:notifs.filter((n: any) =>!n.is_read).length,color:"#B07A2A"},{label:"Presets",value:presets.length,color:"#8D7443"},{label:"Types",value:[...new Set(notifs.map((n: any) =>n.type).filter(Boolean))].length,color:"#5B7C8C"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Filter Presets</div>
          <div className="tb-grid-3">
            {presets.map((preset: any, i: any) =>{
              const count = notifs.filter((n: any) =>(n.type||"").includes(preset.filter)).length;
              const unread= notifs.filter((n: any) =>(n.type||"").includes(preset.filter)&&!n.is_read).length;
              return (
                <button key={i} onClick={()=>router.push("/notifications")} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-center justify-between mb-3"><span style={{fontSize:"1.5rem"}}>{preset.icon}</span><span className="text-2xl font-black" style={{color:preset.color}}>{count}</span></div>
                  <div className="text-sm font-bold text-primary mb-1">{preset.label}</div>
                  <div className="text-xs text-tertiary mb-2">{preset.desc}</div>
                  {unread>0&&<span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem"}}>{unread} unread</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="tb-section">
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
