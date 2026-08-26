# TESTING WORKFLOW AUDIT
## Generated: Wed Aug 26 15:44:07 UTC 2026

## package.json scripts (if exists)
NOT FOUND

## pyproject.toml (if exists)
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.backends.legacy:build"

[project]
name = "ai-company-os"
version = "2.0.0"
description = "AI Company OS — Autonomous Engineering Operating System"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.139.0",
    "uvicorn[standard]>=0.50.0",
    "sqlalchemy>=2.0.51",
    "alembic>=1.18.0",
    "asyncpg>=0.31.0",
    "psycopg2-binary>=2.9.0",
    "pydantic>=2.13.0",
    "pydantic-settings>=2.14.0",
    "httpx>=0.28.0",
    "qdrant-client>=1.18.0",
    "openai>=2.44.0",
    "anthropic>=0.116.0",
    "tiktoken>=0.13.0",
    "cryptography>=49.0.0",
    "python-dotenv>=1.2.0",
    "redis>=8.0.0",
    "pyjwt>=2.13.0",
    "python-multipart>=0.0.32",
    "aiofiles>=25.1.0",
    "prometheus-client>=0.25.0",
    "opentelemetry-api>=1.43.0",
    "opentelemetry-sdk>=1.43.0",
    "opentelemetry-exporter-otlp>=1.43.0",
    "gitpython>=3.1.50",
    "docker>=7.1.0",
    "rich>=15.0.0",
    "typer>=0.26.0",
]

[tool.setuptools.packages.find]
where = ["."]
include = ["AI_COMPANY_OS*"]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]

[tool.mypy]
python_version = "3.12"
strict = false
ignore_missing_imports = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

## pytest.ini / setup.cfg
NOT FOUND

## Makefile targets

## Test Directories
./.venv/lib/python3.14/site-packages/gitdb/test
./.venv/lib/python3.14/site-packages/greenlet/tests
./.venv/lib/python3.14/site-packages/mypy/test
./.venv/lib/python3.14/site-packages/mypyc/test
./.venv/lib/python3.14/site-packages/numpy/_core/tests
./.venv/lib/python3.14/site-packages/numpy/_pyinstaller/tests
./.venv/lib/python3.14/site-packages/numpy/f2py/tests
./.venv/lib/python3.14/site-packages/numpy/fft/tests
./.venv/lib/python3.14/site-packages/numpy/lib/tests
./.venv/lib/python3.14/site-packages/numpy/linalg/tests
./.venv/lib/python3.14/site-packages/numpy/ma/tests
./.venv/lib/python3.14/site-packages/numpy/matrixlib/tests
./.venv/lib/python3.14/site-packages/numpy/polynomial/tests
./.venv/lib/python3.14/site-packages/numpy/random/tests
./.venv/lib/python3.14/site-packages/numpy/testing/tests
./.venv/lib/python3.14/site-packages/numpy/tests
./.venv/lib/python3.14/site-packages/numpy/typing/tests
./.venv/lib/python3.14/site-packages/qdrant_client/local/tests
./.venv/lib/python3.14/site-packages/regex/tests
./.venv/lib/python3.14/site-packages/smmap/test
./.venv/lib/python3.14/site-packages/stevedore/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/greenlet/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/_core/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/_pyinstaller/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/f2py/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/fft/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/lib/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/linalg/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/ma/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/matrixlib/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/polynomial/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/random/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/testing/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/numpy/typing/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/passlib/tests
./07-AI-ENGINE/.venv/lib/python3.14/site-packages/qdrant_client/local/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/chromadb/test
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/fsspec/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/greenlet/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/importlib_resources/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/jsonschema/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/jsonschema_specifications/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/_core/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/_pyinstaller/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/f2py/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/fft/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/lib/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/linalg/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/ma/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/matrixlib/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/polynomial/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/random/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/testing/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/numpy/typing/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/passlib/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/referencing/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/regex/tests
./11-WORKSPACES/triangle-black/.venv/lib/python3.12/site-packages/websocket/tests
./11-WORKSPACES/triangle-black/portal/__tests__
./11-WORKSPACES/triangle-black/portal/e2e
./11-WORKSPACES/triangle-black/portal/tests
./11-WORKSPACES/triangle-black/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/.venv/lib/python3.12/site-packages/greenlet/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/00-CONSTITUTION/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/01-CONTEXT-PLATFORM/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/02-MCP-GATEWAY/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/03-IDE-INTEGRATION/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/04-AGENT-PLATFORM/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/05-KNOWLEDGE-PLATFORM/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/06-BUILDER/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/07-OBSERVABILITY/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/08-AUTOMATION/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/09-DEVELOPER-PORTAL/tests
./90-ARCHIVE/AI-ENGINEERING-HUB-archived/hub/tests
./90-ARCHIVE/Workspace-archived/tests
./tests

## Test Files Count by Type
Python test files:
1286
JS/TS test files:
46
