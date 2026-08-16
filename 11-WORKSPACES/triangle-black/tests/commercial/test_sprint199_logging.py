"""Sprint-199: Structured logging tests"""
import logging
import json
import io

def test_logging_config_importable():
    from src.core.logging_config import (
        get_logger, set_log_context, clear_log_context,
        get_log_context, TBJsonFormatter, setup_logging
    )
    assert callable(get_logger)
    assert callable(set_log_context)
    assert callable(clear_log_context)

def test_set_and_get_log_context():
    from src.core.logging_config import set_log_context, get_log_context, clear_log_context
    clear_log_context()
    set_log_context(request_id="req-123", hotel_id="hotel-001", actor="amr")
    ctx = get_log_context()
    assert ctx["request_id"] == "req-123"
    assert ctx["hotel_id"] == "hotel-001"
    assert ctx["actor"] == "amr"
    clear_log_context()

def test_clear_log_context():
    from src.core.logging_config import set_log_context, get_log_context, clear_log_context
    set_log_context(request_id="req-xyz", hotel_id="hotel-xyz")
    clear_log_context()
    ctx = get_log_context()
    assert ctx["request_id"] == ""
    assert ctx["hotel_id"] == ""

def test_json_formatter_produces_valid_json():
    from src.core.logging_config import TBJsonFormatter, set_log_context, clear_log_context
    clear_log_context()
    set_log_context(request_id="req-test", hotel_id="hotel-test")
    formatter = TBJsonFormatter()
    record = logging.LogRecord(
        name="test.logger", level=logging.INFO, pathname="", lineno=0,
        msg="Test message", args=(), exc_info=None
    )
    output = formatter.format(record)
    parsed = json.loads(output)
    assert parsed["msg"] == "Test message"
    assert parsed["level"] == "INFO"
    assert parsed["request_id"] == "req-test"
    assert parsed["hotel_id"] == "hotel-test"
    assert "ts" in parsed
    assert "logger" in parsed
    clear_log_context()

def test_json_formatter_includes_extra_fields():
    from src.core.logging_config import TBJsonFormatter, clear_log_context
    clear_log_context()
    formatter = TBJsonFormatter()
    record = logging.LogRecord(
        name="test", level=logging.WARNING, pathname="", lineno=0,
        msg="Work order processed", args=(), exc_info=None
    )
    record.wo_id = "wo-123"
    record.hotel_id = "hotel-abc"
    output = formatter.format(record)
    parsed = json.loads(output)
    assert parsed["wo_id"] == "wo-123"

def test_get_logger_returns_logger():
    from src.core.logging_config import get_logger
    logger = get_logger("tb.test.module")
    assert isinstance(logger, logging.Logger)
    assert logger.name == "tb.test.module"

def test_setup_logging_does_not_crash():
    from src.core.logging_config import setup_logging, _configured
    setup_logging(level="WARNING", json_format=False)

def test_context_is_empty_after_clear():
    from src.core.logging_config import set_log_context, clear_log_context, get_log_context
    set_log_context(request_id="a", hotel_id="b", actor="c")
    clear_log_context()
    ctx = get_log_context()
    assert all(v == "" for v in ctx.values())
