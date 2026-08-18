"""
Triangle Black — Router Registry
SPRINT-005: Centralized safe router registration

Architecture:
  Instead of scattered app.include_router() calls in main.py,
  all routers should eventually register here via register_router().
  This prevents try-block corruption and provides a single audit point.

Usage:
  from src.router_registry import RouterRegistry
  registry = RouterRegistry(app)
  registry.register("src.commercial.invoices.router", prefix="/api/v1")

Migration status: IN PROGRESS
  Phase 1 (SPRINT-005): Infrastructure + first 10 routers documented
  Phase 2 (SPRINT-006+): Systematic migration of remaining 62 routers
"""
from __future__ import annotations
from typing import Optional
from importlib import import_module
import logging

logger = logging.getLogger("tb.router_registry")


class RouterRegistry:
    """
    Safe centralized router registration for Triangle Black.
    Each router is imported and registered independently.
    Failure of one router does not prevent others from loading.
    """

    def __init__(self, app):
        self.app = app
        self._registered: list[str] = []
        self._failed: list[str] = []

    def register(
        self,
        import_path: str,
        router_attr: str = "router",
        prefix: Optional[str] = "/api/v1",
        label: Optional[str] = None,
        tags: Optional[list] = None,
    ) -> bool:
        """
        Safely import and register one router.
        Returns True on success, False on failure.
        Never raises — failure is logged and skipped.
        """
        name = label or import_path.split(".")[-2]
        try:
            module = import_module(import_path)
            router = getattr(module, router_attr)
            kwargs = {}
            if prefix is not None:
                kwargs["prefix"] = prefix
            if tags:
                kwargs["tags"] = tags
            self.app.include_router(router, **kwargs)
            self._registered.append(name)
            logger.debug(f"OK: {name}")
            return True
        except Exception as e:
            self._failed.append(name)
            logger.warning(f"WARN: {name} failed to register: {e}")
            return False

    def register_many(self, routers: list[dict]) -> dict:
        """
        Register multiple routers from a list of config dicts.
        Each dict: {import_path, router_attr?, prefix?, label?, tags?}
        Returns summary.
        """
        for r in routers:
            self.register(
                import_path=r["import_path"],
                router_attr=r.get("router_attr", "router"),
                prefix=r.get("prefix", "/api/v1"),
                label=r.get("label"),
                tags=r.get("tags"),
            )
        return {
            "registered": len(self._registered),
            "failed": len(self._failed),
            "registered_list": self._registered,
            "failed_list": self._failed,
        }

    @property
    def summary(self) -> dict:
        return {
            "registered": len(self._registered),
            "failed": len(self._failed),
        }
