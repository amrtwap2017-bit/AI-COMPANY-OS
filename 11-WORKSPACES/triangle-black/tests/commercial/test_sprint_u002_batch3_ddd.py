"""
Tests for Sprint U-002: DDD Batch 3 Expansion
Covers: analytics_kpi, analytics_platform, ai_signals, ai_scheduling
"""
import pytest
from pathlib import Path

SRC = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial")

def test_analytics_kpi_ddd_structure():
    assert (SRC / "analytics_kpi/schemas.py").exists()
    assert (SRC / "analytics_kpi/repository.py").exists()
    assert (SRC / "analytics_kpi/service.py").exists()

def test_analytics_platform_ddd_structure():
    assert (SRC / "analytics_platform/schemas.py").exists()
    assert (SRC / "analytics_platform/repository.py").exists()
    assert (SRC / "analytics_platform/service.py").exists()

def test_ai_signals_ddd_structure():
    assert (SRC / "ai_signals/schemas.py").exists()
    assert (SRC / "ai_signals/repository.py").exists()
    assert (SRC / "ai_signals/service.py").exists()

def test_ai_scheduling_ddd_structure():
    assert (SRC / "ai_scheduling/schemas.py").exists()
    assert (SRC / "ai_scheduling/repository.py").exists()
    assert (SRC / "ai_scheduling/service.py").exists()

def test_analytics_kpi_service_methods():
    from src.commercial.analytics_kpi.service import AnalyticsKPIService
    assert hasattr(AnalyticsKPIService, "get_enterprise_overview")

def test_analytics_platform_service_methods():
    from src.commercial.analytics_platform.service import AnalyticsPlatformService
    assert hasattr(AnalyticsPlatformService, "get_platform_scorecards")

def test_ai_signals_service_methods():
    from src.commercial.ai_signals.service import AISignalsService
    assert hasattr(AISignalsService, "generate_signals")

def test_ai_scheduling_service_methods():
    from src.commercial.ai_scheduling.service import AISchedulingService
    assert hasattr(AISchedulingService, "get_daily_capacity_plan")
