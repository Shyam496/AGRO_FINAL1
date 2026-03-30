@echo off
echo Installing Frontend Dependencies...
cd /d "%~dp0"
call npm install
echo.
echo Installation complete!
pause
