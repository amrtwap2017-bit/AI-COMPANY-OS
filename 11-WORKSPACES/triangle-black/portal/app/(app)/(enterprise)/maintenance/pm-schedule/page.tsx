"use client";
// @ts-nocheck
// Triangle Black — PM Maintenance Schedule Calendar
// Sprint-032: Maintenance Schedule View
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short" }); } catch { return "—"; } };
const fmtFull = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" }); } catch { return "—"; } };

const FREQ_ICON: Record<string,string> = { daily:"📅", weekly:"📆", monthly:"🗓️", quarterly:"📋", yearly:"📌", biannual:"🔄" };
const FREQ_COLOR: Record<string,string> = {
  daily:"border-l-4 border-blue-400", weekly:"border-l-4 border-green-400",
  monthly:"border-l-4 border-purple-400", quarterly:"border-l-4 border-orange-400",
  yearly:"border-l-4 border-red-400", biannual:"border-l-4 border-yellow-400",
};

type Plan = { id:string; title:string; frequency:string; next_due_ts:string; status:string; owner:string; plan_type:string; };
type Group = { label:string; tag:string; color:string; plans:Plan[]; };

export default function PMSchedulePage() {
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<"calendar"|"list">("calendar");
  const [filter, setFilter]     = useState("all");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/maintenance/pm-plans/")
      .then(r => r.data ?? r)
      .then((d: any) => {
        const items = Array.isArray(d) ? d : d?.plans || d?.results || d?.items || [];
        setPlans(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const now   = new Date();
  const in7   = new Date(now.getTime() + 7  * 86400000);
  const in30  = new Date(now.getTime() + 30 * 86400000);

  const classify = (p: Plan) => {
    if (!p.next_due_ts) return "future";
    const due = new Date(p.next_due_ts);
    if (due < now)    return "overdue";
    if (due <= in7)   return "week";
    if (due <= in30)  return "month";
    return "future";
  };

  const groups: Group[] = [
    { label:"⚠️ Overdue",         tag:"overdue", color:"bg-red-50 border-red-200",    plans: [] },
    { label:"🔴 Due This Week",   tag:"week",    color:"bg-orange-50 border-orange-200", plans: [] },
    { label:"🟡 Due This Month",  tag:"month",   color:"bg-yellow-50 border-yellow-200", plans: [] },
    { label:"🟢 Upcoming (30d+)", tag:"future",  color:"bg-green-50 border-green-200",  plans: [] },
  ];

  const filtered = plans.filter((p: any) => filter === "all" || classify(p) === filter);
  filtered.forEach((p: any) => {
    const tag = classify(p);
    const g = groups.find((g: any) => g.tag === tag);
    if (g) g.plans.push(p);
  });

  // Sort each group by due date
  groups.forEach((g: any) => g.plans.sort((a: any, b: any) => new Date(a.next_due_ts||0).getTime() - new Date(b.next_due_ts||0).getTime()));

  const totalOverdue = plans.filter((p: any) => classify(p) === "overdue").length;
  const totalWeek    = plans.filter((p: any) => classify(p) === "week").length;
  const totalMonth   = plans.filter((p: any) => classify(p) === "month").length;

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">PM Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            {plans.length} plans · {totalOverdue} overdue · {totalWeek} due this week
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/maintenance/pm-plans")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            📋 All Plans
          </button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(["calendar","list"] as const).map((v: any) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${view===v ? "bg-[var(--color-bg)] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                {v === "calendar" ? "📅 Groups" : "☰ List"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:"Total Plans",    value:plans.length,  color:"bg-gray-50",   tag:"all" },
          { label:"Overdue",        value:totalOverdue,  color:"bg-red-50",    tag:"overdue" },
          { label:"Due This Week",  value:totalWeek,     color:"bg-orange-50", tag:"week" },
          { label:"Due This Month", value:totalMonth,    color:"bg-yellow-50", tag:"month" },
        ].map((k: any) => (
          <button key={k.label}
            onClick={() => setFilter(filter===k.tag ? "all" : k.tag)}
            className={`${k.color} border rounded-xl p-3 text-left hover:opacity-80 transition-opacity ${filter===k.tag ? "ring-2 ring-gray-900" : ""}`}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-2xl font-bold text-[var(--color-text-1)] mt-1">{k.value}</p>
          </button>
        ))}
      </div>

      {/* Calendar Groups View */}
      {view === "calendar" && (
        <div className="space-y-5">
          {groups.filter((g: any) => g.plans.length > 0 || g.tag === "overdue").map((group: any) => (
            <div key={group.tag} className={`border rounded-xl overflow-hidden ${group.color}`}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-current border-opacity-20">
                <h2 className="font-semibold text-[var(--color-text-1)]">{group.label}</h2>
                <span className="text-sm text-gray-500">{group.plans.length} plans</span>
              </div>
              {group.plans.length === 0 ? (
                <div className="px-5 py-6 text-center text-gray-400 text-sm bg-white">
                  {group.tag === "overdue" ? "✅ No overdue plans" : "No plans in this period"}
                </div>
              ) : (
                <div className="bg-white divide-y divide-gray-50">
                  {group.plans.map((plan: any) => (
                    <div key={plan.id}
                      onClick={() => router.push(`/maintenance/pm-plans/${plan.id}`)}
                      className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer ${(FREQ_COLOR as Record<string, any>)[plan.frequency] || "border-l-4 border-gray-300"}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{(FREQ_ICON as Record<string, any>)[plan.frequency] || "📋"}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-1)] truncate">{plan.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {plan.plan_type} · {plan.frequency} · {plan.owner || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className={`text-sm font-semibold ${group.tag==="overdue" ? "text-red-600" : "text-gray-700"}`}>
                          {fmtDate(plan.next_due_ts)}
                        </p>
                        <p className="text-xs text-gray-400">{fmtFull(plan.next_due_ts).split(" ").slice(2).join(" ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Plan","Type","Frequency","Owner","Next Due","Status"].map((h: any) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered
                .sort((a: any, b: any) => new Date(a.next_due_ts||0).getTime() - new Date(b.next_due_ts||0).getTime())
                .map((p: any) => {
                  const cat = classify(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/maintenance/pm-plans/${p.id}`)}>
                      <td className="px-4 py-3 font-medium text-[var(--color-text-1)] max-w-56 truncate">{p.title}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{p.plan_type}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{(FREQ_ICON as Record<string, any>)[p.frequency]} {p.frequency}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.owner || "—"}</td>
                      <td className={`px-4 py-3 font-medium ${cat==="overdue" ? "text-red-600" : cat==="week" ? "text-orange-600" : "text-gray-700"}`}>
                        {fmtDate(p.next_due_ts)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          cat==="overdue" ? "bg-red-100 text-red-800" :
                          cat==="week"    ? "bg-orange-100 text-orange-800" :
                          cat==="month"   ? "bg-yellow-100 text-yellow-800" :
                                           "bg-green-100 text-green-800"
                        }`}>
                          {cat==="overdue" ? "⚠️ overdue" : p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
