# Safe AI Rules — ZBook G7 (16GB RAM / RTX 3000)

## CPU Safety Rules

RULE 1: Never run more than ONE AI task at a time
RULE 2: Always wait 5-10s between AI calls (cool_down)
RULE 3: Keep prompts SHORT (< 300 words)
RULE 4: Use llama3.2:3b for analysis (3x faster than qwen)
RULE 5: Use qwen2.5-coder:7b ONLY for code generation
RULE 6: Set max_tokens <= 600 (never 1500+ like Program B did)
RULE 7: Set timeout <= 90s (not 180s)
RULE 8: Check CPU before each AI call — if >70% wait

## Model Guide

llama3.2:3b  (2GB VRAM) = fast analysis, planning, summaries
qwen2.5-coder:7b (5GB VRAM) = code generation only
deepseek-r1:8b (5.2GB VRAM) = complex reasoning (use sparingly)

## What Killed CPU in Program B

CAUSE: 12 value streams × 180s timeout × 2000 token prompts
RESULT: 30 minutes at 180% CPU

FIX: Short prompts (<300 words) + fast model + cool_down between calls

## Safe Task Template

def ask(prompt, timeout=60, max_tokens=400):
    # llama3.2:3b for analysis
    # qwen2.5-coder:7b for code only
    # NEVER set timeout > 90
    # NEVER set max_tokens > 800
    ...

def cool_down(s=8):
    time.sleep(s)  # always between calls

## Emergency Stop

If CPU > 150%:
  pkill -f python3
  ollama stop qwen2.5-coder:7b
  ollama stop llama3.2:3b
  free RAM: ~8GB freed
