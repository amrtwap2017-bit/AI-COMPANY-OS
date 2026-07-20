import os, subprocess, datetime, json, re

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/task_10.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'fixed': [], 'warnings': []}

def log(msg):
    ts = datetime.datetime.now().strftime('%H:%M:%S')
    out = '[' + ts + '] ' + str(msg)
    print(out, flush=True)
    open(LOG, 'a').write(out + chr(10))

log('TASK 10 START — Apply PostgreSQL Password + Restart')

# Read generated password
secrets_file = os.path.expanduser('~/.ai-company-os-secrets')
if not os.path.exists(secrets_file):
    log('  ERR secrets file not found: ' + secrets_file)
    log('  Run task_07 first')
    exit(1)

with open(secrets_file) as f: secrets = f.read()
new_pg_pass = ''
for line in secrets.split(chr(10)):
    if line.startswith('NEW_POSTGRES_PASSWORD='):
        new_pg_pass = line.split('=', 1)[1].strip()
        break

if not new_pg_pass:
    log('  ERR could not read password from secrets file')
    exit(1)

log('  New password found: ' + new_pg_pass[:4] + '****')

# Step 1: Change PostgreSQL password in Docker
log('Step 1: Change PostgreSQL password')
r = subprocess.run(
    ['docker', 'exec', '-i', 'ai-postgres',
     'psql', '-U', 'postgres', '-c',
     "ALTER USER postgres PASSWORD '" + new_pg_pass + "';"],
    capture_output=True, text=True, timeout=15
)
if r.returncode == 0 or 'ALTER ROLE' in r.stdout:
    log('  OK PostgreSQL password changed')
    results['fixed'].append('PostgreSQL password changed')
else:
    log('  ERR: ' + r.stderr[:100])
    log('  WARN: continuing with env file updates anyway')
    results['warnings'].append('PG password change: ' + r.stderr[:50])

# Step 2: Update all DATABASE_URL in .env files
log('Step 2: Update DATABASE_URL in all .env files')
env_files = []
for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in ['.venv','node_modules','.git','90-ARCHIVE']]
    for fname in files:
        if fname.startswith('.env') and 'example' not in fname and 'bak' not in fname:
            env_files.append(os.path.join(dirpath, fname))

updated = 0
for env_path in env_files:
    try:
        with open(env_path) as f: content = f.read()
        original = content
        # Replace postgres password in URLs
        content = re.sub(
            r'(postgresql[^:]*://[^:]+:)postgres(@)',
            r'\1' + new_pg_pass + r'\2',
            content
        )
        content = re.sub(
            r'POSTGRES_PASSWORD=postgres$',
            'POSTGRES_PASSWORD=' + new_pg_pass,
            content, flags=re.MULTILINE
        )
        if content != original:
            import shutil
            shutil.copy2(env_path, env_path + '.bak')
            with open(env_path, 'w') as f: f.write(content)
            rel = env_path.replace(ROOT + '/', '')
            log('  OK updated: ' + rel)
            results['fixed'].append('env updated: ' + rel)
            updated += 1
    except Exception as e:
        log('  SKIP ' + env_path + ': ' + str(e))

log('  Updated ' + str(updated) + ' .env files')

# Step 3: Test DB connection with new password
log('Step 3: Test DB connection with new password')
import time
time.sleep(2)
env = {**os.environ, 'PGPASSWORD': new_pg_pass}
r = subprocess.run(
    ['psql', '-U', 'postgres', '-d', 'ai_company_os',
     '-h', 'localhost', '-t', '-A', '-c', 'SELECT count(*) FROM tasks;'],
    capture_output=True, text=True, env=env, timeout=10
)
if r.returncode == 0:
    log('  OK DB works with new password — tasks: ' + r.stdout.strip())
    results['fixed'].append('DB connection verified with new password')
else:
    log('  ERR DB connection failed: ' + r.stderr[:80])
    log('  WARN services may need restart to pick up new env')
    results['warnings'].append('DB connection with new pass failed')

# Step 4: Restart AI Engine with new password
log('Step 4: Restart AI Engine with new config')
subprocess.run(['pkill', '-f', '07-AI-ENGINE'], capture_output=True)
subprocess.run(['fuser', '-k', '8001/tcp'], capture_output=True)
time.sleep(3)

eng_env = {**os.environ,
           'PGPASSWORD': new_pg_pass,
           'PATH': os.environ.get('PATH', '')}
eng_proc = subprocess.Popen(
    [ROOT + '/07-AI-ENGINE/.venv/bin/python3',
     '-m', 'uvicorn', 'main:app',
     '--host', '0.0.0.0', '--port', '8001',
     '--workers', '1', '--log-level', 'warning'],
    cwd=ROOT + '/07-AI-ENGINE',
    stdout=open('/tmp/ai-engine.log', 'w'),
    stderr=subprocess.STDOUT, env=eng_env
)
log('  Engine PID: ' + str(eng_proc.pid))
time.sleep(10)

# Step 5: Verify engine alive
import urllib.request as ur
try:
    ur.urlopen('http://localhost:8001/api/v1/ai/health', timeout=8)
    log('  OK Engine UP with new password')
    results['fixed'].append('engine restarted')
except Exception as e:
    log('  ERR Engine: ' + str(e))
    results['warnings'].append('engine not responding after restart')

# Step 6: Restart TB Admin
log('Step 5: Restart TB Admin')
subprocess.run(['pkill', '-f', 'triangle-black.*uvicorn'], capture_output=True)
subprocess.run(['fuser', '-k', '8030/tcp'], capture_output=True)
time.sleep(2)

tb_proc = subprocess.Popen(
    [ROOT + '/11-WORKSPACES/triangle-black/.venv/bin/python3',
     '-m', 'uvicorn', 'src.main:app',
     '--host', '0.0.0.0', '--port', '8030',
     '--workers', '1', '--log-level', 'warning'],
    cwd=ROOT + '/11-WORKSPACES/triangle-black',
    stdout=open('/tmp/tb-admin.log', 'w'),
    stderr=subprocess.STDOUT
)
log('  TB Admin PID: ' + str(tb_proc.pid))
time.sleep(8)

try:
    ur.urlopen('http://localhost:8030/docs', timeout=8)
    log('  OK TB Admin UP')
    results['fixed'].append('TB Admin restarted')
except Exception as e:
    log('  WARN TB Admin: ' + str(e))

log('=' * 40)
log('TASK 10 COMPLETE')
log('  Fixed: ' + str(len(results['fixed'])))
log('  Warnings: ' + str(len(results['warnings'])))
for f in results['fixed']: log('  OK ' + str(f))
for w in results['warnings']: log('  WARN ' + str(w))
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/task_10_result.json','w') as f:
    _j.dump(results, f, indent=2)