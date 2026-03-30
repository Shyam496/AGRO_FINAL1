@echo off
echo ========================================
echo    COPY ML MODEL
echo ========================================
echo.
echo Copying trained model to ml-service...
echo.

copy "D:\agromind_final\plant_disease_model.h5" .

if errorlevel 1 (
    echo.
    echo ERROR: Failed to copy model!
    echo Please check if the source path exists.
    pause
    exit /b 1
)

echo.
echo ✅ Model copied successfully!
echo.
pause
