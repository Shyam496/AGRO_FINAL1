@echo off
color 0A
echo ========================================
echo    AGROMIND - COMPLETE SETUP
echo ========================================
echo.
echo This will:
echo 1. Install all frontend dependencies
echo 2. Start the development server
echo 3. Open the app in your browser
echo.
echo Please wait, this may take a few minutes...
echo.
pause

echo.
echo [1/3] Installing Frontend Dependencies...
echo ========================================
cd /d "%~dp0frontend"
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Please make sure Node.js is installed.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Frontend Server...
echo ========================================
echo.
echo Frontend will open at: http://localhost:5173
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server when done.
echo.
timeout /t 3

start http://localhost:5173

call npm run dev
