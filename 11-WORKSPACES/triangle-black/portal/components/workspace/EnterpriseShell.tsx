"use client";

import { useState } from "react";
import { EnterpriseSidebar } from "./EnterpriseSidebar";
import { EnterpriseTopbar } from "./EnterpriseTopbar";
import { MobileCenterDrawer } from "./MobileCenterDrawer";
import { MobileBottomBar } from "./MobileBottomBar";
import { CommandPalette } from "./CommandPalette";
import { EntityContextDrawer } from "./EntityContextDrawer";

type EnterpriseShellProps = {
  children: React.ReactNode;
};

export function EnterpriseShell({ children }: EnterpriseShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MobileCenterDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <EntityContextDrawer />

      <div className="flex min-h-screen">
        <EnterpriseSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <EnterpriseTopbar />

          <div className="grid min-h-0 flex-1 gap-6 p-4 pb-24 sm:p-6 sm:pb-24 xl:grid-cols-[minmax(0,1fr)_320px] xl:pb-6">
            <main className="min-w-0">{children}</main>

            <aside className="hidden xl:block">
              <div className="space-y-4">
                {/* AI Insight Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Insights</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-2">Procurement Anomaly Detected</p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Vendor "Acme Corp" invoice #4092 is 14% above historical average for this category. 
                    <button className="text-amber-700 font-semibold hover:underline ml-1">Review</button>
                  </p>
                </div>

                {/* Quick Actions Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Actions</span>
                  <div className="mt-3 space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Create new Purchase Request
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Approve pending work orders (3)
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <MobileBottomBar />
    </div>
  );
}
