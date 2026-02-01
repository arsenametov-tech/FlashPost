# 🚀 Загрузка FlashPost Mini App на GitHub

## 📋 Пошаговая инструкция

### 1. Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com)
2. Нажмите кнопку **"New"** или **"+"** → **"New repository"**
3. Заполните данные:
   - **Repository name**: `flashpost-mini-app`
   - **Description**: `Мини-приложение для создания каруселей постов в Instagram за 30 секунд`
   - **Visibility**: Public (или Private по желанию)
   - ❌ **НЕ** ставьте галочки на "Add a README file", "Add .gitignore", "Choose a license"
4. Нажмите **"Create repository"**

### 2. Подключение локального репозитория

Откройте командную строку в папке `flashpost-mini-app` и выполните:

```bash
# Добавить удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/flashpost-mini-app.git

# Переименовать ветку в main (если нужно)
git branch -M main

# Загрузить код на GitHub
git push -u origin main
```

### 3. Настройка GitHub Pages (опционально)

Для создания демо-версии:

1. В репозитории перейдите в **Settings**
2. Найдите раздел **Pages** в левом меню
3. В **Source** выберите **"Deploy from a branch"**
4. Выберите ветку **main** и папку **/ (root)**
5. Нажмите **Save**

Ваше приложение будет доступно по адресу:
`https://YOUR_USERNAME.github.io/flashpost-mini-app/`

### 4. Обновление README.md

После создания репозитория обновите ссылки в README.md:

```bash
# Замените в README.md:
# https://github.com/yourusername/flashpost-mini-app
# на:
# https://github.com/YOUR_USERNAME/flashpost-mini-app

# Замените демо-ссылку:
# https://your-demo-link.com
# на:
# https://YOUR_USERNAME.github.io/flashpost-mini-app/
```

### 5. Добавление тем и меток

В настройках репозитория добавьте **Topics**:
- `instagram`
- `carousel`
- `telegram-webapp`
- `mini-app`
- `social-media`
- `content-creation`
- `javascript`
- `nodejs`

## 🔧 Команды для обновления

```bash
# Добавить изменения
git add .

# Создать commit
git commit -m "✨ Add new feature"

# Загрузить на GitHub
git push origin main
```

## 📊 Рекомендуемые настройки репозитория

### Описание
```
Мини-приложение для создания каруселей постов в Instagram за 30 секунд. Telegram WebApp с полнофункциональным редактором.
```

### Website
```
https://YOUR_USERNAME.github.io/flashpost-mini-app/
```

### Topics
```
instagram, carousel, telegram-webapp, mini-app, social-media, content-creation, javascript, nodejs
```

## 🎯 Готовые команды

Скопируйте и выполните (замените YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/flashpost-mini-app.git
git branch -M main
git push -u origin main
```

## ✅ Проверка

После загрузки проверьте:
- ✅ Все файлы загружены
- ✅ README.md отображается корректно
- ✅ GitHub Pages работает (если настроили)
- ✅ Темы добавлены
- ✅ Описание заполнено

---

🎉 **Готово!** Ваш FlashPost Mini App теперь на GitHub!