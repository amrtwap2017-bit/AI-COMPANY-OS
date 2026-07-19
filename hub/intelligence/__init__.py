"""
Hub Intelligence Layer
======================
Exposes the Agent Orchestrator and Planning Engine.
"""
from __future__ import annotations
import importlib.util
import sys
from pathlib import Path
from uuid import UUID

ROOT = Path("/home/amr/AI-COMPANY-OS")


def _load_agent(filename: str):
    """Load an agent file from 06-AGENTS with proper isolation."""
    full = ROOT / "06-AGENTS" / filename
    # Use a clean unique key
    key = f"hub_agents.{filename.replace('.py', '')}"
    if key in sys.modules:
        return sys.modules[key]
    if not full.exists():
        raise ImportError(f"Agent not found: {full}")
    spec = importlib.util.spec_from_file_location(key, str(full))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[key] = mod
    spec.loader.exec_module(mod)
    return mod


class IntelligenceLayer:
    """Unified access to all AI agent capabilities."""

    def get_orchestrator(self, workspace_id: UUID, workspace_slug: str):
        """Returns an initialized AgentOrchestrator for a workspace."""
        # Load planner first since orchestrator imports it
        planner_mod = _load_agent("planner.py")
        
        # Patch the orchestrator module to find planner
        # The orchestrator does 'from .planner import PlannerAgent'
        # We pre-inject the planner module so importlib can resolve it
        orch_path = ROOT / "06-AGENTS" / "agent_orchestrator.py"
        orch_key = "hub_agents.agent_orchestrator"
        
        if orch_key in sys.modules:
            mod = sys.modules[orch_key]
        else:
            # Read and fix the source
            source = orch_path.read_text()
            # Replace the relative import with absolute reference
            fixed_source = source.replace(
                "from .planner import PlannerAgent",
                ""  # Remove the import line
            )
            # Add direct assignment after imports
            fixed_source = fixed_source.replace(
                "class AgentOrchestrator:",
                f"# Planner injected by Hub Intelligence Layer\n"
                f"class AgentOrchestrator:"
            )
            
            spec = importlib.util.spec_from_file_location(orch_key, str(orch_path))
            mod = importlib.util.module_from_spec(spec)
            sys.modules[orch_key] = mod
            
            # Inject PlannerAgent into the module namespace before exec
            mod.PlannerAgent = planner_mod.PlannerAgent
            
            # Compile the fixed source
            code = compile(fixed_source, str(orch_path), "exec")
            exec(code, mod.__dict__)

        return mod.AgentOrchestrator(workspace_id, workspace_slug)

    def get_planner(self):
        return _load_agent("planner.py").PlannerAgent()

    def get_developer(self):
        return _load_agent("developer.py").DeveloperAgent()

    def get_reviewer(self):
        return _load_agent("reviewer.py").ReviewerAgent()

    def get_security(self):
        return _load_agent("security.py").SecurityAgent()


intelligence = IntelligenceLayer()


def get_orchestrator(workspace_id: UUID, workspace_slug: str):
    """Module-level shortcut."""
    return intelligence.get_orchestrator(workspace_id, workspace_slug)
