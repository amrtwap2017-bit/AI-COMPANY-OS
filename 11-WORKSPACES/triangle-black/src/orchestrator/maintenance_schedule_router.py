from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from application.services.maintenance_schedule_service import MaintenanceScheduleService
from infrastructure.repositories.maintenance_schedule_repository import get_maintenance_schedule_repo
from domain.schemas.maintenance_schedule import MaintenanceScheduleCreate, MaintenanceScheduleUpdate, MaintenanceScheduleResponse

router = APIRouter()

@router.post('/maintenance_schedules/', response_model=MaintenanceScheduleResponse)
def create_maintenance_schedule(maintenance_schedule_data: MaintenanceScheduleCreate, db: Session = Depends(get_maintenance_schedule_repo)):
    maintenance_schedule_service = MaintenanceScheduleService(db)
    return maintenance_schedule_service.create_maintenance_schedule(maintenance_schedule_data.dict())

@router.get('/maintenance_schedules/{schedule_id}', response_model=MaintenanceScheduleResponse)
def get_maintenance_schedule(schedule_id: int, db: Session = Depends(get_maintenance_schedule_repo)):
    maintenance_schedule_service = MaintenanceScheduleService(db)
    schedule = maintenance_schedule_service.get_maintenance_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail='Maintenance Schedule not found')
    return schedule

@router.put('/maintenance_schedules/{schedule_id}', response_model=MaintenanceScheduleResponse)
def update_maintenance_schedule(schedule_id: int, maintenance_schedule_data: MaintenanceScheduleUpdate, db: Session = Depends(get_maintenance_schedule_repo)):
    maintenance_schedule_service = MaintenanceScheduleService(db)
    return maintenance_schedule_service.update_maintenance_schedule(schedule_id, maintenance_schedule_data.dict())

@router.delete('/maintenance_schedules/{schedule_id}', status_code=204)
def delete_maintenance_schedule(schedule_id: int, db: Session = Depends(get_maintenance_schedule_repo)):
    maintenance_schedule_service = MaintenanceScheduleService(db)
    maintenance_schedule_service.delete_maintenance_schedule(schedule_id)