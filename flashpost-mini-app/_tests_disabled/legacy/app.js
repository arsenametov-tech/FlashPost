// ===== FLASHPOST AI - МИНИ-ПРИЛОЖЕНИЕ =====

class FlashPostApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        
        // === ЕДИНАЯ СТРУКТУРА ПРОЕКТА (ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ) ===
        this.project = {
            slides: [],
            activeSlideId: null,
            activeTextBlockId: null,
            mode: 'start' // 'start' | 'preview' | 'edit' | 'export'
        };
        
        // === ЕДИНЫЙ УКАЗАТЕЛЬ НА АКТИВНЫЙ СЛАЙД ===
        this.currentSlideIndex = 0;
        
        // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
        this.isGenerating = false;
        this.applyToAll = false;
        
        // === СОСТОЯНИЕ DRAG & DROP ===
        this.dragBlockId = null;
        this.isDragging = false;
        
        // Привязываем методы к контексту для глобальных обработчиков
        this.onDragMove = this.onDragMove.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        
        console.log('🚀 Инициализация FlashPost AI...');
        this.init();
    }

    async init() {
        try {
            // Инициализация Telegram WebApp
            this.initTelegramWebApp();
            
            // Настройка темы
            this.setupTheme();
            
            // Привязка событий
            this.bindEvents();
            
            // Показ приложения
            setTimeout(() => {
                this.showApp();
            }, 500);
            
            console.log('✅ Приложение инициализировано');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
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
        
        // Обновляем UI в зависимости от режима
        this.updateModeUI();
        
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

    // Обновление UI в зависимости от режима
    updateModeUI() {
        const app = document.getElementById('app');
        if (!app) return;
        
        // Добавляем CSS класс для текущего режима
        app.className = `mode-${this.mode}`;
        
        // Добавляем специфичные для режима стили
        this.addModeSpecificStyles();
        
        // Обновляем Telegram WebApp кнопки
        this.updateTelegramButtons();
        
        console.log(`✅ UI обновлен для режима: ${this.mode}`);
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
        
        switch (this.mode) {
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

    // Обновление кнопок Telegram WebApp
    updateTelegramButtons() {
        if (!this.tg) return;
        
        switch (this.mode) {
            case "start":
                this.tg.MainButton.setText('Создать карусель');
                this.tg.MainButton.onClick(() => this.handleGenerate());
                this.tg.BackButton.hide();
                break;
                
            case "preview":
                this.tg.MainButton.setText('Редактировать');
                this.tg.MainButton.onClick(() => this.enterEditMode());
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.enterStartMode());
                break;
                
            case "edit":
                this.tg.MainButton.setText('Сохранить');
                this.tg.MainButton.onClick(() => this.saveAndExitEditor());
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.exitEditor());
                break;
                
            case "export":
                this.tg.MainButton.setText('Скачать');
                this.tg.MainButton.onClick(() => this.downloadAllSlides());
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.enterPreviewMode());
                break;
        }
    }

    // Переход в режим старта
    enterStartMode() {
        this.setMode("start");
        this.render();
    }

    // Переход в режим превью
    enterPreviewMode() {
        this.setMode("preview");
        this.render();
    }

    // Переход в режим редактирования
    enterEditMode() {
        this.setMode("edit");
        this.render();
    }
    
    // Переход в режим экспорта
    async enterExportMode() {
        await this.setMode("export");
        this.render();
    }

    // ===== ЕДИНЫЙ МЕТОД РЕНДЕРИНГА ПО РЕЖИМАМ =====

    // Главный метод рендеринга
    render() {
        const app = document.getElementById('app');
        if (!app) return;

        // Очищаем контейнер
        app.innerHTML = '';

        // Рендерим в зависимости от режима
        if (this.project.mode === 'start') {
            const startElement = this.createStartDOM();
            app.appendChild(startElement);
            this.bindStartEvents();
        } else if (this.project.mode === 'edit') {
            this.renderEditor();
        } else if (this.project.mode === 'preview') {
            this.renderPreview();
        } else if (this.project.mode === 'export') {
            this.renderExport();
        }

        // Обновляем UI для режима
        this.updateModeUI();
        
        console.log(`✅ Рендер завершен для режима: ${this.project.mode}`);
    }
    
    // Рендер редактора (ТОЛЬКО EDIT режим с drag&drop)
    renderEditor() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const editorElement = this.createEditorDOM();
        app.appendChild(editorElement);
        this.bindEditorEvents();
        
        console.log('✅ Редактор отрендерен в EDIT режиме с drag&drop');
    }
    
    // Рендер превью (DOM)
    renderPreview() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const previewElement = this.createPreviewDOM();
        app.appendChild(previewElement);
        this.bindPreviewEvents();
        
        console.log('✅ Превью отрендерено через DOM');
    }
    
    // Рендер экспорта (упрощенный - только переключение режима)
    renderExport() {
        // В упрощенной системе экспорт не требует специального UI
        // Просто переключаем режим для применения export стилей
        console.log('✅ Режим экспорта активирован');
    }

    // Рендер стартового экрана
    renderStart() {
        return this.createStartDOM();
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
        label.textContent = 'О чем создать карусель?';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        const input = document.createElement('textarea');
        input.id = 'topicInput';
        input.className = 'topic-input';
        input.placeholder = 'Например: "Как зарабатывать на криптовалютах", "Продуктивность для предпринимателей", "Психология продаж"...';
        input.maxLength = 200;
        input.rows = 3;
        
        const counter = document.createElement('div');
        counter.className = 'input-counter';
        counter.id = 'inputCounter';
        counter.textContent = '0/200';
        
        const generateBtn = document.createElement('button');
        generateBtn.className = 'btn btn-primary btn-generate';
        generateBtn.id = 'generateBtn';
        generateBtn.innerHTML = '<span class="btn-text">🎯 Создать карусель</span>';
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(counter);
        
        form.appendChild(label);
        form.appendChild(inputContainer);
        form.appendChild(generateBtn);
        
        return form;
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

    // Рендер превью (ЧИСТЫЙ DOM)
    renderPreview() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const previewElement = this.createPreviewDOM();
        app.appendChild(previewElement);
        this.bindPreviewEvents();
        
        console.log('✅ Превью отрендерено через чистый DOM');
    }
    
    // Создание DOM для превью
    createPreviewDOM() {
        const activeSlideIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;
        
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
        
        // Создаем слайды
        this.project.slides.forEach((slide, index) => {
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
        
        // Подсказка навигации (если не последний слайд)
        if (index < totalSlides - 1) {
            const navHint = this.createNavigationHint();
            slideEl.appendChild(navHint);
        }
        
        return slideEl;
    }
    
    // Создание текстового блока для превью
    createPreviewTextBlock(block, autoKeywords = []) {
        const blockEl = document.createElement('div');
        blockEl.className = 'slide-text-block-static';
        blockEl.dataset.blockId = block.id;
        
        // Позиционирование и стили
        blockEl.style.position = 'absolute';
        blockEl.style.left = block.x + '%';
        blockEl.style.top = block.y + '%';
        blockEl.style.width = block.width + '%';
        blockEl.style.fontSize = block.size + 'px';
        blockEl.style.fontFamily = block.font;
        blockEl.style.fontWeight = block.weight;
        blockEl.style.color = block.color;
        blockEl.style.textAlign = 'center';
        blockEl.style.lineHeight = '1.2';
        blockEl.style.wordWrap = 'break-word';
        blockEl.style.transform = 'translate(-50%, -50%)';
        blockEl.style.zIndex = '10';
        blockEl.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        blockEl.style.pointerEvents = 'none';
        blockEl.style.userSelect = 'none';
        
        // Свечение убрано - теперь только на ключевых словах через CSS
        
        // Всегда обрабатываем ключевые слова
        this.setTextWithKeywords(blockEl, block.text, autoKeywords);
        
        return blockEl;
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
        actions.appendChild(downloadBtn);
        actions.appendChild(editBtn);
        
        return actions;
    }
    
    // Установка текста с ключевыми словами (чистый DOM)
    setTextWithKeywords(element, text, autoKeywords = []) {
        // Очищаем элемент
        element.innerHTML = '';
        
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
                content: match[1]
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
                element.appendChild(span);
            } else {
                // Обрабатываем автоматические ключевые слова в обычном тексте
                this.addTextWithAutoKeywords(element, fragment.content, autoKeywords);
            }
        });
    }
    
    // Добавление текста с автоматическими ключевыми словами
    addTextWithAutoKeywords(parent, text, autoKeywords) {
        if (autoKeywords.length === 0) {
            parent.appendChild(document.createTextNode(text));
            return;
        }
        
        let processedText = text;
        const parts = [];
        
        autoKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
            processedText = processedText.replace(regex, `<AUTO_KEYWORD>$1</AUTO_KEYWORD>`);
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
                    parent.appendChild(span);
                } else {
                    parent.appendChild(document.createTextNode(segment));
                }
            }
            isKeyword = !isKeyword;
        });
    }

    // ===== ПРИВЯЗКА СОБЫТИЙ ДЛЯ КАЖДОГО РЕЖИМА =====

    // События для стартового экрана
    bindStartEvents() {
        // Кнопка генерации
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
        }

        // Кнопка ручного ввода
        const manualBtn = document.getElementById('manualBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => this.openManualInput());
        }

        // Поле ввода темы
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.addEventListener('input', () => this.updateInputCounter());
        }

        // Collapsible популярные темы
        const collapseBtn = document.getElementById('collapseBtn');
        const ideasContent = document.getElementById('ideasContent');
        if (collapseBtn && ideasContent) {
            this.isIdeasCollapsed = true;
            this.updateIdeasCollapse();
            
            collapseBtn.addEventListener('click', () => {
                this.isIdeasCollapsed = !this.isIdeasCollapsed;
                this.updateIdeasCollapse();
                this.hapticFeedback();
            });
        }

        // Главная кнопка Telegram
        if (this.tg?.MainButton) {
            this.tg.MainButton.onClick(() => this.handleGenerate());
        }

        // Кнопка назад Telegram
        if (this.tg?.BackButton) {
            this.tg.BackButton.onClick(() => this.goBack());
        }
        
        console.log('✅ События стартового экрана привязаны');
    }

    // События для превью (ТОЛЬКО НАВИГАЦИЯ)
    bindPreviewEvents() {
        console.log('🔗 Привязка событий превью...');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backToStartBtn = document.getElementById('backToStartBtn');
        const openEditorBtn = document.getElementById('openEditorBtn');
        const downloadCurrentBtn = document.getElementById('downloadCurrentBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', () => this.enterStartMode());
        }

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => this.enterEditMode());
        }

        if (downloadCurrentBtn) {
            downloadCurrentBtn.addEventListener('click', () => this.downloadCurrentSlide());
        }

        // Индикаторы (ТОЛЬКО НАВИГАЦИЯ)
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Навигационные подсказки (ТОЛЬКО НАВИГАЦИЯ)
        const navHints = document.querySelectorAll('.slide-nav-hint');
        navHints.forEach((navHint) => {
            navHint.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
                this.hapticFeedback('light');
            });
        });

        // Свайп навигация
        this.setupSwipeNavigation();
        
        console.log('✅ События превью привязаны (только навигация)');
    }
    
    // Навигация по слайдам
    previousSlide() {
        const currentIndex = this.getActiveSlideIndex();
        if (currentIndex > 0) {
            this.setActiveSlideByIndex(currentIndex - 1);
            this.render();
            this.hapticFeedback();
        }
    }
    
    nextSlide() {
        const currentIndex = this.getActiveSlideIndex();
        if (currentIndex < this.project.slides.length - 1) {
            this.setActiveSlideByIndex(currentIndex + 1);
            this.render();
            this.hapticFeedback();
        }
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.project.slides.length) {
            this.setActiveSlideByIndex(index);
            this.render();
            this.hapticFeedback();
        }
    }
    
    // Настройка свайп навигации
    setupSwipeNavigation() {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) return;
        
        let startX = 0;
        let startY = 0;
        let isSwipe = false;
        
        carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = true;
        });
        
        carouselTrack.addEventListener('touchmove', (e) => {
            if (!isSwipe) return;
            
            const deltaX = Math.abs(e.touches[0].clientX - startX);
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            
            // Если вертикальный свайп больше горизонтального, отменяем
            if (deltaY > deltaX) {
                isSwipe = false;
            }
        });
        
        carouselTrack.addEventListener('touchend', (e) => {
            if (!isSwipe) return;
            
            const endX = e.changedTouches[0].clientX;
            const deltaX = startX - endX;
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Свайп влево - следующий слайд
                    this.nextSlide();
                } else {
                    // Свайп вправо - предыдущий слайд
                    this.previousSlide();
                }
            }
            
            isSwipe = false;
        });
    }

    // События для экспорта (ТОЛЬКО КНОПКИ)
    bindExportEvents() {
        console.log('🔗 Привязка событий экспорта...');
        
        const exportAllBtn = document.getElementById('exportAllBtn');
        const exportCurrentBtn = document.getElementById('exportCurrentBtn');
        const exportTemplateBtn = document.getElementById('exportTemplateBtn');
        const backToPreviewBtn = document.getElementById('backToPreviewBtn');
        
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.downloadAllSlides());
        }
        
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => this.downloadCurrentSlide());
        }
        
        if (exportTemplateBtn) {
            exportTemplateBtn.addEventListener('click', () => this.saveTemplate());
        }
        
        if (backToPreviewBtn) {
            backToPreviewBtn.addEventListener('click', () => this.enterPreviewMode());
        }
        
        console.log('✅ События экспорта привязаны (только кнопки)');
    }

    // ===== МЕТОДЫ РАБОТЫ С ПРОЕКТОМ =====

    // Генерация уникального ID
    generateUID() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Получение текущего слайда по индексу
    getCurrentSlide() {
        return this.project.slides[this.currentSlideIndex] || null;
    }

    // Получение слайда по индексу
    getSlide(index) {
        return this.project.slides[index] || null;
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

    // Добавление текстового блока
    addTextBlock() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) {
            console.warn('⚠️ Нет активного слайда для добавления блока');
            return null;
        }

        const newBlock = {
            id: this.generateUID(),
            text: 'Новый текст',
            x: 50,
            y: 50,
            width: 80,
            font: 'Inter',
            size: 32,
            weight: 700,
            color: '#ffffff'
        };

        activeSlide.textBlocks.push(newBlock);
        
        // Устанавливаем новый блок как активный
        this.project.activeTextBlockId = newBlock.id;
        
        console.log(`✅ Добавлен текстовый блок: ${newBlock.id}`);
        
        // Перерендериваем если в режиме редактирования
        if (this.isMode('edit')) {
            this.render();
        }
        
        return newBlock;
    }

    // Получение активного слайда
    getActiveSlide() {
        if (!this.project.activeSlideId) return null;
        return this.project.slides.find(slide => slide.id === this.project.activeSlideId);
    }

    // Получение слайда по ID
    getSlideById(slideId) {
        return this.project.slides.find(slide => slide.id === slideId);
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
        const slideId = `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
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

    // Создание нового текстового блока
    createTextBlock(slideId, data = {}) {
        const slide = this.getSlideById(slideId);
        if (!slide) return null;
        
        const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newBlock = {
            id: blockId,
            text: data.text || 'Новый текст',
            x: data.x || 50,
            y: data.y || 50,
            width: data.width || 80,
            font: data.font || 'Inter',
            size: data.size || 16,
            weight: data.weight || 700,
            color: data.color || '#ffffff'
        };
        
        slide.textBlocks.push(newBlock);
        
        console.log(`✅ Создан текстовый блок: ${blockId} в слайде ${slideId}`);
        return newBlock;
    }

    // Обновление свойства слайда
    updateSlideProperty(slideId, property, value) {
        const slide = this.getSlideById(slideId);
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

    // Обновление свойства текстового блока
    updateTextBlockProperty(blockId, property, value) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return false;
        
        const block = activeSlide.textBlocks.find(b => b.id === blockId);
        if (!block) return false;
        
        // Поддержка вложенных свойств
        const keys = property.split('.');
        let target = block;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        console.log(`✅ Обновлено свойство ${property} блока ${blockId}:`, value);
        return true;
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

    // Инициализация Telegram WebApp
    initTelegramWebApp() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            this.tg.setHeaderColor('#833ab4');
            this.tg.setBackgroundColor('#ffffff');
            
            this.tg.MainButton.setText('Создать карусель');
            this.tg.MainButton.color = '#833ab4';
            this.tg.MainButton.textColor = '#ffffff';
            
            console.log('✅ Telegram WebApp настроен');
        }
    }

    // Настройка темы
    setupTheme() {
        if (this.tg?.colorScheme) {
            document.documentElement.setAttribute('data-theme', this.tg.colorScheme);
        }
    }

    // Показ приложения
    showApp() {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading && app) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
                app.style.display = 'block';
                this.render(); // Используем единый метод рендеринга
                this.loadQuickIdeas(); // Загружаем идеи после создания DOM
            }, 300);
        }
    }

    // Рендер главного экрана
    renderStartScreen() {
        return `
            <div class="section active" id="startSection">
                <div class="start-section">
                    <div class="glass-card header">
                        <h1 class="title">⚡ FlashPost</h1>
                        <p class="subtitle">Создай карусель за 30 секунд</p>
                    </div>
                    
                    <div class="ideas glass-card">
                        <div class="ideas-header" id="ideasHeader">
                            <h3>💡 Популярные темы</h3>
                            <button class="collapse-btn" id="collapseBtn">
                                <svg class="collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div class="ideas-content" id="ideasContent">
                            <div class="ideas-grid" id="ideasGrid">
                                <!-- Заполняется JS -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="input-section glass-card">
                        <label class="input-label">О чем создать карусель?</label>
                        <div class="input-wrapper">
                            <textarea 
                                id="topicInput" 
                                class="topic-input" 
                                placeholder="Например: Здоровое питание, Продуктивность, Финансы..."
                                rows="2"
                                maxlength="200"
                            ></textarea>
                            <div class="input-counter" id="inputCounter">0/200</div>
                        </div>
                    </div>
                    
                    <div class="input-section glass-card">
                        <label class="input-label">Instagram (будет на слайдах)</label>
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                id="instagramInput" 
                                class="topic-input" 
                                placeholder="@your_instagram"
                                maxlength="50"
                                style="resize: none; height: auto; min-height: 54px;"
                            />
                        </div>
                    </div>
                    
                    <div class="actions">
                        <button class="btn btn-secondary" id="manualBtn">
                            ✏️ Ручной ввод
                        </button>
                        <button class="btn btn-primary" id="generateBtn">
                            <span class="btn-text">🚀 Создать</span>
                            <div class="btn-loader" style="display: none;">
                                <div class="spinner"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий главного экрана
    bindStartEvents() {
        // Кнопка генерации
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerate());
        }

        // Кнопка ручного ввода
        const manualBtn = document.getElementById('manualBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => this.openManualInput());
        }

        // Поле ввода темы
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.addEventListener('input', () => this.updateInputCounter());
        }

        // Collapsible популярные темы
        const collapseBtn = document.getElementById('collapseBtn');
        const ideasContent = document.getElementById('ideasContent');
        if (collapseBtn && ideasContent) {
            // Изначально показываем только первую строку
            this.isIdeasCollapsed = true;
            this.updateIdeasCollapse();
            
            collapseBtn.addEventListener('click', () => {
                this.isIdeasCollapsed = !this.isIdeasCollapsed;
                this.updateIdeasCollapse();
                this.hapticFeedback();
            });
        }

        // Главная кнопка Telegram
        if (this.tg?.MainButton) {
            this.tg.MainButton.onClick(() => this.handleGenerate());
        }

        // Кнопка назад Telegram
        if (this.tg?.BackButton) {
            this.tg.BackButton.onClick(() => this.goBack());
        }
    }

    // Обновление состояния collapsible популярных тем
    updateIdeasCollapse() {
        const ideasContent = document.getElementById('ideasContent');
        const collapseIcon = document.querySelector('.collapse-icon');
        const ideasGrid = document.getElementById('ideasGrid');
        
        if (!ideasContent || !collapseIcon || !ideasGrid) return;
        
        if (this.isIdeasCollapsed) {
            // Показываем только первую строку (первые 4 элемента)
            const ideas = ideasGrid.children;
            for (let i = 0; i < ideas.length; i++) {
                ideas[i].style.display = i < 4 ? 'block' : 'none';
            }
            ideasContent.style.maxHeight = '60px';
            ideasContent.style.overflow = 'hidden';
            collapseIcon.style.transform = 'rotate(0deg)';
        } else {
            // Показываем все элементы
            const ideas = ideasGrid.children;
            for (let i = 0; i < ideas.length; i++) {
                ideas[i].style.display = 'block';
            }
            ideasContent.style.maxHeight = 'none';
            ideasContent.style.overflow = 'visible';
            collapseIcon.style.transform = 'rotate(180deg)';
        }
    }

    // Загрузка быстрых идей
    loadQuickIdeas() {
        console.log('🔍 Загрузка быстрых идей...');
        
        const ideas = [
            "AI и нейросети",
            "Криптовалюты",
            "NFT и Web3",
            "Пассивный доход",
            "Личный бренд",
            "Минимализм",
            "Ментальное здоровье",
            "Продуктивность",
            "Инвестиции",
            "Стартапы",
            "Фриланс",
            "Саморазвитие",
            "Здоровый образ жизни",
            "Путешествия",
            "Кулинария",
            "Мода и стиль"
        ];

        const ideasGrid = document.getElementById('ideasGrid');
        console.log('🎯 ideasGrid element:', ideasGrid);
        
        if (ideasGrid) {
            console.log('✅ ideasGrid найден, очищаем содержимое');
            ideasGrid.innerHTML = '';
            
            ideas.forEach((idea, index) => {
                console.log(`📝 Создаем элемент для идеи ${index + 1}: ${idea}`);
                const ideaElement = document.createElement('div');
                ideaElement.className = 'idea';
                ideaElement.textContent = idea;
                ideaElement.addEventListener('click', () => {
                    console.log(`🔥 Клик по идее: ${idea}`);
                    const topicInput = document.getElementById('topicInput');
                    if (topicInput) {
                        topicInput.value = idea;
                        this.updateInputCounter();
                        this.hapticFeedback();
                        
                        // Показываем кнопку генерации идей
                        this.showIdeaGeneratorButton(idea);
                    }
                });
                ideasGrid.appendChild(ideaElement);
            });
            
            console.log(`✅ Добавлено ${ideas.length} идей в сетку`);
            
            // Применяем collapsible состояние после загрузки
            setTimeout(() => {
                this.updateIdeasCollapse();
            }, 100);
        } else {
            console.error('❌ ideasGrid не найден в DOM!');
        }
    }

    // Показ кнопки генерации идей
    showIdeaGeneratorButton(selectedTopic) {
        // Проверяем, есть ли уже кнопка
        let existingButton = document.getElementById('generateIdeasBtn');
        if (existingButton) {
            existingButton.remove();
        }

        // Создаем кнопку генерации идей
        const actionsContainer = document.querySelector('.actions');
        if (actionsContainer) {
            const generateIdeasBtn = document.createElement('button');
            generateIdeasBtn.id = 'generateIdeasBtn';
            generateIdeasBtn.className = 'btn btn-secondary';
            generateIdeasBtn.innerHTML = '💡 Генерировать идеи';
            generateIdeasBtn.style.marginTop = '12px';
            generateIdeasBtn.style.width = '100%';
            
            generateIdeasBtn.addEventListener('click', () => {
                this.generateDetailedIdeas(selectedTopic);
                this.hapticFeedback();
            });
            
            // Вставляем кнопку перед основными действиями
            actionsContainer.parentNode.insertBefore(generateIdeasBtn, actionsContainer);
            
            // Анимация появления
            generateIdeasBtn.style.opacity = '0';
            generateIdeasBtn.style.transform = 'translateY(10px)';
            setTimeout(() => {
                generateIdeasBtn.style.transition = 'all 0.3s ease';
                generateIdeasBtn.style.opacity = '1';
                generateIdeasBtn.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Генерация детальных идей
    generateDetailedIdeas(topic) {
        const detailedIdeas = this.getDetailedIdeasForTopic(topic);
        
        // Показываем модальное окно с идеями
        this.showIdeasModal(topic, detailedIdeas);
    }

    // Получение детальных идей для темы
    getDetailedIdeasForTopic(topic) {
        const ideasDatabase = {
            "AI и нейросети": [
                "10 AI-инструментов, которые изменят вашу работу в 2026",
                "Как ChatGPT поможет увеличить доходы на 300%",
                "Нейросети для создания контента: полный гайд",
                "AI-автоматизация бизнеса: от идеи до внедрения",
                "Будущее профессий в эпоху искусственного интеллекта"
            ],
            "Криптовалюты": [
                "Топ-5 криптовалют для инвестиций в 2026 году",
                "DeFi для новичков: как заработать на децентрализованных финансах",
                "Стейкинг криптовалют: пассивный доход до 20% годовых",
                "Как не потерять деньги в криптовалютах: 7 правил безопасности",
                "Альткоины с потенциалом роста x100: детальный анализ"
            ],
            "NFT и Web3": [
                "Как создать и продать свой первый NFT за 24 часа",
                "Web3 профессии будущего: где искать работу",
                "Метавселенные: как заработать в виртуальных мирах",
                "NFT-коллекции с потенциалом: гайд по инвестициям",
                "Децентрализованные приложения: создаем dApp с нуля"
            ],
            "Пассивный доход": [
                "7 источников пассивного дохода, которые работают в 2026",
                "Как создать пассивный доход от 100,000₽ в месяц",
                "Инвестиции в недвижимость: пошаговый план для новичков",
                "Дивидендные акции: портфель для стабильного дохода",
                "Создание онлайн-курса: от идеи до первых продаж"
            ],
            "Личный бренд": [
                "Как построить личный бренд в Instagram за 90 дней",
                "Монетизация экспертности: от знаний к доходу",
                "Контент-стратегия для личного бренда: план на год",
                "Нетворкинг в digital: как находить нужных людей",
                "Публичные выступления: от страха к уверенности"
            ],
            "Минимализм": [
                "Минималистичный гардероб: 30 вещей на все случаи жизни",
                "Цифровой детокс: как освободить время и внимание",
                "Минимализм в доме: создаем пространство для жизни",
                "Финансовый минимализм: тратить меньше, жить лучше",
                "Минималистичное планирование: система продуктивности"
            ],
            "Ментальное здоровье": [
                "Борьба с выгоранием: 5 стратегий восстановления",
                "Медитация для занятых: техники на 5-10 минут",
                "Как справиться с тревожностью в неопределенные времена",
                "Здоровые границы: учимся говорить 'нет'",
                "Эмоциональный интеллект: развиваем навыки управления эмоциями"
            ],
            "Продуктивность": [
                "Система GTD: как организовать все дела и проекты",
                "Тайм-менеджмент для предпринимателей: максимум результата",
                "Привычки миллионеров: 10 утренних ритуалов успеха",
                "Фокус в эпоху отвлечений: техники глубокой работы",
                "Планирование целей: от мечты к реальности за год"
            ],
            "Инвестиции": [
                "Инвестиционный портфель для начинающих: пошаговый гайд",
                "ETF vs акции: что выбрать в 2026 году",
                "Инвестиции в золото и драгметаллы: защита от инфляции",
                "Как инвестировать в стартапы и не потерять деньги",
                "Налоговые льготы для инвесторов: экономим легально"
            ],
            "Стартапы": [
                "От идеи до MVP: запускаем стартап за 30 дней",
                "Поиск инвесторов: как привлечь первые инвестиции",
                "Валидация бизнес-идеи: 5 способов проверить спрос",
                "Команда мечты: как найти и мотивировать сооснователей",
                "Масштабирование стартапа: от 0 до 1 миллиона пользователей"
            ],
            "Фриланс": [
                "Фриланс в 2026: самые востребованные профессии",
                "Как поднять ставки на фрилансе в 3 раза",
                "Поиск клиентов: 7 каналов для постоянного потока заказов",
                "Фриланс vs найм: плюсы и минусы удаленной работы",
                "Автоматизация фриланса: инструменты для экономии времени"
            ],
            "Саморазвитие": [
                "Скорочтение: как читать 100 книг в год",
                "Изучение языков: эффективные методики полиглотов",
                "Развитие памяти: техники запоминания любой информации",
                "Критическое мышление: как не попадаться на манипуляции",
                "Креативность: упражнения для развития творческого мышления"
            ],
            "Здоровый образ жизни": [
                "Интервальное голодание: научный подход к похудению",
                "Домашние тренировки: эффективные упражнения без зала",
                "Здоровый сон: как высыпаться за 6-7 часов",
                "Суперфуды 2026: продукты для здоровья и долголетия",
                "Детокс организма: безопасные методы очищения"
            ],
            "Путешествия": [
                "Бюджетные путешествия: как посетить 20 стран за год",
                "Цифровое кочевничество: работа из любой точки мира",
                "Путешествия в одиночку: безопасность и планирование",
                "Экотуризм: ответственные путешествия будущего",
                "Лайфхаки для авиаперелетов: комфорт и экономия"
            ],
            "Кулинария": [
                "Здоровое питание: 30 рецептов на каждый день",
                "Meal prep: готовим на неделю за 2 часа",
                "Веганская кухня: вкусные рецепты без мяса",
                "Десерты без сахара: полезные сладости для всей семьи",
                "Кулинарные тренды 2026: что будем готовить"
            ],
            "Мода и стиль": [
                "Капсульный гардероб: 20 вещей для любого сезона",
                "Sustainable fashion: экологичная мода будущего",
                "Стиль для разных типов фигуры: универсальные советы",
                "Тренды 2026: что будет модно в новом сезоне",
                "Шоппинг с умом: как покупать качественные вещи"
            ]
        };

        return ideasDatabase[topic] || [
            `Топ-5 трендов в сфере "${topic}" на 2026 год`,
            `Как начать в "${topic}": пошаговый гайд для новичков`,
            `Ошибки в "${topic}", которые совершают 90% людей`,
            `Инструменты для "${topic}": must-have список`,
            `Будущее "${topic}": что нас ждет через 5 лет`
        ];
    }

    // Показ модального окна с идеями
    showIdeasModal(topic, ideas) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = 'ideas-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>💡 Идеи для "${topic}"</h3>
                    <button class="modal-close" id="closeModal">×</button>
                </div>
                <div class="modal-body">
                    <p class="modal-subtitle">Выберите идею для создания карусели:</p>
                    <div class="ideas-list">
                        ${ideas.map((idea, index) => `
                            <div class="idea-item" data-idea="${idea}">
                                <span class="idea-number">${index + 1}</span>
                                <span class="idea-text">${idea}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modalCancel">Отмена</button>
                </div>
            </div>
        `;

        // Добавляем в DOM
        document.body.appendChild(modal);

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчики событий
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        // Закрытие модального окна
        modal.querySelector('#closeModal').addEventListener('click', closeModal);
        modal.querySelector('#modalCancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

        // Выбор идеи
        modal.querySelectorAll('.idea-item').forEach(item => {
            item.addEventListener('click', () => {
                const selectedIdea = item.getAttribute('data-idea');
                const topicInput = document.getElementById('topicInput');
                if (topicInput) {
                    topicInput.value = selectedIdea;
                    this.updateInputCounter();
                    this.hapticFeedback();
                }
                closeModal();
            });
        });

        // Закрытие по Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Обновление счетчика символов
    updateInputCounter() {
        const topicInput = document.getElementById('topicInput');
        const inputCounter = document.getElementById('inputCounter');
        
        if (topicInput && inputCounter) {
            const length = topicInput.value.length;
            inputCounter.textContent = `${length}/200`;
            
            if (this.tg?.MainButton) {
                if (length > 2) {
                    this.tg.MainButton.show();
                } else {
                    this.tg.MainButton.hide();
                }
            }
        }
    }

    // Обработка генерации
    async handleGenerate() {
        const topicInput = document.getElementById('topicInput');
        if (!topicInput) return;

        const topic = topicInput.value.trim();
        if (topic.length < 3) {
            this.showToast('Введите тему (минимум 3 символа)', 'error');
            this.shakeElement(topicInput);
            return;
        }

        if (this.isGenerating) {
            this.showToast('Генерация уже выполняется...', 'warning');
            return;
        }

        try {
            this.isGenerating = true;
            this.showLoading(true);
            this.hapticFeedback();

            // Добавляем плавную анимацию скрытия формы
            const startSection = document.getElementById('startSection');
            if (startSection) {
                startSection.style.transition = 'all 0.5s ease';
                startSection.style.transform = 'scale(0.95)';
                startSection.style.opacity = '0.7';
            }

            const slidesData = await this.generateSlides(topic);
            
            // Очищаем проект и создаем новые слайды
            this.project.slides = [];
            this.project.activeSlideId = null;
            this.project.activeTextBlockId = null;
            
            // Создаем слайды в новой структуре
            slidesData.forEach((slideData, index) => {
                const slide = this.createSlide({
                    title: slideData.title || `Слайд ${index + 1}`,
                    text: slideData.text,
                    background: {
                        type: 'color',
                        color: '#833ab4',
                        image: null,
                        x: 50,
                        y: 50,
                        brightness: 100
                    },
                    textBlocks: [],
                    autoKeywords: slideData.autoKeywords || []
                });
                
                // Создаем основной текстовый блок для каждого слайда
                this.createTextBlock(slide.id, {
                    text: slideData.text,
                    x: 50,
                    y: 50,
                    width: 80,
                    font: 'Inter',
                    size: 16,
                    weight: 700,
                    color: '#ffffff'
                });
            });
            
            // Устанавливаем первый слайд как активный
            if (this.project.slides.length > 0) {
                this.setActiveSlideByIndex(0);
            }
            
            // Плавный переход к карусели
            await new Promise(resolve => setTimeout(resolve, 300));
            this.enterPreviewMode();
            
            this.showToast('✅ Карусель создана!', 'success');
        } catch (error) {
            console.error('❌ Ошибка генерации:', error);
            this.showToast('Ошибка создания карусели. Попробуйте еще раз.', 'error');
            
            // Возвращаем форму в исходное состояние
            const startSection = document.getElementById('startSection');
            if (startSection) {
                startSection.style.transform = 'scale(1)';
                startSection.style.opacity = '1';
            }
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
        }
    }

    // Анимация тряски элемента
    shakeElement(element) {
        if (!element) return;
        
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        // Добавляем CSS анимацию если её нет
        if (!document.getElementById('shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Генерация слайдов
    async generateSlides(topic) {
        // Показываем прогресс
        this.updateLoadingProgress('Подготовка...', 10);
        
        // Проверяем кэш
        const cachedSlides = this.getCachedSlides(topic);
        if (cachedSlides) {
            console.log('✅ Используем кэшированные слайды');
            this.updateLoadingProgress('Загрузка из кэша...', 100);
            await new Promise(resolve => setTimeout(resolve, 300));
            return cachedSlides;
        }
        
        this.updateLoadingProgress('Подключение к AI...', 30);
        
        // Пробуем получить данные от AI API
        try {
            const aiResponse = await this.generateSlidesWithAI(topic);
            if (aiResponse && aiResponse.slides && aiResponse.slides.length > 0) {
                this.updateLoadingProgress('Извлечение ключевых слов...', 60);
                
                // Второй вызов Gemini для извлечения ключевых слов
                const slidesWithKeywords = await this.extractKeywordsForSlides(aiResponse.slides);
                
                this.updateLoadingProgress('Обработка ответа...', 80);
                
                // Кэшируем результат с ключевыми словами
                this.cacheSlides(topic, slidesWithKeywords);
                
                this.updateLoadingProgress('Готово!', 100);
                await new Promise(resolve => setTimeout(resolve, 200));
                return slidesWithKeywords;
            }
        } catch (error) {
            console.warn('⚠️ AI API недоступен, используем локальные шаблоны:', error.message);
            this.updateLoadingProgress('Генерация локально...', 60);
        }
        
        // Fallback: используем локальные шаблоны
        this.updateLoadingProgress('Создание слайдов...', 90);
        const localSlides = this.generateLocalSlides(topic);
        
        // Добавляем базовые ключевые слова для локальных слайдов
        const localSlidesWithKeywords = this.addBasicKeywords(localSlides);
        
        // Кэшируем локальные слайды
        this.cacheSlides(topic, localSlidesWithKeywords);
        
        this.updateLoadingProgress('Готово!', 100);
        await new Promise(resolve => setTimeout(resolve, 200));
        return localSlidesWithKeywords;
    }

    // Обновление прогресса загрузки
    updateLoadingProgress(message, percentage) {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            const btnText = generateBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = `${message} ${percentage}%`;
            }
        }
    }

    // Кэширование слайдов
    cacheSlides(topic, slides) {
        try {
            const cacheKey = this.getCacheKey(topic);
            const cacheData = {
                slides: slides,
                timestamp: Date.now(),
                topic: topic
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log('✅ Слайды кэшированы для темы:', topic);
        } catch (error) {
            console.warn('⚠️ Ошибка кэширования:', error);
        }
    }

    // Получение кэшированных слайдов
    getCachedSlides(topic) {
        try {
            const cacheKey = this.getCacheKey(topic);
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const cacheAge = Date.now() - cacheData.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа
            
            if (cacheAge > maxAge) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.slides;
        } catch (error) {
            console.warn('⚠️ Ошибка чтения кэша:', error);
            return null;
        }
    }

    // Генерация ключа кэша
    getCacheKey(topic) {
        return `flashpost_slides_${topic.toLowerCase().replace(/[^a-zа-я0-9]/g, '_')}`;
    }

    // Получение доступного AI провайдера
    getAIProvider() {
        // Проверяем доступные API ключи и возвращаем первый доступный
        const providers = ['gemini', 'openai', 'claude'];
        for (const provider of providers) {
            if (this.getAIApiKey(provider)) {
                return provider;
            }
        }
        return 'mock'; // Fallback на mock если нет API ключей
    }

    // Получение следующего провайдера для retry
    getNextAIProvider(currentProvider) {
        const providers = ['gemini', 'openai', 'claude', 'mock'];
        const currentIndex = providers.indexOf(currentProvider);
        return providers[(currentIndex + 1) % providers.length];
    }

    // Получение API ключа
    getAIApiKey(provider = null) {
        // Здесь можно добавить логику получения API ключей из настроек
        // Пока возвращаем null для использования mock
        return null;
    }

    // Построение промпта для анализа темы (этап 1)
    buildAnalysisPrompt(topic) {
        return `Ты эксперт-аналитик. Проведи глубокий анализ темы: "${topic}"

Структура анализа:
1. ПРОБЛЕМА: Какая основная боль/проблема существует в этой сфере? Почему люди страдают?
2. ПРИЧИНА: Что является корнем этой проблемы? Почему она возникает снова и снова?
3. РЕШЕНИЕ: Какой конкретный подход/метод/система может решить эту проблему?

Каждый пункт должен быть:
- Конкретным (с примерами)
- Эмоциональным (затрагивать боль или желание)
- Практичным (применимым в реальности)

Верни в JSON:
{ "analysis": ["детальная проблема с примерами", "глубинная причина с объяснением", "конкретное решение с шагами"] }`;
    }

    // Построение промпта для создания карусели (этап 2)
    buildCarouselPrompt(topic, analysis) {
        return `На основе анализа создай детальную обучающую Instagram-карусель из 7-9 слайдов:

АНАЛИЗ ТЕМЫ:
${analysis.map((point, i) => `${i + 1}. ${point}`).join('\n')}

ТРЕБОВАНИЯ К КАЖДОМУ СЛАЙДУ:
- 4-6 предложений (обязательно!)
- Конкретные примеры, цифры, статистика
- Пошаговые инструкции где возможно
- Эмоциональные триггеры и истории
- Переносы строк для структурирования

РАСШИРЕННАЯ СТРУКТУРА КАРУСЕЛИ:
1. HOOK - Цепляющий факт + личная история + обещание результата
2. PROBLEM - Детальное описание боли + статистика + последствия
3. INSIGHT - Научное объяснение + разрушение мифов + "ага-момент"
4. SOLUTION - Основной метод/система + принципы работы
5. STEPS - Пошаговый план действий + конкретные инструменты
6. EXAMPLES - Реальные примеры применения + кейсы + результаты
7. MISTAKES - Частые ошибки + как их избежать + предупреждения
8. RESULTS - Ожидаемые результаты + временные рамки + метрики
9. CTA - Мотивация к действию + первый шаг + социальное взаимодействие

СТИЛЬ НАПИСАНИЯ:
- Экспертный, но доступный язык
- Конкретные цифры и факты в каждом слайде
- Личные истории и примеры из практики
- Пошаговые инструкции с деталями
- Эмоциональные крючки и мотивация

Тема: "${topic}"

Верни строго JSON с 7-9 слайдами:
{
  "topic": "${topic}",
  "slides": [
    { "title": "Hook", "text": "4-6 предложений с историей, цифрами и обещанием" },
    { "title": "Problem", "text": "4-6 предложений с болью, статистикой и последствиями" },
    { "title": "Insight", "text": "4-6 предложений с научным объяснением и ага-моментом" },
    { "title": "Solution", "text": "4-6 предложений с основным методом и принципами" },
    { "title": "Steps", "text": "4-6 предложений с пошаговым планом и инструментами" },
    { "title": "Examples", "text": "4-6 предложений с реальными примерами и кейсами" },
    { "title": "Mistakes", "text": "4-6 предложений с частыми ошибками и предупреждениями" },
    { "title": "Results", "text": "4-6 предложений с ожидаемыми результатами и метриками" },
    { "title": "CTA", "text": "3-4 предложения с мотивацией и конкретным призывом" }
  ]
}`;
    }

    // Построение улучшенного промпта (совместимость)
    buildAIPrompt(topic) {
        return this.buildCarouselPrompt(topic, [
            `Суть проблемы в ${topic.toLowerCase()}`,
            `Причины возникновения проблем в ${topic.toLowerCase()}`,
            `Эффективные решения для ${topic.toLowerCase()}`
        ]);
    }

    // Парсинг ответа анализа темы
    parseAnalysisResponse(response) {
        try {
            // Очищаем ответ от мусора
            const cleanedResponse = this.cleanAIResponse(response);
            
            if (!cleanedResponse) {
                throw new Error('Empty analysis response from AI');
            }

            // Парсим JSON
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('❌ Analysis JSON parse error:', parseError);
                console.error('Cleaned response:', cleanedResponse.substring(0, 200) + '...');
                
                // Выбрасываем специальную ошибку для retry
                const retryError = new Error(`Invalid analysis JSON format: ${parseError.message}`);
                retryError.isJSONError = true;
                retryError.originalResponse = cleanedResponse;
                throw retryError;
            }

            // Валидируем структуру анализа
            if (!parsedResponse || typeof parsedResponse !== 'object') {
                throw new Error('Analysis response is not an object');
            }

            if (!parsedResponse.analysis || !Array.isArray(parsedResponse.analysis)) {
                throw new Error('Missing or invalid analysis array');
            }

            if (parsedResponse.analysis.length === 0) {
                throw new Error('Empty analysis array');
            }

            // Валидируем каждый пункт анализа
            for (let i = 0; i < parsedResponse.analysis.length; i++) {
                const point = parsedResponse.analysis[i];
                
                if (!point || typeof point !== 'string' || point.trim().length === 0) {
                    throw new Error(`Analysis point ${i + 1} is invalid`);
                }
                
                // Ограничиваем длину пункта
                if (point.length > 200) {
                    parsedResponse.analysis[i] = point.substring(0, 197) + '...';
                }
            }

            console.log(`✅ Анализ валиден: ${parsedResponse.analysis.length} пунктов`);
            return parsedResponse;

        } catch (error) {
            console.error('❌ Analysis validation error:', error.message);
            throw error;
        }
    }

    // Парсинг и валидация ответа AI
    parseAndValidateAIResponse(response, topic) {
        try {
            // Очищаем ответ от мусора
            const cleanedResponse = this.cleanAIResponse(response);
            
            if (!cleanedResponse) {
                throw new Error('Empty response from AI');
            }

            // Парсим JSON с retry логикой
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('Cleaned response:', cleanedResponse.substring(0, 200) + '...');
                
                // Выбрасываем специальную ошибку для retry
                const retryError = new Error(`Invalid JSON format: ${parseError.message}`);
                retryError.isJSONError = true;
                retryError.originalResponse = cleanedResponse;
                throw retryError;
            }

            // Валидируем структуру
            if (!parsedResponse || typeof parsedResponse !== 'object') {
                throw new Error('Response is not an object');
            }

            if (!parsedResponse.slides || !Array.isArray(parsedResponse.slides)) {
                throw new Error('Missing or invalid slides array');
            }

            if (parsedResponse.slides.length === 0) {
                throw new Error('Empty slides array');
            }

            // Валидируем каждый слайд
            for (let i = 0; i < parsedResponse.slides.length; i++) {
                const slide = parsedResponse.slides[i];
                
                if (!slide || typeof slide !== 'object') {
                    throw new Error(`Slide ${i + 1} is not an object`);
                }
                
                if (!slide.text || typeof slide.text !== 'string' || slide.text.trim().length === 0) {
                    throw new Error(`Slide ${i + 1} has invalid text`);
                }
                
                // Обеспечиваем наличие title
                if (!slide.title) {
                    slide.title = `Slide${i + 1}`;
                }
                
                // Ограничиваем длину текста
                if (slide.text.length > 100) {
                    slide.text = slide.text.substring(0, 97) + '...';
                }
            }

            // Обеспечиваем наличие topic
            if (!parsedResponse.topic) {
                parsedResponse.topic = topic;
            }

            // Обрабатываем авто-ключевые слова если есть
            if (parsedResponse.keywords && Array.isArray(parsedResponse.keywords)) {
                console.log(`✅ Найдены авто-ключевые слова: ${parsedResponse.keywords.length}`);
                // Сохраняем ключевые слова для каждого слайда
                parsedResponse.slides.forEach((slide, index) => {
                    slide.autoKeywords = parsedResponse.keywords;
                });
            }

            console.log(`✅ AI ответ валиден: ${parsedResponse.slides.length} слайдов`);
            return parsedResponse;

        } catch (error) {
            console.error('❌ Validation error:', error.message);
            throw error;
        }
    }

    // Генерация слайдов через AI API с двухэтапным процессом
    async generateSlidesWithAI(topic) {
        // Конфигурация для разных AI провайдеров
        const aiConfig = {
            provider: this.getAIProvider(),
            apiKey: this.getAIApiKey(),
            maxRetries: 3,
            timeout: 15000
        };

        let lastError = null;
        
        // ЭТАП 1: Анализ темы
        console.log('🔍 Этап 1: Анализ темы...');
        this.updateLoadingProgress('Анализируем тему...', 20);
        
        let analysis = null;
        for (let attempt = 1; attempt <= aiConfig.maxRetries; attempt++) {
            try {
                console.log(`🤖 Анализ попытка ${attempt}/${aiConfig.maxRetries}`);
                
                const analysisPrompt = this.buildAnalysisPrompt(topic);
                const analysisResponse = await this.callAIAPI(analysisPrompt, aiConfig);
                const parsedAnalysis = this.parseAnalysisResponse(analysisResponse);
                
                if (parsedAnalysis && parsedAnalysis.analysis && parsedAnalysis.analysis.length > 0) {
                    console.log(`✅ Анализ успешен: ${parsedAnalysis.analysis.length} пунктов`);
                    analysis = parsedAnalysis.analysis;
                    break;
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Анализ попытка ${attempt} неудачна:`, error.message);
                
                if (attempt < aiConfig.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // Если анализ не удался, используем базовый
        if (!analysis) {
            console.log('⚠️ Используем базовый анализ');
            analysis = [
                `Основная проблема в сфере "${topic}"`,
                `Причины возникновения трудностей в "${topic}"`,
                `Проверенные решения для "${topic}"`
            ];
        }

        // ЭТАП 2: Создание карусели на основе анализа
        console.log('🎨 Этап 2: Создание карусели...');
        this.updateLoadingProgress('Создаём карусель...', 60);
        
        for (let attempt = 1; attempt <= aiConfig.maxRetries; attempt++) {
            try {
                console.log(`🤖 Карусель попытка ${attempt}/${aiConfig.maxRetries}`);
                
                const carouselPrompt = this.buildCarouselPrompt(topic, analysis);
                const carouselResponse = await this.callAIAPI(carouselPrompt, aiConfig);
                const parsedCarousel = this.parseAndValidateAIResponse(carouselResponse, topic);
                
                if (parsedCarousel && parsedCarousel.slides && parsedCarousel.slides.length > 0) {
                    console.log(`✅ Карусель успешно создана: ${parsedCarousel.slides.length} слайдов`);
                    console.log('📊 Использованный анализ:', analysis);
                    return parsedCarousel;
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Карусель попытка ${attempt} неудачна:`, error.message);
                
                // Если это ошибка JSON парсинга, пробуем исправляющий промпт
                if (error.isJSONError && attempt < aiConfig.maxRetries) {
                    console.log('🔧 Пробуем исправляющий промпт...');
                    
                    try {
                        const fixPrompt = this.buildFixPrompt(error.originalResponse);
                        const fixedResponse = await this.callAIAPI(fixPrompt, aiConfig);
                        const parsedFixed = this.parseAndValidateAIResponse(fixedResponse, topic);
                        
                        if (parsedFixed && parsedFixed.slides && parsedFixed.slides.length > 0) {
                            console.log(`✅ Исправляющий промпт сработал!`);
                            return parsedFixed;
                        }
                    } catch (fixError) {
                        console.warn('⚠️ Исправляющий промпт тоже не сработал:', fixError.message);
                    }
                }
                
                // Переключаемся на следующий провайдер
                aiConfig.provider = this.getNextAIProvider(aiConfig.provider);
                
                // Увеличиваем таймаут для следующей попытки
                aiConfig.timeout += 5000;
                
                if (attempt < aiConfig.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // Если все попытки неудачны, выбрасываем последнюю ошибку
        console.error('❌ Все попытки AI генерации неудачны');
        throw lastError || new Error('AI generation failed after all retries');
    }

    // Построение исправляющего промпта
    buildFixPrompt(brokenResponse) {
        return `Исправь этот ответ и верни ТОЛЬКО валидный JSON без дополнительного текста:

Сломанный ответ:
${brokenResponse.substring(0, 500)}

Верни СТРОГО в формате:
{
  "topic": "название темы",
  "slides": [
    { "title": "Hook", "text": "2–4 предложения с переносами строк" },
    { "title": "Problem", "text": "2–4 предложения с переносами строк" },
    { "title": "Insight", "text": "2–4 предложения с переносами строк" },
    { "title": "Solution", "text": "2–4 предложения с переносами строк" },
    { "title": "CTA", "text": "1–2 предложения с переносами строк" }
  ]
}

ТОЛЬКО JSON, никакого другого текста!`;
    }

    // Очистка ответа AI от мусора
    cleanAIResponse(response) {
        if (typeof response !== 'string') {
            return response;
        }

        let cleaned = response.trim();
        
        // Убираем markdown блоки кода
        cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        
        // Убираем обычные блоки кода
        cleaned = cleaned.replace(/`{1,3}/g, '');
        
        // Убираем комментарии в стиле //
        cleaned = cleaned.replace(/\/\/.*$/gm, '');
        
        // Убираем комментарии в стиле /* */
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Убираем лишние пробелы и переносы в начале и конце
        cleaned = cleaned.trim();
        
        // Убираем текст до первой фигурной скобки
        const jsonStart = cleaned.indexOf('{');
        if (jsonStart > 0) {
            // Проверяем, есть ли перед { только пробелы или переносы
            const beforeJson = cleaned.substring(0, jsonStart).trim();
            if (beforeJson.length > 0) {
                console.log('🧹 Убираем текст перед JSON:', beforeJson.substring(0, 50) + '...');
                cleaned = cleaned.substring(jsonStart);
            }
        }
        
        // Убираем текст после последней фигурной скобки
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonEnd !== -1 && jsonEnd < cleaned.length - 1) {
            const afterJson = cleaned.substring(jsonEnd + 1).trim();
            if (afterJson.length > 0) {
                console.log('🧹 Убираем текст после JSON:', afterJson.substring(0, 50) + '...');
                cleaned = cleaned.substring(0, jsonEnd + 1);
            }
        }
        
        // Исправляем частые ошибки в JSON
        cleaned = this.fixCommonJSONErrors(cleaned);
        
        return cleaned;
    }

    // Исправление частых ошибок в JSON
    fixCommonJSONErrors(jsonString) {
        let fixed = jsonString;
        
        // Исправляем одинарные кавычки на двойные
        fixed = fixed.replace(/'/g, '"');
        
        // Исправляем неэкранированные кавычки в строках
        fixed = fixed.replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":');
        
        // Убираем лишние запятые перед закрывающими скобками
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        
        // Добавляем недостающие запятые между элементами массива
        fixed = fixed.replace(/}(\s*){/g, '},$1{');
        
        // Исправляем неправильные escape последовательности
        fixed = fixed.replace(/\\(?!["\\/bfnrt])/g, '\\\\');
        
        return fixed;
    }

    // Вызов AI API (заглушка для реального API)
    async callAIAPI(prompt, config) {
        // Здесь будет реальный вызов к AI API
        // Пока возвращаем mock-ответ для демонстрации
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки API
        
        // Определяем тип запроса
        const isAnalysisRequest = prompt.includes('Раскрой тему:') && prompt.includes('"analysis"');
        const isCarouselRequest = prompt.includes('Используй эти идеи:') && prompt.includes('"slides"');
        
        // MOCK для анализа темы
        if (isAnalysisRequest) {
            const topic = prompt.match(/Раскрой тему: "([^"]+)"/)?.[1] || 'неизвестная тема';
            const topicLower = topic.toLowerCase();
            
            // Иногда возвращаем сломанный JSON для демонстрации retry логики
            if (Math.random() < 0.1) {
                console.log('🧪 Имитируем сломанный JSON анализа для тестирования retry');
                return `Вот анализ темы: { "analysis": ['пункт 1', "пункт 2"] } Готово!`;
            }
            
            if (topicLower.includes('ai') || topicLower.includes('нейросети')) {
                return `{
                    "analysis": [
                        "ПРОБЛЕМА: 90% людей используют ChatGPT как Google - задают вопрос, получают общий ответ, тратят часы на доработку. Результат получается посредственным, а время потрачено впустую. Конкуренты тем временем автоматизируют процессы и обгоняют.",
                        "ПРИЧИНА: Люди не понимают, что AI - это не поисковик, а виртуальный сотрудник. Ему нужны четкие инструкции, контекст и роль. Без правильного промпта AI работает как стажер без опыта - делает, но плохо.",
                        "РЕШЕНИЕ: Формула эффективного промпта: РОЛЬ + КОНТЕКСТ + ЗАДАЧА + ФОРМАТ. Например: 'Ты опытный маркетолог. Моя ниша - фитнес для женщин 25-35 лет. Напиши 5 заголовков для рекламы. Формат: заголовок + объяснение эффективности.' Результат будет в 10 раз лучше."
                    ]
                }`;
            }
            
            if (topicLower.includes('деньги') || topicLower.includes('доход')) {
                return `{
                    "analysis": [
                        "ПРОБЛЕМА: 95% людей меняют время на деньги всю жизнь. Нет времени - нет денег. Заболел - доходы упали. Отпуск - бюджет трещит. Работаешь до пенсии, а накоплений нет. Это замкнутый круг бедности.",
                        "ПРИЧИНА: В школе учат быть наемными работниками, а не создавать системы. Родители говорят 'иди работай', а не 'создавай активы'. Финансовая грамотность = 0. Люди не знают разницы между активами и пассивами.",
                        "РЕШЕНИЕ: Создавай источники пассивного дохода: дивидендные акции (от 50,000₽), цифровые продукты (курсы, шаблоны), недвижимость в аренду. Принцип: один раз вложил время/деньги - получаешь доход годами. Начни с малого, масштабируй постепенно."
                    ]
                }`;
            }
            
            if (topicLower.includes('продуктивность')) {
                return `{
                    "analysis": [
                        "ПРОБЛЕМА: Планируешь 10 дел, делаешь 2. Постоянно отвлекаешься на уведомления, соцсети, 'срочные' задачи. К вечеру чувствуешь, что день прошел впустую. Важные проекты откладываются месяцами. Выгорание растет.",
                        "ПРИЧИНА: Мозг может концентрироваться максимум 90 минут подряд. После этого продуктивность падает в 3 раза. Многозадачность - миф. Переключение между задачами съедает 25 минут на восстановление фокуса. Планирование без учета биоритмов.",
                        "РЕШЕНИЕ: Техника временных блоков: 90 минут глубокой работы + 20 минут отдыха. Максимум 3 важные задачи в день. Все уведомления выключены. Планирование с вечера. Один блок = одна задача. Измеряй результат, а не время."
                    ]
                }`;
            }
            
            // Универсальный анализ
            return `{
                "analysis": [
                    "ПРОБЛЕМА: 95% людей в сфере '${topic}' действуют хаотично, без системы. Изучают теорию месяцами, но на практике ничего не работает. Результата нет, мотивация пропадает, время потрачено впустую. Конкуренты тем временем применяют проверенные методы и обгоняют.",
                    "ПРИЧИНА: Большинство начинает с теории, а не с практики. Мозг запоминает только то, что сразу применяет. Без обратной связи и системы невозможно понять, что работает. Отсутствие наставника или четкого плана действий приводит к хаосу.",
                    "РЕШЕНИЕ: Правило 80/20 — 20% теории + 80% практики. Изучил основы — сразу применяй. Ошибки научат больше 100 книг. Найди наставника или систему, которая уже работает. Измеряй результат каждую неделю и корректируй подход."
                ]
            }`;
        }
        
        // MOCK для создания карусели
        if (isCarouselRequest) {
            // Иногда возвращаем сломанный JSON для демонстрации retry логики
            if (Math.random() < 0.1 && !prompt.includes('Исправь этот ответ')) {
                console.log('🧪 Имитируем сломанный JSON карусели для тестирования retry');
                return `Вот карусель:
                {
                    "topic": "Тестовая тема",
                    "slides": [
                        {"title": "Hook", "text": "🔥 Тестовый хук"},
                        {"title": "Problem", "text": "❌ Тестовая проблема",}, // лишняя запятая
                        {"title": "Solution", "text": '✅ Тестовое решение'} // одинарные кавычки
                    ]
                }
                Надеюсь, это поможет!`;
            }
            
            const topic = prompt.match(/"topic": "([^"]+)"/)?.[1] || 'выбранная тема';
            const topicLower = topic.toLowerCase();
            
            if (topicLower.includes('ai') || topicLower.includes('нейросети')) {
                return `{
                    "topic": "AI и нейросети",
                    "slides": [
                        {"title": "Hook", "text": "🔥 Мой коллега Алексей зарабатывает $12,000 в месяц, работая с ChatGPT всего 4 часа в день.\n\nГод назад он был обычным копирайтером за 50,000₽ в месяц.\n\nСейчас он автоматизировал 80% процессов и обслуживает 15 клиентов одновременно.\n\nА 95% людей до сих пор используют ChatGPT как продвинутый Google.\n\nВся разница в одной системе промптов, которую я сейчас покажу."},
                        {"title": "Problem", "text": "Ты тратишь 3-4 часа на создание одного поста для клиента.\n\nЗадаешь ChatGPT вопрос — получаешь общий, безликий ответ.\n\nПереписываешь, дорабатываешь, ищешь идеи в интернете.\n\nА конкуренты уже создают 10 постов за то же время и берут в 3 раза дороже.\n\nТвоя производительность не растет, клиенты недовольны качеством, доходы стоят на месте."},
                        {"title": "Insight", "text": "ChatGPT — это не поисковик, а виртуальный сотрудник с IQ 150.\n\nНо как любому сотруднику, ему нужно техническое задание.\n\nИсследования MIT показали: качество ответа AI зависит на 80% от качества промпта.\n\nБез контекста, роли и четких инструкций он работает как стажер без опыта.\n\nПравильный промпт превращает его в эксперта с 20-летним стажем."},
                        {"title": "Solution", "text": "Система RCTF: Role (роль) + Context (контекст) + Task (задача) + Format (формат).\n\nRole: 'Ты топ-маркетолог с 15-летним опытом в digital-сфере'.\n\nContext: 'Работаешь с брендом спортивного питания для мужчин 25-40 лет'.\n\nTask: 'Создай 5 идей для постов о мотивации к тренировкам'.\n\nFormat: 'Каждая идея: заголовок + описание + хештеги + призыв к действию'."},
                        {"title": "Steps", "text": "Шаг 1: Определи роль эксперта (маркетолог, психолог, тренер, врач).\n\nШаг 2: Опиши контекст: целевая аудитория, ниша, цели бизнеса.\n\nШаг 3: Поставь конкретную задачу с деталями и ограничениями.\n\nШаг 4: Укажи точный формат ответа: структура, объем, стиль.\n\nШаг 5: Добавь примеры желаемого результата для лучшего понимания."},
                        {"title": "Examples", "text": "Плохой промпт: 'Напиши пост про фитнес' — получишь общие фразы.\n\nХороший промпт: 'Ты фитнес-тренер с 10-летним стажем. Целевая аудитория — женщины 30-45 лет, которые хотят похудеть после родов. Напиши мотивационный пост про домашние тренировки. Формат: личная история + 3 совета + призыв начать сегодня'.\n\nРезультат: персонализированный контент с эмоциями и конкретными советами.\n\nВремя создания: 2 минуты вместо 2 часов."},
                        {"title": "Mistakes", "text": "Ошибка №1: Слишком общие запросы без контекста — получаешь шаблонные ответы.\n\nОшибка №2: Не указываешь целевую аудиторию — контент не попадает в цель.\n\nОшибка №3: Забываешь про формат — получаешь неструктурированную простыню текста.\n\nОшибка №4: Не даешь примеры — AI не понимает твои ожидания.\n\nОшибка №5: Пытаешься получить идеальный результат с первого раза — нужно итерировать и уточнять."},
                        {"title": "Results", "text": "Через неделю применения системы: скорость создания контента увеличится в 5-7 раз.\n\nЧерез месяц: сможешь обслуживать в 3 раза больше клиентов или поднять цены на 200%.\n\nЧерез 3 месяца: полная автоматизация рутинных задач, фокус на стратегии.\n\nРеальные цифры учеников: средний рост дохода на 150-300% за первые 2 месяца.\n\nВремя на создание одного поста: с 3 часов до 15 минут."},
                        {"title": "CTA", "text": "Сохрани эту систему и протестируй на своей задаче прямо сейчас.\n\nНапиши в комментариях, какой результат получил — сравним эффективность.\n\nПоделись постом в сторис, чтобы друзья тоже узнали секрет продуктивности.\n\nИ подписывайся на больше фишек по работе с AI! 🚀"}
                    ]
                }`;
            }
            
            if (topicLower.includes('деньги') || topicLower.includes('доход')) {
                return `{
                    "topic": "Пассивный доход",
                    "slides": [
                        {"title": "Hook", "text": "💰 Моя знакомая Анна получает $6,500 каждый месяц, не работая ни дня.\n\n3 года назад она была менеджером за 80,000₽ в месяц.\n\nСейчас у неё 4 источника пассивного дохода, которые работают автоматически.\n\nПри этом она не блогер, не коуч и не продает курсы.\n\nПросто знает систему создания активов, которую скрывают богатые."},
                        {"title": "Problem", "text": "Ты меняешь время на деньги всю свою жизнь — классическая крысиная гонка.\n\nНет времени — нет денег. Заболел — доходы упали до нуля.\n\nОтпуск превращается в финансовый стресс, кредиты давят.\n\nРаботаешь до пенсии, а накоплений все равно нет — инфляция съедает все.\n\nЭто замкнутый круг бедности, из которого 95% людей не выбираются никогда."},
                        {"title": "Insight", "text": "Богатые люди не работают за деньги — деньги работают на них 24/7.\n\nОни создают системы и активы, которые приносят доход без их участия.\n\nВ школе этому не учат, родители не знают — вся система готовит наемных работников.\n\nИсследование Forbes: 88% миллионеров имеют минимум 3 источника пассивного дохода.\n\nСекрет богатства — в создании активов, а не в поиске более высокой зарплаты."},
                        {"title": "Solution", "text": "Система 4 столпов пассивного дохода: Инвестиции + Цифровые продукты + Недвижимость + Бизнес-системы.\n\nСтолп 1: Дивидендные акции и ETF — стабильный доход 8-15% годовых.\n\nСтолп 2: Цифровые продукты — курсы, шаблоны, приложения продаются автоматически.\n\nСтолп 3: Недвижимость — квартиры в аренду, коммерческая недвижимость.\n\nСтолп 4: Автоматизированный бизнес — франшизы, дропшиппинг, партнерские программы."},
                        {"title": "Steps", "text": "Шаг 1: Начни с дивидендных акций — минимальный вход от 50,000₽.\n\nШаг 2: Создай цифровой продукт в своей экспертной области за 2-3 месяца.\n\nШаг 3: Накопи на первоначальный взнос для инвестиционной недвижимости.\n\nШаг 4: Автоматизируй существующий бизнес или создай пассивную бизнес-модель.\n\nШаг 5: Реинвестируй прибыль в расширение каждого источника дохода."},
                        {"title": "Examples", "text": "Пример 1: Портфель дивидендных акций на 1,000,000₽ дает 10,000₽ в месяц.\n\nПример 2: Онлайн-курс за 5,000₽ продается 50 раз в месяц = 250,000₽ дохода.\n\nПример 3: Квартира за 3,000,000₽ в аренду за 35,000₽/месяц = 420,000₽ в год.\n\nПример 4: Партнерская программа IT-продукта дает 15% с каждой продажи пожизненно.\n\nИтого: 4 источника могут давать 100,000₽+ в месяц пассивного дохода."},
                        {"title": "Mistakes", "text": "Ошибка №1: Ждать 'идеального момента' — время не ждет, инфляция растет.\n\nОшибка №2: Вкладывать все в один источник — диверсификация критически важна.\n\nОшибка №3: Искать 'быстрые деньги' — пассивный доход строится годами.\n\nОшибка №4: Не изучать основы инвестирования — потеряешь деньги на ошибках.\n\nОшибка №5: Тратить весь доход — нужно реинвестировать минимум 50% прибыли."},
                        {"title": "Results", "text": "Через 6 месяцев: первые 10,000-20,000₽ пассивного дохода в месяц.\n\nЧерез год: 50,000-80,000₽ в месяц от всех источников при правильном подходе.\n\nЧерез 3 года: полная финансовая независимость, доход превышает расходы.\n\nЧерез 5 лет: возможность не работать вообще или заниматься только любимым делом.\n\nРеальная статистика: 73% людей, начавших системно, достигают финансовой свободы за 5-7 лет."},
                        {"title": "CTA", "text": "Выбери один источник и начни уже сегодня — завтра будет поздно.\n\nНапиши в комментариях, с какого столпа планируешь начать.\n\nСохрани пост и поделись с теми, кто устал от крысиной гонки.\n\nПодписывайся на больше стратегий финансовой свободы! 💎"}
                    ]
                }`;
            }
            
            if (topicLower.includes('продуктивность')) {
                return `{
                    "topic": "Продуктивность",
                    "slides": [
                        {"title": "Hook", "text": "⚡ Мой рабочий день длится всего 4 часа\n\nНо я успеваю больше, чем коллеги за 10 часов.\n\nПока они жалуются на нехватку времени, я уже дома.\n\nСекрет в одной научно доказанной системе.\n\nКоторую используют топ-менеджеры Google и Apple."},
                        {"title": "Problem", "text": "Ты планируешь 10 дел с утра, а к вечеру сделал только 2.\n\nПостоянно отвлекаешься на уведомления, соцсети, 'срочные' задачи.\n\nВажные проекты откладываются неделями и месяцами.\n\nК концу дня чувствуешь усталость, но результата нет.\n\nВыгорание растет, а цели остаются недостижимыми."},
                        {"title": "Insight", "text": "Твой мозг может концентрироваться максимум 90 минут подряд.\n\nПосле этого продуктивность падает в 3 раза.\n\nМногозадачность — это миф, который убивает эффективность.\n\nКаждое переключение между задачами съедает 25 минут на восстановление фокуса.\n\nПроблема не в количестве времени, а в его качестве."},
                        {"title": "Solution", "text": "Техника временных блоков: 90 минут глубокой работы + 20 минут отдыха.\n\nПланируй максимум 3 важные задачи в день — не больше.\n\nВсе уведомления выключены на время блока.\n\nОдин блок = одна задача, никаких переключений.\n\nПланируй день с вечера, чтобы утром сразу начать работать."},
                        {"title": "CTA", "text": "Попробуй завтра один блок на самой важной задаче.\n\nУвидишь разницу уже в первый день.\n\nСохрани пост и начинай прямо сейчас! ⏰"}
                    ]
                }`;
            }
            
            // Универсальная карусель
            return `{
                "topic": "${topic}",
                "slides": [
                    {"title": "Hook", "text": "🔥 95% людей делают одну критическую ошибку в ${topic.toLowerCase()}\n\nИз-за неё они тратят годы времени, но остаются на том же уровне.\n\nА те 5%, кто знает секрет, достигают результата в 10 раз быстрее.\n\nИсследования показывают: разница только в подходе к обучению.\n\nСейчас покажу, в чем именно заключается эта разница."},
                    {"title": "Problem", "text": "Ты изучаешь теорию месяцами — читаешь книги, смотришь курсы, слушаешь подкасты.\n\nНо когда дело доходит до практики — ничего не работает как в теории.\n\nРезультата нет, мотивация пропадает, время потрачено впустую.\n\nКонкуренты тем временем уже достигли твоих целей и движутся дальше.\n\nТы чувствуешь, что топчешься на месте, несмотря на все усилия."},
                    {"title": "Insight", "text": "Проблема в том, что 95% людей начинают с теории, а не с практики.\n\nНейробиологи доказали: мозг запоминает только то, что сразу применяет на деле.\n\nБез обратной связи от реальных действий невозможно понять, что работает.\n\nТеория без практики создает иллюзию знаний, но не дает навыков.\n\nУспешные люди делают наоборот — сначала действуют, потом изучают теорию."},
                    {"title": "Solution", "text": "Система 80/20 в обучении: тратишь 20% времени на теорию, 80% — на практику.\n\nПравило минимальной теории: изучаешь только основы, необходимые для старта.\n\nПринцип быстрых итераций: делаешь, получаешь обратную связь, корректируешь подход.\n\nМетод наставничества: находишь того, кто уже достиг результата, и копируешь его систему.\n\nФокус на измеримых результатах: каждую неделю оцениваешь прогресс по конкретным метрикам."},
                    {"title": "Steps", "text": "Шаг 1: Определи минимальный набор знаний для старта — не больше 20% от всей теории.\n\nШаг 2: Найди простейший способ применить эти знания на практике уже сегодня.\n\nШаг 3: Действуй 7 дней подряд, фиксируй результаты и ошибки в дневнике.\n\nШаг 4: Анализируй что работает, что нет, корректируй подход на основе данных.\n\nШаг 5: Изучай дополнительную теорию только для решения конкретных проблем из практики."},
                    {"title": "Examples", "text": "Пример 1: Изучение языка — не грамматика 6 месяцев, а разговор с первого дня.\n\nПример 2: Бизнес — не бизнес-план на 100 страниц, а первая продажа за неделю.\n\nПример 3: Спорт — не изучение анатомии, а тренировки с базовой техникой.\n\nПример 4: Инвестиции — не курс на год, а первая покупка акций на 10,000₽.\n\nВо всех случаях практика с первого дня дает результат в 5-10 раз быстрее."},
                    {"title": "Mistakes", "text": "Ошибка №1: Перфекционизм — ждешь идеальных знаний перед началом действий.\n\nОшибка №2: Информационное переедание — потребляешь контент, но не применяешь.\n\nОшибка №3: Отсутствие измерений — не отслеживаешь прогресс и результаты.\n\nОшибка №4: Работа в одиночку — не ищешь наставников и сообщество практиков.\n\nОшибка №5: Боязнь ошибок — избегаешь действий из-за страха неудачи."},
                    {"title": "Results", "text": "Через неделю: первые практические результаты и понимание реальных проблем.\n\nЧерез месяц: базовые навыки сформированы, уверенность в действиях растет.\n\nЧерез 3 месяца: значительный прогресс, результаты видны окружающим.\n\nЧерез год: экспертный уровень в выбранной области, стабильные результаты.\n\nСтатистика: люди, применяющие правило 80/20, достигают целей в 7 раз быстрее."},
                    {"title": "CTA", "text": "Выбери одну теорию из ${topic.toLowerCase()} и примени её сегодня же.\n\nНапиши в комментариях, что конкретно будешь тестировать на практике.\n\nСохрани пост и поделись с теми, кто застрял в теории без действий.\n\nПодписывайся на больше практических советов! 💪"}
                ]
            }`;
        }
        
        // Если это исправляющий промпт, возвращаем чистый JSON
        if (prompt.includes('Исправь этот ответ')) {
            return `{
                "topic": "Исправленная тема",
                "slides": [
                    {"title": "Hook", "text": "🔥 Исправленный хук работает лучше\n\nОн цепляет внимание с первой секунды.\n\nИ обещает конкретную пользу."},
                    {"title": "Problem", "text": "❌ Старая проблема была неточной\n\nОна не затрагивала реальную боль.\n\nТеперь она бьёт прямо в цель."},
                    {"title": "Insight", "text": "💡 Причина была скрыта глубже\n\nМы нашли корень проблемы.\n\nТеперь решение станет очевидным."},
                    {"title": "Solution", "text": "✅ Исправленное решение более конкретное\n\nОно даёт чёткие шаги к результату.\n\nБез воды и общих фраз."},
                    {"title": "CTA", "text": "🎯 Исправленный призыв мотивирует действовать\n\nПрямо сейчас, а не потом!"}
                ]
            }`;
        }
        
        // Fallback ответ
        return `{
            "topic": "Общая тема",
            "slides": [
                {"title": "Hook", "text": "🔥 Секрет успеха, который знают единицы\n\nОстальные продолжают делать ошибки.\n\nА время уходит безвозвратно."},
                {"title": "Problem", "text": "Ты действуешь интуитивно.\n\nНадеешься на удачу и везение.\n\nНо результат не приходит месяцами."},
                {"title": "Insight", "text": "Успех — это система, а не случайность.\n\nУ каждого результата есть алгоритм.\n\nНужно просто его найти и применить."},
                {"title": "Solution", "text": "Изучи опыт успешных людей.\n\nВыдели общие принципы и паттерны.\n\nАдаптируй под свою ситуацию."},
                {"title": "CTA", "text": "Начни с одного принципа сегодня.\n\nРезультат не заставит себя ждать! 🎯"}
            ]
        }`;
    }

    // Локальная генерация слайдов (fallback)
    generateLocalSlides(topic) {
        // Определяем количество слайдов (8-11)
        const slideCount = Math.floor(Math.random() * 4) + 8; // 8-11 слайдов
        
        // Базовые шаблоны для разных типов слайдов
        const slideTemplates = [
            { type: 'hook', emoji: '🔥', prefix: 'Топ секреты' },
            { type: 'problem', emoji: '❌', prefix: 'Главная ошибка в' },
            { type: 'solution', emoji: '✅', prefix: 'Проверенный способ' },
            { type: 'step1', emoji: '1️⃣', prefix: 'Шаг 1:' },
            { type: 'step2', emoji: '2️⃣', prefix: 'Шаг 2:' },
            { type: 'step3', emoji: '3️⃣', prefix: 'Шаг 3:' },
            { type: 'step4', emoji: '4️⃣', prefix: 'Шаг 4:' },
            { type: 'step5', emoji: '5️⃣', prefix: 'Шаг 5:' },
            { type: 'tip', emoji: '💡', prefix: 'Лайфхак:' },
            { type: 'warning', emoji: '⚠️', prefix: 'Внимание!' },
            { type: 'bonus', emoji: '🎁', prefix: 'Бонус:' },
            { type: 'tools', emoji: '🛠️', prefix: 'Инструменты:' },
            { type: 'results', emoji: '📊', prefix: 'Результаты:' },
            { type: 'proof', emoji: '📈', prefix: 'Доказательства:' },
            { type: 'action', emoji: '🎯', prefix: 'План действий:' },
            { type: 'conclusion', emoji: '🏆', prefix: 'Итог:' }
        ];

        // Генерируем детальные слайды на основе темы
        const slides = this.generateDetailedSlideContent(topic, slideCount, slideTemplates);
        
        return slides;
    }

    // Генерация детального контента слайдов
    generateDetailedSlideContent(topic, slideCount, templates) {
        const topicLower = topic.toLowerCase();
        
        // Специализированные шаблоны для разных тем
        const topicTemplates = {
            'ai и нейросети': [
                { type: 'hook', text: '🔥 90% используют ChatGPT неправильно' },
                { type: 'problem', text: '❌ Тратишь часы на простые задачи' },
                { type: 'insight', text: '💡 Дело в неправильных промптах' },
                { type: 'solution', text: '✅ Изучи формулу идеального промпта' },
                { type: 'step1', text: '1️⃣ Опиши роль: "Ты эксперт по..."' },
                { type: 'step2', text: '2️⃣ Дай контекст: "Моя ситуация..."' },
                { type: 'step3', text: '3️⃣ Укажи формат: "Ответь списком"' },
                { type: 'tools', text: '🛠️ ChatGPT, Claude, Gemini' },
                { type: 'results', text: '📊 Экономия 15+ часов в неделю' },
                { type: 'warning', text: '⚠️ Без системы — пустая трата времени' },
                { type: 'action', text: '🎯 Сохрани и начни применять!' }
            ],
            'криптовалюты': [
                { type: 'hook', text: '🔥 Топ-5 криптовалют для инвестиций в 2026' },
                { type: 'problem', text: '❌ 80% новичков теряют деньги в первый месяц' },
                { type: 'solution', text: '✅ Стратегия безопасного инвестирования в крипту' },
                { type: 'step1', text: '1️⃣ Bitcoin (BTC) - цифровое золото' },
                { type: 'step2', text: '2️⃣ Ethereum (ETH) - платформа будущего' },
                { type: 'step3', text: '3️⃣ Solana (SOL) - быстрые транзакции' },
                { type: 'step4', text: '4️⃣ Chainlink (LINK) - мост между мирами' },
                { type: 'step5', text: '5️⃣ Polygon (MATIC) - масштабирование Ethereum' },
                { type: 'tools', text: '🛠️ Лучшие биржи и кошельки для крипты' },
                { type: 'warning', text: '⚠️ Как не потерять деньги: 7 правил безопасности' },
                { type: 'results', text: '📊 Потенциальная доходность каждой монеты' },
                { type: 'action', text: '🎯 Пошаговый план инвестирования на год' }
            ],
            'личный бренд': [
                { type: 'hook', text: '🔥 Как построить личный бренд за 90 дней' },
                { type: 'problem', text: '❌ Почему 95% экспертов остаются незамеченными' },
                { type: 'solution', text: '✅ Формула успешного личного бренда' },
                { type: 'step1', text: '1️⃣ Определите свою уникальную экспертизу' },
                { type: 'step2', text: '2️⃣ Создайте контент-стратегию на 3 месяца' },
                { type: 'step3', text: '3️⃣ Выберите 2-3 основные платформы' },
                { type: 'step4', text: '4️⃣ Запустите еженедельный контент-план' },
                { type: 'tools', text: '🛠️ Инструменты для создания контента' },
                { type: 'tip', text: '💡 Секрет вирусного контента от топ-блогеров' },
                { type: 'results', text: '📊 Ожидаемые результаты через 90 дней' },
                { type: 'warning', text: '⚠️ Ошибки, которые убивают личный бренд' },
                { type: 'action', text: '🎯 Ваш план развития бренда на первый месяц' }
            ],
            'пассивный доход': [
                { type: 'hook', text: '🔥 7 источников пассивного дохода в 2026' },
                { type: 'problem', text: '❌ Миф о "легких деньгах" и реальность' },
                { type: 'solution', text: '✅ Проверенные способы создания пассивного дохода' },
                { type: 'step1', text: '1️⃣ Дивидендные акции - от 50,000₽ в месяц' },
                { type: 'step2', text: '2️⃣ Недвижимость - сдача в аренду' },
                { type: 'step3', text: '3️⃣ Создание онлайн-курсов' },
                { type: 'step4', text: '4️⃣ Партнерские программы и реферальные ссылки' },
                { type: 'step5', text: '5️⃣ Создание мобильных приложений' },
                { type: 'bonus', text: '🎁 Бонус: P2P-кредитование и стейкинг' },
                { type: 'tools', text: '🛠️ Платформы и сервисы для пассивного дохода' },
                { type: 'results', text: '📊 Реальные цифры доходности каждого способа' },
                { type: 'warning', text: '⚠️ Риски и как их минимизировать' },
                { type: 'action', text: '🎯 План создания первого источника за 30 дней' }
            ]
        };

        // Универсальные шаблоны для любых тем
        const universalTemplates = [
            { type: 'hook', text: `🔥 Секреты ${topicLower}, которые изменят вашу жизнь` },
            { type: 'problem', text: `❌ Главная ошибка в ${topicLower}, которую совершают 90%` },
            { type: 'solution', text: `✅ Проверенная стратегия успеха в ${topicLower}` },
            { type: 'step1', text: `1️⃣ Первый шаг к мастерству в ${topicLower}` },
            { type: 'step2', text: `2️⃣ Как избежать типичных ошибок в ${topicLower}` },
            { type: 'step3', text: `3️⃣ Продвинутые техники для ${topicLower}` },
            { type: 'step4', text: `4️⃣ Инструменты профессионалов в ${topicLower}` },
            { type: 'step5', text: `5️⃣ Секретные лайфхаки для ${topicLower}` },
            { type: 'tools', text: `🛠️ Must-have инструменты для ${topicLower}` },
            { type: 'tip', text: `💡 Лайфхак: как ускорить результат в ${topicLower}` },
            { type: 'results', text: `📊 Реальные результаты применения ${topicLower}` },
            { type: 'warning', text: `⚠️ Что может пойти не так в ${topicLower}` },
            { type: 'bonus', text: `🎁 Бонус: скрытые возможности ${topicLower}` },
            { type: 'proof', text: `📈 Доказательства эффективности ${topicLower}` },
            { type: 'action', text: `🎯 Ваш план действий по ${topicLower} на 30 дней` },
            { type: 'conclusion', text: `🏆 Главные выводы о ${topicLower}` }
        ];

        // Выбираем подходящие шаблоны
        let selectedTemplates = topicTemplates[topicLower] || universalTemplates;
        
        // Если нужно больше слайдов, добавляем универсальные
        if (selectedTemplates.length < slideCount) {
            const additionalSlides = universalTemplates.filter(
                template => !selectedTemplates.some(selected => selected.type === template.type)
            );
            selectedTemplates = [...selectedTemplates, ...additionalSlides];
        }

        // Берем нужное количество слайдов
        const finalSlides = selectedTemplates.slice(0, slideCount);

        return finalSlides;
    }

    // ===== ИЗВЛЕЧЕНИЕ КЛЮЧЕВЫХ СЛОВ ===== 

    // Извлечение ключевых слов для всех слайдов
    async extractKeywordsForSlides(slides) {
        console.log('🔍 Извлекаем ключевые слова для слайдов...');
        
        const slidesWithKeywords = [];
        
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            console.log(`🔍 Обрабатываем слайд ${i + 1}/${slides.length}: ${slide.title}`);
            
            try {
                const keywords = await this.extractKeywordsFromText(slide.text);
                slidesWithKeywords.push({
                    ...slide,
                    keywords: keywords || []
                });
                
                // Небольшая задержка между запросами
                if (i < slides.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            } catch (error) {
                console.warn(`⚠️ Не удалось извлечь ключевые слова для слайда ${i + 1}:`, error);
                slidesWithKeywords.push({
                    ...slide,
                    keywords: this.extractBasicKeywords(slide.text)
                });
            }
        }
        
        console.log('✅ Ключевые слова извлечены для всех слайдов');
        return slidesWithKeywords;
    }

    // Извлечение ключевых слов из текста через AI
    async extractKeywordsFromText(text) {
        const prompt = `Extract 5 important keywords from this text as array: "${text}"

Return only a JSON array of strings, for example: ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]

Rules:
- Return exactly 5 keywords
- Keywords should be in the same language as the text
- Focus on the most important and meaningful words
- Avoid common words like "и", "в", "на", "the", "and", "or"
- Return only the JSON array, no additional text`;

        try {
            const response = await this.callAIAPI(prompt, {
                provider: this.getAIProvider(),
                apiKey: this.getAIApiKey(),
                maxRetries: 2,
                timeout: 10000
            });
            
            // Парсим ответ
            const cleaned = this.cleanJSONResponse(response);
            const keywords = JSON.parse(cleaned);
            
            if (Array.isArray(keywords) && keywords.length > 0) {
                console.log('✅ Извлечены ключевые слова:', keywords);
                return keywords.slice(0, 5); // Берем максимум 5 слов
            }
        } catch (error) {
            console.warn('⚠️ Ошибка извлечения ключевых слов через AI:', error);
        }
        
        // Fallback: базовое извлечение
        return this.extractBasicKeywords(text);
    }

    // Базовое извлечение ключевых слов (fallback)
    extractBasicKeywords(text) {
        // Убираем эмодзи и специальные символы
        const cleanText = text.replace(/[^\w\sа-яё]/gi, ' ').toLowerCase();
        
        // Разбиваем на слова
        const words = cleanText.split(/\s+/).filter(word => word.length > 3);
        
        // Исключаем стоп-слова
        const stopWords = [
            'это', 'что', 'как', 'для', 'при', 'или', 'все', 'еще', 'уже', 'так', 'где', 'кто',
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one'
        ];
        
        const filteredWords = words.filter(word => !stopWords.includes(word));
        
        // Подсчитываем частоту
        const frequency = {};
        filteredWords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        // Сортируем по частоте и берем топ-5
        const sortedWords = Object.keys(frequency)
            .sort((a, b) => frequency[b] - frequency[a])
            .slice(0, 5);
        
        console.log('✅ Базовые ключевые слова:', sortedWords);
        return sortedWords;
    }

    // Добавление базовых ключевых слов для локальных слайдов
    addBasicKeywords(slides) {
        return slides.map(slide => ({
            ...slide,
            keywords: this.extractBasicKeywords(slide.text),
            autoKeywords: this.extractBasicKeywords(slide.text) // Добавляем в autoKeywords для авто-подсветки
        }));
    }

    // Инициализация данных слайдов - СТАБИЛИЗИРОВАННАЯ ВЕРСИЯ
    initializeSlideData(slidesData) {
        const colors = ['#833ab4', '#fd1d1d', '#fcb045', '#28a745', '#007bff', '#6f42c1'];
        
        // Очищаем и инициализируем единый источник истины
        this.project.slides = slidesData.map((slideData, index) => {
            const slideId = `slide_${Date.now()}_${index}`;
            
            return {
                id: slideId,
                title: slideData.title,
                text: slideData.text,
                
                // Унифицированная структура фона
                background: {
                    type: 'color',
                    color: colors[index % colors.length],
                    image: null,
                    brightness: 100,
                    x: 50,
                    y: 50
                },
                
                // Ключевые слова
                autoKeywords: slideData.keywords || [],
                
                // Унифицированные текстовые блоки
                textBlocks: [
                    {
                        id: `block_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
                        text: slideData.text,
                        x: 50,
                        y: 50,
                        width: 80,
                        size: 16,
                        font: 'Inter',
                        weight: 700,
                        color: '#ffffff'
                    }
                ]
            };
        });
        
        // Устанавливаем первый слайд как активный
        if (this.project.slides.length > 0) {
            this.project.activeSlideId = this.project.slides[0].id;
        }
        
        console.log('✅ Данные слайдов инициализированы (стабилизированная версия)');
        console.log('📊 Слайдов:', this.project.slides.length);
    }

    // Показ карусели
    // Показ карусели (режим превью - только статичные компоненты)
    showCarousel() {
        const app = document.getElementById('app');
        if (!app) return;

        // Устанавливаем режим превью
        this.setMode("preview");
        
        app.innerHTML = this.renderCarousel();
        this.bindCarouselEvents();
        
        console.log('✅ Карусель показана в режиме превью');
    }

    // Показ интерфейса экспорта (режим экспорта - статичные компоненты для экспорта)
    showExportInterface() {
        const app = document.getElementById('app');
        if (!app) return;

        // Устанавливаем режим экспорта
        this.setMode("export");
        
        app.innerHTML = this.renderExportInterface();
        this.bindExportEvents();
        
        console.log('✅ Интерфейс экспорта показан в режиме экспорта');
    }

    // Рендер интерфейса экспорта
    renderExportInterface() {
        return `
            <div class="section active" id="exportSection">
                <div class="export-section">
                    <div class="export-header">
                        <h2>📥 Экспорт карусели</h2>
                        <p>Выберите формат для скачивания</p>
                    </div>
                    
                    <div class="export-preview">
                        <div class="slides-grid">
                            ${this.project.slides.map((slide, index) => `
                                <div class="export-slide-preview" data-index="${index}">
                                    <div class="slide-mini" style="background: ${slide.background.color || '#833ab4'};">
                                        <div class="slide-text-mini">${slide.textBlocks[0]?.text.substring(0, 30) || slide.title}...</div>
                                        <div class="slide-number-mini">${index + 1}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="export-options">
                        <div class="export-option">
                            <button class="btn btn-primary export-btn" id="exportAllBtn">
                                📦 Скачать все слайды (ZIP)
                            </button>
                            <p class="export-description">Все слайды в высоком качестве</p>
                        </div>
                        
                        <div class="export-option">
                            <button class="btn btn-secondary export-btn" id="exportCurrentBtn">
                                🖼️ Скачать текущий слайд
                            </button>
                            <p class="export-description">Только выбранный слайд</p>
                        </div>
                        
                        <div class="export-option">
                            <button class="btn btn-outline export-btn" id="exportTemplateBtn">
                                🎨 Сохранить как шаблон
                            </button>
                            <p class="export-description">Сохранить стили для повторного использования</p>
                        </div>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn btn-secondary" id="backToPreviewBtn">← Назад к превью</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий экспорта
    bindExportEvents() {
        const exportAllBtn = document.getElementById('exportAllBtn');
        const exportCurrentBtn = document.getElementById('exportCurrentBtn');
        const exportTemplateBtn = document.getElementById('exportTemplateBtn');
        const backToPreviewBtn = document.getElementById('backToPreviewBtn');
        
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.downloadAllSlides());
        }
        
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => this.downloadCurrentSlide());
        }
        
        if (exportTemplateBtn) {
            exportTemplateBtn.addEventListener('click', () => this.saveTemplate());
        }
        
        if (backToPreviewBtn) {
            backToPreviewBtn.addEventListener('click', () => this.enterPreviewMode());
        }
        
        console.log('✅ События экспорта привязаны');
    }

    // Рендер карусели
    renderCarousel() {
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const activeSlideIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;
        const progressPercentage = ((activeSlideIndex + 1) / totalSlides) * 100;
        
        return `
            <div class="section active" id="carouselSection">
                <div class="carousel-section">
                    <div class="carousel-header glass-card">
                        <h2>Ваша карусель готова!</h2>
                        <p>Слайдов: ${totalSlides} • Детальное раскрытие темы</p>
                    </div>
                    
                    <div class="carousel-container glass-card">
                        <div class="carousel-track" id="carouselTrack">
                            ${this.project.slides.map((slide, index) => {
                                const isActive = index === activeSlideIndex;
                                const isFirstSlide = index === 0;
                                const isLastSlide = index === totalSlides - 1;
                                const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;
                                
                                // Формируем стили для слайда
                                let slideStyles = '';
                                if (slide.background.image) {
                                    slideStyles = `
                                        background-image: url(${slide.background.image});
                                        background-size: cover;
                                        background-repeat: no-repeat;
                                        background-position: ${slide.background.x}% ${slide.background.y}%;
                                        filter: brightness(${slide.background.brightness}%);
                                    `;
                                } else {
                                    slideStyles = `background: ${slide.background.color};`;
                                }
                                
                                return `
                                    <div class="slide ${isActive ? 'active' : ''}" data-index="${index}" data-slide-id="${slide.id}" style="${slideStyles}">
                                        ${slide.textBlocks.map(block => {
                                            const autoKeywords = slide.autoKeywords || [];
                                            const parsedText = this.parseTextWithKeywords(
                                                block.text, 
                                                block.keywordColor || '#ff6b6b', 
                                                block.highlightEnabled !== false, 
                                                autoKeywords, 
                                                block.glow
                                            );
                                            
                                            return `
                                                <div class="slide-text-block" data-block-id="${block.id}" style="
                                                    position: absolute;
                                                    left: ${block.x}%;
                                                    top: ${block.y}%;
                                                    width: ${block.width}%;
                                                    font-size: ${block.size}px;
                                                    font-family: ${block.font};
                                                    font-weight: ${block.weight};
                                                    color: ${block.color};
                                                    text-align: center;
                                                    line-height: 1.2;
                                                    word-wrap: break-word;
                                                    transform: translate(-50%, -50%);
                                                    z-index: 10;
                                                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                                                    ${block.isKeyword ? `
                                                        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                                                        -webkit-background-clip: text;
                                                        -webkit-text-fill-color: transparent;
                                                        background-clip: text;
                                                    ` : ''}
                                                ">${parsedText}</div>
                                            `;
                                        }).join('')}
                                        
                                        <div class="slide-number">${index + 1}/${totalSlides}</div>
                                        
                                        ${index < totalSlides - 1 ? `
                                            <div class="slide-nav-hint">
                                                <div class="nav-hint-left">Листай</div>
                                                <div class="nav-hint-right">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="m9 18 6-6-6-6"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${showInstagram ? `
                                            <div class="slide-instagram">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                                    <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                    <circle cx="17.5" cy="6.5" r="1.5"/>
                                                </svg>
                                                ${instagramContact}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="carousel-nav">
                            <button class="nav-btn" id="prevBtn" ${activeSlideIndex === 0 ? 'disabled' : ''}>‹</button>
                            <div class="indicators">
                                ${this.project.slides.map((_, index) => `
                                    <div class="indicator ${index === activeSlideIndex ? 'active' : ''}" data-index="${index}"></div>
                                `).join('')}
                            </div>
                            <button class="nav-btn" id="nextBtn" ${activeSlideIndex === totalSlides - 1 ? 'disabled' : ''}>›</button>
                        </div>
                        
                        ${totalSlides > 5 ? `
                            <div class="carousel-progress">
                                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="actions">
                        <button class="btn btn-secondary" id="backToStartBtn">← Новая карусель</button>
                        <button class="btn btn-success" id="downloadCurrentBtn">💾 Сохранить слайд</button>
                        <button class="btn btn-primary" id="openEditorBtn">✏️ Редактировать</button>
                    </div>
                </div>
            </div>
        `;
    }
                                                    font-family: ${block.font};
                                                    font-weight: ${block.weight};
                                                    color: ${block.color};
                                                    text-align: center;
                                                    line-height: 1.2;
                                                    word-wrap: break-word;
                                                    transform: translate(-50%, -50%);
                                                    z-index: 10;
                                                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                                                    ${block.isKeyword ? `
                                                        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                                                        -webkit-background-clip: text;
                                                        -webkit-text-fill-color: transparent;
                                                        background-clip: text;
                                                    ` : ''}
                                                ">${parsedText}</div>
                                            `}).join('') 
                                            : `<div class="slide-text" style="font-size: ${slideStyle.fontSize || 16}px; font-family: ${slideStyle.fontFamily || 'Inter'}; color: ${slideStyle.textColor || '#ffffff'};">${slide.text}</div>`
                                        }
                                        <div class="slide-number">${index + 1}/${this.project.slides.length}</div>
                                        
                                        <!-- Элегантные индикаторы навигации -->
                                        ${index < this.project.slides.length - 1 ? `
                                            <div class="slide-nav-hint">
                                                <div class="nav-hint-left">Листай</div>
                                                <div class="nav-hint-right">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="m9 18 6-6-6-6"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${showInstagram ? `
                                            <div class="slide-instagram">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                                    <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                    <circle cx="17.5" cy="6.5" r="1.5"/>
                                                </svg>
                                                ${instagramContact}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div class="carousel-nav">
                            <button class="nav-btn" id="prevBtn" ${this.getActiveSlideIndex() === 0 ? 'disabled' : ''}>‹</button>
                            <div class="indicators">
                                ${this.project.slides.map((_, index) => `
                                    <div class="indicator ${index === this.getActiveSlideIndex() ? 'active' : ''}" data-index="${index}"></div>
                                `).join('')}
                            </div>
                            <button class="nav-btn" id="nextBtn" ${this.getActiveSlideIndex() === this.project.slides.length - 1 ? 'disabled' : ''}>›</button>
                        </div>
                        
                        ${this.project.slides.length > 5 ? `
                            <div class="carousel-progress">
                                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="actions">
                        <button class="btn btn-secondary" id="backToStartBtn">← Новая карусель</button>
                        <button class="btn btn-success" id="downloadCurrentBtn">💾 Сохранить слайд</button>
                        <button class="btn btn-primary" id="openEditorBtn">✏️ Редактировать</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий карусели
    bindCarouselEvents() {
        console.log('🔗 Привязка событий карусели...');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backToStartBtn = document.getElementById('backToStartBtn');
        const openEditorBtn = document.getElementById('openEditorBtn');
        const downloadCurrentBtn = document.getElementById('downloadCurrentBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
            console.log('✅ Previous button bound');
        } else {
            console.warn('⚠️ Previous button not found');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
            console.log('✅ Next button bound');
        } else {
            console.warn('⚠️ Next button not found');
        }

        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', () => this.enterStartMode());
            console.log('✅ Back to start button bound');
        } else {
            console.warn('⚠️ Back to start button not found');
        }

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => this.enterEditMode());
            console.log('✅ Open editor button bound');
        } else {
            console.warn('⚠️ Open editor button not found');
        }

        if (downloadCurrentBtn) {
            downloadCurrentBtn.addEventListener('click', () => this.downloadCurrentSlide());
            console.log('✅ Download current slide button bound');
        } else {
            console.warn('⚠️ Download current slide button not found');
        }

        // Индикаторы
        const indicators = document.querySelectorAll('.indicator');
        console.log(`🎯 Found ${indicators.length} indicators`);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Навигационные индикаторы в углах слайдов
        const navHints = document.querySelectorAll('.slide-nav-hint');
        console.log(`🎯 Found ${navHints.length} navigation hints`);
        
        navHints.forEach((navHint, index) => {
            navHint.style.pointerEvents = 'auto'; // Включаем взаимодействие
            navHint.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
                this.hapticFeedback('light');
            });
            
            // Добавляем hover эффект
            navHint.addEventListener('mouseenter', () => {
                navHint.style.transform = 'scale(1.1)';
                navHint.style.transition = 'transform 0.2s ease';
            });
            
            navHint.addEventListener('mouseleave', () => {
                navHint.style.transform = 'scale(1)';
            });
        });

        // Свайп навигация
        this.setupSwipeNavigation();
        
        console.log('✅ Все события карусели привязаны');
    }

    // Навигация по слайдам
    previousSlide() {
        const currentIndex = this.getActiveSlideIndex();
        if (currentIndex > 0) {
            this.goToSlide(currentIndex - 1);
        }
    }

    nextSlide() {
        const currentIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;
        if (currentIndex < totalSlides - 1) {
            this.goToSlide(currentIndex + 1);
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.project.slides.length) {
            this.setActiveSlideByIndex(index);
            this.updateCarouselView();
            this.hapticFeedback();
        }
    }

    // Обновление вида карусели
    updateCarouselView() {
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const progressBar = document.querySelector('.progress-bar');
        
        const activeSlideIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;

        // Используем requestAnimationFrame для плавной анимации
        requestAnimationFrame(() => {
            slides.forEach((slide, index) => {
                const isActive = index === activeSlideIndex;
                
                if (isActive && !slide.classList.contains('active')) {
                    slide.classList.add('active');
                    slide.style.willChange = 'transform, opacity';
                } else if (!isActive && slide.classList.contains('active')) {
                    slide.classList.remove('active');
                    // Убираем will-change после анимации для экономии памяти
                    setTimeout(() => {
                        slide.style.willChange = 'auto';
                    }, 300);
                }
            });

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === activeSlideIndex);
            });

            if (prevBtn) {
                prevBtn.disabled = activeSlideIndex === 0;
                prevBtn.style.opacity = activeSlideIndex === 0 ? '0.3' : '1';
            }
            
            if (nextBtn) {
                nextBtn.disabled = activeSlideIndex === totalSlides - 1;
                nextBtn.style.opacity = activeSlideIndex === totalSlides - 1 ? '0.3' : '1';
            }

            // Обновляем прогресс-бар с плавной анимацией
            if (progressBar) {
                const progressPercentage = ((activeSlideIndex + 1) / totalSlides) * 100;
                progressBar.style.width = progressPercentage + '%';
            }

            // Обновляем навигационные индикаторы в углах
            const navHints = document.querySelectorAll('.slide-nav-hint');
            navHints.forEach((navHint, index) => {
                const slideIndex = parseInt(navHint.closest('.slide').getAttribute('data-index'));
                const isLastSlide = slideIndex === totalSlides - 1;
                
                // Скрываем индикаторы на последнем слайде
                if (isLastSlide && slideIndex === activeSlideIndex) {
                    navHint.style.opacity = '0';
                    navHint.style.pointerEvents = 'none';
                } else if (slideIndex === activeSlideIndex) {
                    navHint.style.opacity = '0.8';
                    navHint.style.pointerEvents = 'auto';
                }
            });
        });

        // Прокручиваем индикаторы к активному с улучшенной производительностью
        const activeIndicator = document.querySelector('.indicator.active');
        if (activeIndicator && indicators.length > 8) {
            activeIndicator.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }

        // Предзагружаем соседние слайды для лучшей производительности
        this.preloadAdjacentSlides();
    }

    // Предзагрузка соседних слайдов
    preloadAdjacentSlides() {
        const currentSlideIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;
        
        // Предзагружаем предыдущий и следующий слайды
        const prevIndex = currentSlide > 0 ? currentSlide - 1 : null;
        const nextIndex = currentSlide < totalSlides - 1 ? currentSlide + 1 : null;
        
        [prevIndex, nextIndex].forEach(index => {
            if (index !== null) {
                const slideElement = document.querySelector(`.slide[data-index="${index}"]`);
                if (slideElement) {
                    slideElement.style.willChange = 'transform, opacity';
                }
            }
        });
    }

    // Настройка свайп навигации
    setupSwipeNavigation() {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) return;

        let startX = 0;
        let startY = 0;

        carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }

    // Открытие редактора
    // Открытие редактора (режим редактирования - полная интерактивность)
    openEditor() {
        const app = document.getElementById('app');
        if (!app) return;

        // Устанавливаем режим редактирования
        this.setMode("edit");
        
        // Проверяем что есть активный слайд
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) {
            console.error('❌ Нет активного слайда для редактирования');
            return;
        }
        
        app.innerHTML = this.renderEditor();
        this.bindEditorEvents();
        
        console.log('✅ Редактор открыт в режиме редактирования');
    }

    // ===== DOM RENDERING SYSTEM =====
    
    // Рендеринг текстового блока через DOM
    renderTextBlock(block, editable = true) {
        const startTime = performance.now();
        
        const el = document.createElement('div');
        el.className = 'slide-text-block';
        el.dataset.blockId = block.id;
        
        // Устанавливаем стили напрямую
        el.style.position = 'absolute';
        el.style.left = block.x + '%';
        el.style.top = block.y + '%';
        el.style.width = block.width + '%';
        el.style.fontSize = block.size + 'px';
        el.style.fontFamily = block.font;
        el.style.fontWeight = block.weight;
        el.style.color = block.color;
        el.style.textAlign = 'center';
        el.style.lineHeight = '1.2';
        el.style.wordWrap = 'break-word';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.zIndex = '10';
        el.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        el.style.userSelect = 'none';
        
        // Применяем glow к всему блоку если включен
        if (block.glow) {
            el.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
        }
        
        // Добавляем активный класс
        if (this.project.activeTextBlockId === block.id) {
            el.classList.add('active');
            el.style.border = '2px solid #833ab4';
            el.style.borderRadius = '4px';
            el.style.padding = '8px';
        } else {
            el.style.border = '2px solid transparent';
            el.style.borderRadius = '4px';
            el.style.padding = '8px';
        }
        
        // Парсим текст с ключевыми словами (упрощенная логика)
        if (block.highlightEnabled) {
            const slide = this.getSlideByBlockId(block.id);
            el.innerHTML = this.parseTextWithKeywords(
                block.text,
                slide ? slide.autoKeywords : []
            );
        } else {
            el.textContent = block.text;
        }
        
        // Добавляем события для редактирования
        if (editable) {
            el.style.cursor = 'pointer';
            
            el.addEventListener('mousedown', (e) => this.startDrag(e, block.id));
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.project.activeTextBlockId = block.id;
                this.updateEditorControls();
                this.updateActiveBlockStyles();
            });
            
            el.addEventListener('mouseenter', () => {
                if (this.project.activeTextBlockId !== block.id) {
                    el.style.border = '2px dashed rgba(131, 58, 180, 0.5)';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (this.project.activeTextBlockId !== block.id) {
                    el.style.border = '2px solid transparent';
                }
            });
        } else {
            el.style.pointerEvents = 'none';
        }
        
        const renderTime = performance.now() - startTime;
        console.log(`🔧 Блок ${block.id} отрендерен за ${renderTime.toFixed(2)}ms`);
        
        return el;
    }
    
    // Рендеринг слайда через DOM с поддержкой режимов
    renderSlide(slide, mode = 'preview') {
        const startTime = performance.now();
        
        const slideEl = document.createElement('div');
        slideEl.className = 'slide-preview';
        slideEl.dataset.slideId = slide.id;
        
        // Добавляем класс режима
        slideEl.classList.add(`mode-${mode}`);
        
        // Устанавливаем фон
        this.setSlideBackground(slideEl, slide.background);
        
        // Добавляем текстовые блоки через DOM
        slide.textBlocks.forEach(block => {
            const blockElement = this.renderTextBlock(block, mode, slide.autoKeywords || []);
            slideEl.appendChild(blockElement);
        });
        
        // Добавляем кнопку добавления блока только в режиме редактирования
        if (mode === 'edit') {
            const addBtn = this.createAddTextBlockButton();
            slideEl.appendChild(addBtn);
        }
        
        const renderTime = performance.now() - startTime;
        console.log(`🔧 Слайд ${slide.id} отрендерен в режиме ${mode} за ${renderTime.toFixed(2)}ms`);
        
        return slideEl;
    }
    
    // Рендеринг текстового блока с поддержкой режимов
    renderTextBlock(block, mode = 'preview', autoKeywords = []) {
        const blockEl = document.createElement('div');
        
        // Базовые классы в зависимости от режима
        if (mode === 'edit') {
            blockEl.className = 'slide-text-block editable';
        } else if (mode === 'preview') {
            blockEl.className = 'slide-text-block-static';
        } else if (mode === 'export') {
            blockEl.className = 'slide-text-block-export';
        }
        
        blockEl.dataset.blockId = block.id;
        
        // Позиционирование и стили
        blockEl.style.position = 'absolute';
        blockEl.style.left = block.x + '%';
        blockEl.style.top = block.y + '%';
        blockEl.style.width = block.width + '%';
        blockEl.style.fontSize = block.size + 'px';
        blockEl.style.fontFamily = block.font;
        blockEl.style.fontWeight = block.weight;
        blockEl.style.color = block.color;
        blockEl.style.textAlign = 'center';
        blockEl.style.lineHeight = '1.2';
        blockEl.style.wordWrap = 'break-word';
        blockEl.style.transform = 'translate(-50%, -50%)';
        blockEl.style.zIndex = '10';
        blockEl.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        
        // Свечение убрано - теперь только на ключевых словах через CSS
        
        // Режимо-специфичные настройки
        if (mode === 'edit') {
            // EDIT режим: включаем drag&drop и интерактивность
            blockEl.style.cursor = 'grab';
            blockEl.style.userSelect = 'none';
            blockEl.style.pointerEvents = 'auto';
            
            // Добавляем обработчики drag&drop
            blockEl.addEventListener('mousedown', (e) => this.startDrag(e, block.id));
            blockEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setActiveTextBlock(block.id);
            });
            
            // Визуальные индикаторы для редактирования
            blockEl.addEventListener('mouseenter', () => {
                if (!this.isDragging) {
                    blockEl.style.outline = '2px dashed rgba(131, 58, 180, 0.5)';
                }
            });
            
            blockEl.addEventListener('mouseleave', () => {
                if (this.project.activeTextBlockId !== block.id) {
                    blockEl.style.outline = 'none';
                }
            });
            
            // Выделение активного блока
            if (this.project.activeTextBlockId === block.id) {
                blockEl.style.outline = '2px solid #833ab4';
                blockEl.style.boxShadow = '0 0 10px rgba(131, 58, 180, 0.3)';
            }
            
        } else {
            // PREVIEW и EXPORT режимы: отключаем интерактивность
            blockEl.style.pointerEvents = 'none';
            blockEl.style.userSelect = 'none';
            blockEl.style.cursor = 'default';
        }
        
        // Всегда обрабатываем ключевые слова (убрана проверка highlightEnabled)
        this.setTextWithKeywords(blockEl, block.text, autoKeywords);
        
        return blockEl;
    }
    
    // Создание кнопки добавления текстового блока
    createAddTextBlockButton() {
        const btn = document.createElement('button');
        btn.className = 'add-text-block-btn';
        btn.id = 'addTextBlockBtn';
        
        // Создаем SVG иконку
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '12');
        line1.setAttribute('y1', '5');
        line1.setAttribute('x2', '12');
        line1.setAttribute('y2', '19');
        
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '5');
        line2.setAttribute('y1', '12');
        line2.setAttribute('x2', '19');
        line2.setAttribute('y2', '12');
        
        svg.appendChild(line1);
        svg.appendChild(line2);
        
        btn.appendChild(svg);
        btn.appendChild(document.createTextNode(' Добавить текст'));
        
        return btn;
    }
    
    // Создание DOM для редактора
    createEditorDOM() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Нет активного слайда';
            return errorDiv;
        }
        
        const startTime = performance.now();
        
        // Создаем основной контейнер
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = 'editorSection';
        
        const editorSection = document.createElement('div');
        editorSection.className = 'editor-section';
        
        // Создаем заголовок редактора
        const header = this.createEditorHeader();
        editorSection.appendChild(header);
        
        // Создаем основной контент
        const content = document.createElement('div');
        content.className = 'editor-content';
        
        // Создаем превью слайда
        const preview = document.createElement('div');
        preview.className = 'editor-preview';
        
        const slideElement = this.renderSlide(activeSlide, 'edit');
        preview.appendChild(slideElement);
        content.appendChild(preview);
        
        // Создаем панель инструментов
        const tools = this.createEditorTools();
        content.appendChild(tools);
        
        editorSection.appendChild(content);
        
        // Создаем действия редактора
        const actions = this.createEditorActions();
        editorSection.appendChild(actions);
        
        section.appendChild(editorSection);
        
        const renderTime = performance.now() - startTime;
        console.log(`🔧 Редактор отрендерен за ${renderTime.toFixed(2)}ms`);
        
        return section;
    }
    
    // Создание DOM для превью
    createPreviewDOM() {
        const section = document.createElement('div');
        section.className = 'section active';
        section.id = 'previewSection';
        
        const carouselSection = document.createElement('div');
        carouselSection.className = 'carousel-section';
        
        // Заголовок карусели
        const header = document.createElement('div');
        header.className = 'carousel-header glass-card';
        
        const title = document.createElement('h2');
        title.textContent = 'Ваша карусель готова!';
        
        const subtitle = document.createElement('p');
        subtitle.textContent = `Слайдов: ${this.project.slides.length} • Детальное раскрытие темы`;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        carouselSection.appendChild(header);
        
        // Контейнер карусели
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container glass-card';
        
        // Трек карусели
        const carouselTrack = document.createElement('div');
        carouselTrack.className = 'carousel-track';
        carouselTrack.id = 'carouselTrack';
        
        // Рендерим слайды для превью
        const activeSlideIndex = this.getActiveSlideIndex();
        this.project.slides.forEach((slide, index) => {
            const slideElement = this.createPreviewSlide(slide, index, activeSlideIndex);
            carouselTrack.appendChild(slideElement);
        });
        
        carouselContainer.appendChild(carouselTrack);
        
        // Навигация карусели
        const nav = this.createCarouselNavigation(activeSlideIndex);
        carouselContainer.appendChild(nav);
        
        // Прогресс бар (если много слайдов)
        if (this.project.slides.length > 5) {
            const progress = this.createProgressBar(activeSlideIndex);
            carouselContainer.appendChild(progress);
        }
        
        carouselSection.appendChild(carouselContainer);
        
        // Действия превью
        const actions = this.createPreviewActions();
        carouselSection.appendChild(actions);
        
        section.appendChild(carouselSection);
        
        return section;
    }
    
    // Создание слайда для превью
    createPreviewSlide(slide, index, activeIndex) {
        const slideDiv = document.createElement('div');
        slideDiv.className = `slide ${index === activeIndex ? 'active' : ''}`;
        slideDiv.dataset.index = index;
        slideDiv.dataset.slideId = slide.id;
        
        // Устанавливаем фон
        if (slide.background.image) {
            slideDiv.style.backgroundImage = `url(${slide.background.image})`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundRepeat = 'no-repeat';
            slideDiv.style.backgroundPosition = `${slide.background.x}% ${slide.background.y}%`;
            slideDiv.style.filter = `brightness(${slide.background.brightness}%)`;
        } else {
            slideDiv.style.background = slide.background.color;
        }
        
        // Добавляем текстовые блоки (статичные для превью)
        slide.textBlocks.forEach(block => {
            const blockElement = this.createStaticTextBlock(block, slide.autoKeywords || []);
            slideDiv.appendChild(blockElement);
        });
        
        // Номер слайда
        const slideNumber = document.createElement('div');
        slideNumber.className = 'slide-number';
        slideNumber.textContent = `${index + 1}/${this.project.slides.length}`;
        slideDiv.appendChild(slideNumber);
        
        // Подсказка навигации (если не последний слайд)
        if (index < this.project.slides.length - 1) {
            const navHint = this.createNavigationHint();
            slideDiv.appendChild(navHint);
        }
        
        return slideDiv;
    }
    
    // Создание статичного текстового блока для превью
    createStaticTextBlock(block, autoKeywords) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'slide-text-block-static';
        
        // Устанавливаем стили
        blockDiv.style.position = 'absolute';
        blockDiv.style.left = block.x + '%';
        blockDiv.style.top = block.y + '%';
        blockDiv.style.width = block.width + '%';
        blockDiv.style.fontSize = block.size + 'px';
        blockDiv.style.fontFamily = block.font;
        blockDiv.style.fontWeight = block.weight;
        blockDiv.style.color = block.color;
        blockDiv.style.textAlign = 'center';
        blockDiv.style.lineHeight = '1.2';
        blockDiv.style.wordWrap = 'break-word';
        blockDiv.style.transform = 'translate(-50%, -50%)';
        blockDiv.style.zIndex = '10';
        blockDiv.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        blockDiv.style.pointerEvents = 'none';
        blockDiv.style.userSelect = 'none';
        
        // Применяем glow к всему блоку если включен
        if (block.glow) {
            blockDiv.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
        }
        
        // Парсим текст с ключевыми словами
        if (block.highlightEnabled) {
            blockDiv.innerHTML = this.parseTextWithKeywords(block.text, autoKeywords);
        } else {
            blockDiv.textContent = block.text;
        }
        
        return blockDiv;
    }
    
    // Создание навигации карусели
    createCarouselNavigation(activeIndex) {
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        
        // Кнопка "Назад"
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.id = 'prevBtn';
        prevBtn.textContent = '‹';
        prevBtn.disabled = activeIndex === 0;
        
        // Индикаторы
        const indicators = document.createElement('div');
        indicators.className = 'indicators';
        
        this.project.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === activeIndex ? 'active' : ''}`;
            indicator.dataset.index = index;
            indicators.appendChild(indicator);
        });
        
        // Кнопка "Вперед"
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.id = 'nextBtn';
        nextBtn.textContent = '›';
        nextBtn.disabled = activeIndex === this.project.slides.length - 1;
        
        nav.appendChild(prevBtn);
        nav.appendChild(indicators);
        nav.appendChild(nextBtn);
        
        return nav;
    }
    
    // Создание прогресс бара
    createProgressBar(activeIndex) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'carousel-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressPercentage = ((activeIndex + 1) / this.project.slides.length) * 100;
        progressBar.style.width = progressPercentage + '%';
        
        progressContainer.appendChild(progressBar);
        
        return progressContainer;
    }
    
    // Создание подсказки навигации
    createNavigationHint() {
        const navHint = document.createElement('div');
        navHint.className = 'slide-nav-hint';
        
        const hintLeft = document.createElement('div');
        hintLeft.className = 'nav-hint-left';
        hintLeft.textContent = 'Листай';
        
        const hintRight = document.createElement('div');
        hintRight.className = 'nav-hint-right';
        
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
        hintRight.appendChild(svg);
        
        navHint.appendChild(hintLeft);
        navHint.appendChild(hintRight);
        
        return navHint;
    }
    
    // Создание действий превью
    createPreviewActions() {
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const backToStartBtn = document.createElement('button');
        backToStartBtn.className = 'btn btn-secondary';
        backToStartBtn.id = 'backToStartBtn';
        backToStartBtn.textContent = '← Новая карусель';
        
        const downloadCurrentBtn = document.createElement('button');
        downloadCurrentBtn.className = 'btn btn-success';
        downloadCurrentBtn.id = 'downloadCurrentBtn';
        downloadCurrentBtn.textContent = '💾 Сохранить слайд';
        
        const openEditorBtn = document.createElement('button');
        openEditorBtn.className = 'btn btn-primary';
        openEditorBtn.id = 'openEditorBtn';
        openEditorBtn.textContent = '✏️ Редактировать';
        
        actions.appendChild(backToStartBtn);
        actions.appendChild(downloadCurrentBtn);
        actions.appendChild(openEditorBtn);
        
        return actions;
    }
    
    // Создание DOM для экспорта (чистые слайды)
    createExportDOM() {
        const section = document.createElement('div');
        section.className = 'section active mode-export';
        section.id = 'exportSection';
        
        const exportContainer = document.createElement('div');
        exportContainer.className = 'export-container';
        exportContainer.id = 'exportContainer';
        
        // Рендерим только чистые слайды без UI элементов
        this.project.slides.forEach((slide, index) => {
            const cleanSlide = this.createCleanSlide(slide, index);
            exportContainer.appendChild(cleanSlide);
        });
        
        section.appendChild(exportContainer);
        
        console.log(`🔧 Создано ${this.project.slides.length} чистых слайдов для экспорта`);
        
        return section;
    }
    
    // Создание чистого слайда для экспорта
    createCleanSlide(slide, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'export-slide';
        slideDiv.dataset.slideId = slide.id;
        slideDiv.dataset.slideIndex = index;
        
        // Устанавливаем размеры для экспорта
        slideDiv.style.width = '1080px';
        slideDiv.style.height = '1080px';
        slideDiv.style.position = 'relative';
        slideDiv.style.overflow = 'hidden';
        
        // Устанавливаем фон
        if (slide.background.image) {
            slideDiv.style.backgroundImage = `url(${slide.background.image})`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundRepeat = 'no-repeat';
            slideDiv.style.backgroundPosition = `${slide.background.x}% ${slide.background.y}%`;
            slideDiv.style.filter = `brightness(${slide.background.brightness}%)`;
        } else {
            slideDiv.style.background = slide.background.color;
        }
        
        // Добавляем только текстовые блоки (без интерактивности)
        slide.textBlocks.forEach(block => {
            const cleanBlock = this.createCleanTextBlock(block, slide.autoKeywords || []);
            slideDiv.appendChild(cleanBlock);
        });
        
        return slideDiv;
    }
    
    // Создание чистого текстового блока для экспорта
    createCleanTextBlock(block, autoKeywords) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'export-text-block';
        
        // Устанавливаем стили (без интерактивных элементов)
        blockDiv.style.position = 'absolute';
        blockDiv.style.left = block.x + '%';
        blockDiv.style.top = block.y + '%';
        blockDiv.style.width = block.width + '%';
        blockDiv.style.fontSize = block.size + 'px';
        blockDiv.style.fontFamily = block.font;
        blockDiv.style.fontWeight = block.weight;
        blockDiv.style.color = block.color;
        blockDiv.style.textAlign = 'center';
        blockDiv.style.lineHeight = '1.2';
        blockDiv.style.wordWrap = 'break-word';
        blockDiv.style.transform = 'translate(-50%, -50%)';
        blockDiv.style.zIndex = '10';
        blockDiv.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
        blockDiv.style.pointerEvents = 'none';
        blockDiv.style.userSelect = 'none';
        
        // Убираем все границы и интерактивные элементы
        blockDiv.style.border = 'none';
        blockDiv.style.outline = 'none';
        blockDiv.style.boxShadow = 'none';
        
        // Применяем glow к всему блоку если включен (но без анимаций для экспорта)
        if (block.glow) {
            blockDiv.style.filter = 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))';
        }
        
        // Парсим текст с ключевыми словами (но без анимаций)
        if (block.highlightEnabled) {
            blockDiv.innerHTML = this.parseTextWithKeywords(block.text, autoKeywords);
        } else {
            blockDiv.textContent = block.text;
        }
        
        return blockDiv;
    }
    
    // Создание заголовка редактора
    createEditorHeader() {
        const activeSlideIndex = this.getActiveSlideIndex();
        const totalSlides = this.project.slides.length;
        
        const header = document.createElement('div');
        header.className = 'editor-header';
        
        const title = document.createElement('div');
        title.className = 'editor-title';
        title.textContent = 'Редактор';
        
        const nav = document.createElement('div');
        nav.className = 'editor-nav';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'editor-nav-btn';
        prevBtn.id = 'editorPrevBtn';
        prevBtn.textContent = '‹';
        prevBtn.disabled = activeSlideIndex === 0;
        
        const counter = document.createElement('div');
        counter.className = 'editor-counter';
        counter.textContent = `${activeSlideIndex + 1}/${totalSlides}`;
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'editor-nav-btn';
        nextBtn.id = 'editorNextBtn';
        nextBtn.textContent = '›';
        nextBtn.disabled = activeSlideIndex === totalSlides - 1;
        
        nav.appendChild(prevBtn);
        nav.appendChild(counter);
        nav.appendChild(nextBtn);
        
        header.appendChild(title);
        header.appendChild(nav);
        
        return header;
    }
    
    // Создание панели инструментов редактора
    createEditorTools() {
        const tools = document.createElement('div');
        tools.className = 'editor-tools';
        tools.id = 'editorTools';
        
        this.updateEditorToolsContent(tools);
        
        return tools;
    }
    
    // Обновление содержимого панели инструментов
    updateEditorToolsContent(toolsContainer) {
        const activeBlock = this.getActiveTextBlock();
        
        // Очищаем контейнер
        toolsContainer.innerHTML = '';
        
        if (activeBlock) {
            // Секция с информацией о блоке
            const infoSection = document.createElement('div');
            infoSection.className = 'tool-section';
            
            const infoLabel = document.createElement('label');
            infoLabel.className = 'tool-label';
            infoLabel.textContent = `Активный блок: ${activeBlock.id.split('_')[1]}`;
            infoSection.appendChild(infoLabel);
            toolsContainer.appendChild(infoSection);
            
            // Секция редактирования текста
            const textSection = document.createElement('div');
            textSection.className = 'tool-section';
            
            const textLabel = document.createElement('label');
            textLabel.className = 'tool-label';
            textLabel.textContent = 'Текст';
            
            const textEditor = document.createElement('textarea');
            textEditor.className = 'text-editor';
            textEditor.id = 'blockTextEditor';
            textEditor.placeholder = 'Введите текст блока...';
            textEditor.value = activeBlock.text;
            
            textSection.appendChild(textLabel);
            textSection.appendChild(textEditor);
            toolsContainer.appendChild(textSection);
            
            // Секция выбора шрифта
            const fontSection = document.createElement('div');
            fontSection.className = 'tool-section';
            
            const fontLabel = document.createElement('label');
            fontLabel.className = 'tool-label';
            fontLabel.textContent = 'Шрифт';
            
            const fontSelector = document.createElement('select');
            fontSelector.className = 'font-selector';
            fontSelector.id = 'blockFontSelector';
            
            const fonts = ['Inter', 'Montserrat', 'Bebas Neue', 'Playfair Display', 'Manrope', 'Rubik', 'Oswald', 'PT Sans', 'Lora'];
            fonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                option.selected = activeBlock.font === font;
                fontSelector.appendChild(option);
            });
            
            fontSection.appendChild(fontLabel);
            fontSection.appendChild(fontSelector);
            toolsContainer.appendChild(fontSection);
            
            // Секция размера шрифта
            const sizeSection = document.createElement('div');
            sizeSection.className = 'tool-section';
            
            const sizeLabel = document.createElement('label');
            sizeLabel.className = 'tool-label';
            
            const sizeValue = document.createElement('span');
            sizeValue.id = 'blockSizeValue';
            sizeValue.textContent = `${activeBlock.size}px`;
            
            sizeLabel.appendChild(document.createTextNode('Размер: '));
            sizeLabel.appendChild(sizeValue);
            
            const sizeSlider = document.createElement('input');
            sizeSlider.type = 'range';
            sizeSlider.className = 'slider';
            sizeSlider.id = 'blockSizeSlider';
            sizeSlider.min = '12';
            sizeSlider.max = '72';
            sizeSlider.value = activeBlock.size;
            
            sizeSection.appendChild(sizeLabel);
            sizeSection.appendChild(sizeSlider);
            toolsContainer.appendChild(sizeSection);
            
            // Секция удаления блока
            const deleteSection = document.createElement('div');
            deleteSection.className = 'tool-section';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.id = 'deleteBlockBtn';
            deleteBtn.textContent = 'Удалить блок';
            
            deleteSection.appendChild(deleteBtn);
            toolsContainer.appendChild(deleteSection);
            
        } else {
            // Нет активного блока
            const noSelectionSection = document.createElement('div');
            noSelectionSection.className = 'tool-section';
            
            const noSelectionText = document.createElement('p');
            noSelectionText.className = 'no-selection';
            noSelectionText.textContent = 'Выберите текстовый блок для редактирования или добавьте новый';
            
            noSelectionSection.appendChild(noSelectionText);
            toolsContainer.appendChild(noSelectionSection);
        }
    }
    
    // Создание действий редактора
    createEditorActions() {
        const actions = document.createElement('div');
        actions.className = 'editor-actions';
        
        const exitBtn = document.createElement('button');
        exitBtn.className = 'btn btn-secondary';
        exitBtn.id = 'exitEditorBtn';
        exitBtn.textContent = '← Назад';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.id = 'saveEditorBtn';
        saveBtn.textContent = '✓ Готово';
        
        actions.appendChild(exitBtn);
        actions.appendChild(saveBtn);
        
        return actions;
    }
    
    // Обновление контролов редактора
    updateEditorControls() {
        const toolsContainer = document.getElementById('editorTools');
        if (toolsContainer) {
            this.updateEditorToolsContent(toolsContainer);
            // Перепривязываем события после обновления
            this.bindEditorToolsEvents();
        }
    }
    
    // Обновление стилей активного блока
    updateActiveBlockStyles() {
        const blocks = document.querySelectorAll('.slide-text-block');
        blocks.forEach(block => {
            const blockId = block.dataset.blockId;
            if (blockId === this.project.activeTextBlockId) {
                block.classList.add('active');
                block.style.border = '2px solid #833ab4';
            } else {
                block.classList.remove('active');
                block.style.border = '2px solid transparent';
            }
        });
    }
    
    // Частичное обновление блока
    updateTextBlockElement(blockId, property, value) {
        const block = this.getTextBlockById(blockId);
        const element = document.querySelector(`[data-block-id="${blockId}"]`);
        
        if (!block || !element) return;
        
        // Обновляем данные
        if (property) {
            block[property] = value;
        }
        
        // Обновляем DOM элемент
        switch (property) {
            case 'text':
                if (block.highlightEnabled) {
                    const slide = this.getSlideByBlockId(blockId);
                    element.innerHTML = this.parseTextWithKeywords(
                        block.text,
                        slide ? slide.autoKeywords : []
                    );
                } else {
                    element.textContent = block.text;
                }
                break;
            case 'size':
                element.style.fontSize = block.size + 'px';
                break;
            case 'font':
                element.style.fontFamily = block.font;
                break;
            case 'color':
                element.style.color = block.color;
                break;
            case 'x':
            case 'y':
                element.style.left = block.x + '%';
                element.style.top = block.y + '%';
                break;
            case 'width':
                element.style.width = block.width + '%';
                break;
            case 'glow':
                if (block.glow) {
                    element.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
                } else {
                    element.style.filter = 'none';
                }
                break;
            case 'highlightEnabled':
                if (block.highlightEnabled) {
                    const slide = this.getSlideByBlockId(blockId);
                    element.innerHTML = this.parseTextWithKeywords(
                        block.text,
                        slide ? slide.autoKeywords : []
                    );
                } else {
                    element.textContent = block.text;
                }
                break;
        }
        
        console.log(`⚡ Частичное обновление блока ${blockId}: ${property} = ${value}`);
    }
    
    // Получение текстового блока по ID
    getTextBlockById(blockId) {
        for (const slide of this.project.slides) {
            const block = slide.textBlocks.find(b => b.id === blockId);
            if (block) return block;
        }
        return null;
    }
    
    // Обновление стилей активного блока (без полного рендера)
    updateActiveBlockStyles() {
        const blocks = document.querySelectorAll('.slide-text-block');
        blocks.forEach(block => {
            const blockId = block.dataset.blockId;
            if (blockId === this.project.activeTextBlockId) {
                block.classList.add('active');
                block.style.border = '2px solid #833ab4';
                block.style.boxShadow = '0 0 8px rgba(131, 58, 180, 0.3)';
            } else {
                block.classList.remove('active');
                block.style.border = '2px solid transparent';
                block.style.boxShadow = 'none';
            }
        });
    }
    
    // ===== УПРОЩЕННАЯ СИСТЕМА ЭКСПОРТА =====
    
    // Экспорт всех слайдов (упрощенный подход)
    async exportSlides() {
        try {
            console.log('📥 Начинаем экспорт слайдов...');
            
            // Переключаемся в режим экспорта
            this.project.mode = 'export';
            this.render();
            await new Promise(r => setTimeout(r, 100)); // Ждем рендеринга
            
            const images = [];
            
            // Экспортируем каждый слайд
            for (let i = 0; i < this.project.slides.length; i++) {
                const slide = this.project.slides[i];
                console.log(`📸 Экспорт слайда ${i + 1}/${this.project.slides.length}`);
                
                // Создаем чистый элемент слайда
                const slideElement = this.renderSlide(slide, 'export');
                slideElement.style.width = '1080px';
                slideElement.style.height = '1080px';
                slideElement.style.position = 'absolute';
                slideElement.style.top = '-9999px'; // Скрываем от пользователя
                slideElement.style.left = '-9999px';
                
                // Добавляем в DOM для рендеринга
                document.body.appendChild(slideElement);
                
                try {
                    // Экспортируем через html2canvas
                    const canvas = await html2canvas(slideElement, {
                        width: 1080,
                        height: 1080,
                        scale: 1,
                        backgroundColor: null,
                        useCORS: true,
                        allowTaint: true,
                        logging: false
                    });
                    
                    const imageData = canvas.toDataURL('image/png');
                    images.push({
                        name: `slide_${i + 1}.png`,
                        data: imageData
                    });
                    
                } catch (error) {
                    console.error(`❌ Ошибка экспорта слайда ${i + 1}:`, error);
                    throw error;
                } finally {
                    // Удаляем элемент из DOM
                    slideElement.remove();
                }
            }
            
            // Возвращаемся в режим редактирования
            this.project.mode = 'edit';
            this.render();
            
            console.log(`✅ Экспорт завершен: ${images.length} слайдов`);
            return images;
            
        } catch (error) {
            console.error('❌ Ошибка экспорта:', error);
            // Возвращаемся в режим редактирования в случае ошибки
            this.project.mode = 'edit';
            this.render();
            throw error;
        }
    }
    
    // Скачивание всех слайдов
    async downloadAllSlides() {
        try {
            this.showToast('📥 Подготовка к экспорту...', 'info');
            
            const images = await this.exportSlides();
            
            if (images.length === 1) {
                // Один слайд - скачиваем напрямую
                this.downloadImage(images[0].data, images[0].name);
            } else {
                // Несколько слайдов - скачиваем по очереди
                await this.downloadAsSequence(images);
            }
            
            this.showToast('✅ Слайды скачаны!', 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка скачивания:', error);
            this.showToast('❌ Ошибка скачивания слайдов', 'error');
        }
    }
    
    // Скачивание текущего слайда
    async downloadCurrentSlide() {
        try {
            this.showToast('📥 Экспорт текущего слайда...', 'info');
            
            const activeSlide = this.getActiveSlide();
            if (!activeSlide) {
                throw new Error('No active slide');
            }
            
            const activeIndex = this.getActiveSlideIndex();
            
            // Создаем чистый элемент слайда
            const slideElement = this.renderSlide(activeSlide, 'export');
            slideElement.style.width = '1080px';
            slideElement.style.height = '1080px';
            slideElement.style.position = 'absolute';
            slideElement.style.top = '-9999px';
            slideElement.style.left = '-9999px';
            
            // Добавляем в DOM
            document.body.appendChild(slideElement);
            
            try {
                // Экспортируем слайд
                const canvas = await html2canvas(slideElement, {
                    width: 1080,
                    height: 1080,
                    scale: 1,
                    backgroundColor: null,
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                });
                
                const imageData = canvas.toDataURL('image/png');
                this.downloadImage(imageData, `slide_${activeIndex + 1}.png`);
                
            } finally {
                // Удаляем элемент
                slideElement.remove();
            }
            
            this.showToast('✅ Слайд скачан!', 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка скачивания слайда:', error);
            this.showToast('❌ Ошибка скачивания слайда', 'error');
        }
    }
    
    // Скачивание изображения
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Скачивание слайдов по очереди
    async downloadAsSequence(images) {
        this.showToast(`📦 Скачивание ${images.length} слайдов...`, 'info');
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            // Небольшая задержка между скачиваниями
            if (i > 0) {
                await new Promise(r => setTimeout(r, 300));
            }
            
            this.downloadImage(image.data, image.name);
            
            // Показываем прогресс
            if (i === images.length - 1) {
                this.showToast('✅ Все слайды скачаны!', 'success');
            }
        }
    }
                            
                            <div class="tool-section">
                                <label class="tool-label">Размер</label>
                                <div class="slider-container">
                                    <input type="range" class="slider" id="fontSizeSlider" min="12" max="24" value="${currentStyles.fontSize}">
                                    <div class="slider-value" id="fontSizeValue">${currentStyles.fontSize}px</div>
                                </div>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Шрифт</label>
                                <div class="font-selector">
                                    <button class="font-btn ${currentStyles.fontFamily === 'Inter' ? 'active' : ''}" data-font="Inter">
                                        <span class="font-preview">Inter</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Montserrat' ? 'active' : ''}" data-font="Montserrat">
                                        <span class="font-preview">Montserrat</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Bebas Neue' ? 'active' : ''}" data-font="Bebas Neue">
                                        <span class="font-preview">Bebas Neue</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Playfair Display' ? 'active' : ''}" data-font="Playfair Display">
                                        <span class="font-preview">Playfair</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Manrope' ? 'active' : ''}" data-font="Manrope">
                                        <span class="font-preview">Manrope</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Rubik' ? 'active' : ''}" data-font="Rubik">
                                        <span class="font-preview">Rubik</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Oswald' ? 'active' : ''}" data-font="Oswald">
                                        <span class="font-preview">Oswald</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'PT Sans' ? 'active' : ''}" data-font="PT Sans">
                                        <span class="font-preview">PT Sans</span>
                                    </button>
                                    <button class="font-btn ${currentStyles.fontFamily === 'Lora' ? 'active' : ''}" data-font="Lora">
                                        <span class="font-preview">Lora</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Фон</label>
                                <div class="background-controls">
                                    <div class="bg-type-selector">
                                        <button class="option-btn ${!currentStyles.backgroundImage ? 'active' : ''}" data-bg-type="color">Цвет</button>
                                        <button class="option-btn ${currentStyles.backgroundImage ? 'active' : ''}" data-bg-type="image">Изображение</button>
                                    </div>
                                    
                                    <div class="bg-color-section ${currentStyles.backgroundImage ? 'hidden' : ''}">
                                        <div class="option-buttons">
                                            <button class="color-btn ${currentStyles.backgroundColor === '#833ab4' ? 'active' : ''}" data-bg="#833ab4" style="background: #833ab4;"></button>
                                            <button class="color-btn ${currentStyles.backgroundColor === '#fd1d1d' ? 'active' : ''}" data-bg="#fd1d1d" style="background: #fd1d1d;"></button>
                                            <button class="color-btn ${currentStyles.backgroundColor === '#fcb045' ? 'active' : ''}" data-bg="#fcb045" style="background: #fcb045;"></button>
                                            <button class="color-btn ${currentStyles.backgroundColor === '#28a745' ? 'active' : ''}" data-bg="#28a745" style="background: #28a745;"></button>
                                            <button class="color-btn ${currentStyles.backgroundColor === '#007bff' ? 'active' : ''}" data-bg="#007bff" style="background: #007bff;"></button>
                                            <button class="color-btn ${currentStyles.backgroundColor === '#6f42c1' ? 'active' : ''}" data-bg="#6f42c1" style="background: #6f42c1;"></button>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-image-section ${!currentStyles.backgroundImage ? 'hidden' : ''}">
                                        <div class="image-upload-area">
                                            <input type="file" id="backgroundImageInput" accept="image/*" style="display: none;">
                                            <button class="upload-btn" id="uploadImageBtn">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                    <polyline points="21,15 16,10 5,21"/>
                                                </svg>
                                                ${currentStyles.backgroundImage ? 'Изменить фон' : 'Загрузить фон'}
                                            </button>
                                            ${currentStyles.backgroundImage ? `
                                                <button class="remove-btn" id="removeImageBtn">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                                    </svg>
                                                </button>
                                            ` : ''}
                                        </div>
                                        
                                        ${currentStyles.backgroundImage ? `
                                            <div class="image-controls">
                                                <div class="control-group">
                                                    <label class="control-label">Яркость</label>
                                                    <div class="slider-container">
                                                        <input type="range" class="slider" id="brightnessSlider" min="0" max="200" value="${currentStyles.brightness || 100}">
                                                        <div class="slider-value" id="brightnessValue">${currentStyles.brightness || 100}%</div>
                                                    </div>
                                                </div>
                                                
                                                <div class="control-group">
                                                    <label class="control-label">Позиция X</label>
                                                    <div class="slider-container">
                                                        <input type="range" class="slider" id="positionXSlider" min="-100" max="100" value="${currentStyles.positionX || 0}">
                                                        <div class="slider-value" id="positionXValue">${currentStyles.positionX || 0}%</div>
                                                    </div>
                                                </div>
                                                
                                                <div class="control-group">
                                                    <label class="control-label">Позиция Y</label>
                                                    <div class="slider-container">
                                                        <input type="range" class="slider" id="positionYSlider" min="-100" max="100" value="${currentStyles.positionY || 0}">
                                                        <div class="slider-value" id="positionYValue">${currentStyles.positionY || 0}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Текстовые блоки</label>
                                <div class="text-blocks-controls">
                                    <div class="blocks-header">
                                        <button class="btn btn-secondary" id="addTextBlockBtn" style="width: 100%; margin-bottom: 12px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            Добавить блок
                                        </button>
                                    </div>
                                    
                                    <div class="text-blocks-list" id="textBlocksList">
                                        <!-- Заполняется JS -->
                                    </div>
                                    
                                    ${this.selectedTextBlockId ? `
                                        <div class="selected-block-controls">
                                            <div class="control-group">
                                                <label class="control-label">Текст</label>
                                                <textarea class="text-editor" id="blockTextEditor" placeholder="Введите текст блока..." rows="2"></textarea>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Размер</label>
                                                <div class="slider-container">
                                                    <input type="range" class="slider" id="blockSizeSlider" min="10" max="32" value="16">
                                                    <div class="slider-value" id="blockSizeValue">16px</div>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Вес шрифта</label>
                                                <div class="slider-container">
                                                    <input type="range" class="slider" id="blockWeightSlider" min="300" max="900" step="100" value="700">
                                                    <div class="slider-value" id="blockWeightValue">700</div>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Ширина</label>
                                                <div class="slider-container">
                                                    <input type="range" class="slider" id="blockWidthSlider" min="20" max="100" value="60">
                                                    <div class="slider-value" id="blockWidthValue">60%</div>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Шрифт</label>
                                                <div class="font-selector">
                                                    <button class="font-btn active" data-block-font="Inter">
                                                        <span class="font-preview" style="font-family: Inter;">Inter</span>
                                                    </button>
                                                    <button class="font-btn" data-block-font="Montserrat">
                                                        <span class="font-preview" style="font-family: Montserrat;">Montserrat</span>
                                                    </button>
                                                    <button class="font-btn" data-block-font="Oswald">
                                                        <span class="font-preview" style="font-family: Oswald;">Oswald</span>
                                                    </button>
                                                    <button class="font-btn" data-block-font="Playfair Display">
                                                        <span class="font-preview" style="font-family: 'Playfair Display';">Playfair</span>
                                                    </button>
                                                    <button class="font-btn" data-block-font="Bebas Neue">
                                                        <span class="font-preview" style="font-family: 'Bebas Neue';">Bebas</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Цвет</label>
                                                <div class="option-buttons">
                                                    <button class="color-btn active" data-block-color="#ffffff" style="background: #ffffff;"></button>
                                                    <button class="color-btn" data-block-color="#000000" style="background: #000000;"></button>
                                                    <button class="color-btn" data-block-color="#ff6b6b" style="background: #ff6b6b;"></button>
                                                    <button class="color-btn" data-block-color="#4ecdc4" style="background: #4ecdc4;"></button>
                                                    <button class="color-btn" data-block-color="#45b7d1" style="background: #45b7d1;"></button>
                                                    <button class="color-btn" data-block-color="#f9ca24" style="background: #f9ca24;"></button>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Цвет ключевых слов</label>
                                                <div class="option-buttons">
                                                    <button class="color-btn active" data-keyword-color="#ff6b6b" style="background: #ff6b6b;"></button>
                                                    <button class="color-btn" data-keyword-color="#4ecdc4" style="background: #4ecdc4;"></button>
                                                    <button class="color-btn" data-keyword-color="#45b7d1" style="background: #45b7d1;"></button>
                                                    <button class="color-btn" data-keyword-color="#f9ca24" style="background: #f9ca24;"></button>
                                                    <button class="color-btn" data-keyword-color="#a55eea" style="background: #a55eea;"></button>
                                                    <button class="color-btn" data-keyword-color="#26de81" style="background: #26de81;"></button>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Подсветка</label>
                                                <div class="checkbox-controls">
                                                    <label class="checkbox-label">
                                                        <input type="checkbox" id="highlightEnabledCheckbox" checked>
                                                        <span class="checkbox-text">Включить подсветку *слов*</span>
                                                    </label>
                                                    <label class="checkbox-label">
                                                        <input type="checkbox" id="autoHighlightCheckbox" checked>
                                                        <span class="checkbox-text">Авто-подсветка от AI</span>
                                                    </label>
                                                </div>
                                                <div class="highlight-info">
                                                    <small class="info-text">Используйте *слово* для ручной подсветки. AI автоматически найдет ключевые слова.</small>
                                                </div>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label class="control-label">Эффекты</label>
                                                <div class="checkbox-controls">
                                                    <label class="checkbox-label">
                                                        <input type="checkbox" id="blockGlowCheckbox">
                                                        <span class="checkbox-text">Свечение</span>
                                                    </label>
                                                    <label class="checkbox-label">
                                                        <input type="checkbox" id="blockKeywordCheckbox">
                                                        <span class="checkbox-text">Градиент всего блока</span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <!-- Кнопка удаления блока -->
                                            <div class="control-group">
                                                <button class="btn btn-danger" id="deleteTextBlockBtn" style="width: 100%; margin-top: 12px;">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <polyline points="3,6 5,6 21,6"/>
                                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                                    </svg>
                                                    Удалить блок
                                                </button>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Глобальные настройки в конце -->
                            <div class="tool-section global-settings">
                                <label class="tool-label">Глобальные настройки</label>
                                <div class="global-controls">
                                    <label class="checkbox-label apply-to-all-label">
                                        <input type="checkbox" id="applyToAllCheckbox" ${this.applyToAll ? 'checked' : ''}>
                                        <span class="checkbox-text">Применить ко всем слайдам</span>
                                    </label>
                                    <div class="apply-to-all-info">
                                        <small class="info-text">Изменения фона и шрифтов будут применены ко всем слайдам</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="editor-actions">
                        <button class="editor-btn secondary" id="exitEditorBtn" title="Назад">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                        </button>
                        <button class="editor-btn secondary" id="templatesBtn" title="Шаблоны">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <rect x="7" y="7" width="3" height="3"/>
                                <rect x="14" y="7" width="3" height="3"/>
                                <rect x="7" y="14" width="10" height="3"/>
                            </svg>
                        </button>
                        <button class="editor-btn success" id="saveTemplateBtn" title="Сохранить шаблон">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17,21 17,13 7,13 7,21"/>
                                <polyline points="7,3 7,8 15,8"/>
                            </svg>
                        </button>
                        <button class="editor-btn export" id="exportCurrentBtn" title="Экспорт текущего слайда">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        <button class="editor-btn success" id="downloadSlidesBtn" title="Экспорт всех слайдов">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                                <path d="M3 9h18"/>
                            </svg>
                        </button>
                        <button class="editor-btn primary" id="saveAndExitBtn" title="Готово">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий редактора (упрощенная)
    bindEditorEvents() {
        console.log('🔗 Привязка событий редактора...');
        
        // Кнопка добавления текстового блока
        const addTextBlockBtn = document.getElementById('addTextBlockBtn');
        if (addTextBlockBtn) {
            addTextBlockBtn.addEventListener('click', () => {
                this.addTextBlock();
                this.hapticFeedback();
            });
            console.log('✅ Add text block button bound');
        }
        
        // Навигация по слайдам в редакторе
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        
        if (editorPrevBtn) {
            editorPrevBtn.addEventListener('click', () => {
                const currentIndex = this.getActiveSlideIndex();
                if (currentIndex > 0) {
                    this.setActiveSlideByIndex(currentIndex - 1);
                    this.render();
                    this.hapticFeedback();
                }
            });
            console.log('✅ Editor prev button bound');
        }
        
        if (editorNextBtn) {
            editorNextBtn.addEventListener('click', () => {
                const currentIndex = this.getActiveSlideIndex();
                if (currentIndex < this.project.slides.length - 1) {
                    this.setActiveSlideByIndex(currentIndex + 1);
                    this.render();
                    this.hapticFeedback();
                }
            });
            console.log('✅ Editor next button bound');
        }
        
        // Кнопки действий редактора
        const exitEditorBtn = document.getElementById('exitEditorBtn');
        const saveEditorBtn = document.getElementById('saveEditorBtn');
        
        if (exitEditorBtn) {
            exitEditorBtn.addEventListener('click', () => {
                this.enterPreviewMode();
                this.hapticFeedback();
            });
            console.log('✅ Exit editor button bound');
        }
        
        if (saveEditorBtn) {
            saveEditorBtn.addEventListener('click', () => {
                this.enterPreviewMode();
                this.showToast('✅ Изменения сохранены', 'success');
                this.hapticFeedback();
            });
            console.log('✅ Save editor button bound');
        }
        
        // Привязываем события инструментов
        this.bindEditorToolsEvents();
        
        // Привязываем drag & drop события
        this.bindDragEvents();
        
        console.log('✅ Все события редактора привязаны');
    }
    
    // Привязка событий инструментов редактора
    bindEditorToolsEvents() {
        // Редактирование текста активного блока
        const blockTextEditor = document.getElementById('blockTextEditor');
        if (blockTextEditor) {
            blockTextEditor.addEventListener('input', (e) => {
                const activeBlock = this.getActiveTextBlock();
                if (activeBlock) {
                    this.updateTextBlockElement(activeBlock.id, 'text', e.target.value);
                }
            });
            console.log('✅ Block text editor bound');
        }
        
        // Выбор шрифта активного блока
        const blockFontSelector = document.getElementById('blockFontSelector');
        if (blockFontSelector) {
            blockFontSelector.addEventListener('change', (e) => {
                const activeBlock = this.getActiveTextBlock();
                if (activeBlock) {
                    this.updateTextBlockElement(activeBlock.id, 'font', e.target.value);
                }
            });
            console.log('✅ Block font selector bound');
        }
        
        // Размер шрифта активного блока
        const blockSizeSlider = document.getElementById('blockSizeSlider');
        if (blockSizeSlider) {
            blockSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                const activeBlock = this.getActiveTextBlock();
                if (activeBlock) {
                    this.updateTextBlockElement(activeBlock.id, 'size', size);
                    
                    const sizeValue = document.getElementById('blockSizeValue');
                    if (sizeValue) {
                        sizeValue.textContent = size + 'px';
                    }
                }
            });
            console.log('✅ Block size slider bound');
        }
        
        // Удаление активного блока
        const deleteBlockBtn = document.getElementById('deleteBlockBtn');
        if (deleteBlockBtn) {
            deleteBlockBtn.addEventListener('click', () => {
                const activeBlock = this.getActiveTextBlock();
                if (activeBlock && confirm('Удалить этот текстовый блок?')) {
                    this.deleteTextBlock(activeBlock.id);
                    this.render(); // Перерендериваем
                    this.hapticFeedback();
                }
            });
            console.log('✅ Delete block button bound');
        }
    }
    
    // Привязка drag & drop событий
    bindDragEvents() {
        // Глобальные обработчики уже привязываются в startDrag/stopDrag
        // Здесь только логирование
        console.log('✅ Drag events system ready (global handlers)');
    }
    
    // ===== СТАБИЛЬНАЯ DRAG & DROP СИСТЕМА =====
    
    // Начало перетаскивания (стабильное)
    startDrag(e, blockId) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`🎯 Начало перетаскивания: ${blockId}`);
        
        // Устанавливаем состояние drag
        this.dragBlockId = blockId;
        this.isDragging = true;
        
        // Устанавливаем блок как активный
        this.project.activeTextBlockId = blockId;
        this.updateActiveBlockStyles();
        this.updateEditorControls();
        
        // Добавляем глобальные обработчики
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.stopDrag);
        
        // Добавляем визуальную обратную связь
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('dragging');
            blockElement.style.zIndex = '1000';
            blockElement.style.transform = 'translate(-50%, -50%) scale(1.05)';
        }
        
        // Отключаем выделение текста во время drag
        document.body.style.userSelect = 'none';
    }
    
    // Движение мыши (стабильное)
    onDragMove(e) {
        if (!this.isDragging || !this.dragBlockId) return;
        
        e.preventDefault();
        
        // Находим слайд и блок
        const slide = document.querySelector('.slide-preview');
        if (!slide) return;
        
        const rect = slide.getBoundingClientRect();
        
        // Пересчитываем координаты в проценты
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Находим блок в данных
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return;
        
        const block = activeSlide.textBlocks.find(b => b.id === this.dragBlockId);
        if (!block) return;
        
        // Ограничиваем границы
        block.x = Math.max(0, Math.min(100, x));
        block.y = Math.max(0, Math.min(100, y));
        
        // Обновляем позицию элемента напрямую (без полного рендера)
        const blockElement = document.querySelector(`[data-block-id="${this.dragBlockId}"]`);
        if (blockElement) {
            blockElement.style.left = block.x + '%';
            blockElement.style.top = block.y + '%';
        }
    }
    
    // Завершение перетаскивания (стабильное)
    stopDrag(e) {
        if (!this.isDragging) return;
        
        console.log(`🎯 Завершение перетаскивания: ${this.dragBlockId}`);
        
        // Убираем глобальные обработчики
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.stopDrag);
        
        // Убираем визуальную обратную связь
        const blockElement = document.querySelector(`[data-block-id="${this.dragBlockId}"]`);
        if (blockElement) {
            blockElement.classList.remove('dragging');
            blockElement.style.zIndex = '10';
            blockElement.style.transform = 'translate(-50%, -50%)';
        }
        
        // Включаем обратно выделение текста
        document.body.style.userSelect = '';
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.dragBlockId = null;
        
        // Обновляем панель инструментов (если нужно)
        this.updateEditorControls();
    }
    
    // Привязка drag событий (упрощенная)
    bindDragEvents() {
        // Глобальные обработчики уже привязываются в startDrag/stopDrag
        // Здесь только логирование
        console.log('✅ Drag events system ready (global handlers)');
    }
        
        if (editorPrevBtn) {
            editorPrevBtn.addEventListener('click', () => {
                const currentIndex = this.getActiveSlideIndex();
                if (currentIndex > 0) {
                    this.setActiveSlideByIndex(currentIndex - 1);
                    this.project.activeTextBlockId = null; // Сбрасываем выбор блока
                    this.render();
                }
            });
        }
        
        if (editorNextBtn) {
            editorNextBtn.addEventListener('click', () => {
                const currentIndex = this.getActiveSlideIndex();
                const totalSlides = this.project.slides.length;
                if (currentIndex < totalSlides - 1) {
                    this.setActiveSlideByIndex(currentIndex + 1);
                    this.project.activeTextBlockId = null; // Сбрасываем выбор блока
                    this.render();
                }
            });
        }
        
        // Кнопки действий
        const exitEditorBtn = document.getElementById('exitEditorBtn');
        const saveEditorBtn = document.getElementById('saveEditorBtn');
        
        if (exitEditorBtn) {
            exitEditorBtn.addEventListener('click', () => {
                this.enterPreviewMode();
            });
        }
        
        if (saveEditorBtn) {
            saveEditorBtn.addEventListener('click', () => {
                this.enterPreviewMode();
                this.showToast('✅ Изменения сохранены!', 'success');
            });
        }
        
        console.log('✅ События редактора привязаны');
    }

    // Обновление превью конкретного блока
    updatePreviewBlock(blockId) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        const block = this.getActiveTextBlock();
        
        if (blockElement && block) {
            blockElement.textContent = block.text;
            blockElement.style.fontSize = block.size + 'px';
            blockElement.style.fontFamily = block.font;
            blockElement.style.fontWeight = block.weight;
            blockElement.style.color = block.color;
        }
    }
        
        // Навигация в редакторе
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        const previewPrev = document.getElementById('previewPrev');
        const previewNext = document.getElementById('previewNext');
        
        console.log('🔍 Поиск кнопок навигации...');
        console.log('editorPrevBtn:', editorPrevBtn);
        console.log('editorNextBtn:', editorNextBtn);
        console.log('previewPrev:', previewPrev);
        console.log('previewNext:', previewNext);
        
        if (editorPrevBtn) {
            editorPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Editor prev clicked');
                this.previousEditorSlide();
            });
            console.log('✅ Editor prev button bound');
        } else {
            console.warn('⚠️ editorPrevBtn not found');
        }
        
        if (editorNextBtn) {
            editorNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Editor next clicked');
                this.nextEditorSlide();
            });
            console.log('✅ Editor next button bound');
        } else {
            console.warn('⚠️ editorNextBtn not found');
        }

        if (previewPrev) {
            previewPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Preview prev clicked');
                this.previousEditorSlide();
            });
            console.log('✅ Preview prev button bound');
        } else {
            console.warn('⚠️ previewPrev not found');
        }
        
        if (previewNext) {
            previewNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Preview next clicked');
                this.nextEditorSlide();
            });
            console.log('✅ Preview next button bound');
        } else {
            console.warn('⚠️ previewNext not found');
        }

        // Кнопки действий
        const exitEditorBtn = document.getElementById('exitEditorBtn');
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        const downloadSlidesBtn = document.getElementById('downloadSlidesBtn');
        const saveAndExitBtn = document.getElementById('saveAndExitBtn');

        console.log('🔍 Поиск кнопок действий...');
        console.log('exitEditorBtn:', exitEditorBtn);
        console.log('saveTemplateBtn:', saveTemplateBtn);
        console.log('downloadSlidesBtn:', downloadSlidesBtn);
        console.log('saveAndExitBtn:', saveAndExitBtn);

        if (exitEditorBtn) {
            exitEditorBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Exit editor clicked');
                this.exitEditor();
            });
            console.log('✅ Exit editor button bound');
        } else {
            console.warn('⚠️ Exit editor button not found');
        }

        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Save template clicked');
                this.saveTemplate();
            });
            console.log('✅ Save template button bound');
        } else {
            console.warn('⚠️ Save template button not found');
        }

        // Кнопка шаблонов
        const templatesBtn = document.getElementById('templatesBtn');
        if (templatesBtn) {
            templatesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Templates button clicked');
                this.showTemplatesList();
            });
            console.log('✅ Templates button bound');
        } else {
            console.warn('⚠️ Templates button not found');
        }

        if (downloadSlidesBtn) {
            downloadSlidesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Download all slides clicked');
                this.exportAllSlides();
            });
            console.log('✅ Download all slides button bound');
        } else {
            console.warn('⚠️ Download all slides button not found');
        }

        // Кнопка экспорта текущего слайда
        const exportCurrentBtn = document.getElementById('exportCurrentBtn');
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Export current slide clicked');
                this.exportCurrentSlide();
            });
            console.log('✅ Export current slide button bound');
        } else {
            console.warn('⚠️ Export current slide button not found');
        }

        if (saveAndExitBtn) {
            saveAndExitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 Save and exit clicked');
                this.saveAndExit();
            });
            console.log('✅ Save and exit button bound');
        } else {
            console.warn('⚠️ Save and exit button not found');
        }

        // Текстовый редактор
        const textEditor = document.getElementById('textEditor');
        if (textEditor) {
            textEditor.addEventListener('input', (e) => {
                console.log('📝 Text editor input:', e.target.value.substring(0, 30) + '...');
                const currentSlide = this.getCurrentSlide();
                if (currentSlide && currentSlide.textBlocks[0]) {
                    currentSlide.textBlocks[0].text = e.target.value;
                }
                this.updatePreview();
            });
            console.log('✅ Text editor bound');
        } else {
            console.warn('⚠️ Text editor not found');
        }

        // Слайдер размера шрифта
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', (e) => {
                const fontSize = parseInt(e.target.value);
                console.log('🔤 Font size changed:', fontSize);
                
                // Обновляем глобальный размер шрифта
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide && currentSlide.textBlocks) {
                    currentSlide.textBlocks.forEach(block => {
                        block.size = fontSize;
                    });
                }
                
                // Обновляем отображение значения
                const fontSizeValue = document.getElementById('fontSizeValue');
                if (fontSizeValue) {
                    fontSizeValue.textContent = fontSize + 'px';
                }
                
                // Обновляем превью
                this.updatePreview();
                
                // Применяем ко всем слайдам если включено
                this.applyFontToAllSlides(this.currentSlideIndex, 'size', fontSize);
            });
            console.log('✅ Font size slider bound');
        } else {
            console.warn('⚠️ Font size slider not found');
        }

        // Кнопки шрифтов
        const fontButtons = document.querySelectorAll('[data-font]');
        console.log(`🎯 Found ${fontButtons.length} font buttons`);
        fontButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const font = btn.getAttribute('data-font');
                console.log('🔤 Font changed:', font);
                
                // Обновляем глобальный шрифт
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide && currentSlide.textBlocks) {
                    currentSlide.textBlocks.forEach(block => {
                        block.font = font;
                    });
                }
                
                // Обновляем активную кнопку
                document.querySelectorAll('[data-font]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Обновляем превью
                this.updatePreview();
                this.hapticFeedback();
                
                // Применяем ко всем слайдам если включено
                this.applyFontToAllSlides(this.currentSlideIndex, 'font', font);
            });
        });

        // Кнопки цвета фона
        const colorButtons = document.querySelectorAll('[data-bg]');
        console.log(`🎯 Found ${colorButtons.length} color buttons`);
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bg = btn.getAttribute('data-bg');
                console.log('🎨 Background color changed:', bg);
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide) {
                    currentSlide.background.color = bg;
                    currentSlide.background.image = null; // Убираем изображение при выборе цвета
                }
                
                document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updatePreview();
                this.hapticFeedback();
                
                // Применяем ко всем слайдам если включено
                this.applyBackgroundToAllSlides(this.currentEditingSlide);
            });
        });

        // Переключатели типа фона
        const bgTypeButtons = document.querySelectorAll('[data-bg-type]');
        console.log(`🎯 Found ${bgTypeButtons.length} bg type buttons`);
        bgTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bgType = btn.getAttribute('data-bg-type');
                console.log('🔄 Background type changed:', bgType);
                
                document.querySelectorAll('[data-bg-type]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const colorSection = document.querySelector('.bg-color-section');
                const imageSection = document.querySelector('.bg-image-section');
                
                if (bgType === 'color') {
                    colorSection?.classList.remove('hidden');
                    imageSection?.classList.add('hidden');
                    const currentSlide = this.project.slides[this.currentSlideIndex];
                    if (currentSlide) {
                        currentSlide.background.image = null;
                    }
                } else {
                    colorSection?.classList.add('hidden');
                    imageSection?.classList.remove('hidden');
                }
                
                this.updatePreview();
                this.hapticFeedback();
            });
        });

        // Загрузка изображения фона
        const uploadImageBtn = document.getElementById('uploadImageBtn');
        const backgroundImageInput = document.getElementById('backgroundImageInput');
        
        if (uploadImageBtn && backgroundImageInput) {
            uploadImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                backgroundImageInput.click();
            });
            
            backgroundImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    console.log('📷 Image selected:', file.name);
                    this.handleBackgroundImageUpload(file);
                }
            });
            console.log('✅ Image upload bound');
        }

        // Удаление изображения фона
        const removeImageBtn = document.getElementById('removeImageBtn');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🗑️ Remove background image');
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide) {
                    currentSlide.background.image = null;
                    currentSlide.background.brightness = 100;
                    currentSlide.background.x = 50;
                    currentSlide.background.y = 50;
                }
                this.updateEditorSlide(); // Перерисовываем редактор
                this.updatePreview();
                this.hapticFeedback();
            });
            console.log('✅ Remove image button bound');
        }

        // Слайдер яркости
        const brightnessSlider = document.getElementById('brightnessSlider');
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', (e) => {
                const brightness = parseInt(e.target.value);
                console.log('☀️ Brightness changed:', brightness);
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide) {
                    currentSlide.background.brightness = brightness;
                }
                const brightnessValue = document.getElementById('brightnessValue');
                if (brightnessValue) {
                    brightnessValue.textContent = brightness + '%';
                }
                this.updatePreview();
                
                // Применяем ко всем слайдам если включено
                this.applyBackgroundToAllSlides(this.currentEditingSlide);
            });
            console.log('✅ Brightness slider bound');
        }

        // Слайдер позиции X
        const positionXSlider = document.getElementById('positionXSlider');
        if (positionXSlider) {
            positionXSlider.addEventListener('input', (e) => {
                const positionX = parseInt(e.target.value);
                console.log('↔️ Position X changed:', positionX);
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide) {
                    currentSlide.background.x = positionX;
                }
                const positionXValue = document.getElementById('positionXValue');
                if (positionXValue) {
                    positionXValue.textContent = positionX + '%';
                }
                this.updatePreview();
                
                // Применяем ко всем слайдам если включено
                this.applyBackgroundToAllSlides(this.currentEditingSlide);
            });
            console.log('✅ Position X slider bound');
        }

        // Слайдер позиции Y
        const positionYSlider = document.getElementById('positionYSlider');
        if (positionYSlider) {
            positionYSlider.addEventListener('input', (e) => {
                const positionY = parseInt(e.target.value);
                console.log('↕️ Position Y changed:', positionY);
                const currentSlide = this.project.slides[this.currentSlideIndex];
                if (currentSlide) {
                    currentSlide.background.y = positionY;
                }
                const positionYValue = document.getElementById('positionYValue');
                if (positionYValue) {
                    positionYValue.textContent = positionY + '%';
                }
                this.updatePreview();
                
                // Применяем ко всем слайдам если включено
                this.applyBackgroundToAllSlides(this.currentEditingSlide);
            });
            console.log('✅ Position Y slider bound');
        }

        // Индикаторы в редакторе
        const indicators = document.querySelectorAll('.editor-indicator');
        console.log(`🎯 Found ${indicators.length} indicators`);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🔥 Indicator ${index} clicked`);
                if (index !== this.currentSlideIndex) {
                    this.currentSlideIndex = index;
                    this.updateEditorSlide();
                }
            });
        });

        // Свайп навигация
        this.setupEditorSwipeNavigation();
        this.setupFullEditorSwipeNavigation();
        
        // ===== ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ ТЕКСТОВЫХ БЛОКОВ =====
        
        // Кнопка добавления текстового блока
        const addTextBlockBtn = document.getElementById('addTextBlockBtn');
        if (addTextBlockBtn) {
            addTextBlockBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTextBlock();
            });
            console.log('✅ Add text block button bound');
        }
        
        // Текстовый редактор для блока
        const blockTextEditor = document.getElementById('blockTextEditor');
        if (blockTextEditor) {
            blockTextEditor.addEventListener('input', (e) => {
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'text', e.target.value);
                }
            });
            console.log('✅ Block text editor bound');
        }
        
        // Слайдер размера блока
        const blockSizeSlider = document.getElementById('blockSizeSlider');
        if (blockSizeSlider) {
            blockSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'size', size);
                    const blockSizeValue = document.getElementById('blockSizeValue');
                    if (blockSizeValue) {
                        blockSizeValue.textContent = size + 'px';
                    }
                    
                    // Применяем ко всем слайдам если включено
                    this.applyFontToAllSlides(this.currentSlideIndex, 'size', size);
                }
            });
            console.log('✅ Block size slider bound');
        }
        
        // Слайдер веса шрифта блока
        const blockWeightSlider = document.getElementById('blockWeightSlider');
        if (blockWeightSlider) {
            blockWeightSlider.addEventListener('input', (e) => {
                const weight = parseInt(e.target.value);
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'weight', weight);
                    const blockWeightValue = document.getElementById('blockWeightValue');
                    if (blockWeightValue) {
                        blockWeightValue.textContent = weight;
                    }
                    
                    // Применяем ко всем слайдам если включено
                    this.applyFontToAllSlides(this.currentSlideIndex, 'weight', weight);
                }
            });
            console.log('✅ Block weight slider bound');
        }
        
        // Слайдер ширины блока
        const blockWidthSlider = document.getElementById('blockWidthSlider');
        if (blockWidthSlider) {
            blockWidthSlider.addEventListener('input', (e) => {
                const width = parseInt(e.target.value);
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'width', width);
                    const blockWidthValue = document.getElementById('blockWidthValue');
                    if (blockWidthValue) {
                        blockWidthValue.textContent = width + '%';
                    }
                }
            });
            console.log('✅ Block width slider bound');
        }
        
        // Кнопки шрифта блока
        const blockFontButtons = document.querySelectorAll('[data-block-font]');
        console.log(`🎯 Found ${blockFontButtons.length} block font buttons`);
        blockFontButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const font = btn.getAttribute('data-block-font');
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'font', font);
                    
                    document.querySelectorAll('[data-block-font]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.hapticFeedback();
                    
                    // Применяем ко всем слайдам если включено
                    this.applyFontToAllSlides(this.currentSlideIndex, 'font', font);
                }
            });
        });
        
        // Кнопки цвета блока
        const blockColorButtons = document.querySelectorAll('[data-block-color]');
        console.log(`🎯 Found ${blockColorButtons.length} block color buttons`);
        blockColorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = btn.getAttribute('data-block-color');
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'color', color);
                    
                    document.querySelectorAll('[data-block-color]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.hapticFeedback();
                    
                    // Применяем ко всем слайдам если включено
                    this.applyFontToAllSlides(this.currentSlideIndex, 'color', color);
                }
            });
        });
        
        // Кнопки цвета ключевых слов
        const keywordColorButtons = document.querySelectorAll('[data-keyword-color]');
        console.log(`🎯 Found ${keywordColorButtons.length} keyword color buttons`);
        keywordColorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = btn.getAttribute('data-keyword-color');
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'keywordColor', color);
                    
                    document.querySelectorAll('[data-keyword-color]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    this.hapticFeedback();
                    
                    // Применяем ко всем слайдам если включено
                    this.applyEffectsToAllSlides(this.currentSlideIndex, 'keywordColor', color);
                }
            });
        });
        
        // Чекбокс подсветки
        const highlightEnabledCheckbox = document.getElementById('highlightEnabledCheckbox');
        if (highlightEnabledCheckbox) {
            highlightEnabledCheckbox.addEventListener('change', (e) => {
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'highlightEnabled', e.target.checked);
                    
                    // Применяем ко всем слайдам если включено
                    this.applyEffectsToAllSlides(this.currentSlideIndex, 'highlightEnabled', e.target.checked);
                }
            });
            console.log('✅ Highlight enabled checkbox bound');
        }
        
        // Чекбокс авто-подсветки от AI
        const autoHighlightCheckbox = document.getElementById('autoHighlightCheckbox');
        if (autoHighlightCheckbox) {
            autoHighlightCheckbox.addEventListener('change', (e) => {
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'autoHighlight', e.target.checked);
                    
                    // Применяем ко всем слайдам если включено
                    this.applyEffectsToAllSlides(this.currentSlideIndex, 'autoHighlight', e.target.checked);
                }
            });
            console.log('✅ Auto highlight checkbox bound');
        }
        
        // Чекбокс свечения
        const blockGlowCheckbox = document.getElementById('blockGlowCheckbox');
        if (blockGlowCheckbox) {
            blockGlowCheckbox.addEventListener('change', (e) => {
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'glow', e.target.checked);
                    
                    // Применяем ко всем слайдам если включено
                    this.applyEffectsToAllSlides(this.currentSlideIndex, 'glow', e.target.checked);
                }
            });
            console.log('✅ Block glow checkbox bound');
        }
        
        // Чекбокс ключевого слова
        const blockKeywordCheckbox = document.getElementById('blockKeywordCheckbox');
        if (blockKeywordCheckbox) {
            blockKeywordCheckbox.addEventListener('change', (e) => {
                const selectedBlock = this.getSelectedTextBlock();
                if (selectedBlock) {
                    this.updateTextBlockProperty(selectedBlock.id, 'isKeyword', e.target.checked);
                    
                    // Применяем ко всем слайдам если включено
                    this.applyEffectsToAllSlides(this.currentSlideIndex, 'isKeyword', e.target.checked);
                }
            });
            console.log('✅ Block keyword checkbox bound');
        }
        
        // Кнопка удаления текстового блока
        const deleteTextBlockBtn = document.getElementById('deleteTextBlockBtn');
        if (deleteTextBlockBtn) {
            deleteTextBlockBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.selectedTextBlockId) {
                    this.deleteTextBlock(this.selectedTextBlockId);
                }
            });
            console.log('✅ Delete text block button bound');
        }
        
        // Инициализируем список блоков и контролы
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        
        // Выбираем первый блок если ничего не выбрано
        const currentTextBlocks = this.getCurrentTextBlocks();
        if (!this.selectedTextBlockId && currentTextBlocks.length > 0) {
            this.selectedTextBlockId = currentTextBlocks[0].id;
            this.updateTextBlockControls();
        }
        
        // ===== ОБРАБОТЧИК "ПРИМЕНИТЬ КО ВСЕМ" =====
        
        // Чекбокс "Применить ко всем"
        const applyToAllCheckbox = document.getElementById('applyToAllCheckbox');
        if (applyToAllCheckbox) {
            applyToAllCheckbox.addEventListener('change', (e) => {
                this.applyToAll = e.target.checked;
                console.log('🔄 Apply to all changed:', this.applyToAll);
                this.hapticFeedback();
                
                if (this.applyToAll) {
                    this.showToast('✅ Изменения будут применяться ко всем слайдам', 'success');
                } else {
                    this.showToast('ℹ️ Изменения только для текущего слайда', 'info');
                }
            });
            console.log('✅ Apply to all checkbox bound');
        }
        
        console.log('✅ Все события редактора привязаны');
    }

    // Обработка загрузки изображения фона
    handleBackgroundImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            console.log('📷 Image loaded, size:', imageUrl.length);
            
            // Сохраняем изображение в стили текущего слайда
            const currentSlide = this.project.slides[this.currentSlideIndex];
            if (currentSlide) {
                currentSlide.background.image = imageUrl;
                currentSlide.background.brightness = 100;
                currentSlide.background.x = 50;
                currentSlide.background.y = 50;
            }
            
            // Перерисовываем редактор для показа новых контролов
            this.updateEditorSlide();
            this.updatePreview();
            this.hapticFeedback();
            
            // Применяем ко всем слайдам если включено
            this.applyBackgroundToAllSlides(this.currentSlideIndex);
            
            this.showToast('✅ Фон загружен!', 'success');
        };
        
        reader.onerror = () => {
            console.error('❌ Error loading image');
            this.showToast('❌ Ошибка загрузки изображения', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // ===== МЕТОДЫ ДЛЯ РАБОТЫ С ТЕКСТОВЫМИ БЛОКАМИ =====

    // Добавление кнопки быстрого добавления текста на слайд
    addQuickAddTextButton(slidePreview) {
        // Удаляем старую кнопку если есть
        const existingButton = slidePreview.querySelector('.quick-add-text-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Создаем кнопку только если нет текстовых блоков
        const currentSlide = this.project.slides[this.currentSlideIndex];
        if (currentSlide && currentSlide.textBlocks && currentSlide.textBlocks.length > 0) {
            return; // Не показываем кнопку если есть текстовые блоки
        }
        
        const quickAddBtn = document.createElement('button');
        quickAddBtn.className = 'quick-add-text-btn';
        quickAddBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Добавить текст</span>
        `;
        
        quickAddBtn.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            border: 2px dashed #833ab4;
            border-radius: 12px;
            padding: 16px 20px;
            color: #833ab4;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 5;
        `;
        
        quickAddBtn.addEventListener('mouseenter', () => {
            quickAddBtn.style.background = 'rgba(131, 58, 180, 0.1)';
            quickAddBtn.style.borderColor = '#6d2d96';
            quickAddBtn.style.transform = 'translate(-50%, -50%) scale(1.05)';
        });
        
        quickAddBtn.addEventListener('mouseleave', () => {
            quickAddBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            quickAddBtn.style.borderColor = '#833ab4';
            quickAddBtn.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        quickAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addTextBlock();
            this.hapticFeedback();
        });
        
        slidePreview.appendChild(quickAddBtn);
    }

    // Начало inline-редактирования текста
    startInlineTextEditing(blockElement, blockId) {
        console.log('🖊️ Начинаем inline-редактирование блока:', blockId);
        
        const currentSlide = this.project.slides[this.currentSlideIndex];
        const block = currentSlide?.textBlocks?.find(b => b.id === blockId);
        if (!block) return;
        
        // Отключаем перетаскивание во время редактирования
        if (blockElement._setDragEnabled) {
            blockElement._setDragEnabled(false);
        }
        
        // Отключаем resize во время редактирования
        const resizeHandle = blockElement.querySelector('.text-block-resize-handle');
        if (resizeHandle) {
            resizeHandle.style.display = 'none';
        }
        
        // Создаем textarea для редактирования
        const textarea = document.createElement('textarea');
        textarea.className = 'inline-text-editor';
        textarea.value = block.text;
        
        // Копируем стили блока
        textarea.style.position = 'absolute';
        textarea.style.left = block.position.x + '%';
        textarea.style.top = block.position.y + '%';
        textarea.style.width = block.width + '%';
        textarea.style.fontSize = block.size + 'px';
        textarea.style.fontFamily = block.font;
        textarea.style.fontWeight = block.weight;
        textarea.style.color = block.color;
        textarea.style.textAlign = 'center';
        textarea.style.transform = 'translate(-50%, -50%)';
        textarea.style.zIndex = '1000';
        textarea.style.background = 'rgba(255, 255, 255, 0.9)';
        textarea.style.border = '2px solid #833ab4';
        textarea.style.borderRadius = '8px';
        textarea.style.padding = '8px';
        textarea.style.resize = 'none';
        textarea.style.outline = 'none';
        textarea.style.lineHeight = '1.2';
        textarea.style.minHeight = '40px';
        textarea.style.overflow = 'hidden';
        textarea.style.cursor = 'text';
        
        // Скрываем оригинальный блок
        blockElement.style.display = 'none';
        
        // Добавляем textarea в слайд
        const slidePreview = document.getElementById('slidePreview');
        slidePreview.appendChild(textarea);
        
        // Фокусируемся и выделяем весь текст
        textarea.focus();
        textarea.select();
        
        // Автоматически подстраиваем высоту
        const adjustHeight = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
        };
        
        textarea.addEventListener('input', adjustHeight);
        adjustHeight();
        
        // Обработчики для завершения редактирования
        const finishEditing = () => {
            const newText = textarea.value.trim();
            if (newText !== block.text) {
                this.updateTextBlockProperty(blockId, 'text', newText);
                console.log('✅ Текст блока обновлен:', newText);
            }
            
            // Удаляем textarea
            textarea.remove();
            
            // Показываем оригинальный блок
            blockElement.style.display = 'block';
            
            // Включаем обратно перетаскивание
            if (blockElement._setDragEnabled) {
                blockElement._setDragEnabled(true);
            }
            
            // Показываем resize handle
            if (resizeHandle) {
                resizeHandle.style.display = 'block';
            }
            
            // Обновляем превью и контролы
            this.updatePreview();
            this.updateTextBlockControls();
        };
        
        // Завершение по Enter (с Shift+Enter для новой строки)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                // Отмена редактирования
                textarea.remove();
                blockElement.style.display = 'block';
            }
        });
        
        // Завершение при потере фокуса
        textarea.addEventListener('blur', finishEditing);
        
        this.hapticFeedback('light');
    }

    // Удаление текстового блока (старая версия для совместимости)
    removeTextBlock(blockId) {
        // Перенаправляем на новую функцию
        this.deleteTextBlock(blockId);
    }

    // ===== УНИФИЦИРОВАННАЯ СИСТЕМА ТЕКСТОВЫХ БЛОКОВ =====
    
    // Получение выбранного текстового блока из основной структуры
    getSelectedTextBlock() {
        if (!this.selectedTextBlockId) return null;
        
        const currentSlide = this.project.slides[this.currentSlideIndex];
        if (!currentSlide || !currentSlide.textBlocks) return null;
        
        return currentSlide.textBlocks.find(block => block.id === this.selectedTextBlockId);
    }
    
    // Получение всех текстовых блоков текущего слайда
    getCurrentTextBlocks() {
        const currentSlide = this.project.slides[this.currentSlideIndex];
        return currentSlide ? (currentSlide.textBlocks || []) : [];
    }
    
    // Добавление нового текстового блока
    addTextBlock() {
        const currentSlide = this.project.slides[this.currentSlideIndex];
        if (!currentSlide) return;
        
        // Создаем новый блок с уникальным ID
        const newBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: 'Нажмите для редактирования',
            position: { x: 50, y: 50 }, // позиция в процентах
            width: 60, // ширина в процентах
            font: 'Inter',
            size: 16,
            weight: 700,
            color: '#ffffff',
            glow: false,
            isKeyword: false,
            keywordColor: '#ff6b6b',
            highlightEnabled: true,
            autoHighlight: true
        };
        
        // Инициализируем массив textBlocks если его нет
        if (!currentSlide.textBlocks) {
            currentSlide.textBlocks = [];
        }
        
        // Добавляем в основную структуру
        currentSlide.textBlocks.push(newBlock);
        
        // Текстовый блок добавлен в единую структуру
        
        // Выбираем новый блок
        this.selectedTextBlockId = newBlock.id;
        
        // Обновляем интерфейс
        this.updatePreview();
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        this.hapticFeedback();
        
        console.log('✅ Добавлен новый текстовый блок:', newBlock.id);
        
        // Автоматически запускаем inline-редактирование через небольшую задержку
        setTimeout(() => {
            const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`);
            if (blockElement && this.isMode("edit")) {
                this.startInlineTextEditing(blockElement, newBlock.id);
            }
        }, 100);
        
        return newBlock;
    }
    
    // Удаление текстового блока
    deleteTextBlock(blockId) {
        const currentSlide = this.project.slides[this.currentSlideIndex];
        if (!currentSlide || !currentSlide.textBlocks) return;
        
        // Удаляем из основной структуры
        const blockIndex = currentSlide.textBlocks.findIndex(block => block.id === blockId);
        if (blockIndex !== -1) {
            currentSlide.textBlocks.splice(blockIndex, 1);
        }
        
        // Если удаляем выбранный блок, выбираем первый доступный
        if (this.selectedTextBlockId === blockId) {
            const remainingBlocks = currentSlide.textBlocks;
            this.selectedTextBlockId = remainingBlocks.length > 0 ? remainingBlocks[0].id : null;
        }
        
        // Обновляем интерфейс
        this.updatePreview();
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        this.hapticFeedback();
        
        console.log('✅ Удален текстовый блок:', blockId);
    }
    
    // Выбор текстового блока для редактирования
    selectTextBlock(blockId) {
        // Проверяем, что блок существует
        const block = this.getCurrentTextBlocks().find(b => b.id === blockId);
        if (!block) {
            console.warn('⚠️ Блок не найден:', blockId);
            return;
        }
        
        this.selectedTextBlockId = blockId;
        
        // Обновляем интерфейс
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        this.updatePreview();
        this.hapticFeedback('light');
        
        console.log('✅ Выбран текстовый блок:', blockId);
    }
    
    // Обновление свойства текстового блока
    updateTextBlockProperty(blockId, property, value) {
        const currentSlide = this.slides[this.currentEditingSlide];
        if (!currentSlide || !currentSlide.textBlocks) return;
        
        const block = currentSlide.textBlocks.find(b => b.id === blockId);
        if (!block) {
            console.warn(`⚠️ Блок ${blockId} не найден`);
            return;
        }
        
        // Обновляем свойство в основной структуре
        if (property.includes('.')) {
            // Поддержка вложенных свойств (например, 'position.x')
            const keys = property.split('.');
            let target = block;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = value;
        } else {
            block[property] = value;
        }
        
        console.log(`✅ Обновлено свойство ${property} блока ${blockId}:`, value);
    }
    
    // Синхронизация блока с slideStyles для обратной совместимости
    syncTextBlockToSlideStyles(block, slideIndex) {
        const slideStyles = this.slideStyles[slideIndex];
        if (!slideStyles) return;
        
        if (!slideStyles.textBlocks) {
            slideStyles.textBlocks = [];
        }
        
        // Находим или создаем блок в slideStyles
        let styleBlock = slideStyles.textBlocks.find(b => b.id === block.id);
        if (!styleBlock) {
            styleBlock = { id: block.id };
            slideStyles.textBlocks.push(styleBlock);
        }
        
        // Синхронизируем все свойства
        styleBlock.text = block.text;
        styleBlock.position = { ...block.position };
        styleBlock.width = block.width;
        styleBlock.font = block.font;
        styleBlock.size = block.size;
        styleBlock.weight = block.weight;
        styleBlock.color = block.color;
        styleBlock.glow = block.glow;
        styleBlock.isKeyword = block.isKeyword;
        styleBlock.keywordColor = block.keywordColor;
        styleBlock.highlightEnabled = block.highlightEnabled;
        styleBlock.autoHighlight = block.autoHighlight;
    }
    
    // Синхронизация всех блоков слайда
    syncAllTextBlocksToSlideStyles(slideIndex) {
        const slide = this.slides[slideIndex];
        if (!slide || !slide.textBlocks) return;
        
        slide.textBlocks.forEach(block => {
            this.syncTextBlockToSlideStyles(block, slideIndex);
        });
    }

    // Обновление свойств текстового блока
    updateTextBlockProperty(blockId, property, value) {
        const currentSlideStyles = this.slideStyles[this.currentEditingSlide];
        const block = currentSlideStyles.textBlocks.find(block => block.id === blockId);
        
        if (block) {
            if (property === 'position') {
                block.position = { ...block.position, ...value };
            } else {
                block[property] = value;
            }
            
            this.updatePreview();
            console.log(`✅ Обновлено свойство ${property} блока ${blockId}:`, value);
        }
    }

    // Инициализация перетаскивания для текстового блока
    initTextBlockDragging(blockElement, blockId) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let dragEnabled = true;
        
        // Функция для включения/выключения перетаскивания
        const setDragEnabled = (enabled) => {
            dragEnabled = enabled;
            blockElement.style.cursor = enabled ? 'grab' : 'default';
            if (!enabled && isDragging) {
                // Принудительно завершаем перетаскивание
                handleMouseUp();
            }
        };
        
        // Сохраняем функцию для внешнего доступа
        blockElement._setDragEnabled = setDragEnabled;
        
        const handleMouseDown = (e) => {
            // Проверяем, что drag включен
            if (!dragEnabled) return;
            
            // Проверяем, что клик именно по тексту, а не по resize handle
            if (e.target.classList.contains('text-block-resize-handle')) return;
            
            // Проверяем, что нет активного inline-редактирования
            if (document.querySelector('.inline-text-editor')) return;
            
            // Проверяем, что клик по самому блоку или его содержимому
            const isTextClick = e.target === blockElement || blockElement.contains(e.target);
            if (!isTextClick) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // Получаем текущую позицию из state, а не из DOM
            const currentSlide = this.project.slides[this.currentSlideIndex];
            const block = currentSlide?.textBlocks?.find(b => b.id === blockId);
            if (block) {
                startLeft = block.x;
                startTop = block.y;
            } else {
                // Fallback: вычисляем из DOM
                const rect = blockElement.getBoundingClientRect();
                const parentRect = blockElement.parentElement.getBoundingClientRect();
                startLeft = ((rect.left - parentRect.left) / parentRect.width) * 100;
                startTop = ((rect.top - parentRect.top) / parentRect.height) * 100;
            }
            
            blockElement.style.cursor = 'grabbing';
            blockElement.style.zIndex = '1000';
            blockElement.style.userSelect = 'none';
            
            document.addEventListener('mousemove', handleDragMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
            e.stopPropagation();
        };
        
        const handleDragMouseMove = (e) => {
            if (!isDragging || !dragEnabled) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const parentRect = blockElement.parentElement.getBoundingClientRect();
            const deltaXPercent = (deltaX / parentRect.width) * 100;
            const deltaYPercent = (deltaY / parentRect.height) * 100;
            
            const newX = Math.max(5, Math.min(95, startLeft + deltaXPercent));
            const newY = Math.max(5, Math.min(95, startTop + deltaYPercent));
            
            // Обновляем позицию в DOM для визуального feedback
            blockElement.style.left = newX + '%';
            blockElement.style.top = newY + '%';
            
            // Обновляем данные в state без скачков
            this.updateTextBlockProperty(blockId, 'position', { x: newX, y: newY });
            
            e.preventDefault();
        };
        
        const handleMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            blockElement.style.cursor = dragEnabled ? 'grab' : 'default';
            blockElement.style.zIndex = '';
            blockElement.style.userSelect = '';
            
            document.removeEventListener('mousemove', handleDragMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Обновляем превью для синхронизации
            this.updatePreview();
        };
        
        // Добавляем обработчики только для mousedown на сам элемент
        blockElement.addEventListener('mousedown', handleMouseDown);
        
        // Touch события для мобильных устройств
        blockElement.addEventListener('touchstart', (e) => {
            if (!dragEnabled) return;
            
            const touch = e.touches[0];
            handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation(),
                target: e.target
            });
        });
        
        blockElement.addEventListener('touchmove', (e) => {
            if (isDragging && dragEnabled) {
                const touch = e.touches[0];
                handleDragMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => e.preventDefault()
                });
            }
        });
        
        blockElement.addEventListener('touchend', () => {
            if (isDragging) {
                handleMouseUp();
            }
        });
        
        // Устанавливаем начальное состояние
        setDragEnabled(true);
    }

    // Инициализация изменения размера для текстового блока
    initTextBlockResizing(blockElement, blockId) {
        const resizeHandle = blockElement.querySelector('.text-block-resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let startX, startWidth;
        
        const handleMouseDown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(blockElement.style.width) || 60;
            
            document.addEventListener('mousemove', handleResizeMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
            e.stopPropagation();
        };
        
        const handleResizeMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const parentRect = blockElement.parentElement.getBoundingClientRect();
            const deltaPercent = (deltaX / parentRect.width) * 100;
            
            const newWidth = Math.max(20, Math.min(100, startWidth + deltaPercent));
            
            blockElement.style.width = newWidth + '%';
            
            // Обновляем данные в реальном времени
            this.updateTextBlockProperty(blockId, 'width', newWidth);
        };
        
        const handleMouseUp = () => {
            isResizing = false;
            
            document.removeEventListener('mousemove', handleResizeMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        resizeHandle.addEventListener('mousedown', handleMouseDown);
        
        // Touch события для мобильных устройств
        resizeHandle.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation()
            });
        });
        
        resizeHandle.addEventListener('touchmove', (e) => {
            if (isResizing) {
                const touch = e.touches[0];
                handleResizeMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                e.preventDefault();
            }
        });
        
        resizeHandle.addEventListener('touchend', () => {
            if (isResizing) {
                handleMouseUp();
            }
        });
    }

    // ===== УНИФИЦИРОВАННЫЙ ДОСТУП К ДАННЫМ =====
    
    // Получить текущий слайд
    getCurrentSlide() {
        return this.project.slides[this.currentSlideIndex];
    }
    
    // Получить слайд по индексу
    getSlide(index) {
        return this.project.slides[index];
    }
    
    // Получить текстовые блоки текущего слайда
    getCurrentTextBlocks() {
        const slide = this.getCurrentSlide();
        return slide ? slide.textBlocks : [];
    }
    
    // Получить текстовый блок по ID
    getTextBlock(blockId, slideIndex = this.currentEditingSlide) {
        const slide = this.getSlide(slideIndex);
        return slide ? slide.textBlocks.find(block => block.id === blockId) : null;
    }
    
    // Обновить свойство слайда
    updateSlideProperty(slideIndex, property, value) {
        const slide = this.getSlide(slideIndex);
        if (!slide) return;
        
        // Поддержка вложенных свойств (например, 'background.color')
        const keys = property.split('.');
        let target = slide;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        console.log(`✅ Обновлено свойство ${property} слайда ${slideIndex}:`, value);
    }
    
    // Обновить свойство текстового блока
    updateTextBlockProperty(blockId, property, value, slideIndex = this.currentEditingSlide) {
        const block = this.getTextBlock(blockId, slideIndex);
        if (!block) {
            console.warn(`⚠️ Блок ${blockId} не найден в слайде ${slideIndex}`);
            return;
        }
        
        // Поддержка вложенных свойств (например, 'position.x')
        const keys = property.split('.');
        let target = block;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        console.log(`✅ Обновлено свойство ${property} блока ${blockId}:`, value);
    }

    // ===== ОСНОВНЫЕ ФУНКЦИИ =====

    // Парсинг текста с выделением *слов* и автоматических ключевых слов
    // Упрощенный парсинг текста с ключевыми словами
    parseTextWithKeywords(text, autoKeywords = []) {
        if (!text) return '';

        let processedText = text;

        // 1. Сначала обрабатываем ручные ключевые слова (*слово*)
        const manualKeywordRegex = /\*([^*]+)\*/g;
        processedText = processedText.replace(manualKeywordRegex, (match, keyword) => {
            return `<span class="manual-keyword">${keyword}</span>`;
        });

        // 2. Затем обрабатываем автоматические ключевые слова от AI
        if (autoKeywords && autoKeywords.length > 0) {
            autoKeywords.forEach(keyword => {
                // Создаем регулярное выражение для поиска слова целиком
                const autoKeywordRegex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
                
                processedText = processedText.replace(autoKeywordRegex, (match) => {
                    // Проверяем, не находится ли слово уже внутри тега подсветки
                    const beforeMatch = processedText.substring(0, processedText.indexOf(match));
                    const openTags = (beforeMatch.match(/<span class="[^"]*keyword/g) || []).length;
                    const closeTags = (beforeMatch.match(/<\/span>/g) || []).length;
                    
                    // Если количество открывающих и закрывающих тегов равно, значит мы не внутри тега
                    if (openTags === closeTags) {
                        return `<span class="auto-keyword">${match}</span>`;
                    }
                    
                    return match; // Не заменяем, если уже внутри тега
                });
            });
        }
        
        return processedText;
    }

    // Получение чистого текста без разметки
    getCleanText(text) {
        return text.replace(/\*([^*]+)\*/g, '$1');
    }

    // Подсчет ключевых слов в тексте
    countKeywords(text) {
        const keywordRegex = /\*([^*]+)\*/g;
        const matches = text.match(keywordRegex);
        return matches ? matches.length : 0;
    }

    // Получение списка ключевых слов
    getKeywordsList(text) {
        const keywordRegex = /\*([^*]+)\*/g;
        const keywords = [];
        let match;
        
        while ((match = keywordRegex.exec(text)) !== null) {
            keywords.push(match[1]);
        }
        
        return keywords;
    }

    // ===== СИСТЕМА ШАБЛОНОВ =====

    // Сохранение шаблона (включая фон, шрифты, размеры, позиции)
    saveTemplate() {
        const templateName = prompt('Введите название шаблона:');
        if (!templateName || templateName.trim() === '') {
            this.showToast('❌ Название шаблона не может быть пустым', 'error');
            return;
        }

        const currentSlide = this.project.slides[this.currentSlideIndex];
        if (!currentSlide) {
            this.showToast('❌ Нет активного слайда для сохранения', 'error');
            return;
        }
        
        // Сохраняем полные стили включая позиции и размеры
        const template = {
            id: Date.now().toString(),
            name: templateName.trim(),
            createdAt: new Date().toISOString(),
            version: '2.0', // Версия для совместимости
            slide: JSON.parse(JSON.stringify(currentSlide)) // Глубокое копирование
        };
                backgroundColor: currentStyles.backgroundColor,
                backgroundImage: currentStyles.backgroundImage,
                brightness: currentStyles.brightness || 100,
                positionX: currentStyles.positionX || 0,
                positionY: currentStyles.positionY || 0,
                
                // Шрифты и стили
                fontFamily: currentStyles.fontFamily,
                fontSize: currentStyles.fontSize,
                textColor: currentStyles.textColor,
                
                // Полные стили текстовых блоков (включая позиции и размеры)
                textBlockStyles: currentStyles.textBlocks.map(block => ({
                    // Стили
                    font: block.font,
                    size: block.size,
                    weight: block.weight,
                    color: block.color,
                    glow: block.glow,
                    isKeyword: block.isKeyword,
                    keywordColor: block.keywordColor,
                    highlightEnabled: block.highlightEnabled,
                    autoHighlight: block.autoHighlight,
                    
                    // Позиция и размеры
                    position: {
                        x: block.position.x,
                        y: block.position.y
                    },
                    width: block.width,
                    
                    // Placeholder для текста (будет заменен при применении)
                    textPlaceholder: `Текст блока ${currentStyles.textBlocks.indexOf(block) + 1}`
                }))
            }
        };

        // Сохраняем в localStorage с использованием предложенного формата
        try {
            const templates = this.getTemplates();
            templates.push(template);
            localStorage.setItem('flashpost_templates', JSON.stringify(templates));
            
            // Дополнительно сохраняем с индивидуальным ключом для быстрого доступа
            localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
            
            this.showToast(`✅ Шаблон "${templateName}" сохранен!`, 'success');
            console.log('✅ Шаблон сохранен:', template);
            
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            this.showToast('❌ Ошибка сохранения шаблона', 'error');
        }
    }

    // Получение всех шаблонов из localStorage
    getTemplates() {
        try {
            const templates = localStorage.getItem('flashpost_templates');
            return templates ? JSON.parse(templates) : [];
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблонов:', error);
            return [];
        }
    }

    // Применение шаблона ко всем слайдам
    applyTemplate(templateId) {
        const templates = this.getTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            this.showToast('❌ Шаблон не найден', 'error');
            return;
        }

        console.log('🎨 Применяем шаблон:', template);

        // Применяем стили ко всем слайдам
        this.slideStyles.forEach((slideStyle, index) => {
            // Фон
            slideStyle.backgroundColor = template.styles.backgroundColor;
            slideStyle.backgroundImage = template.styles.backgroundImage;
            slideStyle.brightness = template.styles.brightness || 100;
            slideStyle.positionX = template.styles.positionX || 0;
            slideStyle.positionY = template.styles.positionY || 0;
            
            // Шрифты
            slideStyle.fontFamily = template.styles.fontFamily;
            slideStyle.fontSize = template.styles.fontSize;
            slideStyle.textColor = template.styles.textColor;
            
            // Применяем стили к текстовым блокам
            if (template.version === '2.0' && template.styles.textBlockStyles) {
                // Новый формат - с позициями и размерами
                slideStyle.textBlocks.forEach((block, blockIndex) => {
                    const templateBlockStyle = template.styles.textBlockStyles[blockIndex];
                    if (templateBlockStyle) {
                        // Стили
                        block.font = templateBlockStyle.font;
                        block.size = templateBlockStyle.size;
                        block.weight = templateBlockStyle.weight;
                        block.color = templateBlockStyle.color;
                        block.glow = templateBlockStyle.glow;
                        block.isKeyword = templateBlockStyle.isKeyword;
                        block.keywordColor = templateBlockStyle.keywordColor;
                        block.highlightEnabled = templateBlockStyle.highlightEnabled;
                        block.autoHighlight = templateBlockStyle.autoHighlight;
                        
                        // Позиции и размеры (новое!)
                        if (templateBlockStyle.position) {
                            block.position = {
                                x: templateBlockStyle.position.x,
                                y: templateBlockStyle.position.y
                            };
                        }
                        if (templateBlockStyle.width) {
                            block.width = templateBlockStyle.width;
                        }
                        
                        // Если текст пустой, используем placeholder
                        if (!block.text || block.text.trim() === '') {
                            block.text = templateBlockStyle.textPlaceholder || `Текст блока ${blockIndex + 1}`;
                        }
                    }
                });
            } else {
                // Старый формат - только стили без позиций
                slideStyle.textBlocks.forEach((block, blockIndex) => {
                    const templateBlockStyle = template.styles.textBlockStyles[blockIndex];
                    if (templateBlockStyle) {
                        block.font = templateBlockStyle.font;
                        block.size = templateBlockStyle.size;
                        block.weight = templateBlockStyle.weight;
                        block.color = templateBlockStyle.color;
                        block.glow = templateBlockStyle.glow;
                        block.isKeyword = templateBlockStyle.isKeyword;
                        block.keywordColor = templateBlockStyle.keywordColor;
                        block.highlightEnabled = templateBlockStyle.highlightEnabled;
                        // НЕ меняем позиции в старом формате
                    }
                });
            }
        });

        // Обновляем интерфейс
        this.updateEditorSlide();
        this.updatePreview();
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        
        this.showToast(`✅ Шаблон "${template.name}" применен ко всем слайдам`, 'success');
        console.log('✅ Шаблон применен ко всем слайдам:', template.name);
    }

    // Показ списка шаблонов
    showTemplatesList() {
        const templates = this.getTemplates();
        
        if (templates.length === 0) {
            this.showToast('📝 Сначала сохраните шаблон', 'info');
            return;
        }

        // Создаем простой список для выбора
        const templateNames = templates.map(t => `${t.name} (${new Date(t.createdAt).toLocaleDateString()})`);
        const selectedIndex = prompt(`Выберите шаблон (введите номер):\n${templateNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`);
        
        const index = parseInt(selectedIndex) - 1;
        if (index >= 0 && index < templates.length) {
            this.applyTemplate(templates[index].id);
        } else if (selectedIndex !== null) {
            this.showToast('❌ Неверный номер шаблона', 'error');
        }
    }

    // Удаление шаблона
    deleteTemplate(templateId) {
        const templates = this.getTemplates();
        const filteredTemplates = templates.filter(t => t.id !== templateId);
        localStorage.setItem('flashpost_templates', JSON.stringify(filteredTemplates));
        this.showToast('✅ Шаблон удален', 'success');
    }

    // ===== СИСТЕМА ЭКСПОРТА =====

    // Загрузка html2canvas
    async loadHtml2Canvas() {
        if (window.html2canvas) {
            return window.html2canvas;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('✅ html2canvas загружен');
                resolve(window.html2canvas);
            };
            script.onerror = () => {
                console.error('❌ Ошибка загрузки html2canvas');
                reject(new Error('Не удалось загрузить html2canvas'));
            };
            document.head.appendChild(script);
        });
    }

    // Ожидание загрузки шрифтов
    async waitForFonts() {
        try {
            // Современные браузеры поддерживают document.fonts.ready
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
                console.log('✅ Шрифты загружены через document.fonts.ready');
                return;
            }
        } catch (error) {
            console.warn('⚠️ document.fonts.ready не поддерживается:', error);
        }

        // Fallback для старых браузеров
        console.log('🔄 Используем fallback для загрузки шрифтов');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Загрузка JSZip и FileSaver
    async loadExportLibraries() {
        const promises = [];
        
        // JSZip
        if (!window.JSZip) {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Не удалось загрузить JSZip'));
                document.head.appendChild(script);
            }));
        }
        
        // FileSaver
        if (!window.saveAs) {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Не удалось загрузить FileSaver'));
                document.head.appendChild(script);
            }));
        }
        
        await Promise.all(promises);
        console.log('✅ Библиотеки экспорта загружены');
    }

    // Создание canvas для слайда
    async createSlideCanvas(slideIndex) {
        const slide = this.project.slides[slideIndex];
        if (!slide) return null;
        
        // Создаем временный контейнер
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: -2000px;
            left: -2000px;
            width: 1080px;
            height: 1080px;
            background: ${styles.backgroundColor || '#833ab4'};
            font-family: ${styles.fontFamily || 'Inter'};
            color: ${styles.textColor || '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
            box-sizing: border-box;
            overflow: hidden;
        `;

        // Добавляем фоновое изображение
        if (styles.backgroundImage) {
            container.style.backgroundImage = `url(${styles.backgroundImage})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = `${50 + (styles.positionX || 0)}% ${50 + (styles.positionY || 0)}%`;
            if (styles.brightness !== 100) {
                container.style.filter = `brightness(${styles.brightness || 100}%)`;
            }
        }

        // Добавляем текстовые блоки
        if (styles.textBlocks && styles.textBlocks.length > 0) {
            styles.textBlocks.forEach(block => {
                const blockElement = document.createElement('div');
                blockElement.style.cssText = `
                    position: absolute;
                    left: ${block.position.x}%;
                    top: ${block.position.y}%;
                    width: ${block.width}%;
                    transform: translate(-50%, -50%);
                    font-family: ${block.font || 'Inter'};
                    font-size: ${(block.size || 16) * 3.375}px;
                    font-weight: ${block.weight || 400};
                    color: ${block.color || '#ffffff'};
                    text-align: center;
                    line-height: 1.2;
                    word-wrap: break-word;
                    white-space: pre-line;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                `;

                // Обрабатываем подсветку ключевых слов
                if (block.highlightEnabled && (block.text.includes('*') || (block.autoHighlight !== false && this.project.slides[slideIndex].autoKeywords && this.project.slides[slideIndex].autoKeywords.length > 0))) {
                    const autoKeywords = (block.autoHighlight !== false) ? (this.project.slides[slideIndex].autoKeywords || []) : [];
                    blockElement.innerHTML = this.parseTextWithKeywords(block.text, block.keywordColor || '#ffeb3b', true, autoKeywords, block.glow);
                } else {
                    blockElement.textContent = block.text;
                }

                container.appendChild(blockElement);
            });
        } else {
            // Основной текст слайда
            const textElement = document.createElement('div');
            textElement.style.cssText = `
                font-size: ${(styles.fontSize || 16) * 3.375}px;
                line-height: 1.2;
                word-wrap: break-word;
                white-space: pre-line;
            `;
            textElement.textContent = slide.text;
            container.appendChild(textElement);
        }

        document.body.appendChild(container);
        
        // Ждем загрузки шрифтов и рендеринга
        await this.waitForFonts();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Создаем canvas
        const html2canvas = await this.loadHtml2Canvas();
        const canvas = await html2canvas(container, {
            width: 1080,
            height: 1080,
            scale: 1,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
            logging: false
        });
        
        document.body.removeChild(container);
        return canvas;
    }

    // Экспорт текущего слайда
    async exportCurrentSlide() {
        try {
            this.showToast('📸 Создание изображения...', 'info');
            
            const canvas = await this.createSlideCanvas(this.currentEditingSlide);
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            
            // Скачиваем
            const link = document.createElement('a');
            link.download = `slide-${this.currentEditingSlide + 1}.jpg`;
            link.href = dataURL;
            link.click();
            
            this.showToast('✅ Слайд экспортирован!', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка экспорта:', error);
            this.showToast('❌ Ошибка экспорта слайда', 'error');
        }
    }

    // Экспорт всех слайдов в ZIP
    async exportAllSlides() {
        try {
            this.showToast('📦 Подготовка экспорта...', 'info');
            
            // Загружаем библиотеки
            await this.loadExportLibraries();
            
            const zip = new JSZip();
            const totalSlides = this.project.slides.length;
            
            for (let i = 0; i < totalSlides; i++) {
                // Показываем прогресс
                const progress = Math.round(((i + 1) / totalSlides) * 100);
                this.showToast(`📷 Экспорт слайда ${i + 1}/${totalSlides} (${progress}%)`, 'info');
                
                const canvas = await this.createSlideCanvas(i);
                const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                
                // Конвертируем в blob и добавляем в zip
                const base64Data = dataURL.split(',')[1];
                zip.file(`slide-${i + 1}.jpg`, base64Data, { base64: true });
                
                // Небольшая пауза
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.showToast('💾 Создание ZIP архива...', 'info');
            
            // Создаем ZIP файл
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Скачиваем
            window.saveAs(zipBlob, 'flashpost-slides.zip');
            
            this.showToast('✅ Все слайды экспортированы!', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка экспорта всех слайдов:', error);
            this.showToast('❌ Ошибка экспорта слайдов', 'error');
        }
    }

    // ===== СИСТЕМА ЭКСПОРТА СЛАЙДОВ =====

    // Загрузка html2canvas библиотеки
    async loadHtml2Canvas() {
        if (window.html2canvas) {
            return window.html2canvas;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('✅ html2canvas загружен');
                resolve(window.html2canvas);
            };
            script.onerror = () => {
                console.error('❌ Ошибка загрузки html2canvas');
                reject(new Error('Не удалось загрузить html2canvas'));
            };
            document.head.appendChild(script);
        });
    }

    // Создание элемента слайда для экспорта
    createExportSlide(slideIndex) {
        const slide = this.project.slides[slideIndex];
        if (!slide) return null;
        
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const isFirstSlide = slideIndex === 0;
        const isLastSlide = slideIndex === this.project.slides.length - 1;
        const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;

        // Создаем контейнер для экспорта
        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = `
            position: fixed;
            top: -2000px;
            left: -2000px;
            width: 1080px;
            height: 1080px;
            background: ${styles.backgroundColor || '#ffffff'};
            font-family: ${styles.fontFamily || 'Inter'};
            font-size: ${Math.round((styles.fontSize || 16) * 3.375)}px;
            color: ${styles.textColor || '#000000'};
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px;
            box-sizing: border-box;
            overflow: hidden;
            z-index: -1000;
        `;

        // Добавляем фоновое изображение если есть
        if (styles.backgroundImage) {
            const brightness = styles.brightness || 100;
            const positionX = styles.positionX || 0;
            const positionY = styles.positionY || 0;
            
            exportContainer.style.backgroundImage = `url(${styles.backgroundImage})`;
            exportContainer.style.backgroundSize = 'cover';
            exportContainer.style.backgroundPosition = `${50 + positionX}% ${50 + positionY}%`;
            exportContainer.style.backgroundRepeat = 'no-repeat';
            
            if (brightness !== 100) {
                exportContainer.style.filter = `brightness(${brightness}%)`;
            }
        }

        // Добавляем текстовые блоки или основной текст
        if (styles.textBlocks && styles.textBlocks.length > 0) {
            styles.textBlocks.forEach(block => {
                const blockElement = document.createElement('div');
                blockElement.style.cssText = `
                    position: absolute;
                    left: ${block.position.x}%;
                    top: ${block.position.y}%;
                    width: ${block.width}%;
                    transform: translate(-50%, -50%);
                    font-family: ${block.font || 'Inter'};
                    font-size: ${Math.round((block.size || 16) * 3.375)}px;
                    font-weight: ${block.weight || 400};
                    color: ${block.color || '#000000'};
                    text-align: center;
                    line-height: 1.2;
                    word-wrap: break-word;
                    white-space: pre-line;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                `;

                // Обрабатываем текст с подсветкой ключевых слов
                if (block.highlightEnabled && (block.text.includes('*') || (block.autoHighlight !== false && this.project.slides[slideIndex].autoKeywords && this.project.slides[slideIndex].autoKeywords.length > 0))) {
                    const autoKeywords = (block.autoHighlight !== false) ? (this.project.slides[slideIndex].autoKeywords || []) : [];
                    blockElement.innerHTML = this.parseTextWithKeywords(block.text, block.keywordColor || '#ffeb3b', true, autoKeywords, block.glow);
                } else {
                    blockElement.textContent = block.text;
                }

                exportContainer.appendChild(blockElement);
            });
        } else {
            // Используем основной текст слайда
            const textElement = document.createElement('div');
            textElement.style.cssText = `
                width: 100%;
                line-height: 1.2;
                word-wrap: break-word;
                white-space: pre-line;
            `;
            textElement.textContent = slide.text;
            exportContainer.appendChild(textElement);
        }

        // Добавляем Instagram контакт если нужно
        if (showInstagram) {
            const instagramElement = document.createElement('div');
            instagramElement.style.cssText = `
                position: absolute;
                top: 40px;
                left: 40px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 32px;
                font-weight: 500;
                color: ${styles.textColor || '#000000'};
                opacity: 0.8;
            `;

            const iconSvg = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="${styles.textColor || '#000000'}">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="17.5" cy="6.5" r="1.5"/>
                </svg>
            `;

            instagramElement.innerHTML = `${iconSvg}<span>${instagramContact}</span>`;
            exportContainer.appendChild(instagramElement);
        }

        return exportContainer;
    }

    // Экспорт одного слайда
    async exportSingleSlide(slideIndex) {
        try {
            this.showToast('📸 Подготовка к экспорту...', 'info');
            
            // Загружаем html2canvas
            const html2canvas = await this.loadHtml2Canvas();
            
            // Создаем элемент для экспорта
            const exportElement = this.createExportSlide(slideIndex);
            document.body.appendChild(exportElement);
            
            // Ждем загрузки шрифтов и изображений
            await this.waitForFonts();
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.showToast('📷 Создание изображения...', 'info');
            
            // Создаем canvas
            const canvas = await html2canvas(exportElement, {
                width: 1080,
                height: 1080,
                scale: 1,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                logging: false
            });
            
            // Удаляем временный элемент
            document.body.removeChild(exportElement);
            
            // Конвертируем в JPEG и скачиваем
            const dataURL = canvas.toDataURL('image/jpeg', 0.95);
            this.downloadImage(dataURL, `slide-${slideIndex + 1}.jpg`);
            
            this.showToast('✅ Слайд экспортирован!', 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка экспорта слайда:', error);
            this.showToast('❌ Ошибка экспорта слайда', 'error');
            
            // Удаляем временный элемент если он остался
            const exportElement = document.querySelector('[style*="position: fixed"][style*="top: -2000px"]');
            if (exportElement) {
                document.body.removeChild(exportElement);
            }
        }
    }

    // Экспорт всех слайдов
    async exportAllSlides() {
        try {
            const totalSlides = this.project.slides.length;
            this.showToast(`📸 Экспорт ${totalSlides} слайдов...`, 'info');
            
            // Загружаем html2canvas
            const html2canvas = await this.loadHtml2Canvas();
            
            const exportedImages = [];
            
            for (let i = 0; i < totalSlides; i++) {
                this.showToast(`📷 Экспорт слайда ${i + 1}/${totalSlides}...`, 'info');
                
                // Создаем элемент для экспорта
                const exportElement = this.createExportSlide(i);
                document.body.appendChild(exportElement);
                
                // Ждем загрузки шрифтов
                await this.waitForFonts();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                try {
                    // Создаем canvas
                    const canvas = await html2canvas(exportElement, {
                        width: 1080,
                        height: 1080,
                        scale: 1,
                        backgroundColor: null,
                        useCORS: true,
                        allowTaint: true,
                        foreignObjectRendering: true,
                        logging: false
                    });
                    
                    // Конвертируем в JPEG
                    const dataURL = canvas.toDataURL('image/jpeg', 0.95);
                    exportedImages.push({
                        dataURL: dataURL,
                        filename: `slide-${i + 1}.jpg`
                    });
                    
                } catch (slideError) {
                    console.error(`❌ Ошибка экспорта слайда ${i + 1}:`, slideError);
                }
                
                // Удаляем временный элемент
                document.body.removeChild(exportElement);
                
                // Небольшая пауза между слайдами
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (exportedImages.length === 0) {
                throw new Error('Не удалось экспортировать ни одного слайда');
            }
            
            // Скачиваем все изображения
            this.showToast('💾 Скачивание файлов...', 'info');
            
            for (const image of exportedImages) {
                this.downloadImage(image.dataURL, image.filename);
                // Небольшая пауза между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            this.showToast(`✅ Экспортировано ${exportedImages.length} слайдов!`, 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка экспорта всех слайдов:', error);
            this.showToast('❌ Ошибка экспорта слайдов', 'error');
        }
    }

    // Скачивание изображения
    downloadImage(dataURL, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Скачан файл: ${filename}`);
    }

    // Экспорт текущего слайда (для кнопки в редакторе)
    async exportCurrentSlide() {
        await this.exportSingleSlide(this.currentEditingSlide);
    }

    // ===== СИСТЕМА ШАБЛОНОВ =====

    // Сохранение текущего стиля как шаблона
    saveCurrentStyleAsTemplate() {
        const templateName = prompt('Введите название шаблона:');
        if (!templateName || templateName.trim() === '') {
            this.showToast('❌ Название шаблона не может быть пустым', 'error');
            return;
        }

        const currentStyle = this.slideStyles[this.currentEditingSlide];
        const template = {
            id: Date.now().toString(),
            name: templateName.trim(),
            createdAt: new Date().toISOString(),
            style: {
                backgroundColor: currentStyle.backgroundColor,
                backgroundImage: currentStyle.backgroundImage,
                brightness: currentStyle.brightness,
                positionX: currentStyle.positionX,
                positionY: currentStyle.positionY,
                fontFamily: currentStyle.fontFamily,
                fontSize: currentStyle.fontSize,
                textColor: currentStyle.textColor,
                textBlocks: currentStyle.textBlocks.map(block => ({
                    ...block,
                    // Убираем позиции из шаблона - они должны оставаться индивидуальными
                    position: { x: 50, y: 50 },
                    width: 60
                }))
            }
        };

        this.saveTemplate(template);
        this.showToast(`✅ Шаблон "${templateName}" сохранен!`, 'success');
        this.hapticFeedback();
    }

    // Сохранение шаблона в localStorage
    saveTemplate(template) {
        try {
            const templates = this.getTemplates();
            templates.push(template);
            localStorage.setItem('flashpost_templates', JSON.stringify(templates));
            console.log('✅ Шаблон сохранен:', template.name);
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            this.showToast('❌ Ошибка сохранения шаблона', 'error');
        }
    }

    // Получение всех шаблонов из localStorage
    getTemplates() {
        try {
            const templates = localStorage.getItem('flashpost_templates');
            return templates ? JSON.parse(templates) : [];
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблонов:', error);
            return [];
        }
    }

    // Удаление шаблона
    deleteTemplate(templateId) {
        try {
            const templates = this.getTemplates();
            const filteredTemplates = templates.filter(t => t.id !== templateId);
            localStorage.setItem('flashpost_templates', JSON.stringify(filteredTemplates));
            console.log('✅ Шаблон удален:', templateId);
            this.showToast('✅ Шаблон удален', 'success');
        } catch (error) {
            console.error('❌ Ошибка удаления шаблона:', error);
            this.showToast('❌ Ошибка удаления шаблона', 'error');
        }
    }

    // Применение шаблона к текущему слайду
    applyTemplateToCurrentSlide(template) {
        const currentSlide = this.currentEditingSlide;
        const style = template.style;

        // Применяем стили фона
        this.slideStyles[currentSlide].backgroundColor = style.backgroundColor;
        this.slideStyles[currentSlide].backgroundImage = style.backgroundImage;
        this.slideStyles[currentSlide].brightness = style.brightness || 100;
        this.slideStyles[currentSlide].positionX = style.positionX || 0;
        this.slideStyles[currentSlide].positionY = style.positionY || 0;

        // Применяем стили шрифта
        this.slideStyles[currentSlide].fontFamily = style.fontFamily;
        this.slideStyles[currentSlide].fontSize = style.fontSize;
        this.slideStyles[currentSlide].textColor = style.textColor;

        // Заменяем текстовые блоки (сохраняя текущие позиции)
        if (style.textBlocks && style.textBlocks.length > 0) {
            const existingPositions = this.slideStyles[currentSlide].textBlocks.map(block => ({
                id: block.id,
                position: block.position,
                width: block.width
            }));

            this.slideStyles[currentSlide].textBlocks = style.textBlocks.map((templateBlock, index) => {
                const existingPos = existingPositions[index];
                return {
                    ...templateBlock,
                    id: existingPos ? existingPos.id : this.generateTextBlockId(),
                    position: existingPos ? existingPos.position : { x: 50 + (index * 10), y: 50 + (index * 10) },
                    width: existingPos ? existingPos.width : 60,
                    text: this.slides[currentSlide]?.text || templateBlock.text
                };
            });
        }

        this.updateEditorSlide();
        this.updatePreview();
        this.updateTextBlocksList();
        this.updateTextBlockControls();
    }

    // Применение шаблона ко всем слайдам
    applyTemplateToAllSlides(template) {
        const style = template.style;

        this.slideStyles.forEach((slideStyle, index) => {
            // Применяем стили фона
            slideStyle.backgroundColor = style.backgroundColor;
            slideStyle.backgroundImage = style.backgroundImage;
            slideStyle.brightness = style.brightness || 100;
            slideStyle.positionX = style.positionX || 0;
            slideStyle.positionY = style.positionY || 0;

            // Применяем стили шрифта
            slideStyle.fontFamily = style.fontFamily;
            slideStyle.fontSize = style.fontSize;
            slideStyle.textColor = style.textColor;

            // Обновляем текстовые блоки (сохраняя позиции)
            if (style.textBlocks && style.textBlocks.length > 0) {
                const existingPositions = slideStyle.textBlocks.map(block => ({
                    id: block.id,
                    position: block.position,
                    width: block.width
                }));

                slideStyle.textBlocks = style.textBlocks.map((templateBlock, blockIndex) => {
                    const existingPos = existingPositions[blockIndex];
                    return {
                        ...templateBlock,
                        id: existingPos ? existingPos.id : this.generateTextBlockId(),
                        position: existingPos ? existingPos.position : { x: 50 + (blockIndex * 10), y: 50 + (blockIndex * 10) },
                        width: existingPos ? existingPos.width : 60,
                        text: this.slides[index]?.text || templateBlock.text
                    };
                });
            }
        });

        this.updateEditorSlide();
        this.updatePreview();
        this.updateTextBlocksList();
        this.updateTextBlockControls();
    }

    // Показ модального окна со списком шаблонов
    showTemplatesModal() {
        const templates = this.getTemplates();
        
        if (templates.length === 0) {
            this.showToast('📝 Сначала сохраните шаблон', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'templates-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>📋 Мои шаблоны</h3>
                    <button class="modal-close" id="closeTemplatesModal">×</button>
                </div>
                <div class="modal-body">
                    <div class="templates-list">
                        ${templates.map(template => `
                            <div class="template-item" data-template-id="${template.id}">
                                <div class="template-preview">
                                    <div class="template-preview-slide" style="
                                        background: ${template.style.backgroundColor || '#ffffff'};
                                        ${template.style.backgroundImage ? `background-image: url(${template.style.backgroundImage}); background-size: cover; background-position: center;` : ''}
                                        font-family: ${template.style.fontFamily || 'Inter'};
                                        color: ${template.style.textColor || '#000000'};
                                    ">
                                        <div class="template-preview-text">Aa</div>
                                    </div>
                                </div>
                                <div class="template-info">
                                    <div class="template-name">${template.name}</div>
                                    <div class="template-date">${new Date(template.createdAt).toLocaleDateString('ru-RU')}</div>
                                </div>
                                <div class="template-actions">
                                    <button class="template-btn apply-current" data-template-id="${template.id}">
                                        📄 К текущему
                                    </button>
                                    <button class="template-btn apply-all" data-template-id="${template.id}">
                                        📋 Ко всем
                                    </button>
                                    <button class="template-btn delete" data-template-id="${template.id}">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="templatesCancel">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчики событий
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        // Закрытие модального окна
        modal.querySelector('#closeTemplatesModal').addEventListener('click', closeModal);
        modal.querySelector('#templatesCancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

        // Применение шаблона к текущему слайду
        modal.querySelectorAll('.apply-current').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.getAttribute('data-template-id');
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    this.applyTemplateToCurrentSlide(template);
                    this.showToast(`✅ Шаблон "${template.name}" применен к текущему слайду`, 'success');
                    this.hapticFeedback();
                }
                closeModal();
            });
        });

        // Применение шаблона ко всем слайдам
        modal.querySelectorAll('.apply-all').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.getAttribute('data-template-id');
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    if (confirm(`Применить шаблон "${template.name}" ко всем слайдам? Это изменит дизайн всех слайдов.`)) {
                        this.applyTemplateToAllSlides(template);
                        this.showToast(`✅ Шаблон "${template.name}" применен ко всем слайдам`, 'success');
                        this.hapticFeedback();
                    }
                }
                closeModal();
            });
        });

        // Удаление шаблона
        modal.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.getAttribute('data-template-id');
                const template = templates.find(t => t.id === templateId);
                if (template) {
                    if (confirm(`Удалить шаблон "${template.name}"?`)) {
                        this.deleteTemplate(templateId);
                        closeModal();
                        // Обновляем модальное окно
                        setTimeout(() => {
                            this.showTemplatesModal();
                        }, 100);
                    }
                }
            });
        });

        // Закрытие по Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // ===== ПРИМЕНЕНИЕ КО ВСЕМ СЛАЙДАМ =====

    // Применение изменений фона ко всем слайдам
    applyBackgroundToAllSlides(sourceSlideIndex) {
        if (!this.applyToAll) return;
        
        const sourceStyles = this.slideStyles[sourceSlideIndex];
        
        this.slideStyles.forEach((slideStyle, index) => {
            if (index !== sourceSlideIndex) {
                // Копируем только свойства фона
                slideStyle.backgroundColor = sourceStyles.backgroundColor;
                slideStyle.backgroundImage = sourceStyles.backgroundImage;
                slideStyle.brightness = sourceStyles.brightness;
                slideStyle.positionX = sourceStyles.positionX;
                slideStyle.positionY = sourceStyles.positionY;
            }
        });
        
        console.log('✅ Фон применен ко всем слайдам');
    }

    // Применение изменений шрифта ко всем слайдам
    applyFontToAllSlides(sourceSlideIndex, property, value) {
        if (!this.applyToAll) return;
        
        this.slideStyles.forEach((slideStyle, index) => {
            if (index !== sourceSlideIndex) {
                // Применяем изменение шрифта ко всем текстовым блокам
                slideStyle.textBlocks.forEach(block => {
                    if (property === 'font') {
                        block.font = value;
                    } else if (property === 'size') {
                        block.size = value;
                    } else if (property === 'weight') {
                        block.weight = value;
                    } else if (property === 'color') {
                        block.color = value;
                    } else if (property === 'glow') {
                        block.glow = value;
                    } else if (property === 'keywordColor') {
                        block.keywordColor = value;
                    }
                    // НЕ копируем position и width - они остаются индивидуальными
                });
                
                // Также обновляем старые свойства для совместимости
                if (property === 'font') {
                    slideStyle.fontFamily = value;
                } else if (property === 'size') {
                    slideStyle.fontSize = value;
                } else if (property === 'color') {
                    slideStyle.textColor = value;
                }
            }
        });
        
        console.log(`✅ Свойство ${property} применено ко всем слайдам:`, value);
    }

    // Применение эффектов ко всем слайдам
    applyEffectsToAllSlides(sourceSlideIndex, property, value) {
        if (!this.applyToAll) return;
        
        this.slideStyles.forEach((slideStyle, index) => {
            if (index !== sourceSlideIndex) {
                slideStyle.textBlocks.forEach(block => {
                    if (property === 'glow') {
                        block.glow = value;
                    } else if (property === 'isKeyword') {
                        block.isKeyword = value;
                    } else if (property === 'keywordColor') {
                        block.keywordColor = value;
                    } else if (property === 'highlightEnabled') {
                        block.highlightEnabled = value;
                    }
                });
            }
        });
        
        console.log(`✅ Эффект ${property} применен ко всем слайдам:`, value);
    }

    // Настройка свайп навигации для редактора
    setupEditorSwipeNavigation() {
        const slidePreview = document.getElementById('slidePreview');
        if (!slidePreview) return;

        let startX = 0;
        let startY = 0;

        slidePreview.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        slidePreview.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousEditorSlide();
                } else {
                    this.nextEditorSlide();
                }
            }
        }, { passive: true });
        
        console.log('✅ Swipe navigation для редактора настроен');
    }

    // Настройка свайп навигации для всего редактора
    setupFullEditorSwipeNavigation() {
        const editorContent = document.getElementById('editorSection');
        if (!editorContent) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        editorContent.addEventListener('touchstart', (e) => {
            // Игнорируем если касание на кнопках или полях ввода
            if (e.target.tagName === 'BUTTON' || 
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('.editor-actions') ||
                e.target.closest('.editor-tools')) {
                return;
            }
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        editorContent.addEventListener('touchend', (e) => {
            // Игнорируем если касание на кнопках или полях ввода
            if (e.target.tagName === 'BUTTON' || 
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('.editor-actions') ||
                e.target.closest('.editor-tools')) {
                return;
            }
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Проверяем, что это быстрый горизонтальный свайп
            if (Math.abs(deltaX) > Math.abs(deltaY) && 
                Math.abs(deltaX) > 80 && 
                deltaTime < 400) {
                
                console.log('Full editor swipe detected:', deltaX > 0 ? 'right' : 'left');
                
                if (deltaX > 0) {
                    this.previousEditorSlide();
                } else {
                    this.nextEditorSlide();
                }
            }
        }, { passive: true });
        
        console.log('✅ Full editor swipe navigation настроен');
    }

    // Навигация в редакторе
    previousEditorSlide() {
        console.log(`⬅️ previousEditorSlide called, current: ${this.currentEditingSlide}`);
        if (this.currentEditingSlide > 0) {
            this.currentEditingSlide--;
            console.log(`⬅️ Moving to slide ${this.currentEditingSlide}`);
            this.updateEditorSlide();
        } else {
            console.log('⬅️ Already at first slide');
        }
    }

    nextEditorSlide() {
        console.log(`➡️ nextEditorSlide called, current: ${this.currentEditingSlide}`);
        if (this.currentEditingSlide < this.slides.length - 1) {
            this.currentEditingSlide++;
            console.log(`➡️ Moving to slide ${this.currentEditingSlide}`);
            this.updateEditorSlide();
        } else {
            console.log('➡️ Already at last slide');
        }
    }

    // Обновление слайда в редакторе без перерисовки
    updateEditorSlide() {
        console.log(`🔄 updateEditorSlide called, currentEditingSlide: ${this.currentEditingSlide}`);
        
        if (!this.slides || !this.slideStyles) {
            console.error('❌ Slides or slideStyles not found');
            return;
        }
        
        const currentSlide = this.slides[this.currentEditingSlide];
        const currentStyles = this.slideStyles[this.currentEditingSlide];
        
        if (!currentSlide || !currentStyles) {
            console.error('❌ Current slide or styles not found');
            return;
        }
        
        console.log(`📝 Updating to slide: "${currentSlide.text.substring(0, 30)}..."`);
        
        // Обновляем счетчик
        const editorCounter = document.getElementById('editorCounter');
        if (editorCounter) {
            editorCounter.textContent = `${this.currentEditingSlide + 1}/${this.slides.length}`;
            console.log('✅ Counter updated to:', editorCounter.textContent);
        } else {
            console.warn('⚠️ Editor counter not found');
        }
        
        // Обновляем кнопки навигации в хедере
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        if (editorPrevBtn) {
            editorPrevBtn.disabled = this.currentEditingSlide === 0;
            console.log(`✅ Editor prev button disabled: ${editorPrevBtn.disabled}`);
        } else {
            console.warn('⚠️ Editor prev button not found');
        }
        if (editorNextBtn) {
            editorNextBtn.disabled = this.currentEditingSlide === this.slides.length - 1;
            console.log(`✅ Editor next button disabled: ${editorNextBtn.disabled}`);
        } else {
            console.warn('⚠️ Editor next button not found');
        }
        
        // Обновляем кнопки навигации у превью
        const previewPrev = document.getElementById('previewPrev');
        const previewNext = document.getElementById('previewNext');
        if (previewPrev) {
            previewPrev.disabled = this.currentEditingSlide === 0;
            console.log(`✅ Preview prev button disabled: ${previewPrev.disabled}`);
        } else {
            console.warn('⚠️ Preview prev button not found');
        }
        if (previewNext) {
            previewNext.disabled = this.currentEditingSlide === this.slides.length - 1;
            console.log(`✅ Preview next button disabled: ${previewNext.disabled}`);
        } else {
            console.warn('⚠️ Preview next button not found');
        }
        
        // Обновляем текстовый редактор
        const textEditor = document.getElementById('textEditor');
        if (textEditor) {
            textEditor.value = currentSlide.text;
            console.log('✅ Text editor updated with:', currentSlide.text.substring(0, 30) + '...');
        } else {
            console.warn('⚠️ Text editor not found');
        }
        
        // Обновляем слайдер размера шрифта
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = currentStyles.fontSize;
            fontSizeValue.textContent = currentStyles.fontSize + 'px';
            console.log('✅ Font size slider updated to:', currentStyles.fontSize);
        } else {
            console.warn('⚠️ Font size controls not found');
        }
        
        // Обновляем активные кнопки шрифтов
        const fontButtons = document.querySelectorAll('[data-font]');
        console.log(`🎯 Found ${fontButtons.length} font buttons`);
        fontButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-font') === currentStyles.fontFamily;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                console.log('✅ Font button activated:', currentStyles.fontFamily);
            }
        });
        
        // Обновляем активные кнопки цветов
        const colorButtons = document.querySelectorAll('[data-bg]');
        console.log(`🎯 Found ${colorButtons.length} color buttons`);
        colorButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-bg') === currentStyles.backgroundColor;
            btn.classList.toggle('active', isActive);
            if (isActive) {
                console.log('✅ Color button activated:', currentStyles.backgroundColor);
            }
        });
        
        // Обновляем индикаторы
        const indicators = document.querySelectorAll('.editor-indicator');
        console.log(`🎯 Found ${indicators.length} indicators`);
        indicators.forEach((indicator, index) => {
            const isActive = index === this.currentEditingSlide;
            indicator.classList.toggle('active', isActive);
            if (isActive) {
                console.log('✅ Indicator activated:', index);
            }
        });
        
        // Обновляем переключатели типа фона
        const bgTypeButtons = document.querySelectorAll('[data-bg-type]');
        const colorSection = document.querySelector('.bg-color-section');
        const imageSection = document.querySelector('.bg-image-section');
        
        if (currentStyles.backgroundImage) {
            // Активируем режим изображения
            bgTypeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-bg-type') === 'image');
            });
            colorSection?.classList.add('hidden');
            imageSection?.classList.remove('hidden');
            
            // Обновляем контролы изображения
            const brightnessSlider = document.getElementById('brightnessSlider');
            const brightnessValue = document.getElementById('brightnessValue');
            const positionXSlider = document.getElementById('positionXSlider');
            const positionXValue = document.getElementById('positionXValue');
            const positionYSlider = document.getElementById('positionYSlider');
            const positionYValue = document.getElementById('positionYValue');
            
            if (brightnessSlider && brightnessValue) {
                brightnessSlider.value = currentStyles.brightness || 100;
                brightnessValue.textContent = (currentStyles.brightness || 100) + '%';
            }
            
            if (positionXSlider && positionXValue) {
                positionXSlider.value = currentStyles.positionX || 0;
                positionXValue.textContent = (currentStyles.positionX || 0) + '%';
            }
            
            if (positionYSlider && positionYValue) {
                positionYSlider.value = currentStyles.positionY || 0;
                positionYValue.textContent = (currentStyles.positionY || 0) + '%';
            }
            
            console.log('✅ Background image controls updated');
        } else {
            // Активируем режим цвета
            bgTypeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-bg-type') === 'color');
            });
            colorSection?.classList.remove('hidden');
            imageSection?.classList.add('hidden');
            
            console.log('✅ Background color mode activated');
        }
        
        // Обновляем превью
        this.updatePreview();
        
        // Обновляем список текстовых блоков и контролы
        this.updateTextBlocksList();
        this.updateTextBlockControls();
        
        // Haptic feedback
        this.hapticFeedback();
        
        console.log(`✅ Переключен на слайд ${this.currentEditingSlide + 1} из ${this.slides.length}`);
    }

    // Обновление превью
    // Обновление превью с учетом текущего режима
    updatePreview() {
        const slidePreview = document.getElementById('slidePreview');
        const previewText = document.getElementById('previewText');
        
        if (!slidePreview || !previewText) {
            console.warn('⚠️ Preview elements not found');
            return;
        }
        
        const currentSlide = this.slides[this.currentEditingSlide];
        const currentStyles = this.slideStyles[this.currentEditingSlide];
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const isFirstSlide = this.currentEditingSlide === 0;
        const isLastSlide = this.currentEditingSlide === this.slides.length - 1;
        const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;
        
        // Определяем режим интерактивности
        const isInteractiveMode = this.isMode("edit");
        const isStaticMode = this.isMode("preview") || this.isMode("export");
        
        // Скрываем старый текст
        previewText.style.display = 'none';
        
        // Обновляем фон
        if (currentStyles.backgroundImage) {
            // Фоновое изображение
            const brightness = currentStyles.brightness || 100;
            const positionX = currentStyles.positionX || 0;
            const positionY = currentStyles.positionY || 0;
            
            slidePreview.style.backgroundImage = `url(${currentStyles.backgroundImage})`;
            slidePreview.style.backgroundSize = 'cover';
            slidePreview.style.backgroundRepeat = 'no-repeat';
            slidePreview.style.backgroundPosition = `${50 + positionX}% ${50 + positionY}%`;
            slidePreview.style.filter = `brightness(${brightness}%)`;
            slidePreview.style.backgroundColor = 'transparent';
        } else {
            // Цветной фон
            slidePreview.style.backgroundImage = 'none';
            slidePreview.style.backgroundColor = currentStyles.backgroundColor;
            slidePreview.style.filter = 'none';
        }
        
        // Удаляем старые текстовые блоки
        const existingBlocks = slidePreview.querySelectorAll('.preview-text-block');
        existingBlocks.forEach(block => block.remove());
        
        // Добавляем текстовые блоки из основной структуры
        const currentTextBlocks = this.getCurrentTextBlocks();
        if (currentTextBlocks && currentTextBlocks.length > 0) {
            currentTextBlocks.forEach(block => {
                const blockElement = document.createElement('div');
                blockElement.className = 'preview-text-block';
                blockElement.setAttribute('data-block-id', block.id);
                
                // Применяем стили
                blockElement.style.position = 'absolute';
                blockElement.style.left = block.position.x + '%';
                blockElement.style.top = block.position.y + '%';
                blockElement.style.width = block.width + '%';
                blockElement.style.fontSize = block.size + 'px';
                blockElement.style.fontFamily = block.font;
                blockElement.style.fontWeight = block.weight;
                blockElement.style.color = block.color;
                blockElement.style.textAlign = 'center';
                blockElement.style.userSelect = 'none';
                blockElement.style.lineHeight = '1.2';
                blockElement.style.wordWrap = 'break-word';
                blockElement.style.transform = 'translate(-50%, -50%)';
                blockElement.style.zIndex = '10';
                
                // Курсор зависит от режима
                blockElement.style.cursor = isInteractiveMode ? 'grab' : 'default';
                
                if (block.glow) {
                    // Glow теперь применяется только к ключевым словам через parseTextWithKeywords
                    blockElement.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
                } else {
                    blockElement.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
                }
                
                if (block.isKeyword) {
                    blockElement.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
                    blockElement.style.webkitBackgroundClip = 'text';
                    blockElement.style.webkitTextFillColor = 'transparent';
                    blockElement.style.backgroundClip = 'text';
                }
                
                // Выделяем выбранный блок только в интерактивном режиме
                if (isInteractiveMode && this.selectedTextBlockId === block.id) {
                    blockElement.classList.add('text-block-selected');
                } else {
                    blockElement.classList.remove('text-block-selected');
                }
                
                // Добавляем hover эффекты только в интерактивном режиме
                if (isInteractiveMode) {
                    blockElement.addEventListener('mouseenter', () => {
                        if (this.selectedTextBlockId !== block.id) {
                            blockElement.classList.add('text-block-hover');
                            blockElement.title = 'Клик - выбрать, двойной клик - редактировать';
                        }
                    });
                    
                    blockElement.addEventListener('mouseleave', () => {
                        blockElement.classList.remove('text-block-hover');
                    });
                }
                
                // Парсим текст с ключевыми словами
                const autoKeywords = (block.autoHighlight !== false) ? (this.slides[this.currentEditingSlide].autoKeywords || []) : [];
                const parsedText = this.parseTextWithKeywords(block.text, block.keywordColor || '#ff6b6b', block.highlightEnabled !== false, autoKeywords, block.glow);
                blockElement.innerHTML = parsedText;
                
                // Добавляем ручку для изменения размера только в интерактивном режиме
                if (isInteractiveMode) {
                    const resizeHandle = document.createElement('div');
                    resizeHandle.className = 'text-block-resize-handle';
                    resizeHandle.style.position = 'absolute';
                    resizeHandle.style.bottom = '-5px';
                    resizeHandle.style.right = '-5px';
                    resizeHandle.style.width = '10px';
                    resizeHandle.style.height = '10px';
                    resizeHandle.style.background = 'rgba(255, 255, 255, 0.8)';
                    resizeHandle.style.border = '1px solid rgba(0, 0, 0, 0.3)';
                    resizeHandle.style.borderRadius = '50%';
                    resizeHandle.style.cursor = 'se-resize';
                    // Показываем resize handle только для выбранного блока
                    resizeHandle.style.display = (this.selectedTextBlockId === block.id) ? 'block' : 'none';
                    
                    blockElement.appendChild(resizeHandle);
                }
                
                // Обработчики событий только в интерактивном режиме
                if (isInteractiveMode) {
                    // Обработчик клика для выбора блока
                    blockElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.selectTextBlock(block.id);
                    });
                    
                    // Обработчик двойного клика для inline-редактирования
                    blockElement.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        this.startInlineTextEditing(blockElement, block.id);
                    });
                    
                    // Инициализируем перетаскивание и изменение размера
                    this.initTextBlockDragging(blockElement, block.id);
                    this.initTextBlockResizing(blockElement, block.id);
                }
                
                slidePreview.appendChild(blockElement);
            });
        }
        
        // Удаляем старый Instagram элемент если есть
        const existingInstagram = slidePreview.querySelector('.preview-instagram');
        if (existingInstagram) {
            existingInstagram.remove();
        }
        
        // Добавляем Instagram если нужно
        if (showInstagram) {
            const instagramElement = document.createElement('div');
            instagramElement.className = 'preview-instagram';
            instagramElement.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                    <circle cx="12" cy="12" r="3"/>
                    <circle cx="17.5" cy="6.5" r="1.5"/>
                </svg>
                ${instagramContact}
            `;
            slidePreview.appendChild(instagramElement);
        }
        
        // Добавляем кнопку быстрого добавления текста
        this.addQuickAddTextButton(slidePreview);
    }

    // ===== UI МЕТОДЫ ДЛЯ ТЕКСТОВЫХ БЛОКОВ =====

    // Обновление списка текстовых блоков в редакторе
    updateTextBlocksList() {
        const textBlocksList = document.getElementById('textBlocksList');
        if (!textBlocksList) return;
        
        const currentTextBlocks = this.getCurrentTextBlocks();
        
        textBlocksList.innerHTML = '';
        
        if (currentTextBlocks.length === 0) {
            textBlocksList.innerHTML = `
                <div class="no-blocks-message">
                    <p>Нет текстовых блоков</p>
                    <p>Нажмите "Добавить блок" для создания</p>
                </div>
            `;
            return;
        }
        
        currentTextBlocks.forEach((block, index) => {
            const blockItem = document.createElement('div');
            blockItem.className = `text-block-item ${this.selectedTextBlockId === block.id ? 'active' : ''}`;
            
            const cleanText = this.getCleanText(block.text);
            const keywordCount = this.countKeywords(block.text);
            
            blockItem.innerHTML = `
                <div class="block-info">
                    <div class="block-preview" style="font-family: ${block.font}; font-size: 12px; color: ${block.color};">
                        <span class="block-number">${index + 1}.</span>
                        ${cleanText.substring(0, 25)}${cleanText.length > 25 ? '...' : ''}
                        ${keywordCount > 0 ? `<span class="keyword-count" style="color: ${block.keywordColor || '#ff6b6b'};">*${keywordCount}</span>` : ''}
                    </div>
                    <div class="block-details">
                        <span class="block-font">${block.font}</span>
                        <span class="block-size">${block.size}px</span>
                        <span class="block-position">${Math.round(block.position.x)}%, ${Math.round(block.position.y)}%</span>
                    </div>
                </div>
                <div class="block-actions">
                    <button class="block-action-btn select ${this.selectedTextBlockId === block.id ? 'active' : ''}" 
                            onclick="app.selectTextBlock('${block.id}')" title="Выбрать блок">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11H1l2-2m0 4l-2-2m8 0l3 3 7-7"/>
                        </svg>
                    </button>
                    ${currentTextBlocks.length > 1 ? `
                        <button class="block-action-btn delete" onclick="app.deleteTextBlock('${block.id}')" title="Удалить блок">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Добавляем обработчик клика на весь элемент для выбора
            blockItem.addEventListener('click', (e) => {
                if (!e.target.closest('.block-actions')) {
                    this.selectTextBlock(block.id);
                }
            });
            
            textBlocksList.appendChild(blockItem);
        });
    }

    // Обновление контролов для выбранного текстового блока
    updateTextBlockControls() {
        const selectedBlock = this.getSelectedTextBlock();
        
        // Показываем/скрываем панель контролов
        const selectedBlockControls = document.querySelector('.selected-block-controls');
        if (selectedBlockControls) {
            selectedBlockControls.style.display = selectedBlock ? 'block' : 'none';
        }
        
        if (!selectedBlock) {
            console.log('ℹ️ Нет выбранного блока для обновления контролов');
            return;
        }
        
        console.log('🔄 Обновляем контролы для блока:', selectedBlock.id);
        
        // Обновляем текстовое поле
        const blockTextEditor = document.getElementById('blockTextEditor');
        if (blockTextEditor && blockTextEditor.value !== selectedBlock.text) {
            blockTextEditor.value = selectedBlock.text;
        }
        
        // Обновляем слайдер размера
        const blockSizeSlider = document.getElementById('blockSizeSlider');
        const blockSizeValue = document.getElementById('blockSizeValue');
        if (blockSizeSlider && blockSizeValue) {
            blockSizeSlider.value = selectedBlock.size;
            blockSizeValue.textContent = selectedBlock.size + 'px';
        }
        
        // Обновляем слайдер веса шрифта
        const blockWeightSlider = document.getElementById('blockWeightSlider');
        const blockWeightValue = document.getElementById('blockWeightValue');
        if (blockWeightSlider && blockWeightValue) {
            blockWeightSlider.value = selectedBlock.weight;
            blockWeightValue.textContent = selectedBlock.weight;
        }
        
        // Обновляем слайдер ширины
        const blockWidthSlider = document.getElementById('blockWidthSlider');
        const blockWidthValue = document.getElementById('blockWidthValue');
        if (blockWidthSlider && blockWidthValue) {
            blockWidthSlider.value = selectedBlock.width;
            blockWidthValue.textContent = selectedBlock.width + '%';
        }
        
        // Обновляем кнопки шрифта
        const blockFontButtons = document.querySelectorAll('[data-block-font]');
        blockFontButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-block-font') === selectedBlock.font);
        });
        
        // Обновляем кнопки цвета текста
        const blockColorButtons = document.querySelectorAll('[data-block-color]');
        blockColorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-block-color') === selectedBlock.color);
        });
        
        // Обновляем кнопки цвета ключевых слов
        const keywordColorButtons = document.querySelectorAll('[data-keyword-color]');
        keywordColorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-keyword-color') === (selectedBlock.keywordColor || '#ff6b6b'));
        });
        
        // Обновляем чекбокс подсветки
        const highlightEnabledCheckbox = document.getElementById('highlightEnabledCheckbox');
        if (highlightEnabledCheckbox) {
            highlightEnabledCheckbox.checked = selectedBlock.highlightEnabled !== false;
        }
        
        // Обновляем чекбокс авто-подсветки
        const autoHighlightCheckbox = document.getElementById('autoHighlightCheckbox');
        if (autoHighlightCheckbox) {
            autoHighlightCheckbox.checked = selectedBlock.autoHighlight !== false;
        }
        
        // Обновляем чекбокс свечения
        const blockGlowCheckbox = document.getElementById('blockGlowCheckbox');
        if (blockGlowCheckbox) {
            blockGlowCheckbox.checked = selectedBlock.glow === true;
        }
        
        // Обновляем чекбокс ключевого слова (градиент)
        const blockKeywordCheckbox = document.getElementById('blockKeywordCheckbox');
        if (blockKeywordCheckbox) {
            blockKeywordCheckbox.checked = selectedBlock.isKeyword === true;
        }
        
        console.log('✅ Контролы обновлены для блока:', selectedBlock.id);
    }
            blockGlowCheckbox.checked = selectedBlock.glow;
        }
        
        const blockKeywordCheckbox = document.getElementById('blockKeywordCheckbox');
        if (blockKeywordCheckbox) {
            blockKeywordCheckbox.checked = selectedBlock.isKeyword;
        }
        
        // Обновляем слайдер ширины
        const blockWidthSlider = document.getElementById('blockWidthSlider');
        const blockWidthValue = document.getElementById('blockWidthValue');
        if (blockWidthSlider && blockWidthValue) {
            blockWidthSlider.value = selectedBlock.width;
            blockWidthValue.textContent = selectedBlock.width + '%';
        }
    }

    // Сохранение шаблона
    saveTemplate() {
        try {
            const template = {
                id: Date.now(),
                name: `Шаблон ${new Date().toLocaleDateString()}`,
                slides: this.slides,
                slideStyles: this.slideStyles,
                createdAt: new Date().toISOString()
            };
            
            const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
            savedTemplates.push(template);
            localStorage.setItem('flashpost_templates', JSON.stringify(savedTemplates));
            
            this.showToast('✅ Шаблон сохранен!', 'success');
            this.hapticFeedback();
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            this.showToast('❌ Ошибка сохранения шаблона', 'error');
        }
    }

    // Сохранение и выход из редактора (для режимной системы)
    saveAndExitEditor() {
        this.exitEditor();
        this.showToast('✅ Изменения сохранены!', 'success');
    }

    // Сохранение и выход
    saveAndExit() {
        this.exitEditor();
        this.showToast('✅ Изменения сохранены!', 'success');
    }

    // Выход из редактора
    exitEditor() {
        // Просто возвращаемся в режим превью - активный слайд уже установлен
        this.enterPreviewMode();
        
        // Обновляем карусель с новыми данными
        setTimeout(() => {
            this.updateCarouselView();
        }, 100);
    }

    // Скачивание слайдов с помощью html2canvas
    async downloadSlides() {
        try {
            this.showToast('📥 Подготавливаем слайды для скачивания...', 'info');
            
            // Проверяем, загружен ли html2canvas
            if (typeof html2canvas === 'undefined') {
                // Динамически загружаем html2canvas
                await this.loadHtml2Canvas();
            }
            
            for (let i = 0; i < this.slides.length; i++) {
                await this.downloadSingleSlide(i);
                // Небольшая задержка между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            this.showToast('✅ Все слайды скачаны!', 'success');
            this.hapticFeedback('success');
            
        } catch (error) {
            console.error('❌ Ошибка скачивания:', error);
            this.showToast('❌ Ошибка скачивания слайдов', 'error');
        }
    }

    // Загрузка html2canvas библиотеки
    async loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                console.log('✅ html2canvas загружен');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Ошибка загрузки html2canvas');
                reject(new Error('Failed to load html2canvas'));
            };
            document.head.appendChild(script);
        });
    }

    // Скачивание одного слайда
    async downloadSingleSlide(slideIndex) {
        try {
            // Временно показываем нужный слайд
            const originalSlide = this.currentSlide;
            this.currentSlide = slideIndex;
            this.updateCarouselView();
            
            // Ждем завершения анимации
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Находим активный слайд
            const slideElement = document.querySelector('.slide.active');
            if (!slideElement) {
                throw new Error(`Slide ${slideIndex} not found`);
            }

            // Создаем временный контейнер для лучшего качества
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 1080px;
                height: 1080px;
                background: ${this.slideStyles[slideIndex]?.backgroundColor || '#833ab4'};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 60px;
                border-radius: 0;
                font-family: ${this.slideStyles[slideIndex]?.fontFamily || 'Inter'};
            `;

            // Копируем содержимое слайда
            const slide = this.slides[slideIndex];
            const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
            const isFirstSlide = slideIndex === 0;
            const isLastSlide = slideIndex === this.slides.length - 1;
            const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;

            tempContainer.innerHTML = `
                <div style="
                    color: white;
                    font-size: ${(this.slideStyles[slideIndex]?.fontSize || 16) * 3}px;
                    font-weight: 700;
                    text-align: center;
                    line-height: 1.4;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    max-width: 100%;
                    word-wrap: break-word;
                    position: relative;
                ">
                    ${slide.text}
                </div>
                <div style="
                    position: absolute;
                    top: 40px;
                    right: 40px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 16px;
                    font-size: 24px;
                    font-weight: 700;
                    backdrop-filter: blur(4px);
                ">
                    ${slideIndex + 1}/${this.slides.length}
                </div>
                ${showInstagram ? `
                    <div style="
                        position: absolute;
                        top: 40px;
                        left: 40px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 16px 24px;
                        border-radius: 32px;
                        font-size: 20px;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        backdrop-filter: blur(4px);
                    ">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                            <circle cx="12" cy="12" r="3"/>
                            <circle cx="17.5" cy="6.5" r="1.5"/>
                        </svg>
                        ${instagramContact}
                    </div>
                ` : ''}
            `;

            document.body.appendChild(tempContainer);

            // Используем html2canvas для создания изображения
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: null,
                scale: 1,
                useCORS: true,
                allowTaint: true,
                width: 1080,
                height: 1080,
                scrollX: 0,
                scrollY: 0
            });

            // Удаляем временный контейнер
            document.body.removeChild(tempContainer);

            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = `flashpost-slide-${slideIndex + 1}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            // Скачиваем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Возвращаем исходный слайд
            this.currentSlide = originalSlide;
            this.updateCarouselView();

            console.log(`✅ Слайд ${slideIndex + 1} скачан`);

        } catch (error) {
            console.error(`❌ Ошибка скачивания слайда ${slideIndex + 1}:`, error);
            throw error;
        }
    }

    // Скачивание текущего слайда
    async downloadCurrentSlide() {
        try {
            this.showToast('📥 Сохраняем слайд...', 'info');
            const activeSlideIndex = this.getActiveSlideIndex();
            await this.downloadSingleSlide(activeSlideIndex);
            this.showToast('✅ Слайд сохранен!', 'success');
            this.hapticFeedback('success');
        } catch (error) {
            console.error('❌ Ошибка сохранения слайда:', error);
            this.showToast('❌ Ошибка сохранения слайда', 'error');
        }
    }

    // Возврат назад
    goBack() {
        const app = document.getElementById('app');
        if (!app) return;

        // Сбрасываем единый источник истины
        this.project = {
            slides: [],
            activeSlideId: null,
            activeTextBlockId: null,
            mode: 'start'
        };
        
        app.innerHTML = this.renderStartScreen();
        this.bindStartEvents();
        this.loadQuickIdeas(); // Загружаем идеи после создания DOM
        
        if (this.tg) {
            this.tg.MainButton.setText('Создать карусель');
            this.tg.MainButton.onClick(() => this.handleGenerate());
            this.tg.BackButton.hide();
        }
    }

    // Открытие ручного ввода
    openManualInput() {
        this.showToast('Ручной ввод в разработке', 'info');
    }

    // Показ/скрытие загрузки
    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) return;

        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoader = generateBtn.querySelector('.btn-loader');
        
        if (show) {
            generateBtn.disabled = true;
            generateBtn.style.cursor = 'not-allowed';
            if (btnText) {
                btnText.style.opacity = '0';
                setTimeout(() => {
                    if (btnText) btnText.style.display = 'none';
                }, 150);
            }
            if (btnLoader) {
                btnLoader.style.display = 'flex';
                setTimeout(() => {
                    if (btnLoader) btnLoader.style.opacity = '1';
                }, 50);
            }
            
            // Добавляем пульсацию кнопки
            generateBtn.style.animation = 'pulse 2s infinite';
        } else {
            generateBtn.disabled = false;
            generateBtn.style.cursor = 'pointer';
            generateBtn.style.animation = '';
            
            if (btnLoader) {
                btnLoader.style.opacity = '0';
                setTimeout(() => {
                    if (btnLoader) btnLoader.style.display = 'none';
                }, 150);
            }
            if (btnText) {
                btnText.style.display = 'block';
                btnText.textContent = '🚀 Создать';
                setTimeout(() => {
                    if (btnText) btnText.style.opacity = '1';
                }, 50);
            }
        }
    }

    // Улучшенные уведомления
    showToast(message, type = 'info', duration = 3000) {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Haptic feedback для разных типов
        if (this.tg?.HapticFeedback) {
            switch (type) {
                case 'success':
                    this.tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'warning':
                    this.tg.HapticFeedback.notificationOccurred('warning');
                    break;
                default:
                    this.tg.HapticFeedback.impactOccurred('light');
            }
        }
        
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
            return;
        }

        // Удаляем предыдущие toast
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        // Создаем новый toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        const colors = {
            success: { bg: '#28a745', icon: '✅' },
            error: { bg: '#dc3545', icon: '❌' },
            warning: { bg: '#ffc107', icon: '⚠️' },
            info: { bg: '#17a2b8', icon: 'ℹ️' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            z-index: 10000;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            transform: translateX(100%) scale(0.8);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 300px;
            word-wrap: break-word;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        toast.innerHTML = `
            <span style="font-size: 16px;">${color.icon}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0) scale(1)';
        });
        
        // Автоматическое скрытие
        setTimeout(() => {
            toast.style.transform = 'translateX(100%) scale(0.8)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, duration);
        
        // Закрытие по клику
        toast.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%) scale(0.8)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        });
    }

    // Haptic feedback
    hapticFeedback(type = 'medium') {
        if (this.tg?.HapticFeedback) {
            switch (type) {
                case 'light':
                    this.tg.HapticFeedback.impactOccurred('light');
                    break;
                case 'heavy':
                    this.tg.HapticFeedback.impactOccurred('heavy');
                    break;
                case 'success':
                    this.tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'warning':
                    this.tg.HapticFeedback.notificationOccurred('warning');
                    break;
                default:
                    this.tg.HapticFeedback.impactOccurred('medium');
            }
        }
    }

    // Привязка событий
    bindEvents() {
        // Обработка видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('📱 Приложение стало видимым');
            }
        });

        // Обработка ошибок JavaScript
        window.addEventListener('error', (event) => {
            console.error('❌ JavaScript Error:', event.error);
            this.showToast('Произошла ошибка. Перезагрузите страницу.', 'error');
        });

        // Обработка необработанных промисов
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled Promise Rejection:', event.reason);
            this.showToast('Ошибка загрузки. Проверьте соединение.', 'error');
        });

        // Обработка потери соединения
        window.addEventListener('offline', () => {
            this.showToast('Соединение потеряно', 'warning');
        });

        window.addEventListener('online', () => {
            this.showToast('Соединение восстановлено', 'success');
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new FlashPostApp();
        console.log('✅ FlashPost App инициализирован');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
});

// Экспорт для глобального доступа
window.FlashPostApp = FlashPostApp;