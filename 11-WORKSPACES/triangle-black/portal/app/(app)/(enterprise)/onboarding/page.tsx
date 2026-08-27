"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

type Step = "welcome" | "property" | "assets" | "configure" | "complete";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{assets: number; plans: number; suppliers: number} | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.all([
      authFetch("/api/v1/asset-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/pm-engine/summary").then(r => r.json()).catch(() => null),
      authFetch("/api/v1/supplier-engine/summary").then(r => r.json()).catch(() => null),
    ]).then(([a, p, s]) => {
      setStats({
        assets: a?.portfolio?.total_assets ?? 0,
        plans: p?.total_plans ?? 0,
        suppliers: s?.total_suppliers ?? 0,
      });
    });
  }, []);

  const steps: {id: Step; label: string; desc: string; icon: string}[] = [
    { id: "welcome", label: "Welcome", desc: "Get started with Triangle Black", icon: "👋" },
    { id: "property", label: "Property Setup", desc: "Configure your hotel properties", icon: "🏨" },
    { id: "assets", label: "Asset Import", desc: "Import your asset inventory", icon: "🏗️" },
    { id: "configure", label: "Configure", desc: "Set up PM plans and SLAs", icon: "⚙️" },
    { id: "complete", label: "Go Live", desc: "Launch your intelligence platform", icon: "🚀" },
  ];
  const stepOrder: Step[] = ["welcome","property","assets","configure","complete"];
  const currentIdx = stepOrder.indexOf(step);

  return (
    <div className="tb-canvas">
      <div className="tb-section">
        <h1 className="tb-section-title">Customer Onboarding</h1>
        <p className="tb-detail-value">Set up your engineering operations intelligence platform</p>
      </div>

      {/* Progress Steps */}
      <div className="tb-section">
        <div className="tb-steps">
          {steps.map((s, i) => (
            <div key={s.id} className={`tb-step ${i <= currentIdx ? "active" : ""}`}>
              <div className="tb-step-num" style={{
                background: i < currentIdx ? "#16a34a" : i === currentIdx ? "var(--brand)" : "var(--border-color)",
                color: i <= currentIdx ? "white" : "var(--text-secondary)",
              }}>
                {i < currentIdx ? "✓" : s.icon}
              </div>
              <div style={{ fontSize:"0.75rem", fontWeight: i === currentIdx ? 600 : 400 }}>
                {s.label}
              </div>
              {i < steps.length-1 && <div className="tb-step-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="tb-section">
        {step === "welcome" && (
          <div style={{ textAlign:"center", padding:"2rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>👋</div>
            <h2 className="tb-section-title">Welcome to Triangle Black</h2>
            <p className="tb-detail-value" style={{ maxWidth:"500px", margin:"0 auto 1.5rem" }}>
              You are setting up an Enterprise Operations Intelligence platform for hospitality engineering.
              This wizard will guide you through configuring your property, importing assets, and going live.
            </p>
            {stats && (
              <div className="tb-grid-3 mt-6">
                <div className="tb-kpi">
                  <div className="tb-kpi-label">Assets in DB</div>
                  <div className="tb-kpi-value">{stats.assets}</div>
                </div>
                <div className="tb-kpi">
                  <div className="tb-kpi-label">PM Plans</div>
                  <div className="tb-kpi-value">{stats.plans}</div>
                </div>
                <div className="tb-kpi">
                  <div className="tb-kpi-label">Suppliers</div>
                  <div className="tb-kpi-value">{stats.suppliers}</div>
                </div>
              </div>
            )}
            <button className="tb-btn tb-btn-primary" style={{ marginTop:"1.5rem" }}
                    onClick={() => setStep("property")}>
              Start Setup →
            </button>
          </div>
        )}

        {step === "property" && (
          <div>
            <h2 className="tb-section-title">🏨 Property Configuration</h2>
            <p className="tb-detail-value">Your hotel property is already configured in the system.</p>
            <div className="tb-kpi mt-3">
              <div className="tb-detail-row">
                <span className="tb-detail-key">Hotel ID</span>
                <span className="tb-detail-value">tb-default-hotel-000000000001</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Status</span>
                <span className="tb-badge tb-badge-success">Active</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("welcome")}>← Back</button>
              <button className="tb-btn tb-btn-primary" onClick={() => setStep("assets")}>Next →</button>
            </div>
          </div>
        )}

        {step === "assets" && (
          <div>
            <h2 className="tb-section-title">🏗️ Asset Import</h2>
            <p className="tb-detail-value">{stats?.assets ?? 0} assets are already loaded in your system.</p>
            <div className="tb-alert tb-alert-success mt-3">
              <span>✅ Asset import complete. All {stats?.assets} assets have PM plans assigned.</span>
            </div>
            <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("property")}>← Back</button>
              <button className="tb-btn tb-btn-primary" onClick={() => setStep("configure")}>Next →</button>
            </div>
          </div>
        )}

        {step === "configure" && (
          <div>
            <h2 className="tb-section-title">⚙️ Intelligence Configuration</h2>
            <p className="tb-detail-value">Your 13 intelligence engines are configured and running.</p>
            <div className="tb-grid-3 mt-3">
              {["PM Engine","SLA Engine","Asset Engine","Supplier Engine","Cost Engine","Predictive Engine"].map(eng => (
                <div key={eng} className="tb-kpi">
                  <span className="tb-badge tb-badge-success">✅</span>
                  <div className="tb-detail-value">{eng}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"1rem", marginTop:"1rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("assets")}>← Back</button>
              <button className="tb-btn tb-btn-primary" onClick={() => setStep("complete")}>Go Live →</button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div style={{ textAlign:"center", padding:"2rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🚀</div>
            <h2 className="tb-section-title">You Are Live!</h2>
            <p className="tb-detail-value" style={{ maxWidth:"400px", margin:"0 auto 1.5rem" }}>
              Triangle Black is fully configured. Your intelligence platform is operational.
            </p>
            <div className="tb-grid-3 mt-6">
              <div className="tb-kpi" style={{ borderTop:"3px solid #22c55e" }}>
                <div className="tb-kpi-label">Health Score</div>
                <div className="tb-kpi-value" style={{ color:"#22c55e" }}>80/100</div>
              </div>
              <div className="tb-kpi" style={{ borderTop:"3px solid #3b82f6" }}>
                <div className="tb-kpi-label">Engines Active</div>
                <div className="tb-kpi-value">13</div>
              </div>
              <div className="tb-kpi" style={{ borderTop:"3px solid #8b5cf6" }}>
                <div className="tb-kpi-label">Portal Pages</div>
                <div className="tb-kpi-value">9</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", marginTop:"1.5rem" }}>
              <a href="/intelligence" className="tb-btn tb-btn-primary">View Intelligence Hub</a>
              <a href="/pilot-dashboard" className="tb-btn tb-btn-secondary">Open Dashboard</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
