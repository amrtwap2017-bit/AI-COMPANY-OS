"use client";
// @ts-nocheck
// Triangle Black V7 — Sticky Action Bar
// Sits between WorkspaceHeader and content
// Search + filters + bulk actions + export
import { useState } from "react";

interface ActionBarProps {
  search?:      { value: string; onChange: (v: string) => void; placeholder?: string };
  filters?:     { label: string; value: string; onChange: (v: string) => void; options: {label:string; value:string}[] }[];
  actions?:     { label: string; icon?: string; onClick: () => void; variant?: "primary"|"danger" }[];
  count?:       { total: number; filtered: number };
  onClear?:     () => void;
  hasFilters?:  boolean;
}

export function ActionBar({ search, filters=[], actions=[], count, onClear, hasFilters }: ActionBarProps) {
  return (
    <div style={{
      background:   "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      padding:      "10px 32px",
      display:      "flex",
      alignItems:   "center",
      gap:          10,
      flexWrap:     "wrap",
      position:     "sticky",
      top:          56, // topbar height
      zIndex:       20,
      backdropFilter: "blur(8px)",
    }}>

      {/* Search */}
      {search && (
        <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:"var(--color-text-3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search..."}
            style={{
              width:        "100%",
              paddingLeft:  30,
              paddingRight: 12,
              paddingTop:   7,
              paddingBottom:7,
              borderRadius: 8,
              border:       "1px solid var(--color-border)",
              background:   "var(--color-bg-alt)",
              fontSize:     "0.8125rem",
              color:        "var(--color-text-1)",
              outline:      "none",
              transition:   "border 150ms ease",
            }}
            onFocus={e => e.target.style.borderColor = "var(--color-brand)"}
            onBlur={e  => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>
      )}

      {/* Filters */}
      {filters.map((f: any, i: number) => (
        <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)}
          style={{
            padding:      "7px 10px",
            borderRadius: 8,
            border:       "1px solid var(--color-border)",
            background:   "var(--color-bg-alt)",
            fontSize:     "0.75rem",
            color:        f.value !== "all" ? "var(--color-text-1)" : "var(--color-text-3)",
            outline:      "none",
            cursor:       "pointer",
            fontWeight:   f.value !== "all" ? 600 : 400,
          }}>
          {f.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ))}

      {/* Clear */}
      {hasFilters && onClear && (
        <button onClick={onClear} style={{ padding:"7px 10px", borderRadius:8, border:"1px solid var(--color-border)", background:"transparent", fontSize:"0.75rem", color:"var(--color-text-3)", cursor:"pointer" }}>
          Clear ×
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Count */}
      {count && (
        <span style={{ fontSize:"0.6875rem", color:"var(--color-text-3)", flexShrink:0 }}>
          {count.filtered === count.total ? `${count.total} records` : `${count.filtered} of ${count.total}`}
        </span>
      )}

      {/* Actions */}
      {actions.map((a: any, i: number) => (
        <button key={i} onClick={a.onClick}
          style={{
            padding:      "7px 14px",
            borderRadius: 8,
            border:       a.variant === "primary" ? "none" : "1px solid var(--color-border)",
            background:   a.variant === "primary" ? "var(--color-brand)" : a.variant === "danger" ? "var(--color-danger-bg)" : "var(--color-surface)",
            color:        a.variant === "primary" ? "#fff" : a.variant === "danger" ? "var(--color-danger-text)" : "var(--color-text-2)",
            fontSize:     "0.75rem",
            fontWeight:   700,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          5,
            transition:   "all 120ms ease",
          }}>
          {a.icon && <span>{a.icon}</span>}
          {a.label}
        </button>
      ))}
    </div>
  );
}

export default ActionBar;
