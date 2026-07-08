"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Building2 } from "lucide-react";

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
      const data = res.data;
      login(data.access_token, {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#1B2B4B] rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-[#F59E0B]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B2B4B]">Triangle Black</h1>
            <p className="text-xs text-gray-500">Engineering Operations Portal</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <span className="text-red-500 text-sm font-medium">⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@triangleblack.com"
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-amber-700 font-mono">
              <p>admin:   amr@triangleblack.com / Admin123!</p>
              <p>manager: sara@triangleblack.com / Manager123!</p>
              <p>agent:   hassan@triangleblack.com / Agent123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
