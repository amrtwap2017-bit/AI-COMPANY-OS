"use client";
import React from "react";
import Link from "next/link";
import { Award, CheckCircle2, TrendingDown, Clock, ShieldCheck } from "lucide-react";

export default function CaseStudiesPage() {
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
            <Link href="/how-it-works" className="text-xs font-semibold text-secondary hover:text-primary">How It Works</Link>
            <Link href="/login" className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-brand text-white hover:opacity-90">Sign In</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Proven Commercial Case Studies</h1>
          <p className="text-base text-secondary max-w-2xl mx-auto">
            Real operational results from Sharm El-Sheikh luxury hospitality resorts.
          </p>
        </div>

        <div className="p-8 rounded-xl border border-border bg-surface space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-4">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Hospitality Pilot Case Study</span>
              <h2 className="text-xl font-bold text-primary mt-1">Red Sea Grand Resort & Spa — Sharm El-Sheikh</h2>
              <p className="text-xs text-secondary mt-0.5">400 Guest Rooms • 5 Central Chiller Plants • 3 Commercial Kitchens</p>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-success-bg text-success-text border border-success-border">
              90-Day Pilot Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
            <div className="p-4 rounded-lg bg-surface-alt border border-border">
              <div className="text-2xl font-extrabold text-brand">$42,500</div>
              <div className="text-xs text-secondary mt-1">Prevented Emergency Spend</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-alt border border-border">
              <div className="text-2xl font-extrabold text-success">0 Hours</div>
              <div className="text-xs text-secondary mt-1">Unplanned Chiller Downtime</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-alt border border-border">
              <div className="text-2xl font-extrabold text-primary">98.2%</div>
              <div className="text-xs text-secondary mt-1">PM Schedule Compliance</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-secondary">
        © 2026 Triangle Black Technologies. All rights reserved.
      </footer>
    </div>
  );
}
