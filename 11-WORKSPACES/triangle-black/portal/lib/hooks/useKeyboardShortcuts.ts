// @ts-nocheck
/**
 * useKeyboardShortcuts — Triangle Black global keyboard navigation
 *
 * Shortcuts:
 *   /         → Open command palette (global search)
 *   G + W     → Go to Work Orders
 *   G + L     → Go to Leads
 *   G + A     → Go to Assets
 *   G + P     → Go to Projects
 *   G + I     → Go to Inventory
 *   G + D     → Go to Executive Dashboard
 *   G + T     → Go to Technicians
 *   G + N     → Go to Notifications
 *   G + M     → Go to Maintenance
 *   Esc       → Close modals / clear G-chord
 *   ?         → Show keyboard shortcuts help
 */
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<string, string> = {
  w: "/operations/work-orders",
  l: "/commercial/leads",
  a: "/maintenance/assets",
  p: "/projects-center",
  i: "/supply-chain/inventory",
  d: "/executive",
  t: "/operations/technicians",
  n: "/administration/audit",
  m: "/maintenance",
  s: "/supply-chain",
  c: "/commercial/contracts",
  r: "/executive/reports",
  b: "/operations/bulk",
  k: "/administration/platform",
  u: "/customers/success",
};

interface ShortcutOptions {
  onOpenSearch?: () => void;
  onShowHelp?:  () => void;
  enabled?:     boolean;
}

export function useKeyboardShortcuts({
  onOpenSearch,
  onShowHelp,
  enabled = true,
}: ShortcutOptions = {}) {
  const router = useRouter();
  const [gPressed, setGPressed] = useState(false);
  const [gTimer, setGTimer]     = useState<NodeJS.Timeout | null>(null);
  const [lastShortcut, setLastShortcut] = useState<string>("");

  const clearGChord = useCallback(() => {
    setGPressed(false);
    if (gTimer) clearTimeout(gTimer);
  }, [gTimer]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      // / key — open search (not in input fields)
      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenSearch?.();
        setLastShortcut("/");
        return;
      }

      // ? key — show help
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        onShowHelp?.();
        setLastShortcut("?");
        return;
      }

      // Escape — clear G-chord
      if (e.key === "Escape") {
        clearGChord();
        return;
      }

      // G key — start G-chord
      if (e.key === "g" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setGPressed(true);
        setLastShortcut("G");
        // Auto-clear after 2 seconds
        const timer = setTimeout(clearGChord, 2000);
        setGTimer(timer);
        return;
      }

      // G + letter navigation
      if (gPressed && !isInput) {
        const key = e.key.toLowerCase();
        const route = ROUTES[key];
        if (route) {
          e.preventDefault();
          clearGChord();
          router.push(route);
          setLastShortcut(`G+${e.key.toUpperCase()}`);
          return;
        }
        // Unknown key after G — clear chord
        clearGChord();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, gPressed, clearGChord, router, onOpenSearch, onShowHelp]);

  return {
    isGChordActive: gPressed,
    lastShortcut,
    shortcuts: Object.entries(ROUTES).map(([key, route]) => ({
      key:   `G + ${key.toUpperCase()}`,
      route,
      label: route.split("/").filter(Boolean).join(" / "),
    })),
  };
}

export default useKeyboardShortcuts;
