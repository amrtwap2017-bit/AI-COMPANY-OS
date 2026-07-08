"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth-context";
import { adminAuth } from "@/lib/api";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("amr@triangleblack.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await adminAuth.login(email, password);
      const d = res.data;
      if (!["admin","manager"].includes(d.role)) {
        setError("Access denied. Admin or Manager role required.");
        return;
      }
      login(d.access_token, { id: d.user_id, name: d.name, email: d.email, role: d.role });
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-9 h-9 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Triangle Black</h1>
          <p className="text-white/60 mt-1">Admin Portal</p>
          <p className="text-white/40 text-sm mt-1">System Administration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Administrator Sign In</h2>

          {error && (
            <div role="alert" aria-live="assertive"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="password" type="password" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} aria-busy={loading}
              className="w-full py-3 bg-[#7C3AED] text-white rounded-lg font-medium text-sm
                hover:bg-[#6D28D9] transition-colors disabled:opacity-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            >
              {loading ? "Signing in..." : "Sign in to Admin Portal"}
            </button>
          </form>

          <div className="mt-5 p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs text-purple-700 font-medium mb-1">Admin credentials:</p>
            <p className="text-xs text-purple-600 font-mono">amr@triangleblack.com / Admin123!</p>
            <p className="text-xs text-purple-600 font-mono">sara@triangleblack.com / Manager123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
