// @ts-nocheck
// Triangle Black - Enterprise Shell
// Fix: Removed shell padding so pages control their own spacing
// Fix: Pages no longer appear as nested "second site"
// Feature: rail slot for page-controlled context panel
"use client";

import { useState } from "react";
import { EnterpriseSidebar }   from "./EnterpriseSidebar";
import { EnterpriseTopbar }    from "./EnterpriseTopbar";
import { MobileCenterDrawer }  from "./MobileCenterDrawer";
import { MobileBottomBar }     from "./MobileBottomBar";
import { CommandPalette }      from "./CommandPalette";
import { EntityContextDrawer } from "./EntityContextDrawer";

type EnterpriseShellProps = {
  children: React.ReactNode;
  rail?:    React.ReactNode;
};

export function EnterpriseShell({ children, rail }: EnterpriseShellProps) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileCenterDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette     open={commandOpen} onClose={() => setCommandOpen(false)} />
      <EntityContextDrawer />

      <div className="flex min-h-screen">
        <EnterpriseSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <EnterpriseTopbar />

          {/* Content area - NO shell padding, pages own their spacing */}
          {rail ? (
            <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_320px]">
              <main className="min-w-0 overflow-y-auto">{children}</main>
              <aside className="hidden xl:block border-l border-slate-200 overflow-y-auto">
                <div className="sticky top-0 p-4 space-y-4">{rail}</div>
              </aside>
            </div>
          ) : (
            <main className="min-h-0 flex-1 overflow-y-auto">
              {children}
            </main>
          )}
        </div>
      </div>

      <MobileBottomBar />
    </div>
  );
}
