// @ts-nocheck
import { Search } from "lucide-react";
import { InputHTMLAttributes } from "react";
interface Props extends InputHTMLAttributes<HTMLInputElement> { label?: string }
export function SearchInput({ label, className = "", ...props }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        {...props}
        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder-slate-400 transition-all"
      />
    </div>
  );
}
