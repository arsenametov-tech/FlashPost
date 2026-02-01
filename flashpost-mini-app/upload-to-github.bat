@echo off
echo 🚀 FlashPost Mini App - GitHub Upload Script
echo.
echo Этот скрипт поможет загрузить приложение в GitHub
echo.

echo 📋 Шаг 1: Создайте репозиторий на GitHub
echo 1. Перейдите на https://github.com
echo 2. Нажмите "New repository"
echo 3. Название: flashpost-mini-app
echo 4. Описание: FlashPost Telegram Mini App - AI-powered Instagram carousel generator
echo 5. НЕ добавляйте README, .gitignore или LICENSE
echo 6. Нажмите "Create repository"
echo.

set /p username="Введите ваш GitHub username: "
echo.

echo 🔗 Подключаем удаленный репозиторий...
git remote add origin https://github.com/%username%/flashpost-mini-app.git

echo 📤 Переименовываем ветку в main...
git branch -M main

echo 🚀 Загружаем код в GitHub...
git push -u origin main

echo.
echo ✅ Готово! Ваш репозиторий доступен по адресу:
echo https://github.com/%username%/flashpost-mini-app
echo.
echo 📱 Для настройки Telegram Mini App:
echo 1. Включите GitHub Pages в Settings → Pages
echo 2. Создайте бота через @BotFather
echo 3. Настройте Mini App с URL: https://%username%.github.io/flashpost-mini-app
echo.

pause