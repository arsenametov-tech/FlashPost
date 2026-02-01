# 🔧 ИНТЕГРАЦИЯ СИСТЕМЫ АВТОМАТИЧЕСКИХ КЛЮЧЕВЫХ СЛОВ

## 🎯 Что добавить в app.js

### 1. Обновить структуру слайда ✅
```javascript
// Добавить в структуру слайда
slide = {
    id: 'slide_1',
    text: 'Сгенерированный текст...',
    autoKeywords: [],    // ← ДОБАВИТЬ
    manualKeywords: [],  // ← ДОБАВИТЬ
    background: { color: '#ff6b6b' },
    // ... остальные поля
}
```

### 2. Двухэтапная генерация ✅
```javascript
// Этап 1: Генерация текста
async generateSlideText(topic) {
    const prompt = `Создай вирусный текст для слайда на тему: ${topic}`;
    const text = await this.callGeminiAPI(prompt);
    return text;
}

// Этап 2: Извлечение ключевых слов
async extractKeywords(text) {
    const prompt = `Extract 5–7 most important keywords from this text.
    Return as JSON array of strings.
    
    Text: ${text}`;
    
    const response = await this.callGeminiAPI(prompt);
    const keywords = JSON.parse(response);
    return keywords;
}

// Полный пайплайн
async generateSlideWithKeywords(topic) {
    // 1. Генерируем текст
    const text = await this.generateSlideText(topic);
    
    // 2. Извлекаем ключевые слова
    const autoKeywords = await this.extractKeywords(text);
    
    // 3. Создаем слайд
    const slide = {
        id: this.generateId(),
        text: text,
        autoKeywords: autoKeywords,
        manualKeywords: [],
        background: this.getRandomBackground()
    };
    
    return slide;
}
```

### 3. Функция парсинга текста ✅
```javascript
// Добавить в класс FlashPostApp
parseTextWithKeywords(text, autoKeywords = [], manualKeywords = []) {
    if (!text) return '';
    
    let parsedText = text;
    
    // Сначала автоматические ключевые слова
    autoKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        parsedText = parsedText.replace(regex, '<span class="auto-keyword">$1</span>');
    });
    
    // Затем ручные (приоритет выше)
    manualKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        parsedText = parsedText.replace(regex, '<span class="manual-keyword">$1</span>');
    });
    
    return parsedText;
}
```

### 4. CSS стили для подсветки ✅
```css
/* Добавить в app.css */

/* Автоматические ключевые слова */
.auto-keyword {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    text-shadow: none;
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* Ручные ключевые слова */
.manual-keyword {
    background: linear-gradient(45deg, #48cae4, #0077b6);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    text-shadow: none;
    box-shadow: 0 0 8px rgba(72, 202, 228, 0.4);
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* Анимация свечения */
@keyframes glow-pulse {
    0% {
        box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
    }
    100% {
        box-shadow: 0 0 16px rgba(255, 107, 107, 0.8);
    }
}
```

### 5. Обновить рендеринг слайдов ✅
```javascript
// В функции рендеринга слайдов заменить:
// ${slide.text}
// НА:
${this.parseTextWithKeywords(slide.text, slide.autoKeywords, slide.manualKeywords)}

// Пример:
renderSlide(slide) {
    return `
        <div class="slide" style="background: ${slide.background.color}">
            <div class="slide-text">
                ${this.parseTextWithKeywords(slide.text, slide.autoKeywords, slide.manualKeywords)}
            </div>
        </div>
    `;
}
```

### 6. API интеграция ✅
```javascript
// Добавить метод для вызова Gemini API
async callGeminiAPI(prompt) {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.geminiApiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error('Ошибка API:', error);
        throw error;
    }
}
```

## 🔄 Пошаговая интеграция

### Шаг 1: Обновить handleGenerate()
```javascript
async handleGenerate() {
    this.isGenerating = true;
    this.showLoading();
    
    try {
        const topic = document.getElementById('topicInput').value;
        
        // Генерируем слайды с ключевыми словами
        for (let i = 0; i < 5; i++) {
            const slide = await this.generateSlideWithKeywords(topic);
            this.project.slides.push(slide);
            
            // Показываем прогресс
            this.updateProgress((i + 1) / 5 * 100);
        }
        
        this.setMode('preview');
        this.render();
        
    } catch (error) {
        console.error('Ошибка генерации:', error);
        this.showError('Ошибка генерации контента');
    } finally {
        this.isGenerating = false;
        this.hideLoading();
    }
}
```

### Шаг 2: Добавить управление ключевыми словами
```javascript
// Добавление ручных ключевых слов
addManualKeyword(slideId, keyword) {
    const slide = this.getSlide(slideId);
    if (slide && !slide.manualKeywords.includes(keyword)) {
        slide.manualKeywords.push(keyword);
        this.render();
    }
}

// Удаление ключевого слова
removeKeyword(slideId, keyword, isManual = false) {
    const slide = this.getSlide(slideId);
    if (slide) {
        const keywordsArray = isManual ? slide.manualKeywords : slide.autoKeywords;
        const index = keywordsArray.indexOf(keyword);
        if (index > -1) {
            keywordsArray.splice(index, 1);
            this.render();
        }
    }
}
```

### Шаг 3: Обновить экспорт
```javascript
// При экспорте учитывать ключевые слова
exportSlide(slideIndex) {
    const slide = this.project.slides[slideIndex];
    
    // Создаем временный элемент с подсвеченным текстом
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.parseTextWithKeywords(
        slide.text, 
        slide.autoKeywords, 
        slide.manualKeywords
    );
    
    // Экспортируем с подсветкой
    return html2canvas(tempElement);
}
```

## ✅ Проверка интеграции

После интеграции проверить:
1. **Генерация работает** - создаются слайды с autoKeywords
2. **Подсветка работает** - ключевые слова выделяются
3. **Анимация работает** - есть эффект свечения
4. **API работает** - запросы к Gemini проходят
5. **Ошибки обрабатываются** - fallback при сбоях API

## 🧪 Тестирование

### Тест 1: Генерация с ключевыми словами
```javascript
// Создать слайд и проверить структуру
const slide = await app.generateSlideWithKeywords('Инвестиции');
console.assert(slide.autoKeywords.length > 0, 'Ключевые слова не извлечены');
```

### Тест 2: Подсветка
```javascript
// Проверить парсинг текста
const text = 'Рынок криптовалют растет';
const keywords = ['рынок', 'криптовалют'];
const parsed = app.parseTextWithKeywords(text, keywords);
console.assert(parsed.includes('auto-keyword'), 'Подсветка не работает');
```

### Тест 3: Приоритеты
```javascript
// Проверить приоритет ручных ключевых слов
const text = 'Успешные инвестиции';
const auto = ['инвестиции'];
const manual = ['успешные'];
const parsed = app.parseTextWithKeywords(text, auto, manual);
console.assert(parsed.includes('manual-keyword'), 'Приоритет ручных не работает');
```

## 📋 Финальный чек-лист

- [ ] Структура слайда обновлена (autoKeywords, manualKeywords)
- [ ] Двухэтапная генерация реализована
- [ ] Функция parseTextWithKeywords() добавлена
- [ ] CSS стили для подсветки добавлены
- [ ] Рендеринг слайдов обновлен
- [ ] API интеграция настроена
- [ ] Обработка ошибок реализована
- [ ] Тестирование пройдено