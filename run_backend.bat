@echo off
echo ========================================================
echo Starting AI Airborne Threat Interception Simulator Backend
echo ========================================================
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
pause
