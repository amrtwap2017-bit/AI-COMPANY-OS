from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from api.main import app
from infrastructure.repositories.item_repository import get_item_repo
from domain.models import Item

DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

def override_get_db():
    async with AsyncSessionLocal() as db:
        yield db

app.dependency_overrides[get_item_repo] = override_get_db

test_client = TestClient(app)

async def create_test_item(db: AsyncSession) -> Item:
    item_data = {
        "name": "Foo",
        "description": "The pretender",
        "price": 42.0,
        "tax": 3.2
    }
    item_service = ItemService(db)
    return await item_service.create_item(item_data)

def test_create_item(test_client):
    response = test_client.post('/items/', json={
        "name": "Foo",
        "description": "The pretender",
        "price": 42.0,
        "tax": 3.2
    })
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'Foo'
    assert data['description'] == 'The pretender'
    assert data['price'] == 42.0
    assert data['tax'] == 3.2

def test_get_item(test_client, create_test_item):
    item = await create_test_item(test_client)
    response = test_client.get(f'/items/{item.id}')
    assert response.status_code == 200
    data = response.json()
    assert data['id'] == item.id
    assert data['name'] == 'Foo'
    assert data['description'] == 'The pretender'
    assert data['price'] == 42.0
    assert data['tax'] == 3.2

def test_update_item(test_client, create_test_item):
    item = await create_test_item(test_client)
    response = test_client.put(f'/items/{item.id}', json={
        "name": "Bar",
        "description": "The real one",
        "price": 45.0,
        "tax": 3.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data['id'] == item.id
    assert data['name'] == 'Bar'
    assert data['description'] == 'The real one'
    assert data['price'] == 45.0
    assert data['tax'] == 3.5

def test_delete_item(test_client, create_test_item):
    item = await create_test_item(test_client)
    response = test_client.delete(f'/items/{item.id}')
    assert response.status_code == 204