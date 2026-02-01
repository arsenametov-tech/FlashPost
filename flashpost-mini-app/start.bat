@echo off
echo.
echo ========================================
echo   FlashPost Mini App - Quick Start
echo ========================================
echo.

REM Проверяем наличие Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден!
    echo.
    echo 💡 Установите Node.js с https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js найден
echo.

REM Запускаем сервер
echo 🚀 Запуск FlashPost Mini App...
echo.

node server.js

REM Если сервер остановился
echo.
echo 🛑 Сервер остановлен
echo.
pause