@echo off
echo ========================================
echo   WHITE SCREEN DIAGNOSIS
echo ========================================
echo.
echo Checking for white screen issues...
echo.

echo 1. Starting HTTP server...
start /min cmd /c "cd /d %~dp0 && python -m http.server 8080 2>nul || node server.js 2>nul"

echo 2. Waiting for server...
timeout /t 2 /nobreak >nul

echo 3. Opening diagnosis tool...
start http://localhost:8080/white-screen-diagnosis.html

echo 4. Opening main app for comparison...
timeout /t 1 /nobreak >nul
start http://localhost:8080/index.html

echo.
echo ========================================
echo   DIAGNOSIS STEPS:
echo ========================================
echo 1. Check diagnosis tool results
echo 2. Compare with main app behavior  
echo 3. Use quick fix buttons if needed
echo 4. Look for these issues:
echo    - #app element missing/empty
echo    - CSS not loading
echo    - renderApp() not executing
echo    - Elements hidden by CSS
echo ========================================
echo.
echo Press any key to close...
pause >nul