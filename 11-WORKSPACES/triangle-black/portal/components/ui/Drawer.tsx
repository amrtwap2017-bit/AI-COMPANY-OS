"use client";
// @ts-nocheck
// Triangle Black - Drawer Component
// UI-024: Slide-in panel from right or left
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  ReactNode;
  footer?:   ReactNode;
  side?:     "right" | "left";
  width?:    "sm" | "md" | "lg";
}

const WIDTHS: Record<string, string> = {
  sm:  "max-w-xs",
  md:  "max-w-md",
  lg:  "max-w-2xl",
};

export function Drawer({
  open, onClose, title, children, footer,
  side = "right", width = "md",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={
        "absolute top-0 bottom-0 flex flex-col bg-white shadow-xl border-slate-200 w-full " +
        WIDTHS[width] + " " +
        (side === "right" ? "right-0 border-l" : "left-0 border-r")
      }>
        {(title || onClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
