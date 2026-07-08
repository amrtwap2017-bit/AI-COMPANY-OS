"use client";
import AuthGuard from "@/components/AuthGuard";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Settings</h1>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 32 }}>
          System configuration
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: 24,
          border: "1px solid #e2e8f0" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>API Endpoint</div>
            <code style={{ background: "#f1f5f9", padding: "6px 10px",
              borderRadius: 6, fontSize: 13 }}>
              http://127.0.0.1:8030/api/v1
            </code>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Version</div>
            <div style={{ color: "#64748b" }}>Triangle Black v1.9.0</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
