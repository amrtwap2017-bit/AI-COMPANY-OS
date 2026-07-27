// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/workspace";

  const [email,    setEmail]    = useState("amr@triangleblack.com");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call backend directly — form-urlencoded with username field
      const res = await fetch("http://localhost:8030/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      const token = data.access_token;
      if (!token) throw new Error("No token received from server");

      // Store token in all locations for maximum compatibility
      sessionStorage.setItem("tb_token", token);
      sessionStorage.setItem("tb_access_token", token);
      localStorage.setItem("tb_token", token);
      localStorage.setItem("tb_access_token", token);

      // Redirect to original destination or workspace
      const target = from === "/login" ? "/workspace" : from;
      router.replace(target);
    } catch (err: any) {
      setError(err.message || "Login failed — check credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 mb-4">
            <Building2 className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-white">Triangle Black</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Operations Platform</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/40 border border-red-800 rounded-xl text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-xs font-medium text-slate-400 mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
              <input
                id="email" name="email" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-medium text-slate-400 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
              <input
                id="password" name="password" type="password"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-2 text-center">
            amr@triangleblack.com / admin123
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin"/> Signing in...</>
              : "Sign In"
            }
          </button>

          <p className="text-center text-xs text-slate-500">Triangle Black © 2026</p>
        </form>
      </div>
    </div>
  );
}
