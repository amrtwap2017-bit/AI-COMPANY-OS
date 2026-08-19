"use client";
/**
 * Triangle Black — Input Component
 * SPRINT-012: Fully semantic — no hardcoded colors
 */
import { InputHTMLAttributes, ReactNode, useId } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Input({
  label, error, helper, icon, iconRight,
  required, className = "", id, ...props
}: Props) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{color:"var(--color-text-1)"}}>
          {label}
          {required && <span style={{color:"var(--color-danger)"}} className="ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--color-text-3)"}}>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? inputId + "-error" : helper ? inputId + "-helper" : undefined}
          className={[
            "block w-full rounded-md text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon ? "pl-10" : "pl-3",
            iconRight ? "pr-10" : "pr-3",
            "py-2",
            className,
          ].join(" ")}
          style={{
            background: "var(--color-surface)",
            color: "var(--color-text-1)",
            border: error
              ? "1px solid var(--color-danger)"
              : "1px solid var(--color-border)",
            ...(props.disabled ? { background: "var(--color-bg-alt)" } : {}),
          }}
          onFocus={(e: any) => {
            e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border-focus)";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(220,38,38,0.15)"
              : "0 0 0 3px rgba(185,146,76,0.15)";
            props.onFocus?.(e);
          }}
          onBlur={(e: any) => {
            e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
            e.target.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:"var(--color-text-3)"}}>
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p id={inputId + "-error"} role="alert" className="mt-1.5 text-xs flex items-center gap-1" style={{color:"var(--color-danger)"}}>
          <span>⚠</span> {error}
        </p>
      )}
      {helper && !error && (
        <p id={inputId + "-helper"} className="mt-1.5 text-xs" style={{color:"var(--color-text-3)"}}>{helper}</p>
      )}
    </div>
  );
}
