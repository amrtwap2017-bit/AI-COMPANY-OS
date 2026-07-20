# E2 — Fix Work Orders Schema + Seed Real Data
import os, subprocess, json, datetime

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/e2.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'fixed':[], 'warnings':[]}

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

log('E2 START — Fix Work Orders Schema + Seed Data')

# Step 1: Inspect actual work_orders table schema
log('Step 1: Inspect work_orders table schema')
out, err = tb("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='work_orders' ORDER BY ordinal_position;")
if err and 'ERROR' in err:
    log('  ERROR: '+err[:80])
    results['warnings'].append('work_orders table error: '+err[:50])
else:
    log('  work_orders columns:')
    cols = {}
    for line in out.split(chr(10)):
        if '|' in line:
            col, dtype = line.split('|')
            cols[col.strip()] = dtype.strip()
            log('    '+col.strip()+': '+dtype.strip())
    results['fixed'].append('schema inspected')

    # Step 2: Seed with correct column names
    log(chr(10)+'Step 2: Seed work orders with correct schema')
    # Build dynamic insert based on available columns
    required = {'title','priority','status'} 
    available = set(cols.keys())
    log('  Available columns: '+str(sorted(available)))

    if 'title' not in available:
        log('  WARNING: title column missing from work_orders!')
        results['warnings'].append('work_orders missing title column')
    else:
        # Build insert with only columns that exist
        wo_data = [
            ('HVAC Chiller Unit 4B Not Cooling', 'hvac', 'high', 'open'),
            ('Main Lobby Elevator Door Adjustment', 'mechanical', 'medium', 'open'),
            ('Pool Circulation Pump Leak', 'plumbing', 'high', 'in_progress'),
            ('Ballroom Lighting Control Panel', 'electrical', 'medium', 'open'),
            ('Kitchen Exhaust Fan Replacement', 'mechanical', 'low', 'completed'),
            ('AC Split Unit Room 412', 'hvac', 'medium', 'open'),
            ('Fire Suppression Inspection', 'civil', 'low', 'planning'),
            ('Swimming Pool Chemical Balance', 'cleaning', 'medium', 'in_progress'),
            ('Server Room UPS Battery', 'it', 'critical', 'open'),
            ('Parking Lot Gate Motor Failure', 'mechanical', 'high', 'open'),
        ]
        seeded = 0
        for title, cat, pri, status in wo_data:
            # Build column list based on what exists
            col_map = {
                'title': "'"+title+"'",
                'priority': "'"+pri+"'",
                'status': "'"+status+"'",
                'created_at': 'NOW()',
                'updated_at': 'NOW()',
            }
            # Add optional columns if they exist
            if 'category' in available: col_map['category'] = "'"+cat+"'"
            if 'type' in available: col_map['type'] = "'"+cat+"'"
            if 'description' in available: col_map['description'] = "'Auto-seeded test work order'"

            cols_str = ', '.join(col_map.keys())
            vals_str = ', '.join(col_map.values())
            q = 'INSERT INTO work_orders ('+cols_str+') VALUES ('+vals_str+') ON CONFLICT DO NOTHING;'
            _, err2 = tb(q)
            if 'ERROR' not in (err2 or ''):
                seeded += 1
            else:
                log('  WO insert error: '+err2[:60])
                break  # Schema issue - show first error

        log('  Seeded: '+str(seeded)+'/10 work orders')
        results['fixed'].append('work_orders seeded: '+str(seeded))

# Step 3: Inspect technicians schema + seed
log(chr(10)+'Step 3: Inspect technicians schema')
out2, err2 = tb("SELECT column_name FROM information_schema.columns WHERE table_name='technicians' ORDER BY ordinal_position;")
tech_cols = [l.strip() for l in out2.split(chr(10)) if l.strip()]
log('  technicians columns: '+str(tech_cols))

out3, _ = tb('SELECT count(*) FROM technicians;')
tech_count = int(out3) if out3.isdigit() else 0
log('  Current technicians: '+str(tech_count))

if tech_count < 7:
    techs = [
        ('Mohamed Ali','HVAC Specialist','+20-1001111111',True,'Cairo'),
        ('Ahmed Hassan','Plumbing Engineer','+20-1002222222',True,'Cairo'),
        ('Omar Ali','Mechanical Tech','+20-1003333333',True,'Alexandria'),
        ('Khaled Ibrahim','Electrical Engineer','+20-1004444444',True,'Sharm'),
        ('Dina Samir','Civil Engineer','+20-1005555555',True,'Hurghada'),
        ('Tarek Gaber','IT Systems','+20-1006666666',True,'Cairo'),
    ]
    seeded_t = 0
    for name, role, phone, active, region in techs:
        col_map = {
            'created_at': 'NOW()',
            'updated_at': 'NOW()',
        }
        if 'name' in tech_cols: col_map['name'] = "'"+name+"'"
        if 'role' in tech_cols: col_map['role'] = "'"+role+"'"
        if 'phone' in tech_cols: col_map['phone'] = "'"+phone+"'"
        if 'is_active' in tech_cols: col_map['is_active'] = str(active).lower()
        if 'region' in tech_cols: col_map['region'] = "'"+region+"'"
        if 'specialization' in tech_cols: col_map['specialization'] = "'"+role+"'"
        cols_s = ', '.join(col_map.keys())
        vals_s = ', '.join(col_map.values())
        q = 'INSERT INTO technicians ('+cols_s+') VALUES ('+vals_s+') ON CONFLICT DO NOTHING;'
        _, te = tb(q)
        if 'ERROR' not in (te or ''): seeded_t += 1
    log('  Seeded: '+str(seeded_t)+' technicians')
    results['fixed'].append('technicians seeded: '+str(seeded_t))

# Final counts
log(chr(10)+'Final counts:')
for tbl in ['leads','work_orders','technicians','assets']:
    out4, _ = tb('SELECT count(*) FROM '+tbl+';')
    log('  '+tbl+': '+(out4 or 'ERR'))

log('='*40)
log('E2 COMPLETE')
for f in results['fixed']: log('  OK '+str(f))
with open('/home/amr/AI-COMPANY-OS/tasks/logs/e2_result.json','w') as f:
    json.dump(results,f,indent=2)