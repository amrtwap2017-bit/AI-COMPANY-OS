"use client";
// @ts-nocheck
import Link from "next/link";
import { PageHeader, PageWrapper, SectionCard, AlertBanner } from "@/components/ui";
import { Shield, Users, Bell, Building2, Settings,
  Database, ArrowRight, Lock } from "lucide-react";

const MODULES = [
  { label: "Hotels & Properties", href: "/administration/hotels",        icon: Building2,desc: "Hotel and property management", section: "Core" },
  { label: "Notification Rules",  href: "/admin/notification-rules",     icon: Bell,     desc: "Alert routing configuration",   section: "Core" },
  { label: "Profile",             href: "/profile",                      icon: Users,    desc: "Your account settings",         section: "Account" },
  { label: "Settings",            href: "/settings",                     icon: Settings, desc: "Platform configuration",        section: "Account" },
];

const sections = [...new Set(MODULES.map(m => m.section))];

export default function AdministrationPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Administration"
        subtitle="Users, settings, audit and system management"
        badge="ADMIN" />

      <AlertBanner type="info"
        title="Enterprise Administration"
        description="User management and audit log are available to administrators. Additional features coming in the next release." />

      {sections.map(section => (
        <SectionCard key={section} title={section + " Management"}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MODULES.filter(m => m.section === section).map(mod => {
              const Icon = mod.icon;
              return (
                <Link key={mod.href} href={mod.href}
                  className="group flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-amber-300">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">{mod.label}</p>
                    <p className="text-xs text-slate-400 truncate">{mod.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      ))}

      <SectionCard title="Coming Soon" subtitle="Planned features for next release">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["User Management", "Role Management", "Audit Log", "API Keys", "Webhooks", "Integrations"].map(f => (
            <div key={f} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 opacity-60">
              <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">{f}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
