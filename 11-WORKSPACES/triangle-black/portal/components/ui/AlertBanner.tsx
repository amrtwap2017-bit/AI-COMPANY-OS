// @ts-nocheck
import { ReactNode } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, Lightbulb, X } from "lucide-react";

interface Props {
  type?: "info" | "success" | "warning" | "error" | "neutral";
  title?: string;
  message?: string;
  description?: string;
  action?: ReactNode;
  onClose?: () => void;
  onDismiss?: () => void;
}

const config = {
  info:    { icon: Info,          bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-800",    icon_color: "text-blue-500"    },
  success: { icon: CheckCircle,   bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon_color: "text-emerald-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   icon_color: "text-amber-500"   },
  error:   { icon: XCircle,       bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     icon_color: "text-red-500"     },
  neutral: { icon: Lightbulb,     bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700",   icon_color: "text-tertiary"   },
};

export function AlertBanner({
  type = "info",
  title,
  message,
  description,
  action,
  onClose,
  onDismiss,
}: Props) {
  const c = config[type];
  const Icon = c.icon;
  const displayTitle = title ?? message ?? "";
  const handleClose = onClose ?? onDismiss;
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${c.bg} ${c.border}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.icon_color}`} />
      <div className={`flex-1 min-w-0 ${c.text}`}>
        <div className="font-semibold text-sm">{displayTitle}</div>
        {description && (
          <div className="text-xs mt-0.5 opacity-80 leading-relaxed">{description}</div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {handleClose && (
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors ${c.text} opacity-60 hover:opacity-100`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
