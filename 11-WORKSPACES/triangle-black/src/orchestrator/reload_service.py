from fastapi import HTTPException
import os
import signal
import time

class ReloadService:
    def __init__(self):
        self.pid_file = "/tmp/tb_api.pid"

    def send_sighup(self):
        if not os.path.exists(self.pid_file):
            raise HTTPException(status_code=404, detail="PID file not found")
        with open(self.pid_file, 'r') as f:
            pid = int(f.read().strip())
        try:
            os.kill(pid, signal.SIGHUP)
        except ProcessLookupError:
            raise HTTPException(status_code=404, detail="Process not found")

    def wait_for_restart(self):
        start_time = time.time()
        while True:
            if time.time() - start_time > 5:
                raise HTTPException(status_code=500, detail="API did not restart within 5 seconds")
            try:
                response = requests.get("http://localhost:8000/health")
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                pass
            time.sleep(1)
