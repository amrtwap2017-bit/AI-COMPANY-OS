from sqlalchemy.orm import Session
from domain.models.maintenance_schedule import MaintenanceSchedule

class MaintenanceScheduleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_maintenance_schedule(self, schedule_id: int) -> MaintenanceSchedule:
        return self.db.query(MaintenanceSchedule).filter(MaintenanceSchedule.id == schedule_id).first()

    def create_maintenance_schedule(self, maintenance_schedule_data: dict) -> MaintenanceSchedule:
        maintenance_schedule = MaintenanceSchedule(**maintenance_schedule_data)
        self.db.add(maintenance_schedule)
        self.db.commit()
        self.db.refresh(maintenance_schedule)
        return maintenance_schedule

    def update_maintenance_schedule(self, schedule_id: int, maintenance_schedule_data: dict) -> MaintenanceSchedule:
        maintenance_schedule = self.get_maintenance_schedule(schedule_id)
        for key, value in maintenance_schedule_data.items():
            setattr(maintenance_schedule, key, value)
        self.db.commit()
        return maintenance_schedule

    def delete_maintenance_schedule(self, schedule_id: int):
        maintenance_schedule = self.get_maintenance_schedule(schedule_id)
        self.db.delete(maintenance_schedule)
        self.db.commit()
