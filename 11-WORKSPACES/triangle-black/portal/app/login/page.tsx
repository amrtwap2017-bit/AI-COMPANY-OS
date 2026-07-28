"use client";
// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("amr@triangleblack.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("tb_token", data.access_token);
          localStorage.setItem("tb_access_token", data.access_token);
          // Fetch user role and store it
          try {
            const meRes = await fetch("/api/v1/me", {
              headers: { "Authorization": "Bearer " + data.access_token }
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              localStorage.setItem("tb_user_role", meData.role || "viewer");
              localStorage.setItem("tb_user_email", meData.email || "");
              localStorage.setItem("tb_is_admin", String(meData.is_admin || false));
            }
          } catch(e) {}
          document.cookie = "tb_token=" + data.access_token + "; path=/; max-age=86400";
          document.cookie = "tb_access_token=" + data.access_token + "; path=/; max-age=86400";
        }
        router.push("/workspace");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error — backend may be offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center" style={{background:"linear-gradient(135deg, #0F172A 0%, #0A1530 100%)"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 16px"}}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{fontSize:"2.5rem",marginBottom:8}}>🔺</div>
          <h1 style={{fontSize:"1.75rem",fontWeight:900,color:"#F1F5F9",letterSpacing:"-0.02em"}}>Triangle Black</h1>
          <p style={{fontSize:"0.875rem",color:"#64748B",marginTop:4}}>Engineering Operations Platform</p>
        </div>

        {/* Card */}
        <div style={{background:"#0E1B2E",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"32px"}}>
          <h2 style={{fontSize:"1.125rem",fontWeight:700,color:"#F1F5F9",marginBottom:6}}>Sign in</h2>
          <p style={{fontSize:"0.75rem",color:"#64748B",marginBottom:24}}>Access your operations platform</p>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:"0.75rem",color:"#94A3B8",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#F1F5F9",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}
                placeholder="amr@triangleblack.com"
              />
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:"0.75rem",color:"#94A3B8",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#F1F5F9",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:"0.8125rem",color:"#F87171"}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{width:"100%",background:loading?"#334155":"#2563EB",color:"#fff",border:"none",borderRadius:8,padding:"11px",fontSize:"0.9375rem",fontWeight:700,cursor:loading?"not-allowed":"pointer",transition:"background 0.2s"}}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div style={{marginTop:20,padding:"12px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:"0.75rem",color:"#64748B"}}>
            <div>Default: amr@triangleblack.com</div>
            <div>Password: admin123</div>
          </div>
        </div>

        <p style={{textAlign:"center",fontSize:"0.75rem",color:"#334155",marginTop:24}}>
          Triangle Black v2.0.1 · Sprint 221
        </p>
      </div>
    </div>
  );
}
