// @ts-nocheck
"use client";
import { useState, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { StatusPill, Button } from ".";

interface Tab { key: string; label: string; icon?: string }
interface Action { label: string; onClick: () => void; variant?: "primary"|"secondary"|"danger" }
interface HeroMetric { label: string; value: string | number; color?: string }

interface Props {
  backHref?: string;
  backLabel?: string;
  entityType: string;
  entityCode?: string;
  title: string;
  subtitle?: string;
  status?: string;
  heroMetrics?: HeroMetric[];
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  actions?: Action[];
  onRefresh?: () => void;
  children: ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function EntityShell({
  backHref, backLabel, entityType, entityCode, title, subtitle, status,
  heroMetrics = [], tabs, activeTab, onTabChange, actions = [],
  onRefresh, children, badge, badgeColor = "amber",
}: Props) {
  return (
    <div className="space-y-0 -mt-6 -mx-6">
      {/* Entity Header */}
      <div className="bg-white border-b border-stone-200 px-6 pt-6 pb-0">
        {/* Back + breadcrumb */}
        {backHref && (
          <div className="flex items-center gap-2 mb-4">
            <Link href={backHref}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-amber-700 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              {backLabel || "Back"}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-tertiary bg-slate-100 px-2 py-0.5 rounded-md font-medium">{entityType}</span>
            {entityCode && <span className="text-xs text-tertiary">{entityCode}</span>}
          </div>
        )}

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-stone-900 truncate">{title}</h1>
              {status && <StatusPill status={status} dot />}
              {badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-${badgeColor}-100 text-${badgeColor}-700 border border-${badgeColor}-200`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onRefresh && (
              <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRefresh}>
                Refresh
              </Button>
            )}
            {actions.map(action => (
              <Button key={action.label} variant={action.variant || "secondary"} size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Hero metrics */}
        {heroMetrics.length > 0 && (
          <div className="flex items-center gap-6 mb-4 pb-4 border-b border-stone-100">
            {heroMetrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div>
                  <div className="text-xs text-tertiary font-medium">{m.label}</div>
                  <div className={`text-lg font-bold ${m.color ? `text-${m.color}-600` : "text-stone-900"}`}>{m.value}</div>
                </div>
                {i < heroMetrics.length - 1 && <div className="w-px h-8 bg-slate-200 ml-2" />}
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center gap-0 -mb-px">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-secondary hover:text-stone-800 hover:border-slate-300"
              }`}>
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="px-6 py-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
