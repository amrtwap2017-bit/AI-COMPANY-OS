"use client";
// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ahmed.fouad@nileplaza.com");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || pin.length !== 4) { setError("Enter email and 4-digit PIN"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/client/login", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({email, pin}),
      });
      const data = await res.json();
      if (data.access_token) {
        if (typeof window !== "undefined") {
        localStorage.setItem("tb_client_token", data.access_token);
        localStorage.setItem("tb_client", JSON.stringify(data.client || {}));
          localStorage.setItem("tb_token", data.access_token);
          localStorage.setItem("tb_access_token", data.access_token);
        }
        router.push("/client-portal/dashboard");
      } else {
        setError(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error — please check your network");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"linear-gradient(140deg, #141210 0%, #1A1715 18%, #211B18 38%, #2A231E 72%, #181513 100%)",
      position:"relative",
    }}>
      {/* Subtle radial gold glow */}
      <div style={{
        position:"absolute", top:0, right:0, width:"60%", height:"60%",
        background:"radial-gradient(circle at top right, rgba(185,146,76,0.06), transparent 50%)",
        pointerEvents:"none",
      }} />

      <div style={{width:"100%",maxWidth:420,padding:"0 20px",position:"relative",zIndex:1}}>

        {/* Logo + Brand */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{
            width:56, height:56, borderRadius:12,
            background:"linear-gradient(135deg, #8F6F3D, #B9924C)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            marginBottom:16, boxShadow:"0 8px 24px rgba(185,146,76,0.15)",
          }}>
            <span style={{color:"#181614",fontWeight:900,fontSize:"1.25rem",letterSpacing:"-0.02em"}}>TB</span>
          </div>
          <h1 style={{fontSize:"1.5rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Triangle Black</h1>
          <p style={{fontSize:"0.8125rem",color:"#6D5F53",marginTop:6}}>Hotel Client Access</p>
        </div>

        {/* Card */}
        <div style={{
          background:"#2D2723",
          border:"1px solid #3D352F",
          borderRadius:14,
          padding:"32px 28px",
          boxShadow:"0 20px 40px rgba(0,0,0,0.35)",
        }}>
          <h2 style={{fontSize:"1.125rem",fontWeight:700,color:"#F3EFE8",marginBottom:4}}>
            Client Portal
          </h2>
          <p style={{fontSize:"0.75rem",color:"#6D5F53",marginBottom:28}}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:"0.75rem",color:"#B29F8B",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                style={{width:"100%",background:"#221E1B",border:"1px solid #2D2723",borderRadius:6,padding:"12px 14px",color:"#F3EFE8",fontSize:"0.875rem",outline:"none",boxSizing:"border-box",transition:"border-color 160ms ease"}}
                onFocus={e=>e.target.style.borderColor="#B9924C"}
                onBlur={e=>e.target.style.borderColor="#2D2723"}
                placeholder="you@company.com"
              />
            </div>


            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:"0.75rem",color:"#B29F8B",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>PIN Code</label>
              <input
                type="password"
                value={pin}
                onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
                maxLength={4}
                inputMode="numeric"
                required
                style={{width:"100%",background:"#221E1B",border:"1px solid #2D2723",borderRadius:6,padding:"12px 14px",color:"#F3EFE8",fontSize:"1.25rem",outline:"none",boxSizing:"border-box",letterSpacing:"0.3em",textAlign:"center",fontWeight:700,transition:"border-color 160ms ease"}}
                onFocus={e=>e.target.style.borderColor="#B9924C"}
                onBlur={e=>e.target.style.borderColor="#2D2723"}
                placeholder="• • • •"
              />
            </div>

            {error && (
              <div style={{background:"rgba(168,74,61,0.10)",border:"1px solid rgba(168,74,61,0.25)",borderRadius:6,padding:"10px 14px",marginBottom:16,fontSize:"0.8125rem",color:"#C87060"}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width:"100%",
                background:loading?"#3D352F":"linear-gradient(135deg, #8F6F3D, #B9924C)",
                color:loading?"#6D5F53":"#181614",
                border:"none",
                borderRadius:6,
                padding:"13px",
                fontSize:"0.9375rem",
                fontWeight:700,
                cursor:loading?"not-allowed":"pointer",
                transition:"all 160ms ease",
                letterSpacing:"-0.01em",
              }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={{marginTop:24,padding:"14px",background:"#221E1B",borderRadius:8,fontSize:"0.75rem",color:"#6D5F53"}}>
            <div style={{fontWeight:600,color:"#B29F8B",marginBottom:4,fontSize:"0.6875rem",textTransform:"uppercase",letterSpacing:"0.05em"}}>Quick Access</div>
            <div>ahmed.fouad@nileplaza.com</div>
          </div>
        </div>

        <p style={{textAlign:"center",fontSize:"0.6875rem",color:"#3D352F",marginTop:32}}>
          Triangle Black · Enterprise Operations Platform
        </p>
      </div>
    </div>
  );
}
