"""
Tool Registry
─────────────────────────────────────────────────────
Central registry for all tools.
Manages tool discovery, permission checking,
and unified execution interface.
"""

from tools.base import BaseTool, ToolResult
from tools.filesystem import filesystem_tool
from tools.shell import shell_tool
from tools.git import git_tool
from tools.docker import docker_tool
from tools.postgres import postgres_tool
from tools.python      import python_tool
from tools.web_search  import web_search_tool
from tools.web_scraper       import web_scraper_tool
from tools.deep_research     import deep_research_tool
from tools.math_calculator   import math_calculator_tool
from tools.knowledge_synthesizer import knowledge_synthesizer_tool
from tools.code_validator    import code_validator_tool
from tools.dep_analyzer      import dep_analyzer_tool
from tools.api_tester        import api_tester_tool
from tools.system_monitor    import system_monitor_tool
from tools.db_inspector      import db_inspector_tool
from tools.log_reader        import log_reader_tool
from tools.context_manager   import context_manager_tool
from tools.self_debugger     import self_debugger_tool
from tools.semantic_diff     import semantic_diff_tool
from tools.collab_router     import collab_router_tool
from tools.quality_scorer    import quality_scorer_tool
from tools.mutation_tester   import mutation_tester_tool
from tools.code_execution    import code_execution_engine
from tools.tdd_engine        import tdd_engine
from tools.browser           import browser_tool
from tools.git_workflow      import git_workflow_tool

# ── Tool Registry ─────────────────────────────────────
TOOLS: dict[str, BaseTool] = {
    "filesystem":    filesystem_tool,
    "shell":         shell_tool,
    "git":           git_tool,
    "docker":        docker_tool,
    "postgres":      postgres_tool,
    "python":        python_tool,
    "web_search":    web_search_tool,
    "web_scraper":   web_scraper_tool,
    "browser":            browser_tool,
    "git_workflow":       git_workflow_tool,
    "deep_research":      deep_research_tool,
    "math_calculator":    math_calculator_tool,
    "knowledge_synth":    knowledge_synthesizer_tool,
    "code_validator":     code_validator_tool,
    "dep_analyzer":       dep_analyzer_tool,
    "api_tester":         api_tester_tool,
    "system_monitor":     system_monitor_tool,
    "db_inspector":       db_inspector_tool,
    "log_reader":         log_reader_tool,
    "context_manager":    context_manager_tool,
    "self_debugger":      self_debugger_tool,
    "semantic_diff":      semantic_diff_tool,
    "collab_router":      collab_router_tool,
    "quality_scorer":     quality_scorer_tool,
    "mutation_tester":    mutation_tester_tool,
}

# ── Agent Permission Map ──────────────────────────────
# Defines which tools each agent type can use
AGENT_PERMISSIONS: dict[str, list[str]] = {
    "ceo":               ["filesystem", "git"],
    "cto":               ["filesystem", "git", "shell", "docker", "postgres"],
    "architect":         ["filesystem", "git", "shell", "db_inspector", "dep_analyzer", "quality_scorer", "collab_router"],
    "backend":           ["filesystem", "git", "shell", "postgres", "python", "git_workflow", "code_validator", "dep_analyzer", "api_tester", "self_debugger", "quality_scorer"],
    "frontend":          ["filesystem", "git", "shell", "browser", "git_workflow", "api_tester", "quality_scorer"],
    "devops":            ["filesystem", "git", "shell", "docker", "git_workflow", "system_monitor", "dep_analyzer", "log_reader", "api_tester"],
    "tester":            ["filesystem", "git", "shell", "python", "postgres", "browser", "api_tester", "code_validator", "mutation_tester", "quality_scorer"],
    "reviewer":          ["filesystem", "git", "code_validator", "dep_analyzer", "semantic_diff", "quality_scorer"],
    "researcher":        ["filesystem", "postgres", "web_search", "web_scraper", "deep_research", "math_calculator", "knowledge_synth"],
    "analyst":           ["postgres", "python", "web_search", "math_calculator", "db_inspector", "deep_research"],
    "planner":           ["filesystem", "math_calculator", "collab_router"],
    "writer":            ["filesystem", "web_search", "knowledge_synth", "quality_scorer"],
    "knowledge_manager": ["filesystem", "postgres", "web_search", "web_scraper", "knowledge_synth", "db_inspector"],
    "developer":         ["filesystem", "git", "shell", "python", "git_workflow", "code_validator", "api_tester", "self_debugger", "quality_scorer"],
    "prompt_engineer":   ["filesystem"],
    "evaluator":         ["postgres"],
}


class ToolRegistry:

    def get(self, tool_name: str) -> BaseTool | None:
        return TOOLS.get(tool_name)

    def list_tools(self) -> list[str]:
        return list(TOOLS.keys())

    def get_agent_tools(self, agent_name: str) -> list[str]:
        return AGENT_PERMISSIONS.get(agent_name, [])

    def can_use(self, agent_name: str, tool_name: str) -> bool:
        allowed = self.get_agent_tools(agent_name)
        return tool_name in allowed

    def execute(
        self,
        tool_name: str,
        agent_name: str,
        **kwargs,
    ) -> ToolResult:
        """
        Execute a tool with permission check.
        """
        # Permission check
        if not self.can_use(agent_name, tool_name):
            return ToolResult(
                tool=tool_name,
                success=False,
                output=None,
                error=(
                    f"Agent '{agent_name}' does not have permission "
                    f"to use tool '{tool_name}'"
                ),
            )

        # Get tool
        tool = self.get(tool_name)
        if not tool:
            return ToolResult(
                tool=tool_name,
                success=False,
                output=None,
                error=f"Tool '{tool_name}' not found in registry",
            )

        # Execute safely
        return tool.safe_run(**kwargs)

    def tool_info(self) -> list[dict]:
        return [
            {
                "name": name,
                "description": tool.description,
                "permissions_required": tool.permissions_required,
            }
            for name, tool in TOOLS.items()
        ]


tool_registry = ToolRegistry()
