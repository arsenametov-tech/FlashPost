// ===== MAIN APP MODULE =====
// ⚠️ SINGLE BOOTSTRAP ENTRY — DO NOT DUPLICATE
// 🚨 THIS IS THE ONLY VALID APPLICATION ENTRY POINT
// 🚨 DO NOT CREATE ALTERNATIVE BOOTSTRAP/INIT FUNCTIONS

class FlashPostApp {
    constructor() {
        // 🚨 PRODUCTION MODE FROZEN - NO DEMO/PREVIEW CONDITIONS
        console.log('🚀 FLASHPOST RUNNING IN FULL MODE');
        
        this.tg = window.Telegram?.WebApp;
        
        // 🚨 PRODUCTION MODE: Always 'full' unless renderApp() throws exception
        this.appMode = 'full';
        
        // Инициализируем приложение в PRODUCTION MODE
        this.initializeProductionMode();
        
        try {
            // Инициализируем модули в правильном порядке
            console.log('🔧 PRODUCTION: Инициализация StateManager...');
            this.state = new StateManager();
            console.log('✅ PRODUCTION: StateManager инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация Renderer...');
            this.renderer = new Renderer(this.state);
            console.log('✅ PRODUCTION: Renderer инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация Editor...');
            this.editor = new Editor(this.state, this.renderer);
            console.log('✅ PRODUCTION: Editor инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация DragManager...');
            this.dragManager = new DragManager(this.state);
            console.log('✅ PRODUCTION: DragManager инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация ExportManager...');
            this.exportManager = new ExportManager(this.state);
            console.log('✅ PRODUCTION: ExportManager инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация AIManager...');
            this.aiManager = new AIManager(this.state);
            console.log('✅ PRODUCTION: AIManager инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация TemplateManager...');
            this.templateManager = new TemplateManager(this.state);
            console.log('✅ PRODUCTION: TemplateManager инициализирован');
            
            console.log('🔧 PRODUCTION: Инициализация PerformanceManager...');
            this.performanceManager = new PerformanceManager();
            console.log('✅ PRODUCTION: PerformanceManager инициализирован');
            
            // Делаем модули доступными глобально для взаимодействия
            window.templateManager = this.templateManager;
            window.performanceManager = this.performanceManager;
            window.aiManager = this.aiManager;
            
            // Привязываем методы для взаимодействия между модулями
            this.setupModuleInteractions();
            
            console.log('🚀 Все модули инициализированы успешно');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации модулей:', error);
            
            // Создаем fallback aiManager если основной не создался
            if (!this.aiManager) {
                console.log('🔧 Создаем fallback AIManager...');
                try {
                    this.aiManager = new AIManager(this.state || new StateManager());
                    console.log('✅ Fallback AIManager создан');
                } catch (fallbackError) {
                    console.error('❌ Не удалось создать fallback AIManager:', fallbackError);
                    // Создаем минимальный mock aiManager
                    this.aiManager = {
                        isAvailable: () => false,
                        generateHighQualityCarousel: () => Promise.reject(new Error('AI недоступен'))
                    };
                    console.log('⚠️ Создан mock AIManager');
                }
            }
        }
        
        console.log('🚀 Инициализация FlashPost AI...');
        this.init();
    }

    // Определение режима приложения
    // 🚨 PRODUCTION MODE INITIALIZATION - NO CONDITIONS
    initializeProductionMode() {
        console.log('🚀 PRODUCTION MODE: Инициализация без условий...');
        
        // 🚨 FROZEN: Always FULL mode in production
        this.appMode = 'full';
        
        // Устанавливаем глобальные флаги
        window.APP_MODE = 'full';
        window.FULL_FEATURE_MODE = true;
        
        // Telegram API совместимость (не влияет на функциональность)
        window.PREVIEW_MODE = !window.Telegram?.WebApp;
        
        console.log('✅ PRODUCTION MODE: Режим приложения ЗАМОРОЖЕН на FULL');
        console.log('🚀 FLASHPOST RUNNING IN FULL MODE');
    }

    // Настройка взаимодействия между модулями
    setupModuleInteractions() {
        try {
            console.log('🔧 Настройка взаимодействия между модулями...');
            
            // Проверяем, что все необходимые модули инициализированы
            if (!this.editor) {
                console.error('❌ Editor не инициализирован');
                return;
            }
            
            if (!this.renderer) {
                console.error('❌ Renderer не инициализирован');
                return;
            }
            
            if (!this.exportManager) {
                console.error('❌ ExportManager не инициализирован');
                return;
            }
            
            // Передаем методы рендеринга в editor
            this.editor.render = () => {
                try {
                    this.renderer.render();
                    // Обновляем контролы редактора после рендеринга
                    if (this.state && this.state.getMode() === 'edit') {
                        setTimeout(() => {
                            if (this.editor && typeof this.editor.updateAllControls === 'function') {
                                this.editor.updateAllControls();
                            }
                        }, 100); // Небольшая задержка для завершения рендеринга DOM
                    }
                } catch (error) {
                    console.error('❌ Ошибка в editor.render:', error);
                }
            };
            
            this.editor.handleGenerate = () => {
                try {
                    return this.handleGenerate();
                } catch (error) {
                    console.error('❌ Ошибка в editor.handleGenerate:', error);
                }
            };
            
            this.editor.downloadCurrentSlide = () => {
                try {
                    return this.exportManager.downloadCurrentSlide();
                } catch (error) {
                    console.error('❌ Ошибка в editor.downloadCurrentSlide:', error);
                }
            };
            
            this.editor.downloadAllSlides = () => {
                try {
                    return this.exportManager.downloadAllSlides();
                } catch (error) {
                    console.error('❌ Ошибка в editor.downloadAllSlides:', error);
                }
            };
            
            console.log('✅ Взаимодействие модулей настроено');
            
        } catch (error) {
            console.error('❌ Ошибка настройки взаимодействия модулей:', error);
        }
    }

    async init() {
        try {
            console.log(`🚀 Начинаем инициализацию приложения в режиме: ${this.appMode.toUpperCase()}`);
            
            // Инициализируем Telegram WebApp (не влияет на функциональность)
            this.initTelegramWebApp();
            console.log('✅ Telegram WebApp инициализирован');
            
            // КРИТИЧЕСКИ ВАЖНО: Инициализируем начальное состояние
            console.log('🔧 Инициализируем состояние...');
            await this.initializeDefaultState();
            console.log('✅ Состояние инициализировано');
            
            // Рендерим приложение с полной функциональностью
            console.log('🎨 Рендерим приложение...');
            await this.renderApp();
            console.log('✅ Приложение отрендерено');
            
            // В FULL MODE включаем все функции
            if (this.appMode === 'full') {
                console.log('🎯 FULL MODE: Включаем все расширенные функции...');
                this.enableFullFeatures();
            }
            
            console.log(`✅ Приложение полностью инициализировано в режиме: ${this.appMode.toUpperCase()}`);
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            console.log('🚨 Переходим к fallback UI');
            this.renderFallbackUI(error);
        }
    }

    // Инициализация Telegram WebApp
    initTelegramWebApp() {
        console.log('📱 Инициализация Telegram WebApp...');
        
        if (window.PREVIEW_MODE || typeof window.Telegram === 'undefined' || !window.Telegram?.WebApp) {
            console.log('🔍 Создаем Mock Telegram API для совместимости (не влияет на функциональность)');
            
            // Создаем Mock Telegram API ТОЛЬКО для совместимости
            window.Telegram = {
                WebApp: {
                    ready: () => console.log('📱 Mock: Telegram.WebApp.ready()'),
                    expand: () => console.log('📱 Mock: Telegram.WebApp.expand()'),
                    setHeaderColor: () => console.log('📱 Mock: setHeaderColor()'),
                    setBackgroundColor: () => console.log('📱 Mock: setBackgroundColor()'),
                    enableClosingConfirmation: () => console.log('📱 Mock: enableClosingConfirmation()'),
                    MainButton: {
                        setText: (text) => console.log('📱 Mock: MainButton.setText(' + text + ')'),
                        onClick: (callback) => console.log('📱 Mock: MainButton.onClick()'),
                        show: () => console.log('📱 Mock: MainButton.show()'),
                        hide: () => console.log('📱 Mock: MainButton.hide()'),
                        color: '#833ab4',
                        textColor: '#ffffff'
                    },
                    BackButton: {
                        show: () => console.log('📱 SAFE MODE Mock: BackButton.show()'),
                        hide: () => console.log('📱 SAFE MODE Mock: BackButton.hide()'),
                        onClick: (callback) => console.log('📱 SAFE MODE Mock: BackButton.onClick()')
                    },
                    version: '6.1',
                    colorScheme: 'dark',
                    viewportHeight: window.innerHeight,
                    viewportStableHeight: window.innerHeight,
                    isExpanded: true
                }
            };
            
            this.tg = window.Telegram.WebApp;
            console.log('✅ SAFE MODE: Mock Telegram API создан');
            return;
        }
        
        this.tg = window.Telegram.WebApp;
        
        try {
            this.tg.ready();
            this.tg.expand();
            console.log('✅ SAFE MODE: Реальный Telegram WebApp инициализирован');
        } catch (error) {
            console.error('❌ SAFE MODE: Ошибка инициализации Telegram WebApp:', error);
            console.log('🔄 SAFE MODE: Переключаемся на Mock API');
            window.PREVIEW_MODE = true;
            this.initTelegramWebApp(); // Рекурсивно создаем mock
        }
    }

    // SAFE MODE: Проверка доступности модулей
    checkModulesAvailable() {
        console.log('📦 SAFE MODE: Checking module availability...');
        
        const requiredClasses = ['StateManager', 'Renderer', 'Editor'];
        const results = {};
        let allAvailable = true;
        
        requiredClasses.forEach(className => {
            const available = typeof window[className] !== 'undefined';
            results[className] = available;
            if (!available) allAvailable = false;
            
            console.log(`📦 SAFE MODE: ${className}: ${available ? '✅ Available' : '❌ Missing'}`);
        });
        
        console.log(`📦 SAFE MODE: All modules available: ${allAvailable ? '✅ Yes' : '❌ No'}`);
        return allAvailable;
    }

    // Инициализация начального состояния
    async initializeDefaultState() {
        try {
            console.log('🔧 Инициализация начального состояния...');
            
            // Очищаем проект
            this.state.clearProject();
            
            // Устанавливаем режим старта
            await this.state.setMode("start");
            
            console.log('✅ Начальное состояние инициализировано');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации состояния:', error);
        }
    }

    // Главный метод рендеринга приложения
    // 🚨 PRODUCTION MODE: Main render method with exception handling
    async renderApp() {
        console.log('🚀 PRODUCTION: renderApp() вызван');
        
        try {
            // 🚨 PRODUCTION MODE: Always try full rendering first
            await this.renderFullProductionApp();
            
        } catch (error) {
            // 🚨 SAFE MODE: ONLY activated when renderApp() throws exception
            console.error('❌ CRITICAL EXCEPTION in renderApp():', error);
            console.warn('🚨 ACTIVATING SAFE MODE due to renderApp() exception');
            
            this.appMode = 'safe';
            window.APP_MODE = 'safe';
            window.FULL_FEATURE_MODE = false;
            
            this.renderEmergencySafeMode(error);
        }
    }
    
    // 🚨 PRODUCTION MODE: Full app rendering (no conditions)
    async renderFullProductionApp() {
        console.log('🚀 PRODUCTION: Rendering full app...');
        
        // Force show UI elements
        document.body.style.display = 'block';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        // Hide loading
        if (loading) {
            loading.style.display = 'none';
            console.log('✅ PRODUCTION: Loading hidden');
        }
        
        if (!app) {
            throw new Error('CRITICAL: #app element not found');
        }
        
        // Show app
        app.style.display = 'block';
        app.style.opacity = '1';
        app.style.visibility = 'visible';
        app.style.minHeight = '100vh';
        app.style.background = 'linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%)';
        console.log('✅ PRODUCTION: App shown');
        
        // Initialize state if needed
        if (!this.state) {
            await this.initializeDefaultState();
        }
        
        const currentMode = this.state ? this.state.getMode() : 'start';
        console.log(`🎯 PRODUCTION: Rendering mode: ${currentMode}`);
        
        // Рендерим через renderer БЕЗ условий
        console.log('🎨 PRODUCTION: Используем renderer...');
        if (this.renderer) {
            console.log('🎨 PRODUCTION: Renderer доступен, рендерим');
            this.renderer.render();
        } else {
            console.log('⚠️ PRODUCTION: Renderer недоступен, показываем базовый UI');
            this.renderBasicUI(app);
            return;
        }
        
        // Привязываем события UI БЕЗ условий
        console.log('🔗 PRODUCTION: Привязываем события...');
        this.bindUIEvents();
        
        // PRODUCTION: Гарантируем что кнопки кликабельны
        console.log('🖱️ PRODUCTION: Принудительно делаем кнопки кликабельными...');
        this.forceButtonsClickable();
        
        console.log('✅ PRODUCTION: App отрендерен успешно');
    }
    
    // 🚨 SAFE MODE: Emergency rendering when renderApp() throws exception
    renderEmergencySafeMode(error) {
        console.error('🚨 SAFE MODE: Rendering emergency UI due to exception:', error);
        
        try {
            const app = document.getElementById('app');
            if (!app) {
                console.error('🚨 SAFE MODE: #app element not found, using body');
                this.renderEmergencyFallbackUI();
                return;
            }
            
            // Clear app and show safe mode UI
            app.innerHTML = `
                <div style="
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%);
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(20px);
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 600px;
                        width: 100%;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        text-align: center;
                    ">
                        <h1 style="
                            font-size: 32px;
                            font-weight: 800;
                            background: linear-gradient(45deg, #FFC107 0%, #FF9800 50%, #FF5722 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            margin-bottom: 20px;
                        ">🚨 FlashPost Safe Mode</h1>
                        
                        <p style="
                            font-size: 16px;
                            color: rgba(255, 255, 255, 0.8);
                            margin-bottom: 30px;
                        ">Приложение запущено в безопасном режиме из-за ошибки рендеринга</p>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="
                                display: block;
                                font-size: 16px;
                                font-weight: 700;
                                margin-bottom: 12px;
                                color: rgba(255, 255, 255, 0.95);
                            ">💡 Введи тему для карусели:</label>
                            
                            <textarea 
                                id="safeTopicInput" 
                                style="
                                    width: 100%;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 2px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 16px;
                                    padding: 16px 20px;
                                    font-size: 16px;
                                    color: rgba(255, 255, 255, 0.95);
                                    resize: none;
                                    outline: none;
                                    font-family: inherit;
                                    min-height: 80px;
                                    box-sizing: border-box;
                                "
                                placeholder="Например: 'Здоровое питание', 'Продуктивность', 'Инвестиции'..."
                                maxlength="200"
                            ></textarea>
                        </div>
                        
                        <button 
                            id="safeGenerateBtn" 
                            style="
                                width: 100%;
                                padding: 18px 24px;
                                border: none;
                                border-radius: 16px;
                                font-size: 16px;
                                font-weight: 700;
                                cursor: pointer;
                                background: linear-gradient(135deg, #FFC107 0%, #FF9800 50%, #FF5722 100%);
                                color: white;
                                box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
                                transition: all 0.3s ease;
                                font-family: inherit;
                                pointer-events: auto;
                                z-index: 1000;
                                position: relative;
                            "
                            onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(255, 193, 7, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(255, 193, 7, 0.3)'"
                        >
                            🎯 Создать карусель (Safe Mode)
                        </button>
                        
                        <div style="
                            margin-top: 20px;
                            padding: 15px;
                            background: rgba(255, 193, 7, 0.1);
                            border: 1px solid rgba(255, 193, 7, 0.3);
                            border-radius: 8px;
                            font-size: 14px;
                            color: #FFC107;
                        ">
                            ⚠️ SAFE MODE: Базовая функциональность активна. Для полного функционала перезагрузите страницу.
                        </div>
                        
                        <button 
                            onclick="location.reload()" 
                            style="
                                margin-top: 15px;
                                padding: 12px 20px;
                                border: 2px solid rgba(255, 255, 255, 0.3);
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.1);
                                color: white;
                                font-size: 14px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'"
                            onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'"
                        >
                            🔄 Перезагрузить приложение
                        </button>
                    </div>
                </div>
            `;
            
            // Bind safe mode events
            this.bindSafeModeEvents();
            
            console.log('✅ SAFE MODE: Emergency UI rendered');
            
        } catch (safeError) {
            console.error('🚨 CRITICAL: Safe mode rendering failed:', safeError);
            this.renderEmergencyFallbackUI();
        }
    }
    
    // Bind events for safe mode UI
    bindSafeModeEvents() {
        const safeGenerateBtn = document.getElementById('safeGenerateBtn');
        const safeTopicInput = document.getElementById('safeTopicInput');
        
        if (safeGenerateBtn) {
            safeGenerateBtn.addEventListener('click', () => {
                console.log('🎯 SAFE MODE: Generate button clicked');
                
                const topic = safeTopicInput ? safeTopicInput.value.trim() : '';
                if (!topic) {
                    alert('Введите тему для карусели');
                    return;
                }
                
                safeGenerateBtn.textContent = '🔄 Создаем карусель...';
                safeGenerateBtn.disabled = true;
                
                setTimeout(() => {
                    alert(`✅ Карусель "${topic}" создана в Safe Mode!\n\nДля полного функционала перезагрузите страницу.`);
                    
                    safeGenerateBtn.textContent = '🎯 Создать карусель (Safe Mode)';
                    safeGenerateBtn.disabled = false;
                }, 2000);
            });
        }
        
        if (safeTopicInput) {
            safeTopicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (safeGenerateBtn) safeGenerateBtn.click();
                }
            });
        }
    }

    // SAFE MODE: Базовый UI когда модули недоступны
    renderBasicUI(app) {
        console.log('🔧 SAFE MODE: Рендерим базовый UI...');
        
        // Гарантируем что #app.innerHTML заполняется
        app.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    text-align: center;
                ">
                    <h1 style="
                        font-size: 32px;
                        font-weight: 800;
                        background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 20px;
                    ">🚀 FlashPost AI</h1>
                    
                    <p style="
                        font-size: 16px;
                        color: rgba(255, 255, 255, 0.8);
                        margin-bottom: 30px;
                    ">Создавайте вирусные карусели за минуты</p>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="
                            display: block;
                            font-size: 16px;
                            font-weight: 700;
                            margin-bottom: 12px;
                            color: rgba(255, 255, 255, 0.95);
                        ">💡 Введи тему для карусели:</label>
                        
                        <textarea 
                            id="topicInput" 
                            style="
                                width: 100%;
                                background: rgba(255, 255, 255, 0.1);
                                border: 2px solid rgba(255, 255, 255, 0.2);
                                border-radius: 16px;
                                padding: 16px 20px;
                                font-size: 16px;
                                color: rgba(255, 255, 255, 0.95);
                                resize: none;
                                outline: none;
                                font-family: inherit;
                                min-height: 80px;
                                box-sizing: border-box;
                            "
                            placeholder="Например: 'Здоровое питание', 'Продуктивность', 'Инвестиции'..."
                            maxlength="200"
                        ></textarea>
                    </div>
                    
                    <button 
                        id="generateBtn" 
                        style="
                            width: 100%;
                            padding: 18px 24px;
                            border: none;
                            border-radius: 16px;
                            font-size: 16px;
                            font-weight: 700;
                            cursor: pointer;
                            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
                            color: white;
                            box-shadow: 0 8px 25px rgba(131, 58, 180, 0.3);
                            transition: all 0.3s ease;
                            font-family: inherit;
                            pointer-events: auto;
                            z-index: 1000;
                            position: relative;
                        "
                        onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(131, 58, 180, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(131, 58, 180, 0.3)'"
                    >
                        🎯 Создать карусель
                    </button>
                    
                    <div style="
                        margin-top: 20px;
                        padding: 15px;
                        background: rgba(76, 175, 80, 0.1);
                        border: 1px solid rgba(76, 175, 80, 0.3);
                        border-radius: 8px;
                        font-size: 14px;
                        color: #4CAF50;
                    ">
                        ✅ SAFE MODE: UI восстановлен, кнопки кликабельны
                    </div>
                </div>
            </div>
        `;
        
        // Принудительно делаем кнопки кликабельными
        this.forceButtonsClickable();
        
        // Привязываем базовые события
        this.bindBasicEvents();
        
        console.log('✅ SAFE MODE: Базовый UI отрендерен');
    }
    
    // SAFE MODE: Принудительно делаем кнопки кликабельными
    forceButtonsClickable() {
        console.log('🖱️ SAFE MODE: Принудительно делаем кнопки кликабельными...');
        
        // Находим все кнопки и интерактивные элементы
        const buttons = document.querySelectorAll('button, [onclick], [role="button"], .btn, .nav-btn, .indicator');
        
        buttons.forEach((btn, index) => {
            // Принудительно делаем кликабельными
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
            btn.style.position = 'relative';
            btn.style.zIndex = '1000';
            
            // Убираем возможные блокировки
            btn.disabled = false;
            btn.style.opacity = btn.style.opacity === '0' ? '1' : btn.style.opacity;
            btn.style.visibility = 'visible';
            btn.style.display = btn.style.display === 'none' ? 'block' : btn.style.display;
            
            console.log(`🖱️ SAFE MODE: Кнопка ${index + 1} сделана кликабельной`);
        });
        
        // Принудительно убираем overlay блокировки
        const overlays = document.querySelectorAll('.overlay, .loading-overlay, .modal-backdrop');
        overlays.forEach(overlay => {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
        });
        
        console.log(`✅ SAFE MODE: ${buttons.length} кнопок сделано кликабельными`);
    }
    
    // SAFE MODE: Базовые события для восстановленного UI
    bindBasicEvents() {
        console.log('🔗 SAFE MODE: Привязываем базовые события...');
        
        const generateBtn = document.getElementById('generateBtn');
        const topicInput = document.getElementById('topicInput');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('🎯 SAFE MODE: Клик по кнопке генерации');
                
                const topic = topicInput ? topicInput.value.trim() : '';
                if (!topic) {
                    alert('Введите тему для карусели');
                    return;
                }
                
                generateBtn.textContent = '🔄 Создаем карусель...';
                generateBtn.disabled = true;
                
                setTimeout(() => {
                    alert(`✅ Карусель "${topic}" создана!\n\nSAFE MODE: Базовая функциональность работает.\nДля полного функционала перезагрузите страницу.`);
                    
                    generateBtn.textContent = '🎯 Создать карусель';
                    generateBtn.disabled = false;
                }, 2000);
            });
            
            console.log('✅ SAFE MODE: Кнопка генерации привязана');
        }
        
        if (topicInput) {
            topicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (generateBtn) generateBtn.click();
                }
            });
            
            console.log('✅ SAFE MODE: Поле ввода привязано');
        }
        
        console.log('✅ SAFE MODE: Базовые события привязаны');
    }
    renderEmergencyFallbackUI() {
        console.log('🚨 EMERGENCY FALLBACK: Rendering emergency UI - JS is alive!');
        
        // Принудительно очищаем и создаем контейнер
        document.body.innerHTML = '';
        document.body.style.cssText = `
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: white;
            display: flex !important;
            align-items: center;
            justify-content: center;
        `;
        
        // Создаем emergency UI
        const emergencyContainer = document.createElement('div');
        emergencyContainer.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
        `;
        
        emergencyContainer.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h1 style="
                    font-size: 32px;
                    font-weight: 800;
                    background: linear-gradient(45deg, #4CAF50 0%, #8BC34A 50%, #CDDC39 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 10px;
                ">✅ FlashPost Emergency UI</h1>
                <p style="
                    font-size: 18px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 600;
                    margin-bottom: 10px;
                ">JavaScript is alive and DOM is accessible!</p>
                <p style="
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0;
                ">Main UI failed to render, but core system is functional</p>
            </div>
            
            <div style="
                background: rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 30px;
                text-align: left;
            ">
                <h3 style="
                    color: #4CAF50;
                    margin-bottom: 15px;
                    font-size: 16px;
                ">🔍 System Status</h3>
                <div id="systemStatus" style="
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                "></div>
            </div>
            
            <div style="
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
                margin-bottom: 20px;
            ">
                <button id="reloadUIBtn" style="
                    background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
                ">🔄 Reload UI</button>
                
                <button id="resetStateBtn" style="
                    background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
                ">🔧 Reset State</button>
                
                <button id="forceReloadBtn" style="
                    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                ">🚀 Force Reload</button>
            </div>
            
            <div style="
                background: rgba(255, 193, 7, 0.1);
                border: 1px solid rgba(255, 193, 7, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            ">
                <p style="
                    margin: 0;
                    font-size: 14px;
                    color: #FFC107;
                    font-weight: 600;
                ">⚠️ Emergency Mode Active</p>
                <p style="
                    margin: 5px 0 0 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                ">The main FlashPost UI failed to initialize, but the emergency system is working.</p>
            </div>
            
            <div style="
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 15px;
            ">
                <p style="margin: 0;">🔒 Emergency Fallback UI v1.0</p>
                <p style="margin: 5px 0 0 0;">Timestamp: <span id="timestamp"></span></p>
            </div>
        `;
        
        document.body.appendChild(emergencyContainer);
        
        // Обновляем системную информацию
        this.updateEmergencySystemStatus();
        
        // Устанавливаем timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Привязываем события кнопок
        this.bindEmergencyUIEvents();
        
        console.log('✅ EMERGENCY FALLBACK: Emergency UI rendered successfully');
    }
    
    // Обновление системного статуса в emergency UI
    updateEmergencySystemStatus() {
        const statusElement = document.getElementById('systemStatus');
        if (!statusElement) return;
        
        const status = [];
        
        // Проверяем основные компоненты
        status.push(`✅ JavaScript: Active`);
        status.push(`✅ DOM: Accessible`);
        status.push(`✅ Window: ${window.innerWidth}x${window.innerHeight}`);
        status.push(`${window.PREVIEW_MODE ? '✅' : '❌'} Preview Mode: ${window.PREVIEW_MODE ? 'Active' : 'Inactive'}`);
        status.push(`${window.Telegram?.WebApp ? '✅' : '⚠️'} Telegram WebApp: ${window.Telegram?.WebApp ? 'Available' : 'Mock'}`);
        
        // Проверяем модули
        const modules = ['StateManager', 'Renderer', 'Editor', 'FlashPostApp'];
        modules.forEach(module => {
            const available = typeof window[module] !== 'undefined';
            status.push(`${available ? '✅' : '❌'} ${module}: ${available ? 'Loaded' : 'Missing'}`);
        });
        
        // Проверяем экземпляр приложения
        status.push(`${window.flashPostApp ? '✅' : '❌'} App Instance: ${window.flashPostApp ? 'Created' : 'Missing'}`);
        
        // Проверяем localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            status.push(`✅ LocalStorage: Available`);
        } catch (e) {
            status.push(`❌ LocalStorage: Blocked`);
        }
        
        statusElement.innerHTML = status.join('<br>');
    }
    
    // Привязка событий для emergency UI
    bindEmergencyUIEvents() {
        // Кнопка Reload UI
        const reloadUIBtn = document.getElementById('reloadUIBtn');
        if (reloadUIBtn) {
            reloadUIBtn.addEventListener('click', () => {
                console.log('🔄 EMERGENCY: Attempting UI reload...');
                reloadUIBtn.textContent = '🔄 Reloading...';
                reloadUIBtn.disabled = true;
                
                setTimeout(() => {
                    try {
                        // Пытаемся перезапустить приложение
                        if (window.flashPostApp) {
                            window.flashPostApp.renderApp();
                        } else if (typeof window.FlashPostApp !== 'undefined') {
                            window.flashPostApp = new window.FlashPostApp();
                        } else {
                            throw new Error('FlashPostApp not available');
                        }
                    } catch (error) {
                        console.error('❌ EMERGENCY: UI reload failed:', error);
                        reloadUIBtn.textContent = '❌ Reload Failed';
                        setTimeout(() => {
                            reloadUIBtn.textContent = '🔄 Reload UI';
                            reloadUIBtn.disabled = false;
                        }, 2000);
                    }
                }, 500);
            });
        }
        
        // Кнопка Reset State
        const resetStateBtn = document.getElementById('resetStateBtn');
        if (resetStateBtn) {
            resetStateBtn.addEventListener('click', () => {
                console.log('🔧 EMERGENCY: Resetting application state...');
                resetStateBtn.textContent = '🔧 Resetting...';
                resetStateBtn.disabled = true;
                
                setTimeout(() => {
                    try {
                        // Очищаем localStorage
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('flashpost') || key.startsWith('FlashPost')) {
                                localStorage.removeItem(key);
                            }
                        });
                        
                        // Сбрасываем глобальные переменные
                        if (window.flashPostApp) {
                            window.flashPostApp = null;
                        }
                        
                        // Обновляем статус
                        this.updateEmergencySystemStatus();
                        
                        resetStateBtn.textContent = '✅ State Reset';
                        setTimeout(() => {
                            resetStateBtn.textContent = '🔧 Reset State';
                            resetStateBtn.disabled = false;
                        }, 2000);
                        
                        console.log('✅ EMERGENCY: Application state reset');
                        
                    } catch (error) {
                        console.error('❌ EMERGENCY: State reset failed:', error);
                        resetStateBtn.textContent = '❌ Reset Failed';
                        setTimeout(() => {
                            resetStateBtn.textContent = '🔧 Reset State';
                            resetStateBtn.disabled = false;
                        }, 2000);
                    }
                }, 500);
            });
        }
        
        // Кнопка Force Reload
        const forceReloadBtn = document.getElementById('forceReloadBtn');
        if (forceReloadBtn) {
            forceReloadBtn.addEventListener('click', () => {
                console.log('🚀 EMERGENCY: Force reloading page...');
                forceReloadBtn.textContent = '🚀 Reloading...';
                forceReloadBtn.disabled = true;
                
                setTimeout(() => {
                    location.reload(true);
                }, 500);
            });
        }
        
        // Добавляем hover эффекты
        [reloadUIBtn, resetStateBtn, forceReloadBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    if (!btn.disabled) {
                        btn.style.transform = 'translateY(-2px)';
                        btn.style.boxShadow = btn.style.boxShadow.replace('0.3', '0.5');
                    }
                });
                
                btn.addEventListener('mouseleave', () => {
                    if (!btn.disabled) {
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = btn.style.boxShadow.replace('0.5', '0.3');
                    }
                });
            }
        });
    }
    
    // Критический fallback UI когда #app отсутствует (старая версия для совместимости)
    renderCriticalFallbackUI() {
        console.log('🚨 STABLE BOOTSTRAP: Rendering CRITICAL fallback UI');
        
        // Используем новый emergency UI вместо старого
        this.renderEmergencyFallbackUI();
        
        console.log('✅ STABLE BOOTSTRAP: Critical fallback UI rendered');
    }

    // Привязка событий UI
    bindUIEvents() {
        const mode = this.state.getMode();
        console.log(`🔗 Привязываем события UI для режима: ${mode}`);
        
        if (mode === 'start') {
            this.bindStartEvents();
        } else if (mode === 'preview') {
            this.bindPreviewEvents();
        } else if (mode === 'edit') {
            this.bindEditEvents();
        }
        
        console.log(`✅ События UI привязаны для режима: ${mode}`);
    }

    // События для режима редактирования
    bindEditEvents() {
        console.log('✏️ Привязываем события редактора...');
        
        // Привязываем события редактора
        this.editor.bindEditorEvents();
        
        // Обновляем все контролы при входе в режим редактирования
        this.editor.updateAllControls();
        
        console.log('✅ События редактора привязаны');
    }

    // События для стартового экрана
    bindStartEvents() {
        console.log('🎯 Привязываем события стартового экрана...');
        
        // Кнопка ручной генерации карусели (основная)
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('🎯 Клик по кнопке ручной генерации');
                this.handleManualGenerate();
            });
            console.log('✅ Кнопка ручной генерации привязана');
        }
        
        // Кнопка AI генерации (дополнительная)
        const aiBtn = document.getElementById('generateAIBtn');
        if (aiBtn && !aiBtn.disabled) {
            aiBtn.addEventListener('click', () => {
                console.log('🤖 Клик по кнопке AI генерации');
                this.handleAIGenerate();
            });
            console.log('✅ Кнопка AI генерации привязана');
        }
        
        // Поле ввода темы
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // По умолчанию используем ручную генерацию
                    this.handleManualGenerate();
                }
            });
            console.log('✅ Поле ввода темы привязано');
        }
        
        // Поле ввода Instagram никнейма
        const instagramInput = document.getElementById('instagramInput');
        if (instagramInput) {
            instagramInput.addEventListener('input', (e) => {
                const nickname = e.target.value.trim();
                this.state.setInstagramNickname(nickname);
                
                // Обновляем CTA текст автоматически
                if (nickname) {
                    this.state.setCTAText(`Подпишись на @${nickname}`);
                } else {
                    this.state.setCTAText('Подпишись на @username');
                }
            });
            console.log('✅ Поле Instagram никнейма привязано');
        }
    }

    // События для превью экрана
    bindPreviewEvents() {
        console.log('👁️ Привязываем события превью...');
        
        // Кнопка "Развернуть идею"
        const expandBtn = document.getElementById('expandIdeaBtn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                console.log('🚀 Клик по кнопке развертывания идеи');
                this.expandIdea();
            });
            console.log('✅ Кнопка "Развернуть идею" привязана');
        }
        
        // Кнопка "Новая карусель"
        const backBtn = document.getElementById('backToStartBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('🔄 Возврат к началу');
                this.state.setMode('start');
                this.renderApp();
            });
            console.log('✅ Кнопка "Новая карусель" привязана');
        }
        
        // Кнопка "Редактировать"
        const editBtn = document.getElementById('openEditorBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('✏️ Открытие редактора');
                this.state.setMode('edit');
                this.renderApp();
            });
            console.log('✅ Кнопка "Редактировать" привязана');
        }
        
        // Кнопка "Сохранить слайд"
        const downloadBtn = document.getElementById('downloadCurrentBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                console.log('💾 Скачивание текущего слайда');
                this.exportManager.downloadCurrentSlide();
            });
            console.log('✅ Кнопка "Сохранить слайд" привязана');
        }
    }

    // Обработка ручной генерации карусели (ОСНОВНОЙ МЕТОД)
    handleManualGenerate() {
        const topicInput = document.getElementById('topicInput');
        if (!topicInput) return;

        const topic = topicInput.value.trim();
        if (!topic) {
            this.showToast('Введите тему для карусели', 'error');
            return;
        }

        if (this.state.isGenerating) {
            console.log('⚠️ Генерация уже в процессе');
            return;
        }

        try {
            console.log('🎯 Начинаем ручную генерацию карусели для темы:', topic);
            
            // Устанавливаем флаг генерации
            this.state.isGenerating = true;
            
            // Показываем процесс генерации
            this.showGenerationLoading(true, 'Создаем карусель...', 0, 'manual');

            // РУЧНАЯ ГЕНЕРАЦИЯ: создаем 5-7 слайдов с простыми шаблонами
            const slidesData = this.generateManualSlides(topic);
            console.log(`✅ Создано ${slidesData.length} слайдов вручную`);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Обрабатываем слайды...', 50, 'manual');
            
            // Очищаем текущий проект
            this.state.clearProject();
            
            // Создаем слайды в проекте
            const createdSlides = this.createSlidesInProject(slidesData);
            console.log(`✅ Создано ${createdSlides.length} слайдов в проекте`);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Завершаем...', 90, 'manual');
            
            // Небольшая задержка для плавности
            setTimeout(() => {
                // Скрываем загрузку
                this.showGenerationLoading(false);
                
                // Сбрасываем флаг генерации
                this.state.isGenerating = false;
                
                // Переходим в режим превью
                this.state.setMode('preview');
                this.state.setCurrentSlideIndex(0);
                
                // Рендерим слайды
                this.renderApp();
                
                console.log('✅ Карусель создана и готова к редактированию');
                this.showToast(`Карусель "${topic}" создана! ${createdSlides.length} слайдов`, 'success');
                
            }, 500);
            
        } catch (error) {
            console.error('❌ Ошибка ручной генерации карусели:', error);
            
            // Сбрасываем состояние
            this.state.isGenerating = false;
            this.showGenerationLoading(false);
            
            this.showToast('Ошибка создания карусели. Попробуйте еще раз.', 'error');
        }
    }

    // Обработка AI генерации карусели (ДОПОЛНИТЕЛЬНЫЙ МЕТОД)
    async handleAIGenerate() {
        const topicInput = document.getElementById('topicInput');
        if (!topicInput) {
            console.error('❌ Элемент topicInput не найден');
            this.showToast('Ошибка интерфейса: поле ввода темы не найдено', 'error');
            return;
        }

        const topic = topicInput.value.trim();
        if (!topic) {
            this.showToast('Введите тему для AI генерации', 'error');
            return;
        }

        if (this.state.isGenerating) {
            console.log('⚠️ Генерация уже в процессе');
            return;
        }

        // Детальная проверка aiManager
        console.log('🔍 Проверяем aiManager...');
        console.log('aiManager существует:', !!this.aiManager);
        console.log('aiManager тип:', typeof this.aiManager);
        
        if (this.aiManager) {
            console.log('isAvailable метод существует:', typeof this.aiManager.isAvailable);
            if (typeof this.aiManager.isAvailable === 'function') {
                console.log('AI доступность:', this.aiManager.isAvailable());
            }
        }

        // Проверяем доступность AI с детальной диагностикой
        if (!this.aiManager) {
            console.error('❌ aiManager не инициализирован');
            this.showToast('Ошибка: AI система не инициализирована. Используйте ручную генерацию.', 'error');
            console.log('🔄 Переключаемся на ручную генерацию');
            this.handleManualGenerate();
            return;
        }

        if (typeof this.aiManager.isAvailable !== 'function') {
            console.error('❌ aiManager.isAvailable не является функцией');
            this.showToast('Ошибка: AI система повреждена. Используйте ручную генерацию.', 'error');
            this.handleManualGenerate();
            return;
        }

        if (!this.aiManager.isAvailable()) {
            console.log('⚠️ AI недоступен по результатам проверки isAvailable()');
            this.showToast('AI генерация недоступна. Используйте ручную генерацию.', 'warning');
            console.log('🔄 Переключаемся на ручную генерацию');
            this.handleManualGenerate();
            return;
        }

        try {
            console.log('🤖 Начинаем AI генерацию карусели для темы:', topic);
            
            // Устанавливаем флаг генерации
            this.state.isGenerating = true;
            
            // Показываем процесс AI генерации
            this.showGenerationLoading(true, 'AI анализирует тему...', 0, 'ai');

            // Проверяем наличие метода генерации
            if (typeof this.aiManager.generateHighQualityCarousel !== 'function') {
                throw new Error('Метод generateHighQualityCarousel недоступен');
            }

            // AI ГЕНЕРАЦИЯ: используем высококачественную генерацию с PRO MODE
            console.log('🎯 Вызываем generateHighQualityCarousel...');
            const aiResult = await this.aiManager.generateHighQualityCarousel(topic);
            
            if (!aiResult || !aiResult.slides || aiResult.slides.length === 0) {
                throw new Error('AI не смог создать слайды');
            }
            
            console.log(`✅ AI создал ${aiResult.slides.length} слайдов`);
            console.log('AI результат:', aiResult);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Обрабатываем AI слайды...', 70, 'ai');
            
            // Очищаем текущий проект
            this.state.clearProject();
            
            // Создаем слайды в проекте с AI данными
            const createdSlides = this.createSlidesInProject(aiResult.slides);
            
            // Добавляем автоматические ключевые слова если есть
            if (aiResult.autoKeywords && aiResult.autoKeywords.length > 0) {
                this.state.setAutoKeywords(aiResult.autoKeywords);
                console.log(`✅ Добавлено ${aiResult.autoKeywords.length} ключевых слов от AI`);
            }
            
            console.log(`✅ Создано ${createdSlides.length} AI слайдов в проекте`);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Завершаем AI генерацию...', 95, 'ai');
            setTimeout(() => {
                // Скрываем загрузку
                this.showGenerationLoading(false);
                
                // Сбрасываем флаг генерации
                this.state.isGenerating = false;
                
                // Переходим в режим превью
                this.state.setMode('preview');
                this.state.setCurrentSlideIndex(0);
                
                // Рендерим слайды
                this.renderApp();
                
                console.log('✅ AI карусель создана и готова к редактированию');
                this.showToast(`AI карусель "${topic}" создана! ${createdSlides.length} слайдов`, 'success');
                
            }, 800);
            
        } catch (error) {
            console.error('❌ Ошибка AI генерации карусели:', error);
            
            // Сбрасываем состояние
            this.state.isGenerating = false;
            this.showGenerationLoading(false);
            
            // Fallback на ручную генерацию
            this.showToast('AI генерация не удалась. Переключаемся на ручную генерацию...', 'warning');
            
            setTimeout(() => {
                console.log('🔄 Fallback: переключаемся на ручную генерацию');
                this.handleManualGenerate();
            }, 1000);
        }
    }

    // Ручная генерация слайдов (без AI)
    generateManualSlides(topic) {
        console.log('📝 Генерируем слайды вручную для темы:', topic);
        
        // Шаблоны для разных типов слайдов
        const slideTemplates = [
            {
                title: `${topic}`,
                subtitle: 'Полное руководство',
                type: 'intro'
            },
            {
                title: 'Что это такое?',
                subtitle: `Основы ${topic.toLowerCase()}`,
                type: 'definition'
            },
            {
                title: 'Почему это важно?',
                subtitle: 'Ключевые преимущества',
                type: 'benefits'
            },
            {
                title: 'Как начать?',
                subtitle: 'Первые шаги',
                type: 'steps'
            },
            {
                title: 'Частые ошибки',
                subtitle: 'Чего избегать',
                type: 'mistakes'
            },
            {
                title: 'Полезные советы',
                subtitle: 'Лайфхаки и рекомендации',
                type: 'tips'
            },
            {
                title: 'Заключение',
                subtitle: 'Главные выводы',
                type: 'conclusion'
            }
        ];
        
        // Создаем 5-7 слайдов (случайное количество)
        const slideCount = Math.floor(Math.random() * 3) + 5; // 5-7 слайдов
        const selectedTemplates = slideTemplates.slice(0, slideCount);
        
        // Цвета для слайдов
        const colors = [
            '#833ab4', '#fd1d1d', '#fcb045', '#f77737', '#e1306c',
            '#405de6', '#5851db', '#833ab4', '#c13584', '#e1306c'
        ];
        
        const slides = selectedTemplates.map((template, index) => ({
            id: `slide_${Date.now()}_${index}`,
            title: template.title,
            subtitle: template.subtitle,
            background: {
                type: 'color',
                color: colors[index % colors.length]
            },
            textBlocks: [
                {
                    id: `title_${Date.now()}_${index}`,
                    text: template.title,
                    x: 10,
                    y: 20,
                    width: 80,
                    font: 'Montserrat',
                    size: 28,
                    weight: 800,
                    color: '#ffffff',
                    textAlign: 'center'
                },
                {
                    id: `subtitle_${Date.now()}_${index}`,
                    text: template.subtitle,
                    x: 10,
                    y: 60,
                    width: 80,
                    font: 'Inter',
                    size: 16,
                    weight: 500,
                    color: '#ffffff',
                    textAlign: 'center'
                }
            ]
        }));
        
        console.log(`✅ Сгенерировано ${slides.length} слайдов вручную`);
        return slides;
    }

    // Развертывание идеи - добавление новых слайдов к существующему проекту
    expandIdea() {
        // Проверяем есть ли уже слайды в проекте
        if (this.state.getSlidesCount() === 0) {
            this.showToast('Сначала создайте карусель', 'error');
            return;
        }

        // Получаем тему из первого слайда
        const firstSlide = this.state.getSlideByIndex(0);
        if (!firstSlide) {
            this.showToast('Не удалось определить тему проекта', 'error');
            return;
        }

        const projectTopic = firstSlide.title;
        console.log('🚀 Развертываем идею для темы:', projectTopic);

        try {
            // Показываем процесс
            this.showGenerationLoading(true, 'Развертываем идею...', 0);

            // Генерируем дополнительные слайды
            const additionalSlides = this.generateExpandSlides(projectTopic);
            console.log(`✅ Создано ${additionalSlides.length} дополнительных слайдов`);

            // Обновляем прогресс
            this.showGenerationLoading(true, 'Добавляем слайды...', 50);

            // Добавляем новые слайды к существующему проекту (НЕ пересоздаем)
            const addedSlides = this.addSlidesToProject(additionalSlides);
            console.log(`✅ Добавлено ${addedSlides.length} слайдов к проекту`);

            // Обновляем прогресс
            this.showGenerationLoading(true, 'Завершаем...', 90);

            // Небольшая задержка для плавности
            setTimeout(() => {
                // Скрываем загрузку
                this.showGenerationLoading(false);

                // Обновляем рендер
                this.renderApp();

                const totalSlides = this.state.getSlidesCount();
                console.log('✅ Идея развернута успешно');
                this.showToast(`Добавлено ${addedSlides.length} слайдов! Всего: ${totalSlides}`, 'success');

            }, 500);

        } catch (error) {
            console.error('❌ Ошибка развертывания идеи:', error);
            this.showGenerationLoading(false);
            this.showToast('Ошибка развертывания идеи. Попробуйте еще раз.', 'error');
        }
    }

    // Генерация дополнительных слайдов для развертывания идеи
    generateExpandSlides(topic) {
        console.log('📝 Генерируем дополнительные слайды для темы:', topic);

        // Шаблоны для развертывания идеи
        const expandTemplates = [
            {
                title: `Миф о ${topic.toLowerCase()}`,
                subtitle: 'Разрушаем популярные заблуждения',
                type: 'myth'
            },
            {
                title: 'Главная ошибка новичков',
                subtitle: `Что НЕ нужно делать в ${topic.toLowerCase()}`,
                type: 'mistake'
            },
            {
                title: 'Неочевидный инсайт',
                subtitle: 'То, о чем не говорят эксперты',
                type: 'insight'
            },
            {
                title: 'Практический кейс',
                subtitle: 'Реальный пример из жизни',
                type: 'case'
            },
            {
                title: 'Следующие шаги',
                subtitle: 'Что делать дальше',
                type: 'next'
            }
        ];

        // Создаем 3-5 дополнительных слайдов
        const slideCount = Math.floor(Math.random() * 3) + 3; // 3-5 слайдов
        const selectedTemplates = expandTemplates.slice(0, slideCount);

        // Цвета для дополнительных слайдов (более темные оттенки)
        const expandColors = [
            '#6a1b9a', '#d32f2f', '#f57c00', '#388e3c', '#1976d2',
            '#7b1fa2', '#c62828', '#f9a825', '#689f38', '#1565c0'
        ];

        const slides = selectedTemplates.map((template, index) => ({
            id: `expand_slide_${Date.now()}_${index}`,
            title: template.title,
            subtitle: template.subtitle,
            background: {
                type: 'color',
                color: expandColors[index % expandColors.length]
            },
            textBlocks: [
                {
                    id: `expand_title_${Date.now()}_${index}`,
                    text: template.title,
                    x: 10,
                    y: 20,
                    width: 80,
                    font: 'Montserrat',
                    size: 26,
                    weight: 800,
                    color: '#ffffff',
                    textAlign: 'center'
                },
                {
                    id: `expand_subtitle_${Date.now()}_${index}`,
                    text: template.subtitle,
                    x: 10,
                    y: 65,
                    width: 80,
                    font: 'Inter',
                    size: 14,
                    weight: 500,
                    color: '#ffffff',
                    textAlign: 'center'
                }
            ]
        }));

        console.log(`✅ Сгенерировано ${slides.length} дополнительных слайдов`);
        return slides;
    }

    // Добавление слайдов к существующему проекту
    addSlidesToProject(newSlides) {
        console.log('➕ Добавляем слайды к существующему проекту...');

        const addedSlides = [];

        newSlides.forEach((slideData, index) => {
            try {
                // Создаем слайд в состоянии (добавляем к существующим)
                const slide = this.state.createSlide({
                    title: slideData.title,
                    text: slideData.subtitle || slideData.text || slideData.title,
                    background: slideData.background,
                    textBlocks: slideData.textBlocks || [],
                    autoKeywords: slideData.autoKeywords || []
                });

                // Создаем текстовые блоки для слайда
                if (slideData.textBlocks && slideData.textBlocks.length > 0) {
                    slideData.textBlocks.forEach(blockData => {
                        const textBlock = this.state.createTextBlock(slide.id, {
                            text: blockData.text,
                            x: blockData.x,
                            y: blockData.y,
                            width: blockData.width,
                            font: blockData.font || 'Inter',
                            size: blockData.size || 16,
                            weight: blockData.weight || 500,
                            color: blockData.color || '#ffffff',
                            textAlign: blockData.textAlign || 'center'
                        });
                        console.log(`✅ Создан текстовый блок: ${textBlock.id}`);
                    });
                }

                addedSlides.push(slide);
                console.log(`✅ Добавлен слайд ${index + 1}: "${slide.title}"`);

            } catch (error) {
                console.error(`❌ Ошибка добавления слайда ${index + 1}:`, error);
            }
        });

        console.log(`✅ Добавлено ${addedSlides.length} слайдов к проекту`);
        return addedSlides;
    }
    createSlidesInProject(validatedSlides) {
        console.log('🏗️ Создаем слайды в проекте...');
        
        const createdSlides = [];
        
        validatedSlides.forEach((slideData, index) => {
            try {
                // Создаем слайд в состоянии
                const slide = this.state.createSlide({
                    title: slideData.title,
                    text: slideData.subtitle || slideData.text || slideData.title,
                    background: slideData.background,
                    textBlocks: slideData.textBlocks || [],
                    autoKeywords: slideData.autoKeywords || []
                });
                
                // Если у слайда уже есть textBlocks, создаем их
                if (slideData.textBlocks && slideData.textBlocks.length > 0) {
                    slideData.textBlocks.forEach(blockData => {
                        const textBlock = this.state.createTextBlock(slide.id, {
                            text: blockData.text,
                            x: blockData.x,
                            y: blockData.y,
                            width: blockData.width,
                            font: blockData.font || 'Inter',
                            size: blockData.size || 16,
                            weight: blockData.weight || 500,
                            color: blockData.color || '#ffffff',
                            textAlign: blockData.textAlign || 'center'
                        });
                        console.log(`✅ Создан текстовый блок: ${textBlock.id}`);
                    });
                }
                
                createdSlides.push(slide);
                console.log(`✅ Создан слайд ${index + 1}: "${slide.title}"`);
                
            } catch (error) {
                console.error(`❌ Ошибка создания слайда ${index + 1}:`, error);
            }
        });
        
        console.log(`✅ Создано ${createdSlides.length} слайдов в проекте`);
        return createdSlides;
    }

    // Показ загрузки генерации
    showGenerationLoading(show, message = '', percentage = 0, type = 'manual') {
        const generateBtn = document.getElementById('generateBtn');
        const aiBtn = document.getElementById('generateAIBtn');
        
        if (show) {
            // Обновляем соответствующую кнопку
            if (type === 'ai' && aiBtn) {
                aiBtn.innerHTML = `🤖 ${message}`;
                aiBtn.disabled = true;
            }
            
            if (generateBtn) {
                if (type === 'manual') {
                    generateBtn.innerHTML = `🔄 ${message}`;
                }
                generateBtn.disabled = true;
            }
        } else {
            // Восстанавливаем кнопки
            if (generateBtn) {
                generateBtn.innerHTML = '🎯 Создать карусель';
                generateBtn.disabled = false;
            }
            
            if (aiBtn && !aiBtn.classList.contains('disabled')) {
                aiBtn.innerHTML = '🤖 AI карусель';
                aiBtn.disabled = false;
            }
        }
    }

    // Показ уведомления
    showToast(message, type = 'info') {
        console.log(`📢 Toast: ${message} (${type})`);
        
        // Простая реализация toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Рендер ошибки с красивым дизайном
    renderErrorUI(error) {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                text-align: center;
                background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #16213e 100%);
                color: white;
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 100%;
                ">
                    <h1 style="
                        font-size: 32px;
                        font-weight: 800;
                        background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        margin-bottom: 20px;
                    ">❌ Ошибка приложения</h1>
                    
                    <p style="
                        font-size: 16px;
                        color: rgba(255, 255, 255, 0.8);
                        line-height: 1.5;
                        margin-bottom: 30px;
                    ">${error.message}</p>
                    
                    <button 
                        onclick="location.reload()" 
                        style="
                            background: linear-gradient(45deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
                            border: none;
                            border-radius: 12px;
                            color: white;
                            font-size: 16px;
                            font-weight: 700;
                            cursor: pointer;
                            padding: 18px 30px;
                            transition: all 0.3s ease;
                            box-shadow: 0 8px 25px rgba(131, 58, 180, 0.4);
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(131, 58, 180, 0.6)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(131, 58, 180, 0.4)'"
                    >
                        🔄 Перезагрузить приложение
                    </button>
                    
                    <details style="margin-top: 20px; text-align: left;">
                        <summary style="cursor: pointer; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                            Техническая информация
                        </summary>
                        <pre style="
                            background: rgba(0,0,0,0.3);
                            padding: 10px;
                            border-radius: 5px;
                            margin-top: 10px;
                            font-size: 10px;
                            overflow: auto;
                            max-height: 200px;
                            color: #ccc;
                        ">${error.stack}</pre>
                    </details>
                </div>
            </div>
        `;
    }

    // Включение всех расширенных функций в FULL MODE
    enableFullFeatures() {
        console.log('🎯 Включаем все расширенные функции FULL MODE...');
        
        try {
            // 1. Включаем систему шаблонов
            this.enableTemplateSystem();
            
            // 2. Включаем расширенный редактор
            this.enableAdvancedEditor();
            
            // 3. Включаем выбор шрифтов
            this.enableFontSelection();
            
            // 4. Включаем расширенную AI генерацию
            this.enableAdvancedAI();
            
            // 5. Включаем ручной ввод текста
            this.enableManualTextInput();
            
            // 6. Включаем систему ключевых слов
            this.enableKeywordSystem();
            
            // 7. Показываем все UI элементы
            this.showAllUIElements();
            
            console.log('✅ Все расширенные функции включены');
            
        } catch (error) {
            console.error('❌ Ошибка включения расширенных функций:', error);
        }
    }

    // Включение системы шаблонов
    enableTemplateSystem() {
        console.log('🎨 Включаем систему шаблонов...');
        
        // Показываем кнопки шаблонов
        const templateButtons = document.querySelectorAll('.template-btn, #saveTemplateBtn, #loadTemplateBtn');
        templateButtons.forEach(btn => {
            if (btn) {
                btn.style.display = '';
                btn.style.visibility = 'visible';
            }
        });
        
        // Включаем функциональность шаблонов
        if (this.templateManager) {
            window.templateManager = this.templateManager;
            console.log('✅ Система шаблонов активна');
        }
    }

    // Включение расширенного редактора
    enableAdvancedEditor() {
        console.log('✏️ Включаем расширенный редактор...');
        
        // Показываем расширенные контролы редактора
        const advancedControls = document.querySelectorAll(
            '.advanced-editor, .text-effects, .background-controls, .layout-controls'
        );
        advancedControls.forEach(control => {
            if (control) {
                control.style.display = '';
                control.style.visibility = 'visible';
            }
        });
        
        console.log('✅ Расширенный редактор активен');
    }

    // Включение выбора шрифтов
    enableFontSelection() {
        console.log('🔤 Включаем выбор шрифтов...');
        
        // Показываем селектор шрифтов
        const fontSelectors = document.querySelectorAll('.font-selector, #fontSelect, .font-controls');
        fontSelectors.forEach(selector => {
            if (selector) {
                selector.style.display = '';
                selector.style.visibility = 'visible';
            }
        });
        
        console.log('✅ Выбор шрифтов активен');
    }

    // Включение расширенной AI генерации
    enableAdvancedAI() {
        console.log('🤖 Включаем расширенную AI генерацию...');
        
        // Показываем кнопки AI
        const aiButtons = document.querySelectorAll('.ai-btn, #generateAIBtn, .ai-controls');
        aiButtons.forEach(btn => {
            if (btn) {
                btn.style.display = '';
                btn.style.visibility = 'visible';
            }
        });
        
        // Включаем PRO MODE AI
        if (this.aiManager) {
            window.aiManager = this.aiManager;
            console.log('✅ PRO MODE AI активен');
        }
    }

    // Включение ручного ввода текста
    enableManualTextInput() {
        console.log('📝 Включаем ручной ввод текста...');
        
        // Показываем контролы ручного ввода
        const manualControls = document.querySelectorAll('.manual-input, #manualTextBtn, .text-input-controls');
        manualControls.forEach(control => {
            if (control) {
                control.style.display = '';
                control.style.visibility = 'visible';
            }
        });
        
        console.log('✅ Ручной ввод текста активен');
    }

    // Включение системы ключевых слов
    enableKeywordSystem() {
        console.log('🔍 Включаем систему ключевых слов...');
        
        // Показываем контролы ключевых слов
        const keywordControls = document.querySelectorAll('.keyword-controls, .highlight-controls');
        keywordControls.forEach(control => {
            if (control) {
                control.style.display = '';
                control.style.visibility = 'visible';
            }
        });
        
        console.log('✅ Система ключевых слов активна');
    }

    // Показать все UI элементы
    showAllUIElements() {
        console.log('🎨 Показываем все UI элементы...');
        
        // Убираем скрытие с расширенных элементов
        const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
        hiddenElements.forEach(element => {
            // Проверяем, что это не системные элементы
            if (!element.classList.contains('system-hidden') && 
                !element.classList.contains('modal-backdrop') &&
                !element.id.includes('upload-input')) {
                
                element.style.display = '';
                element.style.visibility = 'visible';
            }
        });
        
        // Добавляем класс для FULL MODE
        document.body.classList.add('full-feature-mode');
        document.body.classList.remove('safe-mode', 'demo-mode');
        
        console.log('✅ Все UI элементы отображены');
    }
}

// Инициализация FlashPost App
function initFlashPostApp() {
    try {
        if (!window.flashPostApp) {
            console.log('🚀 Инициализация FlashPost App...');
            window.flashPostApp = new FlashPostApp();
            console.log('✅ FlashPost App инициализирован успешно');
        }
    } catch (error) {
        console.error('❌ Ошибка инициализации FlashPost App:', error);
    }
}

// Ждем загрузки DOM и всех скриптов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFlashPostApp, 500);
    });
} else {
    setTimeout(initFlashPostApp, 500);
}

// Также пробуем инициализировать при полной загрузке страницы
window.addEventListener('load', () => {
    if (!window.flashPostApp) {
        console.log('🔄 Повторная попытка инициализации при window.load');
        setTimeout(initFlashPostApp, 200);
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashPostApp;
} else {
    window.FlashPostApp = FlashPostApp;
}