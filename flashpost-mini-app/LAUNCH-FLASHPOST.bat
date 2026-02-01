@echo off
title FlashPost Mini App - Launcher (Preview Mode)
color 0A

echo.
echo ========================================
echo   🚀 FlashPost Mini App Launcher
echo   🔍 Preview Mode Support
echo ========================================
echo.

echo 📁 Текущая директория: %CD%
echo 📊 Проверяем файлы...

if not exist "index.html" (
    echo ❌ ОШИБКА: index.html не найден
    echo 💡 Убедитесь, что вы находитесь в папке flashpost-mini-app
    pause
    exit /b 1
)

if not exist "src\app.js" (
    echo ❌ ОШИБКА: Модули в папке src не найдены
    echo 💡 Убедитесь, что папка src содержит все модули
    pause
    exit /b 1
)

echo ✅ Все файлы найдены
echo.

echo 🔍 PREVIEW MODE активирован для локального тестирования
echo 📱 Mock Telegram API будет использован
echo.

echo 🔍 Проверяем доступность порта 8080...
netstat -an | find "8080" >nul
if %errorlevel% == 0 (
    echo ⚠️  Порт 8080 уже используется
    echo 💡 Попробуем порт 3000...
    set PORT=3000
) else (
    echo ✅ Порт 8080 свободен
    set PORT=8080
)

echo.
echo 🚀 Запускаем FlashPost Mini App в PREVIEW MODE...
echo 📍 Порт: %PORT%
echo 🌐 URL: http://localhost:%PORT%
echo 🔍 Режим: Standalone (без Telegram)
echo.
echo 💡 Для остановки нажмите Ctrl+C
echo ========================================
echo.

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен
    echo.
    echo 💡 АЛЬТЕРНАТИВНЫЙ ЗАПУСК:
    echo    Откройте index.html прямо в браузере
    echo    PREVIEW MODE активируется автоматически
    echo.
    echo 🔍 Хотите открыть файл напрямую? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo 🚀 Открываем index.html в браузере...
        start index.html
    )
    pause
    exit /b 1
)

echo ✅ Node.js найден: 
node --version

echo.
echo 🔄 Запуск сервера...

REM Открываем браузер через 2 секунды
start "" cmd /c "timeout /t 2 >nul && start http://localhost:%PORT%"

REM Запускаем сервер
node server.js

echo.
echo 🛑 Сервер остановлен
pause