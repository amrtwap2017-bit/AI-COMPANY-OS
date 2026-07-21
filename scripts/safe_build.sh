#!/bin/bash
# SAFE BUILD — Validates then builds portal
# Usage: bash scripts/safe_build.sh
# Prevents ALL known recurring errors

set -e
PORTAL="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
NODE="/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
ROOT="/home/amr/AI-COMPANY-OS"

echo "╔══════════════════════════════════════╗"
echo "║  SAFE BUILD — Triangle Black Portal  ║"
echo "╚══════════════════════════════════════╝"

echo ""
echo "── Step 1: Run Build Guard ──"
python3 "$ROOT/tasks/program_b/BUILD_GUARD.py"
GUARD_EXIT=$?

if [ $GUARD_EXIT -ne 0 ]; then
  echo "❌ Build Guard failed — issues need manual review"
  echo "   Check: tasks/logs/build_guard_result.json"
  exit 1
fi

echo ""
echo "── Step 2: Build Portal ──"
cd "$PORTAL"
$NODE node_modules/.bin/next build 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "── Step 3: Restart Portal (PROD) ──"
  /usr/bin/pkill -9 -f "next.*3001" 2>/dev/null || true
  /usr/bin/fuser -k 3001/tcp 2>/dev/null || true
  sleep 2
  nohup $NODE node_modules/.bin/next start -p 3001 > /tmp/portal.log 2>&1 &
  echo "  PROD PID: $!"
  sleep 8

  echo ""
  echo "── Step 4: Smoke Test ──"
  python3 "$ROOT/tasks/portal/smoke_test.py"

  echo ""
  du -sh "$PORTAL/.next" | awk '{print "Bundle: "$1}'
  echo "✅ SAFE BUILD COMPLETE — PROD mode"
else
  echo ""
  echo "❌ Build failed — check errors above"
  echo "   Run: python3 tasks/program_b/BUILD_GUARD.py"
  exit 1
fi
