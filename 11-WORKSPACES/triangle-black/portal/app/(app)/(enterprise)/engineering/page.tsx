"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, PageWrapper, LoadingState } from "@/components/ui";
import { maintenanceApi } from "@/lib/maintenance-api";
import { Wrench, Zap, BarChart3, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast";

const MODULES = [
  { label: "AI Assistant",  href: "/engineering/ai",          icon: Zap,      desc: "Engineering AI workspace",     highlight: true },
  { label: "Intelligence",  href: "/engineering/intelligence", icon: BarChart3,desc: "Cross-section intelligence" },
  { label: "Actions",       href: "/engineering/actions",      icon: Wrench,   desc: "Site visit and inspection actions" },
  { label: "Review",        href: "/engineering/review",       icon: FileText, desc: "Inspection and quality review" },
];

export default function EngineeringPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Engineering Center"
        subtitle="Projects, documents, inspections, and site management"
        badge="ENG" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}
              className={
                "group rounded-2xl border p-5 hover:shadow-sm transition-all " +
                (mod.highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200 hover:border-amber-300")
              }>
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + (mod.highlight ? "bg-amber-200" : "bg-slate-100 group-hover:bg-amber-50")}>
                <Icon className={"w-5 h-5 " + (mod.highlight ? "text-amber-700" : "text-slate-500 group-hover:text-amber-600")} />
              </div>
              <p className="font-semibold text-sm text-slate-900">{mod.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 mt-3 transition-colors" />
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
