import os, subprocess, glob, re, datetime, json, urllib.request
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/u3.log'
ROOT   = '/home/amr/AI-COMPANY-OS'
TB     = ROOT + '/11-WORKSPACES/triangle-black'
results = {'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('U3 START — TB Admin Auth Fix + API Verify')

# Find all auth.py files
auth_files = glob.glob(TB + '/src/**/auth.py', recursive=True)
auth_files += glob.glob(TB + '/src/core/auth.py')
auth_files = list(set(auth_files))
log('Found auth files: ' + str(len(auth_files)))

for auth_file in auth_files:
    with open(auth_file) as f: content = f.read()
    log('  Checking: ' + auth_file.replace(ROOT+'/',''))

    # Find DEV BYPASS pattern
    if 'ENVIRONMENT' in content and ('development' in content or 'bypass' in content.lower()):
        log('  Found DEV BYPASS in: ' + os.path.basename(auth_file))
        # Show the relevant lines
        for i, line in enumerate(content.split(chr(10)), 1):
            if 'ENVIRONMENT' in line or 'bypass' in line.lower() or 'development' in line:
                log('  Line '+str(i)+': '+line.strip()[:80])
        results['warnings'].append('DEV BYPASS in: '+auth_file)
    else:
        log('  OK: no obvious bypass')

# Check TB Admin API routes
log(chr(10)+'Checking TB Admin API routes:')
routes_to_check = [
    ('/', 200),
    ('/docs', 200),
    ('/api/v1/leads', None),       # 200 or 401 both OK
    ('/api/v1/work-orders', None),
    ('/api/v1/technicians', None),
    ('/api/v1/assets', None),
]
for path, expected in routes_to_check:
    try:
        r = urllib.request.urlopen('http://localhost:8030'+path, timeout=5)
        log('  '+path+' → 200')
    except urllib.error.HTTPError as e:
        log('  '+path+' → '+str(e.code))
        if e.code == 401:
            log('    (401 = auth required, endpoint exists)')
        elif e.code == 404:
            results['warnings'].append('TB Admin 404: '+path)
    except Exception as e:
        log('  '+path+' → ERR: '+str(e)[:50])
        results['warnings'].append('TB Admin ERR: '+path)

# Find router files and list endpoints
log(chr(10)+'TB Admin router files:')
router_files = glob.glob(TB + '/src/**/router*.py', recursive=True)
router_files += glob.glob(TB + '/src/**/routes*.py', recursive=True)
router_files += glob.glob(TB + '/src/**/api.py', recursive=True)
for rf in router_files[:8]:
    with open(rf) as f: content = f.read()
    routes = re.findall(r'@router\.(get|post|put|delete)\(["\']([^\'"]+)', content)
    if routes:
        log('  '+rf.replace(ROOT+'/',''))
        for method, path in routes[:5]:
            log('    '+method.upper()+' '+path)

# Check TB Admin .env has correct DB URL
log(chr(10)+'Checking TB Admin .env:')
tb_env = TB + '/.env'
if os.path.exists(tb_env):
    with open(tb_env) as f: env_content = f.read()
    for line in env_content.split(chr(10)):
        if '=' in line and not line.startswith('#'):
            key = line.split('=')[0]
            log('  '+key+'=...')
            if 'DATABASE' in key and '5434' in line:
                log('  WARNING: Still has port 5434!')
                results['warnings'].append('DB still on 5434')

log('U3 COMPLETE')
log('  Warnings: '+str(len(results['warnings'])))
for w in results['warnings']: log('  WRN '+w)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/u3_result.json','w') as f:
    json.dump(results,f,indent=2)