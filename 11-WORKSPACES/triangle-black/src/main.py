"""
Triangle Black — Main FastAPI Application
Hotel Engineering Platform
"""
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.database import check_connection, engine
from src.core.base import Base

# Import all models so Base knows about them before create_all
from src.commercial.lead_management import models as lead_models
from src.commercial.agent_management import models as agent_models
from src.commercial.pipeline_dashboard import models as pipeline_models
from src.commercial.activity_tracking import models as activity_models
from src.commercial.search_filters import models as search_models
from src.commercial.webhook_notifications import models as webhook_models
from src.commercial.quotation import models as quotation_models
from src.commercial.auth import models as auth_models
from src.commercial.reporting import models as reporting_models

# Import all routers
from src.commercial.lead_management.router import router as leads_router
from src.commercial.agent_management.router import router as agents_router
from src.commercial.pipeline_dashboard.router import router as pipeline_router
from src.commercial.activity_tracking.router import router as activity_router
from src.commercial.search_filters.router import router as search_router
from src.commercial.webhook_notifications.router import router as webhook_router
from src.commercial.quotation.router import router as quotation_router
from src.commercial.auth.router import router as auth_router
from src.commercial.reporting.router import router as reporting_router

# Business logic actions router
from src.core.actions import router as actions_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Triangle Black API",
    description="Hotel Engineering Platform — Commercial Domain",
    version="0.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

# CRUD routers
app.include_router(leads_router,    prefix=API_PREFIX)
app.include_router(agents_router,   prefix=API_PREFIX)
app.include_router(pipeline_router, prefix=API_PREFIX)
app.include_router(activity_router, prefix=API_PREFIX)
app.include_router(search_router,   prefix=API_PREFIX)
app.include_router(webhook_router,  prefix=API_PREFIX)
app.include_router(quotation_router,prefix=API_PREFIX)
app.include_router(auth_router,     prefix=API_PREFIX)
app.include_router(reporting_router,prefix=API_PREFIX)

# Business action routers
app.include_router(actions_router,  prefix=API_PREFIX)


@app.get("/health")
def health():
    db_ok = check_connection()
    return {
        "ok": db_ok,
        "service": "triangle-black-api",
        "version": "0.5.0",
        "database": "connected" if db_ok else "unreachable",
    }


@app.get("/")
def root():
    return {
        "service": "Triangle Black API",
        "version": "0.5.0",
        "docs": "/docs",
        "health": "/health",
        "business_actions": [
            f"{API_PREFIX}/actions/leads/{{id}}/qualify",
            f"{API_PREFIX}/actions/leads/{{id}}/assign",
            f"{API_PREFIX}/actions/leads/{{id}}/quote",
            f"{API_PREFIX}/actions/leads/{{id}}/timeline",
            f"{API_PREFIX}/actions/quotes/{{id}}/submit",
            f"{API_PREFIX}/actions/quotes/{{id}}/send",
            f"{API_PREFIX}/actions/quotes/{{id}}/approve",
            f"{API_PREFIX}/actions/quotes/{{id}}/reject",
            f"{API_PREFIX}/actions/pipeline/summary",
            f"{API_PREFIX}/actions/reports/dashboard",
        ],
    }
