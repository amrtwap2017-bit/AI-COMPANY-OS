import os, datetime, json, subprocess, urllib.request

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/task_03.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'fixed': [], 'warnings': [], 'data': {}}

def log(msg):
    ts  = datetime.datetime.now().strftime('%H:%M:%S')
    out = '[' + ts + '] ' + str(msg)
    print(out, flush=True)
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    open(LOG, 'a').write(out + chr(10))

def psql(q, db='ai_company_os'):
    env = {**os.environ, 'PGPASSWORD': 'postgres'}
    r = subprocess.run(
        ['psql','-U','postgres','-d',db,'-h','localhost',
         '-P','pager=off','-t','-A','-c',q],
        capture_output=True, text=True, env=env, timeout=15)
    return r.stdout.strip(), r.stderr.strip()

def psql_tb(q):
    return psql(q, db='triangle_black')

log('TASK 03 START — Data Health and Seeding')

# Check 1: Main DB
log('Check 1: Main DB connectivity')
out, err = psql('SELECT count(*) FROM tasks;')
if 'ERROR' in (err or ''):
    log('  ERR: ' + err[:80])
    results['warnings'].append('Main DB not reachable')
else:
    log('  OK tasks: ' + out)
    results['data']['tasks'] = out

# Fix 1: Normalize statuses
log('Fix 1: Normalize task statuses')
for q, label in [
    ("UPDATE tasks SET status='completed'  WHERE status='done'",        'done->completed'),
    ("UPDATE tasks SET status='in_progress' WHERE status='executing'",   'executing->in_progress'),
    ("UPDATE tasks SET status='pending'    WHERE status='paused'",       'paused->pending'),
]:
    out, err = psql(q)
    if 'ERROR' in (err or ''):
        log('  WARN ' + label + ': ' + err[:50])
    else:
        log('  OK ' + label)
        results['fixed'].append(label)

# Check 2: Task breakdown
log('Check 2: Task breakdown')
out, err = psql('SELECT status, count(*) FROM tasks GROUP BY status ORDER BY 2 DESC;')
for line in (out or '').split(chr(10)):
    if line.strip(): log('  ' + line)
results['data']['breakdown'] = out

# Check 3: Counts
log('Check 3: DB table counts')
for tbl in ['agents','memories','reflections']:
    out, err = psql('SELECT count(*) FROM ' + tbl + ';')
    if not err or 'ERROR' not in err:
        log('  ' + tbl + ': ' + out)
        results['data'][tbl] = out
    else:
        log('  SKIP ' + tbl)

# Check 4: Triangle Black DB
log('Check 4: Triangle Black DB')
out, err = psql("SELECT datname FROM pg_database WHERE datname='triangle_black';", db='postgres')
if 'triangle_black' not in (out or ''):
    log('  WARN triangle_black DB not found')
    results['warnings'].append('triangle_black DB not found')
else:
    log('  OK triangle_black found')
    out2, err2 = psql_tb('SELECT count(*) FROM leads;')
    if 'ERROR' in (err2 or ''):
        log('  WARN leads table: ' + err2[:60])
    else:
        n = int(out2) if (out2 or '0').isdigit() else 0
        log('  leads: ' + str(n))
        results['data']['leads'] = n
        if n < 10:
            log('  Seeding 10 Egyptian hotel leads...')
            leads = [
                ('Marriott Cairo',            'Ahmed Hassan',   'ahmed@marriott.eg',      '+20-1001234567', 'qualified',   'referral',   '500 rooms HVAC overhaul'),
                ('Hilton Alexandria',          'Sara Mohamed',   'sara@hilton-alex.eg',    '+20-1009876543', 'new',         'website',    'Preventive maintenance interest'),
                ('Four Seasons Nile',          'Khaled Ibrahim', 'khaled@fs-nile.eg',      '+20-1005555555', 'negotiation', 'cold_call',  'Ready to sign 2yr contract'),
                ('Kempinski Soma Bay',         'Noha Farouk',    'noha@kempinski.eg',      '+20-1007777777', 'qualified',   'exhibition', '300 rooms full package'),
                ('Sheraton Luxor',             'Omar Ali',       'omar@sheraton-luxor.eg', '+20-1003333333', 'new',         'referral',   'Historical hotel maintenance'),
                ('Rotana Sharm',               'Dina Samir',     'dina@rotana-sharm.eg',   '+20-1002222222', 'qualified',   'website',    '450 rooms pool HVAC'),
                ('InterContinental Semiramis', 'Tarek Gaber',    'tarek@ihg-semi.eg',      '+20-1004444444', 'new',         'cold_call',  '750 rooms flagship Cairo'),
                ('Steigenberger Aqua Magic',   'Rania Youssef',  'rania@steig.eg',         '+20-1006666666', 'negotiation', 'referral',   'Hurghada urgent HVAC'),
                ('Movenpick Aswan',            'Hossam Kamal',   'hossam@movenpick.eg',    '+20-1008888888', 'qualified',   'exhibition', 'Nile cruise engineering'),
                ('Le Meridien Airport',        'Amira Nasser',   'amira@lm-airport.eg',    '+20-1000000001', 'new',         'website',    'Airport hotel 24/7 support'),
            ]
            seeded = 0
            for co, cn, em, ph, st, so, no in leads:
                q = ("INSERT INTO leads(company_name,contact_name,email,phone,status,source,notes,created_at,updated_at) "
                     "VALUES('" + co + "','" + cn + "','" + em + "','" + ph + "','"
                     + st + "','" + so + "','" + no + "',NOW(),NOW()) ON CONFLICT DO NOTHING;")
                o3, e3 = psql_tb(q)
                if 'ERROR' not in (e3 or ''):
                    seeded += 1
            log('  OK seeded: ' + str(seeded))
            results['fixed'].append('seeded ' + str(seeded) + ' leads')
            out4, _ = psql_tb('SELECT count(*) FROM leads;')
            log('  leads now: ' + out4)
        else:
            log('  SKIP already ' + str(n) + ' leads')

# Check 5: Qdrant
log('Check 5: Qdrant')
try:
    with urllib.request.urlopen('http://localhost:6333/collections', timeout=5) as r:
        data = json.loads(r.read())
        cols = [c['name'] for c in data.get('result',{}).get('collections',[])]
        log('  OK ' + str(len(cols)) + ' collections: ' + str(cols))
        results['data']['qdrant'] = cols
except Exception as e:
    log('  WARN Qdrant: ' + str(e))
    results['warnings'].append('Qdrant: ' + str(e))

# Check 6: Redis
log('Check 6: Redis')
r = subprocess.run(['docker','exec','ai-redis','redis-cli','ping'],
    capture_output=True, text=True, timeout=5)
if 'PONG' in r.stdout:
    log('  OK Redis: PONG')
    results['data']['redis'] = 'healthy'
else:
    log('  WARN Redis not responding')
    results['warnings'].append('Redis')

# Check 7: Docker
log('Check 7: Docker containers')
r = subprocess.run(['docker','ps','--format','{{.Names}}:{{.Status}}'],
    capture_output=True, text=True, timeout=5)
for line in r.stdout.strip().split(chr(10)):
    if line.strip(): log('  ' + line)

# Summary
log('=' * 40)
log('TASK 03 COMPLETE')
log('  Fixed:    ' + str(len(results['fixed'])))
log('  Warnings: ' + str(len(results['warnings'])))
for f in results['fixed']:    log('  OK   ' + f)
for w in results['warnings']: log('  WARN ' + w)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/task_03_result.json','w') as fp:
    json.dump(results, fp, indent=2)
log('Saved: task_03_result.json')
