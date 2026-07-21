#!/bin/bash
# Install git pre-commit hook to run Build Guard before every commit
ROOT="/home/amr/AI-COMPANY-OS"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" << 'HOOKSCRIPT'
#!/bin/bash
echo "Running Build Guard before commit..."
python3 /home/amr/AI-COMPANY-OS/tasks/program_b/BUILD_GUARD.py
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Pre-commit Build Guard failed"
  echo "   Issues were auto-fixed — re-add files and commit again"
  echo "   git add -A && git commit"
  exit 1
fi
echo "✅ Build Guard passed"
HOOKSCRIPT

chmod +x "$HOOK"
echo "✅ Git pre-commit hook installed"
echo "   Every commit now runs BUILD_GUARD automatically"
