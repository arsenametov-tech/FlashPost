// ===== EDITOR MODULE =====
// Handles text blocks, font controls, and UI bindings

class Editor {
    constructor(stateManager, renderer) {
        this.state = stateManager;
        this.renderer = renderer;
        this.isIdeasCollapsed = true;
        
        // Регистрируем колбэки для обновлений из StateManager
        this.state.setPropertyChangeCallback((hookData) => {
            this.handlePropertyChange(hookData);
        });
        
        console.log('✅ Editor инициализирован с зависимостями');
    }

    // ===== ОБРАБОТКА ИЗМЕНЕНИЙ ИЗ STATE MANAGER =====

    // Обработка изменений свойств из StateManager
    handlePropertyChange(hookData) {
        const { blockId, property, newValue } = hookData;
        
        // Обновляем DOM только если элемент существует
        if (this.renderer) {
            this.renderer.updateTextBlockStyles(blockId);
        }
        
        // Обновляем контролы если это активный блок
        if (this.state.project.activeTextBlockId === blockId) {
            this.updateFontControlsWithoutFocus(blockId);
        }
        
        // Обновляем живое превью
        this.updateLivePreview();
        
        console.log(`🔄 Editor обработал изменение ${property} для блока ${blockId}`);
    }

    // ===== НАВИГАЦИЯ ПО СЛАЙДАМ =====
    
    // Навигация по слайдам
    previousSlide() {
        const currentIndex = this.state.getActiveSlideIndex();
        if (currentIndex > 0) {
            this.state.setActiveSlideByIndex(currentIndex - 1);
            this.render();
            this.hapticFeedback();
        }
    }
    
    nextSlide() {
        const currentIndex = this.state.getActiveSlideIndex();
        const totalSlides = this.state.getSlidesCount();
        if (currentIndex < totalSlides - 1) {
            this.state.setActiveSlideByIndex(currentIndex + 1);
            this.render();
            this.hapticFeedback();
        }
    }
    
    goToSlide(index) {
        const totalSlides = this.state.getSlidesCount();
        if (index >= 0 && index < totalSlides) {
            this.state.setActiveSlideByIndex(index);
            this.render();
            this.hapticFeedback();
        }
    }

    // ===== УПРАВЛЕНИЕ РЕЖИМАМИ =====

    // Переход в режим старта
    enterStartMode() {
        this.state.setMode("start");
        this.render();
    }

    // Переход в режим превью
    enterPreviewMode() {
        this.state.setMode("preview");
        this.render();
    }

    // Переход в режим редактирования
    enterEditMode() {
        this.state.setMode("edit");
        this.render();
    }
    
    // Переход в режим экспорта
    async enterExportMode() {
        await this.state.setMode("export");
        this.render();
    }

    // ===== ЗАГЛУШКИ ДЛЯ МЕТОДОВ =====

    // Заглушки для методов, которые будут реализованы в других модулях
    render() {
        console.log('🔄 Рендер вызван из Editor (должен быть переопределен)');
    }

    handleGenerate() {
        console.log('🚀 Генерация вызвана из Editor (должна быть переопределена)');
    }

    downloadCurrentSlide() {
        console.log('💾 Скачивание слайда вызвано из Editor (должно быть переопределено)');
    }

    downloadAllSlides() {
        console.log('💾 Скачивание всех слайдов вызвано из Editor (должно быть переопределено)');
    }

    saveTemplate() {
        console.log('💾 Сохранение шаблона вызвано из Editor (должно быть переопределено)');
    }

    // Тактильная обратная связь
    hapticFeedback(type = 'medium') {
        if (window.Telegram?.WebApp?.HapticFeedback) {
            if (type === 'light') {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            } else if (type === 'heavy') {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
            } else {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
        }
    }

    // Обновление живого превью
    updateLivePreview() {
        // Находим все превью элементы и обновляем их из состояния
        const previewSlides = document.querySelectorAll('.slide:not(.editable)');
        previewSlides.forEach(slideEl => {
            const slideId = slideEl.dataset.slideId;
            const slide = this.state.getSlideById(slideId);
            if (slide) {
                this.updatePreviewSlideFromState(slideEl, slide);
            }
        });
    }

    // Обновление превью слайда из состояния
    updatePreviewSlideFromState(slideEl, slide) {
        // Очищаем текстовые блоки
        const existingBlocks = slideEl.querySelectorAll('.slide-text-block-static');
        existingBlocks.forEach(block => block.remove());
        
        // Создаем блоки из состояния
        slide.textBlocks.forEach(block => {
            const blockElement = this.renderer.createPreviewTextBlock(block, slide.autoKeywords || []);
            slideEl.appendChild(blockElement);
        });
    }

    // Обновление контролов шрифта без потери фокуса
    updateFontControlsWithoutFocus(blockId) {
        const activeSlide = this.state.getActiveSlide();
        if (!activeSlide) return;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return;
        
        // Обновляем значения контролов без вызова событий
        this.updateControlValue('fontSelect', block.font);
        this.updateControlValue('fontSizeRange', block.size);
        this.updateControlValue('textColorPicker', block.color);
    }

    // Обновление значения контрола без вызова событий
    updateControlValue(controlId, value) {
        const control = document.getElementById(controlId);
        if (!control) return;
        
        try {
            // Обновляем значение
            if (control.type === 'checkbox') {
                control.checked = value;
            } else {
                control.value = value;
            }
        } catch (error) {
            console.error(`❌ Ошибка обновления контрола ${controlId}:`, error);
        }
    }

    // ===== ПРИВЯЗКА СОБЫТИЙ ДЛЯ КАЖДОГО РЕЖИМА =====

    // События для стартового экрана
    bindStartEvents() {
        console.log('✅ События стартового экрана привязаны');
    }

    // События для превью
    bindPreviewEvents() {
        console.log('✅ События превью привязаны');
    }

    // События для редактора
    bindEditorEvents() {
        console.log('✅ События редактора привязаны');
    }

    // События для экспорта
    bindExportEvents() {
        console.log('✅ События экспорта привязаны');
    }

    // ===== ОЧИСТКА РЕСУРСОВ =====

    // Очистка обработчиков событий
    cleanupEventHandlers() {
        if (this.eventHandlers) {
            this.eventHandlers.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
            this.eventHandlers = [];
        }
    }

    // Очистка всех ресурсов при уничтожении
    destroy() {
        this.cleanupEventHandlers();
        
        // Очищаем колбэки в StateManager
        if (this.state) {
            this.state.setPropertyChangeCallback(null);
        }
        
        console.log('✅ Editor ресурсы очищены');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Editor;
} else {
    window.Editor = Editor;
}