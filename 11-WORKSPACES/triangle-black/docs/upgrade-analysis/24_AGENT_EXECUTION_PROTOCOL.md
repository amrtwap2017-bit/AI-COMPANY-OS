# Agent Execution Protocol

## Sprint Execution Model

Every sprint follows this sequence:

1. READ — inspect existing implementation before touching anything
2. ANALYZE — compare against architecture and identify gaps
3. PLAN — produce specific file changes and tests
4. IMPLEMENT — make only the planned changes
5. TEST — run targeted tests for the sprint
6. SECURITY REVIEW — verify no regressions
7. COMMIT — one focused commit per sprint
8. DOCUMENT — update tracker

## Non-Negotiable Rules

- Never delete working code
- Never rename working APIs
- Never merge database migrations without verifying current head
- Never modify main.py imports inside try blocks
- Always compile check before server restart
- Always check server log after restart
- Always verify test count does not decrease

## Local AI Usage

- Use Qwen 2.5 7B for ANALYSIS only
- Never run Qwen output directly as Python
- Always verify Qwen suggestions against actual files
- Prompt max 3000 tokens
- File-based prompts only

## Command Patterns

Server restart (always use this):
pkill -f "uvicorn src.main" 2>/dev/null; sleep 2
DISABLE_RATE_LIMIT=1 .venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8030 > /tmp/tb_server.log 2>&1 &
sleep 8 && curl -s http://localhost:8030/api/v1/health/live

Verify compile before restart:
.venv/bin/python -m py_compile src/main.py && echo "OK"

Run targeted tests:
.venv/bin/python -m pytest tests/commercial/test_TARGET.py -v --tb=short

Check server crash reason:
cat /tmp/tb_server.log | grep -E "Error|Traceback|SyntaxError" | head -10
