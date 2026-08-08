@echo off
REM ============================================
REM  HOSTELFIX AI - Backend Starter (Windows)
REM  Starts Flask API on http://localhost:5000
REM ============================================
cd /d "%~dp0backend"

echo Starting HOSTELFIX AI Backend...
echo Seeding database (idempotent)...
python seed.py

echo Starting Flask server on port 5000...
python run.py
