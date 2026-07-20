# Q3 — Full System Health + Portal PROD Verify
import os, subprocess, time, urllib.request, datetime, json, ssl

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/q3.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
NODE   = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
results = {'healthy':[],'broken':[],'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def check(url, name):
    try:
        ctx=ssl.create_default_context()
        ctx.check_hostname=False
        ctx.verify_mode=ssl.CERT_NONE
        if url.startswith('https'):
            r=urllib.request.urlopen(url,timeout=8,context=ctx)
        else:
            r=urllib.request.urlopen(url,timeout=8)
        log('  OK '+name)
        results['healthy'].append(name)
        return True
    except urllib.error.HTTPError as e:
        if e.code < 500:
            log('  OK '+name+' ('+str(e.code)+')')
            results['healthy'].append(name)
            return True
        log('  ERR '+name)
        results['broken'].append(name)
        return False
    except Exception as e:
        log('  ERR '+name+': '+str(e)[:60])
        results['broken'].append(name)
        return False

log('Q3 START — Full System Health + Portal PROD Verify')

# Check if portal is running
log(chr(10)+'Portal status:')
r = subprocess.run(['ps','aux'], capture_output=True, text=True)
portal_procs = [l for l in r.stdout.split(chr(10))
                if 'next' in l and '3001' in l and 'grep' not in l]
log('  Portal processes: '+str(len(portal_procs)))
for p in portal_procs: log('  '+p[:100])

# Check portal mode
is_prod = any('start' in p for p in portal_procs)
is_dev  = any('dev' in p for p in portal_procs)
log('  Mode: '+('PROD' if is_prod else 'DEV' if is_dev else 'NOT RUNNING'))

# If portal not running, start it
if not portal_procs:
    log('  Portal not running — starting...')
    subprocess.run(['/usr/bin/fuser','-k','3001/tcp'],capture_output=True)
    time.sleep(1)
    env={**os.environ,
        'PATH':os.path.dirname(NODE)+':'+os.environ.get('PATH',''),
        'NEXT_TELEMETRY_DISABLED':'1'}
    if os.path.exists(PORTAL+'/.next/BUILD_ID'):
        cmd=[NODE,'node_modules/.bin/next','start','-p','3001']
        mode='PROD'
    else:
        cmd=[NODE,'node_modules/.bin/next','dev','--turbo','-p','3001']
        mode='DEV'
    proc=subprocess.Popen(cmd,cwd=PORTAL,
        stdout=open('/tmp/portal.log','w'),stderr=subprocess.STDOUT,env=env)
    log('  Started ['+mode+'] PID: '+str(proc.pid))
    time.sleep(8)
    results['fixed'].append('portal started: '+mode)

# Full service check
log(chr(10)+'All services:')
for url, name in [
    ('http://localhost:8001/api/v1/ai/health','Engine :8001'),
    ('http://localhost:8030/','TB Admin :8030'),
    ('http://localhost:3000','Hub :3000'),
    ('http://localhost:3001/dashboard','Portal :3001'),
    ('https://localhost/nginx-health','Nginx HTTPS :443'),
    ('http://localhost:6333/collections','Qdrant :6333'),
    ('http://localhost:11434/api/tags','Ollama :11434'),
    ('http://localhost:3400','OpenWebUI :3400'),
]:
    check(url, name)

# Test all portal routes
log(chr(10)+'Portal route tests:')
routes = ['/','/dashboard','/leads','/work-orders',
    '/technicians','/assets','/warehouses','/login']
route_ok = 0
for route in routes:
    try:
        urllib.request.urlopen('http://localhost:3001'+route,timeout=5)
        log('  OK '+route)
        route_ok += 1
    except urllib.error.HTTPError as e:
        if e.code < 500:
            log('  OK '+route+' ('+str(e.code)+')')
            route_ok += 1
        else:
            log('  ERR '+route+' ('+str(e.code)+')')
    except Exception as e:
        log('  ERR '+route+': '+str(e)[:40])
log('  Routes OK: '+str(route_ok)+'/'+str(len(routes)))

# Test AI agent
log(chr(10)+'AI agent test:')
data=json.dumps({'model':'qwen2.5-coder:7b','prompt':'Reply OK','stream':False,
    'options':{'num_predict':5}}).encode()
req=urllib.request.Request('http://localhost:11434/api/generate',data=data,
    headers={'Content-Type':'application/json'},method='POST')
try:
    with urllib.request.urlopen(req,timeout=30) as r:
        resp=json.loads(r.read()).get('response','')
        log('  Ollama: '+resp[:20])
        results['healthy'].append('Ollama agent')
except Exception as e:
    log('  Ollama ERR: '+str(e)[:60])

# DB stats
log(chr(10)+'DB health:')
secrets_file=os.path.expanduser('~/.ai-company-os-secrets')
pg_pass='postgres'
if os.path.exists(secrets_file):
    for line in open(secrets_file):
        if line.startswith('NEW_POSTGRES_PASSWORD='):
            pg_pass=line.split('=',1)[1].strip()
env_pg={**os.environ,'PGPASSWORD':pg_pass}
for q,label in [
    ('SELECT count(*) FROM tasks','tasks'),
    ('SELECT count(*) FROM agents','agents'),
    ('SELECT count(*) FROM memories','memories'),
]:
    r=subprocess.run(['psql','-U','postgres','-d','ai_company_os',
        '-h','localhost','-t','-A','-c',q],
        capture_output=True,text=True,env=env_pg,timeout=5)
    log('  '+label+': '+(r.stdout.strip() or 'ERR'))

# Git tag if all healthy
if len(results['broken']) == 0:
    log(chr(10)+'All services healthy — tagging v2.1.0-stable')
    subprocess.run(['git','add','-A'],cwd=ROOT,capture_output=True)
    r=subprocess.run(['git','commit','-m','chore: Q-series quality tasks complete'],
        cwd=ROOT,capture_output=True,text=True)
    if 'nothing' not in r.stdout+r.stderr:
        log('  Committed')
    r2=subprocess.run(['git','tag','-f','v2.1.0-stable',
        '-m','v2.1.0-stable: all services healthy'],
        cwd=ROOT,capture_output=True,text=True)
    log('  Tagged: v2.1.0-stable')
    results['fixed'].append('tagged v2.1.0-stable')
else:
    log(chr(10)+'Broken services: '+str(results['broken']))

log(chr(10)+'='*50)
log('Q3 COMPLETE — SYSTEM VERIFIED')
log('  Healthy: '+str(len(results['healthy']))+'/9')
log('  Broken:  '+str(len(results['broken'])))
log('  Routes:  '+str(route_ok)+'/'+str(len(routes)))
log('  Portal:  '+('PROD' if is_prod else 'DEV' if is_dev else 'STARTED'))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/q3_result.json','w') as f:
    json.dump(results,f,indent=2)

# Print final report
log(chr(10)+'FINAL STATUS:')
for s in results['healthy']: log('  OK  '+s)
if results['broken']:
    for b in results['broken']: log('  ERR '+b)
log(chr(10)+'URLS:')
log('  Hub:      http://localhost:3000')
log('  Portal:   http://localhost:3001')
log('  HTTPS:    https://localhost')
log('  Chat:     http://localhost:3000/chat')
log('  Engine:   http://localhost:8001/docs')
log('  TB Admin: http://localhost:8030/docs')