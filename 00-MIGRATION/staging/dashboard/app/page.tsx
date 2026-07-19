"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type AnalyticsOverview } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Bot, MessageSquare, Workflow, Rocket, Clock,
  Activity, Brain, BarChart3, ArrowRight,
} from "lucide-react";

function StatCard({
  title, value, sub, color, icon,
}: {
  title: string; value: string | number;
  sub: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

export default function OverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [agents,   setAgents]   = useState<string[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/analytics/overview").then(r => setOverview(r.data)),
      api.get("/agents").then(r => setAgents(r.data.agents || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (authLoading) return null;

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            {user ? `Welcome, ${user.full_name || user.username}` : "AI Company OS"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Persistent Intelligence Platform
          </p>
        </div>
        {!user && (
          <Link href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm rounded-lg transition-colors">
            Sign in <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Agent Calls" value={overview.total_agent_calls}
            sub="Total executions" color="text-blue-400"
            icon={<Bot className="w-5 h-5" />} />
          <StatCard title="Conversations" value={overview.total_chat_messages}
            sub="Chat messages" color="text-green-400"
            icon={<MessageSquare className="w-5 h-5" />} />
          <StatCard title="Projects"
            value={`${overview.successful_projects}/${overview.total_projects}`}
            sub="Completed / Total" color="text-purple-400"
            icon={<Rocket className="w-5 h-5" />} />
          <StatCard
            title="Avg Response"
            value={overview.avg_response_seconds
              ? `${overview.avg_response_seconds.toFixed(1)}s`
              : "N/A"}
            sub="Per agent call" color="text-yellow-400"
            icon={<Clock className="w-5 h-5" />} />
          <StatCard title="Workflows" value={overview.total_workflows}
            sub="Pipelines run" color="text-cyan-400"
            icon={<Workflow className="w-5 h-5" />} />
          <StatCard title="Events" value={overview.total_events}
            sub="Platform events" color="text-orange-400"
            icon={<BarChart3 className="w-5 h-5" />} />
          <StatCard title="Agents" value={agents.length}
            sub="Registered" color="text-pink-400"
            icon={<Brain className="w-5 h-5" />} />
          <StatCard title="Status" value="Live"
            sub="All systems operational" color="text-green-400"
            icon={<Activity className="w-5 h-5" />} />
        </div>
      )}

      {/* Agent roster */}
      {agents.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            Available Agents ({agents.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {agents.map(a => (
              <span key={a}
                className="px-3 py-1 bg-gray-800 text-gray-300 text-xs
                           rounded-full border border-gray-700">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
