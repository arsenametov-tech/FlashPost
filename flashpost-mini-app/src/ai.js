// ===== AI MODULE (CLEAN VERSION) =====
// Handles AI integration and keyword extraction

class AIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.apiKey = null; // Будет установлен при настройке
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        console.log('✅ AIManager (clean) инициализирован');
    }

    // Проверка доступности AI
    isAvailable() {
        // Проверяем есть ли API ключ и доступность сети
        try {
            // Простая проверка - есть ли API ключ или можем ли мы использовать AI
            return this.apiKey !== null || 
                   (typeof window !== 'undefined' && window.navigator && window.navigator.onLine !== false);
        } catch (error) {
            console.log('ℹ️ AI недоступен:', error.message);
            return false;
        }
    }

    // Установка API ключа
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        console.log('✅ AI API ключ установлен');
    }

    // ===== ОСНОВНЫЕ МЕТОДЫ ГЕНЕРАЦИИ =====

    // Основной метод генерации карусели через AI
    async generateCarousel(topic) {
        console.log('🤖 AI генерация карусели для темы:', topic);
        
        try {
            // Генерируем структурированный контент через AI
            const aiContent = await this.generateStructuredContent(topic);
            
            // Конвертируем в слайды проекта
            const projectSlides = await this.convertToProjectSlides(aiContent, topic);
            
            // Сохраняем в state через StateManager
            this.state.clearProject();
            projectSlides.forEach(slideData => {
                this.state.createSlide(slideData);
            });
            
            // Устанавливаем первый слайд как активный
            if (projectSlides.length > 0) {
                this.state.setCurrentSlideIndex(0);
            }
            
            console.log(`✅ AI карусель создана: ${projectSlides.length} слайдов`);
            
            return {
                slides: projectSlides,
                topic: topic,
                generatedBy: 'AI-Clean',
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('❌ Ошибка AI генерации карусели:', error);
            throw error;
        }
    }
    // Высококачественная генерация карусели
    async generateHighQualityCarousel(topic) {
        console.log('🎯 Генерация высококачественной карусели для темы:', topic);
        
        try {
            // Проверяем лимиты пользователя
            if (!this.checkAIUsageLimits()) {
                throw new Error('Превышен лимит AI генерации для FREE пользователей');
            }

            // Показываем индикацию загрузки
            this.showLoadingIndicator('Генерируем контент...');
            
            // Используем PRO MODE генерацию
            const result = await this.generateProModeCarousel(topic);
            
            // Увеличиваем счетчик использования AI
            this.incrementAIUsage();
            
            // Скрываем индикацию загрузки
            this.hideLoadingIndicator();
            
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка PRO MODE генерации, переход на стандартную:', error);
            
            try {
                // Fallback на стандартную генерацию
                const result = await this.generateCarousel(topic);
                this.hideLoadingIndicator();
                return result;
            } catch (fallbackError) {
                console.error('❌ Ошибка fallback генерации:', fallbackError);
                this.hideLoadingIndicator();
                // Возвращаем минимальную заглушку
                return this.generateFallbackCarousel(topic);
            }
        }
    }

    // Проверка лимитов AI использования
    checkAIUsageLimits() {
        try {
            const userPlan = this.state.getUserPlan() || 'FREE';
            
            if (userPlan === 'PRO') {
                return true; // PRO пользователи без лимитов
            }
            
            // FREE пользователи: 3 генерации в день
            const today = new Date().toDateString();
            const usageKey = `ai_usage_${today}`;
            const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
            
            return todayUsage < 3;
            
        } catch (error) {
            console.error('❌ Ошибка проверки лимитов AI:', error);
            return true; // В случае ошибки разрешаем использование
        }
    }

    // Увеличение счетчика использования AI
    incrementAIUsage() {
        try {
            const today = new Date().toDateString();
            const usageKey = `ai_usage_${today}`;
            const todayUsage = parseInt(localStorage.getItem(usageKey) || '0');
            localStorage.setItem(usageKey, (todayUsage + 1).toString());
            
            console.log(`📊 AI использование сегодня: ${todayUsage + 1}/3`);
            
        } catch (error) {
            console.error('❌ Ошибка обновления счетчика AI:', error);
        }
    }

    // Показать индикацию загрузки
    showLoadingIndicator(message = 'Загрузка...') {
        try {
            // Создаем или обновляем индикатор загрузки
            let loadingEl = document.getElementById('ai-loading-indicator');
            
            if (!loadingEl) {
                loadingEl = document.createElement('div');
                loadingEl.id = 'ai-loading-indicator';
                loadingEl.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 10px;
                    z-index: 10000;
                    text-align: center;
                    font-family: 'Inter', sans-serif;
                    backdrop-filter: blur(10px);
                `;
                document.body.appendChild(loadingEl);
            }
            
            loadingEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>${message}</span>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            loadingEl.style.display = 'block';
            
        } catch (error) {
            console.error('❌ Ошибка показа индикатора загрузки:', error);
        }
    }

    // Скрыть индикацию загрузки
    hideLoadingIndicator() {
        try {
            const loadingEl = document.getElementById('ai-loading-indicator');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Ошибка скрытия индикатора загрузки:', error);
        }
    }

    // PRO MODE генерация карусели
    async generateProModeCarousel(topic) {
        console.log('🎯 PRO MODE: Двухэтапная генерация карусели для темы:', topic);
        
        try {
            // ЭТАП A: Генерация outline (план слайдов)
            const carouselOutline = await this.generateCarouselOutline(topic);
            
            // ЭТАП B: Генерация контента на основе outline
            const carouselContent = await this.generateCarouselContent(topic, carouselOutline);
            
            // Конвертация в слайды проекта
            const proModeSlides = await this.convertToProModeSlides(carouselContent);
            
            // Сохранение в state
            this.state.clearProject();
            proModeSlides.forEach(slideData => {
                this.state.createSlide(slideData);
            });
            
            // Устанавливаем первый слайд как активный
            if (proModeSlides.length > 0) {
                this.state.setCurrentSlideIndex(0);
            }
            
            console.log(`✅ PRO MODE карусель создана: ${proModeSlides.length} слайдов`);
            
            return {
                slides: proModeSlides,
                topic: topic,
                generatedBy: 'AI-ProMode',
                timestamp: Date.now(),
                outline: carouselOutline,
                mode: 'pro_carousel_generation'
            };
            
        } catch (error) {
            console.error('❌ Ошибка PRO MODE генерации:', error);
            throw error;
        }
    }
    // Генерация fallback карусели
    generateFallbackCarousel(topic) {
        console.log('🔄 Генерация fallback карусели для темы:', topic);
        
        const fallbackSlides = [
            {
                id: 1,
                background: { type: 'color', color: '#833ab4' },
                textBlocks: [{
                    id: 'fallback_1',
                    text: `${topic}\n\nОсновная информация по теме`,
                    x: 50, y: 50, width: 80, height: 'auto',
                    font: 'Inter', size: 18, weight: 600, color: '#ffffff',
                    textAlign: 'center', lineHeight: 1.4
                }],
                autoKeywords: [],
                generatedBy: 'AI-Fallback'
            },
            {
                id: 2,
                background: { type: 'color', color: '#fd1d1d' },
                textBlocks: [{
                    id: 'fallback_2',
                    text: `Ключевые моменты\n\nВажная информация о ${topic}`,
                    x: 50, y: 50, width: 80, height: 'auto',
                    font: 'Inter', size: 18, weight: 600, color: '#ffffff',
                    textAlign: 'center', lineHeight: 1.4
                }],
                autoKeywords: [],
                generatedBy: 'AI-Fallback'
            },
            {
                id: 3,
                background: { type: 'color', color: '#fcb045' },
                textBlocks: [{
                    id: 'fallback_3',
                    text: `Заключение\n\nГлавные выводы по теме ${topic}`,
                    x: 50, y: 50, width: 80, height: 'auto',
                    font: 'Inter', size: 18, weight: 600, color: '#ffffff',
                    textAlign: 'center', lineHeight: 1.4
                }],
                autoKeywords: [],
                generatedBy: 'AI-Fallback'
            }
        ];
        
        // Сохраняем в state
        this.state.clearProject();
        fallbackSlides.forEach(slideData => {
            this.state.createSlide(slideData);
        });
        
        if (fallbackSlides.length > 0) {
            this.state.setCurrentSlideIndex(0);
        }
        
        return {
            slides: fallbackSlides,
            topic: topic,
            generatedBy: 'AI-Fallback',
            timestamp: Date.now()
        };
    }
    // Генерация outline карусели (ADVANCED AI PIPELINE)
    async generateCarouselOutline(topic) {
        console.log('📋 ADVANCED AI: Генерация outline для темы:', topic);
        
        // ADVANCED AI PIPELINE: Создаем детальный outline для 8-11 слайдов
        const advancedOutline = {
            topic: topic,
            totalSlides: Math.floor(Math.random() * 4) + 8, // 8-11 слайдов
            structure: "hook → context → problem → agitation → solution → benefits → proof → objections → action → bonus → cta",
            targetAudience: this.analyzeTargetAudience(topic),
            contentStrategy: this.defineContentStrategy(topic),
            outline: []
        };

        // Генерируем детальный план слайдов
        const slideTypes = [
            { type: "hook", weight: 1.0, required: true },
            { type: "context", weight: 0.8, required: true },
            { type: "problem", weight: 1.0, required: true },
            { type: "agitation", weight: 0.7, required: false },
            { type: "solution", weight: 1.0, required: true },
            { type: "benefits", weight: 0.9, required: true },
            { type: "proof", weight: 0.8, required: true },
            { type: "objections", weight: 0.6, required: false },
            { type: "action", weight: 1.0, required: true },
            { type: "bonus", weight: 0.5, required: false },
            { type: "cta", weight: 1.0, required: true }
        ];

        // Выбираем слайды для нужного количества
        let selectedSlides = slideTypes.filter(s => s.required);
        const remainingSlots = advancedOutline.totalSlides - selectedSlides.length;
        
        if (remainingSlots > 0) {
            const optionalSlides = slideTypes
                .filter(s => !s.required)
                .sort((a, b) => b.weight - a.weight)
                .slice(0, remainingSlots);
            selectedSlides = [...selectedSlides, ...optionalSlides];
        }

        // Создаем детальный outline для каждого слайда
        advancedOutline.outline = selectedSlides.map((slideType, index) => {
            return this.generateAdvancedSlideOutline(slideType.type, index + 1, topic, advancedOutline.targetAudience);
        });
        
        console.log('✅ ADVANCED OUTLINE создан:', advancedOutline.outline.length, 'слайдов');
        return advancedOutline;
    }

    // Анализ целевой аудитории
    analyzeTargetAudience(topic) {
        const audienceMap = {
            'бизнес': 'предприниматели и руководители',
            'маркетинг': 'маркетологи и SMM-специалисты',
            'здоровье': 'люди, заботящиеся о здоровье',
            'образование': 'студенты и преподаватели',
            'технологии': 'IT-специалисты и энтузиасты',
            'финансы': 'инвесторы и финансовые консультанты',
            'психология': 'люди, интересующиеся саморазвитием',
            'спорт': 'спортсмены и фитнес-энтузиасты'
        };

        const topicLower = topic.toLowerCase();
        for (const [key, audience] of Object.entries(audienceMap)) {
            if (topicLower.includes(key)) {
                return audience;
            }
        }
        return 'широкая аудитория';
    }

    // Определение контентной стратегии
    defineContentStrategy(topic) {
        const strategies = {
            'educational': ['обучение', 'образование', 'курс', 'урок'],
            'promotional': ['продажа', 'реклама', 'маркетинг', 'бренд'],
            'inspirational': ['мотивация', 'успех', 'достижение', 'цель'],
            'informational': ['новости', 'факты', 'исследование', 'данные'],
            'entertainment': ['развлечение', 'юмор', 'игра', 'хобби']
        };

        const topicLower = topic.toLowerCase();
        for (const [strategy, keywords] of Object.entries(strategies)) {
            if (keywords.some(keyword => topicLower.includes(keyword))) {
                return strategy;
            }
        }
        return 'educational'; // По умолчанию
    }

    // Генерация детального outline для слайда
    generateAdvancedSlideOutline(slideType, slideNumber, topic, targetAudience) {
        const slideOutlines = {
            hook: {
                mainIdea: `Захватывающий факт или статистика о ${topic}, которая удивит ${targetAudience}`,
                purpose: "Мгновенно захватить внимание и создать интригу",
                contentElements: ["Шокирующая статистика", "Неожиданный факт", "Провокационный вопрос"],
                emotionalTone: "удивление, любопытство",
                keyMessage: `${topic} не то, что вы думаете`
            },
            context: {
                mainIdea: `Контекст и актуальность ${topic} для ${targetAudience}`,
                purpose: "Установить релевантность темы для аудитории",
                contentElements: ["Текущая ситуация", "Почему это важно сейчас", "Связь с жизнью аудитории"],
                emotionalTone: "понимание, сопричастность",
                keyMessage: `Почему ${topic} критически важно для вас`
            },
            problem: {
                mainIdea: `Основная проблема, которую решает ${topic}`,
                purpose: "Четко обозначить болевую точку аудитории",
                contentElements: ["Описание проблемы", "Последствия игнорирования", "Масштаб проблемы"],
                emotionalTone: "беспокойство, осознание",
                keyMessage: `Вот что происходит без ${topic}`
            },
            agitation: {
                mainIdea: `Усиление проблемы и её последствий без ${topic}`,
                purpose: "Создать срочность и мотивацию к действию",
                contentElements: ["Ухудшение ситуации", "Упущенные возможности", "Цена бездействия"],
                emotionalTone: "тревога, срочность",
                keyMessage: `Каждый день без ${topic} - потерянная возможность`
            },
            solution: {
                mainIdea: `${topic} как идеальное решение проблемы`,
                purpose: "Представить решение как логичный выход",
                contentElements: ["Как работает решение", "Почему именно это", "Уникальность подхода"],
                emotionalTone: "облегчение, надежда",
                keyMessage: `${topic} - ваш путь к успеху`
            },
            benefits: {
                mainIdea: `Конкретные преимущества и результаты от ${topic}`,
                purpose: "Показать ценность и выгоды решения",
                contentElements: ["Список преимуществ", "Измеримые результаты", "Долгосрочная польза"],
                emotionalTone: "воодушевление, предвкушение",
                keyMessage: `Вот что вы получите с ${topic}`
            },
            proof: {
                mainIdea: `Доказательства эффективности ${topic}`,
                purpose: "Подкрепить обещания фактами и примерами",
                contentElements: ["Реальные кейсы", "Статистика успеха", "Отзывы экспертов"],
                emotionalTone: "доверие, уверенность",
                keyMessage: `${topic} работает - вот доказательства`
            },
            objections: {
                mainIdea: `Развеивание сомнений относительно ${topic}`,
                purpose: "Устранить барьеры и возражения",
                contentElements: ["Частые возражения", "Ответы на сомнения", "Развенчание мифов"],
                emotionalTone: "понимание, убеждение",
                keyMessage: `Ваши сомнения о ${topic} необоснованны`
            },
            action: {
                mainIdea: `Конкретные шаги для начала работы с ${topic}`,
                purpose: "Дать четкий план действий",
                contentElements: ["Пошаговый план", "Первые шаги", "Что делать прямо сейчас"],
                emotionalTone: "мотивация, готовность",
                keyMessage: `Начните с ${topic} уже сегодня`
            },
            bonus: {
                mainIdea: `Дополнительная ценность и бонусы от ${topic}`,
                purpose: "Добавить дополнительную мотивацию",
                contentElements: ["Скрытые преимущества", "Бонусные возможности", "Неожиданная польза"],
                emotionalTone: "приятное удивление",
                keyMessage: `${topic} дает больше, чем ожидается`
            },
            cta: {
                mainIdea: `Призыв к конкретному действию по ${topic}`,
                purpose: "Мотивировать к немедленному действию",
                contentElements: ["Четкий призыв", "Что делать", "Как начать"],
                emotionalTone: "решимость, действие",
                keyMessage: `Действуйте с ${topic} прямо сейчас`
            }
        };

        const outline = slideOutlines[slideType] || slideOutlines.hook;
        
        return {
            slideNumber: slideNumber,
            type: slideType,
            mainIdea: outline.mainIdea,
            purpose: outline.purpose,
            contentElements: outline.contentElements,
            emotionalTone: outline.emotionalTone,
            keyMessage: outline.keyMessage,
            connectionToPrevious: slideNumber === 1 ? "Начальный слайд" : `Развитие темы из слайда ${slideNumber - 1}`,
            targetLength: "2-4 строки текста",
            visualStyle: this.getVisualStyleForSlideType(slideType)
        };
    }

    // Получение визуального стиля для типа слайда
    getVisualStyleForSlideType(slideType) {
        const styles = {
            hook: { gradient: 'fire', intensity: 'high', mood: 'energetic' },
            context: { gradient: 'ocean', intensity: 'medium', mood: 'professional' },
            problem: { gradient: 'storm', intensity: 'high', mood: 'serious' },
            agitation: { gradient: 'danger', intensity: 'high', mood: 'urgent' },
            solution: { gradient: 'success', intensity: 'medium', mood: 'hopeful' },
            benefits: { gradient: 'growth', intensity: 'medium', mood: 'positive' },
            proof: { gradient: 'trust', intensity: 'low', mood: 'confident' },
            objections: { gradient: 'calm', intensity: 'low', mood: 'reassuring' },
            action: { gradient: 'energy', intensity: 'high', mood: 'motivating' },
            bonus: { gradient: 'surprise', intensity: 'medium', mood: 'delightful' },
            cta: { gradient: 'power', intensity: 'high', mood: 'decisive' }
        };
        
        return styles[slideType] || styles.hook;
    }
    // Генерация контента на основе outline (ADVANCED AI PIPELINE)
    async generateCarouselContent(topic, outline) {
        console.log('✍️ ADVANCED AI: Генерация контента на основе outline...');
        
        const content = {
            topic: topic,
            targetAudience: outline.targetAudience,
            contentStrategy: outline.contentStrategy,
            slides: outline.outline.map(outlineSlide => {
                const slideContent = this.generateAdvancedSlideContent(outlineSlide, topic, outline.targetAudience);
                
                return {
                    slideNumber: outlineSlide.slideNumber,
                    type: outlineSlide.type,
                    title: slideContent.title,
                    text: slideContent.text,
                    keywordType: slideContent.keywordType,
                    emotionalTone: outlineSlide.emotionalTone,
                    visualStyle: outlineSlide.visualStyle,
                    contentElements: outlineSlide.contentElements
                };
            })
        };
        
        console.log('✅ ADVANCED CONTENT создан:', content.slides.length, 'слайдов');
        return content;
    }

    // Генерация продвинутого контента для слайда
    generateAdvancedSlideContent(outlineSlide, topic, targetAudience) {
        const contentTemplates = {
            hook: {
                titles: [`${topic}`, `Правда о ${topic}`, `Секрет ${topic}`, `${topic}: Факты`],
                textPatterns: [
                    `Знали ли вы, что ${topic.toLowerCase()} может изменить жизнь за 30 дней?\n\nБолее 80% людей не знают этого секрета\nА те, кто знают — уже получают результаты\nУзнайте правду прямо сейчас`,
                    `${topic} — это не то, что вы думаете\n\nРеальные факты шокируют даже экспертов\nВ этой карусели — вся правда\nГотовы узнать секреты?`,
                    `Почему ${targetAudience} скрывают правду о ${topic.toLowerCase()}?\n\nВ этой карусели — честные ответы\nБез воды и рекламы\nТолько проверенные факты`
                ]
            },
            context: {
                titles: ['Ситуация', 'Реальность', 'Контекст', 'Что происходит'],
                textPatterns: [
                    `В 2024 году ${topic.toLowerCase()} стал критически важным\n\nБолее 70% ${targetAudience} уже используют это\nОстальные теряют возможности каждый день\nВремя действовать — сейчас`,
                    `Мир изменился, а подходы к ${topic.toLowerCase()} — нет\n\nСтарые методы больше не работают\nНужны новые решения для новых вызовов\nВот что работает сегодня`,
                    `${targetAudience} сталкиваются с новыми вызовами\n\n${topic} становится ключевым фактором успеха\nКто адаптируется быстрее — тот выигрывает\nНе отставайте от трендов`
                ]
            },
            problem: {
                titles: ['Проблема', 'Вызов', 'Препятствие', 'Что мешает'],
                textPatterns: [
                    `95% ${targetAudience} совершают одну критическую ошибку\n\nОни игнорируют важность ${topic.toLowerCase()}\nЭто приводит к потере времени и ресурсов\nА решение проще, чем кажется`,
                    `Главная проблема с ${topic.toLowerCase()} — неправильный подход\n\nБольшинство делают это неэффективно\nТеряют деньги и возможности\nНо есть проверенное решение`,
                    `Без правильного ${topic.toLowerCase()} вы рискуете:\n\n• Потерять конкурентные преимущества\n• Упустить лучшие возможности\n• Остаться позади конкурентов`
                ]
            },
            agitation: {
                titles: ['Последствия', 'Цена ошибки', 'Что теряете', 'Риски'],
                textPatterns: [
                    `Каждый день без ${topic.toLowerCase()} — это потерянные возможности\n\nВаши конкуренты уже используют это\nОни получают лучшие результаты\nА вы остаетесь позади`,
                    `Игнорирование ${topic.toLowerCase()} обходится дорого:\n\n• Упущенная прибыль\n• Потерянное время\n• Отставание от рынка\n• Стресс и разочарование`,
                    `Пока вы сомневаетесь, другие действуют\n\nОни уже получают результаты от ${topic.toLowerCase()}\nКаждый день промедления — шаг назад\nВремени на раздумья больше нет`
                ]
            },
            solution: {
                titles: ['Решение', 'Выход', 'Ответ', 'Как исправить'],
                textPatterns: [
                    `${topic} — это ваш ключ к успеху\n\nПроверенная система, которая работает\nТысячи ${targetAudience} уже получили результаты\nТеперь ваша очередь`,
                    `Правильный подход к ${topic.toLowerCase()} меняет всё\n\nПростые шаги дают мощные результаты\nНикаких сложных схем или теорий\nТолько то, что реально работает`,
                    `Секрет успешных ${targetAudience} — в правильном ${topic.toLowerCase()}\n\nОни знают, как это делать эффективно\nИспользуют проверенные методы\nПолучают стабильные результаты`
                ]
            },
            benefits: {
                titles: ['Преимущества', 'Выгоды', 'Результаты', 'Что получите'],
                textPatterns: [
                    `Правильный ${topic.toLowerCase()} дает:\n\n• Увеличение результатов на 300%\n• Экономию времени в 5 раз\n• Стабильный рост доходов\n• Уверенность в завтрашнем дне`,
                    `С ${topic.toLowerCase()} вы получаете:\n\n✅ Быстрые и измеримые результаты\n✅ Конкурентные преимущества\n✅ Экономию ресурсов\n✅ Долгосрочный успех`,
                    `Инвестиции в ${topic.toLowerCase()} окупаются за месяц\n\nДальше — только прибыль и рост\nСтабильные результаты год за годом\nЭто лучшее вложение в будущее`
                ]
            },
            proof: {
                titles: ['Доказательства', 'Факты', 'Результаты', 'Кейсы'],
                textPatterns: [
                    `Реальные результаты от ${topic.toLowerCase()}:\n\n• Компания А: +250% роста за год\n• Эксперт Б: доход вырос в 4 раза\n• Исследование: 89% участников довольны`,
                    `${topic} работает — вот доказательства:\n\n📊 Исследование 1000+ ${targetAudience}\n📈 Средний рост результатов: 180%\n⭐ 94% рекомендуют другим\n💰 ROI: 400% за первый год`,
                    `Независимые исследования подтверждают:\n\n${topic} увеличивает эффективность в 3 раза\nСокращает время достижения целей\nПовышает удовлетворенность результатами`
                ]
            },
            objections: {
                titles: ['Сомнения?', 'Возражения', 'Мифы', 'Правда'],
                textPatterns: [
                    `"${topic} слишком сложно" — это миф\n\nНа самом деле всё проще, чем кажется\nНужно только знать правильный подход\nТысячи людей уже убедились в этом`,
                    `Главные мифы о ${topic.toLowerCase()}:\n\n❌ "Это дорого" — окупается за месяц\n❌ "Это сложно" — есть простые методы\n❌ "Это не работает" — 94% довольны\n✅ Попробуйте и убедитесь сами`,
                    `Ваши сомнения понятны, но необоснованны\n\n${topic} доказал свою эффективность\nТысячи успешных кейсов\nНаучная база и практические результаты`
                ]
            },
            action: {
                titles: ['Действие', 'Как начать', 'Первые шаги', 'План'],
                textPatterns: [
                    `Как начать с ${topic.toLowerCase()} уже сегодня:\n\n1️⃣ Изучите основы (30 минут)\n2️⃣ Выберите подходящий метод\n3️⃣ Сделайте первый шаг\n4️⃣ Отслеживайте результаты`,
                    `Простой план внедрения ${topic.toLowerCase()}:\n\n• Неделя 1: Изучение и планирование\n• Неделя 2: Первые практические шаги\n• Неделя 3: Оптимизация процесса\n• Неделя 4: Анализ результатов`,
                    `Начните с ${topic.toLowerCase()} прямо сейчас:\n\nВыделите 15 минут в день\nПрименяйте один совет за раз\nОтслеживайте прогресс\nРезультаты появятся через неделю`
                ]
            },
            bonus: {
                titles: ['Бонус', 'Дополнительно', 'Секрет', 'Плюс'],
                textPatterns: [
                    `Скрытые преимущества ${topic.toLowerCase()}:\n\n🎁 Улучшение других сфер жизни\n🎁 Новые возможности и связи\n🎁 Повышение самооценки\n🎁 Вдохновение для окружающих`,
                    `${topic} дает больше, чем ожидается:\n\nНе только прямые результаты\nНо и побочные положительные эффекты\nУлучшение качества жизни в целом\nЭто инвестиция в себя`,
                    `Неожиданные бонусы от ${topic.toLowerCase()}:\n\n• Экономия на других расходах\n• Новые источники дохода\n• Расширение кругозора\n• Повышение статуса`
                ]
            },
            cta: {
                titles: ['Действуйте!', 'Начните сейчас', 'Ваш ход', 'Решайте'],
                textPatterns: [
                    `Готовы изменить жизнь с ${topic.toLowerCase()}?\n\n👍 Лайк, если материал полезен\n💬 Комментарий с вашим опытом\n📤 Репост друзьям\n🔔 Подписка на обновления`,
                    `Время действовать с ${topic.toLowerCase()}!\n\n✅ Сохраните этот пост\n✅ Поделитесь с коллегами\n✅ Начните применять сегодня\n✅ Напишите о результатах`,
                    `Не откладывайте ${topic.toLowerCase()} на завтра\n\nКаждый день промедления — потерянная выгода\nНачните прямо сейчас\nВаше будущее зависит от сегодняшних решений`
                ]
            }
        };

        const template = contentTemplates[outlineSlide.type] || contentTemplates.hook;
        const randomTitle = template.titles[Math.floor(Math.random() * template.titles.length)];
        const randomText = template.textPatterns[Math.floor(Math.random() * template.textPatterns.length)];

        // Определяем тип ключевых слов на основе эмоционального тона
        const keywordType = ['hook', 'agitation', 'cta', 'action'].includes(outlineSlide.type) ? 'emotional' : 'conceptual';

        return {
            title: randomTitle,
            text: randomText,
            keywordType: keywordType
        };
    }
    // Конвертация в PRO MODE слайды (ADVANCED AI PIPELINE)
    async convertToProModeSlides(content) {
        console.log('🔄 ADVANCED AI: Конвертация PRO MODE контента в слайды...');
        
        // Расширенная палитра градиентов для разных типов слайдов
        const advancedGradients = {
            'hook': [
                'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                'linear-gradient(135deg, #ff7675 0%, #d63031 100%)'
            ],
            'context': [
                'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                'linear-gradient(135deg, #81ecec 0%, #00cec9 100%)',
                'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)'
            ],
            'problem': [
                'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
                'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
            ],
            'agitation': [
                'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                'linear-gradient(135deg, #ff7675 0%, #d63031 100%)'
            ],
            'solution': [
                'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
                'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
            ],
            'benefits': [
                'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
                'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)'
            ],
            'proof': [
                'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
                'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)',
                'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)'
            ],
            'objections': [
                'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)',
                'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                'linear-gradient(135deg, #55efc4 0%, #00b894 100%)'
            ],
            'action': [
                'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                'linear-gradient(135deg, #ff7675 0%, #d63031 100%)'
            ],
            'bonus': [
                'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)',
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
            ],
            'cta': [
                'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
                'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
                'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
            ],
            'default': [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
            ]
        };

        const proModeSlides = content.slides.map((slide, index) => {
            // Выбираем градиент для типа слайда
            const gradientOptions = advancedGradients[slide.type] || advancedGradients.default;
            const selectedGradient = gradientOptions[Math.floor(Math.random() * gradientOptions.length)];
            
            // Определяем размеры и позиции на основе типа слайда
            const slideLayout = this.getAdvancedSlideLayout(slide.type, slide.text);
            
            return {
                id: index + 1,
                background: {
                    type: 'gradient',
                    color: selectedGradient,
                    image: null,
                    x: 50,
                    y: 50,
                    brightness: 100
                },
                textBlocks: [
                    // Заголовок слайда
                    {
                        id: `advanced_slide_${index + 1}_title`,
                        text: slide.title || `Слайд ${index + 1}`,
                        x: slideLayout.title.x,
                        y: slideLayout.title.y,
                        width: slideLayout.title.width,
                        height: slideLayout.title.height,
                        font: 'Inter',
                        size: slideLayout.title.fontSize,
                        weight: 'bold',
                        style: 'normal',
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        letterSpacing: 0,
                        wordSpacing: 0,
                        rotation: 0,
                        opacity: 1,
                        zIndex: 3,
                        effects: {
                            shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', blur: 8, x: 0, y: 3 },
                            outline: { enabled: false, color: '#000000', width: 1 },
                            glow: { enabled: true, color: '#ffffff', intensity: 0.3 },
                            gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                        }
                    },
                    // Основной контент слайда
                    {
                        id: `advanced_slide_${index + 1}_content`,
                        text: slide.text,
                        x: slideLayout.content.x,
                        y: slideLayout.content.y,
                        width: slideLayout.content.width,
                        height: slideLayout.content.height,
                        font: 'Inter',
                        size: slideLayout.content.fontSize,
                        weight: slideLayout.content.fontWeight,
                        style: 'normal',
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        textAlign: slideLayout.content.textAlign,
                        lineHeight: 1.4,
                        letterSpacing: 0,
                        wordSpacing: 0,
                        rotation: 0,
                        opacity: 0.95,
                        zIndex: 2,
                        effects: {
                            shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 6, x: 0, y: 2 },
                            outline: { enabled: false, color: '#000000', width: 1 },
                            glow: { enabled: false, color: '#ffffff', intensity: 0.2 },
                            gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                        }
                    }
                ],
                autoKeywords: this.extractAdvancedKeywords(slide.text, slide.keywordType),
                keywordType: slide.keywordType || 'conceptual',
                slideType: slide.type,
                slideNumber: slide.slideNumber,
                emotionalTone: slide.emotionalTone,
                visualStyle: slide.visualStyle,
                metadata: {
                    generatedBy: 'AI-Advanced-Pipeline',
                    mode: 'advanced_carousel_generation',
                    slideType: slide.type,
                    keywordType: slide.keywordType,
                    emotionalTone: slide.emotionalTone,
                    hasManualText: false,
                    supportsCyrillic: true,
                    contentElements: slide.contentElements,
                    targetLength: '2-4 lines',
                    advancedFeatures: true
                }
            };
        });

        console.log(`✅ ADVANCED AI: Создано ${proModeSlides.length} PRO MODE слайдов`);
        return proModeSlides;
    }

    // Получение продвинутой раскладки слайда
    getAdvancedSlideLayout(slideType, text) {
        // Анализируем длину текста для адаптивной раскладки
        const textLength = text.length;
        const lineCount = text.split('\n').length;
        
        const layouts = {
            'hook': {
                title: { x: 50, y: 15, width: 90, height: 12, fontSize: 24 },
                content: { x: 50, y: 55, width: 85, height: 60, fontSize: 18, fontWeight: 'normal', textAlign: 'center' }
            },
            'context': {
                title: { x: 50, y: 18, width: 85, height: 10, fontSize: 20 },
                content: { x: 50, y: 55, width: 88, height: 55, fontSize: 17, fontWeight: 'normal', textAlign: 'center' }
            },
            'problem': {
                title: { x: 50, y: 15, width: 80, height: 12, fontSize: 22 },
                content: { x: 50, y: 55, width: 85, height: 60, fontSize: 17, fontWeight: 'normal', textAlign: 'center' }
            },
            'agitation': {
                title: { x: 50, y: 12, width: 85, height: 15, fontSize: 23 },
                content: { x: 50, y: 55, width: 88, height: 65, fontSize: 17, fontWeight: 'medium', textAlign: 'center' }
            },
            'solution': {
                title: { x: 50, y: 18, width: 80, height: 12, fontSize: 21 },
                content: { x: 50, y: 55, width: 85, height: 55, fontSize: 17, fontWeight: 'normal', textAlign: 'center' }
            },
            'benefits': {
                title: { x: 50, y: 15, width: 85, height: 12, fontSize: 22 },
                content: { x: 50, y: 55, width: 88, height: 60, fontSize: 16, fontWeight: 'normal', textAlign: 'left' }
            },
            'proof': {
                title: { x: 50, y: 18, width: 80, height: 10, fontSize: 20 },
                content: { x: 50, y: 55, width: 85, height: 55, fontSize: 16, fontWeight: 'normal', textAlign: 'center' }
            },
            'objections': {
                title: { x: 50, y: 20, width: 75, height: 10, fontSize: 20 },
                content: { x: 50, y: 55, width: 85, height: 50, fontSize: 17, fontWeight: 'normal', textAlign: 'center' }
            },
            'action': {
                title: { x: 50, y: 15, width: 80, height: 12, fontSize: 22 },
                content: { x: 50, y: 55, width: 85, height: 60, fontSize: 16, fontWeight: 'normal', textAlign: 'left' }
            },
            'bonus': {
                title: { x: 50, y: 18, width: 70, height: 12, fontSize: 21 },
                content: { x: 50, y: 55, width: 85, height: 55, fontSize: 17, fontWeight: 'normal', textAlign: 'center' }
            },
            'cta': {
                title: { x: 50, y: 12, width: 85, height: 15, fontSize: 24 },
                content: { x: 50, y: 55, width: 88, height: 65, fontSize: 17, fontWeight: 'medium', textAlign: 'center' }
            }
        };
        
        const layout = layouts[slideType] || layouts.hook;
        
        // Адаптируем размер шрифта в зависимости от длины текста
        if (textLength > 200) {
            layout.content.fontSize = Math.max(layout.content.fontSize - 2, 14);
        } else if (textLength < 100) {
            layout.content.fontSize = Math.min(layout.content.fontSize + 1, 20);
        }
        
        return layout;
    }

    // Продвинутое извлечение ключевых слов
    extractAdvancedKeywords(text, keywordType) {
        console.log('🔍 ADVANCED AI: Извлечение ключевых слов типа:', keywordType);
        
        // Удаляем эмодзи и специальные символы
        const cleanText = text.replace(/[📊📈⭐💰🎁✅❌👍💬📤🔔]/g, ' ')
                              .replace(/[^\w\sа-яё]/gi, ' ')
                              .toLowerCase();
        
        const words = cleanText.split(/\s+/).filter(word => word.length > 2);
        
        // Расширенные стоп-слова
        const stopWords = [
            'это', 'для', 'что', 'как', 'все', 'еще', 'уже', 'или', 'при', 'его', 'она', 'они', 
            'вас', 'нас', 'вам', 'нам', 'том', 'тем', 'где', 'кто', 'чем', 'без', 'под', 'над', 
            'про', 'при', 'вот', 'так', 'тут', 'там', 'эти', 'эта', 'этот', 'того', 'тому', 
            'той', 'тех', 'чтобы', 'если', 'когда', 'пока', 'хотя', 'будет', 'была', 'были', 
            'есть', 'нет', 'да', 'не', 'ни', 'же', 'ли', 'бы', 'только', 'даже', 'более', 
            'самый', 'очень', 'можно', 'нужно', 'должен', 'может', 'могут', 'будут'
        ];
        
        // Фильтруем стоп-слова
        const filteredWords = words.filter(word => 
            !stopWords.includes(word) && 
            word.length > 3 && 
            !/^\d+$/.test(word)
        );
        
        // Определяем приоритетные слова в зависимости от типа
        let priorityWords = [];
        if (keywordType === 'emotional') {
            // Эмоциональные ключевые слова
            const emotionalPatterns = [
                'результат', 'успех', 'прибыль', 'рост', 'увеличение', 'экономия', 'выгода',
                'быстро', 'эффективно', 'просто', 'легко', 'гарантия', 'проверен', 'работает',
                'секрет', 'правда', 'факт', 'доказательство', 'реальный', 'честный',
                'бесплатно', 'скидка', 'бонус', 'подарок', 'эксклюзив', 'ограничен',
                'сейчас', 'сегодня', 'немедленно', 'срочно', 'последний', 'шанс'
            ];
            priorityWords = filteredWords.filter(word => 
                emotionalPatterns.some(pattern => word.includes(pattern) || pattern.includes(word))
            );
        } else {
            // Концептуальные ключевые слова
            const conceptualPatterns = [
                'система', 'метод', 'подход', 'стратегия', 'технология', 'решение',
                'процесс', 'алгоритм', 'принцип', 'правило', 'закон', 'теория',
                'анализ', 'исследование', 'данные', 'статистика', 'показатель',
                'планирование', 'управление', 'контроль', 'оптимизация', 'развитие'
            ];
            priorityWords = filteredWords.filter(word => 
                conceptualPatterns.some(pattern => word.includes(pattern) || pattern.includes(word))
            );
        }
        
        // Объединяем приоритетные и обычные слова
        const uniqueWords = [...new Set([...priorityWords, ...filteredWords])];
        
        // Возвращаем до 6 ключевых слов
        const keywords = uniqueWords.slice(0, 6);
        
        console.log(`✅ ADVANCED AI: Извлечено ${keywords.length} ключевых слов:`, keywords);
        return keywords;
    }
    // Простое извлечение ключевых слов
    extractSimpleKeywords(text) {
        console.log('🔍 Простое извлечение ключевых слов из текста');
        
        // Удаляем знаки препинания и разбиваем на слова
        const words = text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Убираем стоп-слова
        const stopWords = ['это', 'для', 'что', 'как', 'все', 'еще', 'уже', 'или', 'при', 'его', 'она', 'они', 'вас', 'нас', 'вам', 'нам', 'том', 'тем', 'где', 'кто', 'чем', 'без', 'под', 'над', 'про', 'при'];
        const filteredWords = words.filter(word => !stopWords.includes(word));
        
        // Берем уникальные слова
        const uniqueWords = [...new Set(filteredWords)];
        
        // Возвращаем первые 5 слов
        const keywords = uniqueWords.slice(0, 5);
        
        console.log('✅ Извлечены ключевые слова:', keywords);
        return keywords;
    }

    // Генерация структурированного контента (заглушка)
    async generateStructuredContent(topic) {
        console.log('🎨 Генерация структурированного контента для темы:', topic);
        
        // Простая структура контента
        const content = {
            topic: topic,
            slides: [
                {
                    title: topic,
                    text: `Все о ${topic}\n\nПолное руководство\nПрактические советы`
                },
                {
                    title: 'Основы',
                    text: `Основные принципы ${topic.toLowerCase()}\n\nЧто нужно знать\nС чего начать`
                },
                {
                    title: 'Применение',
                    text: `Как применять ${topic.toLowerCase()}\n\nПрактические шаги\nРеальные примеры`
                },
                {
                    title: 'Результаты',
                    text: `Результаты от ${topic.toLowerCase()}\n\nЧего ожидать\nКак измерить успех`
                },
                {
                    title: 'Заключение',
                    text: `Выводы о ${topic.toLowerCase()}\n\nГлавные моменты\nСледующие шаги`
                }
            ]
        };
        
        console.log('✅ Структурированный контент создан');
        return content;
    }

    // Конвертация в слайды проекта (заглушка)
    async convertToProjectSlides(content, topic) {
        console.log('🔄 Конвертация в слайды проекта...');
        
        const colors = ['#833ab4', '#fd1d1d', '#fcb045', '#f77737', '#e1306c'];
        
        const projectSlides = content.slides.map((slide, index) => ({
            id: index + 1,
            background: {
                type: 'color',
                color: colors[index % colors.length]
            },
            textBlocks: [{
                id: `slide_${index + 1}_text`,
                text: slide.text,
                x: 50,
                y: 50,
                width: 80,
                height: 'auto',
                font: 'Inter',
                size: 18,
                weight: 600,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.4,
                effects: {
                    shadow: { enabled: true, blur: 4, color: 'rgba(0,0,0,0.3)' }
                }
            }],
            autoKeywords: this.extractSimpleKeywords(slide.text),
            generatedBy: 'AI-Clean'
        }));
        
        console.log(`✅ Создано ${projectSlides.length} слайдов проекта`);
        return projectSlides;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIManager;
} else {
    window.AIManager = AIManager;
}
                        }
                    }
                }
            };
            
            proModeSlides.push(slideData);
        }
        
        console.log(`✅ PRO MODE слайды конвертированы: ${proModeSlides.length} слайдов`);
        return proModeSlides;
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

    // Генерация структурированного контента (заглушка)
    async generateStructuredContent(topic) {
        console.log('🤖 Генерация структурированного контента для:', topic);
        
        // Заглушка для AI генерации
        return {
            slides: [
                {
                    title: `${topic} - Введение`,
                    content: `Добро пожаловать в мир ${topic}!\n\nЭто ваш путь к успеху`,
                    keywords: ['успех', 'путь']
                },
                {
                    title: `Почему ${topic}?`,
                    content: `${topic} изменит вашу жизнь\n\nВот почему это важно`,
                    keywords: ['важно', 'жизнь']
                },
                {
                    title: `Как начать с ${topic}`,
                    content: `Простые шаги для старта\n\n1. Изучите основы\n2. Практикуйтесь\n3. Достигайте целей`,
                    keywords: ['старт', 'цели']
                }
            ]
        };
    }

    // Конвертация в слайды проекта (заглушка)
    async convertToProjectSlides(aiContent, topic) {
        console.log('🔄 Конвертация AI контента в слайды проекта');
        
        const projectSlides = [];
        
        aiContent.slides.forEach((slide, index) => {
            const slideData = {
                id: `slide-${Date.now()}-${index}`,
                background: {
                    type: 'gradient',
                    gradient: {
                        type: 'linear',
                        direction: '135deg',
                        colors: ['#667eea', '#764ba2']
                    }
                },
                textBlocks: [
                    {
                        id: `text-${Date.now()}-${index}`,
                        content: slide.content,
                        position: { x: 50, y: 50 },
                        size: { width: 80, height: 40 },
                        style: {
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            textAlign: 'center',
                            fontFamily: 'Inter'
                        }
                    }
                ],
                autoKeywords: slide.keywords || [],
                generatedBy: 'AI-Structured'
            };
            
            projectSlides.push(slideData);
        });
        
        return projectSlides;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIManager;
}