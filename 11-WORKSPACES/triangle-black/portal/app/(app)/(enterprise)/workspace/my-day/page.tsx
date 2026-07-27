"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const PRIORITY_CLS = {
  critical: "tb-badge--danger",
  high:     "tb-badge--warning",
  medium:   "tb-badge--warning",
  low:      "tb-badge--neutral",
};
const PRIORITY_BAR_COLOR = {
  critical:"#F87171", high:"#FB923C", medium:"#FBBF24", low:"rgba(148,163,184,0.4)"
};

export default function MyDayPage() {
  const router = useRouter();
  const today  = new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  const now    = new Date();

  const {data:woRaw,isLoading:l1} = useQuery(["myd-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()), {refetchInterval:60000});
  const {data:pmRaw,isLoading:l2} = useQuery(["myd-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const {data:srRaw,isLoading:l3} = useQuery(["myd-srs"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const {data:notifRaw}           = useQuery(["myd-notifs"],() => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const {data:twin}               = useQuery(["myd-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));

  const wos    = toArr(woRaw);
  const pms    = toArr(pmRaw);
  const srs    = toArr(srRaw);
  const notifs = toArr(notifRaw);

  const openWOs       = wos.filter(w => w.status==="open");
  const inProgressWOs = wos.filter(w => w.status==="in_progress");
  const criticalWOs   = wos.filter(w => w.priority==="critical" && w.status!=="completed");
  const overdueWOs    = wos.filter(w => w.due_date && new Date(w.due_date)<now && w.status!=="completed");
  const overduePMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts)<now);
  const dueSoonPMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts)>=now && new Date(p.next_due_ts)<=new Date(now.getTime()+7*86400000));
  const openSRs       = srs.filter(s => s.status==="open"||s.status==="new");
  const unreadNotifs  = notifs.filter(n => !n.is_read).slice(0,6);
  const score         = twin?.health_score ?? 0;

  const allTasks = [
    ...criticalWOs.map(w => ({id:w.id, type:"Work Order", title:w.title, priority:"critical", status:w.status, due:w.due_date, path:`/operations/work-orders/${w.id}`})),
    ...overdueWOs.filter(w=>w.priority!=="critical").map(w => ({id:w.id, type:"Overdue WO", title:w.title, priority:w.priority||"high", status:w.status, due:w.due_date, path:`/operations/work-orders/${w.id}`})),
    ...overduePMs.map(p => ({id:p.id, type:"PM Plan", title:p.title, priority:"high", status:"overdue", due:p.next_due_ts, path:"/maintenance/pm-plans"})),
    ...openSRs.slice(0,3).map(s => ({id:s.id, type:"Service Request", title:s.title||s.description, priority:s.urgency||"medium", status:s.status, due:s.preferred_date, path:`/operations/service-requests/${s.id}`})),
    ...inProgressWOs.map(w => ({id:w.id, type:"In Progress", title:w.title, priority:w.priority||"medium", status:"in_progress", due:w.due_date, path:`/operations/work-orders/${w.id}`})),
    ...openWOs.filter(w=>!criticalWOs.find(c=>c.id===w.id)&&!overdueWOs.find(o=>o.id===w.id)).slice(0,5).map(w => ({id:w.id, type:"Work Order", title:w.title, priority:w.priority||"low", status:w.status, due:w.due_date, path:`/operations/work-orders/${w.id}`})),
  ];
  const prioOrder = {critical:0,high:1,medium:2,low:3};
  allTasks.sort((a,b) => (prioOrder[a.priority]??3)-(prioOrder[b.priority]??3));

  if (l1||l2||l3) return <div className="tb-page"><div className="tb-empty"><div className="tb-empty-icon">⏳</div><div className="tb-empty-desc">Loading your day...</div></div></div>;

  return (
    <div className="tb-page">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-label-upper text-brand mb-1.5">Personal Dashboard</div>
          <h1 className="text-page-title text-primary">My Day</h1>
          <p className="text-body text-secondary mt-1.5">{today}</p>
        </div>
        <div className="flex gap-3">
          <div className="tb-section" style={{padding:"12px 20px",textAlign:"center"}}>
            <div className="text-2xl font-black text-brand">{allTasks.length}</div>
            <div className="text-label text-secondary">Tasks</div>
          </div>
          <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`} style={{padding:"12px 20px"}}>
            <div className="text-2xl font-black" style={{color:score>=95?"#34D399":"#FBBF24"}}>{score}</div>
            <div className="tb-score-label">Twin</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="tb-grid-4" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
        {[
          {label:"Critical", value:criticalWOs.length,  color:"text-danger DEFAULT", icon:"🔴"},
          {label:"Overdue WOs", value:overdueWOs.length, color:overdueWOs.length>0?"#F87171":"#34D399", icon:"⏰"},
          {label:"Overdue PM",  value:overduePMs.length, color:overduePMs.length>0?"#FBBF24":"#34D399", icon:"🔧"},
          {label:"In Progress", value:inProgressWOs.length, color:"#FBBF24", icon:"⚙️"},
          {label:"Open SRs",    value:openSRs.length,   color:"#60A5FA", icon:"📋"},
        ].map((k,i) => (
          <div key={i} className="tb-section" style={{textAlign:"center",padding:"16px 8px"}}>
            <div className="text-xl mb-1">{k.icon}</div>
            <div className="text-3xl font-black" style={{color:k.color||"var(--color-text-1)"}}>{k.value}</div>
            <div className="text-xs text-secondary mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Task queue */}
        <div className="xl:col-span-2 tb-table">
          <div className="tb-section-header" style={{padding:"16px 24px",borderBottom:"1px solid var(--color-divider)"}}>
            <div className="tb-section-title" style={{marginBottom:0}}>Task Queue ({allTasks.length})</div>
            <button onClick={() => router.push("/operations/work-orders")} className="tb-section-link">All WOs →</button>
          </div>
          {allTasks.length === 0 ? (
            <div className="tb-empty">
              <div className="tb-empty-icon">🎉</div>
              <div className="tb-empty-title">All clear!</div>
              <div className="tb-empty-desc">No tasks require your attention today</div>
            </div>
          ) : allTasks.map((task,i) => (
            <button key={i} onClick={() => router.push(task.path)} className="tb-table-row flex items-center gap-3">
              <div className="tb-priority-bar" style={{background:PRIORITY_BAR_COLOR[task.priority]||"rgba(148,163,184,0.4)"}}/>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary truncate">{task.title||"—"}</div>
                <div className="text-xs text-tertiary mt-0.5">{task.type} · {task.status}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                {task.due && <div className={`text-xs font-medium ${new Date(task.due)<now?"text-red-400":"text-tertiary"}`}>{fmtDate(task.due)}</div>}
                <span className={`tb-badge ${PRIORITY_CLS[task.priority]||"tb-badge--neutral"}`}>{task.priority}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="space-y-4">

          {/* PM due this week */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>📅 PM This Week</div>
              <button onClick={() => router.push("/maintenance/pm-plans")} className="tb-section-link">All →</button>
            </div>
            {dueSoonPMs.length === 0 ? (
              <div className="text-xs text-center text-secondary py-4">✅ No PM plans due this week</div>
            ) : dueSoonPMs.slice(0,5).map((p,i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-divider last:border-0">
                <div className="text-xs font-medium text-primary truncate flex-1">{p.title}</div>
                <div className="text-xs text-secondary ml-2 flex-shrink-0">{fmtDate(p.next_due_ts)}</div>
              </div>
            ))}
          </div>

          {/* Unread alerts */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>🔔 Alerts ({unreadNotifs.length})</div>
              <button onClick={() => router.push("/inbox")} className="tb-section-link">Inbox →</button>
            </div>
            {unreadNotifs.length === 0 ? (
              <div className="text-xs text-center text-secondary py-4">✅ All caught up</div>
            ) : unreadNotifs.map((n,i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b border-divider last:border-0">
                <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0"/>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-primary truncate">{n.title}</div>
                  <div className="text-xs text-tertiary truncate">{n.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick create */}
          <div className="tb-section">
            <div className="tb-section-title">⚡ Quick Create</div>
            <div className="space-y-1">
              {[
                {label:"New Work Order",   icon:"🔧", path:"/engineering/new-work-order"},
                {label:"Service Request",  icon:"📋", path:"/operations/service-requests"},
                {label:"Purchase Request", icon:"🛒", path:"/supply-chain/purchase-requests"},
                {label:"Run Automation",   icon:"⚡", path:"/workflows/launcher"},
              ].map((a,i) => (
                <button key={i} onClick={() => router.push(a.path)} className="tb-action-item">
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
