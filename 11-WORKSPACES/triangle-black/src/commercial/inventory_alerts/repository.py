from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import InventoryAlert

class InventoryAlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_alert(self, alert_data: dict):
        alert = InventoryAlert(**alert_data)
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_alerts(self):
        return self.db.query(InventoryAlert).all()

    def acknowledge_alert(self, alert_id: int):
        alert = self.db.query(InventoryAlert).filter(InventoryAlert.id == alert_id).first()
        if alert:
            alert.acknowledged = True
            self.db.commit()
        return alert
