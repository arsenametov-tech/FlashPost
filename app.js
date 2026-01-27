// ===== FLASHPOST AI - МИНИ-ПРИЛОЖЕНИЕ =====

class FlashPostApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentSlide = 0;
        this.slides = [];
        this.isGenerating = false;
        this.currentEditingSlide = 0;
        this.slideStyles = [];
        
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
            
            // Загрузка быстрых идей
            this.loadQuickIdeas();
            
            // Показ приложения
            setTimeout(() => {
                this.showApp();
            }, 1000);
            
            console.log('✅ Приложение инициализировано');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
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
                app.innerHTML = this.renderStartScreen();
                this.bindStartEvents();
            }, 300);
        }
    }

    // Рендер главного экрана
    renderStartScreen() {
        return `
            <div class="section active" id="startSection">
                <div class="start-section">
                    <div class="header">
                        <h1 class="title">⚡ FlashPost AI</h1>
                        <p class="subtitle">Создай карусель за 30 секунд</p>
                    </div>
                    
                    <div class="ideas">
                        <h3>💡 Популярные темы</h3>
                        <div class="ideas-grid" id="ideasGrid">
                            <!-- Заполняется JS -->
                        </div>
                    </div>
                    
                    <div class="input-section">
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
                    
                    <div class="input-section">
                        <label class="input-label">Instagram (будет на слайдах)</label>
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                id="instagramInput" 
                                class="topic-input" 
                                placeholder="@your_instagram"
                                maxlength="50"
                                style="resize: none; height: auto; min-height: 44px;"
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

        // Главная кнопка Telegram
        if (this.tg?.MainButton) {
            this.tg.MainButton.onClick(() => this.handleGenerate());
        }

        // Кнопка назад Telegram
        if (this.tg?.BackButton) {
            this.tg.BackButton.onClick(() => this.goBack());
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
                ideaElement.className = 'idea';
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

            const slides = await this.generateSlides(topic);
            this.slides = slides;
            this.initializeSlideStyles();
            
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
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = this.renderCarousel();
        this.bindCarouselEvents();
        
        if (this.tg) {
            this.tg.MainButton.setText('Редактировать');
            this.tg.MainButton.onClick(() => this.openEditor());
            
            this.tg.BackButton.show();
            this.tg.BackButton.onClick(() => this.goBack());
        }
    }

    // Рендер карусели
    renderCarousel() {
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        
        return `
            <div class="section active" id="carouselSection">
                <div class="carousel-section">
                    <div class="carousel-header">
                        <h2>Ваша карусель готова!</h2>
                        <p>Слайдов: ${this.slides.length}</p>
                    </div>
                    
                    <div class="carousel-container">
                        <div class="carousel-track" id="carouselTrack">
                            ${this.slides.map((slide, index) => {
                                const isFirstSlide = index === 0;
                                const isLastSlide = index === this.slides.length - 1;
                                const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;
                                
                                return `
                                    <div class="slide ${index === this.currentSlide ? 'active' : ''}" data-index="${index}">
                                        <div class="slide-text">${slide.text}</div>
                                        <div class="slide-number">${index + 1}/${this.slides.length}</div>
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
                            <button class="nav-btn" id="prevBtn" ${this.currentSlide === 0 ? 'disabled' : ''}>‹</button>
                            <div class="indicators">
                                ${this.slides.map((_, index) => `
                                    <div class="indicator ${index === this.currentSlide ? 'active' : ''}" data-index="${index}"></div>
                                `).join('')}
                            </div>
                            <button class="nav-btn" id="nextBtn" ${this.currentSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                        </div>
                    </div>
                    
                    <div class="actions">
                        <button class="btn btn-secondary" id="backToStartBtn">← Новая карусель</button>
                        <button class="btn btn-primary" id="openEditorBtn">✏️ Редактировать</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий карусели
    bindCarouselEvents() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backToStartBtn = document.getElementById('backToStartBtn');
        const openEditorBtn = document.getElementById('openEditorBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', () => this.goBack());
        }

        if (openEditorBtn) {
            openEditorBtn.addEventListener('click', () => this.openEditor());
        }

        // Индикаторы
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Свайп навигация
        this.setupSwipeNavigation();
    }

    // Навигация по слайдам
    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
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

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.slides.length - 1;
        }
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
    openEditor() {
        const app = document.getElementById('app');
        if (!app) return;

        this.currentEditingSlide = this.currentSlide;
        app.innerHTML = this.renderEditor();
        this.bindEditorEvents();
        
        if (this.tg) {
            this.tg.MainButton.setText('Сохранить');
            this.tg.MainButton.onClick(() => this.saveAndExit());
            
            this.tg.BackButton.show();
            this.tg.BackButton.onClick(() => this.exitEditor());
        }
    }

    // Рендер редактора
    renderEditor() {
        const currentSlide = this.slides[this.currentEditingSlide];
        const currentStyles = this.slideStyles[this.currentEditingSlide];
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const isFirstSlide = this.currentEditingSlide === 0;
        const isLastSlide = this.currentEditingSlide === this.slides.length - 1;
        const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;

        return `
            <div class="section active" id="editorSection">
                <div class="editor-section">
                    <div class="editor-header">
                        <div class="editor-title">Редактор</div>
                        <div class="editor-nav">
                            <button class="editor-nav-btn" id="editorPrevBtn" ${this.currentEditingSlide === 0 ? 'disabled' : ''}>‹</button>
                            <div class="editor-counter" id="editorCounter">${this.currentEditingSlide + 1}/${this.slides.length}</div>
                            <button class="editor-nav-btn" id="editorNextBtn" ${this.currentEditingSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                        </div>
                    </div>
                    
                    <div class="editor-content">
                        <div class="editor-preview">
                            <div class="preview-container">
                                <button class="preview-nav" id="previewPrev" ${this.currentEditingSlide === 0 ? 'disabled' : ''}>‹</button>
                                <div class="slide-preview" id="slidePreview">
                                    <div class="preview-text" id="previewText">${currentSlide.text}</div>
                                    ${showInstagram ? `
                                        <div class="preview-instagram">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                                <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                                                <circle cx="12" cy="12" r="3"/>
                                                <circle cx="17.5" cy="6.5" r="1.5"/>
                                            </svg>
                                            ${instagramContact}
                                        </div>
                                    ` : ''}
                                </div>
                                <button class="preview-nav" id="previewNext" ${this.currentEditingSlide === this.slides.length - 1 ? 'disabled' : ''}>›</button>
                            </div>
                            <div class="editor-indicators">
                                ${this.slides.map((_, index) => `
                                    <div class="editor-indicator ${index === this.currentEditingSlide ? 'active' : ''}" data-index="${index}"></div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="editor-tools">
                            <div class="tool-section">
                                <label class="tool-label">Текст</label>
                                <textarea class="text-editor" id="textEditor" placeholder="Введите текст слайда...">${currentSlide.text}</textarea>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Размер</label>
                                <div class="slider-container">
                                    <input type="range" class="slider" id="fontSizeSlider" min="12" max="24" value="${currentStyles.fontSize}">
                                    <div class="slider-value" id="fontSizeValue">${currentStyles.fontSize}px</div>
                                </div>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Шрифт</label>
                                <div class="option-buttons">
                                    <button class="option-btn ${currentStyles.fontFamily === 'Inter' ? 'active' : ''}" data-font="Inter">Inter</button>
                                    <button class="option-btn ${currentStyles.fontFamily === 'Arial' ? 'active' : ''}" data-font="Arial">Arial</button>
                                    <button class="option-btn ${currentStyles.fontFamily === 'Georgia' ? 'active' : ''}" data-font="Georgia">Georgia</button>
                                </div>
                            </div>
                            
                            <div class="tool-section">
                                <label class="tool-label">Фон</label>
                                <div class="option-buttons">
                                    <button class="color-btn ${currentStyles.backgroundColor === '#833ab4' ? 'active' : ''}" data-bg="#833ab4" style="background: #833ab4;"></button>
                                    <button class="color-btn ${currentStyles.backgroundColor === '#fd1d1d' ? 'active' : ''}" data-bg="#fd1d1d" style="background: #fd1d1d;"></button>
                                    <button class="color-btn ${currentStyles.backgroundColor === '#fcb045' ? 'active' : ''}" data-bg="#fcb045" style="background: #fcb045;"></button>
                                    <button class="color-btn ${currentStyles.backgroundColor === '#28a745' ? 'active' : ''}" data-bg="#28a745" style="background: #28a745;"></button>
                                    <button class="color-btn ${currentStyles.backgroundColor === '#007bff' ? 'active' : ''}" data-bg="#007bff" style="background: #007bff;"></button>
                                    <button class="color-btn ${currentStyles.backgroundColor === '#6f42c1' ? 'active' : ''}" data-bg="#6f42c1" style="background: #6f42c1;"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="editor-actions">
                        <button class="editor-btn secondary" id="exitEditorBtn">← Назад</button>
                        <button class="editor-btn success" id="downloadSlidesBtn">📥 Скачать</button>
                        <button class="editor-btn primary" id="saveAndExitBtn">✓ Готово</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Привязка событий редактора
    bindEditorEvents() {
        // Навигация в редакторе
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        const previewPrev = document.getElementById('previewPrev');
        const previewNext = document.getElementById('previewNext');
        
        if (editorPrevBtn) {
            editorPrevBtn.addEventListener('click', () => this.previousEditorSlide());
        }
        
        if (editorNextBtn) {
            editorNextBtn.addEventListener('click', () => this.nextEditorSlide());
        }

        if (previewPrev) {
            previewPrev.addEventListener('click', () => this.previousEditorSlide());
        }
        
        if (previewNext) {
            previewNext.addEventListener('click', () => this.nextEditorSlide());
        }

        // Кнопки действий
        const exitEditorBtn = document.getElementById('exitEditorBtn');
        const downloadSlidesBtn = document.getElementById('downloadSlidesBtn');
        const saveAndExitBtn = document.getElementById('saveAndExitBtn');

        if (exitEditorBtn) {
            exitEditorBtn.addEventListener('click', () => this.exitEditor());
        }

        if (downloadSlidesBtn) {
            downloadSlidesBtn.addEventListener('click', () => this.downloadSlides());
        }

        if (saveAndExitBtn) {
            saveAndExitBtn.addEventListener('click', () => this.saveAndExit());
        }

        // Текстовый редактор
        const textEditor = document.getElementById('textEditor');
        if (textEditor) {
            textEditor.addEventListener('input', (e) => {
                this.slides[this.currentEditingSlide].text = e.target.value;
                this.updatePreview();
            });
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
        }

        // Кнопки шрифтов
        document.querySelectorAll('[data-font]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const font = btn.getAttribute('data-font');
                this.slideStyles[this.currentEditingSlide].fontFamily = font;
                
                document.querySelectorAll('[data-font]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updatePreview();
                this.hapticFeedback();
            });
        });

        // Кнопки цвета фона
        document.querySelectorAll('[data-bg]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bg = btn.getAttribute('data-bg');
                this.slideStyles[this.currentEditingSlide].backgroundColor = bg;
                
                document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updatePreview();
                this.hapticFeedback();
            });
        });

        // Свайп навигация для превью
        this.setupEditorSwipeNavigation();

        // Индикаторы в редакторе
        document.querySelectorAll('.editor-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (index !== this.currentEditingSlide) {
                    this.currentEditingSlide = index;
                    this.updateEditorSlide();
                }
            });
        });
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

    // Навигация в редакторе
    previousEditorSlide() {
        if (this.currentEditingSlide > 0) {
            this.currentEditingSlide--;
            this.updateEditorSlide();
        }
    }

    nextEditorSlide() {
        if (this.currentEditingSlide < this.slides.length - 1) {
            this.currentEditingSlide++;
            this.updateEditorSlide();
        }
    }

    // Обновление слайда в редакторе без перерисовки
    updateEditorSlide() {
        const currentSlide = this.slides[this.currentEditingSlide];
        const currentStyles = this.slideStyles[this.currentEditingSlide];
        
        // Обновляем счетчик
        const editorCounter = document.getElementById('editorCounter');
        if (editorCounter) {
            editorCounter.textContent = `${this.currentEditingSlide + 1}/${this.slides.length}`;
        }
        
        // Обновляем кнопки навигации в хедере
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        if (editorPrevBtn) {
            editorPrevBtn.disabled = this.currentEditingSlide === 0;
        }
        if (editorNextBtn) {
            editorNextBtn.disabled = this.currentEditingSlide === this.slides.length - 1;
        }
        
        // Обновляем кнопки навигации у превью
        const previewPrev = document.getElementById('previewPrev');
        const previewNext = document.getElementById('previewNext');
        if (previewPrev) {
            previewPrev.disabled = this.currentEditingSlide === 0;
        }
        if (previewNext) {
            previewNext.disabled = this.currentEditingSlide === this.slides.length - 1;
        }
        
        // Обновляем текстовый редактор
        const textEditor = document.getElementById('textEditor');
        if (textEditor) {
            textEditor.value = currentSlide.text;
        }
        
        // Обновляем слайдер размера шрифта
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = currentStyles.fontSize;
            fontSizeValue.textContent = currentStyles.fontSize + 'px';
        }
        
        // Обновляем активные кнопки шрифтов
        document.querySelectorAll('[data-font]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-font') === currentStyles.fontFamily);
        });
        
        // Обновляем активные кнопки цветов
        document.querySelectorAll('[data-bg]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-bg') === currentStyles.backgroundColor);
        });
        
        // Обновляем индикаторы
        document.querySelectorAll('.editor-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentEditingSlide);
        });
        
        // Обновляем превью
        this.updatePreview();
        
        // Haptic feedback
        this.hapticFeedback();
        
        console.log(`📝 Переключен на слайд ${this.currentEditingSlide + 1}`);
    }

    // Обновление превью
    updatePreview() {
        const slidePreview = document.getElementById('slidePreview');
        const previewText = document.getElementById('previewText');
        
        if (slidePreview && previewText) {
            const currentSlide = this.slides[this.currentEditingSlide];
            const currentStyles = this.slideStyles[this.currentEditingSlide];
            const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
            const isFirstSlide = this.currentEditingSlide === 0;
            const isLastSlide = this.currentEditingSlide === this.slides.length - 1;
            const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;
            
            // Добавляем класс анимации
            slidePreview.classList.add('updating');
            
            setTimeout(() => {
                previewText.textContent = currentSlide.text;
                previewText.style.fontSize = currentStyles.fontSize + 'px';
                previewText.style.fontFamily = currentStyles.fontFamily;
                slidePreview.style.background = currentStyles.backgroundColor;
                
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
                
                // Убираем класс анимации
                slidePreview.classList.remove('updating');
            }, 150);
        }
    }

    // Сохранение и выход
    saveAndExit() {
        this.exitEditor();
        this.showToast('✅ Изменения сохранены!', 'success');
    }

    // Выход из редактора
    exitEditor() {
        this.currentSlide = this.currentEditingSlide;
        this.showCarousel();
    }

    // Скачивание слайдов
    async downloadSlides() {
        try {
            this.showToast('📥 Подготавливаем слайды для скачивания...', 'info');
            
            const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
            
            for (let i = 0; i < this.slides.length; i++) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 1080;
                canvas.height = 1080;
                
                const slide = this.slides[i];
                const styles = this.slideStyles[i];
                const isFirstSlide = i === 0;
                const isLastSlide = i === this.slides.length - 1;
                const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;
                
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
                
                // Добавляем Instagram контакт
                if (showInstagram) {
                    ctx.font = '32px Inter';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'bottom';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillText(`📷 ${instagramContact}`, 30, canvas.height - 30);
                }
                
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
                
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            this.showToast('✅ Все слайды скачаны!', 'success');
            this.hapticFeedback();
            
        } catch (error) {
            console.error('❌ Ошибка скачивания:', error);
            this.showToast('❌ Ошибка скачивания слайдов', 'error');
        }
    }

    // Возврат назад
    goBack() {
        const app = document.getElementById('app');
        if (!app) return;

        this.currentSlide = 0;
        this.slides = [];
        this.slideStyles = [];
        
        app.innerHTML = this.renderStartScreen();
        this.bindStartEvents();
        this.loadQuickIdeas();
        
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
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred('medium');
        }
    }

    // Показ уведомлений
    showToast(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
        } else {
            // Создаем toast для браузера
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
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