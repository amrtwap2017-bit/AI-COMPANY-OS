from application.services.reload_service import ReloadService

def run_smart_pipeline():
    # Simulate pipeline execution
    print("Pipeline executed successfully")
    reload_service = ReloadService()
    try:
        reload_service.send_sighup()
        reload_service.wait_for_restart()
    except HTTPException as e:
        print(e)
