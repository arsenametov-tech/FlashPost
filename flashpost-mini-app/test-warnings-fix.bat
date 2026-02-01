@echo off
echo ========================================
echo   TELEGRAM WARNINGS FIX TEST
echo ========================================
echo.
echo 1. Starting HTTP server...
start /min cmd /c "cd /d %~dp0 && python -m http.server 8080 2>nul || node server.js 2>nul || echo Server failed to start"

echo 2. Waiting for server to start...
timeout /t 3 /nobreak >nul

echo 3. Opening test page...
start http://localhost:8080/test-telegram-warnings-fix.html

echo 4. Opening main app for comparison...
timeout /t 2 /nobreak >nul
start http://localhost:8080/index.html

echo.
echo ========================================
echo   INSTRUCTIONS:
echo ========================================
echo 1. Check test page console output
echo 2. Verify no Telegram WebApp warnings
echo 3. Compare with main app behavior
echo 4. Press any key to close this window
echo ========================================
pause >nul