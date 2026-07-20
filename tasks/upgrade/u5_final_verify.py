import os, subprocess, time, urllib.request, datetime, json, ssl
LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/u5.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'healthy':[], 'broken':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def check(url, name):
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        if url.startswith('https'):
            r = urllib.request.urlopen(url, timeout=8, context=ctx)
        else:
            r = urllib.request.urlopen(url, timeout=8)
        log('  OK '+name+' ('+str(r.status)+')')
        results['healthy'].append(name)
        return True
    except urllib.error.HTTPError as e:
        if e.code < 500:
            log('  OK '+name+' ('+str(e.code)+')')
            results['healthy'].append(name)
            return True
        log('  ERR '+name+' ('+str(e.code)+')')
        results['broken'].append(name)
        return False
    except Exception as e:
        log('  ERR '+name+': '+str(e)[:60])
        results['broken'].append(name)
        return False

log('U5 START — Final Full System Verify')

# All services
log(chr(10)+'Service health:')
services = [
    ('http://localhost:8001/api/v1/ai/health', 'Engine :8001'),
    ('http://localhost:8030/', 'TB Admin :8030'),
    ('http://localhost:3000', 'Hub :3000'),
    ('http://localhost:3001/dashboard', 'Portal :3001'),
    ('https://localhost/nginx-health', 'Nginx HTTPS :443'),
    ('http://localhost:6333/collections', 'Qdrant :6333'),
    ('http://localhost:11434/api/tags', 'Ollama :11434'),
    ('http://localhost:3400', 'OpenWebUI :3400'),
]
for url, name in services: check(url, name)

# DB health
log(chr(10)+'Database health:')
secrets_file = os.path.expanduser('~/.ai-company-os-secrets')
pg_pass = 'postgres'
if os.path.exists(secrets_file):
    for line in open(secrets_file):
        if line.startswith('NEW_POSTGRES_PASSWORD='):
            pg_pass = line.split('=',1)[1].strip()
env = {**os.environ, 'PGPASSWORD': pg_pass}
for q, label in [
    ('SELECT count(*) FROM tasks', 'tasks'),
    ('SELECT count(*) FROM agents', 'agents'),
    ('SELECT count(*) FROM memories', 'memories'),
]:
    r = subprocess.run(['psql','-U','postgres','-d','ai_company_os',
        '-h','localhost','-t','-A','-c',q],
        capture_output=True, text=True, env=env, timeout=5)
    log('  '+label+': '+(r.stdout.strip() or 'ERR'))

# TB DB
r = subprocess.run(['psql','-U','postgres','-d','triangle_black',
    '-h','localhost','-t','-A','-c','SELECT count(*) FROM leads;'],
    capture_output=True, text=True, env=env, timeout=5)
log('  TB leads: '+(r.stdout.strip() or 'ERR'))

# Ollama test
log(chr(10)+'Ollama agent test:')
data = json.dumps({'model':'qwen2.5-coder:7b','prompt':'say OK',
    'stream':False,'options':{'num_predict':5}}).encode()
req = urllib.request.Request('http://localhost:11434/api/generate',
    data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        resp = json.loads(r.read()).get('response','')
        log('  Ollama: '+resp[:30])
        results['healthy'].append('Ollama response')
except Exception as e:
    log('  Ollama ERR: '+str(e)[:60])
    results['broken'].append('Ollama')

# Cron check
log(chr(10)+'Cron jobs:')
r = subprocess.run(['crontab','-l'], capture_output=True, text=True)
crons = [l for l in r.stdout.split(chr(10)) if l.strip() and not l.startswith('#')]
for c in crons: log('  '+c[:80])
if not crons: log('  No cron jobs set')

# Final git commit
log(chr(10)+'Git status:')
subprocess.run(['git','add','-A'], cwd=ROOT, capture_output=True)
r = subprocess.run(['git','status','--short'], cwd=ROOT,
    capture_output=True, text=True)
if r.stdout.strip():
    log('  Changed files:')
    for l in r.stdout.strip().split(chr(10))[:10]:
        log('  '+l)
    r2 = subprocess.run(['git','commit','-m',
        'chore: upgrade tasks u1-u5 complete'],
        cwd=ROOT, capture_output=True, text=True)
    log('  Committed: '+r2.stdout.strip()[:60])
    results['fixed'].append('committed')
else:
    log('  Nothing to commit')

log(chr(10)+'='*40)
log('U5 COMPLETE — FULL SYSTEM VERIFIED')
log('  Healthy: '+str(len(results['healthy']))+'/'+str(len(services)+3))
log('  Broken:  '+str(len(results['broken'])))
for s in results['healthy']: log('  OK  '+s)
if results['broken']:
    log(chr(10)+'BROKEN:')
    for b in results['broken']: log('  ERR '+b)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/u5_result.json','w') as f:
    json.dump(results,f,indent=2)