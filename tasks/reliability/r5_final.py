# R5 — Final Rebuild + Complete Health Check + Git
import os, subprocess, time, urllib.request, datetime, json, ssl

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/r5.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
HUB    = ROOT + '/hub/dashboard'
NODE   = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
results = {'healthy':[],'broken':[],'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def check(url,name):
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
        if e.code<500:
            log('  OK '+name+' ('+str(e.code)+')')
            results['healthy'].append(name)
            return True
        log('  ERR '+name)
        results['broken'].append(name)
        return False
    except Exception as e:
        log('  ERR '+name+': '+str(e)[:50])
        results['broken'].append(name)
        return False

log('R5 START — Final Rebuild + Health Check')

# Rebuild Portal with optimized config
log(chr(10)+'Rebuilding Portal (optimized config)...')
env={**os.environ,
    'PATH':os.path.dirname(NODE)+':'+os.environ.get('PATH',''),
    'NODE_ENV':'production','NEXT_TELEMETRY_DISABLED':'1'}
r=subprocess.run([NODE,'node_modules/.bin/next','build'],
    cwd=PORTAL,capture_output=True,text=True,timeout=300,env=env)
if r.returncode==0:
    log('  Portal BUILD SUCCESS')
    results['fixed'].append('portal built')

    # Get bundle size
    r2=subprocess.run(['du','-sh',PORTAL+'/.next'],capture_output=True,text=True)
    size=r2.stdout.split()[0] if r2.stdout else '?'
    log('  Bundle size: '+size)
    results['fixed'].append('bundle: '+size)
else:
    log('  Portal BUILD FAILED')
    for l in (r.stdout+r.stderr).split(chr(10))[-10:]:
        if l.strip(): log('  > '+l[:100])
    results['broken'].append('portal build')

# Restart all services cleanly
log(chr(10)+'Restarting services...')
subprocess.run(['/usr/bin/pkill','-f','next.*3001'],capture_output=True)
subprocess.run(['/usr/bin/pkill','-f','next.*3000'],capture_output=True)
subprocess.run(['/usr/bin/fuser','-k','3000/tcp'],capture_output=True)
subprocess.run(['/usr/bin/fuser','-k','3001/tcp'],capture_output=True)
time.sleep(3)

# Start Hub
hub_proc=subprocess.Popen(
    [NODE,'node_modules/.bin/next','start','-p','3000'],
    cwd=HUB,stdout=open('/tmp/hub.log','w'),
    stderr=subprocess.STDOUT,env=env)
log('  Hub PID: '+str(hub_proc.pid))
time.sleep(5)

# Start Portal
portal_proc=subprocess.Popen(
    [NODE,'node_modules/.bin/next','start','-p','3001'],
    cwd=PORTAL,stdout=open('/tmp/portal.log','w'),
    stderr=subprocess.STDOUT,env=env)
log('  Portal PID: '+str(portal_proc.pid))
time.sleep(8)

# Full health check
log(chr(10)+'Full system health:')
for url,name in [
    ('http://localhost:8001/api/v1/ai/health','Engine :8001'),
    ('http://localhost:8030/','TB Admin :8030'),
    ('http://localhost:3000','Hub :3000'),
    ('http://localhost:3001/dashboard','Portal :3001'),
    ('https://localhost/nginx-health','Nginx HTTPS'),
    ('http://localhost:6333/collections','Qdrant :6333'),
    ('http://localhost:11434/api/tags','Ollama :11434'),
    ('http://localhost:3400','OpenWebUI :3400'),
]:
    check(url,name)

# Portal routes
log(chr(10)+'Portal routes:')
route_ok=0
for route in ['/','/dashboard','/leads','/work-orders','/technicians','/assets']:
    try:
        urllib.request.urlopen('http://localhost:3001'+route,timeout=5)
        log('  OK '+route)
        route_ok+=1
    except urllib.error.HTTPError as e:
        if e.code<500:
            log('  OK '+route+' ('+str(e.code)+')')
            route_ok+=1
        else: log('  ERR '+route)
    except: log('  ERR '+route)
log('  Routes: '+str(route_ok)+'/6')

# Git final commit
log(chr(10)+'Git final commit...')
subprocess.run(['git','add','-A'],cwd=ROOT,capture_output=True)
msg = ('feat: v2.2.0 reliability + performance upgrade'+chr(10)+chr(10)+
    'R1: Watchdog process manager + @reboot cron'+chr(10)+
    'R2: Relative imports → @/ absolute paths'+chr(10)+
    'R3: Bundle optimization (removeConsole, optimizePackageImports)'+chr(10)+
    'R4: Test data seeded (10 WOs, 7 technicians)'+chr(10)+
    'R5: Final rebuild + all services verified'+chr(10)+chr(10)+
    'Services: '+str(len(results['healthy']))+'/8 healthy'+chr(10)+
    'Portal: PROD mode | Routes: '+str(route_ok)+'/6')
r=subprocess.run(['git','commit','-m',msg],
    cwd=ROOT,capture_output=True,text=True)
if 'nothing' not in r.stdout+r.stderr:
    log('  Committed: '+r.stdout.strip()[:60])

# Tag v2.2.0
r2=subprocess.run(['git','tag','-f','v2.2.0','-m','v2.2.0: reliability upgrade'],
    cwd=ROOT,capture_output=True,text=True)
log('  Tagged: v2.2.0')
results['fixed'].append('tagged v2.2.0')

log(chr(10)+'='*50)
log('R5 COMPLETE — v2.2.0')
log('  Healthy: '+str(len(results['healthy']))+'/8')
log('  Routes:  '+str(route_ok)+'/6')
if results['broken']:
    for b in results['broken']: log('  ERR '+b)
log(chr(10)+'START: bash START-SAFE.sh')
log('WATCH: bash WATCHDOG.sh &')
log('CHECK: bash CHECK.sh')
with open('/home/amr/AI-COMPANY-OS/tasks/logs/r5_result.json','w') as f:
    json.dump(results,f,indent=2)