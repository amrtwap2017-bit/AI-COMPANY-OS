from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import ExecutiveDashboard

class ExecutiveDashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_executive_dashboard(self) -> ExecutiveDashboard:
        return self.db.query(ExecutiveDashboard).first()

    def update_executive_dashboard(self, dashboard_data: dict) -> ExecutiveDashboard:
        dashboard = self.get_executive_dashboard()
        for key, value in dashboard_data.items():
            setattr(dashboard, key, value)
        self.db.commit()
        self.db.refresh(dashboard)
        return dashboard