# Knowledge Extraction Prompt

Model: qwen2.5-coder:7b

Use for: indexing docs into ChromaDB

Template:
---
Extract knowledge from this Triangle Black document for RAG indexing.

Document: [paste document]

Extract:
1. Key concepts with definitions
2. Business rules: when X then Y
3. Process steps
4. FAQ pairs

Format each chunk under 500 tokens.
Include tags: domain, entity, concept.

Output: structured list ready for ChromaDB indexing.
---
