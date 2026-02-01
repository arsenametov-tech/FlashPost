@echo off
echo Starting FlashPost Console Diagnostics...
start http://localhost:8080/console-diagnostics.html
echo Console diagnostics opened in browser
echo.
echo This tool will:
echo - Monitor console errors in real-time
echo - Test module loading sequence
echo - Identify which module fails first
echo - Generate detailed error reports
echo.
pause