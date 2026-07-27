// @ts-nocheck
// Triangle Black - Enterprise Input
// UI-020: Missing core component
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  helper?:   string;
  error?:    string;
  prefix?:   ReactNode;
  suffix?:   ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, prefix, suffix, required, className = "", id, ...props }, ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? inputId + "-error" : helper ? inputId + "-helper" : undefined}
          className={[
            "block w-full rounded-xl border bg-white text-sm text-slate-900",
            "placeholder-slate-400 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400",
            "disabled:bg-slate-50 disabled:text-tertiary disabled:cursor-not-allowed",
            prefix ? "pl-9" : "pl-3.5",
            suffix ? "pr-9" : "pr-3.5",
            "py-2.5",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
              : "border-slate-200 hover:border-slate-300",
            className,
          ].join(" ")}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={inputId + "-error"} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
      {helper && !error && (
        <p id={inputId + "-helper"} className="mt-1.5 text-xs text-tertiary">{helper}</p>
      )}
    </div>
  );
});
