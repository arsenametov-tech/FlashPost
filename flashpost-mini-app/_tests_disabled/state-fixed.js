// ===== FIXED STATE MANAGEMENT MODULE =====
// Единственный источник истины без циклических зависимостей

class StateManagerFixed {
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
        
        // === СИСТЕМА ПОДПИСЧИКОВ (БЕЗ ЦИКЛИЧЕСКИХ ЗАВИСИМОСТЕЙ) ===
        this.subscribers = {
            propertyChange: [],
            modeChange: [],
            slideChange: [],
            blockChange: []
        };
        
        // === ОЧЕРЕДЬ ОБНОВЛЕНИЙ ДЛЯ ПРЕДОТВРАЩЕНИЯ СОСТОЯНИЯ ГОНКИ ===
        this.updateQueue = [];
        this.isProcessingUpdates = false;
        
        console.log('✅ StateManagerFixed инициализирован');
    }

    // ===== СИСТЕМА ПОДПИСКИ БЕЗ ЦИКЛИЧЕСКИХ ЗАВИСИМОСТЕЙ =====

    // Подписка на изменения свойств
    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        
        this.subscribers[eventType].push(callback);
        console.log(`📡 Подписка на ${eventType} добавлена`);
        
        // Возвращаем функцию отписки
        return () => {
            const index = this.subscribers[eventType].indexOf(callback);
            if (index > -1) {
                this.subscribers[eventType].splice(index, 1);
                console.log(`📡 Подписка на ${eventType} удалена`);
            }
        };
    }

    // Уведомление подписчиков
    notify(eventType, data) {
        if (!this.subscribers[eventType]) return;
        
        // Добавляем в очередь для предотвращения состояния гонки
        this.enqueueUpdate(() => {
            this.subscribers[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Ошибка в подписчике ${eventType}:`, error);
                }
            });
        });
    }

    // ===== СИСТЕМА ОЧЕРЕДИ ОБНОВЛЕНИЙ =====

    // Добавление обновления в очередь
    enqueueUpdate(updateFunction) {
        this.updateQueue.push(updateFunction);
        this.processUpdateQueue();
    }

    // Обработка очереди обновлений
    async processUpdateQueue() {
        if (this.isProcessingUpdates || this.updateQueue.length === 0) return;
        
        this.isProcessingUpdates = true;
        
        try {
            while (this.updateQueue.length > 0) {
                const update = this.updateQueue.shift();
                await update();
            }
        } catch (error) {
            console.error('❌ Ошибка в очереди обновлений:', error);
        } finally {
            this.isProcessingUpdates = false;
        }
    }

    // ===== МЕТОДЫ УПРАВЛЕНИЯ СЛАЙДАМИ (БЕЗ DOM ОПЕРАЦИЙ) =====

    // Получение активного слайда
    getActiveSlide() {
        if (this.project.slides.length === 0) return null;
        
        const slide = this.project.slides[this.currentSlideIndex];
        return slide || null;
    }

    // Получение слайда по ID
    getSlideById(slideId) {
        return this.project.slides.find(slide => slide.id === slideId) || null;
    }

    // Получение всех слайдов
    getAllSlides() {
        return [...this.project.slides]; // Возвращаем копию для безопасности
    }

    // Получение количества слайдов
    getSlidesCount() {
        return this.project.slides.length;
    }

    // Установка активного слайда
    setActiveSlideByIndex(index) {
        if (index >= 0 && index < this.project.slides.length) {
            const oldIndex = this.currentSlideIndex;
            this.currentSlideIndex = index;
            
            const slide = this.project.slides[index];
            if (slide) {
                this.project.activeSlideId = slide.id;
                
                // Уведомляем подписчиков
                this.notify('slideChange', {
                    oldIndex,
                    newIndex: index,
                    slideId: slide.id,
                    slide: { ...slide }
                });
            }
        }
    }

    // ===== МЕТОДЫ УПРАВЛЕНИЯ ТЕКСТОВЫМИ БЛОКАМИ (БЕЗ DOM ОПЕРАЦИЙ) =====

    // Получение активного текстового блока
    getActiveTextBlock() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide || !this.project.activeTextBlockId) return null;
        
        return activeSlide.textBlocks.find(block => 
            block.id === this.project.activeTextBlockId
        ) || null;
    }

    // Обновление свойства текстового блока
    updateTextBlockProperty(blockId, property, value) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return false;
        
        const oldValue = this.getNestedProperty(block, property);
        this.setNestedProperty(block, property, value);
        
        // Уведомляем подписчиков
        this.notify('propertyChange', {
            type: 'textBlock',
            blockId,
            property,
            oldValue,
            newValue: value,
            block: { ...block }
        });
        
        return true;
    }

    // Добавление нового текстового блока
    addTextBlock(blockData) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return null;
        
        const newBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: blockData.text || 'Новый текст',
            x: blockData.x || 50,
            y: blockData.y || 50,
            width: blockData.width || 80,
            height: blockData.height || 'auto',
            font: blockData.font || 'Inter',
            size: blockData.size || 24,
            weight: blockData.weight || 700,
            color: blockData.color || '#ffffff',
            textAlign: blockData.textAlign || 'center',
            ...blockData
        };
        
        activeSlide.textBlocks.push(newBlock);
        
        // Уведомляем подписчиков
        this.notify('blockChange', {
            type: 'add',
            blockId: newBlock.id,
            block: { ...newBlock },
            slideId: activeSlide.id
        });
        
        return newBlock;
    }

    // Удаление текстового блока
    removeTextBlock(blockId) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const blockIndex = activeSlide.textBlocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return false;
        
        const removedBlock = activeSlide.textBlocks.splice(blockIndex, 1)[0];
        
        // Если удаляем активный блок, сбрасываем активность
        if (this.project.activeTextBlockId === blockId) {
            this.project.activeTextBlockId = null;
        }
        
        // Уведомляем подписчиков
        this.notify('blockChange', {
            type: 'remove',
            blockId,
            block: { ...removedBlock },
            slideId: activeSlide.id
        });
        
        return true;
    }

    // ===== МЕТОДЫ УПРАВЛЕНИЯ РЕЖИМАМИ =====

    // Получение текущего режима
    getMode() {
        return this.project.mode;
    }

    // Установка режима
    setMode(newMode) {
        const oldMode = this.project.mode;
        this.project.mode = newMode;
        
        // Уведомляем подписчиков
        this.notify('modeChange', {
            oldMode,
            newMode,
            timestamp: Date.now()
        });
        
        console.log(`🔄 Режим изменен: ${oldMode} → ${newMode}`);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

    // Получение вложенного свойства
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Установка вложенного свойства
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let target = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
    }

    // Очистка проекта
    clearProject() {
        this.project.slides = [];
        this.project.activeSlideId = null;
        this.project.activeTextBlockId = null;
        this.currentSlideIndex = 0;
        
        // Уведомляем подписчиков
        this.notify('projectChange', {
            type: 'clear',
            timestamp: Date.now()
        });
        
        console.log('🧹 Проект очищен');
    }

    // Создание слайда из данных
    createSlideFromData(slideData) {
        const slide = {
            id: slideData.id || `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: slideData.title || '',
            subtitle: slideData.subtitle || '',
            background: slideData.background || { type: 'color', color: '#833ab4' },
            textBlocks: slideData.textBlocks || [],
            autoKeywords: slideData.autoKeywords || [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.project.slides.push(slide);
        
        // Устанавливаем как активный если это первый слайд
        if (this.project.slides.length === 1) {
            this.currentSlideIndex = 0;
            this.project.activeSlideId = slide.id;
        }
        
        // Уведомляем подписчиков
        this.notify('slideChange', {
            type: 'add',
            slideId: slide.id,
            slide: { ...slide }
        });
        
        return slide;
    }

    // Получение статистики состояния
    getStats() {
        return {
            slidesCount: this.project.slides.length,
            activeSlideIndex: this.currentSlideIndex,
            mode: this.project.mode,
            subscribersCount: Object.values(this.subscribers)
                .reduce((sum, subs) => sum + subs.length, 0),
            updateQueueLength: this.updateQueue.length,
            isProcessingUpdates: this.isProcessingUpdates
        };
    }

    // Очистка всех подписчиков
    cleanup() {
        Object.keys(this.subscribers).forEach(eventType => {
            this.subscribers[eventType] = [];
        });
        
        this.updateQueue = [];
        this.isProcessingUpdates = false;
        
        console.log('🧹 StateManagerFixed очищен');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManagerFixed;
} else {
    window.StateManagerFixed = StateManagerFixed;
}