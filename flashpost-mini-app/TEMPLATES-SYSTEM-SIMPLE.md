# 📋 ПРОСТАЯ СИСТЕМА ШАБЛОНОВ

## 🎯 Основная логика

### Сохранение шаблона
```javascript
saveTemplate() {
    // Получаем текущий слайд
    const currentSlide = this.getCurrentSlide();
    
    // Создаем шаблон
    const template = {
        id: `template_${Date.now()}`,
        name: templateName,
        background: this.clone(currentSlide.background),
        textBlocks: this.clone(currentSlide.textBlocks),
        createdAt: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
    
    console.log('💾 Шаблон сохранен:', template);
}
```

### Применение шаблона
```javascript
applyTemplate(templateId) {
    // Загружаем шаблон
    const templateData = localStorage.getItem(`template_${templateId}`);
    const template = JSON.parse(templateData);
    
    // Получаем текущий слайд
    const slide = this.getCurrentSlide();
    
    // Применяем шаблон
    slide.textBlocks = this.clone(template.textBlocks);
    slide.background = this.clone(template.background);
    
    console.log('✅ Шаблон применен:', template.name);
    
    // Перерендериваем
    this.render();
}
```

## 🏗️ Структура шаблона

### Формат шаблона в localStorage
```javascript
template = {
    id: 'template_1674123456789',
    name: 'Мой шаблон',
    background: {
        color: '#ff6b6b'
    },
    textBlocks: [
        {
            id: 'block_1',
            text: 'Заголовок',
            x: 10,      // проценты
            y: 20,      // проценты
            width: 80,  // проценты
            font: 'Inter',
            size: 24,
            color: '#ffffff'
        },
        {
            id: 'block_2',
            text: 'Подзаголовок',
            x: 10,
            y: 60,
            width: 70,
            font: 'Inter',
            size: 16,
            color: '#ffffff'
        }
    ],
    createdAt: '2024-01-29T10:30:00.000Z'
}
```

## 🔧 Ключевые функции

### 1. Глубокое клонирование
```javascript
clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Использование
slide.textBlocks = this.clone(template.textBlocks);
slide.background = this.clone(template.background);
```

### 2. Загрузка всех шаблонов
```javascript
loadTemplates() {
    const templates = {};
    
    // Перебираем все ключи localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('template_')) {
            try {
                const templateData = localStorage.getItem(key);
                const template = JSON.parse(templateData);
                templates[template.id] = template;
            } catch (error) {
                console.error('Ошибка загрузки шаблона:', error);
            }
        }
    }
    
    return templates;
}
```

### 3. Удаление шаблона
```javascript
deleteTemplate(templateId) {
    localStorage.removeItem(`template_${templateId}`);
    console.log('🗑️ Шаблон удален:', templateId);
}
```

### 4. Превью шаблона
```javascript
renderTemplatePreview(template) {
    return `
        <div class="template-preview" style="background: ${template.background.color};">
            ${template.textBlocks.map(block => `
                <div class="text-block-preview" style="
                    left: ${block.x}%;
                    top: ${block.y}%;
                    width: ${block.width}%;
                    font-size: ${block.size * 0.3}px;
                    color: ${block.color};
                ">${block.text}</div>
            `).join('')}
        </div>
    `;
}
```

## 🎨 UI компоненты

### Кнопка сохранения шаблона
```html
<button class="btn btn-success" onclick="saveTemplate()">
    💾 Сохранить шаблон
</button>
```

### Список шаблонов
```html
<div class="templates-list">
    <!-- Генерируется JS -->
    <div class="template-item" onclick="applyTemplate('template_123')">
        <div class="template-preview">...</div>
        <div class="template-name">Название шаблона</div>
        <div class="template-info">3 блока • 29.01.2024</div>
    </div>
</div>
```

### CSS для шаблонов
```css
.template-item {
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.template-item:hover {
    border-color: #833ab4;
}

.template-preview {
    width: 100%;
    height: 80px;
    border-radius: 6px;
    margin-bottom: 8px;
    position: relative;
    overflow: hidden;
}

.template-preview .text-block-preview {
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 8px;
    transform: scale(0.3);
    transform-origin: top left;
}
```

## 🔄 Интеграция в app.js

### 1. Добавить методы в класс FlashPostApp
```javascript
class FlashPostApp {
    constructor() {
        // ... существующий код
        this.templates = {};
    }
    
    // Сохранение шаблона
    saveTemplate(templateName) {
        const currentSlide = this.getActiveSlide();
        if (!currentSlide) return;
        
        const template = {
            id: `template_${Date.now()}`,
            name: templateName || `Шаблон ${Object.keys(this.templates).length + 1}`,
            background: this.clone(currentSlide.background),
            textBlocks: this.clone(currentSlide.textBlocks),
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
        this.templates[template.id] = template;
        
        this.renderTemplates();
        console.log('💾 Шаблон сохранен:', template.name);
    }
    
    // Применение шаблона
    applyTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) return;
        
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return;
        
        activeSlide.textBlocks = this.clone(template.textBlocks);
        activeSlide.background = this.clone(template.background);
        
        this.render();
        console.log('✅ Шаблон применен:', template.name);
    }
    
    // Загрузка шаблонов
    loadTemplates() {
        this.templates = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key && key.startsWith('template_')) {
                try {
                    const templateData = localStorage.getItem(key);
                    const template = JSON.parse(templateData);
                    this.templates[template.id] = template;
                } catch (error) {
                    console.error('Ошибка загрузки шаблона:', error);
                }
            }
        }
        
        this.renderTemplates();
    }
    
    // Клонирование объекта
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}
```

### 2. Добавить UI для шаблонов
```html
<!-- В режиме редактирования -->
<div class="templates-panel">
    <div class="templates-header">
        <h3>Шаблоны</h3>
        <button class="btn btn-success" onclick="app.saveTemplate()">
            💾 Сохранить
        </button>
    </div>
    
    <div class="templates-list" id="templatesList">
        <!-- Заполняется JS -->
    </div>
</div>
```

### 3. Рендеринг списка шаблонов
```javascript
renderTemplates() {
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) return;
    
    if (Object.keys(this.templates).length === 0) {
        templatesList.innerHTML = `
            <div class="no-templates">
                <p>Нет сохраненных шаблонов</p>
            </div>
        `;
        return;
    }
    
    templatesList.innerHTML = Object.values(this.templates).map(template => `
        <div class="template-item" onclick="app.applyTemplate('${template.id}')">
            <div class="template-preview" style="background: ${template.background.color};">
                ${template.textBlocks.map(block => `
                    <div class="text-block-preview" style="
                        left: ${block.x}%;
                        top: ${block.y}%;
                        width: ${block.width}%;
                        font-size: ${Math.max(6, block.size * 0.3)}px;
                        color: ${block.color};
                    ">${block.text}</div>
                `).join('')}
            </div>
            
            <div class="template-name">${template.name}</div>
            <div class="template-info">
                ${template.textBlocks.length} блоков • ${new Date(template.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}
```

## 🧪 Тестирование

### Тест сохранения
```javascript
// Создать слайд с текстом и фоном
// Нажать "Сохранить шаблон"
// Проверить что шаблон появился в списке
// Проверить localStorage
```

### Тест применения
```javascript
// Выбрать шаблон из списка
// Проверить что текстовые блоки скопировались
// Проверить что фон применился
// Проверить что позиции сохранились
```

### Тест клонирования
```javascript
// Применить шаблон
// Изменить текст в блоке
// Применить тот же шаблон снова
// Проверить что изменения не сохранились в шаблоне
```

## 📋 Чек-лист реализации

- [ ] Функция `saveTemplate()` с localStorage
- [ ] Функция `applyTemplate()` с клонированием
- [ ] Функция `loadTemplates()` при запуске
- [ ] Функция `clone()` для глубокого копирования
- [ ] UI для списка шаблонов
- [ ] Превью шаблонов
- [ ] Обработка ошибок JSON
- [ ] Тестирование всех функций