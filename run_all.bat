@echo off
echo ========================================================
echo Starting Complete Simulator: Backend + Frontend
echo ========================================================
start "Simulator Backend (FastAPI)" cmd /k "run_backend.bat"
timeout /t 3 /nobreak > nul
start "Simulator Frontend (React)" cmd /k "run_frontend.bat"
echo Services launched!
echo Access the Dashboard at: http://localhost:5173
echo Backend API Docs at:     http://localhost:8000/docs
