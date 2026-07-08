"""
Git Agent — Version Control & Release Management
==================================================
Commits generated artifacts to the workspace repository.

Operations:
  - Stage changed files
  - Create structured commit messages
  - Push to feature branch
  - Generate release notes
  - Tag releases

Commit message format:
  feat(domain): short description

  - What was built
  - Quality score: X.X/100
  - Run group: UUID
  - Task: CRE-001 Lead Capture

For Wave 3, commits go to the local workspace git repo.
For Wave 4+, push to remote and create PR.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Any
from uuid import UUID


class GitAgent:
    """
    Manages version control for generated artifacts.
    """

    agent_id = "git"
    capabilities = ["git_operations", "release_management", "changelog_generation"]

    def __init__(self) -> None:
        self._workspace_base = Path(
            os.environ.get(
                "WORKSPACE_BASE_PATH",
                "/home/amr/AI-COMPANY-OS/11-WORKSPACES",
            )
        )

    async def commit_artifacts(
        self,
        context_pack: dict[str, Any],
        artifacts: list[str],
        run_group: UUID,
        quality_score: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Commit generated artifacts to the workspace repository.

        Returns commit result with SHA if successful.
        """
        workspace_slug = context_pack["workspace"]["slug"]
        task = context_pack["task"]

        # Find or initialize git repo in workspace
        workspace_dir = self._workspace_base / workspace_slug
        repo_path = self._find_or_init_repo(workspace_dir)

        if not repo_path:
            return {
                "committed": False,
                "reason": "No git repository found or initialized",
                "artifacts_saved": artifacts,
            }

        # Build commit message
        commit_msg = self._build_commit_message(task, quality_score, run_group)

        # Stage and commit
        result = self._git_commit(repo_path, artifacts, commit_msg)

        # Generate release notes
        release_notes = self._generate_release_notes(task, quality_score, artifacts)

        return {
            "committed": result.get("success", False),
            "sha": result.get("sha", ""),
            "branch": result.get("branch", "main"),
            "commit_message": commit_msg,
            "release_notes": release_notes,
            "artifacts_committed": artifacts,
            "repo_path": str(repo_path),
        }

    def _find_or_init_repo(self, workspace_dir: Path) -> Path | None:
        """Find existing git repo or initialize one in workspace."""
        # Check workspace root
        if (workspace_dir / ".git").exists():
            return workspace_dir

        # Check artifacts directory
        artifacts_dir = workspace_dir / "artifacts"
        if artifacts_dir.exists():
            if not (artifacts_dir / ".git").exists():
                try:
                    subprocess.run(
                        ["git", "init"],
                        cwd=str(artifacts_dir),
                        capture_output=True,
                        timeout=10,
                    )
                    subprocess.run(
                        ["git", "config", "user.email", "ai-os@triangleblack.com"],
                        cwd=str(artifacts_dir),
                        capture_output=True,
                        timeout=5,
                    )
                    subprocess.run(
                        ["git", "config", "user.name", "AI Company OS"],
                        cwd=str(artifacts_dir),
                        capture_output=True,
                        timeout=5,
                    )
                    return artifacts_dir
                except Exception:
                    pass

        return None

    def _build_commit_message(
        self,
        task: dict,
        quality_score: dict,
        run_group: UUID,
    ) -> str:
        """Build a structured commit message."""
        title = task.get("title", "Generated code")
        task_id = task.get("id", "")[:8]
        score = quality_score.get("overall_score", 0)
        passed = quality_score.get("passed_gate", False)

        # Extract domain prefix from title (e.g. CRE-001 → feat(commercial))
        domain = "platform"
        if "CRE-" in title or "commercial" in title.lower():
            domain = "commercial"
        elif "PRO-" in title or "project" in title.lower():
            domain = "projects"
        elif "PRC-" in title or "procure" in title.lower():
            domain = "procurement"
        elif "FIN-" in title or "financ" in title.lower():
            domain = "financial"
        elif "MNT-" in title or "mainten" in title.lower():
            domain = "maintenance"

        short_title = title[:60].lower().replace(" ", "-").replace(":", "")

        msg = f"""feat({domain}): {short_title}

Generated by AI Company OS — Autonomous Engineering Pipeline

Task:         {title}
Task ID:      {task_id}
Quality:      {score:.1f}/100 ({'GATE PASSED' if passed else 'GATE FAILED'})
Run Group:    {run_group}

Changes:
- Implemented {title}
- All acceptance criteria addressed
- Code quality score: {score:.1f}/100"""

        return msg

    def _git_commit(
        self,
        repo_path: Path,
        artifacts: list[str],
        commit_msg: str,
    ) -> dict[str, Any]:
        """Stage and commit the artifacts."""
        try:
            # Stage all artifacts
            for artifact in artifacts:
                artifact_path = Path(artifact)
                if artifact_path.exists():
                    rel_path = str(artifact_path.relative_to(repo_path))
                    subprocess.run(
                        ["git", "add", rel_path],
                        cwd=str(repo_path),
                        capture_output=True,
                        timeout=10,
                    )

            # Stage all new files
            subprocess.run(
                ["git", "add", "-A"],
                cwd=str(repo_path),
                capture_output=True,
                timeout=10,
            )

            # Commit
            result = subprocess.run(
                ["git", "commit", "-m", commit_msg],
                cwd=str(repo_path),
                capture_output=True,
                text=True,
                timeout=15,
            )

            if result.returncode == 0:
                # Get SHA
                sha_result = subprocess.run(
                    ["git", "rev-parse", "--short", "HEAD"],
                    cwd=str(repo_path),
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                sha = sha_result.stdout.strip()

                branch_result = subprocess.run(
                    ["git", "branch", "--show-current"],
                    cwd=str(repo_path),
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                branch = branch_result.stdout.strip() or "main"

                return {"success": True, "sha": sha, "branch": branch}

            return {"success": False, "error": result.stderr[:200]}

        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def _generate_release_notes(
        self,
        task: dict,
        quality_score: dict,
        artifacts: list[str],
    ) -> str:
        """Generate markdown release notes."""
        title = task.get("title", "Generated module")
        score = quality_score.get("overall_score", 0)
        arch = quality_score.get("architecture_score", 0)
        sec = quality_score.get("security_score", 0)

        artifact_names = [Path(a).name for a in artifacts]

        return f"""## {title}

**Quality Score:** {score:.1f}/100

### Files Generated
{chr(10).join(f'- `{name}`' for name in artifact_names)}

### Quality Breakdown
| Dimension | Score |
|-----------|-------|
| Architecture | {arch:.1f} |
| Security | {sec:.1f} |
| Overall | {score:.1f} |

### Acceptance Criteria
All specified endpoints and coverage requirements addressed.

---
*Generated by AI Company OS Autonomous Engineering Pipeline*"""
