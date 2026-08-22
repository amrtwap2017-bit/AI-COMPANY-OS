"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Activity, Cpu, ArrowRight, CheckCircle2,
  Building2, Wrench, BarChart3, Lock, Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [assessmentModal, setAssessmentModal] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [hotelName, setHotelName] = useState<string>("");

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !hotelName.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-lg">
              ▲
            </div>
            <span className="font-bold text-lg tracking-tight">TRIANGLE BLACK</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-light text-brand border border-brand-border">
              Enterprise Operations OS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAssessmentModal(true)}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-surface-alt border border-border hover:bg-surface transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Request Assessment
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-brand text-white hover:opacity-90 transition-opacity"
            >
              Sign In to Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-6 text-center max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-alt border border-border text-secondary mb-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Engineered for Hospitality & Asset-Intensive Real Estate
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-tight">
            Operational Intelligence for Hotel Engineering
          </h1>

          <p className="text-base sm:text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            Eliminate reactive breakdowns and procurement leakage. Triangle Black connects real-time telemetry, 
            governed AI maintenance triage, and automated financial accounting into a single auditable operating system.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setAssessmentModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold bg-brand text-white hover:opacity-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Request an Operational Assessment
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-surface-alt border border-border text-primary hover:bg-surface transition-colors flex items-center justify-center gap-2"
            >
              Explore Live Demo
              <ArrowRight className="w-4 h-4 text-secondary" />
            </Link>
          </div>
        </section>

        {/* 3 Core Value Pillars */}
        <section className="py-16 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border bg-surface-alt space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Closed-Loop Maintenance</h3>
              <p className="text-sm text-secondary leading-relaxed">
                From guest service request to technician dispatch, parts demand, and auto-generated service reports in a strict state machine.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface-alt space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Governed AI Intelligence</h3>
              <p className="text-sm text-secondary leading-relaxed">
                AI Maintenance Director analyzes acoustic vibration and failure patterns to recommend interventions before costly chiller breakdown.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface-alt space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-primary">Executive Read Models</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Sub-second procurement and asset KPIs powered by PostgreSQL composite indexes and zero-leakage tenant isolation.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
          <div>© 2026 Triangle Black Technologies. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-primary transition-colors">Admin Portal</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Supplier Portal</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Technician Mobile</Link>
          </div>
        </div>
      </footer>

      {/* Assessment Modal */}
      {assessmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                Request Operational Assessment
              </h3>
              <button
                onClick={() => { setAssessmentModal(false); setSubmitted(false); }}
                className="text-secondary hover:text-primary text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleAssessmentSubmit} className="space-y-3">
                <p className="text-xs text-secondary">
                  Our hospitality engineering team will benchmark your property's maintenance spend and failure rates.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Hotel / Property Name</label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Sharm Grand Plaza Resort"
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface-alt text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase mb-1">Director of Engineering Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@hotelgroup.com"
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface-alt text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-md text-xs font-bold bg-brand text-white hover:opacity-90 transition-opacity"
                >
                  Submit Assessment Request
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <p className="text-sm font-bold text-primary">Assessment Request Received</p>
                <p className="text-xs text-secondary">Our Principal Hospitality Architect will contact {email} within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
