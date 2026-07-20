// @ts-nocheck
"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cpu, Brain, BarChart3, Wrench, FileText, ArrowRight, Zap } from "lucide-react";

const MODULES = [
  { label:"AI Assistant",    href:"/engineering/ai",           icon:Brain,    desc:"AI-powered engineering support",          badge:"AI",    highlight:true },
  { label:"Intelligence",    href:"/engineering/intelligence", icon:Zap,      desc:"Smart insights for engineering ops",       badge:"INTEL" },
  { label:"Engineering Hub", href:"/engineering",             icon:Cpu,      desc:"Full engineering dashboard & overview",    badge:"ENG" },
  { label:"Actions",         href:"/engineering/actions",     icon:Wrench,   desc:"Engineering action center",               badge:"ACT" },
  { label:"Review",          href:"/engineering/review",      icon:BarChart3,desc:"Engineering performance review",           badge:"REV" },
  { label:"Projects Center", href:"/projects-center",         icon:FileText, desc:"All engineering projects overview",        badge:"PRJ" },
];

export default function EngineeringCenterPage() {
  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb/>
      <PageHeader title="Engineering Center" subtitle="AI-powered hotel engineering management" badge="ENG"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(mod=>{
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={`group flex flex-col p-5 rounded-2xl border transition-all duration-200 ${
                mod.highlight
                  ? "bg-slate-900 border-slate-700 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
              }`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                mod.highlight ? "bg-amber-500/20 text-amber-400" : "bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600"
              }`}>
                <Icon className="w-5 h-5"/>
              </div>
              <div className="flex items-start justify-between mb-1">
                <p className={`font-bold text-sm ${mod.highlight?"text-white":"text-slate-900"}`}>{mod.label}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${mod.highlight?"bg-amber-500/20 text-amber-400":"bg-slate-100 text-slate-500"}`}>{mod.badge}</span>
              </div>
              <p className={`text-xs ${mod.highlight?"text-slate-400":"text-slate-500"}`}>{mod.desc}</p>
              <ArrowRight className={`w-4 h-4 mt-auto pt-3 ${mod.highlight?"text-amber-400 opacity-0 group-hover:opacity-100":"text-slate-300 group-hover:text-amber-500"} transition-all`}/>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
