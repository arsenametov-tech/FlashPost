// ===== RENDERER MODULE =====
// Handles slide rendering and editor preview

class Renderer {
    constructor(stateManager) {
        this.state = stateManager;
        console.log('✅ Renderer инициализирован');
    }

    // ===== ЕДИНЫЙ МЕТОД РЕНДЕРИНГА ПО РЕЖИМАМ =====

    // Главный метод рендеринга
    render() {
        console.log('🎨 SAFE MODE: Renderer.render() called');
        
        const app = document.getElementById('app');
        if (!app) {
            console.error('❌ SAFE MODE: #app element not found in renderer');
            return;
        }

        console.log('🔧 SAFE MODE: Clearing app container');
        // Очищаем контейнер
        app.innerHTML = '';

        // SAFE MODE: Убираем все guards - рендерим всегда
        console.log('🎯 SAFE MODE: Determining render mode...');
        const mode = this.state ? this.state.project.mode : 'start';
        console.log(`🎨 SAFE MODE: Rendering mode: ${mode}`);

        // Рендерим в зависимости от режима БЕЗ guards
        if (mode === 'start') {
            console.log('🏠 SAFE MODE: Rendering start screen');
            const startElement = this.createStartDOM();
            app.appendChild(startElement);
        } else if (mode === 'edit') {
            console.log('✏️ SAFE MODE: Rendering editor');
            this.renderEditor();
        } else if (mode === 'preview') {
            console.log('👁️ SAFE MODE: Rendering preview');
            this.renderPreview();
        } else if (mode === 'export') {
            console.log('💾 SAFE MODE: Rendering export');
            this.renderExport();
        } else {
            console.log('🏠 SAFE MODE: Unknown mode, defaulting to start');
            const startElement = this.createStartDOM();
            app.appendChild(startElement);
        }

        // Обновляем UI для режима БЕЗ guards
        console.log('🔧 SAFE MODE: Updating mode UI');
        this.updateModeUI();
        
        // SAFE MODE: Принудительно делаем кнопки кликабельными
        console.log('🖱️ SAFE MODE: Force enabling buttons');
        this.forceEnableButtons();
        
        console.log(`✅ SAFE MODE: Рендер завершен для режима: ${mode}`);
        
        // ВАЖНО: НЕ привязываем события здесь - это делает app.js через bindUIEvents()
    }
    
    // SAFE MODE: Принудительно включаем кнопки
    forceEnableButtons() {
        console.log('🖱️ SAFE MODE: Force enabling all buttons...');
        
        // Находим все интерактивные элементы
        const interactiveElements = document.querySelectorAll(`
            button, 
            [onclick], 
            [role="button"], 
            .btn, 
            .nav-btn, 
            .indicator,
            input[type="button"],
            input[type="submit"],
            .clickable
        `);
        
        interactiveElements.forEach((element, index) => {
            // Принудительно делаем кликабельными
            element.style.pointerEvents = 'auto';
            element.style.cursor = 'pointer';
            element.style.position = 'relative';
            element.style.zIndex = '1000';
            
            // Убираем блокировки
            if (element.disabled !== undefined) {
                element.disabled = false;
            }
            
            // Показываем элемент
            if (element.style.opacity === '0' || element.style.opacity === '') {
                element.style.opacity = '1';
            }
            element.style.visibility = 'visible';
            if (element.style.display === 'none') {
                element.style.display = element.tagName.toLowerCase() === 'button' ? 'inline-block' : 'block';
            }
            
            console.log(`🖱️ SAFE MODE: Button ${index + 1} enabled`);
        });
        
        // Убираем overlay блокировки
        const overlays = document.querySelectorAll('.overlay, .loading-overlay, .modal-backdrop, .disabled-overlay');
        overlays.forEach(overlay => {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '-1';
        });
        
        console.log(`✅ SAFE MODE: ${interactiveElements.length} interactive elements enabled`);
    }
    
    // Рендер редактора (ТОЛЬКО EDIT режим с drag&drop)
    renderEditor() {
        console.log('✏️ SAFE MODE: renderEditor() called');
        
        const app = document.getElementById('app');
        if (!app) {
            console.error('❌ SAFE MODE: #app not found in renderEditor');
            return;
        }
        
        console.log('🔧 SAFE MODE: Creating editor DOM');
        const editorElement = this.createEditorDOM();
        app.appendChild(editorElement);
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Принудительно показываем все расширенные функции
        this.forceShowAdvancedFeatures();
        
        console.log('✅ SAFE MODE: Редактор отрендерен в EDIT режиме с drag&drop');
    }
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Принудительное отображение расширенных функций
    forceShowAdvancedFeatures() {
        // Добавляем CSS для принудительного отображения
        const advancedFeaturesCSS = `
            <style id="advanced-features-css">
                /* ПРИНУДИТЕЛЬНОЕ ОТОБРАЖЕНИЕ РАСШИРЕННЫХ ФУНКЦИЙ */
                .template-controls-panel,
                .ai-advanced-options-panel,
                .manual-text-blocks-panel,
                .property-group,
                .template-controls,
                .ai-advanced-controls,
                .manual-text-controls {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                
                .btn-full-width {
                    width: 100% !important;
                    margin-bottom: 8px !important;
                    padding: 12px !important;
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                }
                
                .btn-template {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .btn-ai {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .btn-danger {
                    background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%) !important;
                    color: white !important;
                    border: none !important;
                }
                
                .ai-mode-container {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    margin: 10px 0 !important;
                }
                
                .template-info,
                .ai-info,
                .blocks-info {
                    margin-top: 10px !important;
                    padding: 8px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 6px !important;
                }
                
                .info-text small {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 12px !important;
                }
            </style>
        `;
        
        // Удаляем старые стили если есть
        const existingCSS = document.getElementById('advanced-features-css');
        if (existingCSS) {
            existingCSS.remove();
        }
        
        // Добавляем новые стили
        document.head.insertAdjacentHTML('beforeend', advancedFeaturesCSS);
        
        console.log('✅ Принудительное отображение расширенных функций активировано');
    }
    
    // Рендер превью (DOM)
    renderPreview() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const previewElement = this.createPreviewDOM();
        app.appendChild(previewElement);
        
        console.log('✅ Превью отрендерено через DOM');
    }
    
    // Рендер экспорта (упрощенный - только переключение режима)
    renderExport() {
        // В упрощенной системе экспорт не требует специального UI
        // Просто переключаем режим для применения export стилей
        console.log('✅ Режим экспорта активирован');
    }

    // Создание DOM для стартового экрана
    createStartDOM() {
        // Основной контейнер
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = 'startSection';
        
        const startSection = document.createElement('div');
        startSection.className = 'start-section';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'start-header glass-card';
        
        const title = document.createElement('h1');
        title.innerHTML = '🚀 FlashPost AI<br><span class="subtitle">Создавайте вирусные карусели за минуты</span>';
        
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = 'Введите тему, и ИИ создаст детальную обучающую карусель из 7-9 слайдов с экспертным контентом';
        
        header.appendChild(title);
        header.appendChild(description);
        
        // Форма ввода
        const inputForm = this.createInputForm();
        
        // Популярные идеи
        const ideasSection = this.createIdeasSection();
        
        startSection.appendChild(header);
        startSection.appendChild(inputForm);
        startSection.appendChild(ideasSection);
        section.appendChild(startSection);
        
        return section;
    }
    
    // Создание формы ввода
    createInputForm() {
        const form = document.createElement('div');
        form.className = 'input-form glass-card';
        
        const label = document.createElement('label');
        label.className = 'input-label';
        label.textContent = '💡 Введи тему для карусели:';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        // ИЗМЕНЕНО: textarea вместо input для ручной генерации
        const textarea = document.createElement('textarea');
        textarea.id = 'topicInput';
        textarea.className = 'topic-input';
        textarea.placeholder = 'Например: "Как начать инвестировать", "Здоровое питание", "Продуктивность"...';
        textarea.maxLength = 200;
        textarea.rows = 3;
        
        const counter = document.createElement('div');
        counter.className = 'input-counter';
        counter.id = 'inputCounter';
        counter.textContent = '0/200';
        
        inputContainer.appendChild(textarea);
        inputContainer.appendChild(counter);
        
        // Instagram никнейм
        const instagramContainer = this.createInstagramInput();
        
        // Контейнер для кнопок генерации
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'generation-buttons';
        
        // ОСНОВНАЯ кнопка: ручная генерация (всегда работает)
        const manualBtn = document.createElement('button');
        manualBtn.className = 'btn btn-primary btn-generate';
        manualBtn.id = 'generateBtn';
        manualBtn.innerHTML = '<span class="btn-text">🎯 Создать карусель</span>';
        manualBtn.title = 'Быстрое создание карусели по шаблонам';
        
        // ДОПОЛНИТЕЛЬНАЯ кнопка: AI генерация (опциональная)
        const aiBtn = document.createElement('button');
        aiBtn.className = 'btn btn-secondary btn-ai';
        aiBtn.id = 'generateAIBtn';
        aiBtn.innerHTML = '<span class="btn-text">🤖 AI карусель</span>';
        aiBtn.title = 'Создание карусели с помощью ИИ (экспериментально)';
        
        // Проверяем доступность AI
        const aiAvailable = this.checkAIAvailability();
        if (!aiAvailable) {
            aiBtn.disabled = true;
            aiBtn.innerHTML = '<span class="btn-text">🤖 AI недоступен</span>';
            aiBtn.title = 'AI генерация временно недоступна';
        }
        
        buttonsContainer.appendChild(manualBtn);
        buttonsContainer.appendChild(aiBtn);
        
        form.appendChild(label);
        form.appendChild(inputContainer);
        form.appendChild(instagramContainer);
        form.appendChild(buttonsContainer);
        
        return form;
    }

    // Создание поля ввода Instagram никнейма
    createInstagramInput() {
        const container = document.createElement('div');
        container.className = 'instagram-input-container';
        
        const label = document.createElement('label');
        label.className = 'input-label';
        label.textContent = '📱 Instagram никнейм (опционально):';
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'instagram-input-wrapper';
        
        const atSymbol = document.createElement('span');
        atSymbol.className = 'at-symbol';
        atSymbol.textContent = '@';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'instagramInput';
        input.className = 'instagram-input';
        input.placeholder = 'username';
        input.maxLength = 30;
        
        const hint = document.createElement('div');
        hint.className = 'input-hint';
        hint.textContent = 'Будет показан на первом и последнем слайде';
        
        inputWrapper.appendChild(atSymbol);
        inputWrapper.appendChild(input);
        
        container.appendChild(label);
        container.appendChild(inputWrapper);
        container.appendChild(hint);
        
        return container;
    }
    
    // Проверка доступности AI
    checkAIAvailability() {
        // Проверяем есть ли AI модуль и настроен ли он
        try {
            // Получаем AI manager из глобального объекта приложения
            const aiManager = window.flashPostApp?.aiManager || window.aiManager;
            
            return aiManager && 
                   typeof aiManager.isAvailable === 'function' && 
                   aiManager.isAvailable();
        } catch (error) {
            console.log('ℹ️ AI недоступен:', error.message);
            return false;
        }
    }
    
    // Создание секции идей
    createIdeasSection() {
        const section = document.createElement('div');
        section.className = 'ideas-section glass-card';
        
        const header = document.createElement('div');
        header.className = 'ideas-header';
        
        const title = document.createElement('h3');
        title.textContent = '💡 Популярные темы';
        
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.id = 'collapseBtn';
        collapseBtn.innerHTML = '<span class="collapse-icon">▼</span>';
        
        header.appendChild(title);
        header.appendChild(collapseBtn);
        
        const content = document.createElement('div');
        content.className = 'ideas-content collapsed';
        content.id = 'ideasContent';
        
        const grid = document.createElement('div');
        grid.className = 'ideas-grid';
        grid.id = 'ideasGrid';
        
        content.appendChild(grid);
        
        section.appendChild(header);
        section.appendChild(content);
        
        return section;
    }

    // Создание DOM для превью
    createPreviewDOM() {
        const activeSlideIndex = this.state.getActiveSlideIndex();
        const totalSlides = this.state.getSlidesCount(); // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД
        
        // Основной контейнер
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = 'previewSection';
        
        const carouselSection = document.createElement('div');
        carouselSection.className = 'carousel-section';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'carousel-header glass-card';
        
        const title = document.createElement('h2');
        title.textContent = 'Ваша карусель готова!';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = `Слайдов: ${totalSlides} • Детальное раскрытие темы`;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        // Контейнер карусели
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container glass-card';
        
        // Трек слайдов
        const carouselTrack = document.createElement('div');
        carouselTrack.className = 'carousel-track';
        carouselTrack.id = 'carouselTrack';
        
        // Создаем слайды ИСПОЛЬЗУЯ БЕЗОПАСНЫЙ МЕТОД
        const slides = this.state.getAllSlides();
        slides.forEach((slide, index) => {
            const slideElement = this.createPreviewSlide(slide, index, activeSlideIndex, totalSlides);
            carouselTrack.appendChild(slideElement);
        });
        
        // Навигация
        const nav = this.createCarouselNavigation(activeSlideIndex, totalSlides);
        
        // Прогресс бар (если много слайдов)
        const progressBar = this.createProgressBar(activeSlideIndex, totalSlides);
        
        carouselContainer.appendChild(carouselTrack);
        carouselContainer.appendChild(nav);
        if (progressBar) carouselContainer.appendChild(progressBar);
        
        // Действия
        const actions = this.createPreviewActions();
        
        carouselSection.appendChild(header);
        carouselSection.appendChild(carouselContainer);
        carouselSection.appendChild(actions);
        section.appendChild(carouselSection);
        
        return section;
    }
    
    // Создание слайда для превью
    createPreviewSlide(slide, index, activeSlideIndex, totalSlides) {
        const slideEl = document.createElement('div');
        slideEl.className = `slide ${index === activeSlideIndex ? 'active' : ''}`;
        slideEl.dataset.index = index;
        slideEl.dataset.slideId = slide.id;
        
        // Устанавливаем фон
        this.setSlideBackground(slideEl, slide.background);
        
        // Добавляем текстовые блоки
        slide.textBlocks.forEach(block => {
            const blockElement = this.createPreviewTextBlock(block, slide.autoKeywords || []);
            slideEl.appendChild(blockElement);
        });
        
        // Номер слайда
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = `${index + 1}/${totalSlides}`;
        slideEl.appendChild(slideNumber);
        
        // Instagram никнейм на первом и последнем слайде
        const instagramNickname = this.state.getInstagramNickname();
        if (instagramNickname && (index === 0 || index === totalSlides - 1)) {
            const nicknameEl = this.createInstagramNickname(instagramNickname);
            slideEl.appendChild(nicknameEl);
        }
        
        // CTA текст на последнем слайде
        if (index === totalSlides - 1) {
            const ctaText = this.state.getCTAText();
            if (ctaText) {
                const ctaEl = this.createCTAText(ctaText);
                slideEl.appendChild(ctaEl);
            }
        }
        
        // "Листай" индикатор (кроме последнего слайда)
        if (index < totalSlides - 1) {
            const swipeIndicator = this.createSwipeIndicator();
            slideEl.appendChild(swipeIndicator);
        }
        
        // Кастомная стрелка навигации (кроме последнего слайда)
        if (index < totalSlides - 1) {
            const customArrow = this.createCustomArrow();
            slideEl.appendChild(customArrow);
        }
        
        return slideEl;
    }
    
    // Создание текстового блока для превью с полной поддержкой независимых свойств
    createPreviewTextBlock(block, autoKeywords = []) {
        const blockEl = document.createElement('div');
        blockEl.className = 'slide-text-block-static';
        blockEl.dataset.blockId = block.id;
        
        // Применяем все стили с поддержкой независимых свойств
        this.applyTextBlockStyles(blockEl, block);
        
        // Обрабатываем ключевые слова
        this.setTextWithKeywords(blockEl, block.text, autoKeywords, block.keywordHighlighting);
        
        return blockEl;
    }

    // ===== UI ЭЛЕМЕНТЫ ДЛЯ СЛАЙДОВ =====

    // Создание Instagram никнейма
    createInstagramNickname(nickname) {
        const nicknameEl = document.createElement('div');
        nicknameEl.className = 'instagram-nickname';
        nicknameEl.textContent = `@${nickname}`;
        return nicknameEl;
    }

    // Создание CTA текста
    createCTAText(ctaText) {
        const ctaEl = document.createElement('div');
        ctaEl.className = 'cta-text';
        ctaEl.textContent = ctaText;
        return ctaEl;
    }

    // Создание индикатора "Листай"
    createSwipeIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = `
            <div class="swipe-text">Листай</div>
            <div class="swipe-animation">
                <div class="swipe-dot"></div>
                <div class="swipe-dot"></div>
                <div class="swipe-dot"></div>
            </div>
        `;
        return indicator;
    }

    // Создание кастомной стрелки
    createCustomArrow() {
        const arrow = document.createElement('div');
        arrow.className = 'custom-arrow';
        arrow.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 4L16 12L8 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        arrow.addEventListener('click', () => {
            this.nextSlide();
        });
        return arrow;
    }

    // Навигация к следующему слайду
    nextSlide() {
        const currentIndex = this.state.getActiveSlideIndex();
        const totalSlides = this.state.getSlidesCount();
        
        if (currentIndex < totalSlides - 1) {
            this.state.setActiveSlideByIndex(currentIndex + 1);
            this.render();
        }
    }

    // Создание редактируемого текстового блока с полной поддержкой независимых свойств
    createEditableTextBlock(block, autoKeywords = []) {
        const blockEl = document.createElement('div');
        blockEl.className = 'slide-text-block-editable';
        blockEl.dataset.blockId = block.id;
        
        // Применяем все стили с поддержкой независимых свойств
        this.applyTextBlockStyles(blockEl, block);
        
        // Добавляем класс для drag&drop
        blockEl.classList.add('draggable-text-block');
        
        // Обрабатываем ключевые слова
        this.setTextWithKeywords(blockEl, block.text, autoKeywords, block.keywordHighlighting);
        
        // Добавляем ручки для изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'text-block-resize-handle';
        blockEl.appendChild(resizeHandle);
        
        // Добавляем индикатор редактирования
        if (block.isEditing) {
            blockEl.classList.add('editing-mode');
        }
        
        return blockEl;
    }

    // Применение всех стилей к текстовому блоку ТОЛЬКО из состояния
    applyTextBlockStyles(element, block) {
        // Базовые стили позиционирования ТОЛЬКО из состояния
        element.style.position = 'absolute';
        element.style.left = block.x + '%';
        element.style.top = block.y + '%';
        element.style.width = block.width + '%';
        element.style.height = block.height === 'auto' ? 'auto' : block.height + '%';
        element.style.transform = `translate(-50%, -50%) rotate(${block.rotation || 0}deg)`;
        element.style.zIndex = block.zIndex || 10;
        element.style.opacity = block.opacity || 1;
        
        // Независимые свойства шрифта ТОЛЬКО из состояния
        element.style.fontFamily = block.font || 'Inter';
        element.style.fontSize = (block.size || 16) + 'px';
        element.style.fontWeight = block.weight || 700;
        element.style.fontStyle = block.style || 'normal';
        
        // Независимые цвета ТОЛЬКО из состояния
        element.style.color = block.color || '#ffffff';
        if (block.backgroundColor && block.backgroundColor !== 'transparent') {
            element.style.backgroundColor = block.backgroundColor;
        }
        
        // Выравнивание и форматирование ТОЛЬКО из состояния
        element.style.textAlign = block.textAlign || 'center';
        element.style.lineHeight = block.lineHeight || 1.2;
        element.style.letterSpacing = (block.letterSpacing || 0) + 'px';
        element.style.wordSpacing = (block.wordSpacing || 0) + 'px';
        element.style.wordWrap = 'break-word';
        element.style.userSelect = 'none';
        
        // Применяем независимые эффекты ТОЛЬКО из состояния
        this.applyTextBlockEffects(element, block.effects || {});
        
        console.log(`🎨 Стили блока ${block.id} применены ТОЛЬКО из состояния`);
    }

    // Применение независимых эффектов к текстовому блоку
    applyTextBlockEffects(element, effects) {
        const appliedEffects = [];
        
        // Тень текста
        if (effects.shadow?.enabled) {
            const shadow = effects.shadow;
            const textShadow = `${shadow.offsetX || 0}px ${shadow.offsetY || 1}px ${shadow.blur || 3}px ${shadow.color || 'rgba(0, 0, 0, 0.3)'}`;
            appliedEffects.push(`text-shadow: ${textShadow}`);
        }
        
        // Обводка текста (через text-stroke или множественные тени)
        if (effects.outline?.enabled) {
            const outline = effects.outline;
            const strokeWidth = outline.width || 1;
            const strokeColor = outline.color || '#000000';
            
            // Создаем эффект обводки через множественные тени
            const outlineEffects = [];
            for (let i = -strokeWidth; i <= strokeWidth; i++) {
                for (let j = -strokeWidth; j <= strokeWidth; j++) {
                    if (i !== 0 || j !== 0) {
                        outlineEffects.push(`${i}px ${j}px 0 ${strokeColor}`);
                    }
                }
            }
            
            if (outlineEffects.length > 0) {
                const existingShadow = element.style.textShadow;
                const combinedShadow = existingShadow ? 
                    `${existingShadow}, ${outlineEffects.join(', ')}` : 
                    outlineEffects.join(', ');
                appliedEffects.push(`text-shadow: ${combinedShadow}`);
            }
        }
        
        // Свечение (через box-shadow)
        if (effects.glow?.enabled) {
            const glow = effects.glow;
            const glowColor = glow.color || '#ffffff';
            const glowIntensity = glow.intensity || 0.5;
            const glowSize = Math.round(glowIntensity * 10);
            
            const boxShadow = `0 0 ${glowSize}px ${glowColor}`;
            appliedEffects.push(`box-shadow: ${boxShadow}`);
        }
        
        // Градиент текста
        if (effects.gradient?.enabled) {
            const gradient = effects.gradient;
            const gradientType = gradient.type === 'radial' ? 'radial-gradient' : 'linear-gradient';
            const direction = gradient.direction || 'to bottom';
            const colors = gradient.colors || ['#ffffff', '#cccccc'];
            
            const gradientValue = `${gradientType}(${direction}, ${colors.join(', ')})`;
            appliedEffects.push(`background: ${gradientValue}`);
            appliedEffects.push(`-webkit-background-clip: text`);
            appliedEffects.push(`-webkit-text-fill-color: transparent`);
            appliedEffects.push(`background-clip: text`);
        }
        
        // Применяем все эффекты
        if (appliedEffects.length > 0) {
            const styleElement = document.createElement('style');
            const blockId = element.dataset.blockId;
            const cssRule = `
                [data-block-id="${blockId}"] {
                    ${appliedEffects.join(';\n                    ')};
                }
            `;
            styleElement.textContent = cssRule;
            
            // Удаляем старые стили для этого блока
            const existingStyle = document.getElementById(`block-effects-${blockId}`);
            if (existingStyle) {
                existingStyle.remove();
            }
            
            styleElement.id = `block-effects-${blockId}`;
            document.head.appendChild(styleElement);
        }
    }

    // Создание DOM для редактора с многоблочной поддержкой
    createEditorDOM() {
        const activeSlideIndex = this.state.getActiveSlideIndex();
        const activeSlide = this.state.getActiveSlide();
        
        if (!activeSlide) {
            console.warn('⚠️ Нет активного слайда для редактора');
            return document.createElement('div');
        }
        
        // Основной контейнер
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = 'editorSection';
        
        const editorContainer = document.createElement('div');
        editorContainer.className = 'editor-container';
        
        // Заголовок редактора
        const header = this.createEditorHeader(activeSlideIndex);
        
        // Основная область редактирования (разделенная на две части)
        const editorMain = document.createElement('div');
        editorMain.className = 'editor-main';
        
        // Левая часть - превью слайда
        const previewArea = this.createEditorPreviewArea(activeSlide);
        
        // Правая часть - панель редактирования
        const editingPanel = this.createEditingPanel(activeSlide);
        
        editorMain.appendChild(previewArea);
        editorMain.appendChild(editingPanel);
        
        // Действия редактора
        const actions = this.createEditorActions();
        
        editorContainer.appendChild(header);
        editorContainer.appendChild(editorMain);
        editorContainer.appendChild(actions);
        section.appendChild(editorContainer);
        
        return section;
    }

    // Создание заголовка редактора
    createEditorHeader(activeSlideIndex) {
        const header = document.createElement('div');
        header.className = 'editor-header glass-card';
        
        const title = document.createElement('h2');
        title.textContent = `Редактирование слайда ${activeSlideIndex + 1}`;
        
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Выберите текстовый блок для редактирования или добавьте новый';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        return header;
    }

    // Создание области превью для редактора
    createEditorPreviewArea(slide) {
        const previewArea = document.createElement('div');
        previewArea.className = 'editor-preview-area';
        
        const previewTitle = document.createElement('h3');
        previewTitle.textContent = 'Превью слайда';
        previewTitle.className = 'preview-title';
        
        // Контейнер превью слайда
        const previewContainer = document.createElement('div');
        previewContainer.className = 'editor-preview-container';
        
        // Слайд для редактирования (интерактивный)
        const editSlide = this.createInteractiveEditSlide(slide);
        previewContainer.appendChild(editSlide);
        
        // Кнопка добавления блока
        const addBlockBtn = document.createElement('button');
        addBlockBtn.className = 'btn btn-add-block';
        addBlockBtn.id = 'addTextBlockBtn';
        addBlockBtn.innerHTML = '➕ Добавить текстовый блок';
        
        previewArea.appendChild(previewTitle);
        previewArea.appendChild(previewContainer);
        previewArea.appendChild(addBlockBtn);
        
        return previewArea;
    }

    // Создание интерактивного слайда для редактирования
    createInteractiveEditSlide(slide) {
        const slideEl = document.createElement('div');
        slideEl.className = 'slide editable interactive';
        slideEl.dataset.slideId = slide.id;
        slideEl.id = 'interactiveEditSlide';
        
        // Устанавливаем фон
        this.setSlideBackground(slideEl, slide.background);
        
        // Добавляем текстовые блоки с интерактивностью
        slide.textBlocks.forEach(block => {
            const blockElement = this.createInteractiveTextBlock(block, slide.autoKeywords || []);
            slideEl.appendChild(blockElement);
        });
        
        return slideEl;
    }

    // Создание интерактивного текстового блока
    createInteractiveTextBlock(block, autoKeywords = []) {
        const blockEl = document.createElement('div');
        blockEl.className = 'slide-text-block-interactive';
        blockEl.dataset.blockId = block.id;
        blockEl.tabIndex = 0; // Делаем фокусируемым
        
        // Применяем все стили из состояния
        this.applyTextBlockStyles(blockEl, block);
        
        // Добавляем класс для выделения
        if (block.id === this.state.project.activeTextBlockId) {
            blockEl.classList.add('selected');
        }
        
        // Обрабатываем ключевые слова
        this.setTextWithKeywords(blockEl, block.text, autoKeywords, block.keywordHighlighting);
        
        // Добавляем индикатор выбора
        const selectionIndicator = document.createElement('div');
        selectionIndicator.className = 'block-selection-indicator';
        blockEl.appendChild(selectionIndicator);
        
        return blockEl;
    }

    // Создание панели редактирования
    createEditingPanel(slide) {
        const panel = document.createElement('div');
        panel.className = 'editing-panel glass-card';
        
        const panelTitle = document.createElement('h3');
        panelTitle.textContent = 'Редактирование текста';
        panelTitle.className = 'panel-title';
        
        // Информация о выбранном блоке
        const blockInfo = document.createElement('div');
        blockInfo.className = 'block-info';
        blockInfo.id = 'blockInfo';
        blockInfo.innerHTML = '<p class="no-selection">Выберите текстовый блок для редактирования</p>';
        
        // Текстовый редактор
        const textEditor = this.createTextEditor();
        
        // Панель свойств
        const propertiesPanel = this.createPropertiesPanel();
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем контролы шаблонов в панель редактирования
        const templateControls = this.createTemplateControlsPanel();
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем расширенные AI опции
        const aiAdvancedOptions = this.createAIAdvancedOptionsPanel();
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем панель управления текстовыми блоками
        const manualTextBlocks = this.createManualTextBlocksPanel();
        
        panel.appendChild(panelTitle);
        panel.appendChild(blockInfo);
        panel.appendChild(textEditor);
        panel.appendChild(propertiesPanel);
        panel.appendChild(templateControls);
        panel.appendChild(aiAdvancedOptions);
        panel.appendChild(manualTextBlocks);
        
        return panel;
    }

    // Создание текстового редактора
    createTextEditor() {
        const editorContainer = document.createElement('div');
        editorContainer.className = 'text-editor-container';
        editorContainer.style.display = 'none'; // Скрыт до выбора блока
        
        const label = document.createElement('label');
        label.textContent = 'Текст блока:';
        label.className = 'editor-label';
        
        const textarea = document.createElement('textarea');
        textarea.id = 'blockTextEditor';
        textarea.className = 'block-text-editor';
        textarea.placeholder = 'Введите текст для блока...';
        textarea.rows = 4;
        
        const hint = document.createElement('div');
        hint.className = 'editor-hint';
        hint.innerHTML = '💡 Используйте *слово* для выделения ключевых слов';
        
        editorContainer.appendChild(label);
        editorContainer.appendChild(textarea);
        editorContainer.appendChild(hint);
        
        return editorContainer;
    }

    // Создание панели свойств
    createPropertiesPanel() {
        const panel = document.createElement('div');
        panel.className = 'properties-panel';
        panel.id = 'propertiesPanel';
        panel.style.display = 'none'; // Скрыт до выбора блока
        
        // Группа шрифта
        const fontGroup = this.createFontPropertiesGroup();
        
        // Группа цветов
        const colorGroup = this.createColorPropertiesGroup();
        
        // Группа эффектов
        const effectsGroup = this.createEffectsPropertiesGroup();
        
        // Группа ключевых слов
        const keywordGroup = this.createKeywordHighlightingGroup();
        
        // Группа фона
        const backgroundGroup = this.createBackgroundPropertiesGroup();
        
        panel.appendChild(fontGroup);
        panel.appendChild(colorGroup);
        panel.appendChild(effectsGroup);
        panel.appendChild(keywordGroup);
        panel.appendChild(backgroundGroup);
        
        return panel;
    }

    // Создание группы свойств шрифта
    createFontPropertiesGroup() {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const title = document.createElement('h4');
        title.textContent = 'Шрифт';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls';
        
        // Семейство шрифта
        const fontSelect = document.createElement('select');
        fontSelect.id = 'fontSelect';
        fontSelect.className = 'property-control';
        fontSelect.innerHTML = `
            <option value="Inter">Inter</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Oswald">Oswald</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Roboto">Roboto</option>
        `;
        
        // Размер шрифта
        const sizeContainer = document.createElement('div');
        sizeContainer.className = 'range-container';
        
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Размер:';
        
        const sizeRange = document.createElement('input');
        sizeRange.type = 'range';
        sizeRange.id = 'fontSizeRange';
        sizeRange.className = 'property-control';
        sizeRange.min = '12';
        sizeRange.max = '72';
        sizeRange.value = '32';
        
        const sizeValue = document.createElement('span');
        sizeValue.id = 'fontSizeValue';
        sizeValue.className = 'range-value';
        sizeValue.textContent = '32px';
        
        sizeContainer.appendChild(sizeLabel);
        sizeContainer.appendChild(sizeRange);
        sizeContainer.appendChild(sizeValue);
        
        // Вес шрифта
        const weightSelect = document.createElement('select');
        weightSelect.id = 'fontWeightSelect';
        weightSelect.className = 'property-control';
        weightSelect.innerHTML = `
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700" selected>Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
        `;
        
        controls.appendChild(fontSelect);
        controls.appendChild(sizeContainer);
        controls.appendChild(weightSelect);
        
        group.appendChild(title);
        group.appendChild(controls);
        
        return group;
    }

    // Создание группы свойств цветов
    createColorPropertiesGroup() {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const title = document.createElement('h4');
        title.textContent = 'Цвета';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls color-controls';
        
        // Цвет текста
        const textColorContainer = document.createElement('div');
        textColorContainer.className = 'color-control-container';
        
        const textColorLabel = document.createElement('label');
        textColorLabel.textContent = 'Цвет текста:';
        
        const textColorPicker = document.createElement('input');
        textColorPicker.type = 'color';
        textColorPicker.id = 'textColorPicker';
        textColorPicker.className = 'color-picker';
        textColorPicker.value = '#ffffff';
        
        textColorContainer.appendChild(textColorLabel);
        textColorContainer.appendChild(textColorPicker);
        
        // Цвет фона
        const bgColorContainer = document.createElement('div');
        bgColorContainer.className = 'color-control-container';
        
        const bgColorLabel = document.createElement('label');
        bgColorLabel.textContent = 'Цвет фона:';
        
        const bgColorPicker = document.createElement('input');
        bgColorPicker.type = 'color';
        bgColorPicker.id = 'backgroundColorPicker';
        bgColorPicker.className = 'color-picker';
        bgColorPicker.value = '#000000';
        
        const bgTransparentBtn = document.createElement('button');
        bgTransparentBtn.type = 'button';
        bgTransparentBtn.id = 'transparentBgBtn';
        bgTransparentBtn.className = 'btn btn-small';
        bgTransparentBtn.textContent = 'Прозрачный';
        
        bgColorContainer.appendChild(bgColorLabel);
        bgColorContainer.appendChild(bgColorPicker);
        bgColorContainer.appendChild(bgTransparentBtn);
        
        controls.appendChild(textColorContainer);
        controls.appendChild(bgColorContainer);
        
        group.appendChild(title);
        group.appendChild(controls);
        
        return group;
    }

    // Создание группы эффектов
    createEffectsPropertiesGroup() {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const title = document.createElement('h4');
        title.textContent = 'Эффекты';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls effects-controls';
        
        // Тень
        const shadowContainer = document.createElement('div');
        shadowContainer.className = 'effect-control-container';
        
        const shadowToggle = document.createElement('input');
        shadowToggle.type = 'checkbox';
        shadowToggle.id = 'shadowToggle';
        shadowToggle.checked = true;
        
        const shadowLabel = document.createElement('label');
        shadowLabel.htmlFor = 'shadowToggle';
        shadowLabel.textContent = 'Тень текста';
        
        shadowContainer.appendChild(shadowToggle);
        shadowContainer.appendChild(shadowLabel);
        
        // Обводка
        const outlineContainer = document.createElement('div');
        outlineContainer.className = 'effect-control-container';
        
        const outlineToggle = document.createElement('input');
        outlineToggle.type = 'checkbox';
        outlineToggle.id = 'outlineToggle';
        
        const outlineLabel = document.createElement('label');
        outlineLabel.htmlFor = 'outlineToggle';
        outlineLabel.textContent = 'Обводка текста';
        
        outlineContainer.appendChild(outlineToggle);
        outlineContainer.appendChild(outlineLabel);
        
        // Свечение
        const glowContainer = document.createElement('div');
        glowContainer.className = 'effect-control-container';
        
        const glowToggle = document.createElement('input');
        glowToggle.type = 'checkbox';
        glowToggle.id = 'glowToggle';
        
        const glowLabel = document.createElement('label');
        glowLabel.htmlFor = 'glowToggle';
        glowLabel.textContent = 'Свечение';
        
        glowContainer.appendChild(glowToggle);
        glowContainer.appendChild(glowLabel);
        
        controls.appendChild(shadowContainer);
        controls.appendChild(outlineContainer);
        controls.appendChild(glowContainer);
        
        group.appendChild(title);
        group.appendChild(controls);
        
        return group;
    }

    // Создание группы настроек ключевых слов
    createKeywordHighlightingGroup() {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const title = document.createElement('h4');
        title.textContent = 'Подсветка ключевых слов';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls keyword-controls';
        
        // Автоматическая подсветка
        const autoHighlightContainer = document.createElement('div');
        autoHighlightContainer.className = 'effect-control-container';
        
        const autoHighlightToggle = document.createElement('input');
        autoHighlightToggle.type = 'checkbox';
        autoHighlightToggle.id = 'autoHighlightToggle';
        autoHighlightToggle.checked = true;
        
        const autoHighlightLabel = document.createElement('label');
        autoHighlightLabel.htmlFor = 'autoHighlightToggle';
        autoHighlightLabel.textContent = 'Автоподсветка AI';
        
        autoHighlightContainer.appendChild(autoHighlightToggle);
        autoHighlightContainer.appendChild(autoHighlightLabel);
        
        // Цвет ручных ключевых слов
        const manualColorContainer = document.createElement('div');
        manualColorContainer.className = 'color-control-container';
        
        const manualColorLabel = document.createElement('label');
        manualColorLabel.textContent = 'Цвет ручных (*слово*):';
        
        const manualColorPicker = document.createElement('input');
        manualColorPicker.type = 'color';
        manualColorPicker.id = 'manualKeywordColorPicker';
        manualColorPicker.className = 'color-picker';
        manualColorPicker.value = '#E74C3C';
        
        manualColorContainer.appendChild(manualColorLabel);
        manualColorContainer.appendChild(manualColorPicker);
        
        // Цвет автоматических ключевых слов
        const autoColorContainer = document.createElement('div');
        autoColorContainer.className = 'color-control-container';
        
        const autoColorLabel = document.createElement('label');
        autoColorLabel.textContent = 'Цвет AI ключевых слов:';
        
        const autoColorPicker = document.createElement('input');
        autoColorPicker.type = 'color';
        autoColorPicker.id = 'autoKeywordColorPicker';
        autoColorPicker.className = 'color-picker';
        autoColorPicker.value = '#4A90E2';
        
        autoColorContainer.appendChild(autoColorLabel);
        autoColorContainer.appendChild(autoColorPicker);
        
        // Интенсивность свечения
        const glowIntensityContainer = document.createElement('div');
        glowIntensityContainer.className = 'range-container';
        
        const glowIntensityLabel = document.createElement('label');
        glowIntensityLabel.textContent = 'Интенсивность свечения:';
        
        const glowIntensityRange = document.createElement('input');
        glowIntensityRange.type = 'range';
        glowIntensityRange.id = 'keywordGlowIntensityRange';
        glowIntensityRange.className = 'property-control';
        glowIntensityRange.min = '0';
        glowIntensityRange.max = '1';
        glowIntensityRange.step = '0.1';
        glowIntensityRange.value = '0.3';
        
        const glowIntensityValue = document.createElement('span');
        glowIntensityValue.id = 'keywordGlowIntensityValue';
        glowIntensityValue.className = 'range-value';
        glowIntensityValue.textContent = '30%';
        
        glowIntensityContainer.appendChild(glowIntensityLabel);
        glowIntensityContainer.appendChild(glowIntensityRange);
        glowIntensityContainer.appendChild(glowIntensityValue);
        
        // Подсказка по использованию
        const hint = document.createElement('div');
        hint.className = 'keyword-hint';
        hint.innerHTML = '💡 Используйте *слово* для ручной подсветки';
        
        controls.appendChild(autoHighlightContainer);
        controls.appendChild(manualColorContainer);
        controls.appendChild(autoColorContainer);
        controls.appendChild(glowIntensityContainer);
        controls.appendChild(hint);
        
        group.appendChild(title);
        group.appendChild(controls);
        
        return group;
    }

    // Создание группы настроек фона
    createBackgroundPropertiesGroup() {
        const group = document.createElement('div');
        group.className = 'property-group background-group';
        
        const title = document.createElement('h4');
        title.textContent = 'Фон слайда';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls background-controls';
        
        // Загрузка изображения
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'upload-container';
        
        const uploadLabel = document.createElement('label');
        uploadLabel.textContent = 'Фоновое изображение:';
        uploadLabel.className = 'upload-label';
        
        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.id = 'backgroundImageUpload';
        uploadInput.accept = 'image/*';
        uploadInput.className = 'upload-input';
        uploadInput.style.display = 'none';
        
        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.className = 'btn btn-upload';
        uploadBtn.innerHTML = '📁 Выбрать изображение';
        uploadBtn.onclick = () => uploadInput.click();
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-remove';
        removeBtn.id = 'removeBackgroundBtn';
        removeBtn.innerHTML = '🗑️ Удалить';
        removeBtn.style.display = 'none';
        
        uploadContainer.appendChild(uploadLabel);
        uploadContainer.appendChild(uploadInput);
        uploadContainer.appendChild(uploadBtn);
        uploadContainer.appendChild(removeBtn);
        
        // Позиция X
        const xPositionContainer = document.createElement('div');
        xPositionContainer.className = 'range-container';
        
        const xPositionLabel = document.createElement('label');
        xPositionLabel.textContent = 'Позиция X:';
        
        const xPositionRange = document.createElement('input');
        xPositionRange.type = 'range';
        xPositionRange.id = 'backgroundXRange';
        xPositionRange.className = 'property-control';
        xPositionRange.min = '0';
        xPositionRange.max = '100';
        xPositionRange.value = '50';
        
        const xPositionValue = document.createElement('span');
        xPositionValue.id = 'backgroundXValue';
        xPositionValue.className = 'range-value';
        xPositionValue.textContent = '50%';
        
        xPositionContainer.appendChild(xPositionLabel);
        xPositionContainer.appendChild(xPositionRange);
        xPositionContainer.appendChild(xPositionValue);
        
        // Позиция Y
        const yPositionContainer = document.createElement('div');
        yPositionContainer.className = 'range-container';
        
        const yPositionLabel = document.createElement('label');
        yPositionLabel.textContent = 'Позиция Y:';
        
        const yPositionRange = document.createElement('input');
        yPositionRange.type = 'range';
        yPositionRange.id = 'backgroundYRange';
        yPositionRange.className = 'property-control';
        yPositionRange.min = '0';
        yPositionRange.max = '100';
        yPositionRange.value = '50';
        
        const yPositionValue = document.createElement('span');
        yPositionValue.id = 'backgroundYValue';
        yPositionValue.className = 'range-value';
        yPositionValue.textContent = '50%';
        
        yPositionContainer.appendChild(yPositionLabel);
        yPositionContainer.appendChild(yPositionRange);
        yPositionContainer.appendChild(yPositionValue);
        
        // Яркость
        const brightnessContainer = document.createElement('div');
        brightnessContainer.className = 'range-container';
        
        const brightnessLabel = document.createElement('label');
        brightnessLabel.textContent = 'Яркость:';
        
        const brightnessRange = document.createElement('input');
        brightnessRange.type = 'range';
        brightnessRange.id = 'backgroundBrightnessRange';
        brightnessRange.className = 'property-control';
        brightnessRange.min = '0';
        brightnessRange.max = '200';
        brightnessRange.value = '100';
        
        const brightnessValue = document.createElement('span');
        brightnessValue.id = 'backgroundBrightnessValue';
        brightnessValue.className = 'range-value';
        brightnessValue.textContent = '100%';
        
        brightnessContainer.appendChild(brightnessLabel);
        brightnessContainer.appendChild(brightnessRange);
        brightnessContainer.appendChild(brightnessValue);
        
        // Применить ко всем слайдам
        const applyToAllContainer = document.createElement('div');
        applyToAllContainer.className = 'apply-to-all-container';
        
        const applyToAllToggle = document.createElement('input');
        applyToAllToggle.type = 'checkbox';
        applyToAllToggle.id = 'applyBackgroundToAll';
        
        const applyToAllLabel = document.createElement('label');
        applyToAllLabel.htmlFor = 'applyBackgroundToAll';
        applyToAllLabel.textContent = 'Применить ко всем слайдам';
        applyToAllLabel.className = 'apply-to-all-label';
        
        applyToAllContainer.appendChild(applyToAllToggle);
        applyToAllContainer.appendChild(applyToAllLabel);
        
        // Предварительный просмотр
        const previewContainer = document.createElement('div');
        previewContainer.className = 'background-preview-container';
        previewContainer.id = 'backgroundPreview';
        previewContainer.innerHTML = '<div class="preview-placeholder">Изображение не выбрано</div>';
        
        controls.appendChild(uploadContainer);
        controls.appendChild(previewContainer);
        controls.appendChild(xPositionContainer);
        controls.appendChild(yPositionContainer);
        controls.appendChild(brightnessContainer);
        controls.appendChild(applyToAllContainer);
        
        group.appendChild(title);
        group.appendChild(controls);
        
        return group;
    }

    // Создание редактируемого слайда
    createEditableSlide(slide) {
        const slideEl = document.createElement('div');
        slideEl.className = 'slide editable';
        slideEl.dataset.slideId = slide.id;
        
        // Устанавливаем фон
        this.setSlideBackground(slideEl, slide.background);
        
        // Добавляем текстовые блоки с возможностью редактирования
        slide.textBlocks.forEach(block => {
            const blockElement = this.createEditableTextBlock(block, slide.autoKeywords || []);
            slideEl.appendChild(blockElement);
        });
        
        return slideEl;
    }

    // Создание редактируемого текстового блока
    createEditableTextBlock(block, autoKeywords = []) {
        const blockEl = document.createElement('div');
        blockEl.className = 'slide-text-block-editable';
        blockEl.dataset.blockId = block.id;
        
        // Применяем все стили с поддержкой независимых свойств
        this.applyTextBlockStyles(blockEl, block);
        
        // Добавляем класс для drag&drop
        blockEl.classList.add('draggable-text-block');
        
        // Обрабатываем ключевые слова
        this.setTextWithKeywords(blockEl, block.text, autoKeywords, block.keywordHighlighting);
        
        // Добавляем ручки для изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'text-block-resize-handle';
        blockEl.appendChild(resizeHandle);
        
        // Добавляем индикатор редактирования
        if (block.isEditing) {
            blockEl.classList.add('editing-mode');
        }
        
        return blockEl;
    }

    // Создание панели инструментов редактора
    createEditorToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar glass-card';
        
        // Кнопка добавления текстового блока
        const addTextBtn = document.createElement('button');
        addTextBtn.className = 'btn btn-secondary';
        addTextBtn.id = 'addTextBlockBtn';
        addTextBtn.innerHTML = '➕ Добавить текст';
        
        // Настройки шрифта
        const fontControls = document.createElement('div');
        fontControls.className = 'font-controls';
        
        const fontSelect = document.createElement('select');
        fontSelect.id = 'fontSelect';
        fontSelect.innerHTML = `
            <option value="Inter">Inter</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Oswald">Oswald</option>
            <option value="Playfair Display">Playfair Display</option>
        `;
        
        const sizeInput = document.createElement('input');
        sizeInput.type = 'range';
        sizeInput.id = 'fontSizeRange';
        sizeInput.min = '12';
        sizeInput.max = '72';
        sizeInput.value = '32';
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.id = 'textColorPicker';
        colorInput.value = '#ffffff';
        
        fontControls.appendChild(fontSelect);
        fontControls.appendChild(sizeInput);
        fontControls.appendChild(colorInput);
        
        toolbar.appendChild(addTextBtn);
        toolbar.appendChild(fontControls);
        
        return toolbar;
    }

    // Создание действий редактора с шаблонами
    createEditorActions() {
        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        
        // Основные действия
        const mainActions = document.createElement('div');
        mainActions.className = 'main-actions';
        
        // Кнопка "Назад к превью"
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary';
        backBtn.id = 'backToPreviewBtn';
        backBtn.textContent = '← Назад';
        
        // Кнопка "Сохранить"
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.id = 'saveEditorBtn';
        saveBtn.textContent = '💾 Сохранить';
        
        mainActions.appendChild(backBtn);
        mainActions.appendChild(saveBtn);
        
        // Действия с шаблонами
        const templateActions = document.createElement('div');
        templateActions.className = 'template-actions';
        
        // Кнопка "Сохранить шаблон"
        const saveTemplateBtn = document.createElement('button');
        saveTemplateBtn.className = 'btn btn-template';
        saveTemplateBtn.id = 'saveTemplateBtn';
        saveTemplateBtn.innerHTML = '💾 Сохранить шаблон';
        saveTemplateBtn.title = 'Сохранить текущий слайд как шаблон';
        
        // Кнопка "Применить к слайду"
        const applyToSlideBtn = document.createElement('button');
        applyToSlideBtn.className = 'btn btn-template';
        applyToSlideBtn.id = 'applyTemplateToSlideBtn';
        applyToSlideBtn.innerHTML = '🎯 Применить к слайду';
        applyToSlideBtn.title = 'Применить шаблон к текущему слайду';
        
        // Кнопка "Применить ко всем"
        const applyToAllBtn = document.createElement('button');
        applyToAllBtn.className = 'btn btn-template';
        applyToAllBtn.id = 'applyTemplateToAllBtn';
        applyToAllBtn.innerHTML = '📄 Применить ко всем';
        applyToAllBtn.title = 'Применить шаблон ко всем слайдам';
        
        templateActions.appendChild(saveTemplateBtn);
        templateActions.appendChild(applyToSlideBtn);
        templateActions.appendChild(applyToAllBtn);
        
        actions.appendChild(mainActions);
        actions.appendChild(templateActions);
        
        return actions;
    }
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ DOM =====
    
    // Установка фона слайда
    setSlideBackground(slideEl, background) {
        if (background.type === 'color') {
            slideEl.style.background = background.color;
        } else if (background.type === 'image' && background.image) {
            slideEl.style.backgroundImage = `url(${background.image})`;
            slideEl.style.backgroundSize = 'cover';
            slideEl.style.backgroundRepeat = 'no-repeat';
            slideEl.style.backgroundPosition = `${background.x || 50}% ${background.y || 50}%`;
            
            if (background.brightness && background.brightness !== 100) {
                slideEl.style.filter = `brightness(${background.brightness}%)`;
            }
        }
    }
    
    // Создание навигации карусели
    createCarouselNavigation(activeSlideIndex, totalSlides) {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        
        // Кнопка "Назад"
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.id = 'prevBtn';
        prevBtn.textContent = '‹';
        prevBtn.disabled = activeSlideIndex === 0;
        
        // Индикаторы
        const indicators = document.createElement('div');
        indicators.className = 'indicators';
        
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${i === activeSlideIndex ? 'active' : ''}`;
            indicator.dataset.index = i;
            indicators.appendChild(indicator);
        }
        
        // Кнопка "Вперед"
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.id = 'nextBtn';
        nextBtn.textContent = '›';
        nextBtn.disabled = activeSlideIndex === totalSlides - 1;
        
        nav.appendChild(prevBtn);
        nav.appendChild(indicators);
        nav.appendChild(nextBtn);
        
        return nav;
    }
    
    // Создание прогресс бара
    createProgressBar(activeSlideIndex, totalSlides) {
        if (totalSlides <= 5) return null;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'carousel-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${((activeSlideIndex + 1) / totalSlides) * 100}%`;
        
        progressContainer.appendChild(progressBar);
        return progressContainer;
    }
    
    // Создание подсказки навигации
    createNavigationHint() {
        const navHint = document.createElement('div');
        navHint.className = 'slide-nav-hint';
        
        const leftHint = document.createElement('div');
        leftHint.className = 'nav-hint-left';
        leftHint.textContent = 'Листай';
        
        const rightHint = document.createElement('div');
        rightHint.className = 'nav-hint-right';
        
        // Создаем SVG стрелку
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'm9 18 6-6-6-6');
        
        svg.appendChild(path);
        rightHint.appendChild(svg);
        
        navHint.appendChild(leftHint);
        navHint.appendChild(rightHint);
        
        return navHint;
    }
    
    // Создание действий превью
    createPreviewActions() {
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        // Кнопка "Новая карусель"
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary';
        backBtn.id = 'backToStartBtn';
        backBtn.textContent = '← Новая карусель';
        
        // Кнопка "Развернуть идею"
        const expandBtn = document.createElement('button');
        expandBtn.className = 'btn btn-info';
        expandBtn.id = 'expandIdeaBtn';
        expandBtn.textContent = '🚀 Развернуть идею';
        
        // Кнопка "Сохранить слайд"
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn btn-success';
        downloadBtn.id = 'downloadCurrentBtn';
        downloadBtn.textContent = '💾 Сохранить слайд';
        
        // Кнопка "Редактировать"
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary';
        editBtn.id = 'openEditorBtn';
        editBtn.textContent = '✏️ Редактировать';
        
        actions.appendChild(backBtn);
        actions.appendChild(expandBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(editBtn);
        
        return actions;
    }
    
    // Установка текста с ключевыми словами (чистый DOM)
    setTextWithKeywords(element, text, autoKeywords = [], keywordSettings = null) {
        // Очищаем элемент
        element.innerHTML = '';
        
        // Получаем настройки подсветки из блока или используем значения по умолчанию
        const settings = keywordSettings || {
            autoHighlight: true,
            keywordColor: '#E74C3C',
            autoKeywordColor: '#4A90E2',
            glowEnabled: true,
            glowIntensity: 0.3
        };
        
        let processedText = text;
        const fragments = [];
        
        // Обрабатываем ручные ключевые слова (*слово*)
        const manualKeywordRegex = /\*([^*]+)\*/g;
        let lastIndex = 0;
        let match;
        
        while ((match = manualKeywordRegex.exec(text)) !== null) {
            // Добавляем текст до ключевого слова
            if (match.index > lastIndex) {
                fragments.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }
            
            // Добавляем ручное ключевое слово
            fragments.push({
                type: 'manual-keyword',
                content: match[1],
                color: settings.keywordColor
            });
            
            lastIndex = match.index + match[0].length;
        }
        
        // Добавляем оставшийся текст
        if (lastIndex < text.length) {
            fragments.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }
        
        // Создаем DOM элементы
        fragments.forEach(fragment => {
            if (fragment.type === 'manual-keyword') {
                const span = document.createElement('span');
                span.className = 'manual-keyword';
                span.textContent = fragment.content;
                
                // Применяем пользовательский цвет если задан
                if (fragment.color && fragment.color !== '#E74C3C') {
                    span.style.background = fragment.color;
                }
                
                // Применяем свечение если включено
                if (settings.glowEnabled && settings.glowIntensity > 0) {
                    const glowColor = this.hexToRgba(fragment.color || '#E74C3C', settings.glowIntensity);
                    span.style.filter = `drop-shadow(0 0 ${settings.glowIntensity * 20}px ${glowColor})`;
                }
                
                element.appendChild(span);
            } else {
                // Обрабатываем автоматические ключевые слова в обычном тексте
                this.addTextWithAutoKeywords(element, fragment.content, autoKeywords, settings);
            }
        });
    }
    
    // Добавление текста с автоматическими ключевыми словами
    addTextWithAutoKeywords(parent, text, autoKeywords, settings) {
        // Если автоподсветка отключена или нет ключевых слов, добавляем обычный текст
        if (!settings.autoHighlight || autoKeywords.length === 0) {
            parent.appendChild(document.createTextNode(text));
            return;
        }
        
        let processedText = text;
        
        autoKeywords.forEach(keyword => {
            // Create a regex that works better with Cyrillic text
            // Try multiple patterns to handle different cases
            const escapedKeyword = this.escapeRegex(keyword);
            
            const patterns = [
                new RegExp(`\\b(${escapedKeyword})\\b`, 'gi'),  // Standard word boundaries
                new RegExp(`(^|\\s)(${escapedKeyword})(\\s|$)`, 'gi'),  // Space boundaries
                new RegExp(`(${escapedKeyword})`, 'gi')  // Simple match (fallback)
            ];
            
            let matched = false;
            for (let p = 0; p < patterns.length; p++) {
                const regex = patterns[p];
                const beforeReplace = processedText;
                
                if (p === 1) {
                    // For space boundaries, preserve the spaces
                    processedText = processedText.replace(regex, '$1<AUTO_KEYWORD>$2</AUTO_KEYWORD>$3');
                } else {
                    processedText = processedText.replace(regex, '<AUTO_KEYWORD>$1</AUTO_KEYWORD>');
                }
                
                if (beforeReplace !== processedText) {
                    matched = true;
                    break;
                }
            }
        });
        
        // Разбиваем на части
        const segments = processedText.split(/<AUTO_KEYWORD>|<\/AUTO_KEYWORD>/);
        let isKeyword = false;
        
        segments.forEach(segment => {
            if (segment) {
                if (isKeyword) {
                    const span = document.createElement('span');
                    span.className = 'auto-keyword';
                    span.textContent = segment;
                    
                    // Применяем пользовательский цвет если задан
                    if (settings.autoKeywordColor && settings.autoKeywordColor !== '#4A90E2') {
                        span.style.background = settings.autoKeywordColor;
                    }
                    
                    // Применяем свечение если включено
                    if (settings.glowEnabled && settings.glowIntensity > 0) {
                        const glowColor = this.hexToRgba(settings.autoKeywordColor || '#4A90E2', settings.glowIntensity);
                        span.style.filter = `drop-shadow(0 0 ${settings.glowIntensity * 20}px ${glowColor})`;
                    }
                    
                    parent.appendChild(span);
                } else {
                    parent.appendChild(document.createTextNode(segment));
                }
            }
            isKeyword = !isKeyword;
        });
    }
    
    // Вспомогательные методы для работы с цветами
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Обновление UI в зависимости от режима
    updateModeUI() {
        const app = document.getElementById('app');
        if (!app) return;
        
        // Добавляем CSS класс для текущего режима
        app.className = `mode-${this.state.project.mode}`;
        
        // Добавляем специфичные для режима стили
        this.addModeSpecificStyles();
        
        console.log(`✅ UI обновлен для режима: ${this.state.project.mode}`);
    }

    // Добавление специфичных для режима стилей
    addModeSpecificStyles() {
        // Удаляем старые стили режима
        const existingModeStyles = document.getElementById('mode-styles');
        if (existingModeStyles) {
            existingModeStyles.remove();
        }
        
        // Создаем новые стили для текущего режима
        const modeStyles = document.createElement('style');
        modeStyles.id = 'mode-styles';
        
        let css = '';
        
        switch (this.state.project.mode) {
            case "preview":
                css = `
                    .mode-preview .preview-text-block {
                        cursor: default !important;
                        pointer-events: none;
                    }
                    .mode-preview .text-block-resize-handle {
                        display: none !important;
                    }
                    .mode-preview .text-block-selected,
                    .mode-preview .text-block-hover {
                        outline: none !important;
                        box-shadow: none !important;
                    }
                `;
                break;
                
            case "edit":
                css = `
                    .mode-edit .preview-text-block {
                        cursor: grab;
                        pointer-events: auto;
                    }
                    .mode-edit .preview-text-block:hover {
                        outline: 2px dashed rgba(131, 58, 180, 0.5);
                    }
                    .mode-edit .text-block-selected {
                        outline: 2px solid #833ab4 !important;
                        box-shadow: 0 0 10px rgba(131, 58, 180, 0.3) !important;
                    }
                `;
                break;
                
            case "export":
                css = `
                    .mode-export .export-section {
                        animation: fadeIn 0.3s ease;
                    }
                    .mode-export .export-slide-preview {
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    }
                    .mode-export .export-slide-preview:hover {
                        transform: scale(1.05);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `;
                break;
        }
        
        modeStyles.textContent = css;
        document.head.appendChild(modeStyles);
    }

    // ===== TEMPLATE SYSTEM MODALS =====

    // Показ модального окна сохранения шаблона
    showSaveTemplateModal() {
        const modal = this.createModal('save-template-modal', 'Сохранить шаблон');
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const description = document.createElement('p');
        description.textContent = 'Введите название для нового шаблона:';
        description.className = 'modal-description';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'templateNameInput';
        input.className = 'modal-input';
        input.placeholder = 'Например: Заголовок + 2 блока';
        input.maxLength = 50;
        
        const hint = document.createElement('div');
        hint.className = 'modal-hint';
        hint.innerHTML = '💡 Шаблон сохранит макет, стили и фон, но не текст';
        
        const buttons = document.createElement('div');
        buttons.className = 'modal-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.onclick = () => this.closeSaveTemplateModal();
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.id = 'confirmSaveTemplateBtn';
        saveBtn.textContent = '💾 Сохранить';
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(saveBtn);
        
        content.appendChild(description);
        content.appendChild(input);
        content.appendChild(hint);
        content.appendChild(buttons);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Фокус на поле ввода
        setTimeout(() => input.focus(), 100);
        
        return modal;
    }

    // Показ модального окна выбора шаблона
    showSelectTemplateModal(title, actionText) {
        const modal = this.createModal('select-template-modal', title);
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const description = document.createElement('p');
        description.textContent = 'Выберите шаблон для применения:';
        description.className = 'modal-description';
        
        const templatesList = document.createElement('div');
        templatesList.className = 'templates-list';
        templatesList.id = 'templatesList';
        
        // Загружаем шаблоны
        this.loadTemplatesIntoList(templatesList);
        
        const buttons = document.createElement('div');
        buttons.className = 'modal-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.onclick = () => this.closeSelectTemplateModal();
        
        const actionBtn = document.createElement('button');
        actionBtn.className = 'btn btn-primary';
        actionBtn.id = 'confirmTemplateActionBtn';
        actionBtn.textContent = actionText;
        actionBtn.disabled = true;
        
        buttons.appendChild(cancelBtn);
        buttons.appendChild(actionBtn);
        
        content.appendChild(description);
        content.appendChild(templatesList);
        content.appendChild(buttons);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        return modal;
    }

    // Создание базового модального окна
    createModal(id, title) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = id;
        
        const modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.className = 'modal-title';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.closeModal(id);
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        modalDialog.appendChild(header);
        modal.appendChild(modalDialog);
        
        // Закрытие по клику на overlay
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        };
        
        return modalDialog;
    }

    // Загрузка шаблонов в список
    loadTemplatesIntoList(container) {
        if (!window.templateManager) {
            container.innerHTML = '<p class="no-templates">Менеджер шаблонов не инициализирован</p>';
            return;
        }

        const templates = window.templateManager.getTemplatesFromStorage();
        
        if (templates.length === 0) {
            container.innerHTML = '<p class="no-templates">Нет сохраненных шаблонов</p>';
            return;
        }

        container.innerHTML = '';
        
        templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;
            
            const templatePreview = document.createElement('div');
            templatePreview.className = 'template-preview';
            templatePreview.style.background = template.background.color || '#833ab4';
            
            // Показываем количество блоков
            const blocksCount = document.createElement('div');
            blocksCount.className = 'template-blocks-count';
            blocksCount.textContent = `${template.textBlocksLayout.length} блоков`;
            templatePreview.appendChild(blocksCount);
            
            const templateInfo = document.createElement('div');
            templateInfo.className = 'template-info';
            
            const templateName = document.createElement('div');
            templateName.className = 'template-name';
            templateName.textContent = template.name;
            
            const templateDate = document.createElement('div');
            templateDate.className = 'template-date';
            templateDate.textContent = new Date(template.createdAt).toLocaleDateString();
            
            templateInfo.appendChild(templateName);
            templateInfo.appendChild(templateDate);
            
            templateItem.appendChild(templatePreview);
            templateItem.appendChild(templateInfo);
            
            // Обработка выбора шаблона
            templateItem.onclick = () => {
                // Снимаем выделение с других элементов
                container.querySelectorAll('.template-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Выделяем текущий элемент
                templateItem.classList.add('selected');
                
                // Активируем кнопку действия
                const actionBtn = document.getElementById('confirmTemplateActionBtn');
                if (actionBtn) {
                    actionBtn.disabled = false;
                    actionBtn.dataset.templateId = template.id;
                }
            };
            
            container.appendChild(templateItem);
        });
    }

    // Закрытие модальных окон
    closeSaveTemplateModal() {
        this.closeModal('save-template-modal');
    }

    closeSelectTemplateModal() {
        this.closeModal('select-template-modal');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Создание панели контролов шаблонов
    createTemplateControlsPanel() {
        const panel = document.createElement('div');
        panel.className = 'template-controls-panel property-group';
        panel.style.display = 'block'; // ПРИНУДИТЕЛЬНО ПОКАЗЫВАЕМ
        
        const title = document.createElement('h4');
        title.textContent = 'Система шаблонов';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls template-controls';
        
        // Кнопка сохранения шаблона
        const saveTemplateBtn = document.createElement('button');
        saveTemplateBtn.className = 'btn btn-template btn-full-width';
        saveTemplateBtn.id = 'saveTemplateBtn';
        saveTemplateBtn.innerHTML = '💾 Сохранить как шаблон';
        saveTemplateBtn.title = 'Сохранить текущий слайд как шаблон для повторного использования';
        
        // Кнопка применения к слайду
        const applyToSlideBtn = document.createElement('button');
        applyToSlideBtn.className = 'btn btn-template btn-full-width';
        applyToSlideBtn.id = 'applyTemplateToSlideBtn';
        applyToSlideBtn.innerHTML = '🎯 Применить шаблон к слайду';
        applyToSlideBtn.title = 'Выбрать и применить сохраненный шаблон к текущему слайду';
        
        // Кнопка применения ко всем слайдам
        const applyToAllBtn = document.createElement('button');
        applyToAllBtn.className = 'btn btn-template btn-full-width';
        applyToAllBtn.id = 'applyTemplateToAllBtn';
        applyToAllBtn.innerHTML = '📄 Применить ко всем слайдам';
        applyToAllBtn.title = 'Применить выбранный шаблон ко всем слайдам в карусели';
        
        // Информация о шаблонах
        const templateInfo = document.createElement('div');
        templateInfo.className = 'template-info';
        templateInfo.innerHTML = `
            <div class="info-text">
                <small>💡 Шаблоны сохраняют стили текста, позиционирование и эффекты</small>
            </div>
        `;
        
        controls.appendChild(saveTemplateBtn);
        controls.appendChild(applyToSlideBtn);
        controls.appendChild(applyToAllBtn);
        controls.appendChild(templateInfo);
        
        panel.appendChild(title);
        panel.appendChild(controls);
        
        return panel;
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Создание панели расширенных AI опций
    createAIAdvancedOptionsPanel() {
        const panel = document.createElement('div');
        panel.className = 'ai-advanced-options-panel property-group';
        panel.style.display = 'block'; // ПРИНУДИТЕЛЬНО ПОКАЗЫВАЕМ
        
        const title = document.createElement('h4');
        title.textContent = 'AI расширенные опции';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls ai-advanced-controls';
        
        // Кнопка улучшения текста AI
        const improveTextBtn = document.createElement('button');
        improveTextBtn.className = 'btn btn-ai btn-full-width';
        improveTextBtn.id = 'improveTextBtn';
        improveTextBtn.innerHTML = '🤖 Улучшить текст AI';
        improveTextBtn.title = 'Использовать AI для улучшения выбранного текстового блока';
        
        // Кнопка генерации вариантов
        const generateVariantsBtn = document.createElement('button');
        generateVariantsBtn.className = 'btn btn-ai btn-full-width';
        generateVariantsBtn.id = 'generateVariantsBtn';
        generateVariantsBtn.innerHTML = '🎲 Сгенерировать варианты';
        generateVariantsBtn.title = 'Создать несколько вариантов текста для выбора';
        
        // Кнопка автоматического форматирования
        const autoFormatBtn = document.createElement('button');
        autoFormatBtn.className = 'btn btn-ai btn-full-width';
        autoFormatBtn.id = 'autoFormatBtn';
        autoFormatBtn.innerHTML = '✨ Автоформатирование';
        autoFormatBtn.title = 'Автоматически подобрать оптимальные стили для текста';
        
        // Переключатель AI режима
        const aiModeContainer = document.createElement('div');
        aiModeContainer.className = 'ai-mode-container';
        
        const aiModeToggle = document.createElement('input');
        aiModeToggle.type = 'checkbox';
        aiModeToggle.id = 'aiModeToggle';
        aiModeToggle.checked = true;
        
        const aiModeLabel = document.createElement('label');
        aiModeLabel.htmlFor = 'aiModeToggle';
        aiModeLabel.textContent = 'Включить AI помощник';
        aiModeLabel.className = 'ai-mode-label';
        
        aiModeContainer.appendChild(aiModeToggle);
        aiModeContainer.appendChild(aiModeLabel);
        
        // Информация об AI
        const aiInfo = document.createElement('div');
        aiInfo.className = 'ai-info';
        aiInfo.innerHTML = `
            <div class="info-text">
                <small>🧠 AI анализирует контент и предлагает улучшения</small>
            </div>
        `;
        
        controls.appendChild(improveTextBtn);
        controls.appendChild(generateVariantsBtn);
        controls.appendChild(autoFormatBtn);
        controls.appendChild(aiModeContainer);
        controls.appendChild(aiInfo);
        
        panel.appendChild(title);
        panel.appendChild(controls);
        
        return panel;
    }

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Создание панели ручных текстовых блоков
    createManualTextBlocksPanel() {
        const panel = document.createElement('div');
        panel.className = 'manual-text-blocks-panel property-group';
        panel.style.display = 'block'; // ПРИНУДИТЕЛЬНО ПОКАЗЫВАЕМ
        
        const title = document.createElement('h4');
        title.textContent = 'Управление текстовыми блоками';
        title.className = 'group-title';
        
        const controls = document.createElement('div');
        controls.className = 'property-controls manual-text-controls';
        
        // Кнопка добавления блока
        const addBlockBtn = document.createElement('button');
        addBlockBtn.className = 'btn btn-primary btn-full-width';
        addBlockBtn.id = 'addTextBlockBtn';
        addBlockBtn.innerHTML = '➕ Добавить текстовый блок';
        addBlockBtn.title = 'Добавить новый редактируемый текстовый блок';
        
        // Кнопка дублирования блока
        const duplicateBlockBtn = document.createElement('button');
        duplicateBlockBtn.className = 'btn btn-secondary btn-full-width';
        duplicateBlockBtn.id = 'duplicateBlockBtn';
        duplicateBlockBtn.innerHTML = '📋 Дублировать блок';
        duplicateBlockBtn.title = 'Создать копию выбранного текстового блока';
        
        // Кнопка удаления блока
        const deleteBlockBtn = document.createElement('button');
        deleteBlockBtn.className = 'btn btn-danger btn-full-width';
        deleteBlockBtn.id = 'deleteBlockBtn';
        deleteBlockBtn.innerHTML = '🗑️ Удалить блок';
        deleteBlockBtn.title = 'Удалить выбранный текстовый блок';
        
        // Информация о блоках
        const blocksInfo = document.createElement('div');
        blocksInfo.className = 'blocks-info';
        blocksInfo.innerHTML = `
            <div class="info-text">
                <small>📝 Кликните на блок для редактирования, перетаскивайте для перемещения</small>
            </div>
        `;
        
        controls.appendChild(addBlockBtn);
        controls.appendChild(duplicateBlockBtn);
        controls.appendChild(deleteBlockBtn);
        controls.appendChild(blocksInfo);
        
        panel.appendChild(title);
        panel.appendChild(controls);
        
        return panel;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
} else {
    window.Renderer = Renderer;
}