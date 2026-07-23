"use client";
// @ts-nocheck
// Triangle Black - Enterprise Shell
// UI-3: Added CenterSubNav for within-center navigation
import { useState } from "react";
import { usePathname } from "next/navigation";
import { EnterpriseSidebar }   from "./EnterpriseSidebar";
import { EnterpriseTopbar }    from "./EnterpriseTopbar";
import { CenterSubNav }        from "./CenterSubNav";
import { MobileCenterDrawer }  from "./MobileCenterDrawer";
import { MobileBottomBar }     from "./MobileBottomBar";
import { CommandPalette }      from "./CommandPalette";
import { EntityContextDrawer } from "./EntityContextDrawer";
import { CENTER_SUB_NAV }      from "./center-nav";

import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";

type EnterpriseShellProps = {
  children: React.ReactNode;
  rail?:    React.ReactNode;
};

export function EnterpriseShell({ children, rail }: EnterpriseShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [kbHelpOpen, setKbHelpOpen] = useState(false);
  const [kbPaletteOpen, setKbPaletteOpen] = useState(false);

  const { isGChordActive } = useKeyboardShortcuts({
    onOpenSearch: () => setKbPaletteOpen(true),
    onShowHelp:   () => setKbHelpOpen(true),
  });
  const pathname = usePathname();

  // Determine which center is active and get its sub-nav
  const centerKey = Object.keys(CENTER_SUB_NAV).find(key =>
    pathname.startsWith("/" + key)
  );
  const subNavItems = centerKey ? CENTER_SUB_NAV[centerKey] : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <EntityContextDrawer />

      <div className="flex min-h-screen">
        <EnterpriseSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <EnterpriseTopbar />

          {subNavItems.length > 1 && (
            <CenterSubNav items={subNavItems} />
          )}

          {rail ? (
            <div className="grid min-h-0 flex-1 gap-6 p-4 pb-24 sm:p-6 sm:pb-24 xl:grid-cols-[minmax(0,1fr)_320px] xl:pb-6">
              <main className="min-w-0" id="main-content">{children}</main>
              <aside className="hidden xl:block">
                <div className="sticky top-20 space-y-4">{rail}</div>
              </aside>
            </div>
          ) : (
            <main className="min-h-0 flex-1 overflow-y-auto" id="main-content">
              {children}
            </main>
          )}
        </div>
      </div>

      <MobileBottomBar />
    
      <KeyboardShortcutsModal isOpen={kbHelpOpen} onClose={() => setKbHelpOpen(false)} />
      {kbPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40"
             onClick={() => setKbPaletteOpen(false)} />
      )}
      {isGChordActive && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                        px-4 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl
                        pointer-events-none">
          G + ? — waiting for shortcut key...
        </div>
      )}
    </div>
  );
}
