"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

type Step = "welcome" | "org" | "admin" | "provision" | "complete";

interface ProvisionResult {
  hotel_id: string;
  org_name: string;
  property_name: string;
  admin: { name: string; email: string; temp_password: string; role: string };
  provisioned_at: string;
}

interface StatusResult {
  completion_pct: number;
  steps_done: number;
  steps_total: number;
  is_complete: boolean;
  steps: Array<{ step: number; name: string; done: boolean; detail: string }>;
  summary: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [orgName, setOrgName] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [ts, setTs] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTs(new Date().toLocaleString());
    // Load current onboarding status
    authFetch("/api/v1/onboarding/status")
      .then(r => r.json()).catch(() => null)
      .then(d => { if (d && !d.error) setStatus(d); });
  }, []);

  const stepOrder: Step[] = ["welcome", "org", "admin", "provision", "complete"];
  const currentIdx = stepOrder.indexOf(step);

  const stepLabels = [
    { id: "welcome", icon: "👋", label: "Welcome" },
    { id: "org", icon: "🏨", label: "Property" },
    { id: "admin", icon: "👤", label: "Admin" },
    { id: "provision", icon: "⚙️", label: "Setup" },
    { id: "complete", icon: "🚀", label: "Go Live" },
  ];

  const handleProvision = async () => {
    setLoading(true);
    setError("");
    try {
      // First validate email
      const vr = await authFetch("/api/v1/onboarding/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_email: adminEmail }),
      });
      const vd = await vr.json();
      if (!vd.valid) {
        setError(vd.issues?.join(", ") || "Validation failed");
        setLoading(false);
        return;
      }
      // Provision
      const pr = await authFetch("/api/v1/onboarding/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName,
          property_name: propertyName,
          admin_email: adminEmail,
          admin_name: adminName,
          city: city,
        }),
      });
      const pd = await pr.json();
      if (pr.ok && pd.status === "provisioned") {
        setResult(pd);
        setStep("complete");
      } else {
        setError(pd.detail || pd.message || "Provisioning failed");
      }
    } catch (e) {
      setError("Network error — please try again");
    }
    setLoading(false);
  };

  return (
    <div className="tb-canvas">
      {/* Header */}
      <div className="tb-section">
        <div className="tb-flex-between">
          <div>
            <h1 className="tb-section-title">Customer Onboarding</h1>
            <p className="tb-detail-value">
              {status ? status.summary : "Set up your engineering operations intelligence platform"}
            </p>
          </div>
          {status && (
            <span className={`tb-badge ${status.is_complete ? "tb-badge-success" : "tb-badge-warning"}`}>
              {status.completion_pct}% complete
            </span>
          )}
        </div>
      </div>

      {/* Current Status (if already onboarded) */}
      {status && status.steps_done > 0 && step === "welcome" && (
        <div className="tb-section">
          <h2 className="tb-section-title">Current Setup Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem" }}>
            {status.steps.map(s => (
              <div key={s.step} className="tb-flex-gap-3">
                <span className={`tb-badge ${s.done ? "tb-badge-success" : "tb-badge-neutral"}`} style={{ fontSize: "0.7rem", minWidth: "60px" }}>
                  {s.done ? "✅ Done" : "⏳ Pending"}
                </span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{s.name}</span>
                <span className="tb-detail-value">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="tb-section">
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {stepLabels.map((s, i) => (
            <div key={s.id} className="tb-flex-gap-3">
              <div style={{ textAlign: "center", padding: "0 0.5rem" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", margin: "0 auto 0.25rem",
                  background: i < currentIdx ? "#16a34a" : i === currentIdx ? "var(--brand, #B9924C)" : "var(--border-color, #e5e1da)",
                  color: i <= currentIdx ? "white" : "var(--text-secondary)",
                  fontWeight: 700,
                }}>
                  {i < currentIdx ? "✓" : s.icon}
                </div>
                <div style={{ fontSize: "0.7rem", fontWeight: i === currentIdx ? 700 : 400, whiteSpace: "nowrap" }}>
                  {s.label}
                </div>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: "2px", background: i < currentIdx ? "#16a34a" : "var(--border-color, #e5e1da)", minWidth: "20px" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="tb-section">

        {/* WELCOME */}
        {step === "welcome" && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👋</div>
            <h2 className="tb-section-title">Welcome to Triangle Black</h2>
            <p className="tb-detail-value" style={{ maxWidth: "480px", margin: "0 auto 1.5rem" }}>
              This wizard provisions a new hotel property with a full intelligence platform.
              Takes less than 2 minutes. No developer required.
            </p>
            <div className="tb-grid-3" style={{ marginBottom: "1.5rem" }}>
              <div className="tb-kpi">
                <div className="tb-kpi-label">Setup Time</div>
                <div className="tb-kpi-value" style={{ fontSize: "1.5rem" }}>2 min</div>
              </div>
              <div className="tb-kpi">
                <div className="tb-kpi-label">Engines Ready</div>
                <div className="tb-kpi-value" style={{ fontSize: "1.5rem" }}>13</div>
              </div>
              <div className="tb-kpi">
                <div className="tb-kpi-label">Developer Needed</div>
                <div className="tb-kpi-value" style={{ fontSize: "1.5rem", color: "#16a34a" }}>None</div>
              </div>
            </div>
            <button className="tb-btn tb-btn-primary" onClick={() => setStep("org")}>
              Start Setup →
            </button>
          </div>
        )}

        {/* ORG SETUP */}
        {step === "org" && (
          <div style={{ maxWidth: "480px" }}>
            <h2 className="tb-section-title">🏨 Property Information</h2>
            <p className="tb-detail-value" style={{ marginBottom: "1.25rem" }}>
              Enter the organization and property details.
            </p>
            <div className="tb-flex-col-gap-md">
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  Organization / Company Name *
                </label>
                <input
                  className="tb-input"
                  placeholder="e.g. Sinai Engineering Services"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  Hotel / Property Name *
                </label>
                <input
                  className="tb-input"
                  placeholder="e.g. Grand Sinai Resort"
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  City (optional)
                </label>
                <input
                  className="tb-input"
                  placeholder="e.g. Sharm El Sheikh"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("welcome")}>← Back</button>
              <button
                className="tb-btn tb-btn-primary"
                disabled={!orgName.trim() || !propertyName.trim()}
                onClick={() => setStep("admin")}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ADMIN SETUP */}
        {step === "admin" && (
          <div style={{ maxWidth: "480px" }}>
            <h2 className="tb-section-title">👤 Admin Account</h2>
            <p className="tb-detail-value" style={{ marginBottom: "1.25rem" }}>
              Create the administrator account for this property.
              A temporary password will be generated.
            </p>
            <div className="tb-flex-col-gap-md">
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  Admin Full Name *
                </label>
                <input
                  className="tb-input"
                  placeholder="e.g. Ahmed Hassan"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  Admin Email Address *
                </label>
                <input
                  className="tb-input"
                  type="email"
                  placeholder="e.g. ahmed@sinai-engineering.com"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("org")}>← Back</button>
              <button
                className="tb-btn tb-btn-primary"
                disabled={!adminEmail.trim() || !adminName.trim()}
                onClick={() => setStep("provision")}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM + PROVISION */}
        {step === "provision" && (
          <div style={{ maxWidth: "480px" }}>
            <h2 className="tb-section-title">⚙️ Confirm Setup</h2>
            <p className="tb-detail-value" style={{ marginBottom: "1.25rem" }}>
              Review your configuration before provisioning.
            </p>
            <div className="tb-kpi" style={{ marginBottom: "1rem" }}>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Organization</span>
                <span className="tb-detail-value" style={{ fontWeight: 600 }}>{orgName}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Property</span>
                <span className="tb-detail-value" style={{ fontWeight: 600 }}>{propertyName}</span>
              </div>
              {city && (
                <div className="tb-detail-row">
                  <span className="tb-detail-key">City</span>
                  <span className="tb-detail-value">{city}</span>
                </div>
              )}
              <div className="tb-detail-row">
                <span className="tb-detail-key">Admin</span>
                <span className="tb-detail-value">{adminName}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Email</span>
                <span className="tb-detail-value">{adminEmail}</span>
              </div>
            </div>
            {error && (
              <div className="tb-alert tb-alert-danger" style={{ marginBottom: "1rem" }}>
                ❌ {error}
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="tb-btn tb-btn-secondary" onClick={() => setStep("admin")} disabled={loading}>
                ← Back
              </button>
              <button
                className="tb-btn tb-btn-primary"
                onClick={handleProvision}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Provisioning..." : "🚀 Provision Organization"}
              </button>
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {step === "complete" && result && (
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h2 className="tb-section-title" style={{ color: "#16a34a" }}>
              Organization Provisioned!
            </h2>
            <p className="tb-detail-value" style={{ marginBottom: "1.5rem" }}>
              {result.org_name} · {result.property_name} is ready.
            </p>

            {/* Credentials */}
            <div className="tb-kpi" style={{ textAlign: "left", marginBottom: "1.5rem", borderTop: "3px solid #16a34a" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                🔐 Admin Credentials — Save These Now
              </h3>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Email</span>
                <span className="tb-detail-value" style={{ fontWeight: 700 }}>{result.admin.email}</span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Temp Password</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color: "var(--brand, #B9924C)" }}>
                  {result.admin.temp_password}
                </span>
              </div>
              <div className="tb-detail-row">
                <span className="tb-detail-key">Hotel ID</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{result.hotel_id}</span>
              </div>
              <div className="tb-alert tb-alert-warning" style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
                ⚠️ Change the password immediately after first login
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/intelligence" className="tb-btn tb-btn-primary">
                View Intelligence Hub
              </a>
              <a href="/data-import" className="tb-btn tb-btn-secondary">
                Import Assets
              </a>
              <a href="/pilot-dashboard" className="tb-btn tb-btn-secondary">
                Open Dashboard
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
