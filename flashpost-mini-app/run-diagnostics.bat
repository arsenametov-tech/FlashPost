@echo off
echo ========================================
echo    FlashPost Diagnostics Launcher
echo ========================================
echo.

echo Запуск сервера...
start /B node server.js

echo Ожидание запуска сервера...
timeout /t 3 /nobreak >nul

echo.
echo Открытие диагностических инструментов...
echo.

echo 1. Основное приложение:
start http://localhost:3003/index.html

echo 2. Server Test:
start http://localhost:3003/test-server.html

echo 3. Console Diagnostics:
start http://localhost:3003/console-diagnostics.html

echo 4. Auto Diagnostics:
start http://localhost:3003/auto-diagnostics.html

echo.
echo ========================================
echo   Все инструменты запущены!
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause >nul