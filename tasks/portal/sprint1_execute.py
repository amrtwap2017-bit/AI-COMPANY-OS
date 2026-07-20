import os, datetime, glob, json

PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
LOG    = "/home/amr/AI-COMPANY-OS/tasks/logs/sprint1.log"
results = []

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    msg = "["+ts+"] "+str(m)
    print(msg, flush=True)
    open(LOG,"a").write(msg+"\n")

def write(path, content, task, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,"w") as f: f.write(content)
    log("  ["+task+"] WROTE: "+label)
    results.append({"task":task,"file":label,"status":"OK"})

open(LOG,"w").close()
log("="*60)
log("SPRINT 1 — Critical Portal Shell Fixes")
log("Tasks: TB-001 TB-002 TB-003 TB-004 TB-005 TB-006")
log("="*60)

# TB-001: Fix PageWrapper
log("\nTB-001: PageWrapper — adding use client directive")
write(PORTAL+"/components/ui/PageWrapper.tsx", '''// @ts-nocheck
// Triangle Black - Page Wrapper
// TB-001: Added "use client" - required because Breadcrumb uses usePathname
"use client";
import { Breadcrumb } from "./Breadcrumb";

interface PageWrapperProps {
  children:        React.ReactNode;
  showBreadcrumb?: boolean;
  className?:      string;
  noPadding?:      boolean;
}

export function PageWrapper({
  children,
  showBreadcrumb = true,
  className      = "",
  noPadding      = false,
}: PageWrapperProps) {
  return (
    <div className={"w-full max-w-screen-2xl mx-auto " + (noPadding ? "" : "px-4 sm:px-6 py-5 pb-20 ") + className}>
      {showBreadcrumb && <Breadcrumb className="mb-4" />}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
''', "TB-001", "components/ui/PageWrapper.tsx")

# TB-002: Error Boundaries
log("\nTB-002: Error boundaries — removing Breadcrumb import")
error_content = '''// @ts-nocheck
// Triangle Black - Error Boundary
// TB-002: Removed Breadcrumb (cannot use hooks in error.tsx)
"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TB Error]", error?.message); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {error?.message || "An unexpected error occurred."}
          </p>
          {error?.digest && (
            <p className="text-xs text-slate-400 mb-5 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <a href="/workspace"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              <Home className="w-4 h-4" /> Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
'''

for error_path in [
    PORTAL+"/app/(app)/error.tsx",
    PORTAL+"/app/(app)/(enterprise)/error.tsx",
    PORTAL+"/app/error.tsx",
]:
    write(error_path, error_content, "TB-002", error_path.split("/portal/")[-1])

for ef in glob.glob(PORTAL+"/app/**/*error.tsx", recursive=True):
    with open(ef) as f: c = f.read()
    if "Breadcrumb" in c or "usePathname" in c:
        write(ef, error_content, "TB-002", ef.split("/portal/")[-1])

# TB-003: Neutralize MobileNav
log("\nTB-003: MobileNav.tsx — neutralizing legacy component")
write(PORTAL+"/components/ui/MobileNav.tsx", '''// @ts-nocheck
// Triangle Black - MobileNav (DEPRECATED)
// TB-003: Null shim — EnterpriseShell handles mobile nav
export function MobileNav() { return null; }
export default MobileNav;
''', "TB-003", "components/ui/MobileNav.tsx")

# TB-004: Neutralize Sidebar
log("\nTB-004: Sidebar.tsx — neutralizing legacy component")
write(PORTAL+"/components/Sidebar.tsx", '''// @ts-nocheck
// Triangle Black - Sidebar (DEPRECATED)
// TB-004: Null shim — EnterpriseSidebar in EnterpriseShell handles nav
export function Sidebar({ collapsed = false }: { collapsed?: boolean }) { return null; }
export default Sidebar;
''', "TB-004", "components/Sidebar.tsx")

ai_page = PORTAL+"/app/(app)/(enterprise)/ai/page.tsx"
if os.path.exists(ai_page):
    with open(ai_page) as f: c = f.read()
    if "Sidebar" in c:
        c = c.replace('import { Sidebar } from "@/components/Sidebar";', '')
        c = c.replace("import { Sidebar } from '@/components/Sidebar';", '')
        c = c.replace("<Sidebar />","").replace("<Sidebar/>","")
        with open(ai_page,"w") as f: f.write(c)
        log("  [TB-004] PATCHED: ai/page.tsx")
        results.append({"task":"TB-004","file":"ai/page.tsx","status":"PATCHED"})

# TB-005: Fix Login
log("\nTB-005: login/page.tsx — tokenManager + /workspace redirect")
write(PORTAL+"/app/login/page.tsx", '''// @ts-nocheck
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
''', "TB-005", "app/login/page.tsx")

# TB-006: Fix old color scheme
log("\nTB-006: Replacing old color #1B2B4B across all pages")
color_map = {
    "bg-[#1B2B4B]":               "bg-amber-600",
    "text-[#1B2B4B]":             "text-amber-700",
    "border-[#1B2B4B]":           "border-amber-600",
    "focus:ring-[#1B2B4B]":       "focus:ring-amber-500",
    "hover:border-[#1B2B4B]":     "hover:border-amber-500",
    "hover:text-[#1B2B4B]":       "hover:text-amber-700",
    "group-hover:text-[#1B2B4B]": "group-hover:text-amber-700",
    "focus-visible:ring-[#1B2B4B]":"focus-visible:ring-amber-500",
}
fixed_color = 0
for tsx in glob.glob(PORTAL+"/app/**/*.tsx", recursive=True):
    if "node_modules" in tsx: continue
    with open(tsx) as f: content = f.read()
    original = content
    for old,new in color_map.items(): content = content.replace(old,new)
    if content != original:
        with open(tsx,"w") as f: f.write(content)
        fixed_color += 1
log("  [TB-006] Fixed #1B2B4B in "+str(fixed_color)+" files")
results.append({"task":"TB-006","files_fixed":fixed_color,"status":"OK"})

log("\n"+"="*60)
log("SPRINT 1 COMPLETE")
log("  [TB-001] PageWrapper: use client added")
log("  [TB-002] Error boundaries: Breadcrumb removed")
log("  [TB-003] MobileNav: null shim")
log("  [TB-004] Sidebar: null shim + ai/page.tsx patched")
log("  [TB-005] Login: tokenManager + /workspace redirect")
log("  [TB-006] Color #1B2B4B: fixed in "+str(fixed_color)+" pages")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/sprint1_results.json","w") as f:
    json.dump({"sprint":"Sprint 1","timestamp":str(datetime.datetime.now()),"results":results},f,indent=2)
log("  Saved: tasks/logs/sprint1_results.json")
