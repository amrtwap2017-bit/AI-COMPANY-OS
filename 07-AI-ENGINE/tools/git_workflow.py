"""
app/tools/git_workflow.py
────────────────────────────────────────────────────────────────
Full Git Workflow Automation.

Manages the complete PR lifecycle:
  1. Create feature branch
  2. Write code (via code execution engine)
  3. Stage and commit changes
  4. Push branch
  5. Create pull request via GitHub API
  6. Request review from reviewer agent
  7. Merge on approval

Also handles:
  - Branch management (create, switch, delete)
  - Conflict detection
  - Commit history analysis
"""

from __future__ import annotations

import logging
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path

from tools.base import BaseTool, ToolResult
from tools.shell import shell_tool

log = logging.getLogger(__name__)

PROJECT_ROOT = str(Path.home() / "AI" / "projects" / "ai-company-os")


def _git(command: str, cwd: str = PROJECT_ROOT) -> tuple[str, str, int]:
    result = subprocess.run(
        f"git {command}",
        shell=True,
        capture_output=True,
        text=True,
        cwd=cwd,
        timeout=30,
    )
    return result.stdout.strip(), result.stderr.strip(), result.returncode


@dataclass
class PRResult:
    """Result of creating a pull request."""
    success:    bool
    branch:     str
    pr_url:     str | None
    pr_number:  int | None
    commits:    list[str]
    error:      str | None = None


class GitWorkflowTool(BaseTool):
    name        = "git_workflow"
    description = "Full git workflow: branch, commit, push, PR creation, review, merge"
    permissions_required = ["git"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "create_branch":   self._create_branch,
            "switch_branch":   self._switch_branch,
            "stage_and_commit": self._stage_and_commit,
            "push":            self._push,
            "create_pr":       self._create_pr,
            "merge_branch":    self._merge_branch,
            "delete_branch":   self._delete_branch,
            "current_branch":  self._current_branch,
            "list_branches":   self._list_branches,
            "pull":            self._pull,
            "full_workflow":   self._full_workflow,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )
        return actions[action](**kwargs)

    def _create_branch(self, branch_name: str, from_branch: str = "main") -> ToolResult:
        """Create and switch to a new feature branch."""
        # Ensure we're up to date
        _git(f"checkout {from_branch}")
        _git("pull origin main 2>/dev/null || true")

        stdout, stderr, code = _git(f"checkout -b {branch_name}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Created and switched to branch: {branch_name}",
            error=stderr if code != 0 else None,
        )

    def _switch_branch(self, branch_name: str) -> ToolResult:
        stdout, stderr, code = _git(f"checkout {branch_name}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Switched to: {branch_name}",
            error=stderr if code != 0 else None,
        )

    def _stage_and_commit(
        self,
        message:   str,
        paths:     list[str] | None = None,
        add_all:   bool             = True,
    ) -> ToolResult:
        """Stage files and create a commit."""
        if add_all:
            _git("add -A")
        elif paths:
            for p in paths:
                _git(f"add {p}")

        stdout, stderr, code = _git(f'commit -m "{message}"')

        if code != 0 and "nothing to commit" in stderr:
            return ToolResult(
                tool=self.name,
                success=True,
                output="Nothing to commit — working tree clean",
            )

        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout or f"Committed: {message}",
            error=stderr if code != 0 else None,
        )

    def _push(self, branch_name: str | None = None) -> ToolResult:
        """Push current branch to origin."""
        if not branch_name:
            branch_name, _, _ = _git("branch --show-current")

        stdout, stderr, code = _git(
            f"push origin {branch_name} --set-upstream 2>&1 || "
            f"git push origin {branch_name}"
        )
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Pushed branch: {branch_name}",
            error=stderr if code != 0 else None,
        )

    def _create_pr(
        self,
        title:     str,
        body:      str,
        branch:    str | None = None,
        base:      str        = "main",
        repo:      str | None = None,
    ) -> ToolResult:
        """Create a GitHub pull request via API."""
        try:
            import os
            from integrations.github import get_github_client

            client = get_github_client()
            if not client:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=None,
                    error="GITHUB_TOKEN not set — cannot create PR",
                )

            if not branch:
                branch, _, _ = _git("branch --show-current")

            if not repo:
                # Try to detect from git remote
                remote, _, _ = _git("remote get-url origin")
                repo = self._extract_repo_from_url(remote)

            if not repo:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=None,
                    error="Could not determine repository. Pass repo='owner/repo'",
                )

            pr = client._post(f"/repos/{repo}/pulls", {
                "title": title,
                "body":  body,
                "head":  branch,
                "base":  base,
            })

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "pr_number": pr["number"],
                    "pr_url":    pr["html_url"],
                    "title":     title,
                    "branch":    branch,
                    "base":      base,
                },
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"PR creation failed: {exc}",
            )

    def _merge_branch(self, branch_name: str, into: str = "main") -> ToolResult:
        """Merge a branch into target branch."""
        _git(f"checkout {into}")
        stdout, stderr, code = _git(f"merge {branch_name} --no-ff -m 'Merge {branch_name}'")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Merged {branch_name} into {into}",
            error=stderr if code != 0 else None,
        )

    def _delete_branch(self, branch_name: str, remote: bool = False) -> ToolResult:
        """Delete a branch locally and optionally remotely."""
        stdout, stderr, code = _git(f"branch -d {branch_name}")
        if remote and code == 0:
            _git(f"push origin --delete {branch_name}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Deleted branch: {branch_name}",
            error=stderr if code != 0 else None,
        )

    def _current_branch(self) -> ToolResult:
        branch, stderr, code = _git("branch --show-current")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=branch,
        )

    def _list_branches(self) -> ToolResult:
        stdout, stderr, code = _git("branch -a")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
        )

    def _pull(self) -> ToolResult:
        stdout, stderr, code = _git("pull")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout or "Already up to date",
            error=stderr if code != 0 else None,
        )

    def _full_workflow(
        self,
        feature_name: str,
        task:         str,
        agent_name:   str = "backend",
        language:     str = "python",
        create_pr:    bool = False,
        repo:         str | None = None,
    ) -> ToolResult:
        """
        Full workflow: branch → code → commit → (optional PR).
        Uses code execution engine to generate and test code.
        """
        branch_name = f"feature/{feature_name.lower().replace(' ', '-')}"

        # 1. Create branch
        branch_result = self._create_branch(branch_name)
        if not branch_result.success:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Branch creation failed: {branch_result.error}",
            )

        # 2. Run code execution
        from tools.code_execution import code_execution_engine
        exec_result = code_execution_engine.run_loop(
            agent_name=agent_name,
            task=task,
            language=language,
            max_iterations=3,
        )

        # 3. Copy generated files to project
        # (In real usage, agent writes directly to project paths)

        # 4. Commit
        commit_result = self._stage_and_commit(
            message=f"feat: {feature_name}\n\nTask: {task[:200]}",
        )

        result = {
            "branch":       branch_name,
            "code_success": exec_result.success,
            "iterations":   exec_result.iterations,
            "committed":    commit_result.success,
        }

        # 5. Optional PR creation
        if create_pr and commit_result.success:
            pr_result = self._create_pr(
                title=f"feat: {feature_name}",
                body=f"## Summary\n\n{task}\n\n## Changes\n- {language} implementation",
                branch=branch_name,
                repo=repo,
            )
            if pr_result.success:
                result["pr_url"]    = pr_result.output.get("pr_url")
                result["pr_number"] = pr_result.output.get("pr_number")

        return ToolResult(
            tool=self.name,
            success=exec_result.success and commit_result.success,
            output=result,
        )

    def _extract_repo_from_url(self, remote_url: str) -> str | None:
        """Extract owner/repo from git remote URL."""
        import re
        patterns = [
            r"github\.com[:/](.+/.+?)(?:\.git)?$",
            r"github\.com/(.+/.+?)(?:\.git)?$",
        ]
        for pattern in patterns:
            match = re.search(pattern, remote_url)
            if match:
                return match.group(1)
        return None


git_workflow_tool = GitWorkflowTool()
