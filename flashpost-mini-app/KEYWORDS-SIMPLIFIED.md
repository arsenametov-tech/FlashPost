# 🔧 УПРОЩЕННАЯ СИСТЕМА КЛЮЧЕВЫХ СЛОВ

## ❌ Проблема была:

Слишком много конфликтующих флагов:
- `glow`
- `isKeyword` 
- `autoHighlight`
- `highlightEnabled`
- `keywordColor`

Они смешивались и создавали путаницу в логике.

## ✅ Упрощенная модель:

### На уровне блока:
```javascript
{
    glow: false,              // Свечение всего блока
    highlightEnabled: true,   // Включить подсветку слов
    keywordColor: '#ff6b6b'   // Цвет (опционально)
}
```

### На уровне слайда:
```javascript
{
    autoKeywords: ['рынок', 'инвестиции', 'прибыль']
}
```

### ❌ Убрано:
- `isKeyword` - ломал модель
- `autoHighlight` - дублировал функциональность
- Сложные стили в parseTextWithKeywords

## 🎯 Логика работы:

### 1. Ручные ключевые слова (*слово*)
```javascript
"Изучайте *рынок* и *инвестиции*"
↓
"Изучайте <span class='manual-keyword'>рынок</span> и <span class='manual-keyword'>инвестиции</span>"
```

### 2. Автоматические ключевые слова
```javascript
autoKeywords: ['прибыль']
"Получайте прибыль от инвестиций"
↓
"Получайте <span class='auto-keyword'>прибыль</span> от инвестиций"
```

### 3. Свечение блока
```javascript
glow: true
↓
element.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
```

## 🔧 Упрощенная функция parseTextWithKeywords:

```javascript
parseTextWithKeywords(text, autoKeywords = []) {
    if (!text) return '';

    let processedText = text;

    // 1. Ручные ключевые слова (*слово*)
    const manualKeywordRegex = /\*([^*]+)\*/g;
    processedText = processedText.replace(manualKeywordRegex, (match, keyword) => {
        return `<span class="manual-keyword">${keyword}</span>`;
    });

    // 2. Автоматические ключевые слова
    if (autoKeywords && autoKeywords.length > 0) {
        autoKeywords.forEach(keyword => {
            const autoKeywordRegex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
            
            processedText = processedText.replace(autoKeywordRegex, (match) => {
                // Проверяем, не внутри ли уже тега
                const beforeMatch = processedText.substring(0, processedText.indexOf(match));
                const openTags = (beforeMatch.match(/<span class="[^"]*keyword/g) || []).length;
                const closeTags = (beforeMatch.match(/<\/span>/g) || []).length;
                
                if (openTags === closeTags) {
                    return `<span class="auto-keyword">${match}</span>`;
                }
                
                return match;
            });
        });
    }
    
    return processedText;
}
```

## 🎨 CSS стили:

```css
/* Автоматические ключевые слова */
.auto-keyword {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
    text-shadow: none;
    box-shadow: 0 0 6px rgba(255, 107, 107, 0.4);
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

/* Ручные ключевые слова */
.manual-keyword {
    background: linear-gradient(45deg, #48cae4, #0077b6);
    color: white;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
    text-shadow: none;
    box-shadow: 0 0 6px rgba(72, 202, 228, 0.4);
    animation: glow-pulse 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
    0% { box-shadow: 0 0 6px rgba(255, 107, 107, 0.4); }
    100% { box-shadow: 0 0 12px rgba(255, 107, 107, 0.8); }
}
```

## 🔧 Обновленный рендеринг блока:

```javascript
renderTextBlock(block, editable = true) {
    const el = document.createElement('div');
    el.className = 'slide-text-block';
    
    // Основные стили
    el.style.position = 'absolute';
    el.style.left = block.x + '%';
    el.style.top = block.y + '%';
    // ... другие стили
    
    // Применяем glow к всему блоку если включен
    if (block.glow) {
        el.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
    }
    
    // Парсим текст с ключевыми словами
    if (block.highlightEnabled) {
        const slide = this.getSlideByBlockId(block.id);
        el.innerHTML = this.parseTextWithKeywords(
            block.text,
            slide ? slide.autoKeywords : []
        );
    } else {
        el.textContent = block.text;
    }
    
    return el;
}
```

## 📊 Сравнение до/после:

### До (сложно):
```javascript
parseTextWithKeywords(text, keywordColor, highlightEnabled, autoKeywords, glowEnabled) {
    // 50+ строк кода
    // Сложные стили
    // Конфликтующие флаги
}

block = {
    glow: false,
    isKeyword: false,        // ❌ Конфликт
    autoHighlight: true,     // ❌ Дублирование
    highlightEnabled: true,
    keywordColor: '#ff6b6b'
}
```

### После (просто):
```javascript
parseTextWithKeywords(text, autoKeywords) {
    // 30 строк кода
    // Простая логика
    // Четкое разделение
}

block = {
    glow: false,             // ✅ Свечение блока
    highlightEnabled: true,  // ✅ Включить подсветку
    keywordColor: '#ff6b6b'  // ✅ Цвет (опционально)
}
```

## 🧪 Тестирование:

Файл: `test-keywords-simplified.html`

**Функции тестирования:**
- Переключение подсветки
- Включение/выключение свечения
- Добавление авто-ключевых слов
- Демонстрация ручных (*слово*) и авто-слов

**Примеры:**
- `*рынок*` → <span style="background: linear-gradient(45deg, #48cae4, #0077b6); color: white; padding: 2px 4px; border-radius: 3px;">рынок</span>
- `прибыль` (если в autoKeywords) → <span style="background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 2px 4px; border-radius: 3px;">прибыль</span>

## ✅ Результат:

- ❌ Убран `isKeyword` - он ломал модель
- ❌ Убран `autoHighlight` - дублировал функциональность  
- ✅ Четкое разделение: ручные vs авто-ключевые слова
- ✅ Простая логика: glow на блок, подсветка на слова
- ✅ CSS классы: `.auto-keyword` и `.manual-keyword`
- ✅ Упрощенная функция parseTextWithKeywords
- ✅ Меньше конфликтов и путаницы

Система стала понятнее и надежнее!