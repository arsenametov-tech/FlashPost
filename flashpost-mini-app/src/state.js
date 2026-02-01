// ===== STATE MANAGEMENT MODULE =====
// Manages project state and slide CRUD operations

class StateManager {
    constructor() {
        // === ЕДИНАЯ СТРУКТУРА ПРОЕКТА (ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ) ===
        this.project = {
            slides: [],
            activeSlideId: null,
            activeTextBlockId: null,
            mode: 'start', // 'start' | 'preview' | 'edit' | 'export'
            
            // === СИСТЕМА ШАБЛОНОВ ===
            templates: [], // Массив сохраненных шаблонов
            
            // === UI ЭЛЕМЕНТЫ ===
            instagramNickname: '', // Instagram никнейм для отображения
            ctaText: 'Подпишись на @username' // CTA текст для последнего слайда
        };
        
        // === ЕДИНЫЙ УКАЗАТЕЛЬ НА АКТИВНЫЙ СЛАЙД ===
        this.currentSlideIndex = 0;
        
        // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
        this.isGenerating = false;
        this.applyToAll = false;
        
        // === СОСТОЯНИЕ DRAG & DROP ===
        this.dragState = {
            isDragging: false,
            blockId: null
        };
        
        // === СИСТЕМА КОЛБЭКОВ ДЛЯ УВЕДОМЛЕНИЯ ДРУГИХ МОДУЛЕЙ ===
        this.onPropertyChangeCallback = null;
        this.onModeChangeCallback = null;
        this.onSlideChangeCallback = null;
        
        console.log('✅ StateManager инициализирован');
    }

    // ===== СИСТЕМА КОЛБЭКОВ ДЛЯ СВЯЗИ С ДРУГИМИ МОДУЛЯМИ =====

    // Регистрация колбэка для изменений свойств
    setPropertyChangeCallback(callback) {
        this.onPropertyChangeCallback = callback;
    }

    // Регистрация колбэка для изменений режима
    setModeChangeCallback(callback) {
        this.onModeChangeCallback = callback;
    }

    // Регистрация колбэка для изменений слайда
    setSlideChangeCallback(callback) {
        this.onSlideChangeCallback = callback;
    }

    // ===== СИСТЕМА УПРАВЛЕНИЯ РЕЖИМАМИ =====

    // Установка режима приложения
    async setMode(newMode) {
        const validModes = ["start", "preview", "edit", "export"];
        
        if (!validModes.includes(newMode)) {
            console.error(`❌ Недопустимый режим: ${newMode}. Доступные: ${validModes.join(', ')}`);
            return false;
        }
        
        const oldMode = this.project.mode;
        this.project.mode = newMode;
        
        console.log(`🔄 Режим изменен: ${oldMode} → ${newMode}`);
        
        // Уведомляем подписчиков об изменении режима
        if (this.onModeChangeCallback) {
            this.onModeChangeCallback(newMode, oldMode);
        }
        
        // Для режима экспорта ждем обновления DOM
        if (newMode === 'export') {
            await this.nextTick();
        }
        
        return true;
    }
    
    // Ожидание следующего тика
    nextTick() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
    }

    // Получение текущего режима
    getMode() {
        return this.project.mode;
    }

    // Проверка режима
    isMode(mode) {
        return this.project.mode === mode;
    }

    // ===== МЕТОДЫ РАБОТЫ С UI ЭЛЕМЕНТАМИ =====

    // Установка Instagram никнейма
    setInstagramNickname(nickname) {
        this.project.instagramNickname = nickname;
        console.log(`📱 Instagram никнейм установлен: ${nickname}`);
    }

    // Получение Instagram никнейма
    getInstagramNickname() {
        return this.project.instagramNickname;
    }

    // Установка CTA текста
    setCTAText(ctaText) {
        this.project.ctaText = ctaText;
        console.log(`📢 CTA текст установлен: ${ctaText}`);
    }

    // Получение CTA текста
    getCTAText() {
        return this.project.ctaText;
    }

    // ===== МЕТОДЫ РАБОТЫ С ПРОЕКТОМ =====

    // Генерация уникального ID
    generateUID() {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // ===== МЕТОДЫ ДОСТУПА К ДАННЫМ (ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ) =====

    // Получение всего проекта (только для чтения)
    getProject() {
        return {
            slides: [...this.project.slides], // Возвращаем копию для защиты от мутаций
            activeSlideId: this.project.activeSlideId,
            activeTextBlockId: this.project.activeTextBlockId,
            mode: this.project.mode
        };
    }

    // Получение всех слайдов (только для чтения)
    getAllSlides() {
        return [...this.project.slides]; // Возвращаем копию
    }

    // Получение количества слайдов
    getSlidesCount() {
        return this.project.slides.length;
    }

    // Проверка наличия слайдов
    hasSlides() {
        return this.project.slides.length > 0;
    }

    // Получение текущего слайда по индексу
    getCurrentSlide() {
        return this.project.slides[this.currentSlideIndex] || null;
    }

    // Получение слайда по индексу
    getSlide(index) {
        return this.project.slides[index] || null;
    }

    // Получение слайда по индексу (безопасная копия)
    getSlideByIndex(index) {
        const slide = this.project.slides[index];
        return slide ? { ...slide, textBlocks: [...slide.textBlocks] } : null;
    }

    // Получение слайда по ID (безопасная копия)
    getSlideById(slideId) {
        const slide = this.project.slides.find(slide => slide.id === slideId);
        return slide ? { ...slide, textBlocks: [...slide.textBlocks] } : null;
    }

    // Получение оригинального слайда по ID (для внутренних операций)
    _getSlideByIdOriginal(slideId) {
        return this.project.slides.find(slide => slide.id === slideId);
    }

    // Установка текущего слайда по индексу
    setCurrentSlideIndex(index) {
        if (index >= 0 && index < this.project.slides.length) {
            this.currentSlideIndex = index;
            if (this.project.slides[index]) {
                this.project.activeSlideId = this.project.slides[index].id;
            }
            return true;
        }
        return false;
    }

    // Получение активного слайда (безопасная копия)
    getActiveSlide() {
        if (!this.project.activeSlideId) return null;
        const slide = this.project.slides.find(slide => slide.id === this.project.activeSlideId);
        return slide ? { ...slide, textBlocks: [...slide.textBlocks] } : null;
    }

    // Получение оригинального активного слайда (для внутренних операций)
    _getActiveSlideOriginal() {
        if (!this.project.activeSlideId) return null;
        return this.project.slides.find(slide => slide.id === this.project.activeSlideId);
    }

    // Получение слайда по индексу
    getSlideByIndex(index) {
        return this.project.slides[index] || null;
    }

    // Получение индекса активного слайда
    getActiveSlideIndex() {
        if (!this.project.activeSlideId) return 0;
        return this.project.slides.findIndex(slide => slide.id === this.project.activeSlideId);
    }

    // Установка активного слайда
    setActiveSlide(slideId) {
        const slide = this.getSlideById(slideId);
        if (slide) {
            this.project.activeSlideId = slideId;
            console.log(`✅ Активный слайд: ${slideId}`);
            return true;
        }
        console.warn(`⚠️ Слайд ${slideId} не найден`);
        return false;
    }

    // Установка активного слайда по индексу
    setActiveSlideByIndex(index) {
        const slide = this.getSlideByIndex(index);
        if (slide) {
            this.project.activeSlideId = slide.id;
            console.log(`✅ Активный слайд по индексу ${index}: ${slide.id}`);
            return true;
        }
        console.warn(`⚠️ Слайд с индексом ${index} не найден`);
        return false;
    }

    // Получение активного текстового блока
    getActiveTextBlock() {
        if (!this.project.activeTextBlockId) return null;
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return null;
        return activeSlide.textBlocks.find(block => block.id === this.project.activeTextBlockId);
    }

    // Установка активного текстового блока
    setActiveTextBlock(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (block) {
            this.project.activeTextBlockId = blockId;
            console.log(`✅ Активный текстовый блок: ${blockId}`);
            return true;
        }
        console.warn(`⚠️ Текстовый блок ${blockId} не найден`);
        return false;
    }

    // Создание нового слайда
    createSlide(data = {}) {
        const slideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        const newSlide = {
            id: slideId,
            title: data.title || 'Новый слайд',
            text: data.text || 'Текст слайда',
            background: {
                type: data.background?.type || 'color',
                color: data.background?.color || '#833ab4',
                image: data.background?.image || null,
                x: data.background?.x || 50,
                y: data.background?.y || 50,
                brightness: data.background?.brightness || 100
            },
            textBlocks: data.textBlocks || [],
            autoKeywords: data.autoKeywords || []
        };
        
        this.project.slides.push(newSlide);
        
        // Устанавливаем как активный если это первый слайд
        if (this.project.slides.length === 1) {
            this.project.activeSlideId = slideId;
        }
        
        console.log(`✅ Создан слайд: ${slideId}`);
        return newSlide;
    }

    // Создание нового текстового блока с полной поддержкой независимых свойств
    createTextBlock(slideId, data = {}) {
        const slide = this._getSlideByIdOriginal(slideId);
        if (!slide) return null;
        
        const blockId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        const newBlock = {
            id: blockId,
            text: data.text || 'Новый текст',
            
            // Позиционирование
            x: data.x || 50,
            y: data.y || 50,
            width: data.width || 80,
            height: data.height || 'auto',
            
            // Независимые свойства шрифта
            font: data.font || 'Inter',
            size: data.size || 16,
            weight: data.weight || 700,
            style: data.style || 'normal', // normal, italic
            
            // Независимые цвета
            color: data.color || '#ffffff',
            backgroundColor: data.backgroundColor || 'transparent',
            
            // ===== СИСТЕМА ДВОЙНОЙ ПОДСВЕТКИ КЛЮЧЕВЫХ СЛОВ =====
            keywordHighlighting: {
                // Настройки автоматической подсветки (AI)
                autoHighlight: data.keywordHighlighting?.autoHighlight !== undefined ? 
                              data.keywordHighlighting.autoHighlight : true,
                autoKeywordColor: data.keywordHighlighting?.autoKeywordColor || '#4A90E2', // Синий для AI
                
                // Настройки ручной подсветки
                keywordColor: data.keywordHighlighting?.keywordColor || '#E74C3C', // Красный для ручных
                
                // Эффекты подсветки
                glowEnabled: data.keywordHighlighting?.glowEnabled !== undefined ? 
                            data.keywordHighlighting.glowEnabled : true,
                glowIntensity: data.keywordHighlighting?.glowIntensity || 0.3
            },
            
            // Независимые эффекты
            effects: {
                shadow: data.effects?.shadow || {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.3)',
                    offsetX: 0,
                    offsetY: 1,
                    blur: 3
                },
                outline: data.effects?.outline || {
                    enabled: false,
                    color: '#000000',
                    width: 1
                },
                glow: data.effects?.glow || {
                    enabled: false,
                    color: '#ffffff',
                    intensity: 0.5
                },
                gradient: data.effects?.gradient || {
                    enabled: false,
                    type: 'linear', // linear, radial
                    colors: ['#ffffff', '#cccccc'],
                    direction: 'to bottom'
                }
            },
            
            // Выравнивание и форматирование
            textAlign: data.textAlign || 'center',
            lineHeight: data.lineHeight || 1.2,
            letterSpacing: data.letterSpacing || 0,
            wordSpacing: data.wordSpacing || 0,
            
            // Дополнительные свойства
            rotation: data.rotation || 0,
            opacity: data.opacity || 1,
            zIndex: data.zIndex || 10,
            
            // Метаданные для редактирования
            isEditing: false,
            lastModified: Date.now(),
            version: 1
        };
        
        slide.textBlocks.push(newBlock);
        
        console.log(`✅ Создан текстовый блок с независимыми свойствами: ${blockId} в слайде ${slideId}`);
        return newBlock;
    }

    // ===== БЕЗОПАСНЫЕ МЕТОДЫ МУТАЦИИ ТЕКСТОВЫХ БЛОКОВ =====

    // Добавление текстового блока к слайду (безопасный метод)
    addTextBlockToSlide(slideId, blockData) {
        const slide = this._getSlideByIdOriginal(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден для добавления блока`);
            return null;
        }

        const newBlock = this.createTextBlock(slideId, blockData);
        
        // КРИТИЧЕСКИ ВАЖНО: Принудительно добавляем блок в DOM если это активный слайд
        if (this.project.activeSlideId === slideId) {
            this.forceAddBlockToDOM(newBlock);
        }
        
        // Уведомляем подписчиков об изменении
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback({
                blockId: newBlock.id,
                property: 'created',
                newValue: newBlock,
                oldValue: null,
                timestamp: Date.now()
            });
        }

        return newBlock;
    }

    // Обновление текстового блока в слайде (безопасный метод)
    updateTextBlockInSlide(slideId, blockId, updates) {
        const slide = this._getSlideByIdOriginal(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден для обновления блока`);
            return false;
        }

        const block = slide.textBlocks.find(b => b.id === blockId);
        if (!block) {
            console.warn(`⚠️ Блок ${blockId} не найден в слайде ${slideId}`);
            return false;
        }

        // Применяем обновления
        Object.entries(updates).forEach(([key, value]) => {
            const oldValue = this.getNestedProperty(block, key);
            this.setNestedProperty(block, key, value);
            
            // Уведомляем подписчиков об изменении каждого свойства
            if (this.onPropertyChangeCallback) {
                this.onPropertyChangeCallback({
                    blockId,
                    property: key,
                    newValue: value,
                    oldValue,
                    timestamp: Date.now()
                });
            }
        });

        // Обновляем метаданные
        block.lastModified = Date.now();
        block.version += 1;

        console.log(`✅ Обновлен блок ${blockId} в слайде ${slideId}`);
        return true;
    }

    // Удаление текстового блока из слайда (безопасный метод)
    deleteTextBlockFromSlide(slideId, blockId) {
        const slide = this._getSlideByIdOriginal(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден для удаления блока`);
            return false;
        }

        const blockIndex = slide.textBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) {
            console.warn(`⚠️ Блок ${blockId} не найден в слайде ${slideId}`);
            return false;
        }

        const removedBlock = slide.textBlocks.splice(blockIndex, 1)[0];
        
        // Если удаляем активный блок, сбрасываем активность
        if (this.project.activeTextBlockId === blockId) {
            this.project.activeTextBlockId = null;
        }

        // Уведомляем подписчиков об удалении
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback({
                blockId,
                property: 'deleted',
                newValue: null,
                oldValue: removedBlock,
                timestamp: Date.now()
            });
        }

        console.log(`✅ Удален блок ${blockId} из слайда ${slideId}`);
        return true;
    }

    // Перемещение текстового блока (безопасный метод)
    moveTextBlock(slideId, blockId, newPosition) {
        return this.updateTextBlockInSlide(slideId, blockId, {
            x: newPosition.x,
            y: newPosition.y,
            width: newPosition.width || undefined
        });
    }

    // Добавление текстового блока с полной поддержкой независимых свойств
    addTextBlock() {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) {
            console.warn('⚠️ Нет активного слайда для добавления блока');
            return null;
        }

        // Умное позиционирование: размещаем новый блок ниже текущего
        const smartPosition = this.calculateSmartPosition();

        const newBlock = {
            id: this.generateUID(),
            text: 'Новый текст',
            
            // Умное позиционирование
            x: smartPosition.x,
            y: smartPosition.y,
            width: 80,
            height: 'auto',
            
            // Независимые свойства шрифта
            font: 'Inter',
            size: 32,
            weight: 700,
            style: 'normal',
            
            // Независимые цвета
            color: '#ffffff',
            backgroundColor: 'transparent',
            
            // Независимые эффекты
            effects: {
                shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.3)',
                    offsetX: 0,
                    offsetY: 1,
                    blur: 3
                },
                outline: {
                    enabled: false,
                    color: '#000000',
                    width: 1
                },
                glow: {
                    enabled: false,
                    color: '#ffffff',
                    intensity: 0.5
                },
                gradient: {
                    enabled: false,
                    type: 'linear',
                    colors: ['#ffffff', '#cccccc'],
                    direction: 'to bottom'
                }
            },
            
            // ===== СИСТЕМА ДВОЙНОЙ ПОДСВЕТКИ КЛЮЧЕВЫХ СЛОВ =====
            keywordHighlighting: {
                // Настройки автоматической подсветки (AI)
                autoHighlight: true,
                autoKeywordColor: '#4A90E2', // Синий для AI
                
                // Настройки ручной подсветки
                keywordColor: '#E74C3C', // Красный для ручных
                
                // Эффекты подсветки
                glowEnabled: true,
                glowIntensity: 0.3
            },
            
            // Выравнивание и форматирование
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: 0,
            wordSpacing: 0,
            
            // Дополнительные свойства
            rotation: 0,
            opacity: 1,
            zIndex: 10,
            
            // Метаданные для редактирования
            isEditing: false,
            lastModified: Date.now(),
            version: 1
        };

        activeSlide.textBlocks.push(newBlock);
        
        // Устанавливаем новый блок как активный
        this.project.activeTextBlockId = newBlock.id;
        
        console.log(`✅ Добавлен текстовый блок с умным позиционированием: ${newBlock.id} в позиции (${smartPosition.x}%, ${smartPosition.y}%)`);
        
        // КРИТИЧЕСКИ ВАЖНО: Принудительно добавляем блок в DOM
        this.forceAddBlockToDOM(newBlock);
        
        // Уведомляем подписчиков о добавлении
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback({
                blockId: newBlock.id,
                property: 'created',
                newValue: newBlock,
                oldValue: null,
                timestamp: Date.now()
            });
        }
        
        return newBlock;
    }

    // Принудительное добавление блока в DOM
    forceAddBlockToDOM(block) {
        try {
            // Находим слайд в режиме редактирования
            const editSlide = document.querySelector('.slide.editable');
            if (!editSlide) {
                console.warn('⚠️ Не найден редактируемый слайд для добавления блока');
                return;
            }

            // Создаем элемент блока
            const blockEl = document.createElement('div');
            blockEl.className = 'slide-text-block-editable draggable-text-block';
            blockEl.dataset.blockId = block.id;
            blockEl.contentEditable = false;
            
            // Применяем стили
            blockEl.style.position = 'absolute';
            blockEl.style.left = block.x + '%';
            blockEl.style.top = block.y + '%';
            blockEl.style.width = block.width + '%';
            blockEl.style.height = block.height === 'auto' ? 'auto' : block.height + '%';
            blockEl.style.transform = 'translate(-50%, -50%)';
            blockEl.style.zIndex = block.zIndex || 10;
            blockEl.style.opacity = block.opacity || 1;
            
            // Стили шрифта
            blockEl.style.fontFamily = block.font || 'Inter';
            blockEl.style.fontSize = (block.size || 32) + 'px';
            blockEl.style.fontWeight = block.weight || 700;
            blockEl.style.color = block.color || '#ffffff';
            blockEl.style.textAlign = block.textAlign || 'center';
            blockEl.style.lineHeight = block.lineHeight || 1.2;
            blockEl.style.wordWrap = 'break-word';
            blockEl.style.userSelect = 'none';
            blockEl.style.cursor = 'grab';
            
            // Устанавливаем текст
            blockEl.textContent = block.text;
            
            // Добавляем ручку для изменения размера
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'text-block-resize-handle';
            resizeHandle.style.cssText = `
                position: absolute;
                bottom: -5px;
                right: -5px;
                width: 10px;
                height: 10px;
                background: #833ab4;
                border-radius: 50%;
                cursor: se-resize;
                opacity: 0.7;
            `;
            blockEl.appendChild(resizeHandle);
            
            // Добавляем в DOM
            editSlide.appendChild(blockEl);
            
            console.log(`🎯 Блок ${block.id} принудительно добавлен в DOM`);
            
            // Привязываем события через небольшую задержку
            setTimeout(() => {
                if (window.flashPostApp && window.flashPostApp.dragManager) {
                    window.flashPostApp.dragManager.bindTextBlockDragEvents(blockEl, block.id);
                }
            }, 100);
            
        } catch (error) {
            console.error(`❌ Ошибка принудительного добавления блока ${block.id} в DOM:`, error);
        }
    }

    // Умное позиционирование нового блока ниже текущего
    calculateSmartPosition() {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide || activeSlide.textBlocks.length === 0) {
            // Первый блок - по центру
            return { x: 50, y: 30 };
        }

        // Находим самый нижний блок
        let lowestY = 0;
        let lowestBlock = null;
        
        activeSlide.textBlocks.forEach(block => {
            if (block.y > lowestY) {
                lowestY = block.y;
                lowestBlock = block;
            }
        });

        // Размещаем новый блок ниже самого нижнего
        const newY = Math.min(lowestY + 15, 85); // 15% отступ, максимум 85%
        const newX = lowestBlock ? lowestBlock.x : 50; // Выравниваем по X с предыдущим блоком

        return { x: newX, y: newY };
    }

    // Обновление свойства слайда
    updateSlideProperty(slideId, property, value) {
        const slide = this._getSlideByIdOriginal(slideId);
        if (!slide) return false;
        
        // Поддержка вложенных свойств (например, 'background.color')
        const keys = property.split('.');
        let target = slide;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        console.log(`✅ Обновлено свойство ${property} слайда ${slideId}:`, value);
        return true;
    }

    // Обновление свойства текстового блока с поддержкой всех независимых свойств
    updateTextBlockProperty(blockId, property, value) {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return false;
        
        // Поддержка вложенных свойств (например, 'effects.shadow.enabled')
        const keys = property.split('.');
        let target = block;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
                // Создаем вложенный объект если его нет
                target[keys[i]] = {};
            }
            target = target[keys[i]];
        }
        
        const finalKey = keys[keys.length - 1];
        const oldValue = target[finalKey];
        target[finalKey] = value;
        
        // Обновляем метаданные
        block.lastModified = Date.now();
        block.version += 1;
        
        console.log(`✅ Обновлено свойство ${property} блока ${blockId}: ${oldValue} → ${value}`);
        
        // Вызываем хуки для обновления свойств
        this.triggerTextBlockPropertyHook(blockId, property, value, oldValue);
        
        return true;
    }

    // Хук для обработки изменений свойств текстового блока
    triggerTextBlockPropertyHook(blockId, property, newValue, oldValue) {
        // Подготовка для будущих хуков
        const hookData = {
            blockId,
            property,
            newValue,
            oldValue,
            timestamp: Date.now()
        };
        
        console.log(`🎣 Хук изменения свойства: ${property} для блока ${blockId}`);
        
        // Уведомляем подписчиков об изменении (вместо прямого DOM манипулирования)
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // КРИТИЧЕСКИ ВАЖНО: Принудительно обновляем DOM для этого блока
        this.forceUpdateBlockInDOM(blockId);
    }

    // Принудительное обновление блока в DOM
    forceUpdateBlockInDOM(blockId) {
        try {
            const activeSlide = this._getActiveSlideOriginal();
            if (!activeSlide) return;

            const block = activeSlide.textBlocks.find(b => b.id === blockId);
            if (!block) return;

            // Находим все элементы этого блока в DOM
            const blockElements = document.querySelectorAll(`[data-block-id="${blockId}"]`);
            
            blockElements.forEach(blockEl => {
                // Обновляем позицию
                blockEl.style.left = block.x + '%';
                blockEl.style.top = block.y + '%';
                blockEl.style.width = block.width + '%';
                
                // Обновляем текст
                if (blockEl.textContent !== block.text) {
                    blockEl.textContent = block.text;
                }
                
                // Обновляем стили шрифта
                blockEl.style.fontFamily = block.font || 'Inter';
                blockEl.style.fontSize = (block.size || 16) + 'px';
                blockEl.style.fontWeight = block.weight || 700;
                blockEl.style.color = block.color || '#ffffff';
                
                console.log(`🔄 DOM принудительно обновлен для блока ${blockId}`);
            });
            
        } catch (error) {
            console.error(`❌ Ошибка принудительного обновления DOM для блока ${blockId}:`, error);
        }
    }

    // Удаление текстового блока
    deleteTextBlock(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const blockIndex = activeSlide.textBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return false;
        
        activeSlide.textBlocks.splice(blockIndex, 1);
        
        // Если удаляем активный блок, сбрасываем активность
        if (this.project.activeTextBlockId === blockId) {
            this.project.activeTextBlockId = null;
        }
        
        console.log(`✅ Удален текстовый блок: ${blockId}`);
        return true;
    }

    // Очистка проекта
    clearProject() {
        this.project.slides = [];
        this.project.activeSlideId = null;
        this.project.activeTextBlockId = null;
        this.currentSlideIndex = 0;
        
        // Сбрасываем состояние drag & drop
        this.dragState = {
            isDragging: false,
            blockId: null
        };
        
        console.log('✅ Проект очищен');
    }

    // ===== УПРАВЛЕНИЕ СОСТОЯНИЕМ DRAG & DROP =====

    // Установка состояния перетаскивания
    setDragState(blockId, isDragging) {
        this.dragState.blockId = blockId;
        this.dragState.isDragging = isDragging;
        
        if (isDragging && blockId) {
            // Устанавливаем блок как активный при начале перетаскивания
            this.setActiveTextBlock(blockId);
            console.log(`🎯 Начато перетаскивание блока: ${blockId}`);
        } else {
            console.log('✅ Перетаскивание завершено');
        }
    }

    // Получение состояния перетаскивания
    getDragState() {
        return { ...this.dragState };
    }

    // Получение состояния для экспорта
    getProjectState() {
        return {
            slides: this.project.slides,
            activeSlideId: this.project.activeSlideId,
            activeTextBlockId: this.project.activeTextBlockId,
            mode: this.project.mode,
            currentSlideIndex: this.currentSlideIndex
        };
    }

    // Загрузка состояния проекта
    loadProjectState(state) {
        if (state.slides) this.project.slides = state.slides;
        if (state.activeSlideId) this.project.activeSlideId = state.activeSlideId;
        if (state.activeTextBlockId) this.project.activeTextBlockId = state.activeTextBlockId;
        if (state.mode) this.project.mode = state.mode;
        if (typeof state.currentSlideIndex === 'number') this.currentSlideIndex = state.currentSlideIndex;
        
        console.log('✅ Состояние проекта загружено');
    }
    // ===== РАСШИРЕННЫЕ МЕТОДЫ ДЛЯ ТЕКСТОВЫХ БЛОКОВ =====

    // Получение полных свойств текстового блока
    getTextBlockProperties(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return null;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return null;
        
        return {
            // Основные свойства
            id: block.id,
            text: block.text,
            
            // Позиционирование
            position: {
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                rotation: block.rotation,
                zIndex: block.zIndex
            },
            
            // Шрифт
            typography: {
                font: block.font,
                size: block.size,
                weight: block.weight,
                style: block.style,
                textAlign: block.textAlign,
                lineHeight: block.lineHeight,
                letterSpacing: block.letterSpacing,
                wordSpacing: block.wordSpacing
            },
            
            // Цвета
            colors: {
                text: block.color,
                background: block.backgroundColor
            },
            
            // Эффекты
            effects: block.effects,
            
            // Дополнительные свойства
            opacity: block.opacity,
            
            // Метаданные
            metadata: {
                isEditing: block.isEditing,
                lastModified: block.lastModified,
                version: block.version
            }
        };
    }

    // Применение множественных свойств к текстовому блоку
    updateTextBlockProperties(blockId, properties) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return false;
        
        const changes = [];
        
        // Применяем все изменения
        Object.entries(properties).forEach(([key, value]) => {
            const oldValue = this.getNestedProperty(block, key);
            this.setNestedProperty(block, key, value);
            changes.push({ property: key, oldValue, newValue: value });
        });
        
        // Обновляем метаданные
        block.lastModified = Date.now();
        block.version += 1;
        
        console.log(`✅ Обновлено ${changes.length} свойств блока ${blockId}`);
        
        // Вызываем хук для множественных изменений
        this.triggerTextBlockBatchUpdateHook(blockId, changes);
        
        return true;
    }

    // Установка режима редактирования для текстового блока
    setTextBlockEditMode(blockId, isEditing) {
        return this.updateTextBlockProperty(blockId, 'isEditing', isEditing);
    }

    // Получение всех текстовых блоков в режиме редактирования
    getEditingTextBlocks() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return [];
        
        return activeSlide.textBlocks.filter(block => block.isEditing);
    }

    // Сброс режима редактирования для всех блоков
    clearAllEditModes() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        let cleared = 0;
        activeSlide.textBlocks.forEach(block => {
            if (block.isEditing) {
                block.isEditing = false;
                cleared++;
            }
        });
        
        console.log(`✅ Сброшен режим редактирования для ${cleared} блоков`);
        return cleared > 0;
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ВЛОЖЕННЫМИ СВОЙСТВАМИ =====

    // Получение вложенного свойства
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Установка вложенного свойства
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    // ===== ХУКИ ДЛЯ РАСШИРЕННЫХ ФУНКЦИЙ =====

    // Хук для множественных изменений свойств
    triggerTextBlockBatchUpdateHook(blockId, changes) {
        const hookData = {
            blockId,
            changes,
            timestamp: Date.now()
        };
        
        console.log(`🎣 Хук множественного обновления для блока ${blockId}: ${changes.length} изменений`);
        
        // Подготовка для будущих хуков:
        // - template saving
        // - keyword highlighting refresh
        // - drag stabilization
        // - performance optimization
    }

    // Хук для сохранения шаблонов (подготовка)
    prepareSaveTemplateHook() {
        // Будет реализован позже
        console.log('🎣 Подготовка хука сохранения шаблонов');
    }

    // Хук для подсветки ключевых слов (подготовка)
    prepareKeywordHighlightingHook() {
        // Будет реализован позже
        console.log('🎣 Подготовка хука подсветки ключевых слов');
    }

    // Хук для стабилизации drag & drop (подготовка)
    prepareDragStabilizationHook() {
        // Будет реализован позже
        console.log('🎣 Подготовка хука стабилизации drag & drop');
    }

    // ===== МЕТОДЫ ДЛЯ AI ГЕНЕРАЦИИ =====

    // Создание слайдов из AI результата
    createSlidesFromAI(aiResult) {
        console.log('🤖 Создание слайдов из AI результата...');
        console.log('🔍 Полученный aiResult:', aiResult);
        
        if (!aiResult) {
            console.error('❌ aiResult is null or undefined');
            return false;
        }
        
        if (!aiResult.slides) {
            console.error('❌ aiResult.slides is missing');
            console.log('Available properties:', Object.keys(aiResult));
            return false;
        }
        
        if (!Array.isArray(aiResult.slides)) {
            console.error('❌ aiResult.slides is not an array, it is:', typeof aiResult.slides);
            console.log('aiResult.slides value:', aiResult.slides);
            return false;
        }

        console.log(`✅ Валидация прошла успешно. Создаем ${aiResult.slides.length} слайдов...`);

        // Очищаем текущий проект
        this.clearProject();

        // Создаем слайды из AI результата
        aiResult.slides.forEach((slideData, index) => {
            console.log(`🔧 Создание слайда ${index + 1}:`, slideData);
            
            const newSlide = this.createSlide({
                title: slideData.title,
                text: slideData.text,
                background: slideData.background || {
                    type: 'color',
                    color: this.getSlideColor(index)
                },
                textBlocks: slideData.textBlocks || [{
                    id: `ai_block_${Date.now()}_${index}`,
                    text: slideData.text,
                    x: 50,
                    y: 50,
                    width: 85,
                    height: 'auto',
                    font: 'Inter',
                    size: 18,
                    weight: 600,
                    color: '#ffffff',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    effects: {
                        shadow: {
                            enabled: true,
                            color: 'rgba(0, 0, 0, 0.3)',
                            offsetX: 0,
                            offsetY: 2,
                            blur: 4
                        }
                    }
                }],
                autoKeywords: slideData.autoKeywords || []
            });

            console.log(`✅ Создан AI слайд ${index + 1}: ${newSlide.id}`);
        });

        // Устанавливаем первый слайд как активный
        if (this.project.slides.length > 0) {
            this.setCurrentSlideIndex(0);
            this.setMode('preview');
        }

        console.log(`✅ Создано ${this.project.slides.length} слайдов из AI`);
        
        // Вызываем рендеринг слайдов
        this.renderSlides();
        
        return true;
    }

    // Получение цвета слайда по индексу
    getSlideColor(index) {
        const colors = [
            'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
            'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        ];
        
        return colors[index % colors.length];
    }

    // Вызов рендеринга слайдов (без DOM манипуляций)
    renderSlides() {
        console.log('🎨 Вызов рендеринга слайдов...');
        
        // Уведомляем подписчиков о необходимости рендеринга
        if (this.onSlideChangeCallback) {
            this.onSlideChangeCallback({
                action: 'render_all',
                slides: this.getAllSlides(),
                activeSlideIndex: this.currentSlideIndex,
                timestamp: Date.now()
            });
        }

        // Отправляем событие для других компонентов
        const renderEvent = new CustomEvent('slidesGenerated', {
            detail: {
                slides: this.getAllSlides(),
                activeSlideIndex: this.currentSlideIndex,
                mode: this.getMode()
            }
        });
        
        if (typeof document !== 'undefined') {
            document.dispatchEvent(renderEvent);
        }

        console.log('✅ Рендеринг слайдов инициирован');
    }

    // Валидация свойств текстового блока
    validateTextBlockProperties(properties) {
        const validationRules = {
            // Позиционирование
            x: { type: 'number', min: 0, max: 100 },
            y: { type: 'number', min: 0, max: 100 },
            width: { type: 'number', min: 10, max: 100 },
            rotation: { type: 'number', min: -360, max: 360 },
            
            // Шрифт
            size: { type: 'number', min: 8, max: 200 },
            weight: { type: 'number', min: 100, max: 900 },
            lineHeight: { type: 'number', min: 0.5, max: 3 },
            letterSpacing: { type: 'number', min: -5, max: 10 },
            
            // Эффекты
            opacity: { type: 'number', min: 0, max: 1 },
            zIndex: { type: 'number', min: 1, max: 1000 }
        };
        
        const errors = [];
        
        Object.entries(properties).forEach(([key, value]) => {
            const rule = validationRules[key];
            if (rule) {
                if (typeof value !== rule.type) {
                    errors.push(`${key} должно быть типа ${rule.type}`);
                }
                if (rule.min !== undefined && value < rule.min) {
                    errors.push(`${key} не может быть меньше ${rule.min}`);
                }
                if (rule.max !== undefined && value > rule.max) {
                    errors.push(`${key} не может быть больше ${rule.max}`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Безопасное обновление свойств с валидацией
    safeUpdateTextBlockProperty(blockId, property, value) {
        const validation = this.validateTextBlockProperties({ [property]: value });
        
        if (!validation.isValid) {
            console.warn(`⚠️ Валидация не пройдена для ${property}:`, validation.errors);
            return false;
        }
        
        return this.updateTextBlockProperty(blockId, property, value);
    }

    // ===== TEXT WIDTH CONTROL SYSTEM =====

    // Update text block width (20-100%)
    updateTextBlockWidth(blockId, widthPercent) {
        // Validate width range
        const clampedWidth = Math.max(20, Math.min(100, widthPercent));
        
        if (clampedWidth !== widthPercent) {
            console.warn(`⚠️ Width clamped from ${widthPercent}% to ${clampedWidth}%`);
        }
        
        const success = this.updateTextBlockProperty(blockId, 'width', clampedWidth);
        
        if (success) {
            console.log(`✅ Text block width updated: ${blockId} → ${clampedWidth}%`);
            
            // Trigger live preview update
            this.triggerWidthChangeHook(blockId, clampedWidth, widthPercent);
        }
        
        return success;
    }

    // Get current text block width
    getTextBlockWidth(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return null;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        return block ? block.width : null;
    }

    // Set width for active text block
    setActiveBlockWidth(widthPercent) {
        if (!this.project.activeTextBlockId) {
            console.warn('⚠️ No active text block to resize');
            return false;
        }
        
        return this.updateTextBlockWidth(this.project.activeTextBlockId, widthPercent);
    }

    // Get width of active text block
    getActiveBlockWidth() {
        if (!this.project.activeTextBlockId) {
            return null;
        }
        
        return this.getTextBlockWidth(this.project.activeTextBlockId);
    }

    // Batch update multiple blocks width (for "apply to all" functionality)
    updateAllBlocksWidth(widthPercent) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide || !activeSlide.textBlocks) {
            console.warn('⚠️ No active slide or text blocks to resize');
            return false;
        }

        const clampedWidth = Math.max(20, Math.min(100, widthPercent));
        let updatedCount = 0;

        activeSlide.textBlocks.forEach(block => {
            const success = this.updateTextBlockProperty(block.id, 'width', clampedWidth);
            if (success) {
                updatedCount++;
            }
        });

        console.log(`✅ Updated width for ${updatedCount} text blocks to ${clampedWidth}%`);
        
        // Trigger batch update hook
        this.triggerBatchWidthChangeHook(activeSlide.textBlocks.map(b => b.id), clampedWidth);
        
        return updatedCount > 0;
    }

    // Validate width value
    validateWidth(width) {
        if (typeof width !== 'number') {
            return { valid: false, error: 'Width must be a number' };
        }
        
        if (width < 20) {
            return { valid: false, error: 'Width cannot be less than 20%' };
        }
        
        if (width > 100) {
            return { valid: false, error: 'Width cannot be greater than 100%' };
        }
        
        return { valid: true };
    }

    // Hook for width change events (for live preview)
    triggerWidthChangeHook(blockId, newWidth, originalWidth) {
        const hookData = {
            blockId,
            property: 'width',
            newValue: newWidth,
            originalValue: originalWidth,
            timestamp: Date.now(),
            type: 'width_change'
        };
        
        console.log(`🎣 Width change hook: Block ${blockId} → ${newWidth}%`);
        
        // Notify subscribers for live preview
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event for UI components
        if (typeof document !== 'undefined') {
            const widthChangeEvent = new CustomEvent('textBlockWidthChanged', {
                detail: hookData
            });
            document.dispatchEvent(widthChangeEvent);
        }
        
        // Force DOM update for live preview
        this.forceUpdateBlockInDOM(blockId);
    }

    // Hook for batch width changes
    triggerBatchWidthChangeHook(blockIds, newWidth) {
        const hookData = {
            blockIds,
            property: 'width',
            newValue: newWidth,
            timestamp: Date.now(),
            type: 'batch_width_change'
        };
        
        console.log(`🎣 Batch width change hook: ${blockIds.length} blocks → ${newWidth}%`);
        
        // Notify subscribers
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event
        if (typeof document !== 'undefined') {
            const batchWidthChangeEvent = new CustomEvent('batchTextBlockWidthChanged', {
                detail: hookData
            });
            document.dispatchEvent(batchWidthChangeEvent);
        }
        
        // Force DOM update for all blocks
        blockIds.forEach(blockId => {
            this.forceUpdateBlockInDOM(blockId);
        });
    }

    // Get width statistics for current slide
    getSlideWidthStats() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide || !activeSlide.textBlocks || activeSlide.textBlocks.length === 0) {
            return null;
        }

        const widths = activeSlide.textBlocks.map(block => block.width || 80);
        
        return {
            min: Math.min(...widths),
            max: Math.max(...widths),
            average: Math.round(widths.reduce((sum, w) => sum + w, 0) / widths.length),
            count: widths.length,
            widths: widths
        };
    }

    // Reset all blocks to default width
    resetAllBlocksWidth(defaultWidth = 80) {
        return this.updateAllBlocksWidth(defaultWidth);
    }

    // ===== TEMPLATE SYSTEM METHODS =====

    // Получение всех шаблонов
    getTemplates() {
        return [...this.project.templates]; // Возвращаем копию для защиты от мутаций
    }

    // Добавление шаблона в проект
    addTemplate(template) {
        if (!template || !template.name) {
            console.warn('⚠️ Некорректный шаблон для добавления');
            return false;
        }

        // Проверяем, не существует ли уже шаблон с таким именем
        const existingIndex = this.project.templates.findIndex(t => t.name === template.name);
        
        if (existingIndex !== -1) {
            // Обновляем существующий шаблон
            this.project.templates[existingIndex] = template;
            console.log(`🔄 Обновлен шаблон: ${template.name}`);
        } else {
            // Добавляем новый шаблон
            this.project.templates.push(template);
            console.log(`➕ Добавлен шаблон: ${template.name}`);
        }

        return true;
    }

    // Получение шаблона по имени
    getTemplateByName(name) {
        return this.project.templates.find(t => t.name === name) || null;
    }

    // Удаление шаблона
    removeTemplate(name) {
        const index = this.project.templates.findIndex(t => t.name === name);
        if (index !== -1) {
            const removed = this.project.templates.splice(index, 1)[0];
            console.log(`🗑️ Удален шаблон: ${name}`);
            return removed;
        }
        return null;
    }

    // Очистка всех шаблонов
    clearTemplates() {
        this.project.templates = [];
        console.log('🗑️ Все шаблоны очищены');
    }

    // ===== MANUAL TEXT BLOCK SYSTEM =====

    // Add manual text block with empty text and default settings
    addManualTextBlock() {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) {
            console.warn('⚠️ No active slide for adding manual text block');
            return null;
        }

        // Calculate smart position for new block
        const smartPosition = this.calculateSmartPosition();

        const newBlock = {
            id: this.generateUID(),
            text: '', // Empty text for manual input
            
            // Smart positioning
            x: smartPosition.x,
            y: smartPosition.y,
            width: 80, // Default width
            height: 'auto',
            
            // Default font settings
            font: 'Inter',
            size: 18,
            weight: 500,
            style: 'normal',
            
            // Default colors
            color: '#ffffff',
            backgroundColor: 'transparent',
            
            // Default effects
            effects: {
                shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.3)',
                    offsetX: 0,
                    offsetY: 2,
                    blur: 4
                },
                outline: {
                    enabled: false,
                    color: '#000000',
                    width: 1
                },
                glow: {
                    enabled: false,
                    color: '#ffffff',
                    intensity: 0.5
                }
            },
            
            // Keyword highlighting (disabled by default for manual blocks)
            keywordHighlighting: {
                autoHighlight: false, // Manual blocks don't auto-highlight
                autoKeywordColor: '#4A90E2',
                keywordColor: '#E74C3C',
                glowEnabled: false,
                glowIntensity: 0.3
            },
            
            // Text formatting
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: 0,
            wordSpacing: 0,
            
            // Additional properties
            rotation: 0,
            opacity: 1,
            zIndex: 10,
            
            // Manual block metadata
            isManual: true, // Flag to identify manual blocks
            isEditing: true, // Start in editing mode
            lastModified: Date.now(),
            version: 1
        };

        activeSlide.textBlocks.push(newBlock);
        
        // Set as active block for immediate editing
        this.project.activeTextBlockId = newBlock.id;
        
        console.log(`✅ Added manual text block: ${newBlock.id} at position (${smartPosition.x}%, ${smartPosition.y}%)`);
        
        // Trigger creation hooks
        this.triggerManualBlockCreationHook(newBlock);
        
        return newBlock;
    }

    // Update manual text block text (with independence validation)
    updateManualBlockText(blockId, newText) {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) {
            console.warn(`⚠️ Block ${blockId} not found for text update`);
            return false;
        }
        
        const oldText = block.text;
        block.text = newText;
        block.lastModified = Date.now();
        block.version += 1;
        
        console.log(`✅ Updated manual block text: ${blockId}`);
        console.log(`  Old: "${oldText.substring(0, 50)}${oldText.length > 50 ? '...' : ''}"`);
        console.log(`  New: "${newText.substring(0, 50)}${newText.length > 50 ? '...' : ''}"`);
        
        // Trigger text change hook
        this.triggerManualTextChangeHook(blockId, newText, oldText);
        
        return true;
    }

    // Set manual block editing mode
    setManualBlockEditing(blockId, isEditing) {
        const success = this.updateTextBlockProperty(blockId, 'isEditing', isEditing);
        
        if (success) {
            console.log(`✅ Manual block ${blockId} editing mode: ${isEditing}`);
            
            // If starting to edit, set as active
            if (isEditing) {
                this.project.activeTextBlockId = blockId;
            }
        }
        
        return success;
    }

    // Get all manual text blocks in current slide
    getManualTextBlocks() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide || !activeSlide.textBlocks) return [];
        
        return activeSlide.textBlocks.filter(block => block.isManual === true);
    }

    // Check if block is manual
    isManualBlock(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        return block ? block.isManual === true : false;
    }

    // Delete manual text block (with independence validation)
    deleteManualTextBlock(blockId) {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) return false;
        
        const blockIndex = activeSlide.textBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) {
            console.warn(`⚠️ Manual block ${blockId} not found for deletion`);
            return false;
        }
        
        const block = activeSlide.textBlocks[blockIndex];
        
        // Verify it's a manual block
        if (!block.isManual) {
            console.warn(`⚠️ Block ${blockId} is not a manual block, cannot delete via manual method`);
            return false;
        }
        
        // Remove from array
        const removedBlock = activeSlide.textBlocks.splice(blockIndex, 1)[0];
        
        // Clear active block if it was the deleted one
        if (this.project.activeTextBlockId === blockId) {
            this.project.activeTextBlockId = null;
        }
        
        console.log(`✅ Deleted manual text block: ${blockId}`);
        
        // Trigger deletion hook
        this.triggerManualBlockDeletionHook(removedBlock);
        
        return true;
    }

    // Apply independent styles to manual block (doesn't affect others)
    applyIndependentStyles(blockId, styles) {
        const activeSlide = this._getActiveSlideOriginal();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block || !block.isManual) {
            console.warn(`⚠️ Block ${blockId} is not a manual block`);
            return false;
        }
        
        // Apply styles independently
        const updatedProperties = [];
        Object.entries(styles).forEach(([property, value]) => {
            const oldValue = this.getNestedProperty(block, property);
            this.setNestedProperty(block, property, value);
            updatedProperties.push({ property, oldValue, newValue: value });
        });
        
        // Update metadata
        block.lastModified = Date.now();
        block.version += 1;
        
        console.log(`✅ Applied independent styles to manual block ${blockId}:`, updatedProperties);
        
        // Trigger style change hook
        this.triggerManualStyleChangeHook(blockId, updatedProperties);
        
        return true;
    }

    // Get manual block statistics
    getManualBlockStats() {
        const manualBlocks = this.getManualTextBlocks();
        
        if (manualBlocks.length === 0) {
            return null;
        }
        
        return {
            count: manualBlocks.length,
            totalBlocks: this.getActiveSlide()?.textBlocks?.length || 0,
            editingCount: manualBlocks.filter(b => b.isEditing).length,
            emptyCount: manualBlocks.filter(b => !b.text || b.text.trim().length === 0).length,
            averageTextLength: Math.round(
                manualBlocks.reduce((sum, b) => sum + (b.text?.length || 0), 0) / manualBlocks.length
            )
        };
    }

    // ===== MANUAL BLOCK HOOKS =====

    // Hook for manual block creation
    triggerManualBlockCreationHook(block) {
        const hookData = {
            blockId: block.id,
            block: { ...block },
            type: 'manual_block_created',
            timestamp: Date.now()
        };
        
        console.log(`🎣 Manual block creation hook: ${block.id}`);
        
        // Notify subscribers
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event
        if (typeof document !== 'undefined') {
            const creationEvent = new CustomEvent('manualBlockCreated', {
                detail: hookData
            });
            document.dispatchEvent(creationEvent);
        }
        
        // Force DOM creation
        this.forceAddBlockToDOM(block);
    }

    // Hook for manual text changes
    triggerManualTextChangeHook(blockId, newText, oldText) {
        const hookData = {
            blockId,
            property: 'text',
            newValue: newText,
            oldValue: oldText,
            type: 'manual_text_changed',
            timestamp: Date.now()
        };
        
        console.log(`🎣 Manual text change hook: ${blockId}`);
        
        // Notify subscribers
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event
        if (typeof document !== 'undefined') {
            const textChangeEvent = new CustomEvent('manualTextChanged', {
                detail: hookData
            });
            document.dispatchEvent(textChangeEvent);
        }
        
        // Force DOM update
        this.forceUpdateBlockInDOM(blockId);
    }

    // Hook for manual style changes
    triggerManualStyleChangeHook(blockId, styleChanges) {
        const hookData = {
            blockId,
            styleChanges,
            type: 'manual_style_changed',
            timestamp: Date.now()
        };
        
        console.log(`🎣 Manual style change hook: ${blockId} (${styleChanges.length} changes)`);
        
        // Notify subscribers
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event
        if (typeof document !== 'undefined') {
            const styleChangeEvent = new CustomEvent('manualStyleChanged', {
                detail: hookData
            });
            document.dispatchEvent(styleChangeEvent);
        }
        
        // Force DOM update
        this.forceUpdateBlockInDOM(blockId);
    }

    // Hook for manual block deletion
    triggerManualBlockDeletionHook(deletedBlock) {
        const hookData = {
            blockId: deletedBlock.id,
            deletedBlock: { ...deletedBlock },
            type: 'manual_block_deleted',
            timestamp: Date.now()
        };
        
        console.log(`🎣 Manual block deletion hook: ${deletedBlock.id}`);
        
        // Notify subscribers
        if (this.onPropertyChangeCallback) {
            this.onPropertyChangeCallback(hookData);
        }
        
        // Dispatch custom event
        if (typeof document !== 'undefined') {
            const deletionEvent = new CustomEvent('manualBlockDeleted', {
                detail: hookData
            });
            document.dispatchEvent(deletionEvent);
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
} else {
    window.StateManager = StateManager;
}