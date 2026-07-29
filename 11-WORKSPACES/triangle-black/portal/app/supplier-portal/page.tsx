"use client";
// @ts-nocheck
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupplierPortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || pin.length !== 4) { setError("Enter email and 4-digit PIN"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/v1/supplier/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email, pin})
      });
      const data = await r.json();
      if (data.access_token) {
        localStorage.setItem("tb_supplier_token", data.access_token);
        localStorage.setItem("tb_supplier", JSON.stringify(data.supplier));
        router.push("/supplier-portal/dashboard");
      } else {
        setError(data.detail || "Invalid email or PIN");
      }
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"linear-gradient(135deg,#0F172A,#1E293B)"}}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:"#F59E0B"}}>
            <span className="text-white font-black text-xl">TB</span>
          </div>
          <h1 className="text-2xl font-black text-white">Supplier Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Triangle Black Engineering Services</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-6">Sign in to your account</h2>
          {error && <div className="mb-4 p-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                placeholder="your@company.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">4-Digit PIN</label>
              <input type="password" maxLength={4} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-amber-500"
                placeholder="••••" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{background:loading?"#4B5563":"#D97706"}}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="text-xs font-bold text-slate-400 mb-2">Demo Suppliers (PIN: 1234)</div>
          {[
            {name:"Mohamed Ali — Arctic HVAC",email:"info@arctic-hvac.com"},
            {name:"Ahmed Hassan — Delta Electrical",email:"ahmed@delta-elec.com"},
            {name:"Nadia Kamal — FireShield",email:"nadia@fireshield.com"},
          ].map((s,i)=>(
            <button key={i} onClick={()=>{setEmail(s.email);setPin("1234");}}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-700 text-xs text-slate-300 flex justify-between">
              <span>{s.name}</span><span className="text-slate-500">{s.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
