#!/bin/bash
# AI Engine — Start Script
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
echo "Starting AI Engine on port 8001..."
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
