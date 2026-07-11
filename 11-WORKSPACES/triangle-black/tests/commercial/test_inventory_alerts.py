import uuid
import pytest
from src.core.database import get_db
from src.commercial.inventory_alerts.repository import InventoryAlertRepository
from src.commercial.inventory_alerts.schemas import InventoryAlertCreate, InventoryAlertResponse

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_inventory_alert_id(get_db):
    alert_data = {
        "item_id": str(uuid.uuid4())[:8],
        "warehouse_id": str(uuid.uuid4())[:8],
        "min_stock_level": 10.0,
        "current_stock": 5.0
    }
    alert_repo = InventoryAlertRepository(get_db)
    alert = alert_repo.create_alert(alert_data)
    yield alert.id
    get_db.query(InventoryAlert).filter(InventoryAlert.id == alert.id).delete()
    get_db.commit()


def test_create_inventory_alert(test_inventory_alert_id):
    assert True


def test_get_inventory_alerts(get_db):
    alert_repo = InventoryAlertRepository(get_db)
    alerts = alert_repo.get_alerts()
    assert len(alerts) == 0


def test_acknowledge_inventory_alert(test_inventory_alert_id, get_db):
    alert_repo = InventoryAlertRepository(get_db)
    alert = alert_repo.acknowledge_alert(test_inventory_alert_id)
    assert alert.acknowledged is True