"use client"; // @ts-nocheck
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["/"],        description: "Open global search" },
  { keys: ["?"],        description: "Show this help" },
  { keys: ["G", "W"],   description: "Go to Work Orders" },
  { keys: ["G", "L"],   description: "Go to Leads" },
  { keys: ["G", "A"],   description: "Go to Assets" },
  { keys: ["G", "P"],   description: "Go to Projects" },
  { keys: ["G", "I"],   description: "Go to Inventory" },
  { keys: ["G", "D"],   description: "Go to Dashboard" },
  { keys: ["G", "T"],   description: "Go to Technicians" },
  { keys: ["G", "M"],   description: "Go to Maintenance" },
  { keys: ["G", "S"],   description: "Go to Supply Chain" },
  { keys: ["G", "C"],   description: "Go to Contracts" },
  { keys: ["G", "R"],   description: "Go to Reports" },
  { keys: ["G", "U"],   description: "Go to Customer Success" },
  { keys: ["G", "K"],   description: "Go to Platform Status" },
  { keys: ["Esc"],      description: "Close modal / cancel G-chord" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function KeyBadge({ k }: { k: string }) {
  return (
    <span className="inline-flex items-center justify-center min-w-8 h-7 px-2
                     bg-slate-100 border border-slate-300 rounded text-xs font-mono
                     font-semibold text-slate-700 shadow-sm">
      {k}
    </span>
  );
}

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="font-semibold text-stone-800">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-tertiary hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {SHORTCUTS.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{s.description}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <KeyBadge k={k} />
                      {j < s.keys.length - 1 && (
                        <span className="text-xs text-tertiary">then</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-stone-200">
          <p className="text-xs text-tertiary text-center">
            Press <KeyBadge k="?" /> anytime to show this panel · Press <KeyBadge k="Esc" /> to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
