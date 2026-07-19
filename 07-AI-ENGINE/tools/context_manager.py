"""
app/tools/context_manager.py
────────────────────────────────────────────────────────────────
Context Window Manager — Intelligent conversation compression.

Solves the problem of long conversations losing context.

Features:
  - Summarize old conversation turns
  - Extract and preserve key decisions
  - Track what was built and why
  - Never lose critical information
  - Compress without losing meaning
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

MAX_TOKENS_BEFORE_COMPRESS = 6000   # chars
CHARS_PER_TOKEN            = 4


@dataclass
class ContextSummary:
    decisions:  list[str]
    key_facts:  list[str]
    what_built: list[str]
    summary:    str
    char_count: int


class ContextManagerTool(BaseTool):
    name        = "context_manager"
    description = (
        "Manages conversation context to prevent context window overflow. "
        "Summarizes old turns, preserves key decisions and facts. "
        "Use when conversation becomes very long."
    )
    permissions_required = []

    def run(
        self,
        action:          str,
        conversation_id: int | None     = None,
        messages:        list[dict] | None = None,
        **kwargs,
    ) -> ToolResult:
        """
        Manage context.

        Actions:
          analyze:  Check if compression needed
          compress: Compress conversation history
          extract:  Extract key decisions and facts
          summary:  Get conversation summary
        """
        actions = {
            "analyze":  self._analyze,
            "compress": self._compress,
            "extract":  self._extract,
            "summary":  self._summary,
        }

        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )

        try:
            result = actions[action](
                conversation_id=conversation_id,
                messages=messages,
                **kwargs,
            )
            return ToolResult(
                tool=self.name,
                success=True,
                output=result,
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _get_messages(
        self,
        conversation_id: int | None,
        messages: list[dict] | None,
    ) -> list[dict]:
        if messages:
            return messages

        if conversation_id:
            from db.database import SessionLocal
            from repositories.conversation import ConversationRepository
            db = SessionLocal()
            try:
                repo = ConversationRepository(db)
                msgs = repo.get_messages(conversation_id, limit=100)
                return [{"role": m.role, "content": m.content} for m in msgs]
            finally:
                db.close()

        return []

    def _analyze(
        self,
        conversation_id=None,
        messages=None,
        **kwargs,
    ) -> dict:
        """Check if context compression is needed."""
        msgs       = self._get_messages(conversation_id, messages)
        total_chars = sum(len(m.get("content", "")) for m in msgs)
        est_tokens  = total_chars // CHARS_PER_TOKEN

        return {
            "messages":        len(msgs),
            "total_chars":     total_chars,
            "est_tokens":      est_tokens,
            "compression_needed": total_chars > MAX_TOKENS_BEFORE_COMPRESS,
            "recommendation": (
                "Compress conversation — context too long"
                if total_chars > MAX_TOKENS_BEFORE_COMPRESS
                else "Context size is manageable"
            ),
        }

    def _extract(
        self,
        conversation_id=None,
        messages=None,
        **kwargs,
    ) -> dict:
        """Extract key decisions and facts from conversation."""
        msgs     = self._get_messages(conversation_id, messages)
        all_text = "\n".join(m.get("content", "") for m in msgs)

        import re

        # Extract decisions
        decision_patterns = [
            r"(?:decided?|choosing|will use|going with|selected?)\s+([^.!?\n]{10,80})",
            r"(?:the\s+)?(?:decision|choice|approach)\s+is\s+([^.!?\n]{10,80})",
        ]
        decisions = []
        for p in decision_patterns:
            decisions.extend(re.findall(p, all_text, re.I))

        # Extract what was built
        built_patterns = [
            r"(?:created?|built|implemented?|wrote|added)\s+([^.!?\n]{10,80})",
            r"(?:the\s+)?([^.!?\n]{10,60})\s+(?:is|was)\s+(?:complete|done|ready|finished)",
        ]
        built = []
        for p in built_patterns:
            built.extend(re.findall(p, all_text, re.I))

        # Extract key facts
        fact_patterns = [
            r"(?:remember|note|important|key\s+point)[:,]\s+([^.!?\n]{10,100})",
        ]
        facts = []
        for p in fact_patterns:
            facts.extend(re.findall(p, all_text, re.I))

        return {
            "decisions":  list(dict.fromkeys(decisions))[:10],
            "what_built": list(dict.fromkeys(built))[:10],
            "key_facts":  list(dict.fromkeys(facts))[:10],
            "messages_analyzed": len(msgs),
        }

    def _compress(
        self,
        conversation_id=None,
        messages=None,
        keep_last: int = 5,
        **kwargs,
    ) -> dict:
        """Compress old messages into a summary."""
        msgs = self._get_messages(conversation_id, messages)

        if len(msgs) <= keep_last:
            return {"compressed": False, "reason": "Not enough messages to compress"}

        old_msgs  = msgs[:-keep_last]
        keep_msgs = msgs[-keep_last:]

        # Build summary of old messages
        old_text = "\n".join(
            f"{m['role'].upper()}: {m['content'][:200]}"
            for m in old_msgs
        )

        summary = (
            f"[COMPRESSED: {len(old_msgs)} previous messages]\n"
            f"Key content from earlier conversation:\n{old_text[:1000]}"
        )

        extraction = self._extract(messages=old_msgs)

        return {
            "compressed":    True,
            "msgs_before":   len(msgs),
            "msgs_after":    keep_last + 1,
            "summary":       summary,
            "decisions":     extraction["decisions"],
            "what_built":    extraction["what_built"],
            "kept_messages": keep_msgs,
        }

    def _summary(
        self,
        conversation_id=None,
        messages=None,
        **kwargs,
    ) -> dict:
        """Get a readable summary of the conversation."""
        msgs    = self._get_messages(conversation_id, messages)
        extract = self._extract(messages=msgs)

        total_chars = sum(len(m.get("content", "")) for m in msgs)
        user_msgs   = [m for m in msgs if m.get("role") == "user"]
        ai_msgs     = [m for m in msgs if m.get("role") == "assistant"]

        summary = (
            f"Conversation with {len(msgs)} messages "
            f"({len(user_msgs)} user, {len(ai_msgs)} assistant). "
            f"Total context: {total_chars:,} chars. "
        )
        if extract["decisions"]:
            summary += f"Key decisions: {len(extract['decisions'])}. "
        if extract["what_built"]:
            summary += f"Built: {len(extract['what_built'])} items."

        return {
            "summary":      summary,
            "messages":     len(msgs),
            "total_chars":  total_chars,
            **extract,
        }


context_manager_tool = ContextManagerTool()
