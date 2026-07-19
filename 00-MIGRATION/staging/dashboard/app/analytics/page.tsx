"use client";

import { useEffect, useState } from "react";
import { api, type AnalyticsOverview } from "@/lib/api";
import { BarChart3, Bot, Cpu, Activity, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
  const [overview,   setOverview]   = useState<AnalyticsOverview | null>(null);
  const [agents,     setAgents]     = useState<any[]>([]);
  const [models,     setModels]     = useState<any[]>([]);
  const [timeline,   setTimeline]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    await Promise.allSettled([
      api.get("/analytics/overview").then(r => setOverview(r.data)),
      api.get("/analytics/agents").then(r => setAgents(r.data.agents || [])),
      api.get("/analytics/models").then(r => setModels(r.data.models || [])),
      api.get("/analytics/timeline?limit=15").then(r => setTimeline(r.data.events || [])),
    ]);
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 animate-pulse">Loading analytics…</p>
    </div>
  );

  const dot = (s: string) => s === "success" ? "bg-green-400" : "bg-red-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" /> Analytics
        </h1>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800
                     text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Agent Calls",   value: overview.total_agent_calls,   color: "text-blue-400" },
            { label: "Chat Messages", value: overview.total_chat_messages, color: "text-green-400" },
            { label: "Workflows",     value: overview.total_workflows,     color: "text-purple-400" },
            { label: "Avg Response",  color: "text-yellow-400",
              value: overview.avg_response_seconds
                ? `${overview.avg_response_seconds.toFixed(1)}s` : "N/A" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" /> Agent Leaderboard
          </h2>
          {agents.length === 0
            ? <p className="text-gray-600 text-sm text-center py-6">No data yet</p>
            : agents.slice(0, 8).map((a, i) => (
              <div key={a.agent}
                className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg mb-1">
                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                <span className="text-sm text-white flex-1 truncate">{a.agent}</span>
                <span className="text-xs text-blue-400">{a.total_calls} calls</span>
                {a.avg_duration_seconds && (
                  <span className="text-xs text-gray-500">{a.avg_duration_seconds}s</span>
                )}
              </div>
            ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> Model Usage
          </h2>
          {models.length === 0
            ? <p className="text-gray-600 text-sm text-center py-6">No data yet</p>
            : models.map(m => (
              <div key={m.model}
                className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg mb-1">
                <span className="text-sm text-white flex-1 font-mono truncate">{m.model}</span>
                <span className="text-xs text-purple-400">{m.total_calls} calls</span>
              </div>
            ))}
        </div>

      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Event Timeline
        </h2>
        {timeline.length === 0
          ? <p className="text-gray-600 text-sm text-center py-6">No events yet</p>
          : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {timeline.map(e => (
                <div key={e.id}
                  className="flex items-center gap-3 py-1.5 border-b border-gray-800/50 text-xs">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(e.status)}`} />
                  <span className="text-gray-400 w-36 flex-shrink-0 font-mono">{e.type}</span>
                  <span className="text-gray-300 flex-1 truncate">{e.agent || "—"}</span>
                  {e.duration_seconds && (
                    <span className="text-gray-600">{e.duration_seconds.toFixed(1)}s</span>
                  )}
                  <span className="text-gray-700 w-16 text-right flex-shrink-0">
                    {new Date(e.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
