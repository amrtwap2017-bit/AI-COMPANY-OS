#!/usr/bin/env python3
import httpx, json, sys
from pathlib import Path

BRAIN_DIR = Path("/home/amr/AI-COMPANY-OS/brains/triangle-black")
ENGINE    = "http://localhost:8001/api/v1/ai"

TAG_MAP = {
    "00-BRAIN-BOOTSTRAP":        ["bootstrap","overview"],
    "01-PROJECT-IDENTITY":       ["identity","project"],
    "02-ARCHITECTURE-SUMMARY":   ["architecture","technical"],
    "03-BUSINESS-SUMMARY":       ["business","strategy"],
    "04-CURRENT-IMPLEMENTATION": ["implementation","technical"],
    "05-ENGINEERING-RULES":      ["rules","engineering"],
    "06-DEPENDENCY-GRAPH":       ["dependencies","technical"],
    "07-KNOWLEDGE-GRAPH":        ["knowledge","graph"],
    "08-CURRENT-BACKLOG":        ["backlog","tasks"],
    "09-CURRENT-BLOCKERS":       ["blockers","issues"],
    "AGENT-BOOTSTRAP":           ["agents","bootstrap"],
}

def get_tags(filename):
    stem = Path(filename).stem
    for key, tags in TAG_MAP.items():
        if key in stem:
            return tags + ["triangle-black", "brain"]
    return ["triangle-black", "brain"]

def main():
    files = sorted(BRAIN_DIR.glob("*.md"))
    if not files:
        print("No .md files found"); sys.exit(1)

    print(f"Ingesting {len(files)} brain files -> {ENGINE}/knowledge/ingest\n")
    ok = fail = 0

    with httpx.Client(timeout=30.0) as client:
        for f in files:
            content = f.read_text(encoding="utf-8")
            payload = {
                "title":     f.stem,
                "content":   content,
                "source":    f"brains/triangle-black/{f.name}",
                "tags":      get_tags(f.name),
                "workspace": "triangle-black",
                "metadata":  {
                    "file": f.name, "workspace": "triangle-black",
                    "type": "brain", "chars": len(content),
                }
            }
            try:
                r = client.post(f"{ENGINE}/knowledge/ingest", json=payload)
                if r.status_code in (200, 201):
                    print(f"  OK  {f.name}  ({len(content):,} chars)")
                    ok += 1
                else:
                    print(f"  FAIL {f.name} -> HTTP {r.status_code}: {r.text[:100]}")
                    fail += 1
            except Exception as e:
                print(f"  ERR  {f.name} -> {e}")
                fail += 1

    print(f"\nDone: {ok} OK / {fail} failed out of {len(files)}")
    manifest = {"ok": ok, "failed": fail, "total": len(files)}
    (BRAIN_DIR / ".ingest-manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"Manifest saved to {BRAIN_DIR}/.ingest-manifest.json")

if __name__ == "__main__":
    main()
