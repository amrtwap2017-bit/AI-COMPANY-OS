// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/lib/api";
import { Agent } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Phone, Mail, Users } from "lucide-react";

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => agentsApi.list().then((r) => r.data as Agent[]),
    refetchInterval: 30000,
  });

  const totalCapacity = agents.reduce((s, a) => s + a.max_leads, 0);
  const totalUsed = agents.reduce((s, a) => s + a.current_leads, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {agents.filter((a) => a.is_active).length} active · {totalUsed}/{totalCapacity} leads assigned
          </p>
        </div>
      </div>

      {/* Overall capacity bar */}
      <Card>
        <p className="text-sm font-medium text-gray-700 mb-3">Team Capacity</p>
        <div className="flex items-center gap-4">
          <div
            className="flex-1 bg-gray-100 rounded-full h-3"
            role="progressbar"
            aria-valuenow={totalUsed}
            aria-valuemin={0}
            aria-valuemax={totalCapacity}
            aria-label={`Team capacity: ${totalUsed} of ${totalCapacity} leads`}
          >
            <div
              className="h-3 rounded-full bg-[#1B2B4B] transition-all"
              style={{ width: `${totalCapacity ? Math.round((totalUsed / totalCapacity) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            {totalUsed}/{totalCapacity}
          </span>
        </div>
      </Card>

      {isLoading && (
        <div role="status" className="text-center py-12 text-gray-400">Loading agents...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const pct = Math.round((agent.current_leads / agent.max_leads) * 100);
          const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500";
          return (
            <Card key={agent.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full bg-[#1B2B4B] flex items-center justify-center text-white font-semibold"
                      aria-hidden="true"
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <Badge
                        color={agent.is_active ? "text-green-700" : "text-gray-500"}
                        bg={agent.is_active ? "bg-green-100" : "bg-gray-100"}
                      >
                        {agent.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1B2B4B]">{agent.current_leads}</p>
                  <p className="text-xs text-gray-400">/ {agent.max_leads} leads</p>
                </div>
              </div>

              {/* Capacity bar */}
              <div className="mb-4">
                <div
                  className="w-full bg-gray-100 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={agent.current_leads}
                  aria-valuemin={0}
                  aria-valuemax={agent.max_leads}
                  aria-label={`${agent.name}: ${pct}% capacity`}
                >
                  <div className={`h-2 rounded-full ${barColor} transition-all`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}% capacity · {agent.max_leads - agent.current_leads} available</p>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{agent.email}</span>
                </p>
                {agent.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {agent.phone}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
