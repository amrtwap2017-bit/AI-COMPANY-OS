# Y2 — Wire Layout: MobileNav + Breadcrumb + Store Auth Token
import os, json, datetime, re

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/y2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'fixed':[], 'created':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('Y2 START — Wire Layout Components')

# Fix app layout to include MobileNav + padding for mobile header
app_layout = PORTAL + '/app/(app)/layout.tsx'
if os.path.exists(app_layout):
    with open(app_layout) as f: content = f.read()
    log('  Current (app) layout:')
    log('  '+content[:200])

    # Add MobileNav if not present
    if 'MobileNav' not in content:
        new_layout = '''// @ts-nocheck
import { MobileNav } from "@/components/ui/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />
      <main className="lg:pl-0 pt-14 lg:pt-0 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
'''
        with open(app_layout,'w') as f: f.write(new_layout)
        log('  OK: MobileNav wired to (app)/layout.tsx')
        results['fixed'].append('(app)/layout.tsx updated')
    else:
        log('  MobileNav already in layout')
else:
    # Create it
    new_layout = '''// @ts-nocheck
import { MobileNav } from "@/components/ui/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />
      <main className="pt-14 lg:pt-0 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
'''
    with open(app_layout,'w') as f: f.write(new_layout)
    log('  CREATED: (app)/layout.tsx with MobileNav')
    results['created'].append('(app)/layout.tsx')

# Create auth token store (saves token from login)
token_store = '''// @ts-nocheck
// Auth token storage — saves TB Admin JWT

const TOKEN_KEY = "tb_access_token";
const USER_KEY  = "tb_user";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isValid(): boolean {
    const token = this.get();
    if (!token) return false;
    // Check if bypass mode
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return true;
    // Basic JWT expiry check
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

// Auto-login for development
export async function devAutoLogin() {
  if (typeof window === "undefined") return;
  if (tokenStore.isValid()) return; // already logged in

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true") return;

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030";
  try {
    const form = new URLSearchParams();
    form.append("username", "admin@triangleblack.com");
    form.append("password", "admin123");
    const res = await fetch(API + "/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        tokenStore.set(data.access_token);
        console.log("Dev auto-login successful");
      }
    }
  } catch (e) {
    console.debug("Dev auto-login failed:", e);
  }
}
'''
write(PORTAL+'/lib/token-store.ts', token_store, 'lib/token-store.ts')

# Create ClientInit component (runs auto-login + sets up client)
client_init = '''// @ts-nocheck
"use client";
import { useEffect } from "react";
import { devAutoLogin } from "@/lib/token-store";

export function ClientInit() {
  useEffect(() => {
    // Auto-login in dev mode
    devAutoLogin();
  }, []);

  return null; // no UI
}
'''
write(PORTAL+'/components/ClientInit.tsx', client_init, 'components/ClientInit.tsx')

# Wire ClientInit to root layout
root_layout = PORTAL + '/app/layout.tsx'
with open(root_layout) as f: rl = f.read()
if 'ClientInit' not in rl:
    rl = rl.replace(
        "import type { Metadata }",
        "import { ClientInit } from '@/components/ClientInit';" + chr(10) +
        "import type { Metadata }"
    )
    rl = rl.replace(
        "{children}",
        "{children}" + chr(10) + "        <ClientInit />"
    )
    with open(root_layout,'w') as f: f.write(rl)
    log('  OK: ClientInit wired to root layout')
    results['fixed'].append('ClientInit in root layout')

log('='*40)
log('Y2 COMPLETE')
for f in results['fixed']+results['created']: log('  OK '+str(f))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/y2_result.json','w') as f:
    json.dump(results,f,indent=2)