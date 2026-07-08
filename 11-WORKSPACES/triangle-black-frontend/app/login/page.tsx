"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("tb_token", data.access_token);
      localStorage.setItem("tb_user", JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role,
        user_id: data.user_id,
      }));
      router.push("/");
    } catch (err) {
      setError(String(err).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>🏨</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 4px" }}>Triangle Black</h1>
          <div style={{ color: "#64748b", fontSize: 13 }}>Hotel Engineering Platform</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="agent@triangleblack.com"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", color: "#991b1b", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? "#94a3b8" : "#0f172a", color: "#fff", borderRadius: 8, border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: "#f0fdf4", borderRadius: 8, fontSize: 12, color: "#166534" }}>
          <strong>Demo Agent:</strong> agent@triangleblack.com / agent123
        </div>
      </div>
    </div>
  );
}
