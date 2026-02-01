// ===== FLASHPOST AI - ИСПРАВЛЕННАЯ ВЕРСИЯ =====

class FlashPostAppFixed {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        
        // === ИСПРАВЛЕННАЯ СТРУКТУРА ПРОЕКТА ===
        this.project = {
            slides: [],
            activeSlideId: null,
            activeTextBlockId: null,
            mode: 'start' // 'start' | 'preview' | 'edit' | 'export'
        };
        
        // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
        this.isGenerating = false;
        this.applyToAll = false;
        this.templates = {};
        
        // === СОСТОЯНИЕ DRAG & DROP ===
        this.dragState = {
            isDragging: false,
            isResizing: false,
            activeBlockId: null,
            startX: 0,
            startY: 0,
            startBlockX: 0,
            startBlockY: 0,
            startBlockWidth: 0,
            slideRect: null
        };
        
        console.log('🚀 Инициализация исправленного FlashPost AI...');
        this.init();
    }

    async init() {
        try {
            this.initTelegramWebApp();
            this.setupTheme();
            this.bindEvents();
            this.loadTemplates(); // Загружаем шаблоны
            
            setTimeout(() => {
                this.showApp();
            }, 500);
            
            console.log('✅ Исправленное приложение инициализировано');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    // ===== ИСПРАВЛЕНИЕ 1: НЕЗАВИСИМЫЕ ТЕКСТОВЫЕ БЛОКИ =====
    
    addTextBlock() {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return;
        
        const newBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            text: 'Новый текст',
            x: 50, y: 50, width: 80,
            font: 'Inter', size: 32, color: '#ffffff'
        };
        
        activeSlide.textBlocks.push(newBlock);
        this.project.activeTextBlockId = newBlock.id;
        
        console.log(`✅ Добавлен текстовый блок: ${newBlock.id}`);
        this.render();
    }
    
    getActiveSlide() {
        return this.project.slides.find(slide => slide.id === this.project.activeSlideId);
    }
    
    getActiveTextBlock() {
        if (!this.project.activeTextBlockId) return null;
        
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return null;
        
        return activeSlide.textBlocks.find(block => block.id === this.project.activeTextBlockId);
    }

    // ===== ИСПРАВЛЕНИЕ 2: DRAG & DROP БЕЗ ДЕРГАНИЯ =====
    
    handleMouseDown(e, blockId, isResize = false) {
        e.preventDefault();
        e.stopPropagation();
        
        const block = this.getBlockById(blockId);
        if (!block) return;
        
        const slideRect = document.querySelector('.slide-container').getBoundingClientRect();
        
        this.dragState = {
            isDragging: !isResize,
            isResizing: isResize,
            activeBlockId: blockId,
            startX: e.clientX,
            startY: e.clientY,
            startBlockX: block.x,
            startBlockY: block.y,
            startBlockWidth: block.width,
            slideRect: slideRect
        };
        
        console.log(`🎯 Начало ${isResize ? 'изменения размера' : 'перетаскивания'}: ${blockId}`);
    }
    
    handleMouseMove(e) {
        if (!this.dragState.isDragging && !this.dragState.isResizing) return;
        
        e.preventDefault();
        
        const block = this.getBlockById(this.dragState.activeBlockId);
        if (!block) return;
        
        const slideRect = this.dragState.slideRect;
        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;
        
        if (this.dragState.isDragging) {
            // ИСПРАВЛЕНО: Правильный пересчет в проценты
            const deltaXPercent = (deltaX / slideRect.width) * 100;
            const deltaYPercent = (deltaY / slideRect.height) * 100;
            
            let newX = this.dragState.startBlockX + deltaXPercent;
            let newY = this.dragState.startBlockY + deltaYPercent;
            
            // ИСПРАВЛЕНО: Ограничения границ
            newX = Math.max(0, Math.min(100 - block.width, newX));
            newY = Math.max(0, Math.min(100 - 15, newY));
            
            block.x = newX;
            block.y = newY;
            
        } else if (this.dragState.isResizing) {
            // ИСПРАВЛЕНО: Изменение размера в процентах
            const deltaWidthPercent = (deltaX / slideRect.width) * 100;
            let newWidth = this.dragState.startBlockWidth + deltaWidthPercent;
            
            const minWidth = 15;
            const maxWidth = 100 - block.x;
            
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
            block.width = newWidth;
        }
        
        this.render();
    }

    // ===== ИСПРАВЛЕНИЕ 3: СИСТЕМА КЛЮЧЕВЫХ СЛОВ =====
    
    async generateSlideWithKeywords(topic) {
        // Этап 1: Генерация текста
        const text = await this.generateSlideText(topic);
        
        // Этап 2: Извлечение ключевых слов
        const autoKeywords = await this.extractKeywords(text);
        
        // Создаем слайд с ключевыми словами
        const slide = {
            id: this.generateId(),
            text: text,
            autoKeywords: autoKeywords,
            manualKeywords: [],
            background: { color: this.getRandomColor() },
            textBlocks: [
                {
                    id: this.generateId(),
                    text: text,
                    x: 50, y: 50, width: 80,
                    font: 'Inter', size: 24, color: '#ffffff'
                }
            ]
        };
        
        return slide;
    }
    
    async generateSlideText(topic) {
        // Симуляция запроса к Gemini API
        const prompt = `Создай вирусный текст для слайда на тему: ${topic}`;
        return await this.callGeminiAPI(prompt);
    }
    
    async extractKeywords(text) {
        // Симуляция второго запроса к Gemini
        const prompt = `Extract 5–7 most important keywords from this text.
        Return as JSON array of strings.
        
        Text: ${text}`;
        
        const response = await this.callGeminiAPI(prompt);
        return JSON.parse(response);
    }
    
    parseTextWithKeywords(text, autoKeywords = [], manualKeywords = []) {
        if (!text) return '';
        
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

    // ===== ИСПРАВЛЕНИЕ 4: СИСТЕМА ШАБЛОНОВ =====
    
    saveTemplate(templateName) {
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return;
        
        const name = templateName || prompt('Название шаблона:', `Шаблон ${Object.keys(this.templates).length + 1}`);
        if (!name) return;
        
        const template = {
            id: `template_${Date.now()}`,
            name: name,
            background: this.clone(activeSlide.background),
            textBlocks: this.clone(activeSlide.textBlocks),
            createdAt: new Date().toISOString()
        };
        
        // ИСПРАВЛЕНО: Сохранение в localStorage
        localStorage.setItem(`template_${template.id}`, JSON.stringify(template));
        this.templates[template.id] = template;
        
        console.log('💾 Шаблон сохранен:', template.name);
        this.renderTemplates();
    }
    
    applyTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) return;
        
        const activeSlide = this.getActiveSlide();
        if (!activeSlide) return;
        
        // ИСПРАВЛЕНО: Глубокое клонирование
        activeSlide.textBlocks = this.clone(template.textBlocks);
        activeSlide.background = this.clone(template.background);
        
        this.project.activeTextBlockId = null;
        
        console.log('✅ Шаблон применен:', template.name);
        this.render();
    }
    
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
        
        console.log(`📋 Загружено шаблонов: ${Object.keys(this.templates).length}`);
    }

    // ===== ИСПРАВЛЕНИЕ 5: ЧИСТЫЙ ЭКСПОРТ =====
    
    async setMode(newMode) {
        const validModes = ['start', 'preview', 'edit', 'export'];
        
        if (!validModes.includes(newMode)) {
            console.error(`❌ Недопустимый режим: ${newMode}`);
            return false;
        }
        
        const oldMode = this.project.mode;
        this.project.mode = newMode;
        
        console.log(`🔄 Режим изменен: ${oldMode} → ${newMode}`);
        
        this.updateModeUI();
        await this.nextTick();
        
        console.log(`✅ Режим ${newMode} активирован`);
        return true;
    }
    
    async handleExport() {
        try {
            console.log('📤 Начало экспорта слайдов');
            this.showLoading('Подготовка к экспорту...');
            
            // ИСПРАВЛЕНО: Переключаемся в режим экспорта
            await this.setMode('export');
            
            // ИСПРАВЛЕНО: Ждем рендеринга чистых слайдов
            await this.nextTick();
            await this.delay(100);
            
            // Экспортируем каждый слайд
            const exportedImages = [];
            
            for (let i = 0; i < this.project.slides.length; i++) {
                this.showLoading(`Экспорт слайда ${i + 1}...`);
                
                const imageData = await this.exportSlide(i);
                exportedImages.push(imageData);
            }
            
            // Возвращаемся в режим превью
            await this.setMode('preview');
            
            this.hideLoading();
            this.showExportResults(exportedImages);
            
            console.log('🎉 Экспорт завершен!');
            
        } catch (error) {
            this.hideLoading();
            console.error('❌ Ошибка экспорта:', error);
            await this.setMode('preview');
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    nextTick() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Заглушки для методов (нужно реализовать полностью)
    initTelegramWebApp() { /* ... */ }
    setupTheme() { /* ... */ }
    bindEvents() { /* ... */ }
    showApp() { /* ... */ }
    render() { /* ... */ }
    updateModeUI() { /* ... */ }
    showLoading() { /* ... */ }
    hideLoading() { /* ... */ }
    exportSlide() { /* ... */ }
    showExportResults() { /* ... */ }
    callGeminiAPI() { /* ... */ }
    renderTemplates() { /* ... */ }
    getBlockById() { /* ... */ }
}

// Экспорт для использования
window.FlashPostAppFixed = FlashPostAppFixed;