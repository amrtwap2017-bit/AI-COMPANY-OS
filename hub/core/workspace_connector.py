import os
from uuid import UUID
from hub.core import settings

def get_workspace_root(slug: str) -> str:
    """Returns the absolute path to the physical workspace folder."""
    return os.path.join(settings.workspace_base, slug)

def get_artifact_path(slug: str, artifact_name: str) -> str:
    """Returns path to a generated engineering artifact."""
    return os.path.join(get_workspace_root(slug), "artifacts", artifact_name)