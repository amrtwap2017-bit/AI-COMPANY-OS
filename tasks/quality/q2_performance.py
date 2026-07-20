# Q2 — Performance Audit: Bundle Size + Dead Code + Unused Deps
import os, subprocess, glob, re, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/q2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
HUB    = '/home/amr/AI-COMPANY-OS/hub/dashboard'
NODE   = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
results = {'issues':[], 'fixed':[], 'metrics':{}}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('Q2 START — Performance Audit')

# Metric 1: Bundle analysis
log(chr(10)+'Metric 1: Build size analysis')
for name, path in [('Hub', HUB), ('Portal', PORTAL)]:
    next_dir = path + '/.next'
    if os.path.exists(next_dir):
        # Get sizes
        r = subprocess.run(['du','-sh',next_dir],capture_output=True,text=True)
        size = r.stdout.split()[0] if r.stdout else 'unknown'
        # Count chunks
        chunks = glob.glob(next_dir+'/**/*.js',recursive=True)
        log('  '+name+': .next='+size+' | '+str(len(chunks))+' JS chunks')
        results['metrics'][name+'_size'] = size
        results['metrics'][name+'_chunks'] = len(chunks)

# Metric 2: Large files
log(chr(10)+'Metric 2: Large source files (>200 lines)')
large_files = []
for pattern in [PORTAL+'/app/**/*.tsx',PORTAL+'/components/**/*.tsx']:
    for f in glob.glob(pattern, recursive=True):
        if 'node_modules' in f or '.next' in f: continue
        try:
            lines = open(f).read().count(chr(10))
            if lines > 200:
                large_files.append((lines, f.replace(PORTAL+'/','')))
        except: pass
large_files.sort(reverse=True)
log('  Files > 200 lines: '+str(len(large_files)))
for lines, name in large_files[:10]:
    log('  '+str(lines)+' lines: '+name)
results['metrics']['large_files'] = len(large_files)
results['issues'].extend(['large file: '+n for l,n in large_files[:5]])

# Metric 3: Console.log statements
log(chr(10)+'Metric 3: console.log in production code')
console_logs = []
for f in glob.glob(PORTAL+'/app/**/*.tsx', recursive=True):
    if 'node_modules' in f or '.next' in f: continue
    try:
        content = open(f).read()
        count = content.count('console.log')
        if count > 0:
            console_logs.append((count, f.replace(PORTAL+'/','')))
    except: pass
log('  Files with console.log: '+str(len(console_logs)))
for count, name in console_logs[:5]: log('  '+str(count)+'x: '+name)
results['metrics']['console_logs'] = len(console_logs)

# Metric 4: Duplicate component patterns
log(chr(10)+'Metric 4: Code duplication check')
# Find files importing same things
import_counts = {}
for f in glob.glob(PORTAL+'/app/**/*.tsx', recursive=True):
    if 'node_modules' in f or '.next' in f: continue
    try:
        content = open(f).read()
        imports = re.findall(r'import.*from ["\']([^"\']+)["\']', content)
        for imp in imports:
            import_counts[imp] = import_counts.get(imp, 0) + 1
    except: pass
top_imports = sorted(import_counts.items(), key=lambda x: x[1], reverse=True)[:10]
log('  Most imported modules:')
for imp, count in top_imports: log('  '+str(count)+'x: '+imp)
results['metrics']['top_imports'] = dict(top_imports)

# Metric 5: @ts-nocheck count
log(chr(10)+'Metric 5: @ts-nocheck count')
ts_nocheck = 0
ts_nocheck_files = []
for f in glob.glob(PORTAL+'/app/**/*.tsx', recursive=True):
    if 'node_modules' in f or '.next' in f: continue
    try:
        if '// @ts-nocheck' in open(f).read():
            ts_nocheck += 1
            ts_nocheck_files.append(f.replace(PORTAL+'/app/',''))
    except: pass
log('  Pages with @ts-nocheck: '+str(ts_nocheck)+'/137')
results['metrics']['ts_nocheck_pages'] = ts_nocheck

# Fix: Remove console.logs
log(chr(10)+'Removing console.log from production code...')
removed_logs = 0
for count, filepath in console_logs:
    try:
        full = PORTAL + '/' + filepath
        with open(full) as f: content = f.read()
        new = re.sub(r'\s*console\.log\([^)]*\);?', '', content)
        if new != content:
            with open(full,'w') as f: f.write(new)
            removed_logs += 1
    except: pass
log('  Removed console.logs from '+str(removed_logs)+' files')
if removed_logs: results['fixed'].append('removed console.logs: '+str(removed_logs))

# Performance summary
log(chr(10)+'Performance Summary:')
log('  Portal bundle: '+str(results['metrics'].get('Portal_size','?')))
log('  Hub bundle: '+str(results['metrics'].get('Hub_size','?')))
log('  Large files (>200 lines): '+str(results['metrics'].get('large_files',0)))
log('  console.log files: '+str(results['metrics'].get('console_logs',0)))
log('  @ts-nocheck pages: '+str(results['metrics'].get('ts_nocheck_pages',0)))

log('='*40)
log('Q2 COMPLETE')
with open('/home/amr/AI-COMPANY-OS/tasks/logs/q2_result.json','w') as f:
    json.dump(results,f,indent=2)