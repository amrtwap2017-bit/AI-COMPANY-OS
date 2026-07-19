"""
app/evaluation/prompt_version_store.py
────────────────────────────────────────────────────────────────
Manages prompt version history in the database.
Handles save, activate, rollback, and history queries.
"""

from __future__ import annotations

import logging
from pathlib import Path
from sqlalchemy.orm import Session

from app.models.db.prompt_version import PromptVersion

log = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class PromptVersionStore:

    def __init__(self, db: Session) -> None:
        self._db = db

    def save_version(
        self,
        agent_name:    str,
        content:       str,
        source:        str = "manual",
        change_summary: str = "",
        quality_before: float | None = None,
        hints:         list[str] | None = None,
    ) -> PromptVersion:
        """Save a new prompt version. Does NOT activate it."""
        next_version = self._next_version(agent_name)

        record = PromptVersion(
            agent_name=agent_name,
            version=next_version,
            content=content,
            source=source,
            quality_score_before=quality_before,
            change_summary=change_summary,
            improvement_hints=hints or [],
            is_active=False,
        )
        self._db.add(record)
        self._db.commit()
        self._db.refresh(record)
        log.info(
            "Saved prompt v%d for agent %s",
            next_version, agent_name,
        )
        return record

    def activate(self, version_id: int) -> bool:
        """Activate a specific version. Deactivates all others."""
        record = self._db.query(PromptVersion).filter(
            PromptVersion.id == version_id
        ).first()

        if not record:
            return False

        # Deactivate all current versions for this agent
        (
            self._db.query(PromptVersion)
            .filter(PromptVersion.agent_name == record.agent_name)
            .update({"is_active": False})
        )

        # Activate this one
        record.is_active = True
        self._db.commit()

        # Write to disk so prompt_loader picks it up
        self._write_to_disk(record.agent_name, record.content)

        # Clear the lru_cache
        from app.core.prompt_loader import load_prompt
        load_prompt.cache_clear()

        log.info(
            "Activated prompt v%d for agent %s",
            record.version, record.agent_name,
        )
        return True

    def save_and_activate(
        self,
        agent_name:     str,
        content:        str,
        source:         str = "manual",
        change_summary: str = "",
        quality_before: float | None = None,
        hints:          list[str] | None = None,
    ) -> PromptVersion:
        """Save a new version and immediately activate it."""
        record = self.save_version(
            agent_name=agent_name,
            content=content,
            source=source,
            change_summary=change_summary,
            quality_before=quality_before,
            hints=hints,
        )
        self.activate(record.id)
        return record

    def rollback(self, agent_name: str) -> PromptVersion | None:
        """Rollback to the previous version."""
        versions = (
            self._db.query(PromptVersion)
            .filter(PromptVersion.agent_name == agent_name)
            .order_by(PromptVersion.version.desc())
            .limit(2)
            .all()
        )
        if len(versions) < 2:
            log.warning("No previous version to rollback to for %s", agent_name)
            return None

        previous = versions[1]  # Second most recent
        self.activate(previous.id)
        log.info("Rolled back %s to v%d", agent_name, previous.version)
        return previous

    def get_history(
        self,
        agent_name: str,
        limit:      int = 10,
    ) -> list[PromptVersion]:
        return (
            self._db.query(PromptVersion)
            .filter(PromptVersion.agent_name == agent_name)
            .order_by(PromptVersion.version.desc())
            .limit(limit)
            .all()
        )

    def get_active(self, agent_name: str) -> PromptVersion | None:
        return (
            self._db.query(PromptVersion)
            .filter(
                PromptVersion.agent_name == agent_name,
                PromptVersion.is_active == True,  # noqa: E712
            )
            .first()
        )

    def import_existing_prompts(self) -> int:
        """
        Import all existing .md files as version 1 (initial).
        Safe to call multiple times — skips already-imported agents.
        """
        imported = 0
        for md_file in sorted(PROMPTS_DIR.glob("*.md")):
            agent_name = md_file.stem
            content    = md_file.read_text(encoding="utf-8").strip()

            if not content:
                continue

            existing = (
                self._db.query(PromptVersion)
                .filter(PromptVersion.agent_name == agent_name)
                .count()
            )
            if existing > 0:
                continue

            record = PromptVersion(
                agent_name=agent_name,
                version=1,
                content=content,
                source="initial",
                change_summary="Initial import from prompt file",
                is_active=True,
            )
            self._db.add(record)
            imported += 1

        self._db.commit()
        log.info("Imported %d existing prompts as v1", imported)
        return imported

    def _next_version(self, agent_name: str) -> int:
        latest = (
            self._db.query(PromptVersion)
            .filter(PromptVersion.agent_name == agent_name)
            .order_by(PromptVersion.version.desc())
            .first()
        )
        return (latest.version + 1) if latest else 1

    def _write_to_disk(self, agent_name: str, content: str) -> None:
        """Write prompt content to the .md file."""
        try:
            prompt_file = PROMPTS_DIR / f"{agent_name}.md"
            prompt_file.write_text(content, encoding="utf-8")
            log.debug("Wrote %s prompt to disk (%d chars)", agent_name, len(content))
        except Exception as exc:
            log.error("Failed to write prompt to disk: %s", exc)
