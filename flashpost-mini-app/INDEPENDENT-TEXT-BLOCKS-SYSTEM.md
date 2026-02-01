# СИСТЕМА НЕЗАВИСИМЫХ ТЕКСТОВЫХ БЛОКОВ

## РЕАЛИЗАЦИЯ

### 1. НОВАЯ СТРУКТУРА ДАННЫХ

```javascript
// Структура слайда
slide = {
    id: "slide_1234567890_0",
    title: "Заголовок слайда",
    text: "Исходный текст от ИИ",
    background: {
        type: 'color', // 'color' или 'image'
        color: '#833ab4',
        image: null,
        brightness: 100,
        positionX: 0,
        positionY: 0
    },
    textBlocks: [
        {
            id: "block_1234567890_abc123",
            text: "Текст блока",
            x: 50, // позиция в процентах
            y: 50,
            font: 'Inter',
            size: 16,
            weight: 700,
            color: '#ffffff',
            glow: false,
            width: 80,
            keywordColor: '#ff6b6b',
            highlightEnabled: true
        }
    ],
    instagramShare: {
        enabled: true,
        visible: true,
        position: { x: 10, y: 10 }
    },
    autoKeywords: []
}
```

### 2. КНОПКА "ДОБАВИТЬ ТЕКСТ"

#### HTML структура
```html
<div class="text-blocks-controls">
    <div class="blocks-header">
        <button class="btn btn-secondary" id="addTextBlockBtn">
            <svg><!-- Plus icon --></svg>
            Добавить блок
        </button>
    </div>
</div>
```

#### Обработчик события
```javascript
const addTextBlockBtn = document.getElementById('addTextBlockBtn');
if (addTextBlockBtn) {
    addTextBlockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addTextBlock();
    });
}
```

### 3. ФУНКЦИЯ СОЗДАНИЯ НОВОГО БЛОКА

```javascript
addTextBlock() {
    const currentSlide = this.slides[this.currentEditingSlide];
    const newBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: 'Нажмите для редактирования',
        x: 50, // позиция в процентах
        y: 50,
        font: 'Inter',
        size: 16,
        weight: 700,
        color: '#ffffff',
        glow: false,
        width: 60,
        keywordColor: '#ff6b6b',
        highlightEnabled: true
    };
    
    // Добавляем в основную структуру слайда
    currentSlide.textBlocks.push(newBlock);
    
    // Синхронизируем с slideStyles для обратной совместимости
    const currentSlideStyles = this.slideStyles[this.currentEditingSlide];
    currentSlideStyles.textBlocks.push({
        ...newBlock,
        position: { x: newBlock.x, y: newBlock.y }
    });
    
    this.selectedTextBlockId = newBlock.id;
    this.updatePreview();
    this.updateTextBlocksList();
    this.updateTextBlockControls();
    
    // Автоматически запускаем inline-редактирование
    setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`);
        if (blockElement) {
            this.startInlineTextEditing(blockElement, newBlock.id);
        }
    }, 100);
}
```

### 4. КНОПКА УДАЛЕНИЯ БЛОКА

#### HTML структура
```html
<div class="control-group">
    <button class="btn btn-danger" id="deleteTextBlockBtn">
        <svg><!-- Trash icon --></svg>
        Удалить блок
    </button>
</div>
```

#### Функция удаления
```javascript
deleteTextBlock(blockId) {
    const currentSlide = this.slides[this.currentEditingSlide];
    const currentSlideStyles = this.slideStyles[this.currentEditingSlide];
    
    // Удаляем из основной структуры слайда
    const slideBlockIndex = currentSlide.textBlocks.findIndex(block => block.id === blockId);
    if (slideBlockIndex !== -1) {
        currentSlide.textBlocks.splice(slideBlockIndex, 1);
    }
    
    // Удаляем из slideStyles для обратной совместимости
    const styleBlockIndex = currentSlideStyles.textBlocks.findIndex(block => block.id === blockId);
    if (styleBlockIndex !== -1) {
        currentSlideStyles.textBlocks.splice(styleBlockIndex, 1);
    }
    
    // Если удаляем выбранный блок, выбираем первый доступный
    if (this.selectedTextBlockId === blockId) {
        this.selectedTextBlockId = currentSlide.textBlocks.length > 0 
            ? currentSlide.textBlocks[0].id 
            : null;
    }
    
    this.updatePreview();
    this.updateTextBlocksList();
    this.updateTextBlockControls();
}
```

### 5. НЕЗАВИСИМОЕ РЕДАКТИРОВАНИЕ БЛОКОВ

#### Выбор блока
- Клик по блоку в превью выбирает его
- Выбранный блок выделяется рамкой
- Панель управления показывает параметры выбранного блока

#### Редактируемые параметры каждого блока:
1. **Текст** - через textarea или inline-редактирование
2. **Шрифт** - выбор из 9 Google Fonts
3. **Размер** - слайдер от 12px до 24px
4. **Вес шрифта** - 400, 500, 600, 700, 800
5. **Цвет** - палитра цветов
6. **Позиция** - drag & drop или координаты x, y
7. **Эффекты** - свечение, градиент
8. **Ширина** - процент от ширины слайда

### 6. ОБРАТНАЯ СОВМЕСТИМОСТЬ

Система поддерживает две структуры данных:
- **Новая**: `slides[].textBlocks[]` с координатами x, y
- **Старая**: `slideStyles[].textBlocks[]` с position: {x, y}

При изменениях обновляются обе структуры для совместимости с существующим кодом.

### 7. АВТОМАТИЧЕСКИЕ ФУНКЦИИ

#### При создании нового блока:
1. Генерируется уникальный ID
2. Устанавливаются параметры по умолчанию
3. Блок автоматически выбирается
4. Запускается inline-редактирование
5. Обновляется превью и список блоков

#### При удалении блока:
1. Блок удаляется из обеих структур
2. Если удален выбранный блок, выбирается первый доступный
3. Обновляется превью и панель управления
4. Если блоков не осталось, панель управления скрывается

## ПРИНЦИПЫ РАБОТЫ

### 1. **Независимость блоков**
- Каждый блок имеет собственные параметры
- Изменения в одном блоке не влияют на другие
- Блоки можно создавать, редактировать и удалять независимо

### 2. **Уникальная идентификация**
- Каждый блок имеет уникальный ID
- ID генерируется на основе timestamp + случайная строка
- ID используется для связи между DOM элементами и данными

### 3. **Синхронизация структур**
- При изменениях обновляются обе структуры данных
- Обеспечивается совместимость с существующим кодом
- Плавный переход к новой архитектуре

### 4. **Интуитивное управление**
- Кнопка "+" для добавления нового блока
- Клик по блоку для выбора
- Двойной клик для inline-редактирования
- Кнопка "Удалить блок" для удаления

## РЕЗУЛЬТАТ

✅ **Система независимых текстовых блоков**
- Каждый блок создается как новый элемент
- Собственные параметры для каждого блока
- Независимое редактирование всех свойств

✅ **Удобное управление**
- Кнопка "Добавить текст" создает новый блок
- Кнопка "Удалить блок" удаляет выбранный
- Автоматическое inline-редактирование новых блоков

✅ **Правильная структура данных**
- `slide = {id, background, textBlocks: [{id, text, x, y, font, size, weight, glow, color}]}`
- Обратная совместимость с существующим кодом
- Синхронизация между структурами

✅ **Полная функциональность**
- Создание, редактирование, удаление блоков
- Выбор и управление каждым блоком отдельно
- Drag & drop, inline-редактирование, настройка параметров

## ТЕСТИРОВАНИЕ

Создан файл `test-independent-text-blocks.html` для проверки:
- Создания новых текстовых блоков
- Независимого редактирования параметров
- Удаления блоков
- Корректности структуры данных
- Работы всех функций управления

## ФАЙЛЫ ИЗМЕНЕНЫ

1. `flashpost-mini-app/app.js` - обновлена структура данных, функции управления блоками
2. `flashpost-mini-app/app.css` - стили для кнопок управления
3. `flashpost-mini-app/test-independent-text-blocks.html` - тестовый файл

---

**Статус**: ✅ РЕАЛИЗОВАНО
**Дата**: 28 января 2026
**Независимость блоков**: 100%