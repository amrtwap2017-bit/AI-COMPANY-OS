// @ts-nocheck
"use client";
import Link from "next/link";
import { PageWrapper, PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { User, Bell, Shield, Globe, Database, Cpu, Users, Building2, ArrowRight, Settings } from "lucide-react";

const SECTIONS = [
  { title:"Account",      items:[
    { icon:User,     label:"My Profile",          desc:"Personal info, avatar, password",    href:"/profile" },
    { icon:Bell,     label:"Notifications",        desc:"Alert preferences, email settings",  href:"/notifications" },
    { icon:Shield,   label:"Security",             desc:"Password, 2FA, sessions",            href:"/profile" },
  ]},
  { title:"Organization", items:[
    { icon:Building2,label:"Hotel Settings",       desc:"Hotel info, branding, contacts",     href:"/administration" },
    { icon:Users,    label:"Team & Users",         desc:"Manage users, roles, permissions",   href:"/administration/users" },
    { icon:Globe,    label:"Language & Region",    desc:"Egypt · Arabic/English · EGP",       href:"/profile" },
  ]},
  { title:"Platform",     items:[
    { icon:Database, label:"Data & Backup",        desc:"Export data, backup settings",       href:"/reports" },
    { icon:Cpu,      label:"AI & Integrations",    desc:"AI assistant, API keys, webhooks",   href:"/engineering/ai" },
    { icon:Settings, label:"System Config",        desc:"Advanced platform configuration",    href:"/administration" },
  ]},
];

export default function SettingsPage() {
  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Settings" subtitle="Platform configuration and preferences" badge="CFG"/>
      <div className="space-y-6 max-w-3xl">
        {(SECTIONS || []).map(section=>(
          <div key={section.title}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{section.title}</h2>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {(Array.isArray(section.items) ? section.items : []).map(item=>(
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-amber-50 transition-colors flex-shrink-0">
                    <item.icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors"/>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
