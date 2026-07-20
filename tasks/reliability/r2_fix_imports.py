# R2 — Fix Relative Imports: ../../../../../ → @/
import os, glob, re, shutil, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/r2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'fixed':[], 'skipped':[], 'warnings':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('R2 START — Fix Relative Imports to Absolute')

# Map of relative path patterns to absolute @/ equivalents
# These are the common deep imports: ../../../../../lib/xxx
REPLACEMENTS = [
    # 5 levels deep (app/(app)/(enterprise)/section/subsection/)
    (r'from ["\'](\.{1,5}/)+lib/', 'from "@/lib/'),
    (r'from ["\'](\.{1,5}/)+components/', 'from "@/components/'),
    (r'from ["\'](\.{1,5}/)+app/', 'from "@/app/'),
    # Clean quotes
    (r"from '(@/[^']+)'", r'from "\1"'),
]

files = glob.glob(PORTAL+'/app/**/*.tsx', recursive=True)
files += glob.glob(PORTAL+'/components/**/*.tsx', recursive=True)
files = [f for f in files if 'node_modules' not in f and '.next' not in f]

fixed_count = 0
total_replacements = 0

for filepath in sorted(files):
    try:
        with open(filepath) as f: content = f.read()
        original = content

        # Find deep relative imports
        deep_imports = re.findall(
            r'from ["\'](\.{3,}[/][^"\']+)["\']',
            content
        )

        if not deep_imports:
            continue

        # Process each deep import
        new_content = content
        for imp in deep_imports:
            # Resolve what the path maps to
            # e.g., ../../../../../lib/enterprise-api → @/lib/enterprise-api
            # Count levels: ../../ = 2, ../../../ = 3, etc.
            dots = re.match(r'(\.\./)+', imp)
            if not dots: continue
            rest = imp[len(dots.group()):] 
            # Map to absolute
            if rest.startswith('lib/') or rest.startswith('components/'):
                absolute = '@/' + rest
                old_import = '"' + imp + '"'
                new_import = '"' + absolute + '"'
                old_import2 = "'" + imp + "'"
                new_import2 = '"' + absolute + '"'
                if old_import in new_content:
                    new_content = new_content.replace(old_import, new_import)
                    total_replacements += 1
                elif old_import2 in new_content:
                    new_content = new_content.replace(old_import2, new_import2)
                    total_replacements += 1

        if new_content != original:
            shutil.copy2(filepath, filepath+'.r2bak')
            with open(filepath,'w') as f: f.write(new_content)
            rel = filepath.replace(PORTAL+'/', '')
            log('  FIXED: '+rel.split('/')[-2]+'/'+rel.split('/')[-1])
            results['fixed'].append(rel)
            fixed_count += 1

    except Exception as e:
        log('  ERR: '+filepath.split('/')[-1]+': '+str(e)[:50])

log(chr(10)+'Summary:')
log('  Files fixed: '+str(fixed_count))
log('  Replacements: '+str(total_replacements))
results['fixed'].append('total replacements: '+str(total_replacements))

# Verify tsconfig has path aliases
tsconfig = PORTAL + '/tsconfig.json'
if os.path.exists(tsconfig):
    with open(tsconfig) as f: tc = f.read()
    if '@/*' in tc:
        log('  tsconfig @/* alias: EXISTS')
    else:
        log('  WARNING: tsconfig missing @/* alias')
        results['warnings'].append('tsconfig missing @/* alias')

log('='*40)
log('R2 COMPLETE')
log('  Fixed '+str(fixed_count)+' files, '+str(total_replacements)+' replacements')
with open('/home/amr/AI-COMPANY-OS/tasks/logs/r2_result.json','w') as f:
    json.dump(results,f,indent=2)