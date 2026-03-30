@echo off
color 0C
echo ========================================
echo    AGROMIND - STOP SERVER
echo ========================================
echo.
echo This will stop the development server.
echo.
pause

taskkill /F /IM node.exe
echo.
echo Server stopped!
echo.
pause
