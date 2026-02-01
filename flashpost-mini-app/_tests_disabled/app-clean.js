// ===== MAIN APP MODULE =====
// App bootstrap and routing between screens

class FlashPostApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        
        // Инициализируем модули в правильном порядке
        this.state = new StateManager();
        this.renderer = new Renderer(this.state);
        this.editor = new Editor(this.state, this.renderer);
        this.dragManager = new DragManager(this.state);
        this.exportManager = new ExportManager(this.state);
        this.aiManager = new AIManager(this.state);
        this.templateManager = new TemplateManager(this.state);
        
        // Делаем templateManager доступным глобально
        window.templateManager = this.templateManager;
        
        // Привязываем методы для взаимодействия между модулями
        this.setupModuleInteractions();
        
        console.log('🚀 Инициализация FlashPost AI...');
        this.init();
    }

    // Настройка взаимодействия между модулями
    setupModuleInteractions() {
        // Передаем методы рендеринга в editor
        this.editor.render = () => this.renderer.render();
        this.editor.handleGenerate = () => this.handleGenerate();
        this.editor.downloadCurrentSlide = () => this.exportManager.downloadCurrentSlide();
        this.editor.downloadAllSlides = () => this.exportManager.downloadAllSlides();
        
        console.log('✅ Взаимодействие модулей настроено');
    }

    async init() {
        try {
            console.log('🚀 Начинаем инициализацию приложения...');
            
            // Инициализация Telegram WebApp
            this.initTelegramWebApp();
            
            // КРИТИЧЕСКИ ВАЖНО: Инициализируем начальное состояние
            await this.initializeDefaultState();
            
            // Рендерим приложение
            await this.renderApp();
            
            console.log('✅ Приложение инициализировано и отрендерено');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.renderErrorUI(error);
        }
    }

    // Инициализация Telegram WebApp
    initTelegramWebApp() {
        if (this.tg) {
            try {
                this.tg.ready();
                this.tg.expand();
                console.log('✅ Telegram WebApp инициализирован');
            } catch (error) {
                console.error('❌ Ошибка инициализации Telegram WebApp:', error);
            }
        }
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
    async renderApp() {
        console.log('🔒 STABLE BOOTSTRAP: renderApp() called');
        
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (!app) {
            console.error('❌ CRITICAL: #app element not found');
            return;
        }
        
        // Скрываем загрузку
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Показываем приложение
        app.style.display = 'block';
        
        try {
            // Рендерим через renderer
            this.renderer.render();
            
            // Привязываем события UI
            this.bindUIEvents();
            
            console.log('✅ STABLE BOOTSTRAP: App rendered successfully');
            
        } catch (error) {
            console.error('❌ STABLE BOOTSTRAP: Render error:', error);
            this.renderErrorUI(error);
        }
    }

    // Привязка событий UI
    bindUIEvents() {
        const mode = this.state.getMode();
        console.log(`🔗 Привязываем события UI для режима: ${mode}`);
        
        if (mode === 'start') {
            this.bindStartEvents();
        }
        
        console.log(`✅ События UI привязаны для режима: ${mode}`);
    }

    // События для стартового экрана
    bindStartEvents() {
        console.log('🎯 Привязываем события стартового экрана...');
        
        // Кнопка генерации карусели
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('🎯 Клик по кнопке генерации');
                this.handleGenerate();
            });
            console.log('✅ Кнопка генерации привязана');
        }
        
        // Поле ввода темы
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleGenerate();
                }
            });
            console.log('✅ Поле ввода темы привязано');
        }
    }

    // Обработка ручной генерации карусели
    handleGenerate() {
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
            console.log('🚀 Начинаем ручную генерацию карусели для темы:', topic);
            
            // Устанавливаем флаг генерации
            this.state.isGenerating = true;
            
            // Показываем процесс генерации
            this.showGenerationLoading(true, 'Создаем карусель...', 0);

            // РУЧНАЯ ГЕНЕРАЦИЯ: создаем 5-7 слайдов с простыми шаблонами
            const slidesData = this.generateManualSlides(topic);
            console.log(`✅ Создано ${slidesData.length} слайдов вручную`);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Обрабатываем слайды...', 50);
            
            // Очищаем текущий проект
            this.state.clearProject();
            
            // Создаем слайды в проекте
            const createdSlides = this.createSlidesInProject(slidesData);
            console.log(`✅ Создано ${createdSlides.length} слайдов в проекте`);
            
            // Обновляем прогресс
            this.showGenerationLoading(true, 'Завершаем...', 90);
            
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
            console.error('❌ Ошибка генерации карусели:', error);
            
            // Сбрасываем состояние
            this.state.isGenerating = false;
            this.showGenerationLoading(false);
            
            this.showToast('Ошибка создания карусели. Попробуйте еще раз.', 'error');
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

    // Создание слайдов в проекте
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
    showGenerationLoading(show, message = '', percentage = 0) {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) return;
        
        if (show) {
            generateBtn.innerHTML = `🔄 ${message}`;
            generateBtn.disabled = true;
        } else {
            generateBtn.innerHTML = '🎯 Создать карусель';
            generateBtn.disabled = false;
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

    // Рендер ошибки
    renderErrorUI(error) {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #fff; background: #0f0f14; min-height: 100vh;">
                <h1 style="color: #f44336;">❌ Ошибка приложения</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer;">
                    Перезагрузить
                </button>
            </div>
        `;
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