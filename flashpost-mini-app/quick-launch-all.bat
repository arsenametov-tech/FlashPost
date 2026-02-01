@echo off
echo ========================================
echo    FLASHPOST - Полный запуск системы
echo ========================================
echo.

echo 🔧 Запускаем исправления Stage Verification...
start "" "stage-verification-fixes.html"

echo ⏳ Ждем 2 секунды...
timeout /t 2 /nobreak >nul

echo 🧪 Запускаем тесты верификации...
start "" "STAGE-1-VERIFICATION-TEST.html"

echo ⏳ Ждем 2 секунды...
timeout /t 2 /nobreak >nul

echo 🚀 Запускаем основное приложение...
start "" "index.html"

echo.
echo ✅ Все компоненты запущены!
echo.
echo 📋 Открытые файлы:
echo    1. stage-verification-fixes.html - исправления
echo    2. STAGE-1-VERIFICATION-TEST.html - тесты
echo    3. index.html - основное приложение
echo.
echo 🎯 Проверьте браузер для тестирования
pause