"use client";
/* design-tokens: color-danger color-border-focus color-text-1 */
import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = "", id, ...props },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all ${
          error ? "border-danger focus:ring-danger/30" : "border-border"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger font-semibold">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-tertiary">{helperText}</p>
      )}
    </div>
  );
});
