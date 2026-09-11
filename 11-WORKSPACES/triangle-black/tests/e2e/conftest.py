"""
E2E Golden Journey Test Configuration
These tests require a running Triangle Black server on port 8030.
Run: bash ~/tb-start.sh before executing.
"""
import pytest

def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "golden_journey: marks tests as E2E golden journey tests"
    )
