// ===== TELEGRAM MINI APP - FLASHPOST AI - ПОЛНАЯ ВЕРСИЯ =====

class FlashPostMiniApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentSlide = 0;
        this.slides = [];
        this.isGenerating = false;
        this.hapticEnabled = true;
        this.currentEditingSlide = 0;
        this.slideStyles = [];
        
        console.log('🚀 Инициализация FlashPost Mini App...');
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
            
            // Загрузка быстрых идей
            this.loadQuickIdeas();
            
            // Скрытие экрана загрузки
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1000);
            
            console.log('✅ Mini App инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации Mini App:', error);
        }
    }

    // Инициализация Telegram WebApp
    initTelegramWebApp() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            // Настройка цветовой схемы
            this.tg.setHeaderColor('#833ab4');
            this.tg.setBackgroundColor('#ffffff');
            
            // Настройка главной кнопки
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

    // Скрытие экрана загрузки
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loadingScreen && appContainer) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                appContainer.style.display = 'block';
                appContainer.style.opacity = '0';
                setTimeout(() => {
                    appContainer.style.opacity = '1';
                }, 50);
            }, 300);
        } else {
            console.warn('⚠️ Элементы загрузочного экрана не найдены');
        }
    }

    // Привязка событий
    bindEvents() {
        try {
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

            // Главная кнопка Telegram
            if (this.tg?.MainButton) {
                this.tg.MainButton.onClick(() => this.handleGenerate());
            }
            
            console.log('✅ События мини-приложения привязаны');
        } catch (error) {
            console.error('❌ Ошибка привязки событий мини-приложения:', error);
        }
    }

    // Загрузка быстрых идей
    loadQuickIdeas() {
        const ideas = [
            "Здоровое питание",
            "Продуктивность", 
            "Финансы",
            "Спорт и фитнес",
            "Саморазвитие",
            "Путешествия",
            "Технологии",
            "Бизнес"
        ];

        const ideasGrid = document.getElementById('ideasGrid');
        if (ideasGrid) {
            ideasGrid.innerHTML = '';
            
            ideas.forEach(idea => {
                const ideaElement = document.createElement('div');
                ideaElement.className = 'idea-item-mini';
                ideaElement.textContent = idea;
                ideaElement.addEventListener('click', () => {
                    const topicInput = document.getElementById('topicInput');
                    if (topicInput) {
                        topicInput.value = idea;
                        this.updateInputCounter();
                        this.hapticFeedback();
                    }
                });
                ideasGrid.appendChild(ideaElement);
            });
        }
    }

    // Обновление счетчика символов
    updateInputCounter() {
        const topicInput = document.getElementById('topicInput');
        const inputCounter = document.getElementById('inputCounter');
        
        if (topicInput && inputCounter) {
            const length = topicInput.value.length;
            inputCounter.textContent = `${length}/200`;
            
            // Показать/скрыть главную кнопку Telegram
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

            // Генерация слайдов
            const slides = await this.generateSlides(topic);
            this.slides = slides;
            this.initializeSlideStyles();
            
            // Показ карусели
            this.showCarousel();
            
            this.showToast('✅ Карусель создана!', 'success');
        } catch (error) {
            console.error('❌ Ошибка генерации:', error);
            this.showToast('Ошибка создания карусели', 'error');
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
        }
    }

    // Генерация слайдов
    async generateSlides(topic) {
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return [
            { type: 'hook', text: `🔥 Секреты ${topic.toLowerCase()}, которые изменят вашу жизнь` },
            { type: 'problem', text: `❌ Главная ошибка в ${topic.toLowerCase()}` },
            { type: 'solution', text: `✅ Проверенный метод для ${topic.toLowerCase()}` },
            { type: 'proof', text: `📊 Результаты применения в ${topic.toLowerCase()}` },
            { type: 'action', text: `🎯 Ваш план действий по ${topic.toLowerCase()}` }
        ];
    }

    // Инициализация стилей слайдов
    initializeSlideStyles() {
        const colors = ['#833ab4', '#fd1d1d', '#fcb045', '#28a745', '#007bff', '#6f42c1'];
        
        this.slideStyles = this.slides.map((_, index) => ({
            backgroundColor: colors[index % colors.length],
            textColor: '#ffffff',
            fontSize: 16,
            fontFamily: 'Inter'
        }));
    }

    // Показ карусели
    showCarousel() {
        const quickStartSection = document.getElementById('quickStartSection');
        const carouselSection = document.getElementById('carouselSection');
        
        if (quickStartSection && carouselSection) {
            quickStartSection.style.display = 'none';
            carouselSection.style.display = 'block';
            
            this.renderCarousel();
            
            // Настройка кнопок Telegram
            if (this.tg) {
                this.tg.MainButton.setText('Редактировать');
                this.tg.MainButton.onClick(() => this.openEditor());
                
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.backToStart());
            }
        }
    }

    // Рендер карусели
    renderCarousel() {
        const carouselSection = document.getElementById('carouselSection');
        if (!carouselSection) return;

        carouselSection.innerHTML = `
            <div class="carousel-header">
                <h2>Ваша карусель готова!</h2>
                <p>Слайдов: ${this.slides.length}</p>
            </div>
            
            <div class="carousel-container">
                <div class="carousel-track" id="carouselTrack">
                    ${this.slides.map((slide, index) => `
                        <div class="carousel-slide ${index === this.currentSlide ? 'active' : ''}" data-index="${index}">
                            <div class="slide-content">
                                <div class="slide-text">${slide.text}</div>
                            </div>
                            <div class="slide-number">${index + 1}/${this.slides.length}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="carousel-navigation">
                    <button class="nav-btn" id="prevBtn" ${this.currentSlide === 0 ? 'disabled' : ''}>‹</button>
                    <div class="slide-indicators">
                        ${this.slides.map((_, index) => `
                            <div class="indicator ${index === this.currentSlide ? 'active' : ''}" data-index="${index}"></div>
                        `).join('')}
                    </div>
                    <button class="nav-btn" id="nextBtn" ${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                </div>
            </div>
            
            <div class="carousel-actions">
                <button class="btn-secondary" id="backToStartBtn">← Новая карусель</button>
                <button class="btn-primary" id="openEditorBtn">✏️ Редактировать</button>
            </div>
        `;

        this.bindCarouselEvents();
    }

    // Привязка событий карусели
    bindCarouselEvents() {
        console.log('🔗 Привязка событий карусели...');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backToStartBtn = document.getElementById('backToStartBtn');
        const openEditorBtn = document.getElementById('openEditorBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Previous button clicked');
                this.previousSlide();
            });
            console.log('✅ Previous button event bound');
        } else {
            console.warn('⚠️ Previous button not found');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Next button clicked');
                this.nextSlide();
            });
            console.log('✅ Next button event bound');
        } else {
            console.warn('⚠️ Next button not found');
        }

        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Back to start clicked');
                this.backToStart();
            });
            console.log('✅ Back to start button event bound');
        } else {
            console.warn('⚠️ Back to start button not found');
        }

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Open editor clicked');
                this.openEditor();
            });
            console.log('✅ Open editor button event bound');
        } else {
            console.warn('⚠️ Open editor button not found');
        }

        // Индикаторы
        const indicators = document.querySelectorAll('.indicator');
        console.log(`🎯 Found ${indicators.length} indicators`);
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Indicator clicked:', index);
                this.goToSlide(index);
            });
        });

        // Свайп навигация
        this.setupSwipeNavigation();
        
        console.log('✅ Все события карусели привязаны');
    }

    // Навигация по слайдам
    previousSlide() {
        console.log('Previous slide called, current:', this.currentSlide);
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    nextSlide() {
        console.log('Next slide called, current:', this.currentSlide);
        if (this.currentSlide < this.slides.length - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    goToSlide(index) {
        console.log('Go to slide:', index, 'from:', this.currentSlide);
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.updateCarouselView();
            this.hapticFeedback();
        }
    }

    // Обновление вида карусели
    updateCarouselView() {
        console.log('🔄 Updating carousel view, current slide:', this.currentSlide);
        
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        console.log(`Found ${slides.length} slides, ${indicators.length} indicators`);

        // Обновляем активный слайд
        slides.forEach((slide, index) => {
            const isActive = index === this.currentSlide;
            slide.classList.toggle('active', isActive);
            console.log(`Slide ${index}: ${isActive ? 'active' : 'inactive'}`);
        });

        // Обновляем индикаторы
        indicators.forEach((indicator, index) => {
            const isActive = index === this.currentSlide;
            indicator.classList.toggle('active', isActive);
        });

        // Обновляем кнопки навигации
        if (prevBtn) {
            const shouldDisable = this.currentSlide === 0;
            prevBtn.disabled = shouldDisable;
            prevBtn.style.opacity = shouldDisable ? '0.3' : '1';
            console.log('Prev button disabled:', shouldDisable);
        }
        
        if (nextBtn) {
            const shouldDisable = this.currentSlide === this.slides.length - 1;
            nextBtn.disabled = shouldDisable;
            nextBtn.style.opacity = shouldDisable ? '0.3' : '1';
            console.log('Next button disabled:', shouldDisable);
        }
        
        // Принудительная перерисовка
        requestAnimationFrame(() => {
            console.log('✅ Carousel view updated');
        });
    }

    // Настройка свайп навигации
    setupSwipeNavigation() {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) {
            console.warn('⚠️ Carousel track not found for swipe setup');
            return;
        }

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Проверяем, что это быстрый горизонтальный свайп
            if (Math.abs(deltaX) > Math.abs(deltaY) && 
                Math.abs(deltaX) > 50 && 
                deltaTime < 300) {
                
                console.log('Swipe detected:', deltaX > 0 ? 'right' : 'left');
                
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }, { passive: true });
        
        console.log('✅ Swipe navigation setup complete');
    }

    // Открытие редактора
    openEditor() {
        const carouselSection = document.getElementById('carouselSection');
        const editorSection = document.getElementById('editorSection');
        
        if (carouselSection && editorSection) {
            carouselSection.style.display = 'none';
            editorSection.style.display = 'block';
            
            this.currentEditingSlide = this.currentSlide;
            this.renderEditor();
            
            // Настройка кнопок Telegram
            if (this.tg) {
                this.tg.MainButton.setText('Сохранить');
                this.tg.MainButton.onClick(() => this.saveAndExit());
                
                this.tg.BackButton.show();
                this.tg.BackButton.onClick(() => this.exitEditor());
            }
        }
    }

    // Рендер редактора в стиле Canva
    renderEditor() {
        const editorSection = document.getElementById('editorSection');
        if (!editorSection) return;

        const currentSlide = this.slides[this.currentEditingSlide];
        const currentStyles = this.slideStyles[this.currentEditingSlide];

        editorSection.innerHTML = `
            <div class="editor-header">
                <div class="editor-title">Редактор</div>
                <div class="editor-slide-nav">
                    <button class="editor-nav-btn" id="editorPrevBtn" ${this.currentEditingSlide === 0 ? 'disabled' : ''}>‹</button>
                    <div class="editor-slide-counter">${this.currentEditingSlide + 1}/${this.slides.length}</div>
                    <button class="editor-nav-btn" id="editorNextBtn" ${this.currentEditingSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                </div>
            </div>
            
            <div class="editor-content">
                <div class="editor-preview">
                    <div class="editor-preview-container">
                        <button class="editor-preview-nav prev" id="editorPreviewPrev" ${this.currentEditingSlide === 0 ? 'disabled' : ''}>‹</button>
                        <div class="slide-preview-mini" id="slidePreviewMini">
                            <div class="slide-preview-text" id="slidePreviewText">${currentSlide.text}</div>
                        </div>
                        <button class="editor-preview-nav next" id="editorPreviewNext" ${this.currentEditingSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                    </div>
                </div>
                
                <div class="editor-tools">
                    <div class="tool-section">
                        <label class="tool-label">Текст</label>
                        <textarea class="text-editor-canva" id="textEditor" placeholder="Введите текст слайда...">${currentSlide.text}</textarea>
                    </div>
                    
                    <div class="tool-section">
                        <label class="tool-label">Размер</label>
                        <div class="slider-container-canva">
                            <input type="range" class="slider-canva" id="fontSizeSlider" min="12" max="24" value="${currentStyles.fontSize}">
                            <div class="slider-value-canva" id="fontSizeValue">${currentStyles.fontSize}px</div>
                        </div>
                    </div>
                    
                    <div class="tool-section">
                        <label class="tool-label">Шрифт</label>
                        <div class="option-buttons-canva">
                            <button class="option-btn-canva ${currentStyles.fontFamily === 'Inter' ? 'active' : ''}" data-font="Inter">Inter</button>
                            <button class="option-btn-canva ${currentStyles.fontFamily === 'Arial' ? 'active' : ''}" data-font="Arial">Arial</button>
                            <button class="option-btn-canva ${currentStyles.fontFamily === 'Georgia' ? 'active' : ''}" data-font="Georgia">Georgia</button>
                        </div>
                    </div>
                    
                    <div class="tool-section">
                        <label class="tool-label">Фон</label>
                        <div class="option-buttons-canva">
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#833ab4' ? 'active' : ''}" data-bg="#833ab4" style="background: #833ab4;" title="Фиолетовый"></button>
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#fd1d1d' ? 'active' : ''}" data-bg="#fd1d1d" style="background: #fd1d1d;" title="Красный"></button>
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#fcb045' ? 'active' : ''}" data-bg="#fcb045" style="background: #fcb045;" title="Оранжевый"></button>
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#28a745' ? 'active' : ''}" data-bg="#28a745" style="background: #28a745;" title="Зеленый"></button>
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#007bff' ? 'active' : ''}" data-bg="#007bff" style="background: #007bff;" title="Синий"></button>
                            <button class="color-btn-canva ${currentStyles.backgroundColor === '#6f42c1' ? 'active' : ''}" data-bg="#6f42c1" style="background: #6f42c1;" title="Индиго"></button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="editor-actions-canva">
                <button class="editor-btn-canva secondary" id="exitEditorBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Назад
                </button>
                <button class="editor-btn-canva success" id="downloadSlidesBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Скачать
                </button>
                <button class="editor-btn-canva primary" id="saveAndExitBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Готово
                </button>
            </div>
        `;

        this.bindEditorEvents();
        this.updatePreview();
    }

    // Привязка событий редактора
    bindEditorEvents() {
        console.log('🔗 Привязка событий редактора...');
        
        // Навигация по слайдам в редакторе
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        const editorPreviewPrev = document.getElementById('editorPreviewPrev');
        const editorPreviewNext = document.getElementById('editorPreviewNext');
        
        if (editorPrevBtn) {
            editorPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Editor prev clicked');
                this.previousEditorSlide();
            });
            console.log('✅ Editor prev button event bound');
        }
        
        if (editorNextBtn) {
            editorNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Editor next clicked');
                this.nextEditorSlide();
            });
            console.log('✅ Editor next button event bound');
        }

        // Навигация в превью редактора
        if (editorPreviewPrev) {
            editorPreviewPrev.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Editor preview prev clicked');
                this.previousEditorSlide();
            });
            console.log('✅ Editor preview prev button event bound');
        }
        
        if (editorPreviewNext) {
            editorPreviewNext.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Editor preview next clicked');
                this.nextEditorSlide();
            });
            console.log('✅ Editor preview next button event bound');
        }

        // Кнопки действий
        const exitEditorBtn = document.getElementById('exitEditorBtn');
        const downloadSlidesBtn = document.getElementById('downloadSlidesBtn');
        const saveAndExitBtn = document.getElementById('saveAndExitBtn');

        if (exitEditorBtn) {
            exitEditorBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Exit editor clicked');
                this.exitEditor();
            });
            console.log('✅ Exit editor button event bound');
        }

        if (downloadSlidesBtn) {
            downloadSlidesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Download slides clicked');
                this.downloadSlides();
            });
            console.log('✅ Download slides button event bound');
        }

        if (saveAndExitBtn) {
            saveAndExitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Save and exit clicked');
                this.saveAndExit();
            });
            console.log('✅ Save and exit button event bound');
        }

        // Текстовый редактор
        const textEditor = document.getElementById('textEditor');
        if (textEditor) {
            textEditor.addEventListener('input', (e) => {
                this.slides[this.currentEditingSlide].text = e.target.value;
                this.updatePreview();
            });
            console.log('✅ Text editor event bound');
        }

        // Слайдер размера шрифта
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', (e) => {
                const fontSize = parseInt(e.target.value);
                this.slideStyles[this.currentEditingSlide].fontSize = fontSize;
                const fontSizeValue = document.getElementById('fontSizeValue');
                if (fontSizeValue) {
                    fontSizeValue.textContent = fontSize + 'px';
                }
                this.updatePreview();
            });
            console.log('✅ Font size slider event bound');
        }

        // Кнопки шрифтов
        const fontButtons = document.querySelectorAll('[data-font]');
        console.log(`🎯 Found ${fontButtons.length} font buttons`);
        
        fontButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const font = btn.getAttribute('data-font');
                this.slideStyles[this.currentEditingSlide].fontFamily = font;
                
                // Обновляем активную кнопку
                fontButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updatePreview();
                this.hapticFeedback();
            });
        });

        // Кнопки цвета фона
        const colorButtons = document.querySelectorAll('[data-bg]');
        console.log(`🎯 Found ${colorButtons.length} color buttons`);
        
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const bg = btn.getAttribute('data-bg');
                this.slideStyles[this.currentEditingSlide].backgroundColor = bg;
                
                // Обновляем активную кнопку
                colorButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updatePreview();
                this.hapticFeedback();
            });
        });
        
        console.log('✅ Все события редактора привязаны');
    }

    // Навигация в редакторе
    previousEditorSlide() {
        if (this.currentEditingSlide > 0) {
            this.currentEditingSlide--;
            this.renderEditor();
        }
    }

    nextEditorSlide() {
        if (this.currentEditingSlide < this.slides.length - 1) {
            this.currentEditingSlide++;
            this.renderEditor();
        }
    }

    // Обновление превью
    updatePreview() {
        const slidePreviewMini = document.getElementById('slidePreviewMini');
        const slidePreviewText = document.getElementById('slidePreviewText');
        
        if (slidePreviewMini && slidePreviewText) {
            const currentSlide = this.slides[this.currentEditingSlide];
            const currentStyles = this.slideStyles[this.currentEditingSlide];
            
            slidePreviewText.textContent = currentSlide.text;
            slidePreviewText.style.fontSize = currentStyles.fontSize + 'px';
            slidePreviewText.style.fontFamily = currentStyles.fontFamily;
            slidePreviewMini.style.background = currentStyles.backgroundColor;
        }
    }

    // Сохранение и выход
    saveAndExit() {
        this.exitEditor();
        this.showToast('✅ Изменения сохранены!', 'success');
    }

    // Выход из редактора
    exitEditor() {
        const carouselSection = document.getElementById('carouselSection');
        const editorSection = document.getElementById('editorSection');
        
        if (carouselSection && editorSection) {
            editorSection.style.display = 'none';
            carouselSection.style.display = 'block';
            
            // Обновляем карусель с новыми данными
            this.renderCarousel();
            this.goToSlide(this.currentEditingSlide);
            
            // Настройка кнопок Telegram
            if (this.tg) {
                this.tg.MainButton.setText('Редактировать');
                this.tg.MainButton.onClick(() => this.openEditor());
            }
        }
    }

    // Скачивание слайдов
    async downloadSlides() {
        try {
            this.showToast('📥 Подготавливаем слайды для скачивания...', 'info');
            
            // Создаем canvas для каждого слайда
            for (let i = 0; i < this.slides.length; i++) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Размер Instagram поста
                canvas.width = 1080;
                canvas.height = 1080;
                
                const slide = this.slides[i];
                const styles = this.slideStyles[i];
                
                // Рисуем фон
                ctx.fillStyle = styles.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Рисуем текст
                ctx.fillStyle = styles.textColor;
                ctx.font = `${styles.fontSize * 3}px ${styles.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Разбиваем текст на строки
                const words = slide.text.split(' ');
                const lines = [];
                let currentLine = '';
                
                for (const word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > canvas.width - 100) {
                        if (currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            lines.push(word);
                        }
                    } else {
                        currentLine = testLine;
                    }
                }
                
                if (currentLine) {
                    lines.push(currentLine);
                }
                
                // Рисуем строки
                const lineHeight = styles.fontSize * 4;
                const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
                
                lines.forEach((line, index) => {
                    ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
                });
                
                // Добавляем номер слайда
                ctx.font = '36px Inter';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText(`${i + 1}/${this.slides.length}`, canvas.width - 30, 30);
                
                // Скачиваем слайд
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `slide-${i + 1}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 'image/png');
                
                // Небольшая задержка между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            this.showToast('✅ Все слайды скачаны!', 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка скачивания:', error);
            this.showToast('❌ Ошибка скачивания слайдов', 'error');
        }
    }

    // Возврат к началу
    backToStart() {
        const quickStartSection = document.getElementById('quickStartSection');
        const carouselSection = document.getElementById('carouselSection');
        const editorSection = document.getElementById('editorSection');
        
        if (quickStartSection) {
            if (carouselSection) carouselSection.style.display = 'none';
            if (editorSection) editorSection.style.display = 'none';
            quickStartSection.style.display = 'block';
            
            // Сброс состояния
            this.currentSlide = 0;
            this.slides = [];
            this.slideStyles = [];
            
            // Настройка кнопок Telegram
            if (this.tg) {
                this.tg.MainButton.setText('Создать карусель');
                this.tg.MainButton.onClick(() => this.handleGenerate());
                this.tg.BackButton.hide();
            }
        }
    }

    // Открытие ручного ввода
    openManualInput() {
        console.log('📝 Открытие ручного ввода');
        const manualModal = document.getElementById('manualModal');
        if (manualModal) {
            manualModal.style.display = 'flex';
            
            // Очищаем поле ввода и фокусируемся
            const manualTextInput = document.getElementById('manualTextInput');
            if (manualTextInput) {
                manualTextInput.value = '';
                manualTextInput.focus();
            }
            
            // Привязываем события модального окна
            this.bindManualModalEvents();
        } else {
            this.showToast('Модальное окно не найдено', 'error');
        }
    }

    // Привязка событий модального окна ручного ввода
    bindManualModalEvents() {
        const closeManualBtn = document.getElementById('closeManualBtn');
        const cancelManualBtn = document.getElementById('cancelManualBtn');
        const createManualBtn = document.getElementById('createManualBtn');
        const manualModal = document.getElementById('manualModal');
        const manualTextInput = document.getElementById('manualTextInput');

        // Закрытие модального окна
        if (closeManualBtn) {
            closeManualBtn.onclick = () => {
                manualModal.style.display = 'none';
            };
        }

        if (cancelManualBtn) {
            cancelManualBtn.onclick = () => {
                manualModal.style.display = 'none';
            };
        }

        // Создание карусели из текста
        if (createManualBtn) {
            createManualBtn.onclick = () => {
                this.createManualCarousel();
            };
        }

        // Обновление статистики и горячие клавиши
        if (manualTextInput) {
            manualTextInput.oninput = () => {
                this.updateManualInputStats();
            };

            manualTextInput.onkeydown = (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.createManualCarousel();
                }
            };
        }

        // Закрытие по клику вне модального окна
        manualModal.onclick = (e) => {
            if (e.target === manualModal) {
                manualModal.style.display = 'none';
            }
        };
    }

    // Обновление статистики ручного ввода
    updateManualInputStats() {
        const manualTextInput = document.getElementById('manualTextInput');
        const manualCharCount = document.getElementById('manualCharCount');
        const manualSlideCount = document.getElementById('manualSlideCount');

        if (!manualTextInput || !manualCharCount || !manualSlideCount) return;

        const inputText = manualTextInput.value;
        const charCount = inputText.length;

        // Подсчет слайдов
        let slideCount = 0;
        if (inputText.trim()) {
            // Пробуем разделить по двойному пробелу
            let slides = inputText.split('  ').map(text => text.trim()).filter(text => text);
            
            // Если нет двойных пробелов, пробуем по двойному переносу
            if (slides.length === 1) {
                slides = inputText.split('\n\n').map(text => text.trim()).filter(text => text);
            }
            
            // Если всё ещё один слайд, считаем по строкам
            if (slides.length === 1) {
                const lines = inputText.split('\n').map(text => text.trim()).filter(text => text);
                slideCount = Math.min(lines.length, 15);
            } else {
                slideCount = Math.min(slides.length, 15);
            }
        }

        manualCharCount.textContent = `${charCount} символов`;
        manualSlideCount.textContent = `${slideCount} слайдов`;
    }

    // Создание карусели из ручного ввода
    createManualCarousel() {
        const manualTextInput = document.getElementById('manualTextInput');
        const manualModal = document.getElementById('manualModal');

        if (!manualTextInput) {
            this.showToast('Ошибка: поле ввода не найдено', 'error');
            return;
        }

        const inputText = manualTextInput.value.trim();
        
        if (!inputText) {
            this.showToast('Введите текст для создания карусели', 'error');
            manualTextInput.focus();
            return;
        }

        try {
            // Создаем слайды из текста
            const slides = this.generateSlidesFromText(inputText);
            this.slides = slides;
            this.currentSlide = 0;
            
            // Инициализируем стили слайдов
            this.initializeSlideStyles();
            
            // Показываем карусель
            this.showCarousel();
            
            // Закрываем модальное окно
            if (manualModal) {
                manualModal.style.display = 'none';
            }

            this.showToast(`✅ Карусель из ${slides.length} слайдов создана!`, 'success');
            console.log('✅ Карусель создана из ручного ввода:', slides.length, 'слайдов');
            
        } catch (error) {
            console.error('❌ Ошибка создания карусели:', error);
            this.showToast(`❌ Ошибка: ${error.message}`, 'error');
        }
    }

    // Генерация слайдов из текста
    generateSlidesFromText(text) {
        console.log('📝 Создание слайдов из текста...');
        
        // Разделяем текст на слайды по двойному пробелу
        let slideTexts = text.split('  ').map(text => text.trim()).filter(text => text);
        
        // Если нет двойных пробелов, пробуем разделить по переносам строк
        if (slideTexts.length === 1) {
            slideTexts = text.split('\n\n').map(text => text.trim()).filter(text => text);
        }
        
        // Если всё ещё один слайд, разделяем по одинарным переносам
        if (slideTexts.length === 1) {
            const lines = text.split('\n').map(text => text.trim()).filter(text => text);
            if (lines.length > 1) {
                slideTexts = lines.slice(0, 15); // Ограничиваем 15 слайдами
            }
        }

        // Проверяем результат
        if (slideTexts.length === 0) {
            throw new Error('Текст не содержит слайдов');
        }

        if (slideTexts.length > 15) {
            slideTexts = slideTexts.slice(0, 15);
            this.showToast('⚠️ Ограничено 15 слайдами', 'warning');
        }

        // Создаём слайды
        return slideTexts.map((slideText, index) => ({
            type: index === 0 ? 'hook' : (index === slideTexts.length - 1 ? 'cta' : 'content'),
            text: slideText
        }));
    }

    // Показ/скрытие загрузки
    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            const btnText = generateBtn.querySelector('.btn-text');
            const btnLoader = generateBtn.querySelector('.btn-loader');
            
            if (show) {
                generateBtn.disabled = true;
                if (btnText) btnText.style.display = 'none';
                if (btnLoader) btnLoader.style.display = 'block';
            } else {
                generateBtn.disabled = false;
                if (btnText) btnText.style.display = 'block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        }
    }

    // Haptic feedback
    hapticFeedback() {
        if (this.hapticEnabled && this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    }

    // Показ уведомлений
    showToast(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Используем Telegram уведомления если доступны
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
        } else {
            // Fallback для браузера
            alert(message);
        }
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FlashPostMiniApp();
});

// Экспорт для глобального доступа
window.FlashPostMiniApp = FlashPostMiniApp;