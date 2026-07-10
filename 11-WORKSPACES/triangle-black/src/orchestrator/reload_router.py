from fastapi import APIRouter, HTTPException
from application.services.reload_service import ReloadService

router = APIRouter()

@router.post('/tb/reload')
def reload_tb_api():
    reload_service = ReloadService()
    try:
        reload_service.send_sighup()
        reload_service.wait_for_restart()
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
