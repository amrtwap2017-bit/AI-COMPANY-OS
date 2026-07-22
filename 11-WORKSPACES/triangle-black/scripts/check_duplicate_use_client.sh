#!/bin/bash
# Build Guard Check 8: Duplicate use client directives
# Sprint 21 addition

PORTAL="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
DUP_COUNT=0
DUP_FILES=""

while IFS= read -r -d '' file; do
    count=$(grep -c '"use client"\|use client";' "$file" 2>/dev/null || echo 0)
    if [ "$count" -gt "1" ]; then
        DUP_COUNT=$((DUP_COUNT + 1))
        DUP_FILES="$DUP_FILES\n  $file"
    fi
done < <(find "$PORTAL/app" -name "*.tsx" -not -path "*/.next/*" -print0)

if [ "$DUP_COUNT" -gt "0" ]; then
    echo "[CHECK-8] ❌ Found $DUP_COUNT files with duplicate 'use client':"
    echo -e "$DUP_FILES"
    echo "[CHECK-8] Run: python3 /home/amr/AI-COMPANY-OS/tasks/portal/sprint20/fix_dup_use_client.py"
    exit 1
else
    echo "[CHECK-8] ✅ No duplicate use client directives"
fi
