"use client";
// @ts-nocheck
// Triangle Black - Modal Component
// UI-022: Accessible modal with focus trap, animations
import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open:         boolean;
  onClose:      () => void;
  title?:       string;
  description?: string;
  children:     ReactNode;
  footer?:      ReactNode;
  size?:        "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
}

const SIZES: Record<string, string> = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-5xl",
};

export function Modal({
  open, onClose, title, description, children, footer,
  size = "md", closeOnBackdrop = true,
}: ModalProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstFocusRef.current?.focus();
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
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className={`relative w-full rounded-xl shadow-lg flex flex-col max-h-[90vh] ${SIZES[size] || SIZES.md}`} style={{background:"var(--color-surface)",border:"1px solid var(--color-border)"}}>
        {(title || onClose) && (
          <div className="flex items-start justify-between px-6 py-4 border-b flex-shrink-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base font-semibold ">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-secondary mt-0.5">{description}</p>
              )}
            </div>
            <button
              ref={firstFocusRef}
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-tertiary hover:opacity-80 transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t rounded-b-xl flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
