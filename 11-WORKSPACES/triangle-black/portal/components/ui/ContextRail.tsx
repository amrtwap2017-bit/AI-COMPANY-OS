// @ts-nocheck
"use client";
import { useState } from "react";
import { Zap, Activity, Link2, Files, Bell, ChevronRight, ChevronLeft, X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tab { key: string; label: string; icon: any }

const TABS: Tab[] = [
  { key:"ai",       label:"AI Insights",   icon:Zap },
  { key:"activity", label:"Activity",      icon:Activity },
  { key:"related",  label:"Related",       icon:Link2 },
  { key:"files",    label:"Files",         icon:Files },
  { key:"alerts",   label:"Alerts",        icon:Bell },
];

interface Props {
  open: boolean;
  onToggle: () => void;
  aiInsights?: { title: string; insight: string; type?: string }[];
  activities?: { actor: string; action: string; time: string }[];
  alerts?: { level: string; message: string }[];
  relatedCount?: number;
  filesCount?: number;
}

export function ContextRail({ open, onToggle, aiInsights = [], activities = [], alerts = [], relatedCount = 0, filesCount = 0 }: Props) {
  const [activeTab, setActiveTab] = useState("ai");

  const badgeCounts: Record<string, number> = {
    ai: aiInsights.length,
    activity: activities.length,
    related: relatedCount,
    files: filesCount,
    alerts: alerts.length,
  };

  const alertIcon = (level: string) => level === "critical" ? XCircle : level === "warning" ? AlertTriangle : CheckCircle;

  return (
    <div className="flex flex-shrink-0">
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-5 bg-surface-alt hover:bg-surface-alt border-l border-border transition-colors"
        title={open ? "Close panel" : "Open context panel"}
      >
        {open
          ? <ChevronRight className="w-3 h-3 text-tertiary" />
          : <ChevronLeft className="w-3 h-3 text-tertiary" />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="border-l border-border bg-white flex flex-col overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex border-b border-divider overflow-x-auto flex-shrink-0">
              {TABS.map((tab: any) => {
                const Icon = tab.icon;
                const count = badgeCounts[tab.key] || 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex-shrink-0 ${
                      activeTab === tab.key
                        ? "border-amber-600 text-amber-700"
                        : "border-transparent text-secondary hover:text-primary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {count > 0 && (
                      <span className="w-4 h-4 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center font-bold">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "ai" && (
                <div className="p-3 space-y-3">
                  {aiInsights.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-6 h-6 text-tertiary mx-auto mb-2" />
                      <div className="text-xs text-tertiary">No AI insights yet</div>
                    </div>
                  ) : aiInsights.map((item: any, i: number) => (
                    <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="text-xs font-semibold text-amber-800 mb-1">{item.title}</div>
                      <div className="text-xs text-amber-700 leading-relaxed">{item.insight}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="divide-y divide-slate-50">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-6 h-6 text-tertiary mx-auto mb-2" />
                      <div className="text-xs text-tertiary">No recent activity</div>
                    </div>
                  ) : activities.map((act: any, i: any) => (
                    <div key={i} className="px-3 py-2.5">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-700 text-xs font-bold">{act.actor.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-primary">{act.actor}</div>
                          <div className="text-xs text-secondary truncate">{act.action}</div>
                          <div className="text-xs text-tertiary mt-0.5">{act.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "alerts" && (
                <div className="p-3 space-y-2">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <div className="text-xs text-tertiary">No alerts</div>
                    </div>
                  ) : alerts.map((alert: any, i: any) => {
                    const styles = alert.level === "critical"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800";
                    return (
                      <div key={i} className={`rounded-xl border p-2.5 text-xs ${styles}`}>
                        {alert.message}
                      </div>
                    );
                  })}
                </div>
              )}

              {(activeTab === "related" || activeTab === "files") && (
                <div className="text-center py-8">
                  <div className="text-xs text-tertiary">
                    {activeTab === "related" ? `${relatedCount} related records` : `${filesCount} attached files`}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
