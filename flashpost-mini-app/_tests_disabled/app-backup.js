// ===== MAIN APP MODULE =====
// App bootstrap and routing between screens
// 
// 🔒 STABLE BOOTSTRAP — DO NOT BREAK
// This module implements a stable bootstrap pattern:
// - renderApp() is the ONLY entry point for UI rendering
// - All future features must be mounted inside the stable layout
// - No module should render directly to document.body
// - Fallback UI is always available even if initialization fails
// 
// CRITICAL ARCHITECTURE RULES:
// 1. renderApp() must always show visible UI
// 2. Error states must not break the bootstrap
// 3. DOM structure must be preserved (#app, #loading)
// 4. All rendering goes through the renderer module ONLY via renderApp()
// 5. NO direct calls to renderer.render() outside of renderApp()
// 6. ALL mode changes must call renderApp() for UI updates
// 7. ALL navigation must call renderApp() for UI updates
// 8. ALL state changes that affect UI must call renderApp()

class FlashPostApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        
        // Инициализируем модули в правильном порядке
        this.state = new StateManager();
        this.renderer = new Renderer(this.state);
        this.editor = new Editor(this.state, this.renderer); // Передаем renderer как зависимость
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
        this.editor.saveTemplate = () => this.exportManager.saveTemplate();
        
        // Передаем методы навигации в editor
        this.editor.enterStartMode = () => this.enterStartMode();
        this.editor.enterPreviewMode = () => this.enterPreviewMode();
        this.editor.enterEditMode = () => this.enterEditMode();
        this.editor.enterExportMode = () => this.enterExportMode();
        
        // Настраиваем систему живого превью через колбэки
        this.setupLivePreviewSystem();
    }

    // Настройка системы живого превью
    setupLivePreviewSystem() {
        // Делаем renderer доступным глобально для обратной совместимости
        window.renderer = this.renderer;
        
        // Настраиваем колбэк для обновления DOM при изменении состояния
        this.state.setPropertyChangeCallback((hookData) => {
            console.log(`🔄 Получен колбэк изменения свойства: ${hookData.property} для блока ${hookData.blockId}`);
            
            // Обновляем все превью элементы для блока
            this.updateAllPreviewElements(hookData.blockId);
            
            // Дополнительно обновляем через renderer если доступен
            if (this.renderer && this.renderer.updateTextBlockStyles) {
                this.renderer.updateTextBlockStyles(hookData.blockId);
            }
        });
        
        console.log('✅ Система живого превью настроена через колбэки');
    }

    // Обновление всех превью элементов для блока
    updateAllPreviewElements(blockId) {
        try {
            const activeSlide = this.state.getActiveSlide();
            if (!activeSlide) return;

            const block = activeSlide.textBlocks.find(b => b.id === blockId);
            if (!block) return;

            // Обновляем все элементы этого блока из состояния
            const blockElements = document.querySelectorAll(`[data-block-id="${blockId}"]`);
            console.log(`🎯 Найдено ${blockElements.length} элементов для блока ${blockId}`);
            
            blockElements.forEach(blockEl => {
                // Применяем стили из состояния
                if (this.renderer && this.renderer.applyTextBlockStyles) {
                    this.renderer.applyTextBlockStyles(blockEl, block);
                } else {
                    // Fallback: применяем стили напрямую
                    this.applyBlockStylesFallback(blockEl, block);
                }
            });
            
        } catch (error) {
            console.error(`❌ Ошибка обновления превью элементов для блока ${blockId}:`, error);
        }
    }

    // Fallback метод применения стилей
    applyBlockStylesFallback(blockEl, block) {
        try {
            // Позиционирование
            blockEl.style.left = block.x + '%';
            blockEl.style.top = block.y + '%';
            blockEl.style.width = block.width + '%';
            
            // Текст
            if (blockEl.textContent !== block.text) {
                blockEl.textContent = block.text;
            }
            
            // Шрифт
            blockEl.style.fontFamily = block.font || 'Inter';
            blockEl.style.fontSize = (block.size || 16) + 'px';
            blockEl.style.fontWeight = block.weight || 700;
            blockEl.style.color = block.color || '#ffffff';
            blockEl.style.textAlign = block.textAlign || 'center';
            
            console.log(`🎨 Fallback стили применены к блоку ${block.id}`);
            
        } catch (error) {
            console.error(`❌ Ошибка применения fallback стилей:`, error);
        }
    }

    async init() {
        try {
            console.log('🚀 Начинаем инициализацию приложения...');
            
            // Инициализация Telegram WebApp
            this.initTelegramWebApp();
            
            // Настройка темы
            this.setupTheme();
            
            // КРИТИЧЕСКИ ВАЖНО: Инициализируем начальное состояние
            await this.initializeDefaultState();
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // renderApp() is the ONLY entry point for UI rendering
            // ИСПРАВЛЕНО: Немедленный рендеринг без задержки
            await this.renderApp();
            
            console.log('✅ Приложение инициализировано и отрендерено');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // Even on initialization failure, show visible UI
            setTimeout(() => {
                this.renderErrorUI(error);
            }, 1000);
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
            
            // Создаем демо-слайд для предотвращения ошибок
            const demoSlide = this.state.createSlide({
                title: 'Добро пожаловать',
                text: 'Создайте свою первую карусель',
                background: {
                    type: 'color',
                    color: '#833ab4'
                }
            });
            
            console.log('✅ Начальное состояние инициализировано');
            console.log(`📊 Создан демо-слайд: ${demoSlide.id}`);
            
        } catch (error) {
            console.error('❌ Ошибка инициализации состояния:', error);
            // Продолжаем работу даже при ошибке
        }
    }

    // ===== УПРАВЛЕНИЕ РЕЖИМАМИ =====

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Переход в режим старта - все рендеринг через renderApp()
    async enterStartMode() {
        try {
            console.log('🎯 Переход в режим старта...');
            
            // Устанавливаем режим
            await this.state.setMode("start");
            
            // Проверяем, что у нас есть хотя бы один слайд
            if (this.state.getSlidesCount() === 0) {
                console.log('📝 Создаем демо-слайд для стартового экрана...');
                this.state.createSlide({
                    title: 'Добро пожаловать',
                    text: 'Создайте свою первую карусель',
                    background: {
                        type: 'color',
                        color: '#833ab4'
                    }
                });
            }
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            console.log('🎨 Рендерим через renderApp()...');
            this.renderApp();
            
            // Обновляем кнопки Telegram
            this.updateTelegramButtons();
            
            console.log('✅ Режим старта активирован');
            
        } catch (error) {
            console.error('❌ Ошибка перехода в режим старта:', error);
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // Even errors go through renderApp()
            this.renderApp();
        }
    }

    // Резервный стартовый экран
    showFallbackStartScreen() {
        console.log('🚨 Показываем резервный стартовый экран...');
        
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="fallback-start-screen" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 20px;
                text-align: center;
                background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
                color: white;
            ">
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    max-width: 500px;
                    width: 100%;
                ">
                    <h1 style="margin: 0 0 20px 0; font-size: 28px;">🚀 FlashPost AI</h1>
                    <p style="margin: 0 0 30px 0; opacity: 0.9; font-size: 16px;">
                        Создавайте вирусные карусели для Instagram за минуты
                    </p>
                    
                    <div style="margin-bottom: 20px;">
                        <textarea 
                            id="fallbackTopicInput" 
                            placeholder="О чем создать карусель? Например: 'Как зарабатывать на криптовалютах'"
                            style="
                                width: 100%;
                                padding: 15px;
                                border: none;
                                border-radius: 10px;
                                font-size: 16px;
                                resize: vertical;
                                min-height: 80px;
                                box-sizing: border-box;
                            "
                        ></textarea>
                    </div>
                    
                    <button 
                        onclick="window.flashPostApp?.handleFallbackGenerate()" 
                        style="
                            background: #fff;
                            color: #833ab4;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 16px;
                            width: 100%;
                        "
                    >
                        🎯 Создать карусель
                    </button>
                    
                    <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                        Резервный режим • Если проблемы продолжаются, обновите страницу
                    </p>
                </div>
            </div>
        `;
        
        console.log('✅ Резервный стартовый экран отображен');
    }

    // Обработка генерации в резервном режиме
    async handleFallbackGenerate() {
        const input = document.getElementById('fallbackTopicInput');
        if (!input) return;
        
        const topic = input.value.trim();
        if (!topic) {
            alert('Введите тему для карусели');
            return;
        }
        
        console.log('🎯 Генерация в резервном режиме:', topic);
        
        try {
            // Пытаемся использовать обычный метод генерации
            this.handleGenerate();
        } catch (error) {
            console.error('❌ Ошибка генерации в резервном режиме:', error);
            alert('Ошибка создания карусели. Попробуйте обновить страницу.');
        }
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Переход в режим превью - все рендеринг через renderApp()
    async enterPreviewMode() {
        await this.state.setMode("preview");
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // ONLY renderApp() renders UI
        this.renderApp();
        this.updateTelegramButtons();
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Переход в режим редактирования - все рендеринг через renderApp()
    async enterEditMode() {
        await this.state.setMode("edit");
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // ONLY renderApp() renders UI
        this.renderApp();
        this.bindDragEventsToTextBlocks();
        this.updateTelegramButtons();
    }
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Переход в режим экспорта - все рендеринг через renderApp()
    async enterExportMode() {
        await this.state.setMode("export");
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // ONLY renderApp() renders UI
        this.renderApp();
        this.updateTelegramButtons();
    }

    // ===== ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ПРИВЯЗКИ СОБЫТИЙ UI =====

    // Главный метод привязки всех событий UI
    bindUIEvents() {
        const mode = this.state.getMode();
        console.log(`🔗 Привязываем события UI для режима: ${mode}`);
        
        // Очищаем старые обработчики для предотвращения дублирования
        this.clearUIEvents();
        
        // Привязываем события в зависимости от режима
        switch (mode) {
            case 'start':
                this.bindStartEvents();
                break;
            case 'preview':
                this.bindPreviewEvents();
                break;
            case 'edit':
                this.bindEditorEvents();
                break;
            case 'export':
                this.bindExportEvents();
                break;
            default:
                console.warn(`⚠️ Неизвестный режим для привязки событий: ${mode}`);
        }
        
        // Привязываем общие события (модальные окна, etc.)
        this.bindCommonEvents();
        
        console.log(`✅ События UI привязаны для режима: ${mode}`);
    }

    // Очистка старых обработчиков событий
    clearUIEvents() {
        // Получаем все элементы с обработчиками и клонируем их для удаления событий
        const elementsWithEvents = [
            'generateBtn', 'collapseBtn', 'addTextBlockBtn', 'transparentBgBtn',
            'backToPreviewBtn', 'saveEditorBtn', 'saveTemplateBtn', 
            'applyTemplateToSlideBtn', 'applyTemplateToAllBtn', 'prevBtn', 'nextBtn',
            'backToStartBtn', 'downloadCurrentBtn', 'openEditorBtn',
            'confirmSaveTemplateBtn', 'confirmTemplateActionBtn'
        ];
        
        elementsWithEvents.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                // Клонируем элемент для удаления всех обработчиков
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });
        
        console.log('🧹 Старые обработчики событий очищены');
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
        } else {
            console.warn('⚠️ Кнопка generateBtn не найдена');
        }
        
        // Кнопка сворачивания идей
        const collapseBtn = document.getElementById('collapseBtn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => {
                console.log('💡 Клик по кнопке сворачивания идей');
                this.toggleIdeasSection();
            });
            console.log('✅ Кнопка сворачивания идей привязана');
        }
        
        // Поле ввода темы - счетчик символов
        const topicInput = document.getElementById('topicInput');
        const inputCounter = document.getElementById('inputCounter');
        if (topicInput && inputCounter) {
            topicInput.addEventListener('input', () => {
                const length = topicInput.value.length;
                inputCounter.textContent = `${length}/200`;
                
                // Меняем цвет при приближении к лимиту
                if (length > 180) {
                    inputCounter.style.color = '#ff4444';
                } else if (length > 150) {
                    inputCounter.style.color = '#ffaa00';
                } else {
                    inputCounter.style.color = '#666';
                }
            });
            
            // Enter для генерации
            topicInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleGenerate();
                }
            });
            
            console.log('✅ Поле ввода темы привязано');
        }
        
        // Популярные идеи - делегирование событий
        const ideasGrid = document.getElementById('ideasGrid');
        if (ideasGrid) {
            ideasGrid.addEventListener('click', (e) => {
                const ideaItem = e.target.closest('.idea-item');
                if (ideaItem) {
                    const ideaText = ideaItem.textContent.trim();
                    console.log('💡 Выбрана идея:', ideaText);
                    this.selectIdea(ideaText);
                }
            });
            console.log('✅ Сетка идей привязана');
        }
    }

    // События для превью
    bindPreviewEvents() {
        console.log('👁️ Привязываем события превью...');
        
        // Кнопки навигации
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('⬅️ Предыдущий слайд');
                this.previousSlide();
            });
            console.log('✅ Кнопка "Назад" привязана');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('➡️ Следующий слайд');
                this.nextSlide();
            });
            console.log('✅ Кнопка "Вперед" привязана');
        }
        
        // Кнопка редактирования
        const editBtn = document.getElementById('openEditorBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('✏️ Открытие редактора');
                this.enterEditMode();
            });
            console.log('✅ Кнопка редактирования привязана');
        }
        
        // Кнопка скачивания текущего слайда
        const downloadBtn = document.getElementById('downloadCurrentBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                console.log('💾 Скачивание текущего слайда');
                this.exportManager.downloadCurrentSlide();
            });
            console.log('✅ Кнопка скачивания привязана');
        }
        
        // Кнопка "Новая карусель"
        const backBtn = document.getElementById('backToStartBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('🔄 Возврат к началу');
                this.enterStartMode();
            });
            console.log('✅ Кнопка "Новая карусель" привязана');
        }
        
        // Клики по слайдам для навигации
        const slideElements = document.querySelectorAll('.slide-preview');
        slideElements.forEach((slideEl, index) => {
            slideEl.addEventListener('click', () => {
                console.log(`🎯 Переход к слайду ${index}`);
                this.state.setActiveSlideByIndex(index);
                // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
                // ONLY renderApp() renders UI
                this.renderApp();
            });
        });
        
        if (slideElements.length > 0) {
            console.log(`✅ ${slideElements.length} слайдов привязаны для навигации`);
        }
    }

    // События для редактора
    bindEditorEvents() {
        console.log('✏️ Привязываем события редактора...');
        
        // Кнопка добавления текстового блока
        const addBlockBtn = document.getElementById('addTextBlockBtn');
        if (addBlockBtn) {
            addBlockBtn.addEventListener('click', () => {
                console.log('➕ Добавление текстового блока');
                this.addTextBlock();
            });
            console.log('✅ Кнопка добавления блока привязана');
        }
        
        // Кнопка "Назад к превью"
        const backBtn = document.getElementById('backToPreviewBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                console.log('⬅️ Возврат к превью');
                this.enterPreviewMode();
            });
            console.log('✅ Кнопка "Назад к превью" привязана');
        }
        
        // Кнопка "Сохранить"
        const saveBtn = document.getElementById('saveEditorBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('💾 Сохранение изменений');
                this.saveAndExitEditor();
            });
            console.log('✅ Кнопка "Сохранить" привязана');
        }
        
        // Кнопки шаблонов
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => {
                console.log('📄 Сохранение шаблона');
                this.showSaveTemplateModal();
            });
            console.log('✅ Кнопка "Сохранить шаблон" привязана');
        }
        
        const applyToSlideBtn = document.getElementById('applyTemplateToSlideBtn');
        if (applyToSlideBtn) {
            applyToSlideBtn.addEventListener('click', () => {
                console.log('🎯 Применение шаблона к слайду');
                this.showSelectTemplateModal('slide');
            });
            console.log('✅ Кнопка "Применить к слайду" привязана');
        }
        
        const applyToAllBtn = document.getElementById('applyTemplateToAllBtn');
        if (applyToAllBtn) {
            applyToAllBtn.addEventListener('click', () => {
                console.log('📄 Применение шаблона ко всем');
                this.showSelectTemplateModal('all');
            });
            console.log('✅ Кнопка "Применить ко всем" привязана');
        }
        
        // Кнопка прозрачного фона
        const transparentBgBtn = document.getElementById('transparentBgBtn');
        if (transparentBgBtn) {
            transparentBgBtn.addEventListener('click', () => {
                console.log('🎨 Установка прозрачного фона');
                this.setTransparentBackground();
            });
            console.log('✅ Кнопка прозрачного фона привязана');
        }
        
        // Привязываем события для элементов управления шрифтом
        this.bindFontControlEvents();
        
        // Привязываем события для текстовых блоков
        this.bindTextBlockEvents();
    }

    // События для экспорта
    bindExportEvents() {
        console.log('📤 Привязываем события экспорта...');
        
        // В текущей архитектуре экспорт не имеет специального UI
        // События экспорта обрабатываются в других режимах
    }

    // Общие события (модальные окна, etc.)
    bindCommonEvents() {
        console.log('🌐 Привязываем общие события...');
        
        // Модальные окна - делегирование событий
        document.addEventListener('click', (e) => {
            // Закрытие модальных окон по клику на overlay
            if (e.target.classList.contains('modal-overlay')) {
                const modal = e.target;
                const modalId = modal.id;
                if (modalId) {
                    console.log(`❌ Закрытие модального окна: ${modalId}`);
                    this.renderer.closeModal(modalId);
                }
            }
            
            // Кнопки закрытия модальных окон
            if (e.target.classList.contains('modal-close')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    console.log(`❌ Закрытие модального окна через кнопку`);
                    this.renderer.closeModal(modal.id);
                }
            }
        });
        
        // Закрытие модальных окон по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal-overlay');
                openModals.forEach(modal => {
                    console.log(`⌨️ Закрытие модального окна по Escape`);
                    this.renderer.closeModal(modal.id);
                });
            }
        });
        
        console.log('✅ Общие события привязаны');
    }

    // Привязка событий для элементов управления шрифтом
    bindFontControlEvents() {
        console.log('🔤 Привязываем события управления шрифтом...');
        
        // Селектор шрифта
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                const font = e.target.value;
                console.log(`🔤 Изменение шрифта: ${font}`);
                this.updateActiveBlockProperty('font', font);
            });
        }
        
        // Размер шрифта
        const fontSizeRange = document.getElementById('fontSizeRange');
        if (fontSizeRange) {
            fontSizeRange.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                console.log(`📏 Изменение размера шрифта: ${size}`);
                this.updateActiveBlockProperty('size', size);
            });
        }
        
        // Цвет текста
        const textColorPicker = document.getElementById('textColorPicker');
        if (textColorPicker) {
            textColorPicker.addEventListener('change', (e) => {
                const color = e.target.value;
                console.log(`🎨 Изменение цвета текста: ${color}`);
                this.updateActiveBlockProperty('color', color);
            });
        }
        
        // Выравнивание текста
        const alignButtons = document.querySelectorAll('[data-align]');
        alignButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const align = btn.dataset.align;
                console.log(`📐 Изменение выравнивания: ${align}`);
                this.updateActiveBlockProperty('textAlign', align);
                
                // Обновляем активное состояние кнопок
                alignButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        console.log('✅ События управления шрифтом привязаны');
    }

    // Привязка событий для текстовых блоков
    bindTextBlockEvents() {
        console.log('📝 Привязываем события текстовых блоков...');
        
        // Редактируемые текстовые блоки
        const textBlocks = document.querySelectorAll('.slide-text-block-editable');
        textBlocks.forEach(blockEl => {
            const blockId = blockEl.dataset.blockId;
            if (!blockId) return;
            
            // Клик для выбора блока
            blockEl.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`🎯 Выбор текстового блока: ${blockId}`);
                this.selectTextBlock(blockId);
            });
            
            // Двойной клик для редактирования
            blockEl.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                console.log(`✏️ Редактирование текстового блока: ${blockId}`);
                this.startTextBlockEditing(blockId);
            });
            
            // Контекстное меню
            blockEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                console.log(`📋 Контекстное меню для блока: ${blockId}`);
                this.showTextBlockContextMenu(blockId, e.clientX, e.clientY);
            });
        });
        
        if (textBlocks.length > 0) {
            console.log(`✅ ${textBlocks.length} текстовых блоков привязаны`);
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ СОБЫТИЙ UI =====

    // Переключение секции идей
    toggleIdeasSection() {
        const ideasContent = document.getElementById('ideasContent');
        const collapseIcon = document.querySelector('#collapseBtn .collapse-icon');
        
        if (ideasContent && collapseIcon) {
            const isCollapsed = ideasContent.classList.contains('collapsed');
            
            if (isCollapsed) {
                ideasContent.classList.remove('collapsed');
                collapseIcon.textContent = '▲';
                console.log('💡 Секция идей развернута');
            } else {
                ideasContent.classList.add('collapsed');
                collapseIcon.textContent = '▼';
                console.log('💡 Секция идей свернута');
            }
        }
    }

    // Выбор идеи из популярных
    selectIdea(ideaText) {
        const topicInput = document.getElementById('topicInput');
        if (topicInput) {
            topicInput.value = ideaText;
            topicInput.focus();
            
            // Обновляем счетчик символов
            const inputCounter = document.getElementById('inputCounter');
            if (inputCounter) {
                inputCounter.textContent = `${ideaText.length}/200`;
            }
            
            console.log(`💡 Идея выбрана: ${ideaText}`);
        }
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Навигация по слайдам - все рендеринг через renderApp()
    previousSlide() {
        const currentIndex = this.state.getActiveSlideIndex();
        const totalSlides = this.state.getSlidesCount();
        
        if (currentIndex > 0) {
            this.state.setActiveSlideByIndex(currentIndex - 1);
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            this.renderApp();
            console.log(`⬅️ Переход к слайду ${currentIndex - 1}`);
        } else {
            console.log('⬅️ Уже на первом слайде');
        }
    }

    nextSlide() {
        const currentIndex = this.state.getActiveSlideIndex();
        const totalSlides = this.state.getSlidesCount();
        
        if (currentIndex < totalSlides - 1) {
            this.state.setActiveSlideByIndex(currentIndex + 1);
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            this.renderApp();
            console.log(`➡️ Переход к слайду ${currentIndex + 1}`);
        } else {
            console.log('➡️ Уже на последнем слайде');
        }
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Добавление текстового блока - все рендеринг через renderApp()
    addTextBlock() {
        const newBlock = this.state.addTextBlock();
        if (newBlock) {
            console.log(`➕ Добавлен текстовый блок: ${newBlock.id}`);
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            this.renderApp();
            this.bindDragEventsToTextBlocks();
            
            // Выбираем новый блок
            this.selectTextBlock(newBlock.id);
        }
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Установка прозрачного фона - все рендеринг через renderApp()
    setTransparentBackground() {
        const activeSlide = this.state.getActiveSlide();
        if (activeSlide) {
            this.state.updateSlideProperty(activeSlide.id, 'background.color', 'transparent');
            console.log('🎨 Установлен прозрачный фон');
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            this.renderApp();
        }
    }

    // Обновление свойства активного блока
    updateActiveBlockProperty(property, value) {
        const activeBlockId = this.state.project.activeTextBlockId;
        if (activeBlockId) {
            this.state.updateTextBlockProperty(activeBlockId, property, value);
            console.log(`🔧 Обновлено свойство ${property} блока ${activeBlockId}: ${value}`);
        } else {
            console.warn('⚠️ Нет активного текстового блока для обновления');
        }
    }

    // Выбор текстового блока
    selectTextBlock(blockId) {
        // Снимаем выделение с других блоков
        document.querySelectorAll('.slide-text-block-editable').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Выделяем выбранный блок
        const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockEl) {
            blockEl.classList.add('selected');
        }
        
        // Устанавливаем как активный в состоянии
        this.state.setActiveTextBlock(blockId);
        
        console.log(`🎯 Выбран текстовый блок: ${blockId}`);
    }

    // Начало редактирования текстового блока
    startTextBlockEditing(blockId) {
        const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockEl) {
            blockEl.contentEditable = true;
            blockEl.focus();
            
            // Выделяем весь текст
            const range = document.createRange();
            range.selectNodeContents(blockEl);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Обработчик завершения редактирования
            const finishEditing = () => {
                blockEl.contentEditable = false;
                const newText = blockEl.textContent.trim();
                this.state.updateTextBlockProperty(blockId, 'text', newText);
                console.log(`✏️ Текст блока ${blockId} обновлен: ${newText}`);
            };
            
            // Завершение по Enter или потере фокуса
            blockEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    finishEditing();
                }
            }, { once: true });
            
            blockEl.addEventListener('blur', finishEditing, { once: true });
            
            console.log(`✏️ Начато редактирование блока: ${blockId}`);
        }
    }

    // Показ контекстного меню для текстового блока
    showTextBlockContextMenu(blockId, x, y) {
        // Простое контекстное меню
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            padding: 5px 0;
        `;
        
        const menuItems = [
            { text: '✏️ Редактировать', action: () => this.startTextBlockEditing(blockId) },
            { text: '🗑️ Удалить', action: () => this.deleteTextBlock(blockId) },
            { text: '📋 Копировать стили', action: () => this.copyBlockStyles(blockId) }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
            `;
            
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(menu);
            });
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = '#f0f0f0';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'white';
            });
            
            menu.appendChild(menuItem);
        });
        
        document.body.appendChild(menu);
        
        // Закрытие по клику вне меню
        setTimeout(() => {
            document.addEventListener('click', () => {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
            }, { once: true });
        }, 100);
        
        console.log(`📋 Показано контекстное меню для блока: ${blockId}`);
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Удаление текстового блока - все рендеринг через renderApp()
    deleteTextBlock(blockId) {
        if (confirm('Удалить этот текстовый блок?')) {
            this.state.deleteTextBlock(blockId);
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ONLY renderApp() renders UI
            this.renderApp();
            console.log(`🗑️ Удален текстовый блок: ${blockId}`);
        }
    }

    // Копирование стилей блока
    copyBlockStyles(blockId) {
        const block = this.state.getActiveSlide()?.textBlocks.find(b => b.id === blockId);
        if (block) {
            this.copiedBlockStyles = {
                font: block.font,
                size: block.size,
                weight: block.weight,
                color: block.color,
                textAlign: block.textAlign
            };
            console.log(`📋 Скопированы стили блока: ${blockId}`);
            this.showToast('Стили скопированы', 'success');
        }
    }

    // Показ модальных окон шаблонов
    showSaveTemplateModal() {
        if (this.renderer && this.renderer.showSaveTemplateModal) {
            this.renderer.showSaveTemplateModal();
        } else {
            console.warn('⚠️ Метод showSaveTemplateModal не найден в renderer');
        }
    }

    showSelectTemplateModal(mode) {
        if (this.renderer && this.renderer.showSelectTemplateModal) {
            this.renderer.showSelectTemplateModal(mode);
        } else {
            console.warn('⚠️ Метод showSelectTemplateModal не найден в renderer');
        }
    }

    // ===== ОБРАБОТКА ГЕНЕРАЦИИ =====

    // Обработка ручной генерации карусели
    handleGenerate() {
        const topicInput = document.getElementById('topicInput');
        if (!topicInput) return;

        const topic = topicInput.value.trim();
        if (!topic) {
            this.shakeElement(topicInput);
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

            // Анимация формы
            const startSection = document.getElementById('startSection');
            if (startSection) {
                startSection.style.transition = 'all 0.5s ease';
                startSection.style.transform = 'scale(0.95)';
                startSection.style.opacity = '0.7';
            }

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
                
                // Рендерим слайды и открываем редактор
                this.renderApp();
                
                console.log('✅ Карусель создана и готова к редактированию');
                this.showToast(`Карусель "${topic}" создана! ${createdSlides.length} слайдов`, 'success');
                
            }, 500);
            
        } catch (error) {
            console.error('❌ Ошибка генерации карусели:', error);
            
            // Сбрасываем состояние
            this.state.isGenerating = false;
            this.showGenerationLoading(false);
            
            // Восстанавливаем форму
            const startSection = document.getElementById('startSection');
            if (startSection) {
                startSection.style.transform = 'scale(1)';
                startSection.style.opacity = '1';
            }
            
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
            
            // Устанавливаем первый слайд как активный
            if (createdSlides.length > 0) {
                this.state.setActiveSlideByIndex(0);
                console.log('✅ Установлен активный слайд: 0');
            }
            
            // ЭТАП 5: Рендеринг и переход к превью
            this.showGenerationLoading(true, 'Финализация...', 95);
            
            // Небольшая пауза для плавности
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Переходим к превью карусели
            console.log('🎯 Переходим к превью карусели...');
            await this.enterPreviewMode();
            
            // ЭТАП 6: Завершение
            this.showGenerationLoading(true, 'Готово!', 100);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.showToast('✅ Карусель создана!', 'success');
            console.log('🎉 Генерация карусели завершена успешно');
            
        } catch (error) {
            console.error('❌ Ошибка генерации карусели:', error);
            
            // Показываем детальную ошибку пользователю
            let errorMessage = 'Ошибка создания карусели. ';
            
            if (error.message.includes('AI не вернул')) {
                errorMessage += 'Попробуйте изменить тему или повторить попытку.';
            } else if (error.message.includes('валидации')) {
                errorMessage += 'Проблема с обработкой ответа AI.';
            } else if (error.message.includes('сеть') || error.message.includes('network')) {
                errorMessage += 'Проверьте подключение к интернету.';
            } else {
                errorMessage += 'Попробуйте еще раз.';
            }
            
            this.showToast(errorMessage, 'error');
            
            // Возвращаем форму в исходное состояние
            const startSection = document.getElementById('startSection');
            if (startSection) {
                startSection.style.transform = 'scale(1)';
                startSection.style.opacity = '1';
            }
            
        } finally {
            this.state.isGenerating = false;
            this.showGenerationLoading(false);
        }
    }

    // Валидация и парсинг слайдов от AI
    validateAndParseSlides(slidesData, topic) {
        console.log('🔍 Валидируем структуру слайдов...');
        
        if (!Array.isArray(slidesData)) {
            throw new Error('Данные слайдов не являются массивом');
        }
        
        const validatedSlides = [];
        
        slidesData.forEach((slideData, index) => {
            try {
                // Базовая валидация структуры слайда
                const slide = {
                    title: this.validateSlideTitle(slideData.title, index),
                    text: this.validateSlideText(slideData.text, index),
                    type: this.determineSlideType(index, slidesData.length),
                    autoKeywords: Array.isArray(slideData.autoKeywords) ? slideData.autoKeywords : [],
                    background: {
                        type: 'color',
                        color: this.getSlideBackgroundColor(index, slidesData.length),
                        image: null,
                        x: 50,
                        y: 50,
                        brightness: 100
                    }
                };
                
                validatedSlides.push(slide);
                console.log(`✅ Слайд ${index + 1} валидирован: "${slide.title}"`);
                
            } catch (error) {
                console.warn(`⚠️ Ошибка валидации слайда ${index + 1}:`, error.message);
                
                // Создаем fallback слайд
                const fallbackSlide = {
                    title: `Слайд ${index + 1}`,
                    text: `Контент для темы "${topic}"`,
                    type: 'content',
                    autoKeywords: [],
                    background: {
                        type: 'color',
                        color: '#833ab4',
                        image: null,
                        x: 50,
                        y: 50,
                        brightness: 100
                    }
                };
                
                validatedSlides.push(fallbackSlide);
            }
        });
        
        if (validatedSlides.length === 0) {
            throw new Error('Не удалось создать ни одного валидного слайда');
        }
        
        console.log(`✅ Валидировано ${validatedSlides.length} слайдов`);
        return validatedSlides;
    }

    // Валидация заголовка слайда
    validateSlideTitle(title, index) {
        if (typeof title === 'string' && title.trim().length > 0) {
            return title.trim().substring(0, 100); // Ограничиваем длину
        }
        return `Слайд ${index + 1}`;
    }

    // Валидация текста слайда
    validateSlideText(text, index) {
        if (typeof text === 'string' && text.trim().length > 0) {
            return text.trim().substring(0, 500); // Ограничиваем длину
        }
        return `Содержимое слайда ${index + 1}`;
    }

    // Определение типа слайда
    determineSlideType(index, totalSlides) {
        if (index === 0) {
            return 'hook'; // Первый слайд - хук
        } else if (index === totalSlides - 1) {
            return 'cta'; // Последний слайд - призыв к действию
        } else {
            return 'content'; // Средние слайды - контент
        }
    }

    // Получение цвета фона для слайда
    getSlideBackgroundColor(index, totalSlides) {
        const colors = [
            '#833ab4', // Фиолетовый для хука
            '#fd1d1d', // Красный для контента
            '#fcb045', // Оранжевый для контента
            '#833ab4', // Фиолетовый для контента
            '#fd1d1d', // Красный для контента
            '#fcb045', // Оранжевый для контента
            '#28a745'  // Зеленый для CTA
        ];
        
        if (index === totalSlides - 1) {
            return '#28a745'; // Зеленый для последнего слайда (CTA)
        }
        
        return colors[index % colors.length] || '#833ab4';
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
                            textAlign: blockData.textAlign || 'center',
                            keywordHighlighting: {
                                autoHighlight: true,
                                autoKeywordColor: '#4A90E2',
                                keywordColor: '#E74C3C',
                                glowEnabled: true,
                                glowIntensity: 0.3
                            }
                        });
                        console.log(`✅ Создан текстовый блок: ${textBlock.id}`);
                    });
                } else {
                    // Создаем основной текстовый блок для слайда
                    const textBlock = this.state.createTextBlock(slide.id, {
                        text: slideData.subtitle || slideData.text || slideData.title,
                        x: 10,
                        y: 40,
                        width: 80,
                        font: 'Inter',
                        size: 18,
                        weight: 500,
                        color: '#ffffff',
                        textAlign: 'center',
                        keywordHighlighting: {
                            autoHighlight: true,
                            autoKeywordColor: '#4A90E2',
                            keywordColor: '#E74C3C',
                            glowEnabled: true,
                            glowIntensity: 0.3
                        }
                    });
                    console.log(`✅ Создан основной текстовый блок: ${textBlock.id}`);
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

    // Получение размера текста в зависимости от типа слайда
    getSlideTextSize(slideType) {
        switch (slideType) {
            case 'hook':
                return 24; // Крупный текст для хука
            case 'cta':
                return 20; // Средний текст для CTA
            default:
                return 18; // Обычный текст для контента
        }
    }

    // Получение веса шрифта в зависимости от типа слайда
    getSlideTextWeight(slideType) {
        switch (slideType) {
            case 'hook':
                return 900; // Очень жирный для хука
            case 'cta':
                return 800; // Жирный для CTA
            default:
                return 700; // Полужирный для контента
        }
    }

    // Улучшенное отображение загрузки с прогрессом
    showGenerationLoading(show, message = '', percentage = 0) {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) return;
        
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoader = generateBtn.querySelector('.btn-loader');
        
        if (show) {
            generateBtn.disabled = true;
            
            if (btnText) {
                if (message && percentage > 0) {
                    btnText.textContent = `${message} ${percentage}%`;
                } else if (message) {
                    btnText.textContent = message;
                } else {
                    btnText.textContent = 'Генерируем...';
                }
                btnText.style.display = 'block';
            }
            
            if (btnLoader) {
                btnLoader.style.display = 'flex';
            }
            
            // Добавляем визуальный прогресс-бар
            this.updateProgressBar(percentage);
            
        } else {
            generateBtn.disabled = false;
            
            if (btnText) {
                btnText.style.display = 'block';
                btnText.textContent = '🎯 Создать карусель';
            }
            
            if (btnLoader) {
                btnLoader.style.display = 'none';
            }
            
            // Скрываем прогресс-бар
            this.hideProgressBar();
        }
    }

    // Обновление прогресс-бара
    updateProgressBar(percentage) {
        let progressBar = document.getElementById('generation-progress-bar');
        
        if (!progressBar) {
            // Создаем прогресс-бар если его нет
            progressBar = document.createElement('div');
            progressBar.id = 'generation-progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045);
                z-index: 10000;
                transition: width 0.3s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
    }

    // Скрытие прогресс-бара
    hideProgressBar() {
        const progressBar = document.getElementById('generation-progress-bar');
        if (progressBar) {
            setTimeout(() => {
                if (progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
            }, 500);
        }
    }

    // ===== ПРИВЯЗКА DRAG & DROP =====

    // Привязка drag событий к текстовым блокам
    bindDragEventsToTextBlocks() {
        const textBlocks = document.querySelectorAll('.slide-text-block-editable');
        
        textBlocks.forEach(blockEl => {
            const blockId = blockEl.dataset.blockId;
            if (blockId) {
                this.dragManager.bindTextBlockDragEvents(blockEl, blockId);
            }
        });
        
        console.log(`✅ Drag события привязаны к ${textBlocks.length} текстовым блокам`);
    }

    // ===== TELEGRAM WEBAPP ИНТЕГРАЦИЯ =====

    // Инициализация Telegram WebApp
    initTelegramWebApp() {
        if (this.tg) {
            console.log('🚀 Инициализация Telegram WebApp...');
            
            // ✅ КРИТИЧНО: Обязательная последовательность
            this.tg.ready();
            console.log('✅ Telegram WebApp ready() вызван');
            
            // ✅ КРИТИЧНО: expand() для полной высоты
            this.tg.expand();
            console.log('✅ Telegram WebApp expand() вызван - WebView развернут на полную высоту');
            
            // Логируем размеры viewport
            console.log('📊 Viewport info:', {
                height: this.tg.viewportHeight || 'unknown',
                stableHeight: this.tg.viewportStableHeight || 'unknown',
                isExpanded: this.tg.isExpanded || 'unknown'
            });
            
            // Проверяем версию API перед использованием методов цвета
            const version = this.tg.version || '6.0';
            const majorVersion = parseFloat(version);
            
            console.log('📱 Telegram WebApp версия:', version);
            
            // setHeaderColor и setBackgroundColor поддерживаются только в версии 6.1+
            if (majorVersion >= 6.1) {
                this.tg.setHeaderColor('#833ab4');
                this.tg.setBackgroundColor('#ffffff');
                console.log('✅ Telegram WebApp цвета установлены (версия ' + version + ')');
            } else {
                console.log('ℹ️ Цвета заголовка не поддерживаются в версии ' + version);
            }
            
            // Настройка главной кнопки
            this.tg.MainButton.setText('Создать карусель');
            this.tg.MainButton.color = '#833ab4';
            this.tg.MainButton.textColor = '#ffffff';
            
            // Дополнительные настройки для лучшего UX
            if (this.tg.enableClosingConfirmation) {
                this.tg.enableClosingConfirmation();
                console.log('✅ Подтверждение закрытия включено');
            }
            
            console.log('✅ Telegram WebApp полностью настроен');
        } else {
            console.log('ℹ️ Telegram WebApp недоступен (запуск вне Telegram)');
        }
    }

    // Настройка темы
    setupTheme() {
        if (this.tg?.colorScheme) {
            document.documentElement.setAttribute('data-theme', this.tg.colorScheme);
        }
    }

    // Обновление кнопок Telegram WebApp
    updateTelegramButtons() {
        if (!this.tg) return;
        
        switch (this.state.getMode()) {
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
                this.tg.BackButton.onClick(() => this.enterPreviewMode());
                break;
                
            case "export":
                this.tg.MainButton.setText('Скачать');
                this.tg.MainButton.onClick(() => this.exportManager.downloadAllSlides());
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.enterPreviewMode());
                break;
        }
    }

    // Сохранение и выход из редактора
    saveAndExitEditor() {
        console.log('💾 Изменения сохранены');
        this.enterPreviewMode();
    }

    // ===== UI УТИЛИТЫ =====

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // renderApp() is the ONLY entry point for UI rendering
    // All future features must be mounted inside this layout
    // CRITICAL: This method MUST ALWAYS show visible UI
    async renderApp() {
        console.log('🔒 STABLE BOOTSTRAP: renderApp() called');
        
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // CRITICAL: If #app is missing, create fallback UI
        if (!app) {
            console.error('❌ CRITICAL: #app element not found - creating fallback');
            this.renderCriticalFallbackUI();
            return;
        }
        
        // Hide loading screen with smooth transition
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // ALWAYS show app container
        app.style.display = 'block';
        app.style.opacity = '1';
        
        try {
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // CRITICAL: Ensure state is initialized before rendering
            if (!this.state || this.state.getSlidesCount() === 0) {
                console.log('🔧 Initializing default state...');
                await this.initializeDefaultState();
            }
            
            // Get current mode for rendering
            const currentMode = this.state.getMode();
            console.log(`🎯 Rendering mode: ${currentMode}`);
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // Use renderer to populate app content - this is the ONLY place renderer.render() is called
            this.renderer.render();
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // ALWAYS bind UI events after render
            this.bindUIEvents();
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // Load additional features inside stable layout
            this.loadAdditionalFeatures();
            
            console.log('✅ STABLE BOOTSTRAP: App rendered successfully');
            
        } catch (error) {
            console.error('❌ STABLE BOOTSTRAP: Render error:', error);
            
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // CRITICAL: Even on error, show visible UI
            this.renderErrorUI(error);
        }
    }
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Critical fallback when even #app element is missing
    renderCriticalFallbackUI() {
        console.log('🚨 STABLE BOOTSTRAP: Rendering CRITICAL fallback UI');
        
        // Create app element if it doesn't exist
        let app = document.getElementById('app');
        if (!app) {
            app = document.createElement('div');
            app.id = 'app';
            document.body.appendChild(app);
            console.log('🔧 Created missing #app element');
        }
        
        // Hide loading if it exists
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Show critical fallback UI
        app.style.display = 'block';
        app.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10000;
            ">
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                ">
                    <h1 style="margin: 0 0 20px 0; font-size: 24px;">🚨 Critical Bootstrap Error</h1>
                    <p style="margin: 0 0 20px 0; opacity: 0.9; line-height: 1.5;">
                        The application encountered a critical error during initialization. 
                        The DOM structure may be corrupted.
                    </p>
                    <div style="margin: 20px 0;">
                        <button onclick="window.location.reload()" style="
                            background: #fff;
                            color: #333;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            margin-right: 10px;
                        ">
                            🔄 Reload Page
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: 1px solid rgba(255,255,255,0.3);
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            ❌ Dismiss
                        </button>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                        🔒 STABLE BOOTSTRAP — Critical Fallback Active
                    </p>
                </div>
            </div>
        `;
        
        console.log('✅ STABLE BOOTSTRAP: Critical fallback UI rendered');
    }
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Fallback UI when #app element is missing
    renderFallbackUI() {
        console.log('🚨 STABLE BOOTSTRAP: Rendering fallback UI');
        
        const fallbackHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 10000;
            ">
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    text-align: center;
                    max-width: 400px;
                ">
                    <h1 style="margin: 0 0 20px 0; font-size: 24px;">🚨 Bootstrap Error</h1>
                    <p style="margin: 0 0 20px 0; opacity: 0.9;">
                        Critical DOM elements missing. Please refresh the page.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: #fff;
                        color: #333;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        🔄 Refresh Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    }
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Error UI when rendering fails - ALWAYS shows visible UI
    renderErrorUI(error) {
        console.log('🚨 STABLE BOOTSTRAP: Rendering error UI');
        
        const app = document.getElementById('app');
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // CRITICAL: Even if app is missing, create it
        if (!app) {
            this.renderCriticalFallbackUI();
            return;
        }
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // ALWAYS show visible error UI
        app.style.display = 'block';
        app.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                text-align: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                color: #333;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 100%;
                ">
                    <h1 style="color: #dc3545; margin-bottom: 20px; font-size: 24px;">⚠️ Render Error</h1>
                    <p style="margin-bottom: 20px; line-height: 1.5; color: #666;">
                        The application encountered an error during rendering, but the stable bootstrap 
                        system prevented a complete failure.
                    </p>
                    <div style="margin: 20px 0;">
                        <button onclick="window.location.reload()" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-right: 10px;
                            font-weight: 600;
                        ">
                            🔄 Reload App
                        </button>
                        <button onclick="window.flashPostApp?.renderApp()" style="
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-right: 10px;
                            font-weight: 600;
                        ">
                            🔧 Retry Render
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: 600;
                        ">
                            ❌ Dismiss
                        </button>
                    </div>
                    <details style="margin-top: 20px; text-align: left;">
                        <summary style="cursor: pointer; font-weight: 600; color: #007bff;">Technical Details</summary>
                        <div style="
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 10px;
                            border-left: 4px solid #dc3545;
                        ">
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc3545;">Error Message:</p>
                            <p style="margin: 0 0 15px 0; font-family: monospace; font-size: 14px;">${error.message}</p>
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #dc3545;">Stack Trace:</p>
                            <pre style="
                                background: #ffffff;
                                padding: 10px;
                                border-radius: 3px;
                                margin: 0;
                                font-size: 12px;
                                overflow: auto;
                                max-height: 200px;
                                border: 1px solid #dee2e6;
                            ">${error.stack}</pre>
                        </div>
                    </details>
                    <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
                        🔒 STABLE BOOTSTRAP — Error Recovery Active
                    </p>
                </div>
            </div>
        `;
        
        console.log('✅ STABLE BOOTSTRAP: Error UI rendered with recovery options');
    }
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Load additional features after main app is rendered
    loadAdditionalFeatures() {
        try {
            // Load quick ideas if in start mode
            if (this.state.getMode() === 'start' && this.editor && this.editor.loadQuickIdeas) {
                setTimeout(() => {
                    this.editor.loadQuickIdeas();
                }, 100);
            }
            
            // Initialize Telegram WebApp features
            this.updateTelegramButtons();
            
            console.log('✅ Additional features loaded');
            
        } catch (error) {
            console.warn('⚠️ Error loading additional features:', error);
            // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
            // Don't break the main app for additional features
        }
    }

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Validation method to ensure stable bootstrap is working
    validateStableBootstrap() {
        const validationResults = {
            appElementExists: !!document.getElementById('app'),
            loadingElementExists: !!document.getElementById('loading'),
            appVisible: false,
            stateInitialized: !!this.state,
            rendererAvailable: !!this.renderer,
            hasSlides: this.state ? this.state.getSlidesCount() > 0 : false,
            currentMode: this.state ? this.state.getMode() : 'unknown'
        };
        
        const app = document.getElementById('app');
        if (app) {
            const computedStyle = window.getComputedStyle(app);
            validationResults.appVisible = computedStyle.display !== 'none' && computedStyle.opacity !== '0';
        }
        
        const isValid = validationResults.appElementExists && 
                       validationResults.appVisible && 
                       validationResults.stateInitialized && 
                       validationResults.rendererAvailable;
        
        console.log('🔒 STABLE BOOTSTRAP Validation:', {
            isValid,
            ...validationResults
        });
        
        return { isValid, ...validationResults };
    }

    // Показ приложения с ошибкой
    showAppWithError(error) {
        console.log('🚨 Показываем приложение с обработкой ошибки...');
        
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading) {
            loading.style.display = 'none';
        }
        
        if (app) {
            app.style.display = 'block';
            app.innerHTML = `
                <div class="error-screen" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    padding: 20px;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                ">
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 30px;
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                        max-width: 400px;
                    ">
                        <h1 style="margin: 0 0 20px 0; font-size: 24px;">⚠️ Ошибка инициализации</h1>
                        <p style="margin: 0 0 20px 0; opacity: 0.9;">
                            Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.
                        </p>
                        <button onclick="window.location.reload()" style="
                            background: #fff;
                            color: #333;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            🔄 Обновить страницу
                        </button>
                        <details style="margin-top: 20px; text-align: left;">
                            <summary style="cursor: pointer; opacity: 0.7;">Детали ошибки</summary>
                            <pre style="
                                background: rgba(0,0,0,0.3);
                                padding: 10px;
                                border-radius: 5px;
                                margin-top: 10px;
                                font-size: 12px;
                                overflow: auto;
                                max-height: 200px;
                            ">${error.message}\n\n${error.stack}</pre>
                        </details>
                    </div>
                </div>
            `;
        }
    }

    // Показ/скрытие загрузки
    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) return;
        
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoader = generateBtn.querySelector('.btn-loader');
        
        if (show) {
            generateBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'flex';
        } else {
            generateBtn.disabled = false;
            if (btnText) {
                btnText.style.display = 'block';
                btnText.textContent = '🎯 Создать карусель';
            }
            if (btnLoader) btnLoader.style.display = 'none';
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

    // Показ уведомления
    showToast(message, type = 'info') {
        // Создаем элемент уведомления
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Добавляем стили
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Показываем с анимацией
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Убираем через 3 секунды
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Тактильная обратная связь
    hapticFeedback(type = 'medium') {
        if (this.tg?.HapticFeedback) {
            if (type === 'light') {
                this.tg.HapticFeedback.impactOccurred('light');
            } else if (type === 'heavy') {
                this.tg.HapticFeedback.impactOccurred('heavy');
            } else {
                this.tg.HapticFeedback.impactOccurred('medium');
            }
        }
    }

    // ===== ОБРАБОТКА ОШИБОК =====

    // Глобальный обработчик ошибок
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('❌ Глобальная ошибка:', event.error);
            this.showToast('Произошла ошибка. Перезагрузите приложение.', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Необработанное отклонение промиса:', event.reason);
            this.showToast('Ошибка сети. Проверьте подключение.', 'error');
        });
    }

    // ===== МЕТОДЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ =====

    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // Legacy render method - redirects to renderApp() for stability
    render() {
        console.log('⚠️ Legacy render() called - redirecting to renderApp()');
        return this.renderApp();
    }

    getMode() {
        return this.state.getMode();
    }

    isMode(mode) {
        return this.state.isMode(mode);
    }

    setMode(mode) {
        return this.state.setMode(mode);
    }

    getActiveSlide() {
        return this.state.getActiveSlide();
    }

    getActiveSlideIndex() {
        return this.state.getActiveSlideIndex();
    }

    setActiveSlideByIndex(index) {
        return this.state.setActiveSlideByIndex(index);
    }

    addTextBlock() {
        return this.state.addTextBlock();
    }

    updateTextBlockProperty(blockId, property, value) {
        return this.state.updateTextBlockProperty(blockId, property, value);
    }

    downloadCurrentSlide() {
        return this.exportManager.downloadCurrentSlide();
    }

    downloadAllSlides() {
        return this.exportManager.downloadAllSlides();
    }

    saveTemplate() {
        return this.exportManager.saveTemplate();
    }

    // Методы drag & drop
    startDrag(e, blockId) {
        return this.dragManager.startDrag(e, blockId);
    }

    onDragMove(e) {
        return this.dragManager.onDragMove(e);
    }

    stopDrag(e) {
        return this.dragManager.stopDrag(e);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====

// 🔒 STABLE BOOTSTRAP — DO NOT BREAK
// Function to initialize FlashPost App with guaranteed visible UI
function initFlashPostApp() {
    console.log('🚀 Попытка инициализации FlashPost App...');
    console.log('📊 DOM состояние:', document.readyState);
    console.log('🌐 URL:', window.location.href);
    
    // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
    // CRITICAL: Always ensure basic DOM structure exists
    ensureBasicDOMStructure();
    
    // Check if all modules are loaded
    const requiredModules = [
        'StateManager',
        'Renderer',
        'Editor',
        'DragManager',
        'ExportManager',
        'AIManager',
        'TemplateManager'
    ];
    
    const missingModules = [];
    const loadedModules = [];
    
    requiredModules.forEach(module => {
        if (typeof window[module] === 'undefined') {
            missingModules.push(module);
        } else {
            loadedModules.push(module);
        }
    });
    
    console.log('✅ Загружено модулей:', loadedModules);
    
    if (missingModules.length > 0) {
        console.error('❌ Не все модули загружены:', missingModules);
        console.log('⏳ Повторная попытка через 1000мс...');
        setTimeout(initFlashPostApp, 1000);
        return;
    }
    
    // Check for required DOM elements
    const requiredElements = ['app', 'loading'];
    const missingElements = [];
    
    requiredElements.forEach(elementId => {
        if (!document.getElementById(elementId)) {
            missingElements.push(elementId);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('❌ Не найдены необходимые DOM элементы:', missingElements);
        console.log('🔧 Создаем недостающие элементы...');
        ensureBasicDOMStructure();
        
        // Try again after creating elements
        setTimeout(initFlashPostApp, 500);
        return;
    }
    
    try {
        console.log('🔧 Создаем экземпляр FlashPostApp...');
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // Create global app instance
        window.flashPostApp = new FlashPostApp();
        
        console.log('✅ FlashPost App успешно инициализировано');
        console.log('📱 Приложение доступно как window.flashPostApp');
        console.log('🎯 Состояние приложения:', {
            mode: window.flashPostApp.state.getMode(),
            slidesCount: window.flashPostApp.state.getSlidesCount(),
            hasRenderer: !!window.flashPostApp.renderer,
            hasEditor: !!window.flashPostApp.editor
        });
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // Validate that bootstrap is working
        setTimeout(() => {
            const validation = window.flashPostApp.validateStableBootstrap();
            if (!validation.isValid) {
                console.warn('⚠️ Bootstrap validation failed, attempting recovery...');
                window.flashPostApp.renderApp();
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Ошибка инициализации FlashPost App:', error);
        console.error('📋 Stack trace:', error.stack);
        
        // 🔒 STABLE BOOTSTRAP — DO NOT BREAK
        // CRITICAL: Even if FlashPostApp fails, show fallback UI
        showCriticalFallbackUI(error);
    }
}

// 🔒 STABLE BOOTSTRAP — DO NOT BREAK
// Ensure basic DOM structure exists
function ensureBasicDOMStructure() {
    console.log('🔧 Ensuring basic DOM structure...');
    
    // Ensure #loading exists
    let loading = document.getElementById('loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'loading';
        loading.innerHTML = `
            <div class="loading-icon">⚡</div>
            <div class="loading-text">FlashPost Mini App</div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        document.body.appendChild(loading);
        console.log('✅ Created #loading element');
    }
    
    // Ensure #app exists
    let app = document.getElementById('app');
    if (!app) {
        app = document.createElement('div');
        app.id = 'app';
        app.className = 'app';
        app.style.cssText = `
            display: none;
            min-height: 100vh;
        `;
        document.body.appendChild(app);
        console.log('✅ Created #app element');
    }
}

// 🔒 STABLE BOOTSTRAP — DO NOT BREAK
// Critical fallback UI when everything fails
function showCriticalFallbackUI(error) {
    console.log('🚨 Showing critical fallback UI');
    
    // Hide loading
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    // Get or create app element
    let app = document.getElementById('app');
    if (!app) {
        app = document.createElement('div');
        app.id = 'app';
        document.body.appendChild(app);
    }
    
    app.style.display = 'block';
    app.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 10000;
        ">
            <div style="
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                text-align: center;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            ">
                <h1 style="margin: 0 0 20px 0; font-size: 24px;">🚨 Initialization Failed</h1>
                <p style="margin: 0 0 20px 0; opacity: 0.9; line-height: 1.5;">
                    The application failed to initialize, but the stable bootstrap system 
                    prevented a complete failure.
                </p>
                <div style="margin: 20px 0;">
                    <button onclick="window.location.reload()" style="
                        background: #fff;
                        color: #333;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        margin-right: 10px;
                    ">
                        🔄 Reload Page
                    </button>
                    <button onclick="initFlashPostApp()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        🔧 Retry Init
                    </button>
                </div>
                <details style="margin-top: 20px; text-align: left;">
                    <summary style="cursor: pointer; opacity: 0.8;">Error Details</summary>
                    <pre style="
                        background: rgba(0,0,0,0.3);
                        padding: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                        font-size: 12px;
                        overflow: auto;
                        max-height: 200px;
                    ">${error.message}\n\n${error.stack}</pre>
                </details>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    🔒 STABLE BOOTSTRAP — Critical Fallback Active
                </p>
            </div>
        </div>
    `;
}

// Ждем загрузки DOM и всех скриптов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Увеличиваем задержку для defer скриптов
        setTimeout(initFlashPostApp, 500);
    });
} else {
    // DOM уже загружен, но defer скрипты могут еще загружаться
    setTimeout(initFlashPostApp, 500);
}

// Также пробуем инициализировать при полной загрузке страницы
window.addEventListener('load', () => {
    if (!window.flashPostApp) {
        console.log('🔄 Повторная попытка инициализации при window.load');
        setTimeout(initFlashPostApp, 200);
    }
});

// Дополнительная попытка через 2 секунды
setTimeout(() => {
    if (!window.flashPostApp) {
        console.log('🔄 Финальная попытка инициализации через 2 секунды');
        initFlashPostApp();
    }
}, 2000);

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashPostApp;
} else {
    window.FlashPostApp = FlashPostApp;
}