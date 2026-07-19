"""
app/tools/browser.py
────────────────────────────────────────────────────────────────
Browser Automation Tool using Playwright.

Gives frontend agents the ability to:
  - Navigate to URLs
  - Take screenshots and describe what they see
  - Click elements, fill forms
  - Extract page content
  - Verify UI behavior

This closes the frontend loop:
  agent writes code → browser loads it → agent sees screenshot
  → agent identifies issues → agent fixes → repeat
"""

from __future__ import annotations

import base64
import logging
import time
from dataclasses import dataclass
from pathlib import Path

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

SCREENSHOTS_DIR = Path.home() / "AI" / "workspace" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_TIMEOUT = 30000   # ms


@dataclass
class PageState:
    url:          str
    title:        str
    content:      str      # visible text content
    screenshot:   str      # base64 encoded PNG
    screenshot_path: str


class BrowserTool(BaseTool):
    name        = "browser"
    description = (
        "Automate a browser: navigate, screenshot, click, fill forms. "
        "Gives frontend agents visual feedback on their work."
    )
    permissions_required = ["browser"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "screenshot":   self._screenshot,
            "navigate":     self._navigate,
            "click":        self._click,
            "fill":         self._fill,
            "get_content":  self._get_content,
            "verify":       self._verify,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}. Available: {list(actions.keys())}",
            )
        return actions[action](**kwargs)

    def _screenshot(self, url: str, wait_s: float = 2.0) -> ToolResult:
        """Navigate to URL and take a screenshot. Returns base64 image."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page(viewport={"width": 1280, "height": 720})
                page.goto(url, timeout=DEFAULT_TIMEOUT)
                time.sleep(wait_s)

                title       = page.title()
                screenshot  = page.screenshot(full_page=False)
                content     = page.inner_text("body")[:3000]

                browser.close()

            # Save screenshot
            ts      = int(time.time())
            ss_path = SCREENSHOTS_DIR / f"screenshot_{ts}.png"
            ss_path.write_bytes(screenshot)
            ss_b64  = base64.b64encode(screenshot).decode()

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "url":              url,
                    "title":            title,
                    "content_preview":  content[:500],
                    "screenshot_path":  str(ss_path),
                    "screenshot_b64":   ss_b64[:1000] + "...",  # truncate for display
                },
                metadata={
                    "url":   url,
                    "title": title,
                    "screenshot_path": str(ss_path),
                },
            )

        except ImportError:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error="playwright not installed. Run: pip install playwright && python3 -m playwright install chromium",
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Browser error: {exc}",
            )

    def _navigate(self, url: str, wait_selector: str | None = None) -> ToolResult:
        """Navigate and wait for a specific element."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page()
                page.goto(url, timeout=DEFAULT_TIMEOUT)

                if wait_selector:
                    page.wait_for_selector(wait_selector, timeout=DEFAULT_TIMEOUT)

                title   = page.title()
                content = page.inner_text("body")[:5000]
                browser.close()

            return ToolResult(
                tool=self.name,
                success=True,
                output={"url": url, "title": title, "content": content},
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(exc)
            )

    def _click(self, url: str, selector: str) -> ToolResult:
        """Navigate to URL and click an element."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page()
                page.goto(url, timeout=DEFAULT_TIMEOUT)
                page.click(selector)
                time.sleep(1)

                title   = page.title()
                content = page.inner_text("body")[:2000]
                browser.close()

            return ToolResult(
                tool=self.name,
                success=True,
                output={"clicked": selector, "new_title": title, "content": content},
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(exc)
            )

    def _fill(self, url: str, fields: dict[str, str]) -> ToolResult:
        """Fill form fields and optionally submit."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page()
                page.goto(url, timeout=DEFAULT_TIMEOUT)

                filled = []
                for selector, value in fields.items():
                    page.fill(selector, value)
                    filled.append(selector)

                time.sleep(0.5)
                content = page.inner_text("body")[:2000]
                browser.close()

            return ToolResult(
                tool=self.name,
                success=True,
                output={"filled_fields": filled, "page_content": content},
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(exc)
            )

    def _get_content(self, url: str, selector: str = "body") -> ToolResult:
        """Extract text content from a page or element."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page()
                page.goto(url, timeout=DEFAULT_TIMEOUT)
                time.sleep(1)

                content = page.inner_text(selector)[:5000]
                browser.close()

            return ToolResult(
                tool=self.name,
                success=True,
                output={"url": url, "selector": selector, "content": content},
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(exc)
            )

    def _verify(self, url: str, assertions: list[str]) -> ToolResult:
        """
        Verify that certain text/elements exist on a page.
        assertions: list of strings that must appear in page content
        """
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page    = browser.new_page()
                page.goto(url, timeout=DEFAULT_TIMEOUT)
                time.sleep(1)

                content  = page.inner_text("body")
                browser.close()

            results = {}
            all_passed = True
            for assertion in assertions:
                found = assertion.lower() in content.lower()
                results[assertion] = found
                if not found:
                    all_passed = False

            return ToolResult(
                tool=self.name,
                success=all_passed,
                output={
                    "url":        url,
                    "assertions": results,
                    "all_passed": all_passed,
                },
                error=None if all_passed else f"Failed assertions: {[k for k,v in results.items() if not v]}",
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(exc)
            )


browser_tool = BrowserTool()
