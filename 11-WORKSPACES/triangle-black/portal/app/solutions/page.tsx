"use client";
import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, ShoppingCart, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-base text-primary flex flex-col justify-between">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-lg">▲</div>
            <span className="font-bold text-lg tracking-tight">TRIANGLE BLACK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="text-xs font-semibold text-secondary hover:text-primary">How It Works</Link>
            <Link href="/case-studies" className="text-xs font-semibold text-secondary hover:text-primary">Case Studies</Link>
            <Link href="/login" className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-brand text-white hover:opacity-90">Sign In</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Purpose-Built Solutions for Hospitality Operations</h1>
          <p className="text-base text-secondary max-w-2xl mx-auto">
            From the boiler room to the executive boardroom, Triangle Black unifies asset maintenance, procurement, and financial control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold">For Directors of Engineering</h3>
            <p className="text-xs text-secondary leading-relaxed">Eliminate reactive firefighting. Gain automated PM scheduling, mobile work orders, and acoustic vibration anomaly warnings.</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold">For Asset & Hotel Owners</h3>
            <p className="text-xs text-secondary leading-relaxed">Protect long-term capital investments. Track comprehensive equipment lifecycles, warranty status, and SLA compliance.</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-surface space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold">For Procurement Teams</h3>
            <p className="text-xs text-secondary leading-relaxed">Halt emergency purchasing markups. Consolidate spare-parts demand across properties into competitive supplier RFQs.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-secondary">
        © 2026 Triangle Black Technologies. All rights reserved.
      </footer>
    </div>
  );
}
