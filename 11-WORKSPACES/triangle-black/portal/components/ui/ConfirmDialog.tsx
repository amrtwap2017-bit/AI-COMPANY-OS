// @ts-nocheck
"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title:       string;
  description: string;
  onConfirm:   () => void | Promise<void>;
  onCancel?:   () => void;
  variant?:    "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?:  string;
}

export function ConfirmDialog({
  title, description, onConfirm, onCancel,
  variant = "danger",
  confirmText = "Confirm",
  cancelText  = "Cancel",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const colors = {
    danger:  { bg: "bg-red-600",    hover: "hover:bg-red-700",   icon: "text-red-500"  },
    warning: { bg: "bg-amber-600",  hover: "hover:bg-amber-700", icon: "text-amber-500"},
    info:    { bg: "bg-blue-600",   hover: "hover:bg-blue-700",  icon: "text-blue-500" },
  }[variant];

  async function handleConfirm() {
    setLoading(true);
    try { await onConfirm(); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <button onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <div className={`w-12 h-12 rounded-full bg-red-50 flex items-center
          justify-center mb-4 ${colors.icon}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200
              text-slate-700 text-sm font-medium hover:bg-slate-50">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-xl text-white text-sm
              font-medium disabled:opacity-60 ${colors.bg} ${colors.hover}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy use
export function useConfirm() {
  const [config, setConfig] = useState<ConfirmDialogProps | null>(null);

  function confirm(props: ConfirmDialogProps) {
    setConfig(props);
  }

  function close() { setConfig(null); }

  return {
    confirm,
    dialog: config ? <ConfirmDialog {...config} onCancel={close} /> : null,
  };
}
