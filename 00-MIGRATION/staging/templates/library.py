"""
app/templates/library.py
────────────────────────────────────────────────────────────────
Project Template Library.

Pre-defined templates for common application types.
Each template specifies:
  - Project structure (directories + files)
  - Tech stack (backend + frontend + database)
  - Initial agent tasks to scaffold the project
  - Dependencies to install

Supported templates:
  fastapi_react_saas     Full-stack SaaS with auth + billing
  fastapi_api            REST API only
  nextjs_app             Next.js frontend only
  python_cli             Python CLI tool
  python_library         Python package/library
  microservice           Docker microservice
  data_pipeline          ETL/data processing pipeline
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class FileTemplate:
    """One file in the project template."""
    path:    str
    content: str    # can contain {project_name}, {description} etc.


@dataclass
class ProjectTemplate:
    """Complete project template definition."""
    id:           str
    name:         str
    description:  str
    tech_stack:   dict[str, str]    # component → technology
    directories:  list[str]
    files:        list[FileTemplate]
    install_cmds: list[str]         # setup commands to run
    agent_tasks:  list[str]         # tasks for agents to complete


# ── Templates ─────────────────────────────────────────────────

TEMPLATES: dict[str, ProjectTemplate] = {

    "fastapi_react_saas": ProjectTemplate(
        id="fastapi_react_saas",
        name="FastAPI + React SaaS",
        description="Full-stack SaaS with authentication, dashboard, and API",
        tech_stack={
            "backend":  "FastAPI + SQLAlchemy + PostgreSQL",
            "frontend": "Next.js 14 + TypeScript + Tailwind",
            "auth":     "JWT + bcrypt",
            "deploy":   "Docker + Nginx",
        },
        directories=[
            "backend/app/api",
            "backend/app/models",
            "backend/app/services",
            "backend/tests",
            "frontend/app",
            "frontend/components",
            "frontend/lib",
            "docker",
        ],
        files=[
            FileTemplate(
                path="backend/main.py",
                content="""from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="{project_name}", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {{"name": "{project_name}", "version": "0.1.0"}}

@app.get("/health")
def health():
    return {{"status": "healthy"}}
""",
            ),
            FileTemplate(
                path="backend/requirements.txt",
                content="fastapi\nuvicorn\nsqlalchemy\npsycopg[binary]\npython-jose\nbcrypt\npython-multipart\n",
            ),
            FileTemplate(
                path="frontend/app/page.tsx",
                content="""export default function Home() {{
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">{project_name}</h1>
      <p className="mt-4 text-gray-600">{description}</p>
    </main>
  );
}}
""",
            ),
            FileTemplate(
                path="docker/docker-compose.yml",
                content="""version: "3.9"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: {project_name}
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${{POSTGRES_PASSWORD}}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ../backend
    environment:
      DATABASE_URL: postgresql://app:${{POSTGRES_PASSWORD}}@postgres:5432/{project_name}
    depends_on:
      - postgres
    ports:
      - "8000:8000"

  frontend:
    build: ../frontend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
""",
            ),
            FileTemplate(
                path="README.md",
                content="# {project_name}\n\n{description}\n\n## Quick Start\n\n```bash\ncd docker && docker compose up\n```\n",
            ),
        ],
        install_cmds=[
            "cd backend && pip install -r requirements.txt",
            "cd frontend && npm install",
        ],
        agent_tasks=[
            "Design the database schema with User, Session, and core business entities",
            "Implement JWT authentication: register, login, refresh token endpoints",
            "Create the main dashboard page with metrics and navigation",
            "Add API rate limiting and input validation",
            "Write integration tests for all API endpoints",
        ],
    ),

    "fastapi_api": ProjectTemplate(
        id="fastapi_api",
        name="FastAPI REST API",
        description="Production-ready REST API with authentication and database",
        tech_stack={
            "framework": "FastAPI",
            "database":  "PostgreSQL + SQLAlchemy",
            "auth":      "JWT",
            "testing":   "pytest",
        },
        directories=[
            "app/api/v1/routes",
            "app/models/db",
            "app/services",
            "app/repositories",
            "tests",
        ],
        files=[
            FileTemplate(
                path="main.py",
                content="from fastapi import FastAPI\n\napp = FastAPI(title='{project_name}')\n",
            ),
            FileTemplate(
                path="requirements.txt",
                content="fastapi\nuvicorn\nsqlalchemy\npsycopg[binary]\npython-jose\nbcrypt\npytest\nhttpx\n",
            ),
        ],
        install_cmds=["pip install -r requirements.txt"],
        agent_tasks=[
            "Design and implement the core data models",
            "Create CRUD endpoints for all main resources",
            "Add authentication middleware",
            "Write comprehensive API tests",
        ],
    ),

    "nextjs_app": ProjectTemplate(
        id="nextjs_app",
        name="Next.js Application",
        description="Modern React application with TypeScript and Tailwind",
        tech_stack={
            "framework": "Next.js 14",
            "language":  "TypeScript",
            "styling":   "Tailwind CSS",
            "state":     "React hooks + Context",
        },
        directories=[
            "app", "components", "lib", "public", "types",
        ],
        files=[
            FileTemplate(path="package.json", content='{{"name":"{project_name}","version":"0.1.0","scripts":{{"dev":"next dev","build":"next build"}}}}'),
            FileTemplate(path="app/page.tsx", content="export default function Home() {{ return <main><h1>{project_name}</h1></main>; }}\n"),
        ],
        install_cmds=["npm install"],
        agent_tasks=[
            "Design the component architecture and routing structure",
            "Build the main layout with navigation",
            "Create the core feature pages",
            "Add API client and data fetching",
        ],
    ),

    "python_cli": ProjectTemplate(
        id="python_cli",
        name="Python CLI Tool",
        description="Command-line tool with rich output and configuration",
        tech_stack={
            "framework": "Click or Typer",
            "output":    "Rich",
            "config":    "pydantic-settings",
        },
        directories=["src", "tests", "docs"],
        files=[
            FileTemplate(path="src/cli.py", content="import typer\n\napp = typer.Typer()\n\n@app.command()\ndef main():\n    print('Hello from {project_name}')\n\nif __name__ == '__main__':\n    app()\n"),
            FileTemplate(path="requirements.txt", content="typer\nrich\npydantic-settings\npytest\n"),
        ],
        install_cmds=["pip install -r requirements.txt"],
        agent_tasks=[
            "Design the CLI command structure and arguments",
            "Implement all commands with proper help text",
            "Add configuration file support",
            "Write tests for all commands",
        ],
    ),

    "python_library": ProjectTemplate(
        id="python_library",
        name="Python Library",
        description="Reusable Python package with tests and documentation",
        tech_stack={
            "package":  "setuptools / pyproject.toml",
            "testing":  "pytest",
            "docs":     "mkdocs",
            "ci":       "GitHub Actions",
        },
        directories=["src/{project_name}", "tests", "docs"],
        files=[
            FileTemplate(path="pyproject.toml", content='[project]\nname="{project_name}"\nversion="0.1.0"\n'),
            FileTemplate(path="src/{project_name}/__init__.py", content='"""{{project_name}} - {description}"""\n__version__ = "0.1.0"\n'),
            FileTemplate(path="tests/test_core.py", content="def test_import():\n    import {project_name}\n    assert {project_name}.__version__\n"),
        ],
        install_cmds=["pip install -e '.[dev]'"],
        agent_tasks=[
            "Design the public API surface and module structure",
            "Implement core functionality with type hints",
            "Write comprehensive docstrings",
            "Create usage examples and tests",
        ],
    ),

    "microservice": ProjectTemplate(
        id="microservice",
        name="Docker Microservice",
        description="Containerized microservice with health checks and metrics",
        tech_stack={
            "framework": "FastAPI",
            "container": "Docker",
            "messaging": "REST API",
            "monitoring": "Prometheus metrics",
        },
        directories=["app", "tests"],
        files=[
            FileTemplate(path="main.py", content="from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/health')\ndef health(): return {{'status':'ok'}}\n"),
            FileTemplate(path="Dockerfile", content="FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ['uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000']\n"),
        ],
        install_cmds=["docker build -t {project_name} ."],
        agent_tasks=[
            "Design the service API contract",
            "Implement all service endpoints",
            "Add health check and metrics endpoints",
            "Write integration tests",
            "Optimize the Docker image",
        ],
    ),
}


def get_template(template_id: str) -> ProjectTemplate | None:
    return TEMPLATES.get(template_id)


def list_templates() -> list[dict]:
    return [
        {
            "id":          t.id,
            "name":        t.name,
            "description": t.description,
            "tech_stack":  t.tech_stack,
        }
        for t in TEMPLATES.values()
    ]


TEMPLATES["data_pipeline"] = ProjectTemplate(
    id="data_pipeline",
    name="Data Pipeline",
    description="ETL data processing pipeline with scheduling and monitoring",
    tech_stack={
        "processing": "Python + pandas",
        "scheduling":  "cron / APScheduler",
        "storage":     "PostgreSQL",
        "monitoring":  "logging + metrics",
    },
    directories=["src/extractors", "src/transformers", "src/loaders", "tests", "config"],
    files=[
        FileTemplate(
            path="src/pipeline.py",
            content=(
                "import logging\n"
                "from datetime import datetime\n\n"
                "log = logging.getLogger(__name__)\n\n"
                "class Pipeline:\n"
                "    def __init__(self, name: str):\n"
                "        self.name = name\n\n"
                "    def run(self):\n"
                "        log.info(f'Pipeline {self.name} started')\n"
                "        self._extract()\n"
                "        self._transform()\n"
                "        self._load()\n\n"
                "    def _extract(self): raise NotImplementedError\n"
                "    def _transform(self): raise NotImplementedError\n"
                "    def _load(self): raise NotImplementedError\n"
            ),
        ),
        FileTemplate(
            path="requirements.txt",
            content="pandas\nsqlalchemy\npsycopg[binary]\npytest\n",
        ),
    ],
    install_cmds=["pip install -r requirements.txt"],
    agent_tasks=[
        "Design the data schema and transformation logic",
        "Implement extractor for the data source",
        "Write transformation and validation rules",
        "Implement loader with upsert logic",
        "Write pipeline tests with sample data",
    ],
)
