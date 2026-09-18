"""Request Correlation Context Tests."""

def test_request_id_generation():
    from src.core.request_context import RequestContextMiddleware
    assert RequestContextMiddleware is not None

def test_get_request_id_default():
    from src.core.request_context import get_current_request_id
    # Outside request context, should return None
    result = get_current_request_id()
    assert result is None

def test_context_var_available():
    from src.core.request_context import _request_id_var
    token = _request_id_var.set("test-req-123")
    from src.core.request_context import get_current_request_id
    assert get_current_request_id() == "test-req-123"
    _request_id_var.reset(token)
    assert get_current_request_id() is None
