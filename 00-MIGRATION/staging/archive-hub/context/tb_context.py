"""TB context — replaced by universal stack_detector. Kept for import compat."""
from dataclasses import dataclass, field

@dataclass
class TBContext:
    prompt_prefix: str = ""
    module_folder: str = ""
    entity: str = ""

def build_tb_context(module_folder: str = "", entity: str = "") -> TBContext:
    return TBContext(prompt_prefix="", module_folder=module_folder, entity=entity)
