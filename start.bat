@echo off
echo.
echo  =============================================
echo   NyayaTrack - Starting...
echo  =============================================

:: Go to the folder where this bat file is located
cd /d "%~dp0"

:: If there's a nested NyayaTrack folder, go into it
if exist "NyayaTrack\backend\package.json" cd NyayaTrack

echo.
echo  [1/2] Starting Backend on port 5020...
start "NyayaTrack Backend" cmd /k "cd /d "%CD%\backend" && npm install && npm run dev"

:: Wait 3 seconds before starting frontend
timeout /t 3 /nobreak > nul

echo  [2/2] Starting Frontend on port 3010...
start "NyayaTrack Frontend" cmd /k "cd /d "%CD%\frontend" && npm install && npm start"

echo.
echo  Servers are starting. Opening browser in 15 seconds...
timeout /t 15 /nobreak > nul
start http://localhost:3010

echo.
echo  =============================================
echo   Frontend: http://localhost:3010
echo   Backend:  http://localhost:5020
echo  =============================================
echo  Keep both windows open to use the app.
pause
