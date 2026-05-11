@echo off
echo =========================================
echo       Starting Lexicon AI Workspace
echo =========================================

echo.
echo [1/3] Starting Backend (FastAPI)...
start "Lexicon Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"

echo [2/3] Starting Frontend (Next.js)...
start "Lexicon Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 7 /nobreak > nul

echo [3/3] Opening Chrome...
start chrome http://localhost:3000

echo.
echo Lexicon AI is now running! 
echo Close the newly opened command prompt windows to stop the servers.
echo =========================================
pause
