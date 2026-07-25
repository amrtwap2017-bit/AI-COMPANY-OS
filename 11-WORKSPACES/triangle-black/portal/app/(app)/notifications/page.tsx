// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, LoadingState, PageHeader, PageWrapper } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { Bell, CheckCircle2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const BACK = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";


const TYPE_ICONS: any = { info:"ℹ️", warning:"⚠️", success:"✅", error:"❌", system:"🔔" };
const TYPE_COLORS: any = {
  info:    "border-l-blue-400 bg-blue-50",
  warning: "border-l-amber-400 bg-amber-50",
  success: "border-l-emerald-400 bg-emerald-50",
  error:   "border-l-red-400 bg-red-50",
  system:  "border-l-slate-300 bg-slate-50",
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all"|"unread">("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn:  () => authFetchJSON("/api/v1/notifications/?limit=20live/"),
    staleTime: 15_000,
  });

  const notifs = Array.isArray(data)
    ? data
    : data?.notifications || data?.items || data?.data || [];

  const visible = filter === "unread" ? toArr(notifs).filter((n:any)=>!n.is_read&&!n.read) : notifs;
  const unreadCount = toArr(notifs).filter((n:any)=>!n.is_read&&!n.read).length;

  async function markRead(id: string) {
    try {
      const token = tokenManager.getToken();
      await fetch(`${BACK}/api/v1/notifications/?limit=20`+id+"/read", {
        method:"PATCH", headers:{"Authorization":"Bearer "+(token||"")}
      });
      qc.invalidateQueries({queryKey:["notifications"]});
    } catch {}
  }

  async function markAllRead() {
    try {
      const token = tokenManager.getToken();
      await fetch(`${BACK}/api/v1/notifications/?limit=20read-all`, {
        method:"POST", headers:{"Authorization":"Bearer "+(token||"")}
      });
      qc.invalidateQueries({queryKey:["notifications"]});
      toast.success("All marked as read");
    } catch {}
  }

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`} badge="NOTIF"
        actions={
          <div className="flex gap-2">
            {unreadCount>0&&(
              <button onClick={markAllRead} className="text-xs text-amber-600 hover:underline font-semibold px-3 py-2">
                Mark all read
              </button>
            )}
            <button onClick={()=>refetch()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <RefreshCw className="h-4 w-4"/>
            </button>
          </div>
        }/>

      <div className="flex gap-2">
        {(["all","unread"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter===f?"bg-amber-600 text-white":"text-slate-500 hover:bg-slate-100"}`}>
            {f==="all"?"All ("+notifs.length+")":"Unread ("+unreadCount+")"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingState type="table" rows={6}/> :
       visible.length===0 ? (
         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
           <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4"/>
           <h3 className="text-lg font-semibold text-slate-700">
             {filter==="unread"?"No unread notifications":"No notifications"}
           </h3>
         </div>
       ) : (
         <div className="space-y-2">
           {visible.map((n:any)=>{
             const isRead = n.is_read||n.read;
             const type   = n.type||n.notification_type||"system";
             return (
               <div key={n.id}
                 className={"border-l-4 rounded-2xl border border-slate-200 p-4 flex items-start gap-3 transition-all "+(TYPE_COLORS[type]||TYPE_COLORS.system)+(isRead?" opacity-60":"")}>
                 <span className="text-lg flex-shrink-0">{TYPE_ICONS[type]||"🔔"}</span>
                 <div className="flex-1 min-w-0">
                   <p className={"text-sm font-semibold "+(isRead?"text-slate-600":"text-slate-900")}>{n.title||n.subject||"Notification"}</p>
                   {n.body&&<p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
                   <p className="text-[10px] text-slate-400 mt-1">{n.created_at?new Date(n.created_at).toLocaleString():"—"}</p>
                 </div>
                 {!isRead&&(
                   <button onClick={()=>markRead(n.id)} className="text-slate-300 hover:text-amber-500 flex-shrink-0" title="Mark read">
                     <CheckCircle2 className="w-4 h-4"/>
                   </button>
                 )}
               </div>
             );
           })}
         </div>
       )}
    </PageWrapper>
  );
}
