"use client";
// @ts-nocheck
// Triangle Black - Search Input
// UI-033: Added clear button, keyboard hint
import { Search, X } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  onClear?:  () => void;
  showHint?: boolean;
}

export function SearchInput({ label, className = "", onClear, value, showHint, onChange, ...props }: Props) {
  const hasValue = String(value || "").length > 0;
  return (
    <div className={"relative " + className}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        aria-label={label || "Search"}
        {...props}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder-slate-400 transition-all"
      />
      {hasValue && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-tertiary hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      ) : showHint ? (
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 border border-stone-200 rounded px-1.5 py-0.5 pointer-events-none">/</kbd>
      ) : null}
    </div>
  );
}
