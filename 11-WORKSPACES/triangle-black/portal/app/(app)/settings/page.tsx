// @ts-nocheck
"use client";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { User, Shield, Bell, Globe, Database, Cpu, ArrowRight } from "lucide-react";

const SETTINGS = [
  { icon:User,     label:"Profile",         desc:"Manage your account details",           href:"/profile" },
  { icon:Bell,     label:"Notifications",    desc:"Configure alert preferences",           href:"/notifications" },
  { icon:Shield,   label:"Security",         desc:"Password and authentication settings",  href:"/profile" },
  { icon:Globe,    label:"Language & Region",desc:"Egypt · Arabic/English",                href:"/profile" },
  { icon:Database, label:"Data & Export",    desc:"Manage data and exports",               href:"/reports" },
  { icon:Cpu,      label:"AI Settings",      desc:"Configure AI assistant behavior",       href:"/engineering/ai" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Settings" subtitle="Platform configuration" badge="CFG"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS.map(s=>(
          <Link key={s.label} href={s.href}
            className="bg-white rounded-2xl border border-slate-200 p-5
              hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center
              group-hover:bg-amber-50 mb-4">
              <s.icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600"/>
            </div>
            <p className="font-semibold text-sm text-slate-900">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 mt-3"/>
          </Link>
        ))}
      </div>
    </div>
  );
}
