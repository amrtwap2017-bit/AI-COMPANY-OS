# Y1 — Fix Build: export.ts + hotel_id + portal restart
import os, subprocess, time, json, datetime, urllib.request

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/y1.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
NODE   = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
results = {'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def build():
    env={**os.environ,
        'PATH':os.path.dirname(NODE)+':'+os.environ.get('PATH',''),
        'NODE_ENV':'production','NEXT_TELEMETRY_DISABLED':'1'}
    r=subprocess.run([NODE,'node_modules/.bin/next','build'],
        cwd=PORTAL,capture_output=True,text=True,timeout=300,env=env)
    return r.returncode, r.stdout+r.stderr, env

secrets_file=os.path.expanduser('~/.ai-company-os-secrets')
pg_pass='postgres'
if os.path.exists(secrets_file):
    for line in open(secrets_file):
        if line.startswith('NEW_POSTGRES_PASSWORD='): pg_pass=line.split('=',1)[1].strip()

def tb(q):
    env={**os.environ,'PGPASSWORD':pg_pass}
    r=subprocess.run(['psql','-U','postgres','-d','triangle_black',
        '-h','localhost','-P','pager=off','-t','-A','-c',q],
        capture_output=True,text=True,env=env,timeout=10)
    return r.stdout.strip(), r.stderr.strip()

log('Y1 START — Fix Build + hotel_id + Restart')

# Fix 1: Add 'use client' to export.ts (browser-only APIs)
log('Fix 1: Add use client to export.ts')
export_path = PORTAL + '/lib/export.ts'
with open(export_path) as f: content = f.read()
if '"use client"' not in content:
    content = '"use client";' + chr(10) + content
    with open(export_path,'w') as f: f.write(content)
    log('  OK: use client added to export.ts')
    results['fixed'].append('export.ts: use client added')
else:
    log('  SKIP: already has use client')

# Fix 2: Remove ExportButton from ui/index.ts (client-only component)
# Export it directly instead of through index to avoid SSR issues
log('Fix 2: Fix ui/index.ts SSR conflict')
ui_idx = PORTAL + '/components/ui/index.ts'
with open(ui_idx) as f: idx = f.read()
# Remove problematic exports from main index (they cause SSR issues)
lines = idx.split(chr(10))
safe_lines = []
removed = []
for line in lines:
    if any(x in line for x in ['ExportButton','ActionBar']):
        removed.append(line)
        log('  Removed from index: '+line.strip())
    else:
        safe_lines.append(line)
if removed:
    with open(ui_idx,'w') as f: f.write(chr(10).join(safe_lines))
    log('  OK: removed '+str(len(removed))+' SSR-unsafe exports from index')
    results['fixed'].append('ui/index.ts SSR-safe')

# Fix 3: Add 'use client' to ExportButton and ActionBar
for comp_file in [
    PORTAL+'/components/ui/ExportButton.tsx',
    PORTAL+'/components/ui/ActionBar.tsx',
]:
    if os.path.exists(comp_file):
        with open(comp_file) as f: content = f.read()
        if '"use client"' not in content and "'use client'" not in content:
            content = '"use client";' + chr(10) + content
            with open(comp_file,'w') as f: f.write(content)
            log('  OK: use client added to '+os.path.basename(comp_file))
            results['fixed'].append('use client: '+os.path.basename(comp_file))

# Fix 4: Get hotel_id for work order seeding
log(chr(10)+'Fix 4: Get hotel_id for seeding')
out, err = tb('SELECT id, name FROM hotels LIMIT 3;')
if err and 'ERROR' in err:
    log('  hotels table error: '+err[:60])
    # Try other table names
    for tbl in ['hotel','properties','sites','clients']:
        out2, err2 = tb('SELECT id FROM '+tbl+' LIMIT 1;')
        if not err2 or 'ERROR' not in err2:
            log('  Found hotel-like table: '+tbl+' → '+out2[:50])
            break
else:
    log('  Hotels: '+out[:100])
    hotel_id = None
    for line in out.split(chr(10)):
        if '|' in line:
            hotel_id = line.split('|')[0].strip()
            break
    if hotel_id:
        log('  Using hotel_id: '+hotel_id)
        # Seed work orders with hotel_id
        wo_data = [
            ('HVAC Chiller Unit 4B Not Cooling',     'hvac',       'high',     'open'),
            ('Lobby Elevator Door Adjustment',        'mechanical', 'medium',   'open'),
            ('Pool Circulation Pump Leak',            'plumbing',   'high',     'in_progress'),
            ('Ballroom Lighting Control Fault',       'electrical', 'medium',   'open'),
            ('Kitchen Exhaust Fan Replacement',       'mechanical', 'low',      'completed'),
            ('AC Unit Room 412 Not Working',          'hvac',       'medium',   'open'),
            ('Fire Suppression Annual Inspection',    'civil',      'low',      'open'),
            ('Swimming Pool Chemical Balance',        'cleaning',   'medium',   'in_progress'),
            ('Server Room UPS Battery Replace',       'it',         'critical', 'open'),
            ('Parking Gate Motor Failure',            'mechanical', 'high',     'open'),
        ]
        seeded = 0
        for title, typ, pri, status in wo_data:
            q = ("INSERT INTO work_orders(id,hotel_id,title,type,priority,status,created_at,updated_at) "
                 "VALUES(gen_random_uuid(),'"+hotel_id+"','"+title+"','"+typ+"','"+pri+"','"+status+"',NOW(),NOW()) "
                 "ON CONFLICT DO NOTHING;")
            _, e2 = tb(q)
            if 'ERROR' not in (e2 or ''): seeded += 1
            else: log('  WO err: '+e2[:60])
        log('  Seeded '+str(seeded)+'/10 work orders')
        results['fixed'].append('work_orders seeded: '+str(seeded))

# Build
log(chr(10)+'Build portal...')
code, output, env = build()
if code == 0:
    log('  BUILD SUCCESS')
    results['fixed'].append('portal builds clean')
else:
    log('  Build failed — checking remaining errors')
    errs = [l for l in output.split(chr(10))
            if 'Type error' in l or 'Error:' in l]
    for e in errs[:5]: log('  > '+e[:100])
    results['warnings'].append('build failed')

# Restart portal
log(chr(10)+'Restart portal...')
subprocess.run(['/usr/bin/pkill','-9','-f','next.*3001'],capture_output=True)
subprocess.run(['/usr/bin/fuser','-k','3001/tcp'],capture_output=True)
time.sleep(2)
if os.path.exists(PORTAL+'/.next/BUILD_ID'):
    cmd=[NODE,'node_modules/.bin/next','start','-p','3001']
    mode='PROD'
else:
    cmd=[NODE,'node_modules/.bin/next','dev','--turbo','-p','3001']
    mode='DEV'
proc=subprocess.Popen(cmd,cwd=PORTAL,
    stdout=open('/tmp/portal.log','w'),stderr=subprocess.STDOUT,env=env)
log('  Portal ['+mode+'] PID: '+str(proc.pid))
time.sleep(8)
try:
    urllib.request.urlopen('http://localhost:3001/dashboard',timeout=10)
    log('  OK Portal UP ['+mode+']')
    results['fixed'].append('portal UP: '+mode)
except Exception as e:
    log('  ERR Portal: '+str(e)[:60])

log('='*40)
log('Y1 COMPLETE')
for f in results['fixed']: log('  OK '+str(f))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/y1_result.json','w') as f:
    json.dump(results,f,indent=2)