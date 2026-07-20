import os, glob, re, json, datetime, urllib.request
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/w1.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'routes':[], 'api_calls':[], 'broken_apis':[], 'orphaned':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('W1 START — Enterprise Architecture Audit')

# Map all enterprise routes
log(chr(10)+'All enterprise routes:')
ent_pages = glob.glob(PORTAL+'/app/(app)/(enterprise)/**/page.tsx', recursive=True)
ent_pages = [f for f in ent_pages if 'node_modules' not in f]
log('  Total enterprise pages: '+str(len(ent_pages)))

# Group by section
sections = {}
for f in sorted(ent_pages):
    rel = f.replace(PORTAL+'/app/(app)/(enterprise)/','').replace('/page.tsx','')
    parts = rel.split('/')
    section = parts[0] if parts else 'root'
    sections.setdefault(section, []).append('/'+rel)

log(chr(10)+'Enterprise sections:')
for section, routes in sorted(sections.items()):
    log('  ['+section+'] '+str(len(routes))+' pages')
    for route in routes[:3]:
        log('    '+route)
    if len(routes)>3: log('    ... and '+str(len(routes)-3)+' more')

# Find all API calls in enterprise pages
log(chr(10)+'API calls audit:')
api_patterns = {}
for f in ent_pages:
    try:
        with open(f) as fp: content = fp.read()
        # Find fetch calls and api imports
        apis = re.findall(r'fetch\(["\']([^"\']+)["\']', content)
        apis += re.findall(r'\.(get|list|create|update|delete)\(', content)
        apis += re.findall(r'enterpriseApi\.([a-zA-Z.]+)\(', content)
        if apis:
            rel = f.replace(PORTAL+'/app/(app)/(enterprise)/','').replace('/page.tsx','')
            api_patterns[rel] = list(set(apis))[:5]
    except: pass

log('  Files with API calls: '+str(len(api_patterns)))
for page, apis in list(api_patterns.items())[:10]:
    log('  '+page+': '+str(apis)[:80])

# Test TB Admin API endpoints to find what works
log(chr(10)+'TB Admin API endpoint test:')
import urllib.parse
form_data = urllib.parse.urlencode({'username':'admin@triangleblack.com','password':'admin123'}).encode()
token = None
try:
    req = urllib.request.Request('http://localhost:8030/api/v1/auth/login',
        data=form_data, headers={'Content-Type':'application/x-www-form-urlencoded'}, method='POST')
    with urllib.request.urlopen(req,timeout=5) as r:
        token = json.loads(r.read()).get('access_token','')
    log('  Got auth token: '+token[:20]+'...')
except Exception as e:
    log('  Auth failed: '+str(e)[:50])

endpoints_to_test = [
    '/api/v1/leads',
    '/api/v1/work-orders',
    '/api/v1/technicians',
    '/api/v1/assets',
    '/api/v1/warehouses',
    '/api/v1/inventory',
    '/api/v1/contracts',
    '/api/v1/invoices',
    '/api/v1/customers',
    '/api/v1/service-requests',
    '/api/v1/purchase-orders',
    '/api/v1/suppliers',
    '/api/v1/quotes',
    '/api/v1/projects',
    '/api/v1/analytics',
    '/api/v1/dashboard',
]
working = []
broken  = []
headers = {'Authorization':'Bearer '+token} if token else {}
for ep in endpoints_to_test:
    try:
        req = urllib.request.Request('http://localhost:8030'+ep, headers=headers)
        with urllib.request.urlopen(req,timeout=5) as resp:
            data = json.loads(resp.read())
            count = len(data) if isinstance(data,list) else data.get('total',data.get('count','?'))
            log('  OK '+ep+' ('+str(count)+')')
            working.append(ep)
    except urllib.error.HTTPError as e:
        if e.code == 401:
            log('  AUTH '+ep+' (401 - needs token)')
            working.append(ep)  # endpoint exists, just needs auth
        else:
            log('  '+str(e.code)+' '+ep)
            broken.append(ep)
    except Exception as e:
        log('  ERR '+ep)
        broken.append(ep)

log(chr(10)+'Summary:')
log('  Working endpoints: '+str(len(working)))
log('  Broken/missing: '+str(len(broken)))
log('  Broken: '+str(broken))
results['broken_apis'] = broken
results['working_apis'] = working
results['enterprise_sections'] = list(sections.keys())
results['enterprise_page_count'] = len(ent_pages)

with open('/home/amr/AI-COMPANY-OS/tasks/logs/w1_result.json','w') as f:
    json.dump(results,f,indent=2)
log('='*40)
log('W1 COMPLETE')
log('  Enterprise pages: '+str(len(ent_pages)))
log('  Working TB APIs: '+str(len(working)))
log('  Broken TB APIs: '+str(len(broken)))