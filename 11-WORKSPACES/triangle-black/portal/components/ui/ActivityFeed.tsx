
"use client";
// @ts-nocheck
// Triangle Black — Activity Feed Component
// Shows recent platform events with icons, colors, timestamps

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtTimeAgo = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs  < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  } catch { return ""; }
};

interface ActivityFeedProps {
  entityId?: string;
  limit?:    number;
  compact?:  boolean;
}

export function ActivityFeed({ entityId, limit = 15, compact = false }: ActivityFeedProps) {
  const router = useRouter();
  
  const { data, isLoading } = useQuery(
    ["activity-feed", entityId, limit],
    () => {
      const params = entityId ? `?limit=${limit}&entity_id=${entityId}` : `?limit=${limit}`;
      return authFetch(`/api/v1/activity-feed${params}`).then(r => r.json());
    },
    { refetchInterval: 30000 }
  );

  const activities = data?.activities || [];

  if (isLoading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className="w-8 h-8 bg-base-alt rounded-xl flex-shrink-0"/>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-base-alt rounded w-3/4"/>
            <div className="h-2.5 bg-base-alt rounded w-1/2"/>
          </div>
        </div>
      ))}
    </div>
  );

  if (activities.length === 0) {
    return (
      <div className="tb-empty" style={{padding:"24px 0"}}>
        <div className="tb-empty-icon" style={{fontSize:"2rem"}}>📋</div>
        <div className="tb-empty-desc">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity: any, i: number) => (
        <button
          key={i}
          onClick={() => activity.path && router.push(activity.path)}
          className="w-full flex items-start gap-3 text-left transition-colors hover:bg-base-alt rounded-xl p-2 -mx-2"
          style={{cursor:activity.path?"pointer":"default"}}
        >
          {/* Icon */}
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:`${activity.color}18`,
            border:`1px solid ${activity.color}30`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"0.875rem",
          }}>
            {activity.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-primary truncate">{activity.title}</div>
            {!compact && activity.description && (
              <div className="text-xs text-tertiary mt-0.5 truncate">{activity.description}</div>
            )}
          </div>

          {/* Time */}
          <div className="text-xs text-tertiary flex-shrink-0 mt-0.5">{fmtTimeAgo(activity.time)}</div>
        </button>
      ))}
    </div>
  );
}

export default ActivityFeed;
