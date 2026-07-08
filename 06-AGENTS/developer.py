"""
Developer Agent — Production Implementation
=============================================
Generates production-quality code from a context pack.

The Developer Agent:
1. Reads the full context pack (task + knowledge + memories)
2. Detects the target technology from workspace/task context
3. Builds a rich prompt injecting relevant business specs
4. Calls the model via Ollama
5. Extracts and validates the generated code
6. Returns structured output with file path and content

Technology detection:
  If task mentions TypeScript, NestJS, or Angular → TypeScript
  If task mentions React, Next.js → TypeScript/TSX
  Default → Python FastAPI

The knowledge_snippets from Qdrant are injected directly into
the prompt so the model sees real business specifications.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import httpx


class DeveloperAgent:
    """
    Generates code from a context pack enriched with business knowledge.
    Called by the ExecutionEngine in the coding stage.
    """

    agent_id = "developer"
    capabilities = ["backend_coding", "frontend_coding", "database_design"]
    max_concurrent_tasks = 5

    def __init__(self) -> None:
        self._ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    async def execute(self, context_pack: dict[str, Any]) -> dict[str, Any]:
        """
        Main entry point. Called by ExecutionEngine.
        Returns: {code, file_path, language, char_count, lines}
        """
        task = context_pack["task"]
        workspace = context_pack["workspace"]
        memories = context_pack.get("memories", [])
        knowledge = context_pack.get("knowledge_snippets", [])
        model_route = context_pack.get("model_route", {})

        # Detect technology
        language = self._detect_language(task, workspace)

        # Build prompt
        prompt = self._build_prompt(task, workspace, memories, knowledge, language)

        # Call model
        model_id = model_route.get("model_id", "llama3.2:3b")
        raw_code = await self._call_model(prompt, model_id)

        # Clean up the response
        code = self._extract_code(raw_code, language)

        # Determine output file path
        file_path = self._compute_file_path(task, workspace, language)

        return {
            "code": code,
            "file_path": file_path,
            "language": language,
            "char_count": len(code),
            "lines": len(code.splitlines()),
            "model_used": model_id,
            "knowledge_snippets_used": len(knowledge),
        }

    def _detect_language(self, task: dict, workspace: dict) -> str:
        """Detect target language from task description and workspace context."""
        text = (
            task.get("title", "") + " " +
            task.get("description", "") + " " +
            workspace.get("name", "")
        ).lower()

        if any(kw in text for kw in ["nestjs", "typescript", "angular", "node.js", "express"]):
            return "typescript"
        if any(kw in text for kw in ["react", "next.js", "nextjs", "tsx", "jsx"]):
            return "tsx"
        if any(kw in text for kw in ["flutter", "dart"]):
            return "dart"
        return "python"

    def _build_prompt(
        self,
        task: dict,
        workspace: dict,
        memories: list,
        knowledge: list,
        language: str,
    ) -> str:
        """
        Build a rich prompt that includes:
        - Task specification
        - Business context from Qdrant knowledge
        - Failure memories to avoid
        - Technology-specific instructions
        """
        # Format knowledge snippets
        knowledge_section = ""
        if knowledge:
            knowledge_section = "\n\n## RELEVANT BUSINESS SPECIFICATIONS\n"
            knowledge_section += "(Retrieved from workspace knowledge base)\n\n"
            for i, k in enumerate(knowledge[:6], 1):
                knowledge_section += f"### Document {i}: {k.get('file_path', '')}\n"
                knowledge_section += f"{k.get('content', '')}\n\n"

        # Format failure memories
        failure_section = ""
        failures = [m for m in memories if m["type"] == "failure"]
        if failures:
            failure_section = "\n\n## AVOID THESE PAST MISTAKES\n"
            for f in failures[:3]:
                failure_section += f"- {f['content'][:200]}\n"

        # Technology-specific instructions
        tech_instructions = self._get_tech_instructions(language)

        prompt = f"""You are a senior software engineer building a production system for a hospitality engineering company.

## TASK
Title: {task['title']}
Description: {task.get('description', 'No description provided')}

## ACCEPTANCE CRITERIA
{self._format_criteria(task.get('acceptance_criteria', {}))}
{knowledge_section}{failure_section}

## TECHNOLOGY REQUIREMENTS
{tech_instructions}

## OUTPUT REQUIREMENTS
- Write complete, production-ready code
- Include all imports
- Include docstrings and type hints
- Include error handling
- Follow clean architecture principles
- Separate concerns (entity, repository, service, controller)
- Return ONLY the code — no explanations, no markdown fences

Generate the complete implementation now:"""

        return prompt

    def _get_tech_instructions(self, language: str) -> str:
        if language == "typescript":
            return """- Use NestJS framework
- Use TypeScript with strict mode
- Use class-validator for DTOs
- Use TypeORM for database
- Separate: entity.ts, dto.ts, repository.ts, service.ts, controller.ts, module.ts
- Export a NestJS module"""
        if language == "tsx":
            return """- Use Next.js 15 App Router
- Use TypeScript
- Use React Server Components where possible
- Use Tailwind CSS for styling
- Use shadcn/ui components"""
        return """- Use Python 3.12+ with type hints
- Use FastAPI for HTTP layer
- Use SQLAlchemy 2.0 async
- Use Pydantic v2 for schemas
- Separate: models.py, schemas.py, repository.py, service.py, router.py
- Include workspace_id isolation on all queries"""

    def _format_criteria(self, criteria: dict) -> str:
        lines = []
        if criteria.get("must_have_endpoints"):
            lines.append(f"Required endpoints: {', '.join(criteria['must_have_endpoints'])}")
        if criteria.get("must_have_coverage"):
            lines.append(f"Test coverage: {criteria['must_have_coverage']}%")
        if criteria.get("architecture_score_minimum"):
            lines.append(f"Architecture score minimum: {criteria['architecture_score_minimum']}")
        return "\n".join(lines) if lines else "Standard quality criteria"

    async def _call_model(self, prompt: str, model_id: str) -> str:
        """Call Ollama with the prompt. Returns raw model response."""
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                resp = await client.post(
                    f"{self._ollama_url}/api/generate",
                    json={
                        "model": model_id,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.1,
                            "top_p": 0.9,
                            "num_predict": 2048,
                        },
                    },
                )
                if resp.status_code == 200:
                    return resp.json().get("response", "")
        except Exception as exc:
            return f"# Model call failed: {exc}"
        return "# No response from model"

    def _extract_code(self, raw: str, language: str) -> str:
        """
        Extract clean code from model response.
        Remove markdown fences, explanations, etc.
        """
        # Remove common markdown fences
        patterns = [
            r"```(?:python|typescript|javascript|tsx|jsx|ts|js)?\n(.*?)```",
            r"```\n(.*?)```",
        ]
        for pattern in patterns:
            match = re.search(pattern, raw, re.DOTALL)
            if match:
                return match.group(1).strip()

        # If no fences found, use the raw response but clean it
        lines = raw.split("\n")
        code_lines = []
        in_code = False

        for line in lines:
            # Skip obvious non-code lines
            if line.startswith("Here") or line.startswith("This"):
                continue
            if line.startswith("The following") or line.startswith("Below"):
                continue
            in_code = True
            code_lines.append(line)

        result = "\n".join(code_lines).strip()
        if not result:
            result = raw.strip()

        return result

    def _compute_file_path(self, task: dict, workspace: dict, language: str) -> str:
        """Compute the output file path for the generated code."""
        base = workspace.get("base_path", "/home/amr/AI-COMPANY-OS/11-WORKSPACES")
        slug = workspace.get("slug", "demo")

        # Clean the task title for use as filename
        title = task.get("title", "generated")
        safe = re.sub(r"[^a-z0-9_]", "_", title.lower())
        safe = re.sub(r"_+", "_", safe).strip("_")[:50]

        ext_map = {
            "python": ".py",
            "typescript": ".ts",
            "tsx": ".tsx",
            "dart": ".dart",
        }
        ext = ext_map.get(language, ".py")

        out_dir = Path(base) / slug / "artifacts"
        out_dir.mkdir(parents=True, exist_ok=True)

        return str(out_dir / f"{safe}{ext}")
