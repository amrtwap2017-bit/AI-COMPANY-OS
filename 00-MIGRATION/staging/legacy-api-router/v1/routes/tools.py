from fastapi import APIRouter, HTTPException

from app.schemas.tools import ToolExecuteRequest, ToolExecuteResponse, ToolInfo
from app.tools.registry import tool_registry

router = APIRouter()


@router.get("/tools", response_model=list[ToolInfo])
def list_tools():
    """List all available tools."""
    return tool_registry.tool_info()


@router.get("/tools/agent/{agent_name}")
def agent_tools(agent_name: str):
    """List tools available to a specific agent."""
    tools = tool_registry.get_agent_tools(agent_name)
    return {
        "agent": agent_name,
        "tools": tools,
        "count": len(tools),
    }


@router.post("/tools/execute", response_model=ToolExecuteResponse)
def execute_tool(req: ToolExecuteRequest):
    """
    Execute a tool on behalf of an agent.
    Permission check is enforced automatically.
    """
    # Build kwargs from action + params
    kwargs = {}
    if req.action:
        kwargs["action"] = req.action
    kwargs.update(req.params)

    result = tool_registry.execute(
        tool_name=req.tool,
        agent_name=req.agent,
        **kwargs,
    )

    return ToolExecuteResponse(
        tool=result.tool,
        success=result.success,
        output=result.output,
        error=result.error,
        metadata=result.metadata,
    )


@router.get("/tools/{tool_name}/check/{agent_name}")
def check_permission(tool_name: str, agent_name: str):
    """Check if an agent has permission to use a tool."""
    allowed = tool_registry.can_use(agent_name, tool_name)
    return {
        "agent": agent_name,
        "tool": tool_name,
        "allowed": allowed,
    }
