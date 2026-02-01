@echo off
chcp 65001 >nul
title FlashPost AI - Запуск и открытие

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🚀 FlashPost AI - Автозапуск                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Проверяем Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден! Установите с https://nodejs.org/
    pause
    exit /b 1
)

REM Освобождаем порт 8000 если занят
echo 🔍 Проверяем порт 8000...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Освобождаем порт 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 1 >nul
)

echo ✅ Порт свободен
echo 🔄 Запускаем сервер...

REM Запускаем сервер в фоне
start /min "FlashPost Server" node server.js

REM Ждем запуска сервера
timeout /t 3 >nul

REM Проверяем что сервер запустился
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Сервер запущен успешно!
    echo 🌐 Открываем браузер...
    
    REM Открываем браузер
    start http://localhost:8000/quick-start.html
    
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    ✅ ГОТОВО К РАБОТЕ!                       ║
    echo ║                                                              ║
    echo ║  🌐 Адрес: http://localhost:8000                             ║
    echo ║  🚀 Мини-приложение: /app.html                               ║
    echo ║  📱 Основное: /index.html                                    ║
    echo ║                                                              ║
    echo ║  💡 Для остановки закройте это окно                          ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    
) else (
    echo ❌ Ошибка запуска сервера
    echo 💡 Попробуйте запустить start-server.bat для диагностики
)

pause