# LOCAL_AI_WORKFLOW.md — Triangle Black

How to use local AI models for development tasks.

## Available Models

| Model | Size | Best For |
|-------|------|---------|
| qwen2.5-coder-32k | 4.7GB | Long context analysis |
| qwen2.5-coder:7b | 4.7GB | Code generation |
| deepseek-r1:8b | 5.2GB | Reasoning and review |
| llama3.2:3b | 2.0GB | Quick tasks |
| nomic-embed-text | 274MB | Embeddings for RAG |
| bge-m3 | 1.2GB | Multilingual embeddings |

## Model Selection

| Task | Use This Model |
|------|---------------|
| Analyze large files | qwen2.5-coder-32k |
| Write new code | qwen2.5-coder:7b |
| Debug a problem | deepseek-r1:8b |
| Quick question | llama3.2:3b |
| RAG indexing | nomic-embed-text |

## How to Run Analysis

Pass file content to model:
  cat your_file.py | ollama run qwen2.5-coder:7b "Review this code"

## How to Generate Code

  cat 06-DOMAINS/MAINTENANCE/APIs.md | ollama run qwen2.5-coder:7b "Write service.py"

## How to Review Code

  cat src/commercial/work_orders/service.py | ollama run deepseek-r1:8b "Check tenant isolation"

## RAG System Live

Location: agent/.chromadb/
Embeddings: nomic-embed-text via Ollama
Collections scoped per tenant: tb_{tenant_id}_knowledge

## Privacy Rules

1. No hotel guest PII to external APIs
2. Use local Ollama ONLY
3. ChromaDB collection name must include tenant_id

## Multi-Model Pipeline for Complex Tasks

Step 1: deepseek-r1:8b    - Analyze and plan
Step 2: qwen2.5-coder:7b  - Write the code
Step 3: deepseek-r1:8b    - Review the code
Step 4: qwen2.5-coder:7b  - Fix issues found
Step 5: qwen2.5-coder:7b  - Write tests
