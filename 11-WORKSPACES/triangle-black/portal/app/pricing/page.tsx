"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const { data: matrixData } = useQuery(
    ["public-plans-matrix"],
    () => fetch("/api/v1/plans/matrix").then(r => r.json()),
    { staleTime: 60000 }
  );

  const plans = matrixData?.plans || [];

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col justify-between">
      {/* Navigation */}
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

      {/* Main Pricing Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
            <Sparkles className="w-3.5 h-3.5" /> Transparent SaaS Packaging
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Predictable Operational Pricing</h1>
          <p className="text-base text-secondary">
            Deploy Triangle Black on a single property or scale across an entire luxury resort portfolio.
          </p>

          {/* Billing Switch */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-bold">
            <span className={!annual ? "text-primary" : "text-secondary"}>Monthly Billing</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full bg-brand p-1 flex items-center transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-6" : ""}`} />
            </button>
            <span className={annual ? "text-primary flex items-center gap-1" : "text-secondary"}>
              Annual Billing <span className="text-[10px] text-brand bg-brand-light px-1.5 py-0.5 rounded border border-brand-border">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p: any) => (
            <div
              key={p.id}
              className={`p-8 rounded-2xl border bg-surface space-y-6 flex flex-col justify-between transition-all ${
                p.is_featured ? "border-brand ring-1 ring-brand shadow-lg relative" : "border-border shadow-sm"
              }`}
            >
              {p.is_featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-brand text-white uppercase tracking-wider">
                  {p.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-primary">{p.name}</h3>
                  <p className="text-xs text-secondary mt-1">{p.tagline}</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-primary">
                    ${annual ? p.annual_price_usd : p.monthly_price_usd}
                  </span>
                  <span className="text-xs text-secondary"> / property / month</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-divider">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Included Capabilities:</span>
                  <ul className="space-y-2 text-xs text-secondary">
                    {p.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-divider">
                <Link href="/administration/onboarding">
                  <Button variant={p.is_featured ? "primary" : "secondary"} className="w-full">
                    Deploy {p.name.split(" ")[0]} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-secondary">
        © 2026 Triangle Black Technologies. All rights reserved.
      </footer>
    </div>
  );
}
