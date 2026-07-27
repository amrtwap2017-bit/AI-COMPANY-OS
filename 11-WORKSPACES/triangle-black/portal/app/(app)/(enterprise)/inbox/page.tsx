"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };

const TYPES = ["all","alert","warning","info","success","reminder"];
const T_COLOR = {
  alert:    "bg-red-100 text-red-800",
  warning:  "bg-amber-100 text-amber-800",
  info:     "bg-blue-100 text-blue-800",
  success:  "bg-emerald-100 text-emerald-800",
  reminder: "bg-purple-100 text-purple-800",
};
const T_ICON = {alert:"🚨",warning:"⚠️",info:"ℹ️",success:"✅",reminder:"📋"};

export default function InboxPage() {
  const [tf,  setTf]       = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [q,   setQ]        = useState("");
  const qc = useQueryClient();

  const { data: raw=[], isLoading, refetch } = useQuery(
    ["inbox-notifs"],
    () => authFetch("/api/v1/notifications/?limit=200").then(r=>r.json()),
    { refetchInterval: 30000 }
  );

  const notifs = toArr(raw);
  const filtered = notifs.filter(n => {
    if (tf !== "all" && n.type !== tf) return false;
    if (unreadOnly && n.is_read) return false;
    if (q && !(n.title?.toLowerCase().includes(q.toLowerCase()) || n.message?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total   = notifs.length;
  const unread  = notifs.filter(n => !n.is_read).length;
  const alerts  = notifs.filter(n => n.type === "alert").length;
  const warnings = notifs.filter(n => n.type === "warning").length;

  async function markRead(id) {
    try {
      await authFetch(`/api/v1/notifications/${id}/read`, { method:"PATCH" });
      refetch();
    } catch {}
  }

  async function markAllRead() {
    try {
      await authFetch("/api/v1/notifications/read-all", { method:"POST" });
      refetch();
    } catch {}
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Notifications Inbox"
        subtitle={`${total} total · ${unread} unread · ${alerts} alerts`}
        breadcrumbs={[{label:"Inbox"}]}
        actions={
          unread > 0
            ? <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all read</Button>
            : undefined
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {label:"Total",    value:total,    color:"text-slate-800"},
          {label:"Unread",   value:unread,   color:unread>0?"text-blue-700":"text-emerald-700"},
          {label:"Alerts",   value:alerts,   color:alerts>0?"text-red-700":"text-slate-600"},
          {label:"Warnings", value:warnings, color:warnings>0?"text-amber-700":"text-slate-600"},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading?"…":k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard title={`Notifications (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search notifications…" value={q}
            onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-400" />
          <select value={tf} onChange={e=>setTf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {TYPES.map(t=><option key={t} value={t}>{t==="all"?"All Types":t}</option>)}
          </select>
          <button
            onClick={()=>setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${unreadOnly?"bg-blue-600 text-white border-blue-600":"bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            Unread only
          </button>
          {(tf!=="all"||unreadOnly||q)&&(
            <button onClick={()=>{setTf("all");setUnreadOnly(false);setQ("");}}
              className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>
          )}
        </div>

        {isLoading ? <LoadingState /> : filtered.length===0 ? (
          <EmptyState title="No notifications" subtitle={unreadOnly?"No unread notifications":"Your inbox is empty"} />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(n=>(
              <div key={n.id}
                className={`flex items-start gap-3 py-4 px-2 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer ${!n.is_read?"bg-blue-50/30":""}`}
                onClick={()=>!n.is_read&&markRead(n.id)}>
                <div className="shrink-0 mt-0.5">
                  <span className="text-xl">{T_ICON[n.type]||"📢"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm ${!n.is_read?"font-bold text-slate-900":"font-medium text-slate-700"} truncate`}>{n.title}</p>
                    {!n.is_read && <span className="shrink-0 h-2 w-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${T_COLOR[n.type]||"bg-slate-100 text-slate-600"}`}>
                      {n.type||"info"}
                    </span>
                    {n.category && (
                      <span className="text-xs text-slate-400">{n.category}</span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{fmtDate(n.created_at)}</span>
                  </div>
                </div>
                {!n.is_read && (
                  <button
                    onClick={e=>{e.stopPropagation();markRead(n.id);}}
                    className="shrink-0 text-xs text-slate-400 hover:text-blue-600 transition-colors mt-0.5">
                    ✓ Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
