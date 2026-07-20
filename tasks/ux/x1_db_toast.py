# X1 — Fix DB Inserts (UUID) + Wire Toast Notifications
import os, subprocess, json, datetime, glob, re

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/x1.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
PORTAL = ROOT + '/11-WORKSPACES/triangle-black/portal'
TB     = ROOT + '/11-WORKSPACES/triangle-black'
results = {'fixed':[], 'created':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

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

log('X1 START — Fix DB Inserts + Toast Notifications')

# Fix 1: Seed work orders with gen_random_uuid()
log('Fix 1: Seed work orders with UUID')
wo_data = [
    ('HVAC Chiller Unit 4B Not Cooling',     'hvac',       'high',     'open',        'Grand Cairo Hotel'),
    ('Lobby Elevator Door Adjustment',        'mechanical', 'medium',   'open',        'Grand Cairo Hotel'),
    ('Pool Circulation Pump Leak',            'plumbing',   'high',     'in_progress', 'Sharm Resort'),
    ('Ballroom Lighting Control Fault',       'electrical', 'medium',   'open',        'Hilton Alexandria'),
    ('Kitchen Exhaust Fan Replacement',       'mechanical', 'low',      'completed',   'Marriott Cairo'),
    ('AC Unit Room 412 Not Working',          'hvac',       'medium',   'open',        'Kempinski Soma Bay'),
    ('Fire Suppression Annual Inspection',    'civil',      'low',      'planning',    'Grand Cairo Hotel'),
    ('Swimming Pool Chemical Balance',        'cleaning',   'medium',   'in_progress', 'Four Seasons Nile'),
    ('Server Room UPS Battery Replace',       'it',         'critical', 'open',        'Semiramis'),
    ('Parking Gate Motor Failure',            'mechanical', 'high',     'open',        'Rotana Sharm'),
]
seeded = 0
for title, typ, pri, status, site in wo_data:
    q = ("INSERT INTO work_orders(id,title,type,priority,status,created_at,updated_at) "
         "VALUES(gen_random_uuid(),'"+title+"','"+typ+"','"+pri+"','"+status+"',NOW(),NOW()) "
         "ON CONFLICT DO NOTHING;")
    _, err = tb(q)
    if 'ERROR' not in (err or ''): seeded += 1
    else: log('  ERR: '+err[:80])
log('  Seeded: '+str(seeded)+'/10 work orders')
results['fixed'].append('work_orders seeded: '+str(seeded))

# Fix 2: Seed technicians with UUID
log(chr(10)+'Fix 2: Seed technicians')
out3, _ = tb('SELECT count(*) FROM technicians;')
tc = int(out3) if out3.isdigit() else 0
if tc < 7:
    techs = [
        ('Mohamed Ali','HVAC Specialist','+20-1001111111',True),
        ('Ahmed Hassan','Plumbing Engineer','+20-1002222222',True),
        ('Omar Ali','Mechanical Tech','+20-1003333333',True),
        ('Khaled Ibrahim','Electrical Engineer','+20-1004444444',True),
        ('Dina Samir','Civil Engineer','+20-1005555555',True),
        ('Tarek Gaber','IT Systems','+20-1006666666',True),
        ('Noha Farouk','General Maintenance','+20-1007777777',False),
    ]
    st = 0
    for name, spec, phone, active in techs:
        q = ("INSERT INTO technicians(id,name,specializations,phone,is_active,created_at,updated_at) "
             "VALUES(gen_random_uuid(),'"+name+"',ARRAY['"+spec+"'],'"+phone+"',"+str(active).lower()+",NOW(),NOW()) "
             "ON CONFLICT DO NOTHING;")
        _, e2 = tb(q)
        if 'ERROR' not in (e2 or ''): st += 1
    log('  Seeded: '+str(st)+' technicians')
    results['fixed'].append('technicians seeded: '+str(st))

# Fix 3: Wire Sonner toast to layout
log(chr(10)+'Fix 3: Wire toast notifications to portal layout')
layout_path = PORTAL + '/app/layout.tsx'
with open(layout_path) as f: layout = f.read()

if 'Toaster' not in layout:
    # Add Toaster import and component
    layout = layout.replace(
        "import type { Metadata } from",
        "import { Toaster } from 'sonner';" + chr(10) + "import type { Metadata } from"
    )
    # Add Toaster to body
    layout = layout.replace(
        "{children}",
        "{children}" + chr(10) + "        <Toaster richColors position=\"top-right\" />"
    )
    with open(layout_path,'w') as f: f.write(layout)
    log('  Toaster added to layout.tsx')
    results['fixed'].append('Toaster wired to layout')
else:
    log('  Toaster already in layout')

# Fix 4: Fix TB Admin auth endpoint (422 = wrong content type or fields)
log(chr(10)+'Fix 4: Fix TB Admin auth')
import urllib.request
# Try form-urlencoded format (OAuth2 style)
import urllib.parse
form_data = urllib.parse.urlencode({'username':'admin@triangleblack.com','password':'admin123'}).encode()
try:
    req = urllib.request.Request('http://localhost:8030/api/v1/auth/login',
        data=form_data,
        headers={'Content-Type':'application/x-www-form-urlencoded'},
        method='POST')
    with urllib.request.urlopen(req,timeout=5) as r:
        resp = json.loads(r.read())
        token = resp.get('access_token') or resp.get('token','')
        log('  Login OK! Token: '+token[:20]+'...')
        results['fixed'].append('auth login works: form-urlencoded')
except urllib.error.HTTPError as e:
    log('  form-urlencoded: '+str(e.code))
    # Try JSON
    try:
        jdata = json.dumps({'email':'admin@triangleblack.com','password':'admin123'}).encode()
        req2 = urllib.request.Request('http://localhost:8030/api/v1/auth/login',
            data=jdata, headers={'Content-Type':'application/json'}, method='POST')
        with urllib.request.urlopen(req2,timeout=5) as r2:
            resp2 = json.loads(r2.read())
            log('  JSON login OK: '+str(list(resp2.keys())))
            results['fixed'].append('auth works: JSON')
    except urllib.error.HTTPError as e2:
        log('  JSON: '+str(e2.code))
        # Show what TB Admin expects
        try:
            r3 = urllib.request.urlopen('http://localhost:8030/openapi.json',timeout=5)
            openapi = json.loads(r3.read())
            login_schema = openapi.get('paths',{}).get('/api/v1/auth/login',{})
            log('  Login schema: '+str(login_schema)[:200])
        except: pass
        results['warnings'].append('auth login still 422/404')
except Exception as e:
    log('  auth ERR: '+str(e)[:60])

# Final counts
log(chr(10)+'Final TB counts:')
for tbl in ['leads','work_orders','technicians','assets']:
    out,_ = tb('SELECT count(*) FROM '+tbl+';')
    log('  '+tbl+': '+(out or 'ERR'))

log('='*40)
log('X1 COMPLETE')
for f in results['fixed']: log('  OK '+str(f))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/x1_result.json','w') as f:
    json.dump(results,f,indent=2)