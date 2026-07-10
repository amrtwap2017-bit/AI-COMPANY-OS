#!/bin/bash
# Start the TB API with uvicorn and write PID to /tmp/tb_api.pid
echo $$ > /tmp/tb_api.pid
uvicorn orchestrator.main:app --host 0.0.0.0 --port 8000 &