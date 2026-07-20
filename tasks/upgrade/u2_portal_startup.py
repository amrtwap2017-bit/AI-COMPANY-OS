import os, subprocess, time, urllib.request, datetime
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/u2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
HUB    = '/home/amr/AI-COMPANY-OS/hub/dashboard'
NODE   = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
ROOT   = '/home/amr/AI-COMPANY-OS'
results = {'fixed':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def check(url, name):
    try:
        urllib.request.urlopen(url, timeout=8)
        log('  OK '+name)
        return True
    except Exception as e:
        log('  ERR '+name+': '+str(e)[:60])
        return False

def start_next(cwd, port, name):
    env = {**os.environ,
        'PATH': os.path.dirname(NODE)+':'+os.environ.get('PATH',''),
        'NEXT_TELEMETRY_DISABLED': '1',
        'NODE_ENV': 'production'}
    subprocess.run(['/usr/bin/fuser','-k',str(port)+'/tcp'], capture_output=True)
    time.sleep(1)
    build_id = cwd + '/.next/BUILD_ID'
    if os.path.exists(build_id):
        cmd = [NODE,'node_modules/.bin/next','start','-p',str(port)]
        mode = 'PROD'
    else:
        cmd = [NODE,'node_modules/.bin/next','dev','--turbo','-p',str(port)]
        mode = 'DEV'
    log_file = '/tmp/'+name.lower()+'.log'
    proc = subprocess.Popen(cmd, cwd=cwd,
        stdout=open(log_file,'w'), stderr=subprocess.STDOUT, env=env)
    log('  '+name+' ['+mode+'] PID: '+str(proc.pid))
    time.sleep(8)
    return proc, mode

log('U2 START — Portal Startup Reliability')

# Kill all next processes
subprocess.run(['/usr/bin/pkill','-9','-f','next'], capture_output=True)
time.sleep(3)

# Check builds exist
for name, path in [('Hub', HUB), ('Portal', PORTAL)]:
    bid = path + '/.next/BUILD_ID'
    if os.path.exists(bid):
        log('  '+name+' build exists: OK')
    else:
        log('  '+name+' build MISSING — building...')
        env = {**os.environ,
            'PATH': os.path.dirname(NODE)+':'+os.environ.get('PATH',''),
            'NEXT_TELEMETRY_DISABLED':'1','NODE_ENV':'production'}
        r = subprocess.run(
            [NODE,'node_modules/.bin/next','build'],
            cwd=path, capture_output=True, text=True, timeout=300, env=env)
        if r.returncode == 0:
            log('  '+name+' build SUCCESS')
            results['fixed'].append(name+' built')
        else:
            log('  '+name+' build FAILED')
            for l in (r.stdout+r.stderr).split(chr(10))[-10:]:
                if l.strip(): log('  > '+l[:100])
            results['warnings'].append(name+' build failed')

# Start Hub
proc_hub, mode_hub = start_next(HUB, 3000, 'Hub')
if check('http://localhost:3000', 'Hub :3000'):
    results['fixed'].append('Hub running '+mode_hub)

# Start Portal
proc_portal, mode_portal = start_next(PORTAL, 3001, 'Portal')
if check('http://localhost:3001/dashboard', 'Portal :3001/dashboard'):
    results['fixed'].append('Portal running '+mode_portal)

# Update START-SAFE.sh to add build check
safe_sh = ROOT + '/START-SAFE.sh'
with open(safe_sh) as f: safe = f.read()
if 'BUILD_ID' not in safe:
    # Add build check before start
    old = '# ── Step 6: Hub Dashboard ──'
    new = '''# ── Step 5b: Ensure builds exist ──
echo "=== Checking builds ==="
for dir_port in "$HUB_DIR:3000" "$PORTAL_DIR:3001"; do
  dir=$(echo $dir_port | cut -d: -f1)
  port=$(echo $dir_port | cut -d: -f2)
  if [ ! -f "$dir/.next/BUILD_ID" ]; then
    echo "  Building $dir..."
    cd "$dir" && node node_modules/.bin/next build 2>&1 | tail -3
  fi
done

# ── Step 6: Hub Dashboard ──'''
    if old in safe:
        safe = safe.replace(old, new)
        with open(safe_sh,'w') as f: f.write(safe)
        log('  START-SAFE.sh updated with build check')
        results['fixed'].append('START-SAFE.sh updated')

log('U2 COMPLETE — Fixed: '+str(len(results['fixed'])))
log('  Hub: '+mode_hub+' | Portal: '+mode_portal)
import json
with open('/home/amr/AI-COMPANY-OS/tasks/logs/u2_result.json','w') as f:
    json.dump(results,f,indent=2)