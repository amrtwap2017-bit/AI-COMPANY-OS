"""Shared router base utilities."""
from __future__ import annotations
import importlib.util
import sys
from pathlib import Path

# Hard-coded absolute root — eliminates all parent-counting errors
ROOT = Path("/home/amr/AI-COMPANY-OS")

def load_platform_file(relative_path: str):
    """Load any platform file by path relative to AI-COMPANY-OS root."""
    full_path = ROOT / relative_path
    module_key = relative_path.replace("/", ".").replace("-", "_").replace(".py", "")

    if module_key in sys.modules:
        return sys.modules[module_key]

    if not full_path.exists():
        raise FileNotFoundError(f"Platform file not found: {full_path}")

    spec = importlib.util.spec_from_file_location(module_key, str(full_path))
    if not spec or not spec.loader:
        raise ImportError(f"Cannot create spec for: {full_path}")

    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_key] = mod
    spec.loader.exec_module(mod)
    return mod
