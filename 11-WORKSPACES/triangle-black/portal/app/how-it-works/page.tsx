"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Cpu, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-base text-primary flex flex-col justify-between">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-lg">▲</div>
            <span className="font-bold text-lg tracking-tight">TRIANGLE BLACK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/solutions" className="text-xs font-semibold text-secondary hover:text-primary">Solutions</Link>
            <Link href="/case-studies" className="text-xs font-semibold text-secondary hover:text-primary">Case Studies</Link>
            <Link href="/login" className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-brand text-white hover:opacity-90">Sign In</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">The Closed-Loop Operational Intelligence Architecture</h1>
          <p className="text-base text-secondary max-w-2xl mx-auto">
            How Triangle Black bridges physical equipment telemetry with transactional financial governance.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-surface space-y-2">
            <span className="text-xs font-bold text-brand uppercase">Step 1</span>
            <h3 className="text-base font-bold">Continuous Equipment Ingestion & Triage</h3>
            <p className="text-xs text-secondary leading-relaxed">Service requests and sensor anomalies are automatically categorized with SLA timers and linked to central asset records.</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-2">
            <span className="text-xs font-bold text-brand uppercase">Step 2</span>
            <h3 className="text-base font-bold">Governed AI Maintenance Advisory</h3>
            <p className="text-xs text-secondary leading-relaxed">The AI Maintenance Director analyzes failure history and recommends precision overhauls with evidence chains.</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-2">
            <span className="text-xs font-bold text-brand uppercase">Step 3</span>
            <h3 className="text-base font-bold">Execution & Auto-Settlement</h3>
            <p className="text-xs text-secondary leading-relaxed">Technicians submit digital service reports, trigger automatic invoice generation, and update executive read models.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-secondary">
        © 2026 Triangle Black Technologies. All rights reserved.
      </footer>
    </div>
  );
}
