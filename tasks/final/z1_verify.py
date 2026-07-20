import os, subprocess, glob, json, datetime, urllib.request, ssl
LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/z1.log'
ROOT = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
r = {'healthy':[], 'broken':[], 'pages':[], 'components':[], 'missing':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def check(url, name):
    try:
        ctx=ssl.create_default_context()
        ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
        resp=urllib.request.urlopen(url,timeout=8,
            context=ctx if url.startswith('https') else None)
        log('  OK '+name); r['healthy'].append(name); return resp.status
    except urllib.error.HTTPError as e:
        if e.code<500: log('  OK '+name+' ('+str(e.code)+')'); r['healthy'].append(name); return e.code
        log('  ERR '+name+' ('+str(e.code)+')'); r['broken'].append(name); return e.code
    except Exception as e:
        log('  ERR '+name+': '+str(e)[:50]); r['broken'].append(name); return 0

log('Z1 START — Full System Verify')

# Services
log(chr(10)+'Services:')
for url,name in [
    ('http://localhost:8001/api/v1/ai/health','Engine :8001'),
    ('http://localhost:8030/','TB Admin :8030'),
    ('http://localhost:3000','Hub :3000'),
    ('http://localhost:3001/dashboard','Portal :3001'),
    ('https://localhost/nginx-health','Nginx HTTPS'),
    ('http://localhost:6333/collections','Qdrant :6333'),
    ('http://localhost:11434/api/tags','Ollama :11434'),
    ('http://localhost:3400','OpenWebUI :3400'),
]: check(url,name)

# All portal routes
log(chr(10)+'Portal routes:')
routes = [
    '/','/ dashboard','/leads','/work-orders','/technicians',
    '/assets','/warehouses','/inventory','/reports','/login',
]
for route in routes:
    code = check('http://localhost:3001'+route.split()[0], route.strip())
    r['pages'].append({'route':route.strip(), 'code':code})

# Component audit
log(chr(10)+'Component audit:')
ui_files = glob.glob(PORTAL+'/components/ui/*.tsx')
ui_files = [f for f in ui_files if 'node_modules' not in f]
log('  UI components: '+str(len(ui_files)))
for f in sorted(ui_files): log('  OK '+os.path.basename(f))

# Check missing files
log(chr(10)+'Checking required files:')
required = {
    'lib/export.ts':        'CSV/Print export utility',
    'lib/dashboard-api.ts': 'Live dashboard data',
    'lib/token-store.ts':   'Auth token storage',
    'lib/notify.ts':        'Toast notifications',
    'lib/constants.ts':     'App constants',
    'lib/shared-types.ts':  'Shared TypeScript types',
    'lib/hooks/usePagination.ts': 'Pagination hook',
    'lib/hooks/useSearch.ts':     'Search hook',
    'components/ui/Pagination.tsx':   'Pagination UI',
    'components/ui/MobileNav.tsx':    'Mobile navigation',
    'components/ui/Breadcrumb.tsx':   'Breadcrumb nav',
    'components/ui/ConfirmDialog.tsx':'Confirm dialogs',
    'components/ui/ExportButton.tsx': 'Export button',
    'components/ui/ActionBar.tsx':    'Action bar',
    'components/ClientInit.tsx':      'Auto-login init',
    'app/error.tsx':        'Global error boundary',
    'app/not-found.tsx':    '404 page',
    'app/loading.tsx':      'Global loading state',
}
for path, desc in required.items():
    full = PORTAL + '/' + path
    if os.path.exists(full):
        log('  OK '+path)
    else:
        log('  MISSING: '+path+' ('+desc+')')
        r['missing'].append(path)

# DB counts
log(chr(10)+'DB health:')
secrets_file=os.path.expanduser('~/.ai-company-os-secrets')
pg_pass='postgres'
if os.path.exists(secrets_file):
    for line in open(secrets_file):
        if line.startswith('NEW_POSTGRES_PASSWORD='): pg_pass=line.split('=',1)[1].strip()
env={**os.environ,'PGPASSWORD':pg_pass}
for q,lbl in [
    ('SELECT count(*) FROM tasks','tasks'),
    ('SELECT count(*) FROM agents','agents'),
    ('SELECT count(*) FROM memories','memories'),
]:
    rv=subprocess.run(['psql','-U','postgres','-d','ai_company_os',
        '-h','localhost','-t','-A','-c',q],capture_output=True,text=True,env=env,timeout=5)
    log('  '+lbl+': '+(rv.stdout.strip() or 'ERR'))
for q,lbl in [
    ('SELECT count(*) FROM leads','TB leads'),
    ('SELECT count(*) FROM work_orders','TB work_orders'),
    ('SELECT count(*) FROM technicians','TB technicians'),
]:
    rv=subprocess.run(['psql','-U','postgres','-d','triangle_black',
        '-h','localhost','-t','-A','-c',q],capture_output=True,text=True,env=env,timeout=5)
    log('  '+lbl+': '+(rv.stdout.strip() or 'ERR'))

# Portal stats
log(chr(10)+'Portal stats:')
pages_count = len(glob.glob(PORTAL+'/app/**/page.tsx',recursive=True))
comps_count = len(glob.glob(PORTAL+'/components/**/*.tsx',recursive=True))
hooks_count = len(glob.glob(PORTAL+'/lib/hooks/*.ts'))
lib_count   = len(glob.glob(PORTAL+'/lib/**/*.ts',recursive=True))
test_count  = len(glob.glob(PORTAL+'/__tests__/**/*.test.*',recursive=True))
log('  Pages:      '+str(pages_count))
log('  Components: '+str(comps_count))
log('  Hooks:      '+str(hooks_count))
log('  Lib files:  '+str(lib_count))
log('  Tests:      '+str(test_count))

log(chr(10)+'='*50)
log('Z1 COMPLETE — FULL STATUS REPORT')
log('  Services: '+str(len(r['healthy']))+'/8')
log('  Missing:  '+str(len(r['missing']))+' files')
for m in r['missing']: log('  MISSING: '+m)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/z1_result.json','w') as f:
    json.dump(r,f,indent=2)