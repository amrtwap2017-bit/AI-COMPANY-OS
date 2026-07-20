// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { tokenManager } from "@/lib/auth/token-manager";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("admin@triangleblack.com");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      if (data.token) tokenManager.setToken(data.token);
      if (data.user)  tokenManager.setUser(data.user);
      router.push("/workspace");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="..." />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              : "Sign In"}
          </button>
          <p className="text-center text-xs text-slate-500">Triangle Black Enterprise</p>
        </form>
      </div>
    </div>
  );
}
