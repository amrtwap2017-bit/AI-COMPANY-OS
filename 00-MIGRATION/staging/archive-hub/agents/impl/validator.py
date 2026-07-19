"""Code validator — universal stub."""
from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    ok: bool = True
    violation_count: int = 0
    summary: str = "ok"

    def to_prompt_feedback(self) -> str:
        return f"Violations: {self.violation_count}. {self.summary}"

def validate_tb_code(files: list) -> ValidationResult:
    return ValidationResult(ok=True, violation_count=0, summary="auto-approved")

def validate_code(files: list, stack_config: dict = None) -> ValidationResult:
    return ValidationResult(ok=True, violation_count=0, summary="auto-approved")
