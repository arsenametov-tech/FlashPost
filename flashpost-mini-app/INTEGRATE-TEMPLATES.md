# 🔧 ИНТЕГРАЦИЯ СИСТЕМЫ ШАБЛОНОВ

## 🎯 Что добавить в app.js

### 1. Добавить в конструктор ✅
```javascript
constructor() {
    // ... существующий код
    this.templates = {};
}
```

### 2. Функция сохранения шаблона ✅
```javascript
saveTemplate(templateName) {
    const activeSlide = this.getActiveSlide();
    if (!activeSlide) {
        console.error('Нет активного слайда для сохранения');
        return;
    }
    
    const name = templateName || prompt('Название шаблона:', `Шаблон ${Object.keys(this.templates).length + 1}`);
    if (!name) return;
    
    const template = {
        id: `template_${Date.now()}`,
        name: name,
        background: this.clone(activeSlide.background),
        textBlocks: this.clone(activeSlide.textBlocks),
        createdAt: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
    
    // Добавляем в локальный кэш
    this.templates[template.id] = template;
    
    console.log('💾 Шаблон сохранен:', template.name);
    
    // Обновляем UI
    this.renderTemplates();
    this.showNotification(`Шаблон "${name}" сохранен!`);
}
```

### 3. Функция применения шаблона ✅
```javascript
applyTemplate(templateId) {
    const template = this.templates[templateId];
    if (!template) {
        console.error('Шаблон не найден:', templateId);
        return;
    }
    
    const activeSlide = this.getActiveSlide();
    if (!activeSlide) {
        console.error('Нет активного слайда для применения шаблона');
        return;
    }
    
    // Применяем шаблон (глубокое копирование)
    activeSlide.textBlocks = this.clone(template.textBlocks);
    activeSlide.background = this.clone(template.background);
    
    // Сбрасываем выбор блока
    this.project.activeTextBlockId = null;
    
    console.log('✅ Шаблон применен:', template.name);
    
    // Обновляем UI
    this.render();
    this.showNotification(`Шаблон "${template.name}" применен!`);
}
```

### 4. Загрузка шаблонов ✅
```javascript
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
                console.error(`Ошибка загрузки шаблона ${key}:`, error);
            }
        }
    }
    
    console.log(`📋 Загружено шаблонов: ${Object.keys(this.templates).length}`);
    this.renderTemplates();
}
```

### 5. Функция клонирования ✅
```javascript
clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
```

### 6. Рендеринг шаблонов ✅
```javascript
renderTemplates() {
    const templatesList = document.getElementById('templatesList');
    if (!templatesList) return;
    
    if (Object.keys(this.templates).length === 0) {
        templatesList.innerHTML = `
            <div class="no-templates">
                <p>Нет сохраненных шаблонов</p>
                <p>Создайте дизайн и нажмите "Сохранить шаблон"</p>
            </div>
        `;
        return;
    }
    
    templatesList.innerHTML = Object.values(this.templates).map(template => `
        <div class="template-item" onclick="app.applyTemplate('${template.id}')">
            <div class="template-preview" style="background: ${template.background.color};">
                ${template.textBlocks.map(block => `
                    <div class="template-block-preview" style="
                        position: absolute;
                        left: ${block.x}%;
                        top: ${block.y}%;
                        width: ${block.width}%;
                        font-size: ${Math.max(6, block.size * 0.3)}px;
                        color: ${block.color};
                        background: rgba(255,255,255,0.8);
                        padding: 1px 2px;
                        border-radius: 2px;
                        transform: scale(0.8);
                        transform-origin: top left;
                    ">${block.text.substring(0, 15)}${block.text.length > 15 ? '...' : ''}</div>
                `).join('')}
            </div>
            
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <div class="template-details">
                    ${template.textBlocks.length} блоков • ${new Date(template.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    `).join('');
}
```

## 🎨 CSS стили для шаблонов

### Добавить в app.css ✅
```css
/* Панель шаблонов */
.templates-panel {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}

.templates-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.templates-header h3 {
    margin: 0;
    color: #495057;
    font-size: 16px;
}

/* Список шаблонов */
.templates-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
}

.template-item {
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.template-item:hover {
    border-color: #833ab4;
    transform: translateY(-2px);
}

.template-preview {
    position: relative;
    width: 100%;
    height: 60px;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
}

.template-block-preview {
    font-family: Inter, sans-serif;
    font-weight: 500;
    line-height: 1.2;
}

.template-info {
    text-align: center;
}

.template-name {
    font-weight: 600;
    font-size: 12px;
    color: #495057;
    margin-bottom: 2px;
}

.template-details {
    font-size: 10px;
    color: #6c757d;
}

.no-templates {
    text-align: center;
    padding: 20px;
    color: #6c757d;
    font-size: 14px;
}

.no-templates p {
    margin: 4px 0;
}
```

## 🔄 Обновить UI редактора

### Добавить кнопку сохранения ✅
```html
<!-- В панели инструментов редактора -->
<div class="editor-toolbar">
    <!-- ... существующие кнопки -->
    
    <button class="btn btn-success" onclick="app.saveTemplate()" title="Сохранить как шаблон">
        💾 Сохранить шаблон
    </button>
</div>
```

### Добавить панель шаблонов ✅
```html
<!-- В режиме редактирования -->
<div class="templates-panel">
    <div class="templates-header">
        <h3>Шаблоны</h3>
        <button class="btn btn-success btn-sm" onclick="app.saveTemplate()">
            💾 Сохранить
        </button>
    </div>
    
    <div class="templates-list" id="templatesList">
        <!-- Заполняется JS -->
    </div>
</div>
```

## 🚀 Инициализация

### Обновить init() ✅
```javascript
async init() {
    try {
        // ... существующий код инициализации
        
        // Загружаем шаблоны
        this.loadTemplates();
        
        console.log('✅ Приложение инициализировано');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
}
```

## 🧪 Тестирование

### Тест 1: Сохранение шаблона
```javascript
// 1. Создать слайд с текстовыми блоками
// 2. Установить фон
// 3. Нажать "Сохранить шаблон"
// 4. Проверить что шаблон появился в списке
// 5. Проверить localStorage
console.log('Шаблоны в localStorage:', 
    Object.keys(localStorage).filter(key => key.startsWith('template_'))
);
```

### Тест 2: Применение шаблона
```javascript
// 1. Выбрать шаблон из списка
// 2. Проверить что textBlocks скопировались
// 3. Проверить что background применился
// 4. Убедиться что это независимые копии (не ссылки)
```

### Тест 3: Независимость копий
```javascript
// 1. Применить шаблон
// 2. Изменить текст в блоке
// 3. Применить тот же шаблон снова
// 4. Убедиться что изменения не повлияли на шаблон
```

## 📋 Чек-лист интеграции

- [ ] Добавлены методы saveTemplate() и applyTemplate()
- [ ] Добавлен метод loadTemplates() в init()
- [ ] Добавлен метод clone() для глубокого копирования
- [ ] Добавлен метод renderTemplates()
- [ ] Добавлены CSS стили для шаблонов
- [ ] Добавлена кнопка "Сохранить шаблон" в UI
- [ ] Добавлена панель со списком шаблонов
- [ ] Протестированы все функции
- [ ] Проверена работа с localStorage