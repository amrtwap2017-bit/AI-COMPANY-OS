// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { agentsApi } from "@/lib/api";
import { Phone, Mail, Bot, RefreshCw } from "lucide-react";

export default function AgentsPage() {
  const { data: agents = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentsApi.list().then((r: any) => Array.isArray(r) ? r : r?.data || r?.items || []),
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

  const active       = agents.filter((a: any) => a.is_active).length;
  const totalCap     = agents.reduce((s: number, a: any) => s + (a.max_leads || 0), 0);
  const totalUsed    = agents.reduce((s: number, a: any) => s + (a.current_leads || 0), 0);
  const pctUsed      = totalCap ? Math.round((totalUsed / totalCap) * 100) : 0;

  return (
    <PageWrapper>
      <PageHeader
        title="AI Agents"
        subtitle={active + " active agents · " + totalUsed + "/" + totalCap + " leads assigned"}
        badge="AI"
        actions={
          <button onClick={() => refetch()} disabled={isFetching}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} />
          </button>
        }
      />

      {/* Team capacity bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Team Capacity</p>
          <span className="text-sm font-bold text-slate-900">{pctUsed}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className={"h-2.5 rounded-full transition-all " + (pctUsed > 80 ? "bg-red-500" : pctUsed > 60 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: pctUsed + "%" }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{totalUsed} of {totalCap} leads assigned</p>
      </div>

      {isError && <AlertBanner type="error" title={error instanceof Error ? error.message : "Failed to load agents"} />}

      {isLoading ? (
        <LoadingState type="cards" rows={6} cols={3} />
      ) : agents.length === 0 ? (
        <EmptyState icon="🤖" title="No agents configured" description="AI agents will appear here once added" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: any) => {
            const pct      = agent.max_leads ? Math.round((agent.current_leads / agent.max_leads) * 100) : 0;
            const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                      {(agent.name || "A").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{agent.name}</p>
                      <span className={"text-[10px] px-2 py-0.5 rounded-full font-semibold " + (agent.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{agent.current_leads || 0}</p>
                    <p className="text-[10px] text-slate-400">/ {agent.max_leads} leads</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={"h-1.5 rounded-full " + barColor} style={{ width: Math.min(pct, 100) + "%" }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{pct}% · {(agent.max_leads || 0) - (agent.current_leads || 0)} available</p>
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  {agent.email && (
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{agent.email}</span>
                    </p>
                  )}
                  {agent.phone && (
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      {agent.phone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
