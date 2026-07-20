import os, subprocess, glob, datetime
LOG = '/home/amr/AI-COMPANY-OS/tasks/logs/u1.log'
ROOT = '/home/amr/AI-COMPANY-OS'
results = {'fixed':[], 'warnings':[]}
def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('U1 START — Git Cleanup')

# Remove ALL .bak files from git tracking
r = subprocess.run(['git','rm','--cached','-r','--ignore-unmatch',
    '*.bak','*.bak2','*.tsfix.bak','*.ts-fix.bak'],
    cwd=ROOT, capture_output=True, text=True)
removed = r.stdout.count('rm ')
log('  Removed ' + str(removed) + ' .bak files from git')
results['fixed'].append('git: removed ' + str(removed) + ' .bak files')

# Delete ALL .bak files from disk
bak_files = glob.glob(ROOT + '/**/*.bak', recursive=True)
bak_files += glob.glob(ROOT + '/**/*.bak2', recursive=True)
bak_files += glob.glob(ROOT + '/**/*.tsfix.bak', recursive=True)
bak_files += glob.glob(ROOT + '/**/*.ts-fix.bak', recursive=True)
deleted = 0
for f in bak_files:
    if 'node_modules' not in f and '.venv' not in f:
        try: os.remove(f); deleted += 1
        except: pass
log('  Deleted ' + str(deleted) + ' .bak files from disk')
results['fixed'].append('deleted ' + str(deleted) + ' .bak files')

# Update .gitignore
gi_path = ROOT + '/.gitignore'
with open(gi_path) as f: gi = f.read()
entries = ['*.bak','*.bak2','*.tsfix.bak','*.ts-fix.bak',
    '*.bak.*','reports/daily/','tasks/logs/','**/*.log']
added = []
for e in entries:
    if e not in gi:
        gi += chr(10) + e
        added.append(e)
if added:
    with open(gi_path,'w') as f: f.write(gi)
    log('  Added to .gitignore: ' + str(added))
    results['fixed'].append('.gitignore updated')

# Commit
subprocess.run(['git','add','-A'], cwd=ROOT, capture_output=True)
r = subprocess.run(['git','commit','-m','chore: remove .bak files, update .gitignore'],
    cwd=ROOT, capture_output=True, text=True)
if 'nothing to commit' not in r.stdout+r.stderr:
    log('  Committed')
    results['fixed'].append('committed')

log('U1 COMPLETE — Fixed: '+str(len(results['fixed'])))
import json
with open('/home/amr/AI-COMPANY-OS/tasks/logs/u1_result.json','w') as f:
    json.dump(results,f,indent=2)