"use client";
// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientPortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || pin.length !== 4) { setError("Enter email and 4-digit PIN"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/v1/client/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email, pin})
      });
      const data = await r.json();
      if (data.access_token) {
        localStorage.setItem("tb_client_token", data.access_token);
        localStorage.setItem("tb_client", JSON.stringify(data.client));
        router.push("/client-portal/dashboard");
      } else {
        setError(data.detail || "Invalid email or PIN");
      }
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#F8FAFC"}}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:"#0F172A"}}>
            <span className="text-white font-black text-xl">TB</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Client Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Triangle Black Engineering Services</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Sign in to your account</h2>
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{background:"#FEF2F2",color:"#DC2626"}}>
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-gray-50"
                placeholder="your.email@hotel.com" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">4-Digit PIN</label>
              <input type="password" maxLength={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-gray-50 text-center text-2xl tracking-widest"
                placeholder="••••" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{background:loading?"#9CA3AF":"#059669"}}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">
            Contact Triangle Black for access: info@triangleblack.com
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 bg-white">
          <div className="text-xs font-bold text-gray-500 mb-2">Demo Credentials (PIN: 1234)</div>
          {[
            {name:"Ahmed Fouad",email:"ahmed.fouad@nileplaza.com"},
            {name:"Sara Hassan",email:"sara.hassan@cairofestival.com"},
            {name:"Mona Kamal",email:"mona.kamal@fourseasons.com"},
          ].map((c,i)=>(
            <button key={i} onClick={()=>{setEmail(c.email);setPin("1234");}}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600 flex justify-between">
              <span>{c.name}</span><span className="text-gray-400">{c.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
