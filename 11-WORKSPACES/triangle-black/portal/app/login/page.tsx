"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";

import { Button } from "@/components/ui";
import { Building2, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const data = (res as any)?.data ?? res;
      login(data.access_token, {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true,
      });
      router.push("/workspace");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(e: string, p: string) {
    setEmail(e);
    setPassword(p);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">TB</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Triangle Black</h1>
            <p className="text-xs text-slate-400">Enterprise Operations Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-sm text-slate-400 mb-6">Access your enterprise workspace</p>

          {error && (
            <div role="alert" aria-live="assertive"
              className="mb-4 p-3 bg-red-950 border border-red-800 rounded-xl flex items-center gap-2">
              <span className="text-red-400 text-sm font-medium">⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                type="email" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@triangleblack.com"
                required
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick access</p>
            <div className="space-y-2">
              {[
                { label: "Admin", email: "amr@triangleblack.com", password: "Admin123!" },
                { label: "Manager", email: "sara@triangleblack.com", password: "Manager123!" },
                { label: "Agent", email: "hassan@triangleblack.com", password: "Agent123!" },
              ].map(cred => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillDemo(cred.email, cred.password)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors group text-left"
                >
                  <span className="text-xs font-semibold text-slate-300">{cred.label}</span>
                  <span className="text-xs text-slate-500 font-mono group-hover:text-slate-300 transition-colors">
                    {cred.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs text-slate-500">Triangle Black Enterprise Platform v3.0</span>
        </div>
      </div>
    </div>
  );
}
