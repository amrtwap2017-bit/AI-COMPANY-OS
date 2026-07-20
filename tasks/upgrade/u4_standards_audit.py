import os, json, datetime, urllib.request, subprocess, glob
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/u4.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
HUB    = ROOT + '/hub/dashboard'
ENGINE = ROOT + '/07-AI-ENGINE'
OLLAMA = 'http://localhost:11434/api/generate'
MODEL  = 'qwen2.5-coder:7b'
results = {'scores':{}, 'issues':[], 'recommendations':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def ask(prompt, timeout=120):
    data = json.dumps({'model':MODEL,'prompt':prompt,'stream':False,
        'keep_alive':'15m','options':{'num_predict':600,'temperature':0.2}}).encode()
    req = urllib.request.Request(OLLAMA, data=data,
        headers={'Content-Type':'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get('response','')
    except Exception as e:
        return 'Error: '+str(e)

log('U4 START — Standards Audit with qwen2.5-coder:7b')

# Collect stats
portal_pages = len(glob.glob(PORTAL+'/app/**/page.tsx', recursive=True))
portal_comps = len(glob.glob(PORTAL+'/components/**/*.tsx', recursive=True))
hub_pages    = len(glob.glob(HUB+'/app/**/page.tsx', recursive=True))
engine_py    = len(glob.glob(ENGINE+'/**/*.py', recursive=True))
ts_nocheck   = 0
any_count    = 0
todo_count   = 0
for f in glob.glob(PORTAL+'/app/**/*.tsx', recursive=True):
    if 'node_modules' in f: continue
    try:
        c = open(f).read()
        if '@ts-nocheck' in c: ts_nocheck += 1
        any_count += c.count(' as any')
        todo_count += c.upper().count('TODO')
    except: pass

log('Stats: portal_pages='+str(portal_pages)+' comps='+str(portal_comps))
log('  ts-nocheck='+str(ts_nocheck)+' as-any='+str(any_count)+' TODOs='+str(todo_count))

# AI audit
log(chr(10)+'Running AI standards audit...')
audit = ask(
    'Senior engineering lead audit for Triangle Black portal SaaS Egypt.' + chr(10) +
    'Stats: '+str(portal_pages)+' pages, '+str(portal_comps)+' components, '+str(hub_pages)+' hub pages.' + chr(10) +
    'Technical debt: '+str(ts_nocheck)+' files with @ts-nocheck, '+str(any_count)+' (as any) casts, '+str(todo_count)+' TODOs.' + chr(10) +
    'Stack: Next.js 16 + FastAPI + PostgreSQL + Qdrant + Ollama + Nginx.' + chr(10) + chr(10) +
    'Give a standards audit:' + chr(10) +
    '1. Code quality score /10 with breakdown' + chr(10) +
    '2. Top 5 technical debt items to fix (priority order)' + chr(10) +
    '3. Top 5 missing features for production hotel SaaS' + chr(10) +
    '4. Security posture score /10' + chr(10) +
    '5. Performance score /10' + chr(10) +
    '6. This week priority: ONE thing to fix first' + chr(10) +
    'Be specific and actionable.'
)
log('  Audit: '+str(len(audit.split()))+' words')
results['scores']['audit'] = audit

# Save report
today = datetime.date.today().strftime('%Y-%m-%d')
report = ROOT + '/reports/standards-audit-'+today+'.md'
os.makedirs(ROOT+'/reports', exist_ok=True)
content  = '# Standards Audit — '+today + chr(10)
content += '**Model:** '+MODEL + chr(10) + chr(10)
content += '## Project Stats' + chr(10)
content += '- Portal pages: '+str(portal_pages) + chr(10)
content += '- Components: '+str(portal_comps) + chr(10)
content += '- Hub pages: '+str(hub_pages) + chr(10)
content += '- Engine Python files: '+str(engine_py) + chr(10)
content += '- @ts-nocheck files: '+str(ts_nocheck) + chr(10)
content += '- (as any) casts: '+str(any_count) + chr(10)
content += '- TODOs: '+str(todo_count) + chr(10) + chr(10)
content += '## AI Standards Audit' + chr(10) + chr(10)
content += audit + chr(10)
with open(report,'w') as f: f.write(content)
log('  Report: '+report)

# Copy to desktop
try:
    import shutil, pathlib
    users = [u.name for u in pathlib.Path('/mnt/c/Users').iterdir()
             if u.name not in ['Public','Default','All Users','Default User']]
    if users:
        dest = '/mnt/c/Users/'+users[0]+'/Desktop/standards-audit-'+today+'.md'
        shutil.copy(report, dest)
        log('  Copied to Desktop: '+dest)
except Exception as e:
    log('  Desktop copy: '+str(e)[:50])

log('U4 COMPLETE')
with open('/home/amr/AI-COMPANY-OS/tasks/logs/u4_result.json','w') as f:
    json.dump(results,f,indent=2)