"""
Hub Core Kernel
===============
Central integration point for the AI Company OS platform.
"""
from __future__ import annotations
import os
from pathlib import Path
from .loader import platform_layer, resolve_path

__version__ = "2.0.0"
__component__ = "Hub OS Kernel"


class HubSettings:
    """Global Hub configuration from environment."""
    def __init__(self):
        self.root_path      = Path(resolve_path("."))
        self.workspace_base = Path(os.environ.get(
            "WORKSPACE_BASE_PATH",
            str(self.root_path / "11-WORKSPACES")
        ))
        self.debug          = os.environ.get("DEBUG", "false").lower() == "true"
        self.api_port       = int(os.environ.get("API_PORT", "8000"))
        self.database_url   = os.environ.get("DATABASE_URL", "")
        self.qdrant_host    = os.environ.get("QDRANT_HOST", "localhost")
        self.qdrant_port    = int(os.environ.get("QDRANT_PORT", "6333"))
        self.ollama_url     = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

settings = HubSettings()


class HubKernel:
    """
    Singleton kernel providing access to all platform subsystems.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return
        settings.workspace_base.mkdir(parents=True, exist_ok=True)
        self._initialized = True
        print(f"[{__component__}] v{__version__} initialized.")

    @property
    def intelligence(self):
        from hub.intelligence import intelligence as _intel
        return _intel

    @property
    def orchestrator(self):
        from hub.intelligence import intelligence as _intel
        return _intel

    @property
    def session_factory(self):
        from hub.session import HubSession
        return HubSession


kernel = HubKernel()

def get_kernel() -> HubKernel:
    if not kernel._initialized:
        kernel.initialize()
    return kernel
