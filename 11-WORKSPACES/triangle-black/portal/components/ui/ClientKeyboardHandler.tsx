"use client"; // @ts-nocheck
/**
 * ClientKeyboardHandler - Safe keyboard shortcut handler
 * This is a dedicated client component to avoid hook injection issues.
 * Renders nothing visible - only handles keyboard events.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

const ROUTES: Record<string, string> = {
  w: "/operations/work-orders",
  l: "/commercial/leads",
  a: "/maintenance/assets",
  p: "/projects-center",
  i: "/supply-chain/inventory",
  d: "/executive",
  t: "/operations/technicians",
  m: "/maintenance",
  s: "/supply-chain",
  c: "/commercial/contracts",
  r: "/executive/reports",
  b: "/operations/bulk",
  k: "/administration/platform",
  u: "/customers/success",
  n: "/supply-chain/intake",
};

export function ClientKeyboardHandler({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const router = useRouter();
  const [gPressed, setGPressed]   = useState(false);
  const [helpOpen, setHelpOpen]   = useState(false);
  const [gTimer, setGTimer]       = useState<any>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = ["INPUT","TEXTAREA","SELECT"].includes(tag);

      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setGPressed(false);
        if (gTimer) clearTimeout(gTimer);
        return;
      }
      if (e.key === "g" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setGPressed(true);
        const timer = setTimeout(() => setGPressed(false), 2000);
        setGTimer(timer);
        return;
      }
      if (gPressed && !isInput) {
        const route = ROUTES[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          setGPressed(false);
          if (gTimer) clearTimeout(gTimer);
          router.push(route);
        } else {
          setGPressed(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gPressed, gTimer, router, onOpenSearch]);

  return (
    <>
      <KeyboardShortcutsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      {gPressed && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2
                        bg-slate-800 text-white text-sm rounded-lg shadow-xl pointer-events-none">
          G + ? — press shortcut key...
        </div>
      )}
    </>
  );
}

export default ClientKeyboardHandler;
