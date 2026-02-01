@echo off
echo ========================================
echo FlashPost CRITICAL UI RECOVERY - SAFE MODE
echo ========================================
echo.
echo СИМПТОМЫ:
echo - белый экран
echo - кнопки не кликабельны  
echo - ошибок в console нет
echo.
echo ЗАДАЧА: ВЕРНУТЬ ВИДИМЫЙ И ИНТЕРАКТИВНЫЙ UI
echo.
echo ========================================
echo SAFE MODE RECOVERY TESTS
echo ========================================
echo.
echo 1. Открываем тест SAFE MODE Recovery...
start "" "test-safe-mode-recovery.html"

echo.
echo 2. Ждем 2 секунды...
timeout /t 2 /nobreak >nul

echo.
echo 3. Открываем основное приложение для сравнения...
start "" "index.html"

echo.
echo ========================================
echo РЕЗУЛЬТАТ ДОЛЖЕН БЫТЬ:
echo ========================================
echo ✅ UI видимый (не белый экран)
echo ✅ Кнопки кликабельны
echo ✅ Console.log показывает каждый этап bootstrap
echo ✅ Telegram недоступен → автоматический PREVIEW MODE
echo ✅ Модули недоступны → fallback UI
echo ✅ #app.innerHTML заполнен
echo.
echo ========================================
echo ТЕСТИРОВАНИЕ:
echo ========================================
echo 1. Проверьте основное приложение (index.html)
echo 2. Если белый экран - используйте тесты в test-safe-mode-recovery.html
echo 3. Тест "Without Telegram" проверяет автоматический PREVIEW MODE
echo 4. Тест "Broken Modules" проверяет fallback UI
echo.
echo Все тесты должны показать рабочий UI с кликабельными кнопками.
echo.
pause