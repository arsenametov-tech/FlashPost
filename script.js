// ===== ИСПРАВЛЕННАЯ ВЕРСИЯ FLASHPOST APP =====

class FlashPostApp {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.isGenerating = false;
        this.currentEditingSlide = 0;
        this.slideStyles = [];
        this.downloadEventsInitialized = false; // Флаг для предотвращения дублирования событий
        this.isDownloading = false; // Флаг для предотвращения повторного скачивания
        
        console.log('🚀 Инициализация FlashPost App...');
        this.init();
    }

    init() {
        try {
            this.initTelegramWebApp();
            this.createFloatingBubbles();
            this.bindEvents();
            this.setupHapticFeedback();
            this.loadQuickIdeas();
            
            console.log('✅ Приложение успешно инициализировано');
            this.showToast('🎉 FlashPost AI готов к работе!', 'success');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showToast('⚠️ Ошибка инициализации, но приложение работает', 'warning');
        }
    }

    // Telegram WebApp Integration
    initTelegramWebApp() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Настройка цветовой схемы
            tg.setHeaderColor('#833ab4');
            tg.setBackgroundColor('#833ab4');
            
            console.log('✅ Telegram WebApp инициализирован');
        }
    }

    // Haptic Feedback
    setupHapticFeedback() {
        this.haptic = {
            success: () => {
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }
            },
            error: () => {
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                }
            },
            medium: () => {
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
            }
        };
    }

    // Floating Bubbles Animation
    createFloatingBubbles() {
        const bubblesContainer = document.getElementById('bubbles');
        if (!bubblesContainer) return;

        const createBubble = () => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 60 + 20;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = left + '%';
            bubble.style.animationDuration = duration + 's';
            
            bubblesContainer.appendChild(bubble);
            
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }, duration * 1000);
        };

        // Создаем пузырьки каждые 2 секунды
        setInterval(createBubble, 2000);
        
        // Создаем начальные пузырьки
        for (let i = 0; i < 5; i++) {
            setTimeout(createBubble, i * 400);
        }
    }

    // Bind Events
    bindEvents() {
        try {
            // Generate button
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.handleGenerate());
                console.log('✅ Кнопка генерации подключена');
            } else {
                console.warn('⚠️ Кнопка генерации не найдена');
            }

            // Manual button
            const manualBtn = document.getElementById('manualBtn');
            if (manualBtn) {
                manualBtn.addEventListener('click', () => this.openManualModal());
            }

            // Template button
            const templateBtn = document.getElementById('templateBtn');
            if (templateBtn) {
                templateBtn.addEventListener('click', () => this.openTemplatesModal());
            }

            // Quick ideas refresh
            const refreshBtn = document.getElementById('refreshIdeasBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadQuickIdeas());
            }

            // More ideas button
            const moreIdeasBtn = document.getElementById('moreIdeasBtn');
            if (moreIdeasBtn) {
                moreIdeasBtn.addEventListener('click', () => this.showMoreIdeas());
            }

            // Contact inputs - обновляем контакты в редакторе при изменении
            const instagramInput = document.getElementById('instagramInput');
            const telegramInput = document.getElementById('telegramInput');
            const nicknameInput = document.getElementById('nicknameInput');

            if (instagramInput) {
                instagramInput.addEventListener('input', () => {
                    // Обновляем контакты в редакторе если он открыт
                    const editorOverlay = document.getElementById('editorOverlay');
                    if (editorOverlay && editorOverlay.style.display !== 'none') {
                        this.updateEditorContacts();
                    }
                });
            }

            if (telegramInput) {
                telegramInput.addEventListener('input', () => {
                    // Обновляем контакты в редакторе если он открыт
                    const editorOverlay = document.getElementById('editorOverlay');
                    if (editorOverlay && editorOverlay.style.display !== 'none') {
                        this.updateEditorContacts();
                    }
                });
            }

            if (nicknameInput) {
                nicknameInput.addEventListener('input', () => {
                    // Обновляем контакты в редакторе если он открыт
                    const editorOverlay = document.getElementById('editorOverlay');
                    if (editorOverlay && editorOverlay.style.display !== 'none') {
                        this.updateEditorContacts();
                    }
                });
            }

            // Carousel navigation buttons
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const carouselPrevBtn = document.getElementById('carouselPrevBtn');
            const carouselNextBtn = document.getElementById('carouselNextBtn');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.previousSlide());
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSlide());
            }
            if (carouselPrevBtn) {
                carouselPrevBtn.addEventListener('click', () => this.previousSlide());
            }
            if (carouselNextBtn) {
                carouselNextBtn.addEventListener('click', () => this.nextSlide());
            }

            // Carousel action buttons
            const regenerateBtn = document.getElementById('regenerateBtn');
            const editBtn = document.getElementById('editBtn');
            const shareBtn = document.getElementById('shareBtn');
            const showMiniPreviewBtn = document.getElementById('showMiniPreviewBtn');

            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => this.regenerateCarousel());
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => this.openEditor());
            }
            if (shareBtn) {
                shareBtn.addEventListener('click', () => this.shareCarousel());
            }
            if (showMiniPreviewBtn) {
                showMiniPreviewBtn.addEventListener('click', () => this.toggleMiniPreview());
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                const carouselSection = document.getElementById('carouselSection');
                if (carouselSection && carouselSection.style.display !== 'none') {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        this.previousSlide();
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                    }
                }
            });

            // Touch/swipe navigation for mobile
            this.setupTouchNavigation();

            console.log('✅ События успешно привязаны');
        } catch (error) {
            console.error('❌ Ошибка привязки событий:', error);
        }
    }

    // Quick Ideas Loading
    async loadQuickIdeas() {
        const ideasContainer = document.getElementById('ideasContainer');
        if (!ideasContainer) return;

        try {
            console.log('📝 Загружаем быстрые идеи...');
            
            // Показываем заглушку
            ideasContainer.innerHTML = '<div class="idea-placeholder">Загружаем идеи...</div>';
            
            // Получаем идеи
            const ideas = this.getLocalQuickIdeas();
            this.displayQuickIdeas(ideas);
            
            console.log('✅ Быстрые идеи загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки идей:', error);
            ideasContainer.innerHTML = '<div class="idea-placeholder">Ошибка загрузки идей</div>';
        }
    }

    // Local Quick Ideas
    getLocalQuickIdeas() {
        const ideas = [
            "Здоровое питание",
            "Продуктивность",
            "Финансовая грамотность", 
            "Спорт и фитнес",
            "Саморазвитие",
            "Путешествия",
            "Технологии",
            "Бизнес-идеи",
            "Психология",
            "Творчество"
        ];
        
        // Перемешиваем и берем 6 случайных
        return ideas.sort(() => Math.random() - 0.5).slice(0, 6);
    }

    // Display Quick Ideas
    displayQuickIdeas(ideas) {
        const ideasContainer = document.getElementById('ideasContainer');
        if (!ideasContainer) return;

        ideasContainer.innerHTML = '';
        
        ideas.forEach(idea => {
            const ideaElement = document.createElement('div');
            ideaElement.className = 'idea-item';
            ideaElement.textContent = idea;
            ideaElement.addEventListener('click', () => {
                const topicInput = document.getElementById('topicInput');
                if (topicInput) {
                    topicInput.value = idea;
                    this.haptic.medium();
                }
            });
            ideasContainer.appendChild(ideaElement);
        });
    }

    // Show More Ideas with AI Generation
    async showMoreIdeas() {
        const ideasContainer = document.getElementById('ideasContainer');
        if (!ideasContainer) return;

        try {
            // Показываем загрузку
            ideasContainer.innerHTML = '<div class="idea-placeholder">🤖 ИИ генерирует новые идеи...</div>';
            
            // Имитируем ИИ генерацию с задержкой
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Генерируем идеи на основе трендов и популярных тем
            const aiGeneratedIdeas = this.generateAIIdeas();
            
            // Показываем заголовок
            const headerDiv = document.createElement('div');
            headerDiv.className = 'more-ideas-header';
            headerDiv.innerHTML = '🤖 Идеи от ИИ • Обновлено только что';
            
            ideasContainer.innerHTML = '';
            ideasContainer.appendChild(headerDiv);
            
            // Отображаем идеи
            aiGeneratedIdeas.forEach(idea => {
                const ideaElement = document.createElement('div');
                ideaElement.className = 'idea-item more-idea-item';
                ideaElement.innerHTML = `
                    <div class="idea-content">
                        <div class="idea-title">${idea.title}</div>
                        <div class="idea-description">${idea.description}</div>
                        <div class="idea-tags">${idea.tags.map(tag => `#${tag}`).join(' ')}</div>
                    </div>
                `;
                ideaElement.addEventListener('click', () => {
                    const topicInput = document.getElementById('topicInput');
                    if (topicInput) {
                        topicInput.value = idea.title;
                        this.haptic.medium();
                    }
                });
                ideasContainer.appendChild(ideaElement);
            });
            
            // Добавляем кнопку "Вернуться к быстрым идеям"
            const backButton = document.createElement('button');
            backButton.className = 'back-to-quick-btn';
            backButton.textContent = '← Вернуться к быстрым идеям';
            backButton.addEventListener('click', () => this.loadQuickIdeas());
            ideasContainer.appendChild(backButton);
            
            console.log('✅ ИИ идеи сгенерированы');
        } catch (error) {
            console.error('❌ Ошибка генерации ИИ идей:', error);
            ideasContainer.innerHTML = '<div class="idea-placeholder">Ошибка генерации идей</div>';
        }
    }

    // Generate AI Ideas
    generateAIIdeas() {
        const ideaTemplates = [
            {
                category: "Личностный рост",
                ideas: [
                    {
                        title: "Как стать увереннее в себе за 21 день",
                        description: "Пошаговая система развития уверенности",
                        tags: ["психология", "саморазвитие", "уверенность"]
                    },
                    {
                        title: "5 утренних привычек успешных людей",
                        description: "Ритуалы, которые изменят вашу жизнь",
                        tags: ["привычки", "успех", "утро"]
                    },
                    {
                        title: "Как перестать откладывать дела на потом",
                        description: "Научные методы борьбы с прокрастинацией",
                        tags: ["продуктивность", "мотивация", "цели"]
                    }
                ]
            },
            {
                category: "Бизнес и карьера",
                ideas: [
                    {
                        title: "Как заработать первые 100 тысяч рублей онлайн",
                        description: "Реальные способы заработка в интернете",
                        tags: ["заработок", "онлайн", "деньги"]
                    },
                    {
                        title: "Секреты переговоров: как получить повышение",
                        description: "Психологические приемы успешных переговоров",
                        tags: ["карьера", "переговоры", "зарплата"]
                    },
                    {
                        title: "Как создать пассивный доход с нуля",
                        description: "Стратегии создания источников пассивного дохода",
                        tags: ["инвестиции", "пассивныйдоход", "финансы"]
                    }
                ]
            },
            {
                category: "Здоровье и красота",
                ideas: [
                    {
                        title: "Как похудеть на 10 кг без диет и спортзала",
                        description: "Научный подход к снижению веса",
                        tags: ["похудение", "здоровье", "питание"]
                    },
                    {
                        title: "Секреты молодости: как выглядеть на 10 лет моложе",
                        description: "Простые методы сохранения молодости",
                        tags: ["красота", "молодость", "уход"]
                    },
                    {
                        title: "Как избавиться от стресса за 5 минут",
                        description: "Быстрые техники снятия стресса",
                        tags: ["стресс", "релакс", "здоровье"]
                    }
                ]
            },
            {
                category: "Отношения и семья",
                ideas: [
                    {
                        title: "Как найти любовь в современном мире",
                        description: "Психология отношений и знакомств",
                        tags: ["любовь", "отношения", "знакомства"]
                    },
                    {
                        title: "Секреты счастливого брака: 7 правил",
                        description: "Как сохранить любовь на долгие годы",
                        tags: ["брак", "семья", "любовь"]
                    },
                    {
                        title: "Как воспитать успешного ребенка",
                        description: "Современные методы воспитания детей",
                        tags: ["дети", "воспитание", "семья"]
                    }
                ]
            },
            {
                category: "Технологии и тренды",
                ideas: [
                    {
                        title: "Как заработать на нейросетях в 2026 году",
                        description: "Новые возможности ИИ для заработка",
                        tags: ["ИИ", "технологии", "заработок"]
                    },
                    {
                        title: "Криптовалюты для начинающих: с чего начать",
                        description: "Безопасные способы инвестирования в крипто",
                        tags: ["криптовалюты", "инвестиции", "блокчейн"]
                    },
                    {
                        title: "Как создать вирусный контент в TikTok",
                        description: "Алгоритмы и секреты популярности",
                        tags: ["TikTok", "контент", "соцсети"]
                    }
                ]
            }
        ];

        // Выбираем случайную категорию
        const randomCategory = ideaTemplates[Math.floor(Math.random() * ideaTemplates.length)];
        
        // Перемешиваем идеи и берем 6 случайных
        const shuffledIdeas = randomCategory.ideas.sort(() => Math.random() - 0.5);
        
        // Добавляем идеи из других категорий для разнообразия
        const otherCategories = ideaTemplates.filter(cat => cat !== randomCategory);
        otherCategories.forEach(category => {
            const randomIdea = category.ideas[Math.floor(Math.random() * category.ideas.length)];
            shuffledIdeas.push(randomIdea);
        });
        
        // Возвращаем 6 идей
        return shuffledIdeas.slice(0, 6);
    }

    // Topic Validation
    isValidTopic(topic) {
        if (!topic || typeof topic !== 'string') return false;
        if (topic.trim().length < 2) return false;
        if (topic.trim().length > 200) return false;
        return true;
    }

    // Main Generate Handler
    async handleGenerate() {
        console.log('🎯 Кнопка генерации нажата!');
        
        try {
            const topicInput = document.getElementById('topicInput');
            if (!topicInput) {
                throw new Error('Поле ввода темы не найдено');
            }
            
            const topic = topicInput.value.trim();
            console.log('📝 Введенная тема:', topic);

            // Валидация
            if (!this.isValidTopic(topic)) {
                this.haptic.error();
                this.showToast('Введите корректную тему (минимум 2 символа)', 'error');
                return;
            }

            // Проверка на повторную генерацию
            if (this.isGenerating) {
                this.showToast('Генерация уже выполняется...', 'warning');
                return;
            }

            console.log('✅ Тема валидна, запускаем генерацию...');
            await this.generateCarousel(topic);
            
        } catch (error) {
            console.error('❌ Критическая ошибка в handleGenerate:', error);
            this.haptic.error();
            this.showToast('Критическая ошибка: ' + error.message, 'error');
        }
    }

    // Generate Carousel
    async generateCarousel(topic) {
        console.log('🎯 Начинаем генерацию карусели для темы:', topic);
        
        this.isGenerating = true;
        this.showLoading(true);

        try {
            this.showToast('🎨 Создаю карусель из шаблонов...', 'info');
            
            // Используем только локальные шаблоны для надежности
            const slides = await this.generateFromTemplates(topic);
            console.log('📋 Получили слайды:', slides.length);
            
            if (!slides || slides.length === 0) {
                throw new Error('Не удалось создать слайды');
            }
            
            this.slides = slides;
            this.currentSlide = 0;
            
            this.initializeSlideStyles();
            this.renderCarousel();
            this.showCarousel();
            
            // Открываем редактор через полсекунды
            setTimeout(() => {
                this.openEditor();
            }, 500);
            
            this.haptic.success();
            this.showToast('✅ Карусель успешно создана!', 'success');
            console.log('🎉 Генерация завершена успешно!');
            
        } catch (error) {
            console.error('❌ Ошибка генерации:', error);
            this.haptic.error();
            this.showToast('Ошибка генерации: ' + error.message, 'error');
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
        }
    }

    // Generate from Templates
    async generateFromTemplates(topic) {
        console.log('🎯 Генерируем из локальных шаблонов для:', topic);
        
        // Имитируем задержку для UX
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const templates = [
            // Шаблон 1: Секреты и статистика
            {
                hook: `🔥 95% людей не знают главного секрета про ${topic.toLowerCase()}`,
                intrigue: `💡 То, что я расскажу, изменило жизнь тысяч людей...`,
                problem: `❌ Большинство подходит к ${topic.toLowerCase()} неправильно`,
                solution1: `✅ Метод №1: Правило 3-х шагов для ${topic.toLowerCase()}`,
                solution1_deep: `📋 Пошаговый план:\n• Шаг 1: Начни с основ\n• Шаг 2: Практикуй ежедневно\n• Шаг 3: Анализируй результаты`,
                solution2: `💰 Метод №2: Принцип 80/20 даёт максимум результата`,
                proof: `📊 Результаты: +300% эффективности за месяц`,
                mistakes: `⚠️ Топ-3 ошибки в ${topic.toLowerCase()}, которые убивают прогресс`,
                action_plan: `🎯 Твой план на завтра:\n1️⃣ Изучи основы\n2️⃣ Сделай первый шаг\n3️⃣ Отслеживай прогресс`,
                cta: `💾 Сохрани и поделись в Stories!\n💬 Какой совет был самым полезным?`
            },
            // Шаблон 2: Трансформация
            {
                hook: `🚀 Как я изменил свою жизнь через ${topic.toLowerCase()} за 30 дней`,
                intrigue: `💭 Раньше я думал, что ${topic.toLowerCase()} - это сложно...`,
                problem: `😰 Проблема: все делают ${topic.toLowerCase()} как 10 лет назад`,
                solution1: `🎯 Новый подход: система "Быстрый старт"`,
                solution1_deep: `⚡ Секретная формула:\n• Фокус на результат\n• Минимум усилий\n• Максимум эффекта`,
                solution2: `🔥 Лайфхак: используй правило "5 минут в день"`,
                proof: `📈 Мои результаты: от 0 до успеха за месяц`,
                mistakes: `🚫 Что НЕ работает: топ ошибок новичков`,
                action_plan: `📝 Стартовый чек-лист:\n✓ Определи цель\n✓ Начни сегодня\n✓ Не останавливайся`,
                cta: `🔄 Репост другу, который тоже хочет изменений!\n❤️ Лайк, если полезно`
            }
        ];

        // Выбираем случайный шаблон
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const slides = [
            { type: 'hook', text: template.hook },
            { type: 'intrigue', text: template.intrigue },
            { type: 'problem', text: template.problem },
            { type: 'solution1', text: template.solution1 },
            { type: 'solution1_deep', text: template.solution1_deep },
            { type: 'solution2', text: template.solution2 },
            { type: 'proof', text: template.proof },
            { type: 'mistakes', text: template.mistakes },
            { type: 'action_plan', text: template.action_plan },
            { type: 'cta', text: template.cta }
        ];
        
        console.log('✅ Локальные слайды созданы:', slides.length);
        return slides;
    }

    // Initialize Slide Styles
    initializeSlideStyles() {
        this.slideStyles = this.slides.map(() => ({
            backgroundColor: '#833ab4',
            backgroundImage: null,
            backgroundOpacity: 0.4,
            backgroundPositionX: 50,
            backgroundPositionY: 50,
            backgroundScale: 100,
            textColor: '#ffffff',
            fontSize: 20,
            fontFamily: 'Inter',
            textWidth: 90
        }));
    }

    // Show/Hide Loading
    showLoading(show) {
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            if (show) {
                generateBtn.classList.add('loading');
            } else {
                generateBtn.classList.remove('loading');
            }
        }
    }

    // Render Carousel
    renderCarousel() {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) {
            console.error('❌ Carousel track не найден');
            return;
        }

        carouselTrack.innerHTML = '';

        // Получаем контакты и никнейм пользователя
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const telegramContact = document.getElementById('telegramInput')?.value.trim() || '';
        const nickname = document.getElementById('nicknameInput')?.value.trim() || '';

        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'carousel-slide';
            
            const isFirstSlide = index === 0;
            const isLastSlide = index === this.slides.length - 1;
            const showContacts = slide.type === 'hook' || slide.type === 'cta';
            const showNickname = (isFirstSlide || isLastSlide) && nickname;
            
            // Никнейм для первого и последнего слайда
            let nicknameHtml = '';
            if (showNickname) {
                nicknameHtml = `<div class="slide-nickname">
                    <div class="nickname-badge">
                        <span class="nickname-text">${nickname}</span>
                        ${isFirstSlide ? '<span class="nickname-label">автор</span>' : '<span class="nickname-label">подписывайся</span>'}
                    </div>
                </div>`;
            }
            
            // Контакты (показываем на первом и последнем слайде)
            let contactsHtml = '';
            if ((isFirstSlide || isLastSlide) && (instagramContact || telegramContact)) {
                contactsHtml = '<div class="slide-contacts">';
                
                if (isLastSlide) {
                    contactsHtml += `<div class="subscription-pointer">
                        <div class="pointer-text">👆 Подписывайся!</div>
                        <div class="pointer-arrow">↗️</div>
                    </div>`;
                }
                
                if (instagramContact) {
                    contactsHtml += `<div class="contact-item-slide">
                        <div class="social-icon instagram-icon">📷</div>
                        <span>@${instagramContact}</span>
                    </div>`;
                }
                
                if (telegramContact) {
                    contactsHtml += `<div class="contact-item-slide">
                        <div class="social-icon telegram-icon">✈️</div>
                        <span>@${telegramContact}</span>
                    </div>`;
                }
                
                contactsHtml += '</div>';
            }
            
            // Кнопка поделиться (только на последнем слайде)
            let shareButtonHtml = '';
            if (isLastSlide) {
                shareButtonHtml = `<div class="slide-share-button">
                    <button class="share-slide-btn" onclick="window.app.shareCarousel()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Поделиться
                    </button>
                </div>`;
            }
            
            // Navigation indicators for all slides except the last one
            let navigationHtml = '';
            if (index < this.slides.length - 1) {
                navigationHtml = `
                    <div class="slide-navigation-indicators">
                        <div class="nav-indicator nav-left">Листай</div>
                        <div class="nav-indicator nav-right">→</div>
                    </div>
                `;
            }

            slideElement.innerHTML = `
                <div class="slide-number-badge">
                    <span class="slide-current">${index + 1}</span>
                    <span class="slide-separator">/</span>
                    <span class="slide-total">${this.slides.length}</span>
                </div>
                ${nicknameHtml}
                <div class="slide-content slide-text">${slide.highlightedHTML || this.convertLineBreaksToHTML(slide.text)}</div>
                ${navigationHtml}
                ${contactsHtml}
                ${shareButtonHtml}
            `;
            
            carouselTrack.appendChild(slideElement);
            
            // Add additional texts to this slide
            this.renderAdditionalTextsOnMainCarousel(slideElement, index);
        });

        console.log('✅ Карусель отрендерена');
        
        // Update mini preview if it's visible
        const miniPreviewContainer = document.getElementById('miniPreviewContainer');
        if (miniPreviewContainer && miniPreviewContainer.style.display !== 'none') {
            this.renderMiniPreview();
        }
    }

    // Show Carousel
    showCarousel() {
        const carouselSection = document.getElementById('carouselSection');
        if (carouselSection) {
            carouselSection.style.display = 'block';
            carouselSection.scrollIntoView({ behavior: 'smooth' });
            this.updateCarouselDisplay();
            
            // Auto-show mini preview if more than 3 slides
            if (this.slides && this.slides.length > 3) {
                setTimeout(() => {
                    this.showMiniPreview();
                }, 1000);
            }
        }
    }

    // Toggle mini preview visibility
    toggleMiniPreview() {
        const miniPreviewContainer = document.getElementById('miniPreviewContainer');
        const showMiniPreviewBtn = document.getElementById('showMiniPreviewBtn');
        
        if (miniPreviewContainer) {
            const isVisible = miniPreviewContainer.style.display !== 'none';
            
            if (isVisible) {
                this.hideMiniPreview();
            } else {
                this.showMiniPreview();
            }
        }
    }

    // Show mini preview
    showMiniPreview() {
        const miniPreviewContainer = document.getElementById('miniPreviewContainer');
        const showMiniPreviewBtn = document.getElementById('showMiniPreviewBtn');
        
        if (miniPreviewContainer && this.slides && this.slides.length > 0) {
            miniPreviewContainer.style.display = 'block';
            this.renderMiniPreview();
            this.bindMiniPreviewEvents();
            
            // Update button text
            if (showMiniPreviewBtn) {
                const buttonText = showMiniPreviewBtn.querySelector('svg').nextSibling;
                if (buttonText) {
                    buttonText.textContent = 'Скрыть';
                }
            }
        }
    }

    // Hide mini preview
    hideMiniPreview() {
        const miniPreviewContainer = document.getElementById('miniPreviewContainer');
        const showMiniPreviewBtn = document.getElementById('showMiniPreviewBtn');
        
        if (miniPreviewContainer) {
            miniPreviewContainer.style.display = 'none';
            
            // Update button text
            if (showMiniPreviewBtn) {
                const buttonText = showMiniPreviewBtn.querySelector('svg').nextSibling;
                if (buttonText) {
                    buttonText.textContent = 'Превью';
                }
            }
        }
    }

    // Render mini preview slides
    renderMiniPreview() {
        const miniPreviewStrip = document.getElementById('miniPreviewStrip');
        if (!miniPreviewStrip || !this.slides) return;

        miniPreviewStrip.innerHTML = '';

        this.slides.forEach((slide, index) => {
            const miniSlide = document.createElement('div');
            miniSlide.className = 'mini-slide';
            miniSlide.dataset.slideIndex = index;
            
            if (index === this.currentSlide) {
                miniSlide.classList.add('active');
            }

            // Get slide styles
            const styles = this.slideStyles[index] || this.getDefaultSlideStyles();
            
            // Apply background
            miniSlide.style.background = styles.backgroundColor;
            
            // Add background image if exists
            if (styles.backgroundImage) {
                const bgDiv = document.createElement('div');
                bgDiv.className = 'mini-slide-bg';
                bgDiv.style.backgroundImage = `url(${styles.backgroundImage})`;
                miniSlide.appendChild(bgDiv);
            }

            // Add slide content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'mini-slide-content';
            
            // Truncate text for mini preview
            let displayText = slide.text;
            if (displayText.length > 30) {
                displayText = displayText.substring(0, 30) + '...';
            }
            
            contentDiv.textContent = displayText;
            miniSlide.appendChild(contentDiv);

            // Add slide number
            const numberDiv = document.createElement('div');
            numberDiv.className = 'mini-slide-number';
            numberDiv.textContent = index + 1;
            miniSlide.appendChild(numberDiv);

            miniPreviewStrip.appendChild(miniSlide);
        });

        console.log('✅ Мини-превью отрендерено');
    }

    // Bind mini preview events
    bindMiniPreviewEvents() {
        const miniPreviewStrip = document.getElementById('miniPreviewStrip');
        const miniPreviewToggle = document.getElementById('miniPreviewToggle');

        // Click on mini slide to navigate
        if (miniPreviewStrip) {
            miniPreviewStrip.addEventListener('click', (e) => {
                const miniSlide = e.target.closest('.mini-slide');
                if (miniSlide) {
                    const slideIndex = parseInt(miniSlide.dataset.slideIndex);
                    this.goToSlide(slideIndex);
                    this.haptic.medium();
                }
            });
        }

        // Toggle mini preview collapse
        if (miniPreviewToggle) {
            miniPreviewToggle.addEventListener('click', () => {
                const miniPreviewStrip = document.getElementById('miniPreviewStrip');
                if (miniPreviewStrip) {
                    const isCollapsed = miniPreviewStrip.style.display === 'none';
                    miniPreviewStrip.style.display = isCollapsed ? 'flex' : 'none';
                    miniPreviewToggle.classList.toggle('collapsed', !isCollapsed);
                }
            });
        }
    }

    // Go to specific slide
    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.slides.length) {
            this.currentSlide = slideIndex;
            this.updateCarouselDisplay();
            this.updateMiniPreviewActive();
        }
    }

    // Update mini preview active state
    updateMiniPreviewActive() {
        const miniSlides = document.querySelectorAll('.mini-slide');
        miniSlides.forEach((miniSlide, index) => {
            if (index === this.currentSlide) {
                miniSlide.classList.add('active');
                // Scroll mini slide into view
                miniSlide.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            } else {
                miniSlide.classList.remove('active');
            }
        });
    }

    // Navigate to next slide
    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updateCarouselDisplay();
            this.haptic.medium();
        }
    }

    // Navigate to previous slide
    previousSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateCarouselDisplay();
            this.haptic.medium();
        }
    }

    // Update carousel display
    updateCarouselDisplay() {
        const carouselTrack = document.getElementById('carouselTrack');
        const slideCounter = document.getElementById('slideCounter');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const carouselPrevBtn = document.getElementById('carouselPrevBtn');
        const carouselNextBtn = document.getElementById('carouselNextBtn');

        if (carouselTrack) {
            const translateX = -this.currentSlide * 100;
            carouselTrack.style.transform = `translateX(${translateX}%)`;
        }

        if (slideCounter) {
            slideCounter.textContent = `${this.currentSlide + 1} / ${this.slides.length}`;
        }

        // Update button states
        const isFirst = this.currentSlide === 0;
        const isLast = this.currentSlide === this.slides.length - 1;

        if (prevBtn) {
            prevBtn.disabled = isFirst;
        }
        if (nextBtn) {
            nextBtn.disabled = isLast;
        }
        if (carouselPrevBtn) {
            carouselPrevBtn.disabled = isFirst;
        }
        if (carouselNextBtn) {
            carouselNextBtn.disabled = isLast;
        }

        // Update mini preview active state
        this.updateMiniPreviewActive();
    }

    // Regenerate carousel
    async regenerateCarousel() {
        const topicInput = document.getElementById('topicInput');
        if (!topicInput) return;

        const topic = topicInput.value.trim();
        if (!this.isValidTopic(topic)) {
            this.showToast('Введите корректную тему для регенерации', 'error');
            return;
        }

        this.showToast('🔄 Создаю новую карусель...', 'info');
        
        try {
            const slides = await this.generateFromTemplates(topic);
            this.slides = slides;
            this.currentSlide = 0;
            this.initializeSlideStyles();
            this.renderCarousel();
            this.updateCarouselDisplay();
            this.showToast('✅ Карусель обновлена!', 'success');
        } catch (error) {
            console.error('❌ Ошибка регенерации:', error);
            this.showToast('Ошибка регенерации карусели', 'error');
        }
    }

    // Open Editor
    openEditor() {
        console.log('📝 Открытие редактора слайдов');
        
        if (!this.slides || this.slides.length === 0) {
            this.showToast('Сначала создайте карусель', 'warning');
            return;
        }

        const editorOverlay = document.getElementById('editorOverlay');
        if (editorOverlay) {
            editorOverlay.style.display = 'flex';
            this.currentEditingSlide = this.currentSlide;
            this.updateEditorContent();
            this.bindEditorEvents();
            this.showToast('📝 Редактор открыт', 'success');
        } else {
            this.showToast('📝 Редактор временно недоступен', 'info');
        }
    }

    // Update editor content
    updateEditorContent() {
        if (!this.slides || this.currentEditingSlide >= this.slides.length) return;

        const slide = this.slides[this.currentEditingSlide];
        const editorSlideCounter = document.getElementById('editorSlideCounter');
        const editorSlideNumber = document.getElementById('editorSlideNumber');
        const slideContacts = document.getElementById('slideContacts');

        // Update slide counter
        if (editorSlideCounter) {
            editorSlideCounter.textContent = `${this.currentEditingSlide + 1} / ${this.slides.length}`;
        }

        // Update slide number badge in preview
        if (editorSlideNumber) {
            const currentSpan = editorSlideNumber.querySelector('.slide-current');
            const totalSpan = editorSlideNumber.querySelector('.slide-total');
            if (currentSpan) currentSpan.textContent = this.currentEditingSlide + 1;
            if (totalSpan) totalSpan.textContent = this.slides.length;
        }

        // Update contacts display
        this.updateEditorContacts();

        // Load slide with preserved highlights
        this.loadSlideWithHighlights();

        // Load slide styles into controls
        this.loadSlideStylesIntoControls();
        
        // Apply styles to preview
        this.applySlideStyles();

        // Load text position for current slide
        this.loadTextPosition();

        // Load and render additional texts
        this.renderAdditionalTextsControls();
        this.renderAdditionalTextsOnSlide();

        // Initialize text drag & drop
        this.initializeTextDragDrop();
    }

    // Initialize text drag & drop functionality
    initializeTextDragDrop() {
        const slideText = document.getElementById('slideText');
        const slidePreview = document.getElementById('slidePreview');
        
        if (!slideText || !slidePreview) return;

        // Remove existing drag listeners to avoid duplicates
        this.removeDragListeners();

        // Store initial position
        if (!this.textPosition) {
            this.textPosition = { x: 50, y: 50 }; // Default center position in percentage
        }

        // Apply current position
        this.applyTextPosition();

        // Make text draggable
        slideText.style.cursor = 'move';
        slideText.style.userSelect = 'none';
        slideText.style.position = 'absolute';
        slideText.style.zIndex = '10';
        slideText.classList.add('draggable');

        // Drag state
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

        // Mouse events
        this.dragMouseDown = (e) => {
            e.preventDefault();
            this.isDragging = true;
            
            const rect = slidePreview.getBoundingClientRect();
            const textRect = slideText.getBoundingClientRect();
            
            this.dragOffset.x = e.clientX - textRect.left;
            this.dragOffset.y = e.clientY - textRect.top;
            
            slideText.style.cursor = 'grabbing';
            slideText.classList.add('dragging');
            document.body.style.userSelect = 'none';
            
            this.showToast('🖱️ Перетаскивайте текст', 'info');
        };

        this.dragMouseMove = (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            const rect = slidePreview.getBoundingClientRect();
            
            // Calculate new position relative to slide preview
            let newX = e.clientX - rect.left - this.dragOffset.x;
            let newY = e.clientY - rect.top - this.dragOffset.y;
            
            // Convert to percentage
            const xPercent = Math.max(0, Math.min(100, (newX / rect.width) * 100));
            const yPercent = Math.max(0, Math.min(100, (newY / rect.height) * 100));
            
            this.textPosition.x = xPercent;
            this.textPosition.y = yPercent;
            
            this.applyTextPosition();
        };

        this.dragMouseUp = (e) => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            slideText.style.cursor = 'move';
            slideText.classList.remove('dragging');
            document.body.style.userSelect = '';
            
            // Save position for current slide
            if (!this.slideTextPositions) {
                this.slideTextPositions = {};
            }
            this.slideTextPositions[this.currentEditingSlide] = { ...this.textPosition };
            
            this.showToast('📍 Позиция текста сохранена', 'success');
        };

        // Touch events for mobile
        this.dragTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.dragMouseDown({ 
                clientX: touch.clientX, 
                clientY: touch.clientY, 
                preventDefault: () => {} 
            });
        };

        this.dragTouchMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.dragMouseMove({ 
                clientX: touch.clientX, 
                clientY: touch.clientY, 
                preventDefault: () => {} 
            });
        };

        this.dragTouchEnd = (e) => {
            e.preventDefault();
            this.dragMouseUp({ preventDefault: () => {} });
        };

        // Double tap for text width adjustment on mobile
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.doubleTapHandler = (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - this.lastTapTime;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                e.preventDefault();
                this.tapCount++;
                
                const currentWidth = this.slideStyles[this.currentEditingSlide]?.textWidth || 90;
                const widthPresets = [60, 80, 90, 100]; // Узкий, Средний, Широкий, Полная
                const currentIndex = widthPresets.findIndex(w => Math.abs(w - currentWidth) <= 5);
                const nextIndex = (currentIndex + 1) % widthPresets.length;
                const newWidth = widthPresets[nextIndex];
                
                this.updateSlideStyle('textWidth', newWidth);
                
                // Update controls
                const textWidthSlider = document.getElementById('textWidthSlider');
                const textWidthValue = document.getElementById('textWidthValue');
                if (textWidthSlider) textWidthSlider.value = newWidth;
                if (textWidthValue) textWidthValue.textContent = newWidth + '%';
                this.updateTextWidthPresets(newWidth);
                
                const widthNames = ['Узкий', 'Средний', 'Широкий', 'Полная'];
                this.showToast(`📐 Ширина текста: ${widthNames[nextIndex]} (${newWidth}%)`, 'info');
                
                // Reset tap count after successful double tap
                this.tapCount = 0;
            } else {
                this.tapCount = 1;
            }
            
            this.lastTapTime = currentTime;
        };

        // Add event listeners
        slideText.addEventListener('mousedown', this.dragMouseDown);
        document.addEventListener('mousemove', this.dragMouseMove);
        document.addEventListener('mouseup', this.dragMouseUp);
        
        // Touch events
        slideText.addEventListener('touchstart', this.dragTouchStart, { passive: false });
        document.addEventListener('touchmove', this.dragTouchMove, { passive: false });
        document.addEventListener('touchend', this.dragTouchEnd, { passive: false });
        
        // Double tap for mobile text width adjustment
        slideText.addEventListener('touchend', this.doubleTapHandler, { passive: false });

        // Mouse wheel for font size and text width adjustment
        this.wheelHandler = (e) => {
            if (e.target === slideText && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const currentSize = this.slideStyles[this.currentEditingSlide]?.fontSize || 20;
                const delta = e.deltaY > 0 ? -2 : 2;
                const newSize = Math.max(10, Math.min(48, currentSize + delta));
                
                this.updateSlideStyle('fontSize', newSize);
                
                // Update controls
                const fontSizeSlider = document.getElementById('fontSizeSlider');
                const fontSizeValue = document.getElementById('fontSizeValue');
                if (fontSizeSlider) fontSizeSlider.value = newSize;
                if (fontSizeValue) fontSizeValue.textContent = newSize + 'px';
                this.updateFontSizePresets(newSize);
                
                this.showToast(`📏 Размер шрифта: ${newSize}px`, 'info');
            } else if (e.target === slideText && e.shiftKey) {
                e.preventDefault();
                const currentWidth = this.slideStyles[this.currentEditingSlide]?.textWidth || 90;
                const delta = e.deltaY > 0 ? -5 : 5;
                const newWidth = Math.max(50, Math.min(100, currentWidth + delta));
                
                this.updateSlideStyle('textWidth', newWidth);
                
                // Update controls
                const textWidthSlider = document.getElementById('textWidthSlider');
                const textWidthValue = document.getElementById('textWidthValue');
                if (textWidthSlider) textWidthSlider.value = newWidth;
                if (textWidthValue) textWidthValue.textContent = newWidth + '%';
                this.updateTextWidthPresets(newWidth);
                
                this.showToast(`📐 Ширина текста: ${newWidth}%`, 'info');
            }
        };
        
        slidePreview.addEventListener('wheel', this.wheelHandler, { passive: false });

        // Store references for cleanup
        this.dragListeners = {
            mousedown: this.dragMouseDown,
            mousemove: this.dragMouseMove,
            mouseup: this.dragMouseUp,
            touchstart: this.dragTouchStart,
            touchmove: this.dragTouchMove,
            touchend: this.dragTouchEnd,
            doubletap: this.doubleTapHandler,
            wheel: this.wheelHandler
        };
    }

    // Apply text position
    applyTextPosition() {
        const slideText = document.getElementById('slideText');
        if (!slideText || !this.textPosition) return;

        slideText.style.left = this.textPosition.x + '%';
        slideText.style.top = this.textPosition.y + '%';
        slideText.style.transform = 'translate(-50%, -50%)';
    }

    // Remove drag listeners
    removeDragListeners() {
        const slideText = document.getElementById('slideText');
        const slidePreview = document.getElementById('slidePreview');
        if (!slideText || !this.dragListeners) return;

        slideText.removeEventListener('mousedown', this.dragListeners.mousedown);
        document.removeEventListener('mousemove', this.dragListeners.mousemove);
        document.removeEventListener('mouseup', this.dragListeners.mouseup);
        
        slideText.removeEventListener('touchstart', this.dragListeners.touchstart);
        document.removeEventListener('touchmove', this.dragListeners.touchmove);
        document.removeEventListener('touchend', this.dragListeners.touchend);
        
        // Remove double tap listener
        if (this.dragListeners.doubletap) {
            slideText.removeEventListener('touchend', this.dragListeners.doubletap);
        }
        
        if (slidePreview && this.dragListeners.wheel) {
            slidePreview.removeEventListener('wheel', this.dragListeners.wheel);
        }
    }

    // Load text position for current slide
    loadTextPosition() {
        if (this.slideTextPositions && this.slideTextPositions[this.currentEditingSlide]) {
            this.textPosition = { ...this.slideTextPositions[this.currentEditingSlide] };
        } else {
            this.textPosition = { x: 50, y: 50 }; // Default center
        }
        this.applyTextPosition();
    }

    // Reset text position to center
    resetTextPosition() {
        this.textPosition = { x: 50, y: 50 };
        this.applyTextPosition();
        
        // Save reset position for current slide
        if (!this.slideTextPositions) {
            this.slideTextPositions = {};
        }
        this.slideTextPositions[this.currentEditingSlide] = { ...this.textPosition };
        
        this.showToast('📍 Позиция текста сброшена в центр', 'success');
    }

    // Add additional text element
    addAdditionalText() {
        if (!this.additionalTexts) {
            this.additionalTexts = {};
        }
        
        if (!this.additionalTexts[this.currentEditingSlide]) {
            this.additionalTexts[this.currentEditingSlide] = [];
        }
        
        const textId = Date.now();
        const newText = {
            id: textId,
            text: 'Новый текст',
            position: { x: 30 + (this.additionalTexts[this.currentEditingSlide].length * 10), y: 30 + (this.additionalTexts[this.currentEditingSlide].length * 10) },
            style: {
                color: '#ffffff',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 600
            }
        };
        
        this.additionalTexts[this.currentEditingSlide].push(newText);
        this.renderAdditionalTextsControls();
        this.renderAdditionalTextsOnSlide();
        
        this.showToast('✅ Дополнительный текст добавлен', 'success');
    }

    // Render additional texts controls
    renderAdditionalTextsControls() {
        const container = document.getElementById('additionalTextsContainer');
        const list = document.getElementById('additionalTextsList');
        
        if (!container || !list) return;
        
        const slideTexts = this.additionalTexts?.[this.currentEditingSlide] || [];
        
        if (slideTexts.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        list.innerHTML = '';
        
        slideTexts.forEach((textItem, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'additional-text-item';
            itemElement.innerHTML = `
                <div class="additional-text-header">
                    <span class="additional-text-title">Текст ${index + 1}</span>
                    <button class="remove-text-btn" onclick="window.app.removeAdditionalText(${textItem.id})">×</button>
                </div>
                <div class="additional-text-controls">
                    <textarea class="additional-text-input" placeholder="Введите текст..." 
                              onInput="window.app.updateAdditionalText(${textItem.id}, 'text', this.value)">${textItem.text}</textarea>
                    <div class="additional-text-style-controls">
                        <div class="additional-text-style-control">
                            <label>Цвет</label>
                            <input type="color" value="${textItem.style.color}" 
                                   onChange="window.app.updateAdditionalText(${textItem.id}, 'color', this.value)">
                        </div>
                        <div class="additional-text-style-control">
                            <label>Размер</label>
                            <input type="range" min="10" max="32" value="${textItem.style.fontSize}" 
                                   onChange="window.app.updateAdditionalText(${textItem.id}, 'fontSize', this.value)">
                        </div>
                        <div class="additional-text-style-control">
                            <label>Шрифт</label>
                            <select onChange="window.app.updateAdditionalText(${textItem.id}, 'fontFamily', this.value)">
                                <option value="Inter" ${textItem.style.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
                                <option value="Montserrat" ${textItem.style.fontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                                <option value="Manrope" ${textItem.style.fontFamily === 'Manrope' ? 'selected' : ''}>Manrope</option>
                                <option value="Onest" ${textItem.style.fontFamily === 'Onest' ? 'selected' : ''}>Onest</option>
                                <option value="Golos Text" ${textItem.style.fontFamily === 'Golos Text' ? 'selected' : ''}>Golos Text</option>
                                <option value="Raleway" ${textItem.style.fontFamily === 'Raleway' ? 'selected' : ''}>Raleway</option>
                                <option value="Playfair Display" ${textItem.style.fontFamily === 'Playfair Display' ? 'selected' : ''}>Playfair Display</option>
                                <option value="Lora" ${textItem.style.fontFamily === 'Lora' ? 'selected' : ''}>Lora</option>
                                <option value="Spectral" ${textItem.style.fontFamily === 'Spectral' ? 'selected' : ''}>Spectral</option>
                                <option value="Unbounded" ${textItem.style.fontFamily === 'Unbounded' ? 'selected' : ''}>Unbounded</option>
                                <option value="Bebas Neue" ${textItem.style.fontFamily === 'Bebas Neue' ? 'selected' : ''}>Bebas Neue</option>
                            </select>
                        </div>
                        <div class="additional-text-style-control">
                            <label>Толщина</label>
                            <select onChange="window.app.updateAdditionalText(${textItem.id}, 'fontWeight', this.value)">
                                <option value="400" ${textItem.style.fontWeight == 400 ? 'selected' : ''}>Обычный</option>
                                <option value="500" ${textItem.style.fontWeight == 500 ? 'selected' : ''}>Средний</option>
                                <option value="600" ${textItem.style.fontWeight == 600 ? 'selected' : ''}>Полужирный</option>
                                <option value="700" ${textItem.style.fontWeight == 700 ? 'selected' : ''}>Жирный</option>
                                <option value="800" ${textItem.style.fontWeight == 800 ? 'selected' : ''}>Очень жирный</option>
                                <option value="900" ${textItem.style.fontWeight == 900 ? 'selected' : ''}>Сверхжирный</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(itemElement);
        });
    }

    // Update additional text
    updateAdditionalText(textId, property, value) {
        const slideTexts = this.additionalTexts?.[this.currentEditingSlide];
        if (!slideTexts) return;
        
        const textItem = slideTexts.find(t => t.id === textId);
        if (!textItem) return;
        
        if (property === 'text') {
            textItem.text = value;
        } else {
            textItem.style[property] = property === 'fontSize' ? parseInt(value) : value;
        }
        
        this.renderAdditionalTextsOnSlide();
    }

    // Remove additional text
    removeAdditionalText(textId) {
        const slideTexts = this.additionalTexts?.[this.currentEditingSlide];
        if (!slideTexts) return;
        
        const index = slideTexts.findIndex(t => t.id === textId);
        if (index !== -1) {
            slideTexts.splice(index, 1);
            this.renderAdditionalTextsControls();
            this.renderAdditionalTextsOnSlide();
            this.showToast('🗑️ Дополнительный текст удален', 'success');
        }
    }

    // Render additional texts on slide preview
    renderAdditionalTextsOnSlide() {
        const slidePreview = document.getElementById('slidePreview');
        if (!slidePreview) return;
        
        // Remove existing additional texts
        const existingTexts = slidePreview.querySelectorAll('.additional-text-element');
        existingTexts.forEach(el => el.remove());
        
        const slideTexts = this.additionalTexts?.[this.currentEditingSlide] || [];
        
        slideTexts.forEach(textItem => {
            const textElement = document.createElement('div');
            textElement.className = 'additional-text-element';
            textElement.dataset.textId = textItem.id;
            textElement.style.cssText = `
                left: ${textItem.position.x}%;
                top: ${textItem.position.y}%;
                transform: translate(-50%, -50%);
                color: ${textItem.style.color};
                font-size: ${textItem.style.fontSize}px;
                font-family: ${textItem.style.fontFamily};
                font-weight: ${textItem.style.fontWeight};
            `;
            textElement.innerHTML = this.convertLineBreaksToHTML(textItem.text);
            
            slidePreview.appendChild(textElement);
            
            // Add drag functionality
            this.initializeAdditionalTextDrag(textElement, textItem);
        });
    }

    // Initialize drag functionality for additional text
    initializeAdditionalTextDrag(element, textItem) {
        const slidePreview = document.getElementById('slidePreview');
        if (!slidePreview) return;
        
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        const mouseDown = (e) => {
            e.preventDefault();
            isDragging = true;
            
            const rect = slidePreview.getBoundingClientRect();
            const textRect = element.getBoundingClientRect();
            
            dragOffset.x = e.clientX - textRect.left;
            dragOffset.y = e.clientY - textRect.top;
            
            element.classList.add('dragging');
            document.body.style.userSelect = 'none';
        };
        
        const mouseMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const rect = slidePreview.getBoundingClientRect();
            
            let newX = e.clientX - rect.left - dragOffset.x;
            let newY = e.clientY - rect.top - dragOffset.y;
            
            const xPercent = Math.max(0, Math.min(100, (newX / rect.width) * 100));
            const yPercent = Math.max(0, Math.min(100, (newY / rect.height) * 100));
            
            textItem.position.x = xPercent;
            textItem.position.y = yPercent;
            
            element.style.left = xPercent + '%';
            element.style.top = yPercent + '%';
        };
        
        const mouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('dragging');
            document.body.style.userSelect = '';
            
            this.showToast('📍 Позиция дополнительного текста сохранена', 'success');
        };
        
        // Touch events
        const touchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            mouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        };
        
        const touchMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            mouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        };
        
        const touchEnd = (e) => {
            e.preventDefault();
            mouseUp();
        };
        
        // Add event listeners
        element.addEventListener('mousedown', mouseDown);
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        
        element.addEventListener('touchstart', touchStart, { passive: false });
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd, { passive: false });
    }

    // Update editor contacts display
    updateEditorContacts() {
        const slideContacts = document.getElementById('slideContacts');
        if (!slideContacts) return;

        const isFirstSlide = this.currentEditingSlide === 0;
        const isLastSlide = this.currentEditingSlide === this.slides.length - 1;
        
        // Получаем контакты и никнейм
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const telegramContact = document.getElementById('telegramInput')?.value.trim() || '';
        const nickname = document.getElementById('nicknameInput')?.value.trim() || '';

        // Показываем контакты только на первом и последнем слайде
        if ((isFirstSlide || isLastSlide) && (instagramContact || telegramContact || nickname)) {
            let contactsHtml = '';
            
            // Добавляем указатель "подписывайся" только на последнем слайде
            if (isLastSlide) {
                contactsHtml += `
                    <div class="subscription-pointer">
                        <div class="pointer-text">👆 Подписывайся!</div>
                        <div class="pointer-arrow">↗️</div>
                    </div>
                `;
            }
            
            // Добавляем никнейм если есть
            if (nickname) {
                const label = isFirstSlide ? 'автор' : 'подписывайся';
                contactsHtml += `
                    <div class="editor-nickname">
                        <div class="nickname-badge">
                            <span class="nickname-text">${nickname}</span>
                            <span class="nickname-label">${label}</span>
                        </div>
                    </div>
                `;
            }
            
            // Добавляем контакты
            if (instagramContact) {
                contactsHtml += `
                    <div class="contact-item-slide">
                        <div class="social-icon instagram-icon">📷</div>
                        <span>@${instagramContact}</span>
                    </div>
                `;
            }
            
            if (telegramContact) {
                contactsHtml += `
                    <div class="contact-item-slide">
                        <div class="social-icon telegram-icon">✈️</div>
                        <span>@${telegramContact}</span>
                    </div>
                `;
            }
            
            slideContacts.innerHTML = contactsHtml;
            slideContacts.style.display = 'flex';
        } else {
            slideContacts.style.display = 'none';
        }
    }

    // Load slide styles into editor controls
    loadSlideStylesIntoControls() {
        const styles = this.slideStyles[this.currentEditingSlide] || {
            backgroundColor: '#833ab4',
            backgroundImage: null,
            backgroundOpacity: 0.4,
            backgroundPositionX: 50,
            backgroundPositionY: 50,
            backgroundScale: 100,
            textColor: '#ffffff',
            fontSize: 20,
            fontFamily: 'Inter',
            textWidth: 90
        };

        // Update color pickers
        const bgColorPicker = document.getElementById('bgColorPicker');
        const textColorPicker = document.getElementById('textColorPicker');
        
        if (bgColorPicker) {
            bgColorPicker.value = styles.backgroundColor;
        }
        if (textColorPicker) {
            textColorPicker.value = styles.textColor;
        }

        // Update font controls
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        const textWidthSlider = document.getElementById('textWidthSlider');
        const textWidthValue = document.getElementById('textWidthValue');

        if (fontSizeSlider) {
            fontSizeSlider.value = styles.fontSize;
        }
        if (fontSizeValue) {
            fontSizeValue.textContent = styles.fontSize + 'px';
        }
        if (fontFamilySelect) {
            fontFamilySelect.value = styles.fontFamily;
        }
        if (textWidthSlider) {
            textWidthSlider.value = styles.textWidth || 90;
        }
        if (textWidthValue) {
            textWidthValue.textContent = (styles.textWidth || 90) + '%';
        }

        // Update font size presets
        this.updateFontSizePresets(styles.fontSize);
        
        // Update text width presets
        this.updateTextWidthPresets(styles.textWidth || 90);

        // Update background controls
        const bgOpacitySlider = document.getElementById('bgOpacitySlider');
        const bgOpacityValue = document.getElementById('bgOpacityValue');
        const bgPositionX = document.getElementById('bgPositionX');
        const bgPositionXValue = document.getElementById('bgPositionXValue');
        const bgPositionY = document.getElementById('bgPositionY');
        const bgPositionYValue = document.getElementById('bgPositionYValue');
        const bgScale = document.getElementById('bgScale');
        const bgScaleValue = document.getElementById('bgScaleValue');

        if (bgOpacitySlider && bgOpacityValue) {
            bgOpacitySlider.value = styles.backgroundOpacity || 0.4;
            bgOpacityValue.textContent = Math.round((styles.backgroundOpacity || 0.4) * 100) + '%';
        }

        if (bgPositionX && bgPositionXValue) {
            bgPositionX.value = styles.backgroundPositionX || 50;
            bgPositionXValue.textContent = (styles.backgroundPositionX || 50) + '%';
        }

        if (bgPositionY && bgPositionYValue) {
            bgPositionY.value = styles.backgroundPositionY || 50;
            bgPositionYValue.textContent = (styles.backgroundPositionY || 50) + '%';
        }

        if (bgScale && bgScaleValue) {
            bgScale.value = styles.backgroundScale || 100;
            bgScaleValue.textContent = (styles.backgroundScale || 100) + '%';
        }

        // Update background controls visibility
        this.toggleBackgroundControls(!!styles.backgroundImage);
    }

    // Bind editor events
    bindEditorEvents() {
        const editorCloseBtn = document.getElementById('editorCloseBtn');
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');
        const slideTextEditor = document.getElementById('slideTextEditor');
        const applyToAllSlides = document.getElementById('applyToAllSlides');

        // Инициализируем состояние "применить ко всем"
        this.applyToAll = false;

        // Navigation events
        if (editorCloseBtn) {
            editorCloseBtn.onclick = () => this.closeEditor();
        }

        if (editorPrevBtn) {
            editorPrevBtn.onclick = () => {
                if (this.currentEditingSlide > 0) {
                    this.saveCurrentSlideText();
                    this.currentEditingSlide--;
                    this.updateEditorContent();
                    this.updateEditorNavButtons();
                }
            };
        }

        if (editorNextBtn) {
            editorNextBtn.onclick = () => {
                if (this.currentEditingSlide < this.slides.length - 1) {
                    this.saveCurrentSlideText();
                    this.currentEditingSlide++;
                    this.updateEditorContent();
                    this.updateEditorNavButtons();
                }
            };
        }

        // Text editing
        if (slideTextEditor) {
            slideTextEditor.oninput = () => {
                this.processTextWithHighlights();
                this.saveCurrentSlideText();
            };
        }

        // Apply to all slides checkbox
        if (applyToAllSlides) {
            applyToAllSlides.addEventListener('change', (e) => {
                this.applyToAll = e.target.checked;
                this.showToast(
                    this.applyToAll ? 
                    '🎨 Изменения будут применяться ко всем слайдам' : 
                    '🎯 Изменения только для текущего слайда', 
                    'info'
                );
            });
        }

        // Reset text position button
        const resetTextPositionBtn = document.getElementById('resetTextPositionBtn');
        if (resetTextPositionBtn) {
            resetTextPositionBtn.addEventListener('click', () => {
                this.resetTextPosition();
            });
        }

        // Add additional text button
        const addAdditionalTextBtn = document.getElementById('addAdditionalTextBtn');
        if (addAdditionalTextBtn) {
            addAdditionalTextBtn.addEventListener('click', () => {
                this.addAdditionalText();
            });
        }

        // Color controls
        this.bindColorControls();
        
        // Font controls
        this.bindFontControls();
        
        // Background controls
        this.bindBackgroundControls();
        
        // Highlight controls
        this.bindHighlightControls();
        
        // Action buttons
        this.bindEditorActionButtons();
        
        // Update navigation buttons
        this.updateEditorNavButtons();
    }

    // Bind color controls
    bindColorControls() {
        const bgColorPicker = document.getElementById('bgColorPicker');
        const textColorPicker = document.getElementById('textColorPicker');

        if (bgColorPicker) {
            bgColorPicker.addEventListener('input', (e) => {
                this.updateSlideStyle('backgroundColor', e.target.value);
            });
        }

        if (textColorPicker) {
            textColorPicker.addEventListener('input', (e) => {
                this.updateSlideStyle('textColor', e.target.value);
            });
        }

        // Preset color buttons
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.getAttribute('data-color');
                const parentPicker = preset.closest('.color-picker');
                
                if (parentPicker) {
                    const colorInput = parentPicker.querySelector('input[type="color"]');
                    if (colorInput) {
                        colorInput.value = color;
                        
                        if (colorInput.id === 'bgColorPicker') {
                            this.updateSlideStyle('backgroundColor', color);
                        } else if (colorInput.id === 'textColorPicker') {
                            this.updateSlideStyle('textColor', color);
                        }
                    }
                }
            });
        });
    }

    // Bind font controls
    bindFontControls() {
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        const textWidthSlider = document.getElementById('textWidthSlider');
        const textWidthValue = document.getElementById('textWidthValue');

        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', (e) => {
                const size = e.target.value;
                fontSizeValue.textContent = size + 'px';
                this.updateSlideStyle('fontSize', parseInt(size));
                this.updateFontSizePresets(parseInt(size));
            });
        }

        if (textWidthSlider && textWidthValue) {
            textWidthSlider.addEventListener('input', (e) => {
                const width = e.target.value;
                textWidthValue.textContent = width + '%';
                this.updateSlideStyle('textWidth', parseInt(width));
                this.updateTextWidthPresets(parseInt(width));
            });
        }

        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', (e) => {
                this.updateSlideStyle('fontFamily', e.target.value);
            });
        }

        // Font size preset buttons
        const fontSizePresets = document.querySelectorAll('.font-size-preset');
        fontSizePresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const size = parseInt(preset.getAttribute('data-size'));
                if (fontSizeSlider) {
                    fontSizeSlider.value = size;
                }
                if (fontSizeValue) {
                    fontSizeValue.textContent = size + 'px';
                }
                this.updateSlideStyle('fontSize', size);
                this.updateFontSizePresets(size);
            });
        });

        // Text width preset buttons
        const textWidthPresets = document.querySelectorAll('.text-width-preset');
        textWidthPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const width = parseInt(preset.getAttribute('data-width'));
                if (textWidthSlider) {
                    textWidthSlider.value = width;
                }
                if (textWidthValue) {
                    textWidthValue.textContent = width + '%';
                }
                this.updateSlideStyle('textWidth', width);
                this.updateTextWidthPresets(width);
            });
        });
    }

    // Update font size presets active state
    updateFontSizePresets(currentSize) {
        const fontSizePresets = document.querySelectorAll('.font-size-preset');
        fontSizePresets.forEach(preset => {
            const presetSize = parseInt(preset.getAttribute('data-size'));
            if (Math.abs(presetSize - currentSize) <= 2) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
    }

    // Update text width presets active state
    updateTextWidthPresets(currentWidth) {
        const textWidthPresets = document.querySelectorAll('.text-width-preset');
        textWidthPresets.forEach(preset => {
            const presetWidth = parseInt(preset.getAttribute('data-width'));
            if (Math.abs(presetWidth - currentWidth) <= 5) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
    }

    // Bind background controls
    bindBackgroundControls() {
        const bgImageUpload = document.getElementById('bgImageUpload');
        const uploadBgBtn = document.getElementById('uploadBgBtn');
        const bgImageUploadFirst = document.getElementById('bgImageUploadFirst');
        const uploadBgFirstBtn = document.getElementById('uploadBgFirstBtn');
        const bgImageUploadOthers = document.getElementById('bgImageUploadOthers');
        const uploadBgOthersBtn = document.getElementById('uploadBgOthersBtn');
        const removeBgBtn = document.getElementById('removeBgBtn');
        
        // Background opacity control
        const bgOpacitySlider = document.getElementById('bgOpacitySlider');
        const bgOpacityValue = document.getElementById('bgOpacityValue');
        
        // Background position controls
        const bgPositionX = document.getElementById('bgPositionX');
        const bgPositionXValue = document.getElementById('bgPositionXValue');
        const bgPositionY = document.getElementById('bgPositionY');
        const bgPositionYValue = document.getElementById('bgPositionYValue');
        
        // Background scale control
        const bgScale = document.getElementById('bgScale');
        const bgScaleValue = document.getElementById('bgScaleValue');

        // Current slide background upload
        if (uploadBgBtn && bgImageUpload) {
            uploadBgBtn.addEventListener('click', () => {
                bgImageUpload.click();
            });

            bgImageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file, 'current');
                }
            });
        }

        // First slide background upload
        if (uploadBgFirstBtn && bgImageUploadFirst) {
            uploadBgFirstBtn.addEventListener('click', () => {
                bgImageUploadFirst.click();
            });

            bgImageUploadFirst.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file, 'first');
                }
            });
        }

        // Other slides background upload
        if (uploadBgOthersBtn && bgImageUploadOthers) {
            uploadBgOthersBtn.addEventListener('click', () => {
                bgImageUploadOthers.click();
            });

            bgImageUploadOthers.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file, 'others');
                }
            });
        }

        // Remove background
        if (removeBgBtn) {
            removeBgBtn.addEventListener('click', () => {
                this.updateSlideStyle('backgroundImage', null);
                this.toggleBackgroundControls(false);
            });
        }

        // Background opacity slider
        if (bgOpacitySlider && bgOpacityValue) {
            bgOpacitySlider.addEventListener('input', (e) => {
                const opacity = parseFloat(e.target.value);
                bgOpacityValue.textContent = Math.round(opacity * 100) + '%';
                this.updateSlideStyle('backgroundOpacity', opacity);
            });
        }

        // Background position X
        if (bgPositionX && bgPositionXValue) {
            bgPositionX.addEventListener('input', (e) => {
                const posX = e.target.value;
                bgPositionXValue.textContent = posX + '%';
                this.updateSlideStyle('backgroundPositionX', posX);
            });
        }

        // Background position Y
        if (bgPositionY && bgPositionYValue) {
            bgPositionY.addEventListener('input', (e) => {
                const posY = e.target.value;
                bgPositionYValue.textContent = posY + '%';
                this.updateSlideStyle('backgroundPositionY', posY);
            });
        }

        // Background scale
        if (bgScale && bgScaleValue) {
            bgScale.addEventListener('input', (e) => {
                const scale = e.target.value;
                bgScaleValue.textContent = scale + '%';
                this.updateSlideStyle('backgroundScale', scale);
            });
        }
    }

    // Bind highlight controls
    bindHighlightControls() {
        const autoHighlightBtn = document.getElementById('autoHighlightBtn');
        const highlightColorPicker = document.getElementById('highlightColorPicker');
        const glowAnimation = document.getElementById('glowAnimation');
        const glowIntensitySlider = document.getElementById('glowIntensitySlider');
        const glowIntensityValue = document.getElementById('glowIntensityValue');
        const glowIntensityControl = document.getElementById('glowIntensityControl');

        // Инициализируем состояние свечения
        this.glowEnabled = false;
        this.glowIntensity = 1.5;

        if (autoHighlightBtn) {
            autoHighlightBtn.addEventListener('click', () => {
                this.autoHighlightKeywords();
            });
        }

        if (highlightColorPicker) {
            highlightColorPicker.addEventListener('input', (e) => {
                this.updateHighlightColor(e.target.value);
            });
        }

        if (glowAnimation) {
            // Устанавливаем анимацию выключенной по умолчанию
            glowAnimation.checked = false;
            this.glowEnabled = false;
            
            glowAnimation.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                this.glowEnabled = isEnabled;
                this.toggleGlowAnimation(isEnabled);
                
                // Показываем/скрываем ползунок интенсивности
                if (glowIntensityControl) {
                    glowIntensityControl.style.display = isEnabled ? 'block' : 'none';
                }
                
                // Применяем к существующему выделенному тексту
                this.applyGlowToHighlightedText();
            });
        }

        // Ползунок интенсивности свечения
        if (glowIntensitySlider && glowIntensityValue) {
            glowIntensitySlider.addEventListener('input', (e) => {
                const intensity = parseFloat(e.target.value);
                this.glowIntensity = intensity;
                glowIntensityValue.textContent = intensity + 'x';
                this.updateGlowIntensity(intensity);
            });
        }

        // Обработчики для пресетов цвета выделения
        const highlightColorPicker_parent = highlightColorPicker?.closest('.highlight-color-picker');
        if (highlightColorPicker_parent) {
            const presets = highlightColorPicker_parent.querySelectorAll('.color-preset');
            presets.forEach(preset => {
                preset.addEventListener('click', () => {
                    const color = preset.getAttribute('data-color');
                    if (highlightColorPicker) {
                        highlightColorPicker.value = color;
                        this.updateHighlightColor(color);
                    }
                });
            });
        }
    }

    // Update slide style
    updateSlideStyle(property, value) {
        if (this.applyToAll) {
            // Применяем ко всем слайдам
            this.slides.forEach((slide, index) => {
                if (!this.slideStyles[index]) {
                    this.slideStyles[index] = {
                        backgroundColor: '#833ab4',
                        backgroundImage: null,
                        backgroundOpacity: 0.4,
                        backgroundPositionX: 50,
                        backgroundPositionY: 50,
                        backgroundScale: 100,
                        textColor: '#ffffff',
                        fontSize: 20,
                        fontFamily: 'Inter'
                    };
                }
                this.slideStyles[index][property] = value;
            });
            
            // Обновляем основную карусель
            this.applyStylesToMainCarousel();
            
            this.showToast(`🎨 Изменение применено ко всем ${this.slides.length} слайдам`, 'success');
        } else {
            // Применяем только к текущему слайду
            if (!this.slideStyles[this.currentEditingSlide]) {
                this.slideStyles[this.currentEditingSlide] = {
                    backgroundColor: '#833ab4',
                    backgroundImage: null,
                    backgroundOpacity: 0.4,
                    backgroundPositionX: 50,
                    backgroundPositionY: 50,
                    backgroundScale: 100,
                    textColor: '#ffffff',
                    fontSize: 20,
                    fontFamily: 'Inter'
                };
            }

            this.slideStyles[this.currentEditingSlide][property] = value;
        }
        
        // Всегда обновляем превью текущего слайда
        this.applySlideStyles();
    }

    // Apply slide styles to preview
    applySlideStyles() {
        const slidePreview = document.getElementById('slidePreview');
        const slideText = document.getElementById('slideText');
        
        if (!slidePreview || !slideText) return;

        const styles = this.slideStyles[this.currentEditingSlide];
        if (!styles) return;

        // Apply background color
        slidePreview.style.backgroundColor = styles.backgroundColor;
        
        // Apply background image with all properties
        if (styles.backgroundImage) {
            slidePreview.style.backgroundImage = `url(${styles.backgroundImage})`;
            slidePreview.style.backgroundSize = `${styles.backgroundScale || 100}%`;
            slidePreview.style.backgroundPosition = `${styles.backgroundPositionX || 50}% ${styles.backgroundPositionY || 50}%`;
            slidePreview.style.backgroundRepeat = 'no-repeat';
            
            // Apply overlay for opacity
            const opacity = styles.backgroundOpacity || 0.4;
            slidePreview.style.position = 'relative';
            
            // Remove existing overlay
            const existingOverlay = slidePreview.querySelector('.bg-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Add new overlay
            const overlay = document.createElement('div');
            overlay.className = 'bg-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, ${opacity});
                pointer-events: none;
                z-index: 1;
            `;
            slidePreview.appendChild(overlay);
            
            // Ensure text is above overlay
            slideText.style.position = 'relative';
            slideText.style.zIndex = '2';
        } else {
            slidePreview.style.backgroundImage = 'none';
            // Remove overlay if no background image
            const existingOverlay = slidePreview.querySelector('.bg-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
        }

        // Apply text styles
        slideText.style.color = styles.textColor;
        slideText.style.fontSize = styles.fontSize + 'px';
        slideText.style.fontFamily = styles.fontFamily;
        slideText.style.width = (styles.textWidth || 90) + '%';
        slideText.style.maxWidth = (styles.textWidth || 90) + '%';
    }

    // Handle image upload
    handleImageUpload(file, target = 'current') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            if (target === 'current') {
                if (this.applyToAll) {
                    // Применяем ко всем слайдам
                    this.slides.forEach((slide, index) => {
                        if (!this.slideStyles[index]) {
                            this.slideStyles[index] = {
                                backgroundColor: '#833ab4',
                                backgroundImage: null,
                                backgroundOpacity: 0.4,
                                backgroundPositionX: 50,
                                backgroundPositionY: 50,
                                backgroundScale: 100,
                                textColor: '#ffffff',
                                fontSize: 20,
                                fontFamily: 'Inter'
                            };
                        }
                        this.slideStyles[index].backgroundImage = imageUrl;
                    });
                    this.showToast(`📷 Фон загружен для всех ${this.slides.length} слайдов`, 'success');
                    this.applyStylesToMainCarousel();
                } else {
                    // Загружаем только для текущего слайда
                    this.updateSlideStyle('backgroundImage', imageUrl);
                    this.showToast('📷 Фон загружен для текущего слайда', 'success');
                }
            } else if (target === 'first') {
                // Загружаем только для первого слайда
                if (!this.slideStyles[0]) {
                    this.slideStyles[0] = {
                        backgroundColor: '#833ab4',
                        backgroundImage: null,
                        backgroundOpacity: 0.4,
                        backgroundPositionX: 50,
                        backgroundPositionY: 50,
                        backgroundScale: 100,
                        textColor: '#ffffff',
                        fontSize: 20,
                        fontFamily: 'Inter'
                    };
                }
                this.slideStyles[0].backgroundImage = imageUrl;
                
                // Если мы сейчас на первом слайде, обновляем превью
                if (this.currentEditingSlide === 0) {
                    this.applySlideStyles();
                    this.toggleBackgroundControls(true);
                }
                
                this.showToast('📷 Фон загружен для первого слайда', 'success');
            } else if (target === 'others') {
                // Загружаем для всех остальных слайдов (кроме текущего)
                this.slides.forEach((slide, index) => {
                    if (index !== this.currentEditingSlide) {
                        if (!this.slideStyles[index]) {
                            this.slideStyles[index] = {
                                backgroundColor: '#833ab4',
                                backgroundImage: null,
                                backgroundOpacity: 0.4,
                                backgroundPositionX: 50,
                                backgroundPositionY: 50,
                                backgroundScale: 100,
                                textColor: '#ffffff',
                                fontSize: 20,
                                fontFamily: 'Inter'
                            };
                        }
                        this.slideStyles[index].backgroundImage = imageUrl;
                    }
                });
                this.showToast(`📷 Фон загружен для ${this.slides.length - 1} слайдов`, 'success');
            }
            
            this.toggleBackgroundControls(true);
        };
        reader.readAsDataURL(file);
    }

    // Toggle background controls visibility
    toggleBackgroundControls(show) {
        const bgOpacityControl = document.getElementById('bgOpacityControl');
        const bgPositionControl = document.getElementById('bgPositionControl');
        const removeBgBtn = document.getElementById('removeBgBtn');

        if (bgOpacityControl) {
            bgOpacityControl.style.display = show ? 'block' : 'none';
        }
        if (bgPositionControl) {
            bgPositionControl.style.display = show ? 'block' : 'none';
        }
        if (removeBgBtn) {
            removeBgBtn.style.display = show ? 'block' : 'none';
        }
    }

    // Auto highlight keywords
    autoHighlightKeywords() {
        const slideTextEditor = document.getElementById('slideTextEditor');
        const slideText = document.getElementById('slideText');
        if (!slideTextEditor || !slideText) return;

        let text = slideTextEditor.value;
        
        // Сначала конвертируем переносы строк в <br>
        text = this.convertLineBreaksToHTML(text);
        
        // Keywords to highlight (emojis, numbers, important words)
        const patterns = [
            { regex: /(\d+%)/g, class: 'highlight-percentage' }, // percentages
            { regex: /(\d+)/g, class: 'highlight-number' }, // numbers
            { regex: /(секрет|метод|правило|принцип|лайфхак|результат|ошибка|план)/gi, class: 'highlight-keyword' }, // key words
            { regex: /(🔥|💡|✅|❌|💰|📊|⚠️|🎯|💾|💬|🚀|📝|📋|🔄)/g, class: 'highlight-emoji' } // emojis
        ];

        // Создаем массив для хранения выделенных частей
        let highlightedParts = [];
        let lastIndex = 0;

        // Находим все совпадения
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(text)) !== null) {
                highlightedParts.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    class: pattern.class
                });
            }
        });

        // Сортируем по позиции
        highlightedParts.sort((a, b) => a.start - b.start);

        // Удаляем пересекающиеся выделения
        const cleanParts = [];
        highlightedParts.forEach(part => {
            const lastPart = cleanParts[cleanParts.length - 1];
            if (!lastPart || part.start >= lastPart.end) {
                cleanParts.push(part);
            }
        });

        // Создаем HTML с выделениями
        let highlightedHTML = '';
        let currentIndex = 0;

        cleanParts.forEach(part => {
            // Добавляем текст до выделения (с сохранением <br>)
            if (part.start > currentIndex) {
                highlightedHTML += text.substring(currentIndex, part.start);
            }
            
            // Добавляем выделенный текст
            const highlightColor = this.getHighlightColor();
            const glowClass = this.glowEnabled ? '' : ' no-glow';
            const textShadow = this.glowEnabled ? this.getGlowShadow(highlightColor) : 'none';
            
            highlightedHTML += `<span class="highlighted-text${glowClass}" style="color: ${highlightColor}; text-shadow: ${textShadow};">${this.escapeHtml(part.text)}</span>`;
            
            currentIndex = part.end;
        });

        // Добавляем оставшийся текст (с сохранением <br>)
        if (currentIndex < text.length) {
            highlightedHTML += text.substring(currentIndex);
        }

        // Обновляем превью
        slideText.innerHTML = highlightedHTML;

        // Сохраняем выделения для текущего слайда
        if (this.slides[this.currentEditingSlide]) {
            this.slides[this.currentEditingSlide].highlightedHTML = highlightedHTML;
        }

        // Сохраняем информацию о выделениях
        this.currentHighlights = cleanParts;

        this.showToast(`✨ Выделено ${cleanParts.length} ключевых слов`, 'success');
    }

    // Get glow shadow based on current intensity
    getGlowShadow(color) {
        const intensity = this.glowIntensity || 1.5;
        const baseIntensity = 5;
        
        const shadowIntensity1 = Math.round(baseIntensity * intensity);
        const shadowIntensity2 = Math.round(baseIntensity * 2 * intensity);
        const shadowIntensity3 = Math.round(baseIntensity * 3 * intensity);
        const shadowIntensity4 = Math.round(Math.min(25, baseIntensity * 4 * intensity));
        
        return `0 0 ${shadowIntensity1}px ${color}, 0 0 ${shadowIntensity2}px ${color}, 0 0 ${shadowIntensity3}px ${color}, 0 0 ${shadowIntensity4}px ${color}`;
    }

    // Get current highlight color
    getHighlightColor() {
        const highlightColorPicker = document.getElementById('highlightColorPicker');
        return highlightColorPicker ? highlightColorPicker.value : '#fcb045';
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convert line breaks to HTML
    convertLineBreaksToHTML(text) {
        return text.replace(/\n/g, '<br>');
    }

    // Process text with asterisk highlights
    processTextWithHighlights() {
        const slideTextEditor = document.getElementById('slideTextEditor');
        const slideText = document.getElementById('slideText');
        if (!slideTextEditor || !slideText) return;

        let text = slideTextEditor.value;
        
        // Сначала конвертируем переносы строк в <br>
        text = this.convertLineBreaksToHTML(text);
        
        // Обрабатываем звездочки для выделения *слово*
        const highlightColor = this.getHighlightColor();
        const glowClass = this.glowEnabled ? '' : ' no-glow';
        const textShadow = this.glowEnabled ? this.getGlowShadow(highlightColor) : 'none';
        
        const processedText = text.replace(/\*([^*]+)\*/g, (match, word) => {
            return `<span class="highlighted-text manual-highlight${glowClass}" style="color: ${highlightColor}; text-shadow: ${textShadow};">${this.escapeHtml(word)}</span>`;
        });

        // Обновляем превью
        slideText.innerHTML = processedText;
        
        // Сохраняем выделения для текущего слайда если есть звездочки или переносы
        if ((processedText !== slideTextEditor.value || text.includes('<br>')) && this.slides[this.currentEditingSlide]) {
            this.slides[this.currentEditingSlide].highlightedHTML = processedText;
        }
    }

    // Update highlight color
    updateHighlightColor(color) {
        const slideText = document.getElementById('slideText');
        if (!slideText) return;

        const highlightedElements = slideText.querySelectorAll('.highlighted-text');
        highlightedElements.forEach(element => {
            element.style.color = color;
            
            if (this.glowEnabled && !element.classList.contains('no-glow')) {
                this.applyGlowEffect(element);
            } else {
                element.style.textShadow = 'none';
            }
        });

        this.showToast('🎨 Цвет выделения обновлен', 'success');
    }

    // Toggle glow animation
    toggleGlowAnimation(enabled) {
        const slideText = document.getElementById('slideText');
        if (!slideText) return;

        this.glowEnabled = enabled;
        
        if (enabled) {
            slideText.classList.remove('no-glow-animation');
        } else {
            slideText.classList.add('no-glow-animation');
        }
        
        // Применяем к существующему выделенному тексту
        this.applyGlowToHighlightedText();
    }

    // Apply glow to highlighted text
    applyGlowToHighlightedText() {
        const slideText = document.getElementById('slideText');
        if (!slideText) return;

        const highlightedElements = slideText.querySelectorAll('.highlighted-text');
        highlightedElements.forEach(element => {
            if (this.glowEnabled) {
                element.classList.remove('no-glow');
                this.applyGlowEffect(element);
            } else {
                element.classList.add('no-glow');
                element.style.textShadow = 'none';
            }
        });
    }

    // Apply glow effect to element
    applyGlowEffect(element) {
        const color = element.style.color || this.getHighlightColor();
        const intensity = this.glowIntensity || 1.5;
        
        const baseIntensity = 5;
        const shadowIntensity1 = Math.round(baseIntensity * intensity);
        const shadowIntensity2 = Math.round(baseIntensity * 2 * intensity);
        const shadowIntensity3 = Math.round(baseIntensity * 3 * intensity);
        const shadowIntensity4 = Math.round(Math.min(25, baseIntensity * 4 * intensity));
        
        element.style.textShadow = `
            0 0 ${shadowIntensity1}px ${color}, 
            0 0 ${shadowIntensity2}px ${color}, 
            0 0 ${shadowIntensity3}px ${color}, 
            0 0 ${shadowIntensity4}px ${color}
        `;
    }

    // Update glow intensity
    updateGlowIntensity(intensity) {
        this.glowIntensity = intensity;
        
        if (!this.glowEnabled) return;
        
        const slideText = document.getElementById('slideText');
        if (!slideText) return;

        const highlightedElements = slideText.querySelectorAll('.highlighted-text');
        highlightedElements.forEach(element => {
            this.applyGlowEffect(element);
        });
    }

    // Update editor navigation buttons
    updateEditorNavButtons() {
        const editorPrevBtn = document.getElementById('editorPrevBtn');
        const editorNextBtn = document.getElementById('editorNextBtn');

        if (editorPrevBtn) {
            editorPrevBtn.disabled = this.currentEditingSlide === 0;
        }
        if (editorNextBtn) {
            editorNextBtn.disabled = this.currentEditingSlide === this.slides.length - 1;
        }
    }

    // Bind editor action buttons
    bindEditorActionButtons() {
        const saveAsTemplateBtn = document.getElementById('saveAsTemplateBtn');
        const saveSlideBtn = document.getElementById('saveSlideBtn');
        const downloadSlideBtn = document.getElementById('downloadSlideBtn');
        const resetSlideBtn = document.getElementById('resetSlideBtn');

        if (saveAsTemplateBtn) {
            saveAsTemplateBtn.addEventListener('click', () => this.saveAsTemplate());
        }

        if (saveSlideBtn) {
            saveSlideBtn.addEventListener('click', () => this.saveCurrentSlide());
        }

        if (downloadSlideBtn) {
            downloadSlideBtn.addEventListener('click', () => this.toggleDownloadOptions());
        }

        if (resetSlideBtn) {
            resetSlideBtn.addEventListener('click', () => this.resetCurrentSlide());
        }
    }

    // Save as template
    saveAsTemplate() {
        console.log('💾 Сохранение шаблона...');
        
        if (!this.slides || this.slides.length === 0) {
            this.showToast('Нет слайдов для сохранения', 'error');
            return;
        }

        const templateName = prompt('Введите название шаблона:');
        if (!templateName) return;

        try {
            const template = {
                id: Date.now(),
                name: templateName.trim(),
                description: `Шаблон из ${this.slides.length} слайдов`,
                slides: this.slides.map(slide => ({ ...slide })),
                styles: this.slideStyles.map(style => ({ ...style })),
                textPositions: this.slideTextPositions ? { ...this.slideTextPositions } : {},
                additionalTexts: this.additionalTexts ? { ...this.additionalTexts } : {},
                createdAt: new Date().toISOString(),
                tags: ['пользовательский']
            };

            console.log('📋 Данные шаблона:', template);

            // Сохраняем в localStorage
            const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
            savedTemplates.push(template);
            localStorage.setItem('flashpost_templates', JSON.stringify(savedTemplates));

            console.log('✅ Шаблон сохранен в localStorage');
            this.showToast(`✅ Шаблон "${templateName}" сохранен`, 'success');
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            this.showToast('❌ Ошибка сохранения шаблона: ' + error.message, 'error');
        }
    }

    // Save current slide
    saveCurrentSlide() {
        this.saveCurrentSlideText();
        this.showToast('💾 Слайд сохранен', 'success');
    }

    // Toggle download options dropdown
    toggleDownloadOptions() {
        console.log('🔽 Переключение опций скачивания...');
        
        const downloadOptions = document.getElementById('downloadOptions');
        if (downloadOptions) {
            const isVisible = downloadOptions.style.display !== 'none';
            downloadOptions.style.display = isVisible ? 'none' : 'block';
            
            console.log('📋 Опции скачивания:', isVisible ? 'скрыты' : 'показаны');
            
            if (!isVisible) {
                // Update displays
                this.updateQualityDisplay();
                this.updateLogoSizeDisplay();
                this.toggleLogoControls();
                
                // Привязываем события только один раз при первом показе
                if (!this.downloadEventsInitialized) {
                    this.bindDownloadOptionsEvents();
                    this.downloadEventsInitialized = true;
                }
            }
        } else {
            console.warn('⚠️ Элемент downloadOptions не найден');
        }
    }

    // Bind download options events
    bindDownloadOptionsEvents() {
        // Добавляем небольшую задержку для загрузки DOM
        setTimeout(() => {
            const startDownloadBtn = document.getElementById('startDownloadBtn');
            const qualitySlider = document.getElementById('qualitySlider');
            const logoSizeSlider = document.getElementById('logoSizeSlider');
            const includeLogoCheckbox = document.getElementById('includeLogo');
            const downloadOptions = document.getElementById('downloadOptions');

            console.log('🔧 Привязываем события скачивания:', {
                startDownloadBtn: !!startDownloadBtn,
                qualitySlider: !!qualitySlider,
                downloadOptions: !!downloadOptions
            });

            // Создаем именованные функции для обработчиков
            if (startDownloadBtn && !startDownloadBtn.hasAttribute('data-event-bound')) {
                const downloadHandler = () => {
                    console.log('🔥 Кнопка скачивания нажата');
                    this.startAdvancedDownload();
                };
                startDownloadBtn.addEventListener('click', downloadHandler);
                startDownloadBtn.setAttribute('data-event-bound', 'true');
            }

            if (qualitySlider && !qualitySlider.hasAttribute('data-event-bound')) {
                const qualityHandler = () => this.updateQualityDisplay();
                qualitySlider.addEventListener('input', qualityHandler);
                qualitySlider.setAttribute('data-event-bound', 'true');
            }

            if (logoSizeSlider && !logoSizeSlider.hasAttribute('data-event-bound')) {
                const logoSizeHandler = () => this.updateLogoSizeDisplay();
                logoSizeSlider.addEventListener('input', logoSizeHandler);
                logoSizeSlider.setAttribute('data-event-bound', 'true');
            }

            if (includeLogoCheckbox && !includeLogoCheckbox.hasAttribute('data-event-bound')) {
                const logoCheckboxHandler = () => this.toggleLogoControls();
                includeLogoCheckbox.addEventListener('change', logoCheckboxHandler);
                includeLogoCheckbox.setAttribute('data-event-bound', 'true');
            }

            // Close dropdown when clicking outside - добавляем только один раз
            if (!document.hasAttribute('data-download-outside-click-bound')) {
                const outsideClickHandler = (e) => {
                    const downloadDropdown = document.querySelector('.download-dropdown');
                    if (downloadOptions && downloadDropdown && !downloadDropdown.contains(e.target)) {
                        downloadOptions.style.display = 'none';
                    }
                };
                document.addEventListener('click', outsideClickHandler);
                document.setAttribute('data-download-outside-click-bound', 'true');
            }
        }, 100);
    }

    // Update quality display
    updateQualityDisplay() {
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        
        if (qualitySlider && qualityValue) {
            qualityValue.textContent = qualitySlider.value + '%';
        }
    }

    // Update logo size display
    updateLogoSizeDisplay() {
        const logoSizeSlider = document.getElementById('logoSizeSlider');
        const logoSizeValue = document.getElementById('logoSizeValue');
        
        if (logoSizeSlider && logoSizeValue) {
            logoSizeValue.textContent = logoSizeSlider.value + 'px';
        }
    }

    // Toggle logo controls visibility
    toggleLogoControls() {
        const includeLogoCheckbox = document.getElementById('includeLogo');
        const logoPositionControl = document.getElementById('logoPositionControl');
        
        if (includeLogoCheckbox && logoPositionControl) {
            const isChecked = includeLogoCheckbox.checked;
            logoPositionControl.style.display = isChecked ? 'block' : 'none';
        }
    }

    // Start advanced download with selected options
    async startAdvancedDownload() {
        console.log('🚀 Начинаем расширенное скачивание...');
        
        // Защита от повторного вызова
        if (this.isDownloading) {
            console.log('⚠️ Скачивание уже выполняется...');
            return;
        }
        
        if (!this.slides || this.slides.length === 0) {
            this.showToast('Нет слайдов для скачивания', 'error');
            return;
        }

        this.isDownloading = true; // Устанавливаем флаг

        try {
            // Get selected options
            const formatRadio = document.querySelector('input[name="format"]:checked');
            const sizeRadio = document.querySelector('input[name="size"]:checked');
            const qualitySlider = document.getElementById('qualitySlider');
            const includeLogoCheckbox = document.getElementById('includeLogo');
            const includeWatermarkCheckbox = document.getElementById('includeWatermark');
            const logoPositionSelect = document.getElementById('logoPosition');
            const logoSizeSlider = document.getElementById('logoSizeSlider');

            const format = formatRadio ? formatRadio.value : 'jpeg';
            const size = sizeRadio ? sizeRadio.value : '1080x1080';
            const quality = qualitySlider ? parseInt(qualitySlider.value) : 90;
            
            // Branding options
            const brandingOptions = {
                includeLogo: includeLogoCheckbox ? includeLogoCheckbox.checked : true,
                includeWatermark: includeWatermarkCheckbox ? includeWatermarkCheckbox.checked : false,
                logoPosition: logoPositionSelect ? logoPositionSelect.value : 'bottom-right',
                logoSize: logoSizeSlider ? parseInt(logoSizeSlider.value) : 40
            };

            console.log('🔧 Export options:', { format, size, quality, branding: brandingOptions });

            // Hide dropdown
            const downloadOptions = document.getElementById('downloadOptions');
            if (downloadOptions) {
                downloadOptions.style.display = 'none';
            }

            const brandingText = brandingOptions.includeLogo ? ' с логотипом' : '';
            this.showToast(`📥 Подготавливаем слайды (${format.toUpperCase()}, ${size}${brandingText})...`, 'info');

            if (format === 'pdf') {
                await this.createAndDownloadPDF(size, quality, brandingOptions);
            } else {
                await this.createAndDownloadImages(format, size, quality, brandingOptions);
            }
            
            this.showToast(`✅ Слайды скачаны в формате ${format.toUpperCase()}`, 'success');
            console.log('✅ Скачивание завершено успешно');
        } catch (error) {
            console.error('❌ Ошибка скачивания:', error);
            this.showToast('❌ Ошибка скачивания: ' + error.message, 'error');
        } finally {
            this.isDownloading = false; // Сбрасываем флаг в любом случае
        }
    }

    // Create and download images (JPEG/PNG)
    async createAndDownloadImages(format, size, quality, brandingOptions = {}) {
        console.log('🖼️ Создание изображений:', { format, size, quality });
        
        const [width, height] = size.split('x').map(Number);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        for (let i = 0; i < this.slides.length; i++) {
            console.log(`🖼️ Обрабатываем слайд ${i + 1}/${this.slides.length}`);
            
            const slide = this.slides[i];
            const styles = this.slideStyles[i] || this.getDefaultSlideStyles();
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw slide content
            await this.drawSlideOnCanvas(ctx, slide, styles, width, height, brandingOptions);
            
            // Convert to blob and download
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const qualityValue = format === 'png' ? undefined : quality / 100;
            
            await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('❌ Не удалось создать blob для слайда', i + 1);
                        resolve();
                        return;
                    }
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `slide-${i + 1}.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log(`✅ Слайд ${i + 1} скачан`);
                    resolve();
                }, mimeType, qualityValue);
            });
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Все изображения скачаны');
    }

    // Create and download PDF
    async createAndDownloadPDF(size, quality, brandingOptions = {}) {
        console.log('📄 Создание PDF...');
        
        if (!window.jspdf) {
            throw new Error('Библиотека jsPDF не загружена');
        }
        
        const { jsPDF } = window.jspdf;
        const [width, height] = size.split('x').map(Number);
        
        console.log('📐 Размеры PDF:', { width, height });
        
        // Create PDF with custom dimensions
        const pdf = new jsPDF({
            orientation: width > height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [width, height]
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        for (let i = 0; i < this.slides.length; i++) {
            console.log(`📄 Обрабатываем слайд ${i + 1}/${this.slides.length}`);
            
            const slide = this.slides[i];
            const styles = this.slideStyles[i] || this.getDefaultSlideStyles();
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw slide content
            await this.drawSlideOnCanvas(ctx, slide, styles, width, height, brandingOptions);
            
            // Add page to PDF (except for first slide)
            if (i > 0) {
                pdf.addPage([width, height], width > height ? 'landscape' : 'portrait');
            }
            
            // Convert canvas to image and add to PDF
            const imgData = canvas.toDataURL('image/jpeg', quality / 100);
            pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        }

        // Download PDF
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const brandingSuffix = brandingOptions.includeLogo ? '-branded' : '';
        const filename = `flashpost-carousel${brandingSuffix}-${timestamp}.pdf`;
        
        console.log('💾 Сохранение PDF:', filename);
        pdf.save(filename);
    }

    // Draw slide content on canvas
    async drawSlideOnCanvas(ctx, slide, styles, width, height, brandingOptions = {}) {
        // Draw background color
        ctx.fillStyle = styles.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw background image if exists
        if (styles.backgroundImage) {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        // Calculate position and scale
                        const scale = (styles.backgroundScale || 100) / 100;
                        const scaledWidth = img.width * scale;
                        const scaledHeight = img.height * scale;
                        
                        const x = (width - scaledWidth) * (styles.backgroundPositionX || 50) / 100;
                        const y = (height - scaledHeight) * (styles.backgroundPositionY || 50) / 100;
                        
                        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                        
                        // Apply opacity overlay
                        const opacity = styles.backgroundOpacity || 0.4;
                        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                        ctx.fillRect(0, 0, width, height);
                        
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = styles.backgroundImage;
                });
            } catch (error) {
                console.warn('Ошибка загрузки фонового изображения:', error);
            }
        }
        
        // Draw main text
        await this.drawTextOnCanvas(ctx, slide, styles, width, height);
        
        // Draw additional texts
        await this.drawAdditionalTextsOnCanvas(ctx, slide, styles, width, height);
        
        // Draw contacts and navigation indicators
        await this.drawSlideExtrasOnCanvas(ctx, slide, styles, width, height);
        
        // Draw branding elements
        await this.drawBrandingOnCanvas(ctx, slide, styles, width, height, brandingOptions);
    }

    // Draw text on canvas with line breaks and highlighting
    async drawTextOnCanvas(ctx, slide, styles, width, height) {
        ctx.fillStyle = styles.textColor;
        const fontSize = Math.round(styles.fontSize * (width / 400)); // Scale font size
        ctx.font = `bold ${fontSize}px ${styles.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Get text position
        const slideIndex = this.slides.indexOf(slide);
        const textPosition = this.slideTextPositions?.[slideIndex] || { x: 50, y: 50 };
        const textX = (width * textPosition.x) / 100;
        const textY = (height * textPosition.y) / 100;
        
        // Process text with line breaks and text width
        const textContent = slide.highlightedHTML || slide.text;
        const textLines = textContent.split('\n');
        const lines = [];
        const textWidthPercent = styles.textWidth || 90;
        const maxWidth = (width * textWidthPercent) / 100;
        
        textLines.forEach(textLine => {
            if (textLine.trim() === '') {
                lines.push('');
            } else {
                const words = textLine.split(' ');
                let currentLine = '';
                
                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                
                if (currentLine) {
                    lines.push(currentLine);
                }
            }
        });
        
        // Draw lines
        const lineHeight = fontSize * 1.3;
        const totalHeight = lines.length * lineHeight;
        const startY = textY - totalHeight / 2;
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                ctx.fillText(line, textX, startY + index * lineHeight);
            }
        });
    }

    // Draw additional texts on canvas
    async drawAdditionalTextsOnCanvas(ctx, slide, styles, width, height) {
        const slideIndex = this.slides.indexOf(slide);
        const additionalTexts = this.additionalTexts?.[slideIndex] || [];
        
        additionalTexts.forEach(textItem => {
            ctx.fillStyle = textItem.style.color;
            const fontSize = Math.round(textItem.style.fontSize * (width / 400));
            ctx.font = `${textItem.style.fontWeight} ${fontSize}px ${textItem.style.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const x = (width * textItem.position.x) / 100;
            const y = (height * textItem.position.y) / 100;
            
            // Handle line breaks in additional text
            const lines = textItem.text.split('\n');
            const lineHeight = fontSize * 1.2;
            const startY = y - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                if (line.trim()) {
                    ctx.fillText(line, x, startY + index * lineHeight);
                }
            });
        });
    }

    // Draw slide extras (contacts, navigation) on canvas
    async drawSlideExtrasOnCanvas(ctx, slide, styles, width, height) {
        const slideIndex = this.slides.indexOf(slide);
        const isFirstSlide = slideIndex === 0;
        const isLastSlide = slideIndex === this.slides.length - 1;
        
        // Get contacts
        const instagramContact = document.getElementById('instagramInput')?.value.trim() || '';
        const telegramContact = document.getElementById('telegramInput')?.value.trim() || '';
        const nickname = document.getElementById('nicknameInput')?.value.trim() || '';
        
        // Draw contacts on first and last slides
        if ((isFirstSlide || isLastSlide) && (instagramContact || telegramContact || nickname)) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `600 ${Math.round(width * 0.025)}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            let contactY = height - 40;
            
            if (nickname) {
                const label = isFirstSlide ? 'автор' : 'подписывайся';
                ctx.fillText(`${nickname} • ${label}`, width / 2, contactY);
                contactY -= 30;
            }
            
            if (instagramContact) {
                ctx.fillText(`📷 @${instagramContact}`, width / 2, contactY);
                contactY -= 25;
            }
            
            if (telegramContact) {
                ctx.fillText(`✈️ @${telegramContact}`, width / 2, contactY);
            }
        }
        
        // Draw navigation indicators (except on last slide)
        if (slideIndex < this.slides.length - 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = `700 ${Math.round(width * 0.03)}px Inter`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            
            // "Листай" on the left - поднимаем выше
            ctx.fillText('Листай', 30, height - 70);
            
            // Arrow on the right - поднимаем выше
            ctx.textAlign = 'right';
            ctx.font = `400 ${Math.round(width * 0.04)}px Inter`;
            ctx.fillText('→', width - 30, height - 70);
        }
        
        // Draw slide number - опускаем ниже
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `600 ${Math.round(width * 0.025)}px Inter`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`${slideIndex + 1}/${this.slides.length}`, width - 20, 60);
    }

    // Get default slide styles
    getDefaultSlideStyles() {
        return {
            backgroundColor: '#833ab4',
            backgroundImage: null,
            backgroundOpacity: 0.4,
            backgroundPositionX: 50,
            backgroundPositionY: 50,
            backgroundScale: 100,
            textColor: '#ffffff',
            fontSize: 20,
            fontFamily: 'Inter',
            textWidth: 90
        };
    }

    // Draw branding elements on canvas
    async drawBrandingOnCanvas(ctx, slide, styles, width, height, brandingOptions) {
        if (!brandingOptions.includeLogo && !brandingOptions.includeWatermark) {
            return;
        }

        const logoSize = brandingOptions.logoSize || 40;
        const position = brandingOptions.logoPosition || 'bottom-right';
        
        // Create FlashPost logo
        const logoCanvas = document.createElement('canvas');
        const logoCtx = logoCanvas.getContext('2d');
        logoCanvas.width = logoSize * 3;
        logoCanvas.height = logoSize;
        
        // Draw logo background
        if (brandingOptions.includeLogo) {
            // Create gradient background for logo
            const gradient = logoCtx.createLinearGradient(0, 0, logoCanvas.width, logoCanvas.height);
            gradient.addColorStop(0, '#833ab4');
            gradient.addColorStop(0.5, '#fd1d1d');
            gradient.addColorStop(1, '#fcb045');
            
            logoCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
            
            // Draw logo text
            logoCtx.fillStyle = '#ffffff';
            logoCtx.font = `bold ${logoSize * 0.6}px Inter`;
            logoCtx.textAlign = 'center';
            logoCtx.textBaseline = 'middle';
            logoCtx.fillText('FlashPost', logoCanvas.width / 2, logoCanvas.height / 2);
            
            // Add small "AI" badge
            logoCtx.fillStyle = gradient;
            logoCtx.font = `600 ${logoSize * 0.3}px Inter`;
            logoCtx.fillText('AI', logoCanvas.width * 0.85, logoCanvas.height * 0.3);
        }
        
        // Calculate position
        let x, y;
        const margin = 15;
        
        switch (position) {
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'top-right':
                x = width - logoCanvas.width - margin;
                y = margin;
                break;
            case 'bottom-left':
                x = margin;
                y = height - logoCanvas.height - margin;
                break;
            case 'bottom-right':
                x = width - logoCanvas.width - margin;
                y = height - logoCanvas.height - margin;
                break;
            case 'center-bottom':
                x = (width - logoCanvas.width) / 2;
                y = height - logoCanvas.height - margin;
                break;
            default:
                x = width - logoCanvas.width - margin;
                y = height - logoCanvas.height - margin;
        }
        
        // Draw logo
        if (brandingOptions.includeLogo) {
            ctx.globalAlpha = 0.9;
            ctx.drawImage(logoCanvas, x, y);
            ctx.globalAlpha = 1.0;
        }
        
        // Draw watermark
        if (brandingOptions.includeWatermark) {
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.font = `300 ${width * 0.08}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Rotate text for diagonal watermark
            ctx.translate(width / 2, height / 2);
            ctx.rotate(-Math.PI / 6); // -30 degrees
            ctx.fillText('FlashPost AI', 0, 0);
            ctx.restore();
        }
    }

    // Legacy download function (for backward compatibility)
    async downloadAllSlides() {
        await this.createAndDownloadImages('jpeg', '1080x1080', 90, { includeLogo: true });
    }

    // Create and download JPEG slides
    async createAndDownloadJPEGSlides() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Instagram carousel size (1080x1080 - квадратный формат)
        canvas.width = 1080;
        canvas.height = 1080;
        
        for (let i = 0; i < this.slides.length; i++) {
            const slide = this.slides[i];
            const styles = this.slideStyles[i] || {
                backgroundColor: '#833ab4',
                backgroundImage: null,
                backgroundOpacity: 0.4,
                backgroundPositionX: 50,
                backgroundPositionY: 50,
                backgroundScale: 100,
                textColor: '#ffffff',
                fontSize: 20,
                fontFamily: 'Inter'
            };
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background color
            ctx.fillStyle = styles.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw background image if exists
            if (styles.backgroundImage) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            // Calculate position and scale
                            const scale = (styles.backgroundScale || 100) / 100;
                            const scaledWidth = img.width * scale;
                            const scaledHeight = img.height * scale;
                            
                            const x = (canvas.width - scaledWidth) * (styles.backgroundPositionX || 50) / 100;
                            const y = (canvas.height - scaledHeight) * (styles.backgroundPositionY || 50) / 100;
                            
                            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                            
                            // Apply opacity overlay
                            const opacity = styles.backgroundOpacity || 0.4;
                            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            resolve();
                        };
                        img.onerror = reject;
                        img.src = styles.backgroundImage;
                    });
                } catch (error) {
                    console.warn('Ошибка загрузки фонового изображения:', error);
                }
            }
            
            // Draw text
            ctx.fillStyle = styles.textColor;
            ctx.font = `bold ${Math.round(styles.fontSize * 2.2)}px ${styles.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Сначала разбиваем по переносам строк, затем по словам
            const textLines = slide.text.split('\n');
            const lines = [];
            const maxWidth = canvas.width * 0.75; // Меньше ширина для квадратного формата
            
            textLines.forEach(textLine => {
                if (textLine.trim() === '') {
                    // Пустая строка - добавляем как есть
                    lines.push('');
                } else {
                    // Обрабатываем перенос слов в строке
                    const words = textLine.split(' ');
                    let currentLine = '';
                    
                    for (const word of words) {
                        const testLine = currentLine + (currentLine ? ' ' : '') + word;
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth && currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    }
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                }
            });
            
            // Draw lines
            const lineHeight = styles.fontSize * 2.8;
            const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                if (line !== '') { // Не рисуем пустые строки, но учитываем их в расчете позиции
                    ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
                }
            });
            
            // Add slide number (опускаем ниже для лучшей видимости)
            ctx.font = 'bold 32px Inter';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'right';
            ctx.fillText(`${i + 1}/${this.slides.length}`, canvas.width - 40, 100);
            
            // Add contacts on first and last slide
            const instagramContact = document.getElementById('instagramInput')?.value.trim();
            const telegramContact = document.getElementById('telegramInput')?.value.trim();
            const nickname = document.getElementById('nicknameInput')?.value.trim();
            
            if ((i === 0 || i === this.slides.length - 1) && (instagramContact || telegramContact || nickname)) {
                ctx.font = 'bold 28px Inter';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.textAlign = 'center';
                
                let contactY = canvas.height - 150;
                
                if (nickname) {
                    ctx.fillText(nickname, canvas.width / 2, contactY);
                    contactY += 40;
                }
                
                if (instagramContact) {
                    ctx.fillText(`📷 @${instagramContact}`, canvas.width / 2, contactY);
                    contactY += 40;
                }
                
                if (telegramContact) {
                    ctx.fillText(`✈️ @${telegramContact}`, canvas.width / 2, contactY);
                }
            }
            
            // Convert to JPEG and download
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.download = `flashpost-carousel-${i + 1}.jpg`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Create slides text file
    async createSlidesZip() {
        const topicInput = document.getElementById('topicInput');
        const topic = topicInput ? topicInput.value.trim() : 'Неизвестная тема';
        
        let content = `КАРУСЕЛЬ FLASHPOST AI\n`;
        content += `Тема: ${topic}\n`;
        content += `Создано: ${new Date().toLocaleString()}\n`;
        content += `Количество слайдов: ${this.slides.length}\n\n`;
        content += `${'='.repeat(50)}\n\n`;

        this.slides.forEach((slide, index) => {
            content += `СЛАЙД ${index + 1}/${this.slides.length}\n`;
            content += `Тип: ${slide.type || 'текст'}\n`;
            content += `${'-'.repeat(30)}\n`;
            content += `${slide.text}\n\n`;
            
            if (index < this.slides.length - 1) {
                content += `${'='.repeat(50)}\n\n`;
            }
        });

        content += `\n\nСоздано с помощью FlashPost AI\n`;
        content += `https://flashpost.ai\n`;

        return content;
    }

    // Reset current slide
    resetCurrentSlide() {
        if (confirm('Сбросить все изменения текущего слайда?')) {
            // Сброс к исходному тексту
            const originalSlide = this.slides[this.currentEditingSlide];
            if (originalSlide) {
                const slideTextEditor = document.getElementById('slideTextEditor');
                if (slideTextEditor) {
                    slideTextEditor.value = originalSlide.text;
                }
                
                // Сброс стилей к умолчанию
                this.slideStyles[this.currentEditingSlide] = {
                    backgroundColor: '#833ab4',
                    backgroundImage: null,
                    backgroundOpacity: 0.4,
                    backgroundPositionX: 50,
                    backgroundPositionY: 50,
                    backgroundScale: 100,
                    textColor: '#ffffff',
                    fontSize: 20,
                    fontFamily: 'Inter'
                };
                
                this.updateEditorContent();
                this.showToast('🔄 Слайд сброшен', 'success');
            }
        }
    }

    // Save current slide text
    saveCurrentSlideText() {
        const slideTextEditor = document.getElementById('slideTextEditor');
        if (slideTextEditor && this.slides[this.currentEditingSlide]) {
            this.slides[this.currentEditingSlide].text = slideTextEditor.value;
            
            // Сохраняем также HTML с выделениями
            const slideText = document.getElementById('slideText');
            if (slideText) {
                this.slides[this.currentEditingSlide].highlightedHTML = slideText.innerHTML;
            }
        }
    }

    // Load slide with highlights
    loadSlideWithHighlights() {
        if (!this.slides || this.currentEditingSlide >= this.slides.length) return;

        const slide = this.slides[this.currentEditingSlide];
        const slideText = document.getElementById('slideText');
        const slideTextEditor = document.getElementById('slideTextEditor');

        if (slideTextEditor) {
            slideTextEditor.value = slide.text;
        }

        // Восстанавливаем выделения если они есть
        if (slideText) {
            if (slide.highlightedHTML) {
                slideText.innerHTML = slide.highlightedHTML;
                // Применяем текущие настройки свечения к восстановленным выделениям
                this.applyGlowToHighlightedText();
            } else {
                // Если нет сохраненных выделений, обрабатываем звездочки и переносы строк
                this.processTextWithHighlights();
            }
        }
    }

    // Close editor
    closeEditor() {
        this.saveCurrentSlideText();
        
        // Clean up drag listeners
        this.removeDragListeners();
        this.removeAdditionalTextListeners();
        
        const editorOverlay = document.getElementById('editorOverlay');
        if (editorOverlay) {
            editorOverlay.style.display = 'none';
        }
        
        // Update main carousel with edited content and styles
        this.renderCarousel();
        this.updateCarouselDisplay();
        this.applyStylesToMainCarousel();
        this.showToast('💾 Изменения сохранены', 'success');
    }

    // Remove additional text listeners
    removeAdditionalTextListeners() {
        const slidePreview = document.getElementById('slidePreview');
        if (!slidePreview) return;
        
        const additionalTexts = slidePreview.querySelectorAll('.additional-text-element');
        additionalTexts.forEach(element => {
            // Remove all event listeners by cloning the element
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        });
    }

    // Apply styles to main carousel
    applyStylesToMainCarousel() {
        const carouselTrack = document.getElementById('carouselTrack');
        if (!carouselTrack) return;

        const slides = carouselTrack.querySelectorAll('.carousel-slide');
        slides.forEach((slideElement, index) => {
            const styles = this.slideStyles[index];
            const slide = this.slides[index];
            if (!styles || !slide) return;

            // Apply background styles
            slideElement.style.backgroundColor = styles.backgroundColor;
            
            if (styles.backgroundImage) {
                slideElement.style.backgroundImage = `url(${styles.backgroundImage})`;
                slideElement.style.backgroundSize = 'cover';
                slideElement.style.backgroundPosition = 'center';
            }

            // Apply text styles and highlighted content
            const slideContent = slideElement.querySelector('.slide-content');
            if (slideContent) {
                slideContent.style.color = styles.textColor;
                slideContent.style.fontSize = styles.fontSize + 'px';
                slideContent.style.fontFamily = styles.fontFamily;
                
                // Apply highlighted HTML if available, otherwise use plain text with line breaks
                if (slide.highlightedHTML) {
                    slideContent.innerHTML = slide.highlightedHTML;
                } else {
                    slideContent.innerHTML = this.convertLineBreaksToHTML(slide.text);
                }
            }

            // Add additional texts to main carousel slide
            this.renderAdditionalTextsOnMainCarousel(slideElement, index);
        });
    }

    // Render additional texts on main carousel slide
    renderAdditionalTextsOnMainCarousel(slideElement, slideIndex) {
        // Remove existing additional texts
        const existingTexts = slideElement.querySelectorAll('.additional-text-element');
        existingTexts.forEach(el => el.remove());
        
        const slideTexts = this.additionalTexts?.[slideIndex] || [];
        
        slideTexts.forEach(textItem => {
            const textElement = document.createElement('div');
            textElement.className = 'additional-text-element';
            textElement.style.cssText = `
                position: absolute;
                left: ${textItem.position.x}%;
                top: ${textItem.position.y}%;
                transform: translate(-50%, -50%);
                color: ${textItem.style.color};
                font-size: ${textItem.style.fontSize}px;
                font-family: ${textItem.style.fontFamily};
                font-weight: ${textItem.style.fontWeight};
                z-index: 8;
                text-align: center;
                word-wrap: break-word;
                max-width: 80%;
                line-height: 1.3;
            `;
            textElement.innerHTML = this.convertLineBreaksToHTML(textItem.text);
            
            slideElement.appendChild(textElement);
        });
    }

    // Open Manual Modal
    openManualModal() {
        console.log('📝 Открытие ручного ввода');
        const manualModal = document.getElementById('manualModal');
        if (manualModal) {
            manualModal.style.display = 'flex';
            this.bindManualModalEvents();
            
            // Очищаем поле ввода
            const manualTextInput = document.getElementById('manualTextInput');
            if (manualTextInput) {
                manualTextInput.value = '';
                manualTextInput.focus();
            }
        }
    }

    // Bind manual modal events
    bindManualModalEvents() {
        const closeManualBtn = document.getElementById('closeManualBtn');
        const cancelManualBtn = document.getElementById('cancelManualBtn');
        const createManualBtn = document.getElementById('createManualBtn');
        const manualModal = document.getElementById('manualModal');
        const manualTextInput = document.getElementById('manualTextInput');

        // Close modal events
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

        // Click outside to close
        if (manualModal) {
            manualModal.onclick = (e) => {
                if (e.target === manualModal) {
                    manualModal.style.display = 'none';
                }
            };
        }

        // Create manual carousel
        if (createManualBtn) {
            createManualBtn.onclick = () => {
                this.createManualCarousel();
            };
        }

        // Real-time stats update and keyboard shortcuts
        if (manualTextInput) {
            // Update stats on input
            manualTextInput.oninput = () => {
                this.updateManualInputStats();
            };

            // Keyboard shortcuts
            manualTextInput.onkeydown = (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.createManualCarousel();
                }
            };

            // Initial stats update
            this.updateManualInputStats();
        }
    }

    // Update manual input statistics
    updateManualInputStats() {
        const manualTextInput = document.getElementById('manualTextInput');
        const manualCharCount = document.getElementById('manualCharCount');
        const manualSlideCount = document.getElementById('manualSlideCount');

        if (!manualTextInput || !manualCharCount || !manualSlideCount) return;

        const inputText = manualTextInput.value;
        const charCount = inputText.length;

        // Calculate potential slides
        let slideTexts = [];
        if (inputText.trim()) {
            // Try double space separation
            slideTexts = inputText.split('  ').map(text => text.trim()).filter(text => text);
            
            // If no double spaces, try double line breaks
            if (slideTexts.length === 1) {
                slideTexts = inputText.split('\n\n').map(text => text.trim()).filter(text => text);
            }
            
            // If still one slide, try single line breaks
            if (slideTexts.length === 1) {
                const lines = inputText.split('\n').map(text => text.trim()).filter(text => text);
                if (lines.length > 1) {
                    slideTexts = lines;
                }
            }
        }

        const slideCount = Math.min(slideTexts.length, 15);

        // Update display
        manualCharCount.textContent = `${charCount} символов`;
        manualSlideCount.textContent = `${slideCount} слайдов`;

        // Color coding for slide count
        if (slideCount === 0) {
            manualSlideCount.style.color = 'var(--text-secondary)';
        } else if (slideCount <= 10) {
            manualSlideCount.style.color = '#4ade80'; // Green
        } else if (slideCount <= 15) {
            manualSlideCount.style.color = '#f59e0b'; // Orange
        } else {
            manualSlideCount.style.color = '#ef4444'; // Red
        }
    }

    // Create manual carousel
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

        // Разделяем текст на слайды по двойному пробелу
        let slideTexts = inputText.split('  ').map(text => text.trim()).filter(text => text);
        
        // Если нет двойных пробелов, пробуем разделить по переносам строк
        if (slideTexts.length === 1) {
            slideTexts = inputText.split('\n\n').map(text => text.trim()).filter(text => text);
        }
        
        // Если всё ещё один слайд, разделяем по одинарным переносам (максимум 10 слайдов)
        if (slideTexts.length === 1) {
            const lines = inputText.split('\n').map(text => text.trim()).filter(text => text);
            if (lines.length > 1) {
                slideTexts = lines.slice(0, 10); // Ограничиваем 10 слайдами
            }
        }

        // Ограничиваем количество слайдов
        if (slideTexts.length > 15) {
            slideTexts = slideTexts.slice(0, 15);
            this.showToast('⚠️ Ограничено 15 слайдами', 'warning');
        }

        if (slideTexts.length === 0) {
            this.showToast('Не удалось разделить текст на слайды', 'error');
            return;
        }

        console.log('📝 Создаём карусель из', slideTexts.length, 'слайдов');

        // Создаём слайды
        this.slides = slideTexts.map((text, index) => ({
            type: index === 0 ? 'hook' : (index === slideTexts.length - 1 ? 'cta' : 'content'),
            text: text,
            highlightedHTML: null
        }));

        // Инициализируем стили слайдов
        this.initializeSlideStyles();
        
        // Сбрасываем текущий слайд
        this.currentSlide = 0;
        
        // Отображаем карусель
        this.renderCarousel();
        this.showCarousel();
        
        // Закрываем модальное окно
        if (manualModal) {
            manualModal.style.display = 'none';
        }

        // Открываем редактор через полсекунды
        setTimeout(() => {
            this.openEditor();
        }, 500);

        this.haptic.success();
        this.showToast(`✅ Карусель из ${slideTexts.length} слайдов создана!`, 'success');
    }

    // Open Templates Modal
    openTemplatesModal() {
        console.log('📋 Открытие шаблонов');
        const templatesModal = document.getElementById('templatesModal');
        if (templatesModal) {
            templatesModal.style.display = 'flex';
            this.loadSavedTemplates();
            this.bindTemplatesModalEvents();
        }
    }

    // Load saved templates
    loadSavedTemplates() {
        const templatesList = document.getElementById('templatesList');
        if (!templatesList) return;

        const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
        
        if (savedTemplates.length === 0) {
            templatesList.innerHTML = `
                <div class="no-templates">
                    <div class="no-templates-icon">📋</div>
                    <p>У вас пока нет сохраненных шаблонов</p>
                    <small>Создайте карусель и сохраните её как шаблон</small>
                </div>
            `;
            return;
        }

        templatesList.innerHTML = '';
        savedTemplates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.innerHTML = `
                <div class="template-header">
                    <div>
                        <div class="template-name">${template.name}</div>
                        <div class="template-date">${new Date(template.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-tags">
                    ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                </div>
                <div class="template-usage">
                    <small>💡 <strong>Стили</strong> - применить только оформление к существующей карусели</small><br>
                    <small>📋 <strong>Полный</strong> - заменить карусель полностью (текст + стили)</small>
                </div>
                <div class="template-stats">
                    <span>${template.slides.length} слайдов</span>
                    <div class="template-actions">
                        <button class="template-action-btn" onclick="window.app.loadTemplate(${template.id})">Стили</button>
                        <button class="template-action-btn full" onclick="window.app.loadFullTemplate(${template.id})">Полный</button>
                        <button class="template-action-btn delete" onclick="window.app.deleteTemplate(${template.id})">Удалить</button>
                    </div>
                </div>
            `;
            templatesList.appendChild(templateItem);
        });
    }

    // Load template
    loadTemplate(templateId) {
        const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            this.showToast('Шаблон не найден', 'error');
            return;
        }

        // Проверяем, есть ли существующая карусель
        if (!this.slides || this.slides.length === 0) {
            this.showToast('Сначала создайте карусель, затем примените шаблон', 'warning');
            return;
        }

        // Применяем только стили из шаблона, сохраняя существующий текст
        this.applyTemplateStyles(template);
        
        // Обновляем отображение
        this.renderCarousel();
        this.updateCarouselDisplay();
        this.applyStylesToMainCarousel();
        
        // Close modal
        const templatesModal = document.getElementById('templatesModal');
        if (templatesModal) {
            templatesModal.style.display = 'none';
        }
        
        this.showToast(`✅ Стили шаблона "${template.name}" применены`, 'success');
    }

    // Apply template styles to existing slides
    applyTemplateStyles(template) {
        if (!template.styles || template.styles.length === 0) {
            this.showToast('В шаблоне нет стилей для применения', 'warning');
            return;
        }

        // Применяем стили к существующим слайдам
        this.slides.forEach((slide, index) => {
            // Берем стиль из шаблона (циклически, если слайдов больше чем стилей в шаблоне)
            const templateStyleIndex = index % template.styles.length;
            const templateStyle = template.styles[templateStyleIndex];
            
            // Создаем новый стиль на основе шаблона
            this.slideStyles[index] = {
                backgroundColor: templateStyle.backgroundColor || '#833ab4',
                backgroundImage: templateStyle.backgroundImage || null,
                backgroundOpacity: templateStyle.backgroundOpacity || 0.4,
                backgroundPositionX: templateStyle.backgroundPositionX || 50,
                backgroundPositionY: templateStyle.backgroundPositionY || 50,
                backgroundScale: templateStyle.backgroundScale || 100,
                textColor: templateStyle.textColor || '#ffffff',
                fontSize: templateStyle.fontSize || 20,
                fontFamily: templateStyle.fontFamily || 'Inter'
            };
        });

        // Применяем позиции текста если они есть в шаблоне
        if (template.textPositions) {
            this.slideTextPositions = { ...template.textPositions };
        }

        // Применяем дополнительные тексты если они есть в шаблоне
        if (template.additionalTexts) {
            this.additionalTexts = { ...template.additionalTexts };
        }

        // Если в редакторе, обновляем превью
        const editorOverlay = document.getElementById('editorOverlay');
        if (editorOverlay && editorOverlay.style.display !== 'none') {
            this.loadSlideStylesIntoControls();
            this.applySlideStyles();
            this.loadTextPosition();
        }

        console.log(`✅ Применены стили из шаблона к ${this.slides.length} слайдам`);
    }

    // Load full template (with text)
    loadFullTemplate(templateId) {
        const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
        const template = savedTemplates.find(t => t.id === templateId);
        
        if (!template) {
            this.showToast('Шаблон не найден', 'error');
            return;
        }

        // Полная загрузка шаблона
        this.slides = template.slides.map(slide => ({ ...slide }));
        this.slideStyles = template.styles.map(style => ({ ...style }));
        this.slideTextPositions = template.textPositions ? { ...template.textPositions } : {};
        this.additionalTexts = template.additionalTexts ? { ...template.additionalTexts } : {};
        this.currentSlide = 0;
        
        this.renderCarousel();
        this.showCarousel();
        this.updateCarouselDisplay();
        
        // Close modal
        const templatesModal = document.getElementById('templatesModal');
        if (templatesModal) {
            templatesModal.style.display = 'none';
        }
        
        this.showToast(`✅ Шаблон "${template.name}" полностью загружен`, 'success');
    }
    deleteTemplate(templateId) {
        if (!confirm('Удалить этот шаблон?')) return;
        
        const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
        const filteredTemplates = savedTemplates.filter(t => t.id !== templateId);
        
        localStorage.setItem('flashpost_templates', JSON.stringify(filteredTemplates));
        this.loadSavedTemplates();
        this.showToast('Шаблон удален', 'success');
    }

    // Bind templates modal events
    bindTemplatesModalEvents() {
        const closeTemplatesBtn = document.getElementById('closeTemplatesBtn');
        const savedTemplatesTab = document.getElementById('savedTemplatesTab');
        const saveCurrentTab = document.getElementById('saveCurrentTab');
        const templatesModal = document.getElementById('templatesModal');
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        const templateName = document.getElementById('templateName');
        const templateDescription = document.getElementById('templateDescription');
        const templateTags = document.getElementById('templateTags');

        if (closeTemplatesBtn) {
            closeTemplatesBtn.onclick = () => {
                templatesModal.style.display = 'none';
            };
        }

        if (templatesModal) {
            templatesModal.onclick = (e) => {
                if (e.target === templatesModal) {
                    templatesModal.style.display = 'none';
                }
            };
        }

        if (savedTemplatesTab && saveCurrentTab) {
            savedTemplatesTab.onclick = () => {
                savedTemplatesTab.classList.add('active');
                saveCurrentTab.classList.remove('active');
                document.getElementById('savedTemplatesContent').style.display = 'block';
                document.getElementById('saveCurrentContent').style.display = 'none';
            };

            saveCurrentTab.onclick = () => {
                saveCurrentTab.classList.add('active');
                savedTemplatesTab.classList.remove('active');
                document.getElementById('saveCurrentContent').style.display = 'block';
                document.getElementById('savedTemplatesContent').style.display = 'none';
            };
        }

        // Обработчик для кнопки сохранения шаблона
        if (saveTemplateBtn) {
            console.log('🔧 DEBUG: Save template button found, binding event');
            saveTemplateBtn.onclick = () => {
                console.log('🔧 DEBUG: Save template button clicked');
                this.saveTemplateFromModal();
            };
        } else {
            console.log('❌ DEBUG: Save template button not found');
        }

        // Обработчики для включения/отключения кнопки сохранения
        const updateSaveButton = () => {
            const name = templateName ? templateName.value.trim() : '';
            if (saveTemplateBtn) {
                saveTemplateBtn.disabled = !name || !this.slides || this.slides.length === 0;
            }
        };

        if (templateName) {
            templateName.addEventListener('input', updateSaveButton);
        }

        // Инициализируем состояние кнопки
        updateSaveButton();
    }

    // Save template from modal
    saveTemplateFromModal() {
        console.log('🔧 DEBUG: saveTemplateFromModal called');
        
        try {
            if (!this.slides || this.slides.length === 0) {
                console.log('❌ DEBUG: No slides to save');
                this.showToast('Нет слайдов для сохранения', 'error');
                return;
            }

            const templateName = document.getElementById('templateName');
            const templateDescription = document.getElementById('templateDescription');
            const templateTags = document.getElementById('templateTags');

            console.log('🔧 DEBUG: Form elements found:', {
                templateName: !!templateName,
                templateDescription: !!templateDescription,
                templateTags: !!templateTags
            });

            if (!templateName || !templateName.value.trim()) {
                console.log('❌ DEBUG: Template name is empty');
                this.showToast('Введите название шаблона', 'error');
                templateName?.focus();
                return;
            }

            const name = templateName.value.trim();
            const description = templateDescription ? templateDescription.value.trim() : `Шаблон из ${this.slides.length} слайдов`;
            const tagsInput = templateTags ? templateTags.value.trim() : '';
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : ['пользовательский'];

            console.log('🔧 DEBUG: Template data:', { name, description, tags });

            const template = {
                id: Date.now(),
                name: name,
                description: description,
                slides: this.slides.map(slide => ({ ...slide })),
                styles: this.slideStyles.map(style => ({ ...style })),
                textPositions: this.slideTextPositions ? { ...this.slideTextPositions } : {},
                additionalTexts: this.additionalTexts ? { ...this.additionalTexts } : {},
                createdAt: new Date().toISOString(),
                tags: tags
            };

            console.log('🔧 DEBUG: Template object created:', template);

            // Сохраняем в localStorage
            const savedTemplates = JSON.parse(localStorage.getItem('flashpost_templates') || '[]');
            console.log('🔧 DEBUG: Existing templates:', savedTemplates.length);
            
            savedTemplates.push(template);
            localStorage.setItem('flashpost_templates', JSON.stringify(savedTemplates));
            
            console.log('✅ DEBUG: Template saved to localStorage');

            // Очищаем форму
            if (templateName) templateName.value = '';
            if (templateDescription) templateDescription.value = '';
            if (templateTags) templateTags.value = '';

            // Обновляем список шаблонов
            this.loadSavedTemplates();

            // Переключаемся на вкладку сохраненных шаблонов
            const savedTemplatesTab = document.getElementById('savedTemplatesTab');
            const saveCurrentTab = document.getElementById('saveCurrentTab');
            if (savedTemplatesTab && saveCurrentTab) {
                savedTemplatesTab.classList.add('active');
                saveCurrentTab.classList.remove('active');
                document.getElementById('savedTemplatesContent').style.display = 'block';
                document.getElementById('saveCurrentContent').style.display = 'none';
            }

            this.showToast(`✅ Шаблон "${name}" сохранен`, 'success');
            
        } catch (error) {
            console.error('❌ ERROR in saveTemplateFromModal:', error);
            this.showToast('Ошибка сохранения шаблона: ' + error.message, 'error');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        console.log(`Toast [${type}]: ${message}`);
        
        // Создаем элемент уведомления
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Стили для toast
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
        
        document.body.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Удаление через 3 секунды
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Setup touch navigation for mobile devices
    setupTouchNavigation() {
        const carouselContainer = document.getElementById('carouselTrack');
        if (!carouselContainer) return;

        let startX = 0;
        let startY = 0;
        let isDragging = false;

        carouselContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);
            
            // Prevent vertical scrolling if horizontal swipe is detected
            if (diffX > diffY && diffX > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        carouselContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = Math.abs(startY - endY);
            
            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > diffY && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
        }, { passive: true });
    }

    // Share carousel
    shareCarousel() {
        if (!this.slides || this.slides.length === 0) {
            this.showToast('Нет карусели для публикации', 'error');
            return;
        }

        const topicInput = document.getElementById('topicInput');
        const topic = topicInput ? topicInput.value.trim() : 'Интересная тема';
        
        const shareText = `🎨 Создал крутую карусель на тему "${topic}" с помощью FlashPost AI!\n\n${this.slides.length} слайдов готового контента 🔥\n\n#FlashPostAI #контент #карусель`;
        
        // Попытка использовать Web Share API
        if (navigator.share) {
            navigator.share({
                title: 'FlashPost AI - Карусель готова!',
                text: shareText,
                url: window.location.href
            }).then(() => {
                this.showToast('✅ Карусель опубликована!', 'success');
            }).catch((error) => {
                console.log('Ошибка публикации:', error);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    // Fallback share method
    fallbackShare(text) {
        // Копируем текст в буфер обмена
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Текст скопирован в буфер обмена', 'success');
            }).catch(() => {
                this.showShareModal(text);
            });
        } else {
            this.showShareModal(text);
        }
    }

    // Show share modal
    showShareModal(text) {
        const modal = document.createElement('div');
        modal.className = 'share-modal-overlay';
        modal.innerHTML = `
            <div class="share-modal">
                <div class="share-modal-header">
                    <h3>📤 Поделиться каруселью</h3>
                    <button class="share-modal-close">×</button>
                </div>
                <div class="share-modal-body">
                    <p>Скопируйте текст для публикации:</p>
                    <textarea class="share-text" readonly>${text}</textarea>
                    <div class="share-buttons">
                        <button class="share-btn telegram">✈️ Telegram</button>
                        <button class="share-btn whatsapp">💬 WhatsApp</button>
                        <button class="share-btn copy">📋 Копировать</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector('.share-modal-close').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new FlashPostApp();
        console.log('✅ FlashPost App успешно инициализирован');
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        
        // Показываем ошибку пользователю
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>❌ Ошибка инициализации</h3>
            <p>Приложение не может запуститься</p>
            <p><small>${error.message}</small></p>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Handle page visibility for Telegram WebApp
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.app) {
        console.log('📱 Приложение стало видимым');
    }
});