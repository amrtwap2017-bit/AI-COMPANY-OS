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
    if (e) e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/v1/auth/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({username:email,password})});
      const data = res.data ?? res;
      if (data.access_token) {
        if (typeof window!=="undefined") {
          localStorage.setItem("tb_access_token",data.access_token);
          localStorage.setItem("tb_token",data.access_token);
          try {
            const meRes = await fetch("/api/v1/me",{headers:{"Authorization":"Bearer "+data.access_token}});
            if (meRes.ok) { const meData=await meRes.json(); localStorage.setItem("tb_user_role",meData.role||"viewer"); localStorage.setItem("tb_user_email",meData.email||""); localStorage.setItem("tb_is_admin",String(meData.is_admin||false)); }
          } catch(e) {}
          document.cookie="tb_token="+data.access_token+"; path=/; max-age=86400";
          document.cookie="tb_access_token="+data.access_token+"; path=/; max-age=86400";
        }
        router.push("/workspace");
      } else { setError(data.detail||"Invalid credentials"); }
    } catch { setError("Connection error — please check your network"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative"
      style={{background:"linear-gradient(140deg,#141210 0%,#1A1715 18%,#211B18 38%,#2A231E 72%,#181513 100%)"}}>
      <div className="absolute top-0 right-0 w-3/5 h-3/5 pointer-events-none"
        style={{background:"radial-gradient(circle at top right,rgba(185,146,76,0.06),transparent 50%)"}} />

      <div className="w-full max-w-md px-5 relative z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl inline-flex items-center justify-center mb-4"
            style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)",boxShadow:"0 8px 24px rgba(185,146,76,0.15)"}}>
            <span className="font-black text-xl" style={{color:"#181614",letterSpacing:"-0.02em"}}>TB</span>
          </div>
          <h1 className="text-2xl font-extrabold" style={{color:"#F3EFE8",letterSpacing:"-0.02em"}}>Triangle Black</h1>
          <p className="text-sm mt-1.5" style={{color:"#6D5F53"}}>Engineering Operations Platform</p>
        </div>

        <div className="rounded-2xl px-7 py-8" style={{background:"#2D2723",border:"1px solid #3D352F",boxShadow:"0 20px 40px rgba(0,0,0,0.35)"}}>
          <h2 className="text-lg font-bold mb-1" style={{color:"#F3EFE8"}}>Sign in</h2>
          <p className="text-xs mb-7" style={{color:"#6D5F53"}}>Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-semibold uppercase tracking-wider" style={{color:"#B29F8B"}}>Email</label>
              <input type="email" value={email} onChange={(e: any) =>setEmail(e.target.value)} required
                className="w-full rounded-md px-3.5 py-3 text-sm outline-none transition-colors"
                style={{background:"#221E1B",border:"1px solid #2D2723",color:"#F3EFE8"}}
                onFocus={(e: any) =>e.target.style.borderColor="#B9924C"} onBlur={(e: any) =>e.target.style.borderColor="#2D2723"}
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-semibold uppercase tracking-wider" style={{color:"#B29F8B"}}>Password</label>
              <input type="password" value={password} onChange={(e: any) =>setPassword(e.target.value)} required
                className="w-full rounded-md px-3.5 py-3 text-sm outline-none transition-colors"
                style={{background:"#221E1B",border:"1px solid #2D2723",color:"#F3EFE8"}}
                onFocus={(e: any) =>e.target.style.borderColor="#B9924C"} onBlur={(e: any) =>e.target.style.borderColor="#2D2723"}
                placeholder="Enter password" />
            </div>
            {error && (
              <div className="rounded-md px-3.5 py-2.5 text-sm" style={{background:"rgba(168,74,61,0.10)",border:"1px solid rgba(168,74,61,0.25)",color:"#C87060"}}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full rounded-md py-3.5 text-base font-bold transition-all"
              style={{background:loading?"#3D352F":"linear-gradient(135deg,#8F6F3D,#B9924C)",color:loading?"#6D5F53":"#181614",border:"none",cursor:loading?"not-allowed":"pointer"}}>
              {loading?"Signing in...":"Sign in"}
            </button>
          </form>

          <div className="mt-6 p-3.5 rounded-lg text-xs" style={{background:"#221E1B",color:"#6D5F53"}}>
            <div className="font-semibold mb-1 uppercase tracking-wider" style={{color:"#B29F8B",fontSize:"0.6875rem"}}>Quick Access</div>
            <div>amr@triangleblack.com</div>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{color:"#3D352F"}}>Triangle Black · Enterprise Operations Platform</p>
      </div>
    </div>
  );
}
