"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const PRIORITY_BG = { critical: "bg-red-50 border-red-200", high: "bg-orange-50 border-orange-200", medium: "bg-amber-50 border-amber-200", low: "bg-slate-50 border-slate-200" };
const PRIORITY_BADGE = { critical: "bg-red-500 text-white", high: "bg-orange-500 text-white", medium: "bg-amber-500 text-white", low: "bg-slate-200 text-slate-700" };

export default function MyDayPage() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
  const now = new Date();

  const { data: woRaw,    isLoading: l1 } = useQuery(["myd-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()),    { refetchInterval: 60000 });
  const { data: pmRaw,    isLoading: l2 } = useQuery(["myd-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: srRaw,    isLoading: l3 } = useQuery(["myd-srs"],    () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const { data: notifRaw }                = useQuery(["myd-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const { data: twin }                    = useQuery(["myd-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));

  const wos    = toArr(woRaw);
  const pms    = toArr(pmRaw);
  const srs    = toArr(srRaw);
  const notifs = toArr(notifRaw);

  const openWOs       = wos.filter(w => w.status === "open");
  const inProgressWOs = wos.filter(w => w.status === "in_progress");
  const criticalWOs   = wos.filter(w => w.priority === "critical" && w.status !== "completed");
  const overdueWOs    = wos.filter(w => w.due_date && new Date(w.due_date) < now && w.status !== "completed");
  const overduePMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts) < now);
  const dueSoonPMs    = pms.filter(p => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= new Date(now.getTime()+7*86400000));
  const openSRs       = srs.filter(s => s.status === "open" || s.status === "new");
  const unreadNotifs  = notifs.filter(n => !n.is_read).slice(0,6);
  const score         = twin?.health_score ?? 0;

  const allTasks = [
    ...criticalWOs.map(w => ({ id: w.id, type:"Work Order", title: w.title, priority:"critical", status: w.status, due: w.due_date, path:`/operations/work-orders/${w.id}` })),
    ...overdueWOs.filter(w => w.priority !== "critical").map(w => ({ id: w.id, type:"Overdue WO", title: w.title, priority: w.priority||"high", status: w.status, due: w.due_date, path:`/operations/work-orders/${w.id}` })),
    ...overduePMs.map(p => ({ id: p.id, type:"PM Plan", title: p.title, priority:"high", status:"overdue", due: p.next_due_ts, path:"/maintenance/pm-plans" })),
    ...openSRs.slice(0,3).map(s => ({ id: s.id, type:"Service Request", title: s.title||s.description, priority: s.urgency||"medium", status: s.status, due: s.preferred_date, path:`/operations/service-requests/${s.id}` })),
    ...inProgressWOs.map(w => ({ id: w.id, type:"In Progress WO", title: w.title, priority: w.priority||"medium", status:"in_progress", due: w.due_date, path:`/operations/work-orders/${w.id}` })),
    ...openWOs.filter(w => !criticalWOs.find(c=>c.id===w.id) && !overdueWOs.find(o=>o.id===w.id)).slice(0,5).map(w => ({ id: w.id, type:"Work Order", title: w.title, priority: w.priority||"low", status: w.status, due: w.due_date, path:`/operations/work-orders/${w.id}` })),
  ];

  const prioOrder = { critical:0, high:1, medium:2, low:3 };
  allTasks.sort((a,b) => (prioOrder[a.priority]??3)-(prioOrder[b.priority]??3));

  if (l1 || l2 || l3) return <div className="p-6 text-slate-400 text-center">Loading your day...</div>;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Personal Dashboard</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Day</h1>
          <p className="text-slate-500 mt-1">{today}</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-center">
            <div className="text-2xl font-black text-amber-500">{allTasks.length}</div>
            <div className="text-xs text-slate-500">Tasks Today</div>
          </div>
          <div className={`rounded-2xl border px-5 py-3 text-center ${score>=95?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
            <div className={`text-2xl font-black ${score>=95?"text-emerald-500":"text-amber-500"}`}>{score}</div>
            <div className="text-xs text-slate-500">Twin Score</div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label:"Critical", value:criticalWOs.length, color:"red", icon:"🔴" },
          { label:"Overdue WOs", value:overdueWOs.length, color:overdueWOs.length>0?"red":"emerald", icon:"⏰" },
          { label:"Overdue PM", value:overduePMs.length, color:overduePMs.length>0?"amber":"emerald", icon:"🔧" },
          { label:"In Progress", value:inProgressWOs.length, color:"amber", icon:"⚙️" },
          { label:"Open SRs", value:openSRs.length, color:"blue", icon:"📋" },
        ].map((k,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
            <div className="text-xl mb-1">{k.icon}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Task list — full priority order */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Today's Task Queue ({allTasks.length})</h2>
            <button onClick={() => router.push("/operations/work-orders")} className="text-xs text-amber-500 hover:underline">All WOs →</button>
          </div>
          {allTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎉</div>
              <div className="text-xl font-bold text-emerald-600">All clear!</div>
              <div className="text-slate-400 text-sm mt-1">No tasks require your attention today</div>
            </div>
          ) : (
            <div className="space-y-2">
              {allTasks.map((task,i) => (
                <button key={i} onClick={() => router.push(task.path)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-md ${PRIORITY_BG[task.priority]||"bg-slate-50 border-slate-200"}`}>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${PRIORITY_BADGE[task.priority]||"bg-slate-200 text-slate-700"}`}>{task.priority?.toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{task.type} · {task.status}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {task.due && <div className={`text-xs font-medium ${new Date(task.due)<now?"text-red-500":"text-slate-400"}`}>{fmtDate(task.due)}</div>}
                    <div className="text-slate-300 text-xs">→</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* PM due this week */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">📅 PM Due This Week</h2>
              <button onClick={() => router.push("/maintenance/pm-plans")} className="text-xs text-amber-500">All →</button>
            </div>
            {dueSoonPMs.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">✅ No PM plans due this week</div>
            ) : (
              <div className="space-y-2">
                {dueSoonPMs.slice(0,5).map((p,i)=>(
                  <div key={i} className="flex justify-between items-start p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-xs font-medium text-amber-900 dark:text-amber-300 truncate flex-1">{p.title}</div>
                    <div className="text-xs text-amber-500 ml-2 flex-shrink-0">{fmtDate(p.next_due_ts)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">🔔 Unread Alerts ({unreadNotifs.length})</h2>
              <button onClick={() => router.push("/inbox")} className="text-xs text-amber-500">Inbox →</button>
            </div>
            {unreadNotifs.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">✅ All caught up</div>
            ) : (
              <div className="space-y-2">
                {unreadNotifs.map((n,i)=>(
                  <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"/>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick create */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3">⚡ Quick Create</h2>
            <div className="space-y-2">
              {[
                { label:"New Work Order",    icon:"🔧", path:"/engineering/new-work-order" },
                { label:"Service Request",   icon:"📋", path:"/operations/service-requests" },
                { label:"Purchase Request",  icon:"🛒", path:"/supply-chain/purchase-requests" },
                { label:"Run Automation",    icon:"⚡", path:"/workflows/launcher" },
              ].map((a,i)=>(
                <button key={i} onClick={()=>router.push(a.path)}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left transition-colors">
                  <span className="text-base">{a.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
