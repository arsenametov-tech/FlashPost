// ===== FLASHPOST AI - СТАБИЛИЗИРОВАННОЕ ЯДРО =====

class FlashPostApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        
        // === ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ ===
        this.project = {
            slides: [],
            activeSlideId: null,
            activeTextBlockId: null,
            mode: 'start' // 'start' | 'preview' | 'edit' | 'export'
        };
        
        // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
        this.isGenerating = false;
        this.applyToAll = false;
        
        // === СОСТОЯНИЕ DRAG & DROP ===
        this.dragBlockId = null;
        this.isDragging = false;
        
        // Привязываем методы к контексту
        this.onDragMove = this.onDragMove.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        
        console.log('🚀 Стабилизированное ядро FlashPost AI...');
        this.init();
    }

    async init() {
        try {
            this.initTelegramWebApp();
            this.setupTheme();
            this.bindEvents();
            
            setTimeout(() => {
                this.showApp();
            }, 500);
            
            console.log('✅ Стабилизированное приложение инициализировано');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    // ===== СИСТЕМА УПРАВЛЕНИЯ РЕЖИМАМИ =====
    
    async setMode(newMode) {
        const validModes = ["start", "preview", "edit", "export"];
        
        if (!validModes.includes(newMode)) {
            console.error(`❌ Недопустимый режим: ${newMode}`);
            return false;
        }
        
        const oldMode = this.project.mode;
        this.project.mode = newMode;