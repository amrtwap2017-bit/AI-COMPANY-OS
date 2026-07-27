
"use client";
// @ts-nocheck
// Triangle Black V7 — Enterprise Shell — Luxury Command Center
import { useState } from "react";
import { usePathname } from "next/navigation";
import { EnterpriseSidebar }   from "./EnterpriseSidebar";
import { EnterpriseTopbar }    from "./EnterpriseTopbar";
import { CenterSubNav }        from "./CenterSubNav";
import { MobileBottomBar }     from "./MobileBottomBar";
import { CommandPalette }      from "@/components/ui/CommandPalette";
import { EntityContextDrawer } from "./EntityContextDrawer";
import { CENTER_SUB_NAV }      from "./center-nav";
import { ClientKeyboardHandler } from "@/components/ui/ClientKeyboardHandler";

type EnterpriseShellProps = {
  children: React.ReactNode;
  rail?:    React.ReactNode;
};

export function EnterpriseShell({ children, rail }: EnterpriseShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();

  const centerKey = Object.keys(CENTER_SUB_NAV).find(key =>
    pathname.startsWith("/" + key)
  );
  const subNavItems = centerKey ? CENTER_SUB_NAV[centerKey] : [];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <EntityContextDrawer />

      {/* Sidebar */}
      <EnterpriseSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        <EnterpriseTopbar />

        {subNavItems.length > 1 && (
          <CenterSubNav items={subNavItems} />
        )}

        {rail ? (
          <div className="grid min-h-0 flex-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0" id="main-content">{children}</main>
            <aside className="hidden xl:block">
              <div className="sticky top-20 space-y-4">{rail}</div>
            </aside>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto" id="main-content">
            {children}
          </main>
        )}
      </div>

      <MobileBottomBar />
      <ClientKeyboardHandler onOpenSearch={() => setCommandOpen(true)} />
    </div>
  );
}
