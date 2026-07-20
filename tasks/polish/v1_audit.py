import os, glob, json, datetime

LOG    = "/home/amr/AI-COMPANY-OS/tasks/logs/v1.log"
PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
results = {"needs_upgrade": [], "already_good": [], "bundle_waste": []}

def log(m):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    out = "["+ts+"] "+str(m)
    print(out, flush=True)
    open(LOG,"a").write(out+chr(10))

log("V1 START — Enterprise Pages Audit")

# Find enterprise pages using OLD design patterns
old_patterns = [
    "RoleWorkbenchHero",      # old hero component
    "RoleWorkspaceBanner",    # old banner
    "QueueBoardMatrix",       # old queue board
    "SLARiskBoard",           # old SLA board
    "DispatchWorkspacePanel", # old dispatch panel
    "ServiceCalendarBoard",   # old calendar
    "CrossObjectActionCenter",# old action center
    "EnterpriseGraphNavigator",# old graph nav
    "EntityLinkDeck",         # old entity deck
    "FilterBar",              # can keep but check
    "RecordListCard",         # old record card
    "LinkedScenarioPanel",    # old scenario
    "SavedViewsPanel",        # old saved views
    "ObjectJourneyRibbon",    # old journey
    "SignalStrip",            # old signal strip
    "QueueBoard",             # old queue board
    "IntegrationStatusPanel", # old integration
]

ent_pages = glob.glob(PORTAL+"/app/(app)/(enterprise)/**/page.tsx", recursive=True)
ent_pages = [f for f in ent_pages if "node_modules" not in f]

log("Total enterprise pages: "+str(len(ent_pages)))
log("")

sections_needing_upgrade = {}
for f in sorted(ent_pages):
    try:
        with open(f) as fp: content = fp.read()
        rel = f.replace(PORTAL+"/app/(app)/(enterprise)/","").replace("/page.tsx","")
        section = rel.split("/")[0]
        
        old_count = sum(1 for p in old_patterns if p in content)
        has_breadcrumb = "Breadcrumb" in content
        has_page_header = "PageHeader" in content
        has_loading = "isLoading" in content or "LoadingState" in content
        
        if old_count > 0:
            sections_needing_upgrade.setdefault(section, []).append({
                "page": rel,
                "old_components": old_count,
                "has_breadcrumb": has_breadcrumb,
                "has_page_header": has_page_header
            })
            results["needs_upgrade"].append(rel)
        else:
            results["already_good"].append(rel)
    except: pass

log("Sections needing upgrade:")
for section, pages in sorted(sections_needing_upgrade.items()):
    log("  ["+section+"] "+str(len(pages))+" pages with old components")
    for p in pages[:3]:
        log("    /"+p["page"]+" ("+str(p["old_components"])+" old components)")

log("")
log("Summary:")
log("  Needs upgrade: "+str(len(results["needs_upgrade"])))
log("  Already good:  "+str(len(results["already_good"])))

# Check bundle size contributors
log("")
log("Bundle size check:")
import subprocess
r = subprocess.run(["du","-sh",PORTAL+"/.next"], capture_output=True, text=True)
log("  .next dir: "+r.stdout.split()[0])

# Find largest workspace component files
ws_files = glob.glob(PORTAL+"/components/workspace/*.tsx")
ws_files = [f for f in ws_files if "node_modules" not in f]
log("  workspace components: "+str(len(ws_files))+" files")
total_ws = sum(os.path.getsize(f) for f in ws_files if os.path.exists(f))
log("  workspace total: "+str(total_ws//1024)+"KB")

with open("/home/amr/AI-COMPANY-OS/tasks/logs/v1_result.json","w") as f:
    json.dump(results, f, indent=2)
log("="*40)
log("V1 COMPLETE")
log("  sections needing upgrade: "+str(len(sections_needing_upgrade)))
for s in sorted(sections_needing_upgrade.keys()):
    log("  → "+s)
