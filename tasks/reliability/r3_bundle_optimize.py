# R3 — Bundle Optimization + Next.js Performance Config
import os, json, re, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/r3.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
HUB    = '/home/amr/AI-COMPANY-OS/hub/dashboard'
results = {'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('R3 START — Bundle Optimization')

# Optimize Portal next.config.ts
portal_config = PORTAL + '/next.config.ts'
with open(portal_config) as f: cfg = f.read()
original = cfg

optimized_config = '''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Experimental: faster builds
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
    ],
  },

  // API proxy rewrites
  async rewrites() {
    return [
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8030/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
'''

with open(portal_config,'w') as f: f.write(optimized_config)
log('  Optimized: portal/next.config.ts')
results['fixed'].append('portal next.config.ts optimized')

# Optimize Hub next.config.ts
hub_config = HUB + '/next.config.ts'
if os.path.exists(hub_config):
    with open(hub_config) as f: hc = f.read()
    hub_optimized = '''import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,
  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/ai/:path*",
        destination: "http://localhost:8001/api/v1/ai/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8001/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
'''
    with open(hub_config,'w') as f: f.write(hub_optimized)
    log('  Optimized: hub/next.config.ts')
    results['fixed'].append('hub next.config.ts optimized')

# Check package.json for bundle analysis script
portal_pkg = PORTAL + '/package.json'
with open(portal_pkg) as f: pkg = json.load(f)
if 'analyze' not in pkg.get('scripts',{}):
    pkg.setdefault('scripts',{})['analyze'] = 'ANALYZE=true next build'
    with open(portal_pkg,'w') as f: json.dump(pkg,f,indent=2)
    log('  Added analyze script to package.json')
    results['fixed'].append('analyze script added')

# Create .env.production with performance settings
prod_env = PORTAL + '/.env.production'
prod_content = '''# Production environment
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
'''
if not os.path.exists(prod_env):
    with open(prod_env,'w') as f: f.write(prod_content)
    log('  Created .env.production')
    results['fixed'].append('.env.production created')

log('='*40)
log('R3 COMPLETE')
log('  Fixed: '+str(len(results['fixed'])))
log('  Key: removeConsole=true in PROD, optimizePackageImports for lucide+tanstack')
for f in results['fixed']: log('  OK '+str(f))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/r3_result.json','w') as f:
    json.dump(results,f,indent=2)