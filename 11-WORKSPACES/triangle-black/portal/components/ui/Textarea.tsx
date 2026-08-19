// @ts-nocheck
// Triangle Black - Textarea Component
// UI-028: Enterprise multiline input
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  helper?:   string;
  error?:    string;
  maxCount?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, helper, error, maxCount, className = "", id, value, ...props }: TextareaProps, ref: React.Ref<HTMLTextAreaElement>) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const currentLength = String(value || "").length;
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={textareaId} className="text-sm font-medium text-primary">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {maxCount && (
            <span className={"text-xs " + (currentLength > maxCount ? "text-red-500" : "text-tertiary")}>
              {currentLength}/{maxCount}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        aria-invalid={!!error}
        className={[
          "block w-full rounded-xl border bg-white text-sm text-primary",
          "placeholder-slate-400 transition-colors resize-y min-h-[100px]",
          "px-3.5 py-2.5",
          "focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400",
          "disabled:bg-base-alt disabled:text-tertiary disabled:cursor-not-allowed",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
            : "border-border hover:border-border",
          className,
        ].join(" ")}
        {...props}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">⚠ {error}</p>
      )}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-tertiary">{helper}</p>
      )}
    </div>
  );
});
