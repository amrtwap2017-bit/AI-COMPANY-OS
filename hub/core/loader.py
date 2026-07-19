"""
Hub Core Module Loader
======================
Resolves numbered platform layers without broken digit imports.
"""
from __future__ import annotations
import importlib.util
import sys
from pathlib import Path
from typing import Any

_RESOLVED_MODULES: dict[str, Any] = {}

LAYER_MAP = {
    "foundation":     "00-FOUNDATION",
    "infrastructure": "01-INFRASTRUCTURE",
    "platform":       "02-PLATFORM",
    "knowledge":      "03-KNOWLEDGE",
    "vector":         "04-VECTOR",
    "memory":         "05-MEMORY",
    "agents":         "06-AGENTS",
    "execution":      "09-EXECUTION",
    "hub_impl":       "10-ENGINEERING-HUB",
    "observability":  "13-OBSERVABILITY",
    "knowledge_base": "20-KNOWLEDGE",
}

def get_root() -> Path:
    return Path(__file__).parents[2].resolve()

def _load_file(module_name: str, file_path: Path) -> Any:
    """Load a single .py file as a module."""
    if module_name in sys.modules:
        return sys.modules[module_name]
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    if not spec or not spec.loader:
        raise ImportError(f"Cannot load {file_path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod

def _load_directory(module_name: str, dir_path: Path) -> Any:
    """
    Load a directory as a module package.
    Recursively loads all .py files and subdirectories as attributes.
    """
    if module_name in sys.modules:
        return sys.modules[module_name]

    # Create a namespace module for the directory
    import types
    pkg = types.ModuleType(module_name)
    pkg.__path__ = [str(dir_path)]
    pkg.__package__ = module_name
    sys.modules[module_name] = pkg

    # Load all .py files as submodule attributes
    for py_file in sorted(dir_path.glob("*.py")):
        if py_file.name == "__init__.py":
            # Execute __init__.py in the package context
            spec = importlib.util.spec_from_file_location(module_name, str(py_file))
            if spec and spec.loader:
                spec.loader.exec_module(pkg)
            continue
        sub_name = py_file.stem
        full_name = f"{module_name}.{sub_name}"
        try:
            sub_mod = _load_file(full_name, py_file)
            setattr(pkg, sub_name, sub_mod)
        except Exception:
            pass  # Skip files that fail — do not block the whole layer

    # Load all subdirectories as nested packages
    for sub_dir in sorted(dir_path.iterdir()):
        if not sub_dir.is_dir():
            continue
        if sub_dir.name.startswith("__") or sub_dir.name.startswith("."):
            continue
        sub_pkg_name = f"{module_name}.{sub_dir.name}"
        try:
            sub_pkg = _load_directory(sub_pkg_name, sub_dir)
            setattr(pkg, sub_dir.name, sub_pkg)
        except Exception:
            pass

    return pkg

def platform_layer(layer_name: str) -> Any:
    """Load and return a platform layer by logical name."""
    if layer_name in _RESOLVED_MODULES:
        return _RESOLVED_MODULES[layer_name]

    if layer_name not in LAYER_MAP:
        raise ImportError(f"Unknown platform layer: '{layer_name}'")

    root = get_root()
    dir_name = LAYER_MAP[layer_name]
    layer_path = root / dir_name

    if not layer_path.exists():
        raise ImportError(f"Layer directory not found: {layer_path}")

    # Ensure __init__.py exists
    init_file = layer_path / "__init__.py"
    if not init_file.exists():
        init_file.touch()

    module_name = f"platform.{layer_name}"
    mod = _load_directory(module_name, layer_path)
    _RESOLVED_MODULES[layer_name] = mod
    return mod

def resolve_path(relative_path: str) -> str:
    """Convert a repo-relative path to absolute."""
    return str((get_root() / relative_path).resolve())

def get_foundation():     return platform_layer("foundation")
def get_infrastructure(): return platform_layer("infrastructure")
def get_platform():       return platform_layer("platform")
def get_agents():         return platform_layer("agents")
def get_execution():      return platform_layer("execution")
def get_memory():         return platform_layer("memory")
def get_vector():         return platform_layer("vector")
