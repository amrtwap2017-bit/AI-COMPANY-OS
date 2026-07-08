"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/lib/auth-context";
import { clientAuth } from "@/lib/api";
import { Building2, Lock, Mail } from "lucide-react";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useClientAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await clientAuth.login(email, password);
      const d = res.data;
      login(d.access_token, {
        id: d.user_id, name: d.name, email: d.email, role: d.role,
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please contact Triangle Black.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2B4B] to-[#0f1c31] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-9 h-9 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Triangle Black</h1>
          <p className="text-white/60 mt-1">Client Portal</p>
          <p className="text-white/40 text-sm mt-1">Hotel Engineering Services</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Access your proposals
          </h2>

          {error && (
            <div role="alert" aria-live="assertive"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  id="email" type="email" required autoComplete="email" autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hotel.com"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  id="password" type="password" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2B4B]"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#1B2B4B] text-white rounded-lg font-medium text-sm hover:bg-[#243860] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              aria-busy={loading}
            >
              {loading ? "Signing in..." : "Sign in to Client Portal"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Need access? Contact Triangle Black Engineering
            </p>
            <a
              href="mailto:amr@triangleblack.com"
              className="text-xs text-[#1B2B4B] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2B4B] rounded"
            >
              amr@triangleblack.com
            </a>
          </div>

          {/* Demo note */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700 font-medium mb-1">Demo access:</p>
            <p className="text-xs text-amber-600 font-mono">hassan@triangleblack.com / Agent123!</p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2025 Triangle Black Engineering Platform
        </p>
      </div>
    </div>
  );
}
