@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo            Lexicon AI Robust Quick Start
echo ===================================================
echo.

:: 1. Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python and try again.
    pause
    exit /b 1
)

:: 2. Check if Node.js/npm is installed
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm is not installed or not in your PATH.
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

:: 3. Clean up orphaned processes on ports 3000 and 8000
echo Checking for orphaned processes on port 3000 (Frontend) and 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Port 3000 is already in use by PID %%a. Freeing port...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Port 8000 is already in use by PID %%a. Freeing port...
    taskkill /F /PID %%a >nul 2>&1
)

:: 4. Verify/Setup Backend Virtual Environment
echo.
echo [1/3] Setting up Backend...
cd backend
if not exist venv (
    echo Virtual environment (venv) not found. Creating one...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment.
        cd ..
        pause
        exit /b 1
    )
)

echo Activating virtual environment and ensuring dependencies are installed...
call venv\Scripts\activate
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..

:: 5. Verify Frontend dependencies
echo.
echo [2/3] Setting up Frontend...
cd frontend
if not exist node_modules (
    echo Frontend node_modules not found. Installing dependencies...
    npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        cd ..
        pause
        exit /b 1
    )
)
cd ..

:: 6. Launch Backend in background cmd window
echo.
echo Starting Backend (FastAPI)...
start "Lexicon Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

:: 7. Launch Frontend in background cmd window
echo Starting Frontend (Next.js)...
start "Lexicon Frontend" cmd /k "cd frontend && npm run dev"

:: 8. Wait for servers to initialize and open the browser
echo.
echo Waiting for servers to initialize (7 seconds)...
timeout /t 7 /nobreak > nul

echo [3/3] Opening default browser...
start http://localhost:3000

echo.
echo ===================================================
echo Lexicon AI is now running!
echo.
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo.
echo If anything goes wrong, close the server windows
echo and run this script again.
echo ===================================================
pause
