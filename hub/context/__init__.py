from hub.core.loader import platform_layer
exec_mod = platform_layer("execution")

async def get_context(task_id, workspace_id, project_id):
    return await exec_mod.context_packs.build_context_pack(task_id, workspace_id, project_id)