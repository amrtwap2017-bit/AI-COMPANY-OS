#!/bin/bash
# ============================================================
# TRIANGLE BLACK — LEAD ARCHITECT AUDIT SEQUENCE
# Phase 0: Full Repository Discovery + Hub OS Health Check
# Run from repository root
# ============================================================

echo "================================================================"
echo " TRIANGLE BLACK — ENTERPRISE PLATFORM AUDIT"
echo " Lead Architect: Repository Discovery Sequence"
echo " Phase: 0 — Understand Before Touching Anything"
echo "================================================================"
echo ""

# ============================================================
# SECTION 1: ENVIRONMENT IDENTITY
# ============================================================
echo "------------------------------------------------------------"
echo "[1] ENVIRONMENT IDENTITY"
echo "------------------------------------------------------------"
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Host: $(hostname)"
echo "Shell: $SHELL"
echo "Working Directory: $(pwd)"
echo "OS: $(uname -a)"
echo ""

# ============================================================
# SECTION 2: REPOSITORY ROOT STRUCTURE
# ============================================================
echo "------------------------------------------------------------"
echo "[2] REPOSITORY ROOT — TOP LEVEL STRUCTURE"
echo "------------------------------------------------------------"
ls -la
echo ""
echo "--- Top 3 Levels (tree) ---"
find . -maxdepth 3 \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/.next/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  | sort
echo ""

# ============================================================
# SECTION 3: GIT REPOSITORY STATE
# ============================================================
echo "------------------------------------------------------------"
echo "[3] GIT STATE"
echo "------------------------------------------------------------"
echo "--- Git Status ---"
git status 2>/dev/null || echo "NOT A GIT REPO or git not available"
echo ""
echo "--- Git Log (last 20 commits) ---"
git log --oneline -20 2>/dev/null || echo "No git log available"
echo ""
echo "--- Git Branches ---"
git branch -a 2>/dev/null || echo "No branches found"
echo ""
echo "--- Git Remote ---"
git remote -v 2>/dev/null || echo "No remotes found"
echo ""
echo "--- Git Tags ---"
git tag 2>/dev/null || echo "No tags"
echo ""

# ============================================================
# SECTION 4: CONFIGURATION & ENVIRONMENT FILES
# ============================================================
echo "------------------------------------------------------------"
echo "[4] CONFIGURATION & ENVIRONMENT FILES"
echo "------------------------------------------------------------"
echo "--- All .env files (names only, NO values) ---"
find . -name ".env*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  | sort
echo ""
echo "--- All config files ---"
find . \( \
  -name "*.config.js" \
  -o -name "*.config.ts" \
  -o -name "*.config.mjs" \
  -o -name "docker-compose*.yml" \
  -o -name "Dockerfile*" \
  -o -name "nginx*.conf" \
  -o -name "*.toml" \
  -o -name "*.ini" \
  -o -name "alembic.ini" \
  -o -name "pyproject.toml" \
  -o -name "setup.py" \
  -o -name "setup.cfg" \
  -o -name "jest.config*" \
  -o -name "tailwind.config*" \
  -o -name "tsconfig*" \
  -o -name ".eslintrc*" \
  -o -name ".prettierrc*" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  | sort
echo ""

# ============================================================
# SECTION 5: BACKEND FULL DISCOVERY
# ============================================================
echo "------------------------------------------------------------"
echo "[5] BACKEND — FULL DISCOVERY"
echo "------------------------------------------------------------"

echo "--- Python version ---"
python3 --version 2>/dev/null || python --version 2>/dev/null || echo "Python not found in PATH"
echo ""

echo "--- Locate backend root (FastAPI) ---"
find . -name "main.py" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  | sort
find . -name "app.py" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  | sort
echo ""

echo "--- requirements files ---"
find . -name "requirements*.txt" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  | sort
echo ""

echo "--- requirements content ---"
find . -name "requirements*.txt" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- pyproject.toml content ---"
find . -name "pyproject.toml" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- All Python files (full list) ---"
find . -name "*.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  | sort
echo ""

echo "--- Python file count ---"
find . -name "*.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  | wc -l
echo ""

echo "--- All Python directories ---"
find . -name "*.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  | xargs -I{} dirname {} \
  | sort -u
echo ""

echo "--- FastAPI router files ---"
find . -name "router*.py" -o -name "routes*.py" -o -name "*router.py" -o -name "*routes.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  2>/dev/null | sort
echo ""

echo "--- FastAPI model files ---"
find . -name "model*.py" -o -name "*model.py" -o -name "schema*.py" -o -name "*schema.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  2>/dev/null | sort
echo ""

echo "--- Database/migration files ---"
find . \( \
  -name "*.sql" \
  -o -name "alembic.ini" \
  -o -name "env.py" \
  -o -name "versions" \
  -o -name "migration*.py" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  | sort
echo ""

echo "--- Alembic migrations ---"
find . -path "*/alembic/versions/*.py" \
  -not -path '*/__pycache__/*' \
  | sort
echo ""
echo "Migration count:"
find . -path "*/alembic/versions/*.py" \
  -not -path '*/__pycache__/*' \
  | wc -l
echo ""

echo "--- Hub OS backend location ---"
find . -type d -name "hub*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  | sort
find . -name "*hub*.py" \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  | sort
echo ""

# ============================================================
# SECTION 6: BACKEND MODULE MAP — DETAILED
# ============================================================
echo "------------------------------------------------------------"
echo "[6] BACKEND MODULE MAP"
echo "------------------------------------------------------------"

echo "--- All __init__.py files (module boundaries) ---"
find . -name "__init__.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  | sort
echo ""

echo "--- API route definitions (grep @router / @app) ---"
grep -r "@router\." . \
  --include="*.py" \
  -l \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Count of API endpoints ---"
grep -r "@router\.\(get\|post\|put\|patch\|delete\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | wc -l
echo ""

echo "--- All API endpoint paths ---"
grep -r "@router\.\(get\|post\|put\|patch\|delete\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null
echo ""

echo "--- Database models (SQLAlchemy) ---"
grep -r "class.*Base\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  -l \
  2>/dev/null | sort
echo ""

echo "--- Table definitions ---"
grep -r "__tablename__" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Table count ---"
grep -r "__tablename__" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | wc -l
echo ""

# ============================================================
# SECTION 7: FRONTEND FULL DISCOVERY
# ============================================================
echo "------------------------------------------------------------"
echo "[7] FRONTEND — FULL DISCOVERY"
echo "------------------------------------------------------------"

echo "--- Node version ---"
node --version 2>/dev/null || echo "Node not found"
echo ""
echo "--- NPM version ---"
npm --version 2>/dev/null || echo "NPM not found"
echo ""

echo "--- Frontend root (package.json locations) ---"
find . -name "package.json" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  | sort
echo ""

echo "--- package.json contents ---"
find . -name "package.json" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- tsconfig contents ---"
find . -name "tsconfig*.json" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- Next.js config ---"
find . -name "next.config*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- Tailwind config ---"
find . -name "tailwind.config*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- All TypeScript/TSX files ---"
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/dist/*' \
  | sort
echo ""

echo "--- TypeScript file count ---"
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/dist/*' \
  | wc -l
echo ""

echo "--- Next.js pages (app directory) ---"
find . -path "*/app/**" \( -name "page.tsx" -o -name "page.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Page count ---"
find . -path "*/app/**" \( -name "page.tsx" -o -name "page.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | wc -l
echo ""

echo "--- Next.js layouts ---"
find . -path "*/app/**" \( -name "layout.tsx" -o -name "layout.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Loading/Error/Not-found files ---"
find . -path "*/app/**" \( \
  -name "loading.tsx" \
  -o -name "error.tsx" \
  -o -name "not-found.tsx" \
  -o -name "global-error.tsx" \
  \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- API route handlers (Next.js) ---"
find . -path "*/app/api/**" -name "route.ts" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""
echo "--- Next.js API route count ---"
find . -path "*/app/api/**" -name "route.ts" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | wc -l
echo ""

echo "--- Component directories ---"
find . -type d -name "components" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- All component files ---"
find . -path "*/components/**" \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Component count ---"
find . -path "*/components/**" \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | wc -l
echo ""

echo "--- UI/Design system components ---"
find . \( \
  -path "*/components/ui/**" \
  -o -path "*/ui/**" \
  -o -path "*/design-system/**" \
  \) \
  \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Hooks ---"
find . -path "*/hooks/**" \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Lib/Utils ---"
find . -path "*/lib/**" \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Store/State management ---"
find . \( \
  -path "*/store/**" \
  -o -path "*/stores/**" \
  -o -path "*/context/**" \
  -o -path "*/state/**" \
  \) \
  \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- CSS/Styling files ---"
find . \( -name "*.css" -o -name "*.scss" -o -name "*.sass" \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- globals.css content ---"
find . -name "globals.css" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 8: HUB OS — COMPLETE AUDIT
# ============================================================
echo "------------------------------------------------------------"
echo "[8] HUB OS — COMPLETE AUDIT"
echo "------------------------------------------------------------"

echo "--- Hub OS directory structure ---"
find . -type d \( \
  -name "hub" \
  -o -name "hub_os" \
  -o -name "hub-os" \
  -o -name "hubos" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  | sort
echo ""

echo "--- Hub OS all files ---"
find . \( \
  -path "*/hub/**" \
  -o -path "*/hub_os/**" \
  -o -path "*/hub-os/**" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Hub services (capability check) ---"
for service in \
  "repository_intelligence" \
  "knowledge_graph" \
  "domain_graph" \
  "capability_map" \
  "planning_engine" \
  "review_engine" \
  "adr_engine" \
  "metrics_engine" \
  "prompt_builder" \
  "context_engine" \
  "mission_engine" \
  "memory_engine" \
  "quality_gates" \
  "audit_engine" \
  "validation" \
  "vector_search" \
  "project_twin" \
  "event_bus" \
  "learning_engine" \
  "engineering_dashboard"; do
  echo ""
  echo "--- Checking: $service ---"
  find . -name "*${service}*" \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/__pycache__/*' \
    -not -path '*/venv/*' \
    2>/dev/null | sort
  # also check with dashes
  service_dash=$(echo $service | tr '_' '-')
  find . -name "*${service_dash}*" \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/__pycache__/*' \
    -not -path '*/venv/*' \
    2>/dev/null | sort
done
echo ""

echo "--- Hub OS Python files (content scan) ---"
find . \( \
  -path "*/hub/**/*.py" \
  -o -path "*/hub_os/**/*.py" \
  \) \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- Hub OS TypeScript files (content scan) ---"
find . \( \
  -path "*/hub/**/*.ts" \
  -o -path "*/hub/**/*.tsx" \
  -o -path "*/hub_os/**/*.ts" \
  \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 9: AI INTEGRATION AUDIT
# ============================================================
echo "------------------------------------------------------------"
echo "[9] AI INTEGRATION AUDIT"
echo "------------------------------------------------------------"

echo "--- AI-related files ---"
find . \( \
  -name "*ai*" \
  -o -name "*openai*" \
  -o -name "*anthropic*" \
  -o -name "*llm*" \
  -o -name "*embedding*" \
  -o -name "*vector*" \
  -o -name "*prompt*" \
  -o -name "*intelligence*" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.next/*' \
  2>/dev/null | sort
echo ""

echo "--- AI imports in Python ---"
grep -r "\(import openai\|from openai\|import anthropic\|langchain\|llama\|tiktoken\|chromadb\|pinecone\|weaviate\|qdrant\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- AI imports in TypeScript ---"
grep -r "\(openai\|anthropic\|langchain\|llm\|embedding\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | sort
echo ""

echo "--- Vector DB config ---"
grep -r "\(pgvector\|vector\|embedding\|similarity\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

# ============================================================
# SECTION 10: DATABASE ARCHITECTURE
# ============================================================
echo "------------------------------------------------------------"
echo "[10] DATABASE ARCHITECTURE"
echo "------------------------------------------------------------"

echo "--- Database connection config ---"
grep -r "\(DATABASE_URL\|POSTGRES\|PG_\|db_url\|engine\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  -l \
  2>/dev/null | sort
echo ""

echo "--- All SQLAlchemy models (full table list) ---"
grep -r "__tablename__\s*=" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- All Pydantic schemas ---"
grep -r "class.*BaseModel" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Foreign key relationships ---"
grep -r "ForeignKey\|relationship(" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Indexes defined ---"
grep -r "Index(\|index=True" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Alembic versions list ---"
find . -path "*/alembic/versions/*.py" \
  -not -path '*/__pycache__/*' \
  -exec echo "=== {} ===" \; \
  -exec head -20 {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 11: AUTHENTICATION & SECURITY AUDIT
# ============================================================
echo "------------------------------------------------------------"
echo "[11] AUTHENTICATION & SECURITY AUDIT"
echo "------------------------------------------------------------"

echo "--- Auth-related files ---"
find . \( \
  -name "*auth*" \
  -o -name "*jwt*" \
  -o -name "*token*" \
  -o -name "*permission*" \
  -o -name "*role*" \
  -o -name "*security*" \
  -o -name "*middleware*" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.next/*' \
  2>/dev/null | sort
echo ""

echo "--- JWT usage ---"
grep -r "jwt\|JWT\|jose\|python-jose\|PyJWT" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- CORS configuration ---"
grep -r "CORSMiddleware\|allow_origins\|cors" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Role definitions ---"
grep -r "class.*Role\|UserRole\|RoleEnum\|role.*=.*Enum" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Permission/dependency guards ---"
grep -r "Depends(\|Security(\|get_current_user\|require_permission\|has_permission" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Password hashing ---"
grep -r "bcrypt\|passlib\|hash_password\|verify_password\|get_password_hash" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

# ============================================================
# SECTION 12: PORTAL ARCHITECTURE
# ============================================================
echo "------------------------------------------------------------"
echo "[12] PORTAL ARCHITECTURE"
echo "------------------------------------------------------------"

echo "--- Portal directories ---"
find . -type d \( \
  -name "*portal*" \
  -o -name "*dashboard*" \
  -o -name "*admin*" \
  -o -name "*client*" \
  -o -name "*operations*" \
  -o -name "*executive*" \
  -o -name "*engineer*" \
  \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Operations portal pages ---"
find . -path "*operations*" -name "page.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Client portal pages ---"
find . -path "*client*" -name "page.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Admin pages ---"
find . -path "*admin*" -name "page.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Executive/Dashboard pages ---"
find . \( \
  -path "*executive*" \
  -o -path "*dashboard*" \
  \) \
  -name "page.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

# ============================================================
# SECTION 13: DOCKER & INFRASTRUCTURE
# ============================================================
echo "------------------------------------------------------------"
echo "[13] DOCKER & INFRASTRUCTURE"
echo "------------------------------------------------------------"

echo "--- Docker files ---"
find . -name "Dockerfile*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- Docker Compose files ---"
find . -name "docker-compose*.yml" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- Nginx config ---"
find . -name "*.conf" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- CI/CD files ---"
find . \( \
  -name "*.yml" \
  -path "*github/workflows*" \
  \) \
  -not -path '*/.git/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
find . -name ".gitlab-ci.yml" \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 14: BUSINESS MODULE COVERAGE
# ============================================================
echo "------------------------------------------------------------"
echo "[14] BUSINESS MODULE COVERAGE"
echo "------------------------------------------------------------"

for module in \
  "maintenance" \
  "preventive" \
  "corrective" \
  "asset" \
  "procurement" \
  "contract" \
  "sla" \
  "project" \
  "client" \
  "supplier" \
  "vendor" \
  "invoice" \
  "payment" \
  "quotation" \
  "purchase" \
  "inventory" \
  "warehouse" \
  "field" \
  "technician" \
  "engineer" \
  "work_order" \
  "workorder" \
  "ticket" \
  "service_request" \
  "notification" \
  "report" \
  "analytics" \
  "kpi" \
  "audit" \
  "document" \
  "approval" \
  "workflow" \
  "lead" \
  "crm" \
  "hotel" \
  "property" \
  "mep"; do
  count=$(find . -name "*${module}*" \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/__pycache__/*' \
    -not -path '*/venv/*' \
    -not -path '*/.next/*' \
    2>/dev/null | wc -l)
  echo "Module [$module]: $count files"
done
echo ""

# ============================================================
# SECTION 15: DEAD CODE & TECHNICAL DEBT
# ============================================================
echo "------------------------------------------------------------"
echo "[15] TECHNICAL DEBT INDICATORS"
echo "------------------------------------------------------------"

echo "--- TODO/FIXME/HACK/XXX in Python ---"
grep -r "\(TODO\|FIXME\|HACK\|XXX\|TEMP\|BUG\|NOTE:\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- TODO/FIXME in TypeScript ---"
grep -r "\(TODO\|FIXME\|HACK\|XXX\|TEMP\|BUG\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | sort
echo ""

echo "--- Console.log statements (should not be in prod) ---"
grep -r "console\.log\b" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | wc -l
echo ""

echo "--- print() statements in Python ---"
grep -r "^\s*print(" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | wc -l
echo ""

echo "--- Hardcoded secrets/passwords (pattern scan) ---"
grep -r "\(password\s*=\s*[\"'][^\"']\|secret\s*=\s*[\"'][^\"']\|api_key\s*=\s*[\"'][^\"']\)" . \
  --include="*.py" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv,.next} \
  2>/dev/null | grep -v "test\|example\|sample\|mock"
echo ""

echo "--- Empty files ---"
find . -name "*.py" -empty \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  2>/dev/null | sort
find . \( -name "*.ts" -o -name "*.tsx" \) -empty \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  2>/dev/null | sort
echo ""

# ============================================================
# SECTION 16: PERFORMANCE & SCALABILITY INDICATORS
# ============================================================
echo "------------------------------------------------------------"
echo "[16] PERFORMANCE INDICATORS"
echo "------------------------------------------------------------"

echo "--- Async usage in Python ---"
grep -r "async def\|await " . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | wc -l
echo ""

echo "--- Caching patterns ---"
grep -r "\(cache\|redis\|memcache\|lru_cache\|@cached\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Background tasks ---"
grep -r "BackgroundTasks\|celery\|rq\|arq\|asyncio.create_task" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort
echo ""

echo "--- Pagination implemented ---"
grep -r "\(limit\|offset\|page\|skip\|paginate\)" . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | wc -l
echo ""

# ============================================================
# SECTION 17: DESIGN SYSTEM & UI AUDIT
# ============================================================
echo "------------------------------------------------------------"
echo "[17] DESIGN SYSTEM AUDIT"
echo "------------------------------------------------------------"

echo "--- Shadcn/Radix UI components ---"
find . -path "*/components/ui/*.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Custom design tokens ---"
find . \( \
  -name "tokens.ts" \
  -o -name "tokens.css" \
  -o -name "design-tokens*" \
  -o -name "theme.ts" \
  -o -name "theme.css" \
  \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Chart library usage ---"
grep -r "\(recharts\|chart\.js\|d3\|victory\|tremor\|nivo\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | sort
echo ""

echo "--- Icon libraries ---"
grep -r "\(lucide-react\|heroicons\|react-icons\|tabler-icons\|phosphor\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | wc -l
echo ""

echo "--- Data table implementations ---"
grep -r "\(tanstack\|react-table\|DataTable\|data-table\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | sort
echo ""

echo "--- Form libraries ---"
grep -r "\(react-hook-form\|formik\|zod\|yup\)" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null | wc -l
echo ""

# ============================================================
# SECTION 18: DOCUMENTATION
# ============================================================
echo "------------------------------------------------------------"
echo "[18] DOCUMENTATION"
echo "------------------------------------------------------------"

echo "--- Markdown files ---"
find . -name "*.md" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  | sort
echo ""

echo "--- README content ---"
find . -name "README*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- ADR files ---"
find . -path "*adr*" -o -path "*decisions*" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  2>/dev/null | sort
echo ""

# ============================================================
# SECTION 19: TEST COVERAGE
# ============================================================
echo "------------------------------------------------------------"
echo "[19] TEST COVERAGE"
echo "------------------------------------------------------------"

echo "--- Test files (Python) ---"
find . -name "test_*.py" -o -name "*_test.py" \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  | sort
echo ""

echo "--- Test files (TypeScript) ---"
find . \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | sort
echo ""

echo "--- Test configuration ---"
find . \( -name "pytest.ini" -o -name "jest.config*" -o -name "vitest.config*" \) \
  -not -path '*/node_modules/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 20: MAIN ENTRY POINTS — FULL CONTENT
# ============================================================
echo "------------------------------------------------------------"
echo "[20] MAIN ENTRY POINTS — FULL CONTENT"
echo "------------------------------------------------------------"

echo "--- main.py content ---"
find . -name "main.py" \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- app/page.tsx (Next.js root) ---"
find . -path "*/app/page.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

echo "--- app/layout.tsx (root layout) ---"
find . -path "*/app/layout.tsx" \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -exec echo "=== {} ===" \; \
  -exec cat {} \; \
  2>/dev/null
echo ""

# ============================================================
# SECTION 21: REPOSITORY SIZE METRICS
# ============================================================
echo "------------------------------------------------------------"
echo "[21] REPOSITORY SIZE METRICS"
echo "------------------------------------------------------------"

echo "--- Total repository size ---"
du -sh . \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='venv' \
  --exclude='.venv' \
  2>/dev/null
echo ""

echo "--- Size by directory (top level) ---"
du -sh */ 2>/dev/null | sort -rh | head -30
echo ""

echo "--- Lines of code (Python) ---"
find . -name "*.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  -not -path '*/.venv/*' \
  -exec cat {} \; 2>/dev/null | wc -l
echo ""

echo "--- Lines of code (TypeScript/TSX) ---"
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -exec cat {} \; 2>/dev/null | wc -l
echo ""

echo "--- Largest Python files ---"
find . -name "*.py" \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/venv/*' \
  | xargs wc -l 2>/dev/null \
  | sort -rn \
  | head -30
echo ""

echo "--- Largest TypeScript files ---"
find . \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  | xargs wc -l 2>/dev/null \
  | sort -rn \
  | head -30
echo ""

# ============================================================
# SECTION 22: DEPENDENCY GRAPH (IMPORTS)
# ============================================================
echo "------------------------------------------------------------"
echo "[22] IMPORT DEPENDENCY SCAN"
echo "------------------------------------------------------------"

echo "--- Python circular import candidates ---"
grep -r "^from \.\." . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null | sort | head -50
echo ""

echo "--- External Python imports used ---"
grep -r "^import \|^from " . \
  --include="*.py" \
  --exclude-dir={.git,node_modules,__pycache__,venv,.venv} \
  2>/dev/null \
  | grep -v "^.*:from \." \
  | awk '{print $2}' \
  | cut -d'.' -f1 \
  | sort -u \
  | head -50
echo ""

echo "--- TypeScript external imports ---"
grep -r "^import.*from ['\"]" . \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir={.git,node_modules,.next} \
  2>/dev/null \
  | grep -v "from ['\"][\.@]" \
  | awk -F"'" '{print $2}' \
  | cut -d'/' -f1 \
  | sort -u \
  | head -50
echo ""

# ============================================================
# SECTION 23: FINAL SUMMARY COUNTS
# ============================================================
echo "------------------------------------------------------------"
echo "[23] FINAL SUMMARY — PLATFORM METRICS"
echo "------------------------------------------------------------"

echo "Python files:         $(find . -name '*.py' -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/__pycache__/*' -not -path '*/venv/*' | wc -l)"
echo "TypeScript files:     $(find . \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "Next.js pages:        $(find . -path '*/app/**' -name 'page.tsx' -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "Next.js layouts:      $(find . -path '*/app/**' -name 'layout.tsx' -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "API routes (FastAPI):  $(grep -r '@router\.\(get\|post\|put\|patch\|delete\)' . --include='*.py' --exclude-dir={.git,node_modules,__pycache__,venv,.venv} 2>/dev/null | wc -l)"
echo "DB Tables:            $(grep -r '__tablename__' . --include='*.py' --exclude-dir={.git,node_modules,__pycache__,venv,.venv} 2>/dev/null | wc -l)"
echo "Pydantic schemas:     $(grep -r 'class.*BaseModel' . --include='*.py' --exclude-dir={.git,node_modules,__pycache__,venv,.venv} 2>/dev/null | wc -l)"
echo "Components:           $(find . -path '*/components/**' \( -name '*.tsx' -o -name '*.ts' \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "Python test files:    $(find . \( -name 'test_*.py' -o -name '*_test.py' \) -not -path '*/node_modules/*' -not -path '*/__pycache__/*' -not -path '*/venv/*' | wc -l)"
echo "TS test files:        $(find . \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \) -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l)"
echo "Alembic migrations:   $(find . -path '*/alembic/versions/*.py' -not -path '*/__pycache__/*' | wc -l)"
echo "TODO/FIXME (Python):  $(grep -r '\(TODO\|FIXME\|HACK\|XXX\)' . --include='*.py' --exclude-dir={.git,node_modules,__pycache__,venv,.venv} 2>/dev/null | wc -l)"
echo "TODO/FIXME (TS):      $(grep -r '\(TODO\|FIXME\|HACK\|XXX\)' . --include='*.ts' --include='*.tsx' --exclude-dir={.git,node_modules,.next} 2>/dev/null | wc -l)"
echo "Console.logs (TS):    $(grep -r 'console\.log\b' . --include='*.ts' --include='*.tsx' --exclude-dir={.git,node_modules,.next} 2>/dev/null | wc -l)"
echo ""

echo "================================================================"
echo " AUDIT SEQUENCE COMPLETE"
echo " Paste full output to Lead Architect for analysis"
echo "================================================================"
