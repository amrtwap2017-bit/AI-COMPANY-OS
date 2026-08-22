"""
Sprint N-009: Design System 3.0 Component Verification Test
"""
import pytest
from pathlib import Path

def test_button_and_input_comply_with_tbdl3():
    btn_path = Path("portal/components/ui/Button.tsx")
    inp_path = Path("portal/components/ui/Input.tsx")

    assert btn_path.exists(), "Button.tsx does not exist"
    assert inp_path.exists(), "Input.tsx does not exist"

    # Ensure no inline style patterns
    for path in [btn_path, inp_path]:
        text = path.read_text()
        assert "style={{" not in text, f"Inline styles found inside {path.name}"
        assert "className=" in text, f"Component {path.name} missing standard styling class mappings"
