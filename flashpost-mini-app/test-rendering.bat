@echo off
echo ========================================
echo   FLASHPOST RENDERING TEST
echo ========================================
echo.
echo Starting HTTP server and opening tests...
echo.

echo 1. Starting HTTP server...
start /min cmd /c "cd /d %~dp0 && python -m http.server 8080 2>nul || node server.js 2>nul"

echo 2. Waiting for server to start...
timeout /t 3 /nobreak >nul

echo 3. Opening test launcher...
start http://localhost:8080/open-test-window.html

echo 4. Opening priority tests...
timeout /t 2 /nobreak >nul
start http://localhost:8080/visual-white-screen-diagnosis.html
timeout /t 1 /nobreak >nul
start http://localhost:8080/test-render-app-simple.html

echo.
echo ========================================
echo   TESTING INSTRUCTIONS:
echo ========================================
echo 1. Check Visual Diagnosis panel (right side)
echo 2. Look for red debug text in Simple RenderApp
echo 3. Check Console for errors (F12)
echo 4. Test main app functionality
echo.
echo Expected results:
echo ✅ Red text "🔴 RENDER APP WORKS" visible
echo ✅ Dark background (#0f0f14) 
echo ✅ No JavaScript errors in Console
echo ✅ Full viewport height working
echo.
echo Press any key to close...
pause >nul