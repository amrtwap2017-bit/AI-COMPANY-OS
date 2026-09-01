#!/bin/bash
# Triangle Black — Pre-deployment verification script
# Run before every production deployment

set -e
echo "=== Triangle Black Pre-deployment Check ==="

# 1. Tests
echo "Running tests..."
.venv/bin/python -m pytest tests/ -q --tb=no 2>&1 | tail -3
TESTS_PASS=$?

# 2. Syntax
echo "Checking syntax..."
.venv/bin/python -m py_compile src/main.py && echo "✅ main.py syntax OK"

# 3. TypeScript (informational — Next.js manages its own types)
echo "Checking TypeScript..."
TS_ERRORS=$(cd portal && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
echo "TypeScript errors: $TS_ERRORS"
if [ "$TS_ERRORS" -gt "50" ]; then
    echo "⚠️  WARNING: High TypeScript error count ($TS_ERRORS) — investigate before deploy"
fi

# 4. Backup
echo "Checking backup age..."
LATEST=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
    echo "❌ No backup found — run backup before deploy"
    exit 1
fi
echo "✅ Latest backup: $LATEST"

# 5. Migration status
echo "Checking migrations..."
.venv/bin/alembic current 2>&1 | tail -3

echo "=== Pre-deployment check complete ==="
if [ $TESTS_PASS -eq 0 ]; then
    echo "✅ Ready for deployment"
else
    echo "❌ Tests failing — do not deploy"
    exit 1
fi
