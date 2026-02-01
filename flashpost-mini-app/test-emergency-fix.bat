@echo off
echo ========================================
echo FlashPost Emergency Fix Test
echo ========================================
echo.
echo Starting emergency diagnostic...
echo.

REM Open diagnostic page first
start "" "white-screen-emergency-fix.html"

echo Diagnostic page opened.
echo.
echo Waiting 3 seconds before opening emergency fix...
timeout /t 3 /nobreak >nul

REM Open emergency fix
start "" "index-emergency-fix.html"

echo Emergency fix opened.
echo.
echo Both pages should now be open:
echo 1. Diagnostic page - for troubleshooting
echo 2. Emergency fix - working FlashPost app
echo.
echo If emergency fix works, you can use it as a backup.
echo If you want to fix the main app, check the diagnostic results.
echo.
pause