// @ts-nocheck
// Triangle Black - Login
// TB-005: tokenManager + redirect to /workspace
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

function getTokenManager() {
  return {
    setToken: (t: string) => { try { sessionStorage.setItem("tb_token",t); localStorage.setItem("tb_access_token",t); } catch{} },
    setUser:  (u: any)    => { try { sessionStorage.setItem("tb_user",JSON.stringify(u)); } catch{} },
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("admin@triangleblack.com");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res  = await fetch(API+"/api/v1/auth/login", {
        method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:form.toString(),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); throw new Error(d.detail||"Invalid credentials"); }
      const data = await res.json();
      if (data.access_token) {
        const tm = getTokenManager();
        tm.setToken(data.access_token);
        if (data.user) tm.setUser(data.user);
        router.push("/workspace");
      } else { throw new Error("No token received"); }
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Triangle Black</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Operations Platform</p>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-800 rounded-xl text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/> {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="your@email.com" required/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="••••••••"/>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Signing in...</> : "Sign In"}
          </button>
          <p className="text-center text-xs text-slate-500">Triangle Black © {new Date().getFullYear()}</p>
        </form>
      </div>
    </div>
  );
}
