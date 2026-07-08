from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from api.main import app
from infrastructure.db import engine, get_activity_repository
from domain.models.activity import Activity

DATABASE_URL = "sqlite+aiosqlite:///./test.db"
engine_test = create_async_engine(DATABASE_URL)
session_factory_test = sessionmaker(engine_test, expire_on_commit=False, class_=AsyncSession)

def override_get_session():
    async with session_factory_test() as session:
        yield session

app.dependency_overrides[get_activity_repository] = override_get_session

client = TestClient(app)

async def create_activities(session: AsyncSession):
    activities = [Activity(name=f"Activity {i}") for i in range(5)]
    session.add_all(activities)
    await session.commit()

@app.on_event("startup")
def startup():
    async with engine_test.begin() as conn:
        await conn.run_sync(Activity.__table__.drop_all)
        await conn.run_sync(Activity.__table__.create_all)
    await create_activities(session_factory_test())

@app.on_event("shutdown")
def shutdown():
    pass

async def test_get_activities_sorted_by_created_at_desc(client: TestClient):
    response = client.get("/activities")
    assert response.status_code == 200
    activities = response.json()
    assert len(activities) == 5
    for i in range(len(activities) - 1):
        assert activities[i]["created_at"] >= activities[i + 1]["created_at"]