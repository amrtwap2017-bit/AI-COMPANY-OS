"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { login }              = useAuth();
  const router                 = useRouter();
  const [username, setUser]    = useState("");
  const [email,    setEmail]   = useState("");
  const [password, setPass]    = useState("");
  const [fullName, setName]    = useState("");
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        full_name: fullName || undefined,
      });
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">AI Company OS</h1>
          </div>
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm
                            bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {[
            { label: "Username *", value: username, set: setUser, type: "text",     placeholder: "johndoe" },
            { label: "Email *",    value: email,    set: setEmail, type: "email",   placeholder: "john@example.com" },
            { label: "Password *", value: password, set: setPass,  type: "password", placeholder: "••••••••" },
            { label: "Full name",  value: fullName, set: setName,  type: "text",    placeholder: "John Doe (optional)" },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-sm text-gray-400 mb-1">{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => set(e.target.value)}
                required={!label.includes("optional")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-gray-200 text-sm focus:outline-none focus:border-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       text-white font-medium py-2 rounded-lg text-sm transition-colors">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
