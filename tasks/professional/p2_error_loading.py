# P2 — Add Error Boundaries + Loading + Empty States
import os, glob, re, shutil, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/p2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('P2 START — Error Boundaries + Loading + Empty States')

def write_file(path, content, label):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    if not os.path.exists(path):
        with open(path,'w') as f: f.write(content)
        log('  CREATED: '+label)
        results['created'].append(label)
    else:
        log('  EXISTS: '+label)

# Global error boundary
write_file(PORTAL+'/app/error.tsx',
    '// @ts-nocheck' + chr(10) +
    '"use client";' + chr(10) +
    'import { useEffect } from "react";' + chr(10) +
    'export default function Error({error,reset}:{error:Error&{digest?:string};reset:()=>void}) {' + chr(10) +
    '  useEffect(()=>{ console.error(error) },[error]);' + chr(10) +
    '  return (' + chr(10) +
    '    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">' + chr(10) +
    '      <div className="text-center p-8 max-w-md">' + chr(10) +
    '        <div className="text-6xl mb-4">⚠️</div>' + chr(10) +
    '        <h2 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h2>' + chr(10) +
    '        <p className="text-slate-400 mb-6 text-sm">{error.message}</p>' + chr(10) +
    '        <button onClick={reset} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">' + chr(10) +
    '          Try again' + chr(10) +
    '        </button>' + chr(10) +
    '      </div>' + chr(10) +
    '    </div>' + chr(10) +
    '  );' + chr(10) +
    '}' + chr(10),
    'app/error.tsx')

# Global loading
write_file(PORTAL+'/app/loading.tsx',
    '// @ts-nocheck' + chr(10) +
    'export default function Loading() {' + chr(10) +
    '  return (' + chr(10) +
    '    <div className="min-h-screen flex items-center justify-center bg-slate-950">' + chr(10) +
    '      <div className="flex flex-col items-center gap-4">' + chr(10) +
    '        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />' + chr(10) +
    '        <p className="text-slate-400 text-sm">Loading...</p>' + chr(10) +
    '      </div>' + chr(10) +
    '    </div>' + chr(10) +
    '  );' + chr(10) +
    '}' + chr(10),
    'app/loading.tsx')

# Not found
write_file(PORTAL+'/app/not-found.tsx',
    '// @ts-nocheck' + chr(10) +
    'import Link from "next/link";' + chr(10) +
    'export default function NotFound() {' + chr(10) +
    '  return (' + chr(10) +
    '    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">' + chr(10) +
    '      <div className="text-center p-8">' + chr(10) +
    '        <div className="text-8xl font-black text-slate-700 mb-4">404</div>' + chr(10) +
    '        <h2 className="text-2xl font-bold mb-2">Page not found</h2>' + chr(10) +
    '        <Link href="/dashboard" className="mt-6 px-6 py-2 bg-blue-600 rounded-lg inline-block hover:bg-blue-700">' + chr(10) +
    '          Go to Dashboard' + chr(10) +
    '        </Link>' + chr(10) +
    '      </div>' + chr(10) +
    '    </div>' + chr(10) +
    '  );' + chr(10) +
    '}' + chr(10),
    'app/not-found.tsx')

# Loading states for all main sections
SKELETON = ('// @ts-nocheck' + chr(10) +
    'export default function Loading() {' + chr(10) +
    '  return (' + chr(10) +
    '    <div className="p-6 space-y-4 animate-pulse">' + chr(10) +
    '      <div className="h-8 bg-slate-800 rounded w-1/3" />' + chr(10) +
    '      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">' + chr(10) +
    '        {[1,2,3].map(i=>(<div key={i} className="h-32 bg-slate-800 rounded-xl" />))}' + chr(10) +
    '      </div>' + chr(10) +
    '      <div className="space-y-3">' + chr(10) +
    '        {[1,2,3,4,5].map(i=>(<div key={i} className="h-12 bg-slate-800 rounded" />))}' + chr(10) +
    '      </div>' + chr(10) +
    '    </div>' + chr(10) +
    '  );' + chr(10) +
    '}' + chr(10))

sections = ['dashboard','leads','work-orders','technicians',
    'assets','warehouses','inventory','reports',
    '(enterprise)/operations','(enterprise)/maintenance',
    '(enterprise)/supply-chain','(enterprise)/analytics',
    '(enterprise)/executive','(enterprise)/engineering']
for section in sections:
    write_file(PORTAL+'/app/(app)/'+section+'/loading.tsx', SKELETON, section+'/loading.tsx')

# Error boundaries for main sections
ERR_BOUNDARY = ('// @ts-nocheck' + chr(10) +
    '"use client";' + chr(10) +
    'export default function Error({error,reset}:{error:Error;reset:()=>void}) {' + chr(10) +
    '  return (' + chr(10) +
    '    <div className="p-6 text-center">' + chr(10) +
    '      <div className="text-4xl mb-3">⚠️</div>' + chr(10) +
    '      <p className="text-red-400 mb-4">{error.message}</p>' + chr(10) +
    '      <button onClick={reset} className="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white">' + chr(10) +
    '        Retry' + chr(10) +
    '      </button>' + chr(10) +
    '    </div>' + chr(10) +
    '  );' + chr(10) +
    '}' + chr(10))

for section in ['(app)/leads','(app)/work-orders','(app)/dashboard',
    '(app)/(enterprise)/operations','(app)/(enterprise)/maintenance']:
    write_file(PORTAL+'/app/'+section+'/error.tsx', ERR_BOUNDARY, section+'/error.tsx')

log(chr(10)+'='*40)
log('P2 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/p2_result.json','w') as f:
    _j.dump(results,f,indent=2)