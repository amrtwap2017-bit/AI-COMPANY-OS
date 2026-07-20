# R4 — Data Quality: Seed Meaningful Test Data
import os, subprocess, datetime, json, urllib.request

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/r4.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'seeded':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

secrets_file=os.path.expanduser('~/.ai-company-os-secrets')
pg_pass='postgres'
if os.path.exists(secrets_file):
    for line in open(secrets_file):
        if line.startswith('NEW_POSTGRES_PASSWORD='):
            pg_pass=line.split('=',1)[1].strip()

def psql(q, db='ai_company_os'):
    env={**os.environ,'PGPASSWORD':pg_pass}
    r=subprocess.run(['psql','-U','postgres','-d',db,'-h','localhost',
        '-P','pager=off','-t','-A','-c',q],
        capture_output=True,text=True,env=env,timeout=10)
    return r.stdout.strip(), r.stderr.strip()

def psql_tb(q): return psql(q, db='triangle_black')

log('R4 START — Data Quality Seeding')

# Check current data
out,_ = psql_tb('SELECT count(*) FROM leads;')
log('Current TB leads: '+out)
out2,_ = psql_tb('SELECT count(*) FROM work_orders;')
log('Current TB work_orders: '+out2)
out3,_ = psql_tb('SELECT count(*) FROM technicians;')
log('Current TB technicians: '+out3)

# Seed work orders if less than 10
wo_count = int(out2) if out2.isdigit() else 0
if wo_count < 10:
    log(chr(10)+'Seeding work orders...')
    wos = [
        ('HVAC Chiller Unit 4B Not Cooling','hvac','high','open','Grand Cairo Hotel - Tower B','Mohamed Ali'),
        ('Main Lobby Elevator Door Adjustment','mechanical','medium','open','Grand Cairo Hotel','Unassigned'),
        ('Pool Circulation Pump Leak','plumbing','high','in_progress','Sharm Resort','Ahmed Hassan'),
        ('Ballroom Lighting Control Panel Fault','electrical','medium','open','Hilton Alexandria','Unassigned'),
        ('Kitchen Exhaust Fan Replacement','mechanical','low','completed','Marriott Cairo','Omar Ali'),
        ('AC Split Unit Room 412 Not Working','hvac','medium','open','Kempinski Soma Bay','Khaled Ibrahim'),
        ('Fire Suppression System Annual Inspection','civil','low','planning','Grand Cairo Hotel','Unassigned'),
        ('Swimming Pool Chemical Balance Issue','cleaning','medium','in_progress','Four Seasons Nile','Dina Samir'),
        ('Server Room UPS Battery Replacement','it','critical','open','InterContinental Semiramis','Tarek Gaber'),
        ('Parking Lot Gate Motor Failure','mechanical','high','open','Rotana Sharm','Unassigned'),
    ]
    seeded = 0
    for title, cat, pri, status, site, tech in wos:
        q = ("INSERT INTO work_orders(title,category,priority,status,site,assigned_to,created_at,updated_at) "
             "VALUES('"+title+"','"+cat+"','"+pri+"','"+status+"','"+site+"','"+tech+"',NOW(),NOW()) "
             "ON CONFLICT DO NOTHING;")
        _, err = psql_tb(q)
        if 'ERROR' not in (err or ''): seeded += 1
    log('  Seeded '+str(seeded)+' work orders')
    results['seeded'].append('work_orders: '+str(seeded))
else:
    log('  SKIP: already '+str(wo_count)+' work orders')

# Seed technicians if less than 5
tech_count = int(out3) if out3.isdigit() else 0
if tech_count < 5:
    log(chr(10)+'Seeding technicians...')
    techs = [
        ('Mohamed Ali','HVAC Specialist','+20-1001111111',True,'Cairo'),
        ('Ahmed Hassan','Plumbing Engineer','+20-1002222222',True,'Cairo'),
        ('Omar Ali','Mechanical Technician','+20-1003333333',True,'Alexandria'),
        ('Khaled Ibrahim','Electrical Engineer','+20-1004444444',True,'Sharm'),
        ('Dina Samir','Civil Engineer','+20-1005555555',True,'Hurghada'),
        ('Tarek Gaber','IT Systems','+20-1006666666',True,'Cairo'),
        ('Noha Farouk','General Maintenance','+20-1007777777',False,'Cairo'),
    ]
    seeded = 0
    for name, role, phone, active, region in techs:
        q = ("INSERT INTO technicians(name,role,phone,is_active,region,created_at,updated_at) "
             "VALUES('"+name+"','"+role+"','"+phone+"','"+str(active).lower()+"','"+region+"',NOW(),NOW()) "
             "ON CONFLICT DO NOTHING;")
        _, err = psql_tb(q)
        if 'ERROR' not in (err or ''): seeded += 1
    log('  Seeded '+str(seeded)+' technicians')
    results['seeded'].append('technicians: '+str(seeded))
else:
    log('  SKIP: already '+str(tech_count)+' technicians')

# Normalize task statuses in main DB
log(chr(10)+'Normalizing main DB task statuses...')
for q, label in [
    ("UPDATE tasks SET status='completed' WHERE status='done'", 'done->completed'),
    ("UPDATE tasks SET status='in_progress' WHERE status='executing'", 'executing->in_progress'),
]:
    out, err = psql(q)
    if 'ERROR' not in (err or ''): log('  OK '+label)

# Final counts
log(chr(10)+'Final DB counts:')
for tbl, db in [('leads','triangle_black'),('work_orders','triangle_black'),
                ('technicians','triangle_black'),('tasks','ai_company_os'),
                ('agents','ai_company_os'),('memories','ai_company_os')]:
    out,_ = psql('SELECT count(*) FROM '+tbl+';', db=db)
    log('  '+tbl+': '+(out or 'ERR'))

log('='*40)
log('R4 COMPLETE')
for s in results['seeded']: log('  OK '+s)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/r4_result.json','w') as f:
    json.dump(results,f,indent=2)