// @ts-nocheck
// Triangle Black - EmptyState
// UI-035: Enterprise appropriate, Lucide icon support
import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface Props {
  icon?:        string | ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyState({ icon, title, description, action, secondaryAction }: Props) {
  const isEmoji = typeof icon === "string";
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
        {!icon && <Inbox className="w-7 h-7 text-slate-300" />}
        {isEmoji && <span className="text-2xl">{icon as string}</span>}
        {!isEmoji && icon && <span className="[&>svg]:w-7 [&>svg]:h-7 [&>svg]:text-slate-400">{icon as ReactNode}</span>}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
