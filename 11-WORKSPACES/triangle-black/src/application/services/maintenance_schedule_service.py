from domain.models.maintenance_schedule import MaintenanceSchedule
from infrastructure.repositories.maintenance_schedule_repository import MaintenanceScheduleRepository
from datetime import datetime, timedelta

FREQUENCY_MAP = {
    'daily': timedelta(days=1),
    'weekly': timedelta(weeks=1),
    'monthly': timedelta(months=1)
}

class MaintenanceScheduleService:
    def __init__(self, repository: MaintenanceScheduleRepository):
        self.repository = repository

    def create_maintenance_schedule(self, maintenance_schedule_data: dict) -> MaintenanceSchedule:
        maintenance_schedule_data['next_due'] = datetime.now() + FREQUENCY_MAP[maintenance_schedule_data['frequency']]
        return self.repository.create_maintenance_schedule(maintenance_schedule_data)

    def get_maintenance_schedule(self, schedule_id: int) -> MaintenanceSchedule:
        return self.repository.get_maintenance_schedule(schedule_id)

    def update_maintenance_schedule(self, schedule_id: int, maintenance_schedule_data: dict) -> MaintenanceSchedule:
        return self.repository.update_maintenance_schedule(schedule_id, maintenance_schedule_data)

    def delete_maintenance_schedule(self, schedule_id: int):
        self.repository.delete_maintenance_schedule(schedule_id)