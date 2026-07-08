import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from infrastructure.db.models import Base, session_factory
from api.routers.workload import router

DATABASE_URL = "sqlite+aiosqlite:///./test.db"
engine = create_async_engine(DATABASE_URL, connect_args={"check_same_thread": False})
session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def override_get_db():
    async with session_factory() as db:
        yield db

@pytest.fixture(scope="module")
def client():
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[session_factory] = override_get_db
    with TestClient(app) as c:
        yield c

async def test_assign_lead(client):
    response = await client.post("/assign_lead", json={"agent_id": 1, "max_leads": 5})
    assert response.status_code == 200
    assert response.json() == True

    response = await client.post("/assign_lead", json={"agent_id": 1, "max_leads": 5})
    assert response.status_code == 200
    assert response.json() == False