# 🎯 СИСТЕМА АВТОМАТИЧЕСКИХ КЛЮЧЕВЫХ СЛОВ

## 📋 Логика работы

### Этап 1: Генерация текста
```javascript
// Запрос к Gemini API
const prompt = `Создай текст для слайда на тему: ${topic}`;
const generatedText = await geminiAPI.generate(prompt);

// Сохранение в структуру слайда
slide.text = generatedText;
```

### Этап 2: Извлечение ключевых слов
```javascript
// Второй запрос к Gemini
const keywordsPrompt = `Extract 5–7 most important keywords from this text.
Return as JSON array of strings.

Text: ${slide.text}`;

const response = await geminiAPI.generate(keywordsPrompt);
const keywords = JSON.parse(response);

// Сохранение автоматических ключевых слов
slide.autoKeywords = keywords; // ['рынок', 'страх', 'прибыль']
```

### Этап 3: Подсветка при рендере
```javascript
// При рендеринге текста
const parsedText = parseTextWithKeywords(
    slide.text, 
    slide.autoKeywords,    // Автоматические
    slide.manualKeywords   // Ручные
);
```

## 🏗️ Структура данных

### Слайд с ключевыми словами
```javascript
slide = {
    id: 'slide_1',
    text: 'Криптовалютный рынок предлагает уникальные возможности...',
    autoKeywords: ['рынок', 'криптовалюта', 'риски', 'прибыль'],
    manualKeywords: ['успех', 'деньги'],
    background: { color: '#ff6b6b' },
    generatedAt: '2024-01-29T10:30:00Z'
}
```

## 🎨 Система подсветки

### CSS стили для ключевых слов
```css
/* Автоматические ключевые слова */
.auto-keyword {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
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
    box-shadow: 0 0 8px rgba(72, 202, 228, 0.4);
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* Анимация свечения */
@keyframes glow-pulse {
    0% { box-shadow: 0 0 8px rgba(255, 107, 107, 0.4); }
    100% { box-shadow: 0 0 16px rgba(255, 107, 107, 0.8); }
}
```

### Функция парсинга текста
```javascript
parseTextWithKeywords(text, autoKeywords = [], manualKeywords = []) {
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

## 🔄 Полный пайплайн

### 1. Генерация контента
```javascript
async generateSlides(topic) {
    // Запрос 1: Генерация текста
    const text = await this.callGeminiAPI(`Создай текст для слайда: ${topic}`);
    
    const slide = {
        id: generateId(),
        topic: topic,
        text: text,
        autoKeywords: [],
        manualKeywords: [],
        background: getRandomBackground()
    };
    
    this.slides.push(slide);
    return slide;
}
```

### 2. Извлечение ключевых слов
```javascript
async extractKeywords(slide) {
    // Запрос 2: Извлечение ключевых слов
    const prompt = `Extract 5–7 most important keywords from this text.
    Return as JSON array of strings.
    
    Text: ${slide.text}`;
    
    const response = await this.callGeminiAPI(prompt);
    const keywords = JSON.parse(response);
    
    slide.autoKeywords = keywords;
    return keywords;
}
```

### 3. Рендеринг с подсветкой
```javascript
renderSlide(slide) {
    const highlightedText = this.parseTextWithKeywords(
        slide.text,
        slide.autoKeywords,
        slide.manualKeywords
    );
    
    return `
        <div class="slide" style="background: ${slide.background.color}">
            <div class="slide-text">${highlightedText}</div>
        </div>
    `;
}
```

## 🎯 Приоритеты подсветки

### 1. Ручные ключевые слова (высший приоритет)
- Цвет: синий градиент
- Применяются последними (перезаписывают автоматические)

### 2. Автоматические ключевые слова
- Цвет: красно-желтый градиент  
- Применяются первыми

### 3. Обычный текст
- Без подсветки

## 🔧 API интеграция

### Запрос к Gemini API
```javascript
async callGeminiAPI(prompt) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
```

### Обработка ошибок
```javascript
async extractKeywordsWithRetry(slide, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const keywords = await this.extractKeywords(slide);
            return keywords;
        } catch (error) {
            console.warn(`Попытка ${attempt} неудачна:`, error);
            
            if (attempt === maxRetries) {
                // Fallback: используем простое извлечение ключевых слов
                return this.extractKeywordsSimple(slide.text);
            }
            
            await this.delay(1000 * attempt); // Экспоненциальная задержка
        }
    }
}
```

## 📊 Мониторинг и аналитика

### Статистика ключевых слов
```javascript
getKeywordStats() {
    const stats = {
        totalSlides: this.slides.length,
        totalAutoKeywords: 0,
        totalManualKeywords: 0,
        averageKeywordsPerSlide: 0,
        mostCommonKeywords: {}
    };
    
    this.slides.forEach(slide => {
        stats.totalAutoKeywords += slide.autoKeywords.length;
        stats.totalManualKeywords += slide.manualKeywords.length;
        
        // Подсчет частоты ключевых слов
        [...slide.autoKeywords, ...slide.manualKeywords].forEach(keyword => {
            stats.mostCommonKeywords[keyword] = (stats.mostCommonKeywords[keyword] || 0) + 1;
        });
    });
    
    stats.averageKeywordsPerSlide = (stats.totalAutoKeywords + stats.totalManualKeywords) / stats.totalSlides;
    
    return stats;
}
```

## 🧪 Тестирование

### Тест полного пайплайна
```javascript
async testFullPipeline() {
    // 1. Генерация слайдов
    await this.generateSlides();
    
    // 2. Извлечение ключевых слов
    await this.extractKeywords();
    
    // 3. Добавление ручных ключевых слов
    this.addManualKeywords();
    
    // 4. Проверка рендеринга
    this.testRendering();
    
    // 5. Проверка статистики
    const stats = this.getKeywordStats();
    console.log('📊 Статистика:', stats);
}
```

## 📋 Чек-лист реализации

- [ ] Двухэтапная генерация (текст → ключевые слова)
- [ ] Структура данных с autoKeywords и manualKeywords
- [ ] Функция parseTextWithKeywords()
- [ ] CSS стили для подсветки с анимацией
- [ ] Приоритеты подсветки (ручные > автоматические)
- [ ] API интеграция с обработкой ошибок
- [ ] Система мониторинга и статистики
- [ ] Полное тестирование пайплайна