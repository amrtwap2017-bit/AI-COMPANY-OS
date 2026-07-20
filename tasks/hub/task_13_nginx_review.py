import os, subprocess, datetime, json, urllib.request, ssl, glob

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/task_13.log'
ROOT = '/home/amr/AI-COMPANY-OS'
OLLAMA = 'http://localhost:11434/api/generate'
MODEL  = 'qwen2.5-coder:7b'
results = {'healthy':[], 'fixed':[], 'warnings':[], 'review': {}}

def log(msg):
    ts = datetime.datetime.now().strftime('%H:%M:%S')
    out = '[' + ts + '] ' + str(msg)
    print(out, flush=True)
    open(LOG, 'a').write(out + chr(10))

def check_url(url, name, verify_ssl=False):
    try:
        if not verify_ssl:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            urllib.request.urlopen(url, timeout=8, context=ctx)
        else:
            urllib.request.urlopen(url, timeout=8)
        log('  OK ' + name)
        results['healthy'].append(name)
        return True
    except Exception as e:
        log('  ERR ' + name + ': ' + str(e)[:60])
        results['warnings'].append(name)
        return False

def ask_ai(prompt, timeout=120):
    data = json.dumps({
        'model': MODEL, 'prompt': prompt, 'stream': False,
        'keep_alive': '15m',
        'options': {'num_predict': 1000, 'temperature': 0.3},
    }).encode()
    req = urllib.request.Request(
        OLLAMA, data=data,
        headers={'Content-Type': 'application/json'}, method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read()).get('response', '')
    except Exception as e:
        return 'Error: ' + str(e)

log('TASK 13 START — Fix Nginx SSL + Full Project Review')

# ── Fix 1: Nginx SSL verify issue ────────────────────
log('Fix 1: Nginx HTTPS SSL check')
# The issue is Python rejects self-signed cert
# Fix: update task_11 to skip SSL verify for self-signed
# Also verify Nginx is actually running
r = subprocess.run(['nginx', '-t'], capture_output=True, text=True)
if r.returncode == 0:
    log('  OK Nginx config valid')
    results['healthy'].append('nginx config')
else:
    log('  ERR Nginx: ' + r.stderr[:80])

# Check Nginx port 443 with SSL bypass
check_url('https://localhost/nginx-health', 'Nginx HTTPS (self-signed)', verify_ssl=False)
check_url('https://localhost', 'Nginx Hub HTTPS', verify_ssl=False)

# Fix task_11 to use SSL bypass
task11 = ROOT + '/tasks/hub/task_11_final_verify.py'
with open(task11) as f: content = f.read()
if 'check_hostname' not in content:
    old = "import os, subprocess, datetime, json, urllib.request"
    new = "import os, subprocess, datetime, json, urllib.request, ssl"
    content = content.replace(old, new)
    old2 = "    try:" + chr(10) + "        urllib.request.urlopen(url, timeout=8)"
    new2 = ("    try:" + chr(10) +
            "        ctx = ssl.create_default_context()" + chr(10) +
            "        ctx.check_hostname = False" + chr(10) +
            "        ctx.verify_mode = ssl.CERT_NONE" + chr(10) +
            "        urllib.request.urlopen(url, timeout=8, context=ctx if url.startswith('https') else None)")
    content = content.replace(old2, new2)
    with open(task11, 'w') as f: f.write(content)
    log('  OK task_11 updated with SSL bypass')
    results['fixed'].append('task_11 SSL bypass')

# ── Full Service Check ────────────────────────────────
log(chr(10) + 'Full service health check')
services = [
    ('http://localhost:8001/api/v1/ai/health', 'Engine :8001', False),
    ('http://localhost:8030/docs',              'TBAdmin :8030', False),
    ('http://localhost:3000',                   'Hub :3000', False),
    ('http://localhost:3001/dashboard',          'Portal :3001', False),
    ('https://localhost/nginx-health',           'Nginx HTTPS :443', False),
    ('http://localhost:6333/collections',        'Qdrant :6333', False),
    ('http://localhost:11434/api/tags',          'Ollama :11434', False),
    ('http://localhost:3400',                    'OpenWebUI :3400', False),
]
for url, name, ssl_verify in services:
    check_url(url, name, verify_ssl=ssl_verify)

# ── Project Review with qwen2.5-coder:7b ─────────────
log(chr(10) + 'AI Project Review with qwen2.5-coder:7b...')

# Collect stats
portal  = ROOT + '/11-WORKSPACES/triangle-black/portal'
hub     = ROOT + '/hub/dashboard'
engine  = ROOT + '/07-AI-ENGINE'
pages   = len(glob.glob(portal + '/app/**/page.tsx', recursive=True))
comps   = len(glob.glob(portal + '/components/**/*.tsx', recursive=True))
py_files = len(glob.glob(engine + '/**/*.py', recursive=True))
hub_pages = len(glob.glob(hub + '/app/**/page.tsx', recursive=True))

review_prompt = (
    'You are a senior software architect reviewing the AI Company OS project.' + chr(10) +
    'Project: Triangle Black hotel engineering SaaS + AI Company OS platform.' + chr(10) +
    'Tech: FastAPI + Next.js 16 + PostgreSQL + Qdrant + Ollama + Nginx.' + chr(10) +
    'Stats: Portal=' + str(pages) + ' pages, ' + str(comps) + ' components. ' +
    'Hub=' + str(hub_pages) + ' pages. Engine=' + str(py_files) + ' Python files.' + chr(10) +
    'Completed today: 11 upgrade tasks (TypeScript fixes, security hardening, ' +
    'PostgreSQL password rotation, CEO daily digest, prod builds, Nginx HTTPS).' + chr(10) +
    'Remaining issues: Portal still in dev mode (TS build errors), ' +
    'sudo password unknown (limits Nginx management).' + chr(10) + chr(10) +
    'Give a structured review:' + chr(10) +
    '1. What is fully working well (top 5)' + chr(10) +
    '2. What still needs fixing (ranked by priority)' + chr(10) +
    '3. What should be built next (top 5 features)' + chr(10) +
    '4. Architecture health score /10 with reasoning' + chr(10) +
    '5. One key recommendation for this week' + chr(10) +
    'Be concise and specific.'
)

log('  Asking qwen2.5-coder:7b for review...')
review = ask_ai(review_prompt)
log('  Review: ' + str(len(review.split())) + ' words')
results['review']['ai_review'] = review

# ── Save Review Report ───────────────────────────────
os.makedirs(ROOT + '/reports', exist_ok=True)
today = datetime.date.today().strftime('%Y-%m-%d')
report_path = ROOT + '/reports/project-review-' + today + '.md'

report  = '# AI Company OS — Project Review' + chr(10)
report += '**Date:** ' + today + chr(10)
report += '**Reviewer:** qwen2.5-coder:7b' + chr(10) + chr(10)
report += '## System Status' + chr(10)
report += '| Service | Status |' + chr(10)
report += '|---------|--------|' + chr(10)
for url, name, _ in services:
    status = 'OK' if name in results['healthy'] else 'WARN'
    report += '| ' + name + ' | ' + status + ' |' + chr(10)
report += chr(10)
report += '## Project Stats' + chr(10)
report += '- Portal pages: ' + str(pages) + chr(10)
report += '- Portal components: ' + str(comps) + chr(10)
report += '- Hub pages: ' + str(hub_pages) + chr(10)
report += '- Engine Python files: ' + str(py_files) + chr(10)
report += '- Services healthy: ' + str(len(results['healthy'])) + '/8' + chr(10)
report += chr(10)
report += '## AI Architecture Review' + chr(10) + chr(10)
report += review + chr(10) + chr(10)
report += '## Tasks Completed Today' + chr(10)
report += '| # | Task | Result |' + chr(10)
report += '|---|------|--------|' + chr(10)
tasks_done = [
    ('01', 'TypeScript health', 'DONE'),
    ('02', 'Security hardening', 'DONE'),
    ('03', 'Data health + seeding', 'DONE'),
    ('04', 'Missing files (error/404/loading)', 'DONE'),
    ('05', 'Hub wiring verification', 'DONE'),
    ('06', 'Kill next dev + prod rebuild Hub', 'DONE'),
    ('07', 'Generate real secrets', 'DONE'),
    ('08', 'CEO daily digest + cron', 'DONE'),
    ('09', 'Fix Portal type errors', 'PARTIAL'),
    ('10', 'PostgreSQL password rotation', 'DONE'),
    ('11', 'Final verification + git', 'DONE'),
    ('12', 'Fix all TS errors (AI-assisted)', 'RUNNING'),
    ('13', 'Nginx SSL + review', 'RUNNING'),
]
for num, task, status in tasks_done:
    report += '| ' + num + ' | ' + task + ' | ' + status + ' |' + chr(10)
report += chr(10)
report += '*Generated: ' + str(datetime.datetime.now()) + '*' + chr(10)

with open(report_path, 'w') as f: f.write(report)
log('  Report: ' + report_path)
results['fixed'].append('project review saved')

# Copy to Windows Desktop
try:
    import shutil
    r = subprocess.run(['wslvar', 'USERNAME'], capture_output=True, text=True)
    win_user = r.stdout.strip()
    if not win_user:
        import pathlib
        users = [u.name for u in pathlib.Path('/mnt/c/Users').iterdir()
                 if u.name not in ['Public','Default','All Users','Default User']]
        win_user = users[0] if users else ''
    if win_user:
        dest = '/mnt/c/Users/' + win_user + '/Desktop/ai-company-review-' + today + '.md'
        shutil.copy(report_path, dest)
        log('  Copied to Desktop: ' + dest)
except Exception as e:
    log('  Desktop copy: ' + str(e)[:50])
    log('  Manual: cp ' + report_path + ' /mnt/c/Users/YOUR_NAME/Desktop/')

log('=' * 40)
log('TASK 13 COMPLETE')
log('  Healthy: ' + str(len(results['healthy'])))
log('  Fixed:   ' + str(len(results['fixed'])))
log('  Warnings: ' + str(len(results['warnings'])))
log(chr(10) + 'REVIEW PREVIEW:')
for line in review.split(chr(10))[:15]:
    log('  ' + line)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/task_13_result.json','w') as f:
    _j.dump(results, f, indent=2)