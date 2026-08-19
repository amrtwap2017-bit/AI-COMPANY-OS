// @ts-nocheck
"use client";
import { getStateColor } from "@/lib/hooks/useWorkflow";
import { ChevronRight } from "lucide-react";

interface WFBarProps {
  state:       string;
  available:   { to: string; label: string; color?: string }[];
  onTransition:(to: string) => void;
  loading?:    boolean;
}

export function WorkflowBar({ state, available, onTransition, loading }: WFBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={"text-xs font-bold px-3 py-1.5 rounded-full " + getStateColor(state)}>
        {state.replace(/_/g," ").toUpperCase()}
      </span>
      {available.map((t: any) => (
        <button key={t.to} onClick={() => onTransition(t.to)} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-inverse text-xs font-semibold rounded-xl disabled:opacity-60 transition-colors">
          {t.label} <ChevronRight className="w-3 h-3"/>
        </button>
      ))}
    </div>
  );
}
