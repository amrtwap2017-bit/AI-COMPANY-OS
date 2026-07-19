"""
app/integrations/github.py
────────────────────────────────────────────────────────────────
GitHub integration using the REST API.
Requires GITHUB_TOKEN environment variable.

Capabilities:
  - List repositories
  - Get file contents
  - Create/update files
  - List issues
  - Create issues
  - Get pull requests
"""

from __future__ import annotations

import logging
import httpx

log = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


class GitHubClient:

    def __init__(self, token: str) -> None:
        self._token   = token
        self._headers = {
            "Authorization": f"Bearer {token}",
            "Accept":        "application/vnd.github+json",
            "X-GitHub-API-Version": "2022-11-28",
        }

    def _get(self, path: str, params: dict | None = None) -> dict:
        url = f"{GITHUB_API}{path}"
        with httpx.Client(timeout=30) as client:
            r = client.get(url, headers=self._headers, params=params)
            r.raise_for_status()
            return r.json()

    def _post(self, path: str, data: dict) -> dict:
        url = f"{GITHUB_API}{path}"
        with httpx.Client(timeout=30) as client:
            r = client.post(url, headers=self._headers, json=data)
            r.raise_for_status()
            return r.json()

    def list_repos(self, per_page: int = 10) -> list[dict]:
        """List authenticated user's repositories."""
        repos = self._get("/user/repos", params={"per_page": per_page, "sort": "updated"})
        return [
            {
                "name":        r["name"],
                "full_name":   r["full_name"],
                "description": r.get("description", ""),
                "language":    r.get("language", ""),
                "stars":       r["stargazers_count"],
                "updated_at":  r["updated_at"],
            }
            for r in repos
        ]

    def get_file(self, repo: str, path: str, branch: str = "main") -> dict:
        """Get a file's content from a repository."""
        import base64
        data = self._get(f"/repos/{repo}/contents/{path}", params={"ref": branch})
        content = base64.b64decode(data["content"]).decode("utf-8")
        return {
            "path":    data["path"],
            "sha":     data["sha"],
            "content": content,
            "size":    data["size"],
        }

    def list_issues(self, repo: str, state: str = "open", per_page: int = 10) -> list[dict]:
        """List issues for a repository."""
        issues = self._get(
            f"/repos/{repo}/issues",
            params={"state": state, "per_page": per_page},
        )
        return [
            {
                "number": i["number"],
                "title":  i["title"],
                "state":  i["state"],
                "body":   (i.get("body") or "")[:200],
                "url":    i["html_url"],
            }
            for i in issues
            if "pull_request" not in i   # exclude PRs
        ]

    def create_issue(
        self,
        repo:   str,
        title:  str,
        body:   str,
        labels: list[str] | None = None,
    ) -> dict:
        """Create a new issue."""
        data: dict = {"title": title, "body": body}
        if labels:
            data["labels"] = labels

        issue = self._post(f"/repos/{repo}/issues", data)
        return {
            "number": issue["number"],
            "url":    issue["html_url"],
            "title":  issue["title"],
        }

    def get_user(self) -> dict:
        """Get authenticated user info."""
        user = self._get("/user")
        return {
            "login":      user["login"],
            "name":       user.get("name", ""),
            "email":      user.get("email", ""),
            "public_repos": user["public_repos"],
        }


def get_github_client() -> GitHubClient | None:
    """Get GitHub client from environment. Returns None if not configured."""
    import os
    token = os.getenv("GITHUB_TOKEN", "")
    if not token:
        return None
    return GitHubClient(token)
