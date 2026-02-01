@echo off
echo ========================================
echo    FlashPost Complete Diagnosis
echo ========================================
echo.

echo Запуск сервера...
taskkill /f /im node.exe >nul 2>&1
start /B node server.js

echo Ожидание запуска сервера...
timeout /t 3 /nobreak >nul

echo.
echo Открытие диагностических инструментов...
echo.

echo 1. Final Diagnosis (основной):
start http://localhost:3003/final-diagnosis.html

echo 2. Complete Diagnosis:
start http://localhost:3003/complete-diagnosis.html

echo 3. Console Diagnostics:
start http://localhost:3003/console-diagnostics.html

echo 4. Основное приложение:
start http://localhost:3003/index.html

echo.
echo ========================================
echo   Все диагностические инструменты запущены!
echo ========================================
echo.
echo Проверьте каждый инструмент и сообщите результаты:
echo - Инициализируется ли FlashPostApp?
echo - Какие ошибки в консоли?
echo - Какой модуль падает первым?
echo.
echo Нажмите любую клавишу для выхода...
pause >nul