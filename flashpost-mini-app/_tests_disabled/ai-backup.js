// ===== AI MODULE =====
// Handles Gemini integration and keyword extraction

class AIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.apiKey = null; // Будет установлен при настройке
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        console.log('✅ AIManager инициализирован');
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

    // ===== ГЕНЕРАЦИЯ КАРУСЕЛИ ЧЕРЕЗ AI =====

    // Основной метод генерации карусели через AI
    async generateCarousel(topic) {
        console.log('🤖 AI генерация карусели для темы:', topic);
        
        try {
            // Генерируем структурированный контент через AI
            const aiContent = await this.generateStructuredContent(topic);
            
            // Конвертируем в слайды проекта (теперь async)
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
                generatedBy: 'AI',
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('❌ Ошибка AI генерации карусели:', error);
            throw error;
        }
    }

    // ===== ВЫСОКОКАЧЕСТВЕННАЯ ГЕНЕРАЦИЯ AI КАРУСЕЛИ =====
    
    // Главный метод генерации высококачественной карусели
    async generateHighQualityCarousel(topic) {
        console.log('🎯 Генерация высококачественной карусели для темы:', topic);
        
        try {
            // ЭТАП 10: Используем новую PRO MODE систему
            return await this.generateProModeCarousel(topic);
            
        } catch (error) {
            console.error('❌ Ошибка PRO MODE генерации, переход на storytelling систему:', error);
            
            try {
                // Fallback на storytelling генерацию
                return await this.generateStorytellingCarousel(topic);
            } catch (storytellingError) {
                console.error('❌ Ошибка storytelling генерации, переход на legacy систему:', error);
                
                try {
                    // Финальный fallback на legacy высококачественную генерацию
                    return await this.generateHighQualityCarouselLegacy(topic);
                } catch (legacyError) {
                    console.error('❌ Ошибка legacy генерации:', legacyError);
                    // Последний fallback на стандартную генерацию
                    return await this.generateCarousel(topic);
                }
            }
        }
    }

    // ===== ЭТАП 10: AI CAROUSEL GENERATION (PRO MODE) =====
    
    // Главный метод PRO MODE генерации карусели
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

    // ЭТАП A: Генерация outline (план слайдов)
    async generateCarouselOutline(topic) {
        console.log('📋 ЭТАП A: Генерация outline для темы:', topic);
        
        const outlinePrompt = `Создай ПЛАН Instagram-карусели на тему "${topic}" с четкой структурой и логическими связями.

ЗАДАЧА: Создать outline для КАРУСЕЛИ (не набора фраз), которая ведет читателя от проблемы к решению с растущим интересом.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА (10-11 слайдов):
1. HOOK (слайд 1) - Мощный крючок, который заставляет читать дальше
2. PAIN (слайды 2-3) - Глубокое описание боли и проблем аудитории  
3. VALUE (слайды 4-7) - Ценность и решения, раскрытие темы по частям
4. INSIGHTS (слайды 8-9) - Глубокие инсайты и неожиданные повороты
5. CONCLUSION + CTA (слайды 10-11) - Выводы и призыв к действию

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К OUTLINE:
- Каждый слайд должен иметь ЧЕТКУЮ ЦЕЛЬ в общей истории
- ЛОГИЧЕСКИЕ СВЯЗИ между слайдами (как один ведет к другому)
- ПРОГРЕССИВНОЕ РАСКРЫТИЕ темы (от простого к сложному)
- РАСТУЩИЙ ИНТЕРЕС (каждый слайд интереснее предыдущего)
- НЕТ ПОВТОРОВ в содержании слайдов

ФОРМАТ OUTLINE:
Для каждого слайда укажи:
- Номер и тип слайда
- Основную идею (что именно раскрываем)
- Цель слайда (зачем он нужен в общей истории)
- Связь с предыдущим слайдом (как логически переходим)

Верни JSON:
{
  "topic": "${topic}",
  "totalSlides": 11,
  "structure": "hook → pain → value → insights → conclusion",
  "outline": [
    {
      "slideNumber": 1,
      "type": "hook",
      "mainIdea": "Конкретная идея для привлечения внимания",
      "purpose": "Зачем этот слайд нужен в карусели",
      "connectionToPrevious": "Начальный слайд"
    },
    {
      "slideNumber": 2,
      "type": "pain",
      "mainIdea": "Конкретная боль или проблема",
      "purpose": "Создать эмоциональную связь с читателем",
      "connectionToPrevious": "Как логически связан с hook"
    }
  ]
}`;

        try {
            const response = await this.callAIAPI(outlinePrompt, {
                provider: this.getAIProvider(),
                maxRetries: 3,
                timeout: 20000
            });
            
            const outline = this.parseOutlineResponse(response);
            
            // Валидация outline
            if (!this.validateOutlineQuality(outline)) {
                console.warn('⚠️ Outline не прошел валидацию, повторная генерация...');
                throw new Error('Outline quality validation failed');
            }
            
            console.log('✅ Outline создан:', outline.outline.length, 'слайдов');
            return outline;
            
        } catch (error) {
            console.error('❌ Ошибка генерации outline:', error);
            // Fallback на базовый outline
            return this.generateFallbackOutline(topic);
        }
    }

    // ЭТАП B: Генерация контента на основе outline
    async generateCarouselContent(topic, outline) {
        console.log('✍️ ЭТАП B: Генерация контента на основе outline...');
        
        const contentPrompt = `Создай КОНТЕНТ для Instagram-карусели на основе готового плана.

ТЕМА: "${topic}"
ПЛАН КАРУСЕЛИ: ${JSON.stringify(outline.outline, null, 2)}

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К КОНТЕНТУ:
- 2-4 строки текста на каждый слайд (ОБЯЗАТЕЛЬНО!)
- НЕТ ПОВТОРОВ между слайдами
- ЛОГИЧЕСКИЕ СВЯЗИ (каждый слайд продолжает предыдущий)
- РАСТУЩИЙ ИНТЕРЕС (от слайда к слайду становится интереснее)
- КОНКРЕТНЫЕ примеры, цифры, факты
- ЭМОЦИОНАЛЬНЫЕ крючки в каждом слайде
- Поддержка КИРИЛЛИЦЫ
- Переносы строк для структуры

СТРУКТУРА КОНТЕНТА:
- Слайд 1 (HOOK): Провокационный факт + обещание ценности
- Слайды 2-3 (PAIN): Описание боли + эмоциональные триггеры
- Слайды 4-7 (VALUE): Ценные решения + практические советы
- Слайды 8-9 (INSIGHTS): Глубокие инсайты + неожиданные повороты
- Слайды 10-11 (CONCLUSION): Выводы + конкретный призыв к действию

ЗАПРЕЩЕНО:
- Односложные ответы
- Повторяющиеся фразы между слайдами
- Общие мотивационные клише
- Поверхностные советы

Верни JSON с контентом для каждого слайда:
{
  "topic": "${topic}",
  "slides": [
    {
      "slideNumber": 1,
      "type": "hook",
      "title": "Краткий заголовок",
      "text": "2-4 строки с провокационным фактом и обещанием\\nВторая строка с конкретикой\\nТретья строка с интригой",
      "keywordType": "emotional"
    }
  ]
}`;

        try {
            const response = await this.callAIAPI(contentPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 3,
                timeout: 25000
            });
            
            const content = this.parseContentResponse(response);
            
            // Валидация контента
            if (!this.validateContentQuality(content)) {
                console.warn('⚠️ Контент не прошел валидацию, повторная генерация...');
                throw new Error('Content quality validation failed');
            }
            
            console.log('✅ Контент создан:', content.slides.length, 'слайдов');
            return content;
            
        } catch (error) {
            console.error('❌ Ошибка генерации контента:', error);
            // Fallback на базовый контент
            return this.generateFallbackContent(topic, outline);
        }
    }

    // Конвертация PRO MODE контента в слайды проекта
    async convertToProModeSlides(content) {
        console.log('🔄 Конвертация PRO MODE контента в слайды...');
        
        const proModeColors = {
            'hook': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',      // Красный - внимание
            'pain': 'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)',      // Фиолетовый - боль
            'value': 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',     // Синий - ценность
            'insights': 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',  // Бирюзовый - инсайты
            'conclusion': 'linear-gradient(135deg, #fd79a8 0%, #ff7675 100%)', // Розово-красный - действие
            'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'    // Дефолтный
        };

        const proModeSlides = await Promise.all(
            content.slides.map(async (slide, index) => {
                try {
                    // Извлекаем ключевые слова для слайда
                    const keywordsData = await this.extractIntelligentSlideKeywords(
                        slide.text, 
                        slide.type, 
                        slide.keywordType
                    );

                    // Определяем цвет слайда по типу
                    const slideColor = proModeColors[slide.type] || proModeColors.default;

                    return {
                        id: index + 1,
                        background: {
                            type: 'gradient',
                            color: slideColor,
                            image: null,
                            x: 50,
                            y: 50,
                            brightness: 100
                        },
                        textBlocks: [
                            {
                                id: `pro_slide_${index + 1}_title`,
                                text: slide.title || `Слайд ${index + 1}`,
                                x: 50,
                                y: 20,
                                width: 85,
                                height: 15,
                                font: 'Inter',
                                size: 22,
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
                                zIndex: 2,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 6, x: 0, y: 2 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.5 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            },
                            {
                                id: `pro_slide_${index + 1}_content`,
                                text: slide.text,
                                x: 50,
                                y: 55,
                                width: 88,
                                height: 55,
                                font: 'Inter',
                                size: 17,
                                weight: 'normal',
                                style: 'normal',
                                color: '#ffffff',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                                lineHeight: 1.5,
                                letterSpacing: 0,
                                wordSpacing: 0,
                                rotation: 0,
                                opacity: 0.95,
                                zIndex: 1,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', blur: 4, x: 0, y: 1 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.3 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            }
                        ],
                        // PRO MODE: Интеллектуальные ключевые слова с типизацией
                        autoKeywords: keywordsData.keywords || [],
                        keywordType: keywordsData.keywordType || slide.keywordType || 'conceptual',
                        slideType: slide.type,
                        slideNumber: slide.slideNumber,
                        metadata: {
                            generatedBy: 'AI-ProMode',
                            mode: 'pro_carousel_generation',
                            slideType: slide.type,
                            keywordType: keywordsData.keywordType,
                            hasManualText: false,
                            supportsCyrillic: true
                        }
                    };

                } catch (error) {
                    console.warn(`⚠️ Ошибка обработки PRO слайда ${index + 1}:`, error);
                    
                    // Fallback слайд
                    return {
                        id: index + 1,
                        background: {
                            type: 'gradient',
                            color: proModeColors.default,
                            image: null,
                            x: 50,
                            y: 50,
                            brightness: 100
                        },
                        textBlocks: [
                            {
                                id: `pro_slide_${index + 1}_title`,
                                text: slide.title || `Слайд ${index + 1}`,
                                x: 50,
                                y: 20,
                                width: 85,
                                height: 15,
                                font: 'Inter',
                                size: 22,
                                weight: 'bold',
                                color: '#ffffff',
                                textAlign: 'center',
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 6, x: 0, y: 2 }
                                }
                            },
                            {
                                id: `pro_slide_${index + 1}_content`,
                                text: slide.text,
                                x: 50,
                                y: 55,
                                width: 88,
                                height: 55,
                                font: 'Inter',
                                size: 17,
                                weight: 'normal',
                                color: '#ffffff',
                                textAlign: 'center',
                                lineHeight: 1.5,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', blur: 4, x: 0, y: 1 }
                                }
                            }
                        ],
                        autoKeywords: [],
                        keywordType: slide.keywordType || 'conceptual',
                        slideType: slide.type,
                        slideNumber: slide.slideNumber,
                        metadata: {
                            generatedBy: 'AI-ProMode-Fallback',
                            mode: 'pro_carousel_generation',
                            slideType: slide.type,
                            error: error.message
                        }
                    };
                }
            })
        );

        console.log(`✅ Создано ${proModeSlides.length} PRO MODE слайдов`);
        return proModeSlides;
    }

    // ===== ЭТАП 7: AI STORYTELLING BEHAVIOR (LEGACY) =====
    
    // Новый метод генерации с глубоким storytelling
    async generateStorytellingCarousel(topic) {
        console.log('📖 AI Storytelling генерация для темы:', topic);
        
        try {
            // Этап 1: Анализ темы для storytelling
            const storyAnalysis = await this.analyzeTopicForStorytelling(topic);
            
            // Этап 2: Генерация сценария карусели
            const storyScenario = await this.generateStoryScenario(topic, storyAnalysis);
            
            // Этап 3: Создание слайдов с ключевыми словами
            const storytellingSlides = await this.convertToStorytellingSlides(storyScenario);
            
            // Этап 4: Сохранение в state
            this.state.clearProject();
            storytellingSlides.forEach(slideData => {
                this.state.createSlide(slideData);
            });
            
            // Устанавливаем первый слайд как активный
            if (storytellingSlides.length > 0) {
                this.state.setCurrentSlideIndex(0);
            }
            
            console.log(`✅ Storytelling карусель создана: ${storytellingSlides.length} слайдов`);
            
            return {
                slides: storytellingSlides,
                topic: topic,
                generatedBy: 'AI-Storytelling',
                timestamp: Date.now(),
                storyAnalysis: storyAnalysis,
                storyType: 'deep_storytelling'
            };
            
        } catch (error) {
            console.error('❌ Ошибка storytelling генерации:', error);
            throw error;
        }
    }

    // Старая версия высококачественной генерации (для fallback)
    async generateHighQualityCarouselLegacy(topic) {
        console.log('🔄 Legacy высококачественная генерация для темы:', topic);
        
        try {
            // Этап 1: Анализ темы и определение структуры
            const analysis = await this.analyzeTopicStructure(topic);
            
            // Этап 2: Генерация структурированного контента
            const structuredContent = await this.generateEngagingContent(topic, analysis);
            
            // Этап 3: Конвертация в слайды проекта
            const projectSlides = await this.convertToHighQualitySlides(structuredContent, topic);
            
            // Этап 4: Сохранение в state
            this.state.clearProject();
            projectSlides.forEach(slideData => {
                this.state.createSlide(slideData);
            });
            
            // Устанавливаем первый слайд как активный
            if (projectSlides.length > 0) {
                this.state.setCurrentSlideIndex(0);
            }
            
            console.log(`✅ Legacy карусель создана: ${projectSlides.length} слайдов`);
            
            return {
                slides: projectSlides,
                topic: topic,
                generatedBy: 'AI-HighQuality-Legacy',
                timestamp: Date.now(),
                analysis: analysis
            };
            
        } catch (error) {
            console.error('❌ Ошибка legacy генерации:', error);
            throw error;
        }
    }

    // Анализ темы и определение оптимальной структуры
    async analyzeTopicStructure(topic) {
        console.log('🔍 Анализ структуры темы:', topic);
        
        const analysisPrompt = `Проанализируй тему "${topic}" и определи оптимальную структуру для Instagram карусели.

ЗАДАЧА: Создать максимально вовлекающую карусель, которая:
- Полностью раскрывает тему
- Ведёт читателя по логической цепочке
- Вызывает желание сохранить пост

АНАЛИЗ ДОЛЖЕН ВКЛЮЧАТЬ:
1. ЦЕЛЕВАЯ АУДИТОРИЯ: Кто будет читать эту карусель?
2. ОСНОВНАЯ БОЛЬ: Какую проблему решаем?
3. КЛЮЧЕВАЯ ЦЕННОСТЬ: Что получит читатель?
4. ЭМОЦИОНАЛЬНЫЕ ТРИГГЕРЫ: Что заставит читать до конца?
5. СТРУКТУРА: Сколько слайдов нужно (9-11) и какая логика?

Верни в JSON:
{
  "audience": "описание целевой аудитории",
  "mainPain": "основная боль аудитории",
  "keyValue": "ключевая ценность для читателя",
  "emotionalTriggers": ["триггер1", "триггер2", "триггер3"],
  "recommendedSlides": 10,
  "structure": [
    {"type": "hook", "purpose": "зацепить внимание"},
    {"type": "problem", "purpose": "показать боль"},
    {"type": "insight", "purpose": "дать ага-момент"},
    {"type": "solution", "purpose": "предложить решение"},
    {"type": "steps", "purpose": "дать план действий"},
    {"type": "example", "purpose": "показать на примере"},
    {"type": "mistake", "purpose": "предупредить об ошибках"},
    {"type": "result", "purpose": "показать результат"},
    {"type": "conclusion", "purpose": "подвести итоги"},
    {"type": "cta", "purpose": "призвать к действию"}
  ]
}`;

        try {
            const response = await this.callAIAPI(analysisPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 15000
            });
            
            const analysis = this.parseAnalysisResponse(response);
            console.log('✅ Анализ темы завершен:', analysis);
            return analysis;
            
        } catch (error) {
            console.warn('⚠️ Ошибка анализа темы, используем базовую структуру');
            return this.getDefaultAnalysis(topic);
        }
    }

    // ===== ЭТАП 7: STORYTELLING МЕТОДЫ =====

    // Анализ темы для storytelling подхода
    async analyzeTopicForStorytelling(topic) {
        console.log('📖 Анализ темы для storytelling:', topic);
        
        const storyAnalysisPrompt = `Проанализируй тему "${topic}" для создания глубокого storytelling сценария Instagram карусели.

ЗАДАЧА: Создать драматургически выстроенный сценарий с эмоциональной дугой.

АНАЛИЗ ДЛЯ STORYTELLING:
1. ЦЕЛЕВАЯ АУДИТОРИЯ: Кто читает? Их боли, мечты, страхи?
2. ЦЕНТРАЛЬНАЯ ПРОБЛЕМА: Какую глубокую боль решаем?
3. КЛЮЧЕВОЙ ИНСАЙТ: Какой неожиданный поворот дадим?
4. ЭМОЦИОНАЛЬНАЯ ДУГА: Как проведем от проблемы к решению?
5. ПРАКТИЧЕСКАЯ ЦЕННОСТЬ: Что конкретно получит читатель?
6. СОЦИАЛЬНЫЕ ТРИГГЕРЫ: Что заставит поделиться?

Верни в JSON:
{
  "audience": {
    "description": "детальное описание аудитории",
    "pains": ["боль1", "боль2", "боль3"],
    "dreams": ["мечта1", "мечта2"],
    "fears": ["страх1", "страх2"]
  },
  "centralProblem": "глубокая проблема, которую решаем",
  "keyInsight": "неожиданный инсайт или поворот",
  "emotionalArc": {
    "start": "начальное эмоциональное состояние",
    "middle": "кульминация и осознание",
    "end": "финальное состояние и мотивация"
  },
  "practicalValue": "конкретная практическая польза",
  "socialTriggers": ["триггер1", "триггер2"],
  "recommendedSlides": 9,
  "storyStructure": "hook-pain-twist-value-conclusion"
}`;

        try {
            const response = await this.callAIAPI(storyAnalysisPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 15000
            });
            
            const storyAnalysis = this.parseStoryAnalysisResponse(response);
            console.log('✅ Storytelling анализ завершен:', storyAnalysis);
            return storyAnalysis;
            
        } catch (error) {
            console.warn('⚠️ Ошибка storytelling анализа, используем базовую структуру');
            return this.getDefaultStoryAnalysis(topic);
        }
    }

    // Генерация сценария карусели с storytelling структурой
    async generateStoryScenario(topic, storyAnalysis) {
        console.log('🎭 Генерация storytelling сценария...');
        
        const scenarioPrompt = this.buildStorytellingPrompt(topic, storyAnalysis);
        
        try {
            const response = await this.callAIAPI(scenarioPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 3,
                timeout: 20000
            });
            
            const storyScenario = this.parseStoryScenarioResponse(response);
            
            // Валидация качества сценария
            if (!this.validateStorytellingQuality(storyScenario.slides)) {
                console.warn('⚠️ Качество сценария не соответствует требованиям, повторная генерация...');
                throw new Error('Story quality validation failed');
            }
            
            console.log('✅ Storytelling сценарий создан:', storyScenario);
            return storyScenario;
            
        } catch (error) {
            console.error('❌ Ошибка генерации сценария:', error);
            // Fallback на legacy генерацию
            console.log('🔄 Переключение на legacy генерацию...');
            return await this.generateLegacyScenario(topic, storyAnalysis);
        }
    }

    // Построение промпта для storytelling генерации
    buildStorytellingPrompt(topic, storyAnalysis) {
        return `Создай глубокий СЦЕНАРИЙ Instagram-карусели на тему "${topic}" с драматургической структурой.

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА СЦЕНАРИЯ:
1. HOOK - Провокационный факт + шокирующая статистика + обещание результата
2. PAIN - Глубокое описание боли аудитории + эмоциональные триггеры + узнавание себя
3. WHY - Почему это критически важно + цена бездействия + мотивация к изменениям
4. TWIST - Неожиданный инсайт + разрушение мифов + ага-момент
5. VALUE_1 - Первая ключевая ценность + научное обоснование + практическая польза
6. VALUE_2 - Вторая ключевая ценность + конкретные примеры + измеримые результаты
7. VALUE_3 - Третья ключевая ценность + доказательства + кейсы из практики
8. EXAMPLE - Реальная история успеха + конкретные цифры + детали применения
9. MISTAKE - Частая критическая ошибка + последствия + как избежать
10. CONCLUSION - Главные выводы + резюме ценностей + усиление мотивации
11. CTA - Конкретный первый шаг + мотивация к действию + социальное взаимодействие

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К КАЖДОМУ СЛАЙДУ:
- 2-4 строки текста (обязательно!)
- Конкретные цифры и факты
- Эмоциональные крючки
- Переносы строк для структуры
- Логическая связь с общим сценарием

КОНТЕКСТ АУДИТОРИИ:
- Целевая аудитория: ${storyAnalysis.audience?.description || 'широкая аудитория'}
- Основная боль: ${storyAnalysis.centralProblem || 'общие проблемы'}
- Ключевой инсайт: ${storyAnalysis.keyInsight || 'неожиданное решение'}

ЗАПРЕЩЕНО:
- Односложные ответы
- Поверхностные советы
- Повторяющиеся фразы
- Общие мотивационные клише

Верни JSON с 8-11 слайдами:
{
  "topic": "${topic}",
  "storyType": "deep_storytelling",
  "totalSlides": 9,
  "slides": [
    {
      "type": "hook",
      "title": "Hook", 
      "text": "2-4 строки с провокацией, статистикой и обещанием",
      "keywordType": "emotional"
    },
    {
      "type": "pain",
      "title": "Pain",
      "text": "2-4 строки с описанием боли и эмоциональными триггерами",
      "keywordType": "emotional"
    },
    {
      "type": "why",
      "title": "Why",
      "text": "2-4 строки о важности и последствиях бездействия",
      "keywordType": "conceptual"
    },
    {
      "type": "twist",
      "title": "Twist",
      "text": "2-4 строки с неожиданным инсайтом и разрушением мифов",
      "keywordType": "conceptual"
    },
    {
      "type": "value_1",
      "title": "Value 1",
      "text": "2-4 строки с первой ключевой ценностью и обоснованием",
      "keywordType": "action"
    },
    {
      "type": "value_2", 
      "title": "Value 2",
      "text": "2-4 строки со второй ключевой ценностью и примерами",
      "keywordType": "action"
    },
    {
      "type": "value_3",
      "title": "Value 3", 
      "text": "2-4 строки с третьей ключевой ценностью и доказательствами",
      "keywordType": "technical"
    },
    {
      "type": "example",
      "title": "Example",
      "text": "2-4 строки с конкретным кейсом и результатами",
      "keywordType": "technical"
    },
    {
      "type": "conclusion",
      "title": "Conclusion",
      "text": "2-4 строки с резюме и главным выводом",
      "keywordType": "conceptual"
    }
  ]
}`;
    }

    // Конвертация сценария в слайды проекта с ключевыми словами
    async convertToStorytellingSlides(storyScenario) {
        console.log('🔄 Конвертация storytelling сценария в слайды...');
        
        const projectSlides = [];
        
        for (let i = 0; i < storyScenario.slides.length; i++) {
            const scenarioSlide = storyScenario.slides[i];
            
            // Извлекаем ключевые слова для каждого слайда
            const slideKeywords = await this.extractIntelligentSlideKeywords(
                scenarioSlide.text, 
                scenarioSlide.type
            );
            
            // Создаем слайд проекта
            const projectSlide = {
                id: i + 1,
                background: this.getStorytellingBackground(scenarioSlide.type, i),
                textBlocks: [
                    {
                        id: `text_${i + 1}_title`,
                        text: scenarioSlide.title || `Слайд ${i + 1}`,
                        x: 50,
                        y: 25,
                        width: 80,
                        height: 15,
                        font: 'Inter',
                        size: 24,
                        weight: 'bold',
                        color: '#ffffff',
                        textAlign: 'center',
                        effects: {
                            shadow: { enabled: true, blur: 4, color: 'rgba(0,0,0,0.3)' },
                            outline: { enabled: false },
                            glow: { enabled: false },
                            gradient: { enabled: false }
                        }
                    },
                    {
                        id: `text_${i + 1}_content`,
                        text: scenarioSlide.text,
                        x: 50,
                        y: 60,
                        width: 85,
                        height: 50,
                        font: 'Inter',
                        size: 16,
                        weight: 'normal',
                        color: '#ffffff',
                        textAlign: 'center',
                        lineHeight: 1.4,
                        effects: {
                            shadow: { enabled: true, blur: 2, color: 'rgba(0,0,0,0.2)' },
                            outline: { enabled: false },
                            glow: { enabled: false },
                            gradient: { enabled: false }
                        }
                    }
                ],
                // Добавляем ключевые слова в метаданные слайда
                metadata: {
                    storyType: scenarioSlide.type,
                    autoKeywords: slideKeywords.keywords || [],
                    keywordType: slideKeywords.keywordType || scenarioSlide.keywordType,
                    generatedBy: 'AI-Storytelling',
                    slideIndex: i + 1,
                    totalSlides: storyScenario.slides.length
                }
            };
            
            projectSlides.push(projectSlide);
        }
        
        console.log(`✅ Создано ${projectSlides.length} storytelling слайдов`);
        return projectSlides;
    }

    // Интеллектуальное извлечение ключевых слов с типизацией
    async extractIntelligentSlideKeywords(slideText, slideType) {
        console.log(`🔍 Извлечение ключевых слов для слайда типа: ${slideType}`);
        
        const keywordPrompt = `Извлеки 3-6 ключевых КОНЦЕПЦИЙ из текста для подсветки.

ТИП СЛАЙДА: ${slideType}
ТЕКСТ: "${slideText}"

ТРЕБОВАНИЯ:
- Только существительные и понятия
- Длина 4-20 символов
- Релевантные тексту
- Без стоп-слов (и, в, на, с, для, что, как, это, все, еще, уже)
- Уникальные концепции

Определи тип ключевых слов:
- conceptual: концепции, системы, методы, принципы
- emotional: эмоции, чувства, состояния, переживания
- action: действия, процессы (как существительные: планирование, анализ)
- technical: инструменты, метрики, показатели, технологии

Верни JSON:
{
  "keywords": ["концепция1", "понятие2", "термин3"],
  "keywordType": "conceptual"
}`;

        try {
            const response = await this.callAIAPI(keywordPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 10000
            });
            
            const keywordsData = this.parseKeywordsWithType(response);
            
            // Валидация ключевых слов
            if (!this.validateKeywords(keywordsData.keywords)) {
                console.warn('⚠️ Ключевые слова не прошли валидацию, используем fallback');
                return this.getFallbackKeywords(slideText, slideType);
            }
            
            console.log(`✅ Извлечены ключевые слова:`, keywordsData);
            return keywordsData;
            
        } catch (error) {
            console.warn('⚠️ Ошибка извлечения ключевых слов:', error);
            return this.getFallbackKeywords(slideText, slideType);
        }
    }

    // Валидация качества storytelling сценария
    validateStorytellingQuality(slides) {
        console.log('🔍 Валидация качества storytelling сценария...');
        
        const qualityChecks = {
            // Проверка количества слайдов (8-11)
            slideCountCheck: slides.length >= 8 && slides.length <= 11,
            
            // Проверка длины каждого слайда (минимум 2 строки)
            lengthCheck: slides.every(slide => {
                const lines = slide.text.split('\n').filter(line => line.trim().length > 0);
                return lines.length >= 2;
            }),
            
            // Проверка наличия цифр и фактов
            factsCheck: slides.some(slide => /\d+/.test(slide.text)),
            
            // Проверка эмоциональных триггеров
            emotionCheck: slides.some(slide => this.hasEmotionalTriggers(slide.text)),
            
            // Проверка уникальности контента
            uniquenessCheck: this.checkContentUniqueness(slides),
            
            // Проверка структуры storytelling
            structureCheck: this.validateStorytellingStructure(slides)
        };
        
        const passedChecks = Object.values(qualityChecks).filter(check => check).length;
        const totalChecks = Object.keys(qualityChecks).length;
        
        console.log(`📊 Качество сценария: ${passedChecks}/${totalChecks} проверок пройдено`);
        console.log('Детали проверок:', qualityChecks);
        
        // Требуем минимум 80% успешных проверок
        return passedChecks >= Math.ceil(totalChecks * 0.8);
    }

    // Проверка эмоциональных триггеров в тексте
    hasEmotionalTriggers(text) {
        const emotionalWords = [
            'боль', 'страх', 'мечта', 'успех', 'провал', 'победа', 'поражение',
            'радость', 'грусть', 'волнение', 'тревога', 'надежда', 'отчаяние',
            'удивление', 'шок', 'восторг', 'разочарование', 'вдохновение',
            'мотивация', 'энергия', 'усталость', 'стресс', 'релакс', 'комфорт'
        ];
        
        const lowerText = text.toLowerCase();
        return emotionalWords.some(word => lowerText.includes(word));
    }

    // Проверка уникальности контента между слайдами
    checkContentUniqueness(slides) {
        const texts = slides.map(slide => slide.text.toLowerCase());
        
        for (let i = 0; i < texts.length; i++) {
            for (let j = i + 1; j < texts.length; j++) {
                // Проверяем схожесть текстов (простая проверка по словам)
                const words1 = texts[i].split(/\s+/);
                const words2 = texts[j].split(/\s+/);
                const commonWords = words1.filter(word => words2.includes(word));
                
                // Если более 50% слов совпадают, считаем тексты слишком похожими
                if (commonWords.length > Math.min(words1.length, words2.length) * 0.5) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // Валидация структуры storytelling
    validateStorytellingStructure(slides) {
        const requiredTypes = ['hook', 'pain', 'twist', 'value', 'conclusion'];
        const slideTypes = slides.map(slide => slide.type || '');
        
        // Проверяем наличие основных элементов структуры
        return requiredTypes.every(type => {
            return slideTypes.some(slideType => 
                slideType.includes(type) || slideType === type
            );
        });
    }
                timeout: 30000
            });
            
            const scenario = this.parseStoryScenarioResponse(response);
            
            // Валидация качества сценария
            if (!this.validateStorytellingQuality(scenario.slides)) {
                throw new Error('Сценарий не прошел валидацию качества');
            }
            
            console.log(`✅ Storytelling сценарий создан: ${scenario.slides.length} слайдов`);
            return scenario;
            
        } catch (error) {
            console.error('❌ Ошибка генерации сценария:', error);
            throw error;
        }
    }

    // Построение промпта для storytelling генерации
    buildStorytellingPrompt(topic, analysis) {
        return `Создай глубокий СЦЕНАРИЙ Instagram-карусели на тему "${topic}" с драматургической структурой.

АНАЛИЗ АУДИТОРИИ:
- Описание: ${analysis.audience.description}
- Боли: ${analysis.audience.pains.join(', ')}
- Мечты: ${analysis.audience.dreams.join(', ')}
- Страхи: ${analysis.audience.fears.join(', ')}

ЦЕНТРАЛЬНАЯ ПРОБЛЕМА: ${analysis.centralProblem}
КЛЮЧЕВОЙ ИНСАЙТ: ${analysis.keyInsight}
ПРАКТИЧЕСКАЯ ЦЕННОСТЬ: ${analysis.practicalValue}

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА СЦЕНАРИЯ (8-11 слайдов):
1. HOOK - Провокационный факт + шокирующая статистика + обещание результата
2. PAIN - Глубокое описание боли аудитории + эмоциональные триггеры + узнавание себя
3. WHY - Почему это критически важно + цена бездействия + мотивация к изменениям
4. TWIST - Неожиданный инсайт + разрушение мифов + ага-момент
5. VALUE_1 - Первая ключевая ценность + научное обоснование + практическая польза
6. VALUE_2 - Вторая ключевая ценность + конкретные примеры + измеримые результаты
7. VALUE_3 - Третья ключевая ценность + доказательства + кейсы из практики
8. EXAMPLE - Реальная история успеха + конкретные цифры + детали применения
9. MISTAKE - Частая критическая ошибка + последствия + как избежать
10. CONCLUSION - Главные выводы + резюме ценностей + усиление мотивации
11. CTA - Конкретный первый шаг + мотивация к действию + социальное взаимодействие

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К КАЖДОМУ СЛАЙДУ:
- 2-4 строки текста (обязательно!)
- Конкретные цифры и факты
- Эмоциональные крючки
- Переносы строк для структуры
- Логическая связь с общим сценарием

ЗАПРЕЩЕНО:
- Односложные ответы
- Поверхностные советы
- Повторяющиеся фразы
- Общие мотивационные клише

Верни JSON с 8-11 слайдами:
{
  "topic": "${topic}",
  "storyType": "deep_storytelling",
  "emotionalArc": "${analysis.emotionalArc.start} → ${analysis.emotionalArc.middle} → ${analysis.emotionalArc.end}",
  "slides": [
    {
      "type": "hook",
      "title": "Hook", 
      "text": "2-4 строки с провокацией, статистикой и обещанием",
      "keywordType": "emotional"
    },
    {
      "type": "pain",
      "title": "Pain",
      "text": "2-4 строки с описанием боли и эмоциональными триггерами",
      "keywordType": "emotional"
    },
    {
      "type": "why",
      "title": "Why",
      "text": "2-4 строки о важности и последствиях бездействия",
      "keywordType": "conceptual"
    },
    {
      "type": "twist",
      "title": "Twist",
      "text": "2-4 строки с неожиданным инсайтом и разрушением мифов",
      "keywordType": "conceptual"
    },
    {
      "type": "value_1",
      "title": "Value 1",
      "text": "2-4 строки с первой ключевой ценностью и обоснованием",
      "keywordType": "action"
    },
    {
      "type": "value_2",
      "title": "Value 2",
      "text": "2-4 строки со второй ключевой ценностью и примерами",
      "keywordType": "action"
    },
    {
      "type": "value_3",
      "title": "Value 3",
      "text": "2-4 строки с третьей ключевой ценностью и доказательствами",
      "keywordType": "technical"
    },
    {
      "type": "example",
      "title": "Example",
      "text": "2-4 строки с реальной историей успеха и цифрами",
      "keywordType": "technical"
    },
    {
      "type": "mistake",
      "title": "Mistake",
      "text": "2-4 строки о критической ошибке и как ее избежать",
      "keywordType": "conceptual"
    },
    {
      "type": "conclusion",
      "title": "Conclusion",
      "text": "2-4 строки с выводами и усилением мотивации",
      "keywordType": "emotional"
    },
    {
      "type": "cta",
      "title": "CTA",
      "text": "2-4 строки с конкретным призывом к действию",
      "keywordType": "action"
    }
  ]
}`;
    }

    // Генерация вовлекающего контента на основе анализа
    async generateEngagingContent(topic, analysis) {
        console.log('🎨 Генерация вовлекающего контента...');
        
        const contentPrompt = `На основе анализа создай максимально вовлекающую Instagram карусель на тему "${topic}".

АНАЛИЗ ТЕМЫ:
- Аудитория: ${analysis.audience}
- Основная боль: ${analysis.mainPain}
- Ключевая ценность: ${analysis.keyValue}
- Эмоциональные триггеры: ${analysis.emotionalTriggers.join(', ')}

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. КАЖДЫЙ СЛАЙД 3-5 ПРЕДЛОЖЕНИЙ (обязательно!)
2. НЕ ПОВТОРЯТЬСЯ - каждый слайд уникален
3. ЛОГИЧЕСКАЯ СВЯЗЬ между слайдами
4. ПРОГРЕССИВНОЕ РАСКРЫТИЕ темы
5. КОНКРЕТНЫЕ примеры и цифры
6. ЭМОЦИОНАЛЬНЫЕ крючки в каждом слайде

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА (${analysis.recommendedSlides} слайдов):

Слайд 1 (HOOK): Провокационный факт + статистика + обещание результата
- Начни с шокирующей статистики или факта
- Создай интригу и любопытство
- Пообещай конкретную пользу

Слайд 2 (PROBLEM): Детальное описание проблемы + боль аудитории
- Покажи глубину проблемы
- Используй эмоциональные триггеры
- Читатель должен узнать себя

Слайд 3 (WHY MATTERS): Почему это критически важно + последствия
- Объясни серьезность ситуации
- Покажи цену бездействия
- Усиль мотивацию к изменениям

Слайд 4 (KEY INSIGHT): Ключевое понимание + ага-момент
- Дай новый взгляд на проблему
- Разрушь распространенные мифы
- Создай момент озарения

Слайд 5-6 (EXPLANATION): Глубокое объяснение + механизмы
- Объясни КАК это работает
- Дай научное обоснование
- Покажи причинно-следственные связи

Слайд 7 (EXAMPLE): Конкретный пример + кейс из практики
- Реальная история успеха
- Конкретные цифры и результаты
- Детали применения

Слайд 8 (MISTAKE): Частая ошибка + как избежать
- Предупреди о подводных камнях
- Покажи неправильный подход
- Дай четкие рекомендации

Слайд 9 (CONCLUSION): Главные выводы + резюме
- Подведи итоги ключевых моментов
- Усиль основное сообщение
- Подготовь к действию

Слайд 10 (CTA): Призыв к действию + мотивация
- Конкретный первый шаг
- Мотивация к немедленному действию
- Социальное взаимодействие

СТИЛЬ НАПИСАНИЯ:
- Экспертный, но понятный язык
- Конкретные цифры в каждом слайде
- Личные истории и примеры
- Эмоциональные крючки
- Переносы строк для структуры

ЗАПРЕЩЕНО:
- Односложные ответы
- Повторяющиеся фразы
- Общие мотивационные клише
- Сокращение контента

Верни строго JSON с ${analysis.recommendedSlides} слайдами:
{
  "topic": "${topic}",
  "slides": [
    {"title": "Hook", "text": "3-5 предложений с фактами и обещанием"},
    {"title": "Problem", "text": "3-5 предложений с описанием боли"},
    {"title": "Why", "text": "3-5 предложений о важности"},
    {"title": "Insight", "text": "3-5 предложений с ага-моментом"},
    {"title": "How", "text": "3-5 предложений с объяснением"},
    {"title": "Details", "text": "3-5 предложений с деталями"},
    {"title": "Example", "text": "3-5 предложений с примером"},
    {"title": "Mistake", "text": "3-5 предложений об ошибках"},
    {"title": "Conclusion", "text": "3-5 предложений с выводами"},
    {"title": "CTA", "text": "3-5 предложений с призывом"}
  ]
}`;

        try {
            const response = await this.callAIAPI(contentPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 3,
                timeout: 20000
            });
            
            const content = this.parseAndValidateEngagingContent(response, topic);
            console.log('✅ Вовлекающий контент создан:', content.slides.length, 'слайдов');
            return content;
            
        } catch (error) {
            console.warn('⚠️ Ошибка генерации контента, используем fallback');
            return this.generateFallbackContent(topic, analysis);
        }
    }

    // Конвертация в высококачественные слайды проекта
    async convertToHighQualitySlides(content, topic) {
        console.log('🎯 Конвертация в высококачественные слайды...');
        
        const slideColors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Hook - фиолетовый
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Problem - розовый
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Why - голубой
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Insight - зеленый
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // How - оранжевый
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Details - светлый
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Example - персиковый
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Mistake - красный
            'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // Conclusion - синий
            'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', // CTA - градиент
            'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' // Дополнительный
        ];

        // Извлекаем ключевые слова для каждого слайда параллельно
        const slidesWithKeywords = await Promise.all(
            content.slides.map(async (slide, index) => {
                const slideId = `hq_slide_${Date.now()}_${index}`;
                const blockId = `hq_block_${Date.now()}_${index}`;
                
                // Извлекаем ключевые слова для этого слайда
                let slideKeywords = [];
                try {
                    slideKeywords = await this.extractSlideKeywords(slide.text);
                } catch (error) {
                    console.warn(`⚠️ Ошибка извлечения ключевых слов для слайда ${index + 1}:`, error.message);
                    slideKeywords = this.extractKeywordsFromText(slide.text).slice(0, 6);
                }
                
                console.log(`🔍 Слайд ${index + 1} "${slide.title}": ${slideKeywords.length} ключевых слов`);
                
                return {
                    id: slideId,
                    title: slide.title,
                    text: slide.text,
                    background: {
                        type: 'color',
                        color: slideColors[index % slideColors.length]
                    },
                    textBlocks: [{
                        id: blockId,
                        text: slide.text,
                        x: 50,
                        y: 50,
                        width: 85,
                        height: 'auto',
                        font: 'Inter',
                        size: 18,
                        weight: 600,
                        color: '#ffffff',
                        textAlign: 'center',
                        lineHeight: 1.4,
                        effects: {
                            shadow: {
                                enabled: true,
                                color: 'rgba(0, 0, 0, 0.4)',
                                offsetX: 0,
                                offsetY: 2,
                                blur: 6
                            }
                        },
                        keywordHighlighting: {
                            autoHighlight: true,
                            autoKeywordColor: '#fcb045',
                            keywordColor: '#ffffff',
                            glowEnabled: true,
                            glowIntensity: 0.4
                        }
                    }],
                    autoKeywords: slideKeywords,
                    generatedBy: 'AI-HighQuality',
                    slideType: this.getSlideType(index, content.slides.length),
                    qualityScore: this.calculateQualityScore(slide.text)
                };
            })
        );

        console.log(`✅ Создано ${slidesWithKeywords.length} высококачественных слайдов`);
        return slidesWithKeywords;
    }

    // ===== ЭТАП 7: КОНВЕРТАЦИЯ STORYTELLING СЛАЙДОВ =====

    // Конвертация storytelling сценария в слайды проекта
    async convertToStorytellingSlides(storyScenario) {
        console.log('📖 Конвертация storytelling сценария в слайды...');
        
        const storyColors = {
            'hook': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', // Красный - внимание
            'pain': 'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)', // Фиолетовый - боль
            'why': 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)', // Зеленый - важность
            'twist': 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)', // Розовый - инсайт
            'value_1': 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)', // Синий - ценность
            'value_2': 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', // Бирюзовый - ценность
            'value_3': 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)', // Оранжевый - ценность
            'example': 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', // Лавандовый - пример
            'mistake': 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)', // Розово-желтый - ошибка
            'conclusion': 'linear-gradient(135deg, #00b894 0%, #55a3ff 100%)', // Сине-зеленый - вывод
            'cta': 'linear-gradient(135deg, #fd79a8 0%, #ff7675 100%)' // Розово-красный - действие
        };

        // Извлекаем ключевые слова для каждого слайда с типизацией
        const storytellingSlides = await Promise.all(
            storyScenario.slides.map(async (slide, index) => {
                try {
                    // Извлекаем интеллектуальные ключевые слова с типом
                    const keywordsData = await this.extractIntelligentSlideKeywords(
                        slide.text, 
                        slide.type, 
                        slide.keywordType
                    );

                    // Определяем цвет слайда по типу
                    const slideColor = storyColors[slide.type] || 
                                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

                    return {
                        id: index + 1,
                        background: {
                            type: 'gradient',
                            color: slideColor,
                            image: null,
                            x: 50,
                            y: 50,
                            brightness: 100
                        },
                        textBlocks: [
                            {
                                id: `slide_${index + 1}_title`,
                                text: slide.title || `Слайд ${index + 1}`,
                                x: 50,
                                y: 25,
                                width: 80,
                                height: 15,
                                font: 'Inter',
                                size: 24,
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
                                zIndex: 2,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', blur: 4, x: 0, y: 2 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.5 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            },
                            {
                                id: `slide_${index + 1}_content`,
                                text: slide.text,
                                x: 50,
                                y: 60,
                                width: 85,
                                height: 50,
                                font: 'Inter',
                                size: 16,
                                weight: 'normal',
                                style: 'normal',
                                color: '#ffffff',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                                lineHeight: 1.4,
                                letterSpacing: 0,
                                wordSpacing: 0,
                                rotation: 0,
                                opacity: 0.95,
                                zIndex: 1,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', blur: 2, x: 0, y: 1 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.3 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            }
                        ],
                        // ЭТАП 7: Добавляем интеллектуальные ключевые слова с типизацией
                        autoKeywords: keywordsData.keywords || [],
                        keywordType: keywordsData.keywordType || slide.keywordType || 'conceptual',
                        slideType: slide.type,
                        storyPosition: index + 1,
                        metadata: {
                            generatedBy: 'AI-Storytelling',
                            storyType: storyScenario.storyType,
                            emotionalArc: storyScenario.emotionalArc,
                            slideType: slide.type,
                            keywordType: keywordsData.keywordType
                        }
                    };

                } catch (error) {
                    console.warn(`⚠️ Ошибка обработки слайда ${index + 1}:`, error);
                    
                    // Fallback слайд без ключевых слов
                    return {
                        id: index + 1,
                        background: {
                            type: 'gradient',
                            color: storyColors[slide.type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            image: null,
                            x: 50,
                            y: 50,
                            brightness: 100
                        },
                        textBlocks: [
                            {
                                id: `slide_${index + 1}_title`,
                                text: slide.title || `Слайд ${index + 1}`,
                                x: 50,
                                y: 25,
                                width: 80,
                                height: 15,
                                font: 'Inter',
                                size: 24,
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
                                zIndex: 2,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', blur: 4, x: 0, y: 2 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.5 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            },
                            {
                                id: `slide_${index + 1}_content`,
                                text: slide.text,
                                x: 50,
                                y: 60,
                                width: 85,
                                height: 50,
                                font: 'Inter',
                                size: 16,
                                weight: 'normal',
                                style: 'normal',
                                color: '#ffffff',
                                backgroundColor: 'transparent',
                                textAlign: 'center',
                                lineHeight: 1.4,
                                letterSpacing: 0,
                                wordSpacing: 0,
                                rotation: 0,
                                opacity: 0.95,
                                zIndex: 1,
                                effects: {
                                    shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', blur: 2, x: 0, y: 1 },
                                    outline: { enabled: false, color: '#000000', width: 1 },
                                    glow: { enabled: false, color: '#ffffff', intensity: 0.3 },
                                    gradient: { enabled: false, colors: ['#ffffff', '#000000'], direction: 'horizontal' }
                                }
                            }
                        ],
                        autoKeywords: [],
                        keywordType: slide.keywordType || 'conceptual',
                        slideType: slide.type,
                        storyPosition: index + 1,
                        metadata: {
                            generatedBy: 'AI-Storytelling-Fallback',
                            storyType: storyScenario.storyType,
                            slideType: slide.type,
                            error: error.message
                        }
                    };
                }
            })
        );

        console.log(`✅ Создано ${storytellingSlides.length} storytelling слайдов`);
        return storytellingSlides;
    }

    // Извлечение интеллектуальных ключевых слов с типизацией
    async extractIntelligentSlideKeywords(slideText, slideType, expectedKeywordType) {
        console.log(`🔍 Извлечение ключевых слов для слайда типа: ${slideType}`);
        
        const keywordPrompt = `Извлеки 3-6 ключевых КОНЦЕПЦИЙ из текста для подсветки.

ТИП СЛАЙДА: ${slideType}
ОЖИДАЕМЫЙ ТИП КЛЮЧЕВЫХ СЛОВ: ${expectedKeywordType}
ТЕКСТ: "${slideText}"

ТРЕБОВАНИЯ:
- Только существительные и понятия
- Длина 4-20 символов каждое слово
- Релевантные тексту (слова должны быть в тексте!)
- Без стоп-слов (и, в, на, с, для, что, как, это)
- 3-6 слов максимум

ТИПЫ КЛЮЧЕВЫХ СЛОВ:
- conceptual: концепции, системы, методы, принципы
- emotional: эмоции, чувства, состояния, переживания
- action: действия, процессы (как существительные: планирование, анализ)
- technical: инструменты, метрики, показатели, технологии

ПРИМЕРЫ ХОРОШИХ КЛЮЧЕВЫХ СЛОВ:
- conceptual: "система", "метод", "принцип", "подход"
- emotional: "страх", "успех", "мотивация", "уверенность"
- action: "планирование", "развитие", "обучение", "анализ"
- technical: "инструмент", "метрика", "показатель", "алгоритм"

Верни JSON:
{
  "keywords": ["концепция1", "понятие2", "термин3"],
  "keywordType": "conceptual"
}`;

        try {
            const response = await this.callAIAPI(keywordPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 10000
            });
            
            const keywordsData = this.parseKeywordsWithType(response);
            
            // Валидация ключевых слов
            if (!keywordsData.keywords || keywordsData.keywords.length === 0) {
                throw new Error('Не удалось извлечь ключевые слова');
            }
            
            // Фильтрация ключевых слов по длине и релевантности
            const filteredKeywords = keywordsData.keywords.filter(keyword => {
                return keyword.length >= 4 && 
                       keyword.length <= 20 && 
                       slideText.toLowerCase().includes(keyword.toLowerCase());
            });
            
            console.log(`✅ Извлечено ${filteredKeywords.length} ключевых слов типа ${keywordsData.keywordType}`);
            
            return {
                keywords: filteredKeywords.slice(0, 6), // Максимум 6 слов
                keywordType: keywordsData.keywordType || expectedKeywordType
            };
            
        } catch (error) {
            console.warn('⚠️ Ошибка извлечения ключевых слов, используем fallback');
            
            // Fallback: простое извлечение слов из текста
            const words = slideText.split(/\s+/)
                .filter(word => word.length >= 4 && word.length <= 20)
                .filter(word => !/^(это|что|как|для|при|без|над|под|про)$/i.test(word))
                .slice(0, 4);
            
            return {
                keywords: words,
                keywordType: expectedKeywordType || 'conceptual'
            };
        }
    }

    // Генерация структурированного контента (hook, problem, explanation, value, example, conclusion, CTA)
    async generateStructuredContent(topic) {
        console.log('🎯 Генерация структурированного контента для:', topic);
        
        const prompt = `Создай детальную обучающую карусель из 8-11 слайдов на тему "${topic}".

ОБЯЗАТЕЛЬНАЯ СТРУКТУРА:
1. HOOK - Цепляющий факт + статистика + обещание результата (3-5 предложений)
2. PROBLEM - Детальное описание проблемы + боль аудитории (3-5 предложений)  
3. EXPLANATION - Научное объяснение + причины проблемы (3-5 предложений)
4. VALUE - Ценность решения + выгоды для пользователя (3-5 предложений)
5. EXAMPLE - Конкретный пример + кейс из практики (3-5 предложений)
6. STEPS - Пошаговый план действий + инструкции (3-5 предложений)
7. MISTAKES - Частые ошибки + как их избежать (3-5 предложений)
8. RESULTS - Ожидаемые результаты + временные рамки (3-5 предложений)
9. CONCLUSION - Главные выводы + резюме (3-5 предложений)
10. CTA - Призыв к действию + мотивация (3-5 предложений)

ТРЕБОВАНИЯ К КАЖДОМУ СЛАЙДУ:
- Короткий заголовок (1-3 слова)
- Основной текст: 3-5 предложений
- Конкретные примеры и цифры
- Эмоциональные триггеры
- Переносы строк для структуры

Верни строго JSON:
{
  "topic": "${topic}",
  "slides": [
    { "title": "Hook", "text": "3-5 предложений с фактами и обещанием" },
    { "title": "Problem", "text": "3-5 предложений с описанием боли" },
    { "title": "Explanation", "text": "3-5 предложений с научным объяснением" },
    { "title": "Value", "text": "3-5 предложений с ценностью решения" },
    { "title": "Example", "text": "3-5 предложений с конкретным примером" },
    { "title": "Steps", "text": "3-5 предложений с пошаговым планом" },
    { "title": "Mistakes", "text": "3-5 предложений с частыми ошибками" },
    { "title": "Results", "text": "3-5 предложений с ожидаемыми результатами" },
    { "title": "Conclusion", "text": "3-5 предложений с главными выводами" },
    { "title": "CTA", "text": "3-5 предложений с призывом к действию" }
  ]
}`;

        try {
            const response = await this.callAIAPI(prompt, {
                provider: this.getAIProvider(),
                maxRetries: 3,
                timeout: 15000
            });
            
            const parsedContent = this.parseAndValidateStructuredContent(response, topic);
            
            // Валидируем количество слайдов (8-11)
            if (parsedContent.slides.length < 8 || parsedContent.slides.length > 11) {
                console.warn(`⚠️ Неправильное количество слайдов: ${parsedContent.slides.length}, ожидалось 8-11`);
                
                // Дополняем или обрезаем до нужного количества
                if (parsedContent.slides.length < 8) {
                    parsedContent.slides = this.expandSlidesToMinimum(parsedContent.slides, topic);
                } else if (parsedContent.slides.length > 11) {
                    parsedContent.slides = parsedContent.slides.slice(0, 11);
                }
            }
            
            console.log(`✅ Структурированный контент создан: ${parsedContent.slides.length} слайдов`);
            return parsedContent;
            
        } catch (error) {
            console.warn('⚠️ AI недоступен, используем локальную генерацию');
            return this.generateLocalStructuredContent(topic);
        }
    }

    // Конвертация AI контента в слайды проекта
    async convertToProjectSlides(aiContent, topic) {
        const slideColors = [
            'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
            'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        ];

        // Извлекаем ключевые слова для каждого слайда
        const slidesWithKeywords = await Promise.all(
            aiContent.slides.map(async (slide, index) => {
                const slideId = `ai_slide_${Date.now()}_${index}`;
                const blockId = `ai_block_${Date.now()}_${index}`;
                
                // Извлекаем 3-6 ключевых слов для этого слайда
                let slideKeywords = [];
                try {
                    slideKeywords = await this.extractSlideKeywords(slide.text);
                } catch (error) {
                    console.warn(`⚠️ Ошибка извлечения ключевых слов для слайда ${index + 1}:`, error.message);
                    // Fallback: используем простое извлечение
                    slideKeywords = this.extractKeywordsFromText(slide.text).slice(0, 6);
                }
                
                console.log(`🔍 Слайд ${index + 1} "${slide.title}": извлечено ${slideKeywords.length} ключевых слов:`, slideKeywords);
                
                return {
                    id: slideId,
                    title: slide.title,
                    text: slide.text,
                    background: {
                        type: 'color',
                        color: slideColors[index % slideColors.length]
                    },
                    textBlocks: [{
                        id: blockId,
                        text: slide.text,
                        x: 50,
                        y: 50,
                        width: 85,
                        height: 'auto',
                        font: 'Inter',
                        size: 18,
                        weight: 600,
                        color: '#ffffff',
                        textAlign: 'center',
                        lineHeight: 1.4,
                        effects: {
                            shadow: {
                                enabled: true,
                                color: 'rgba(0, 0, 0, 0.3)',
                                offsetX: 0,
                                offsetY: 2,
                                blur: 4
                            }
                        },
                        keywordHighlighting: {
                            autoHighlight: true,
                            autoKeywordColor: '#4A90E2',
                            keywordColor: '#E74C3C',
                            glowEnabled: true,
                            glowIntensity: 0.3
                        }
                    }],
                    autoKeywords: slideKeywords, // 3-6 ключевых слов для этого слайда
                    generatedBy: 'AI'
                };
            })
        );

        return slidesWithKeywords;
    }

    // Публичный метод для генерации AI слайдов (используется из UI)
    async generateAISlides(topic) {
        console.log('🚀 Запуск высококачественной AI генерации слайдов для темы:', topic);
        
        try {
            // Используем высококачественную генерацию
            const aiResult = await this.generateHighQualityCarousel(topic);
            
            console.log('🔍 AI результат:', aiResult);
            
            // Проверяем структуру результата
            if (!aiResult || !aiResult.slides || !Array.isArray(aiResult.slides)) {
                throw new Error('AI вернул некорректную структуру данных');
            }
            
            // Передаем результат в StateManager для создания слайдов
            const success = this.state.createSlidesFromAI(aiResult);
            
            if (success) {
                console.log('✅ Высококачественные AI слайды успешно созданы и переданы в StateManager');
                return {
                    success: true,
                    slidesCount: aiResult.slides.length,
                    topic: topic,
                    quality: 'high',
                    analysis: aiResult.analysis
                };
            } else {
                throw new Error('Не удалось создать слайды в StateManager');
            }
            
        } catch (error) {
            console.error('❌ Ошибка генерации высококачественных AI слайдов:', error);
            
            // Fallback на стандартную генерацию
            try {
                console.log('🔄 Переход на стандартную генерацию...');
                const fallbackResult = await this.generateCarousel(topic);
                
                const success = this.state.createSlidesFromAI(fallbackResult);
                
                if (success) {
                    console.log('✅ Стандартные AI слайды созданы как fallback');
                    return {
                        success: true,
                        slidesCount: fallbackResult.slides.length,
                        topic: topic,
                        quality: 'standard'
                    };
                }
            } catch (fallbackError) {
                console.error('❌ Ошибка fallback генерации:', fallbackError);
            }
            
            throw error;
        }
    }

    // Генерация слайдов через AI
    async generateSlidesWithAI(topic) {
        const prompt = `Создай обучающую карусель из 7-9 слайдов на тему "${topic}".
        
        Требования:
        1. Каждый слайд должен содержать заголовок и подзаголовок
        2. Контент должен быть экспертным и полезным
        3. Структура: введение → основные пункты → заключение
        4. Заголовки должны быть цепляющими
        5. Подзаголовки должны раскрывать суть
        
        Формат ответа (JSON):
        {
          "slides": [
            {
              "title": "Заголовок слайда",
              "subtitle": "Подзаголовок с деталями"
            }
          ]
        }
        
        Верни только JSON без дополнительного текста.`;

        try {
            const response = await this.callGeminiAPI(prompt);
            
            if (response && response.candidates && response.candidates[0]) {
                const content = response.candidates[0].content.parts[0].text;
                
                // Парсим JSON ответ
                const aiData = this.parseAIResponse(content);
                
                if (aiData && aiData.slides && aiData.slides.length > 0) {
                    // Преобразуем в формат приложения
                    return this.convertAISlidesToAppFormat(aiData.slides, topic);
                } else {
                    throw new Error('AI не вернул корректные слайды');
                }
            } else {
                throw new Error('Некорректный ответ от AI');
            }
            
        } catch (error) {
            console.error('❌ Ошибка генерации слайдов через AI:', error);
            throw error;
        }
    }

    // Преобразование AI слайдов в формат приложения
    convertAISlidesToAppFormat(aiSlides, topic) {
        const colors = [
            '#833ab4', '#fd1d1d', '#fcb045', '#f77737', '#e1306c',
            '#405de6', '#5851db', '#833ab4', '#c13584', '#e1306c'
        ];

        return aiSlides.map((slide, index) => ({
            id: `ai_slide_${Date.now()}_${index}`,
            title: slide.title,
            subtitle: slide.subtitle,
            background: {
                type: 'color',
                color: colors[index % colors.length]
            },
            textBlocks: [
                {
                    id: `ai_title_${Date.now()}_${index}`,
                    text: slide.title,
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
                    id: `ai_subtitle_${Date.now()}_${index}`,
                    text: slide.subtitle,
                    x: 10,
                    y: 65,
                    width: 80,
                    font: 'Inter',
                    size: 14,
                    weight: 500,
                    color: '#ffffff',
                    textAlign: 'center'
                }
            ],
            generatedBy: 'AI'
        }));
    }

    // Извлечение ключевых слов для всей карусели
    async extractCarouselKeywords(topic, slides) {
        try {
            // Собираем весь текст из слайдов
            const allText = slides.map(slide => `${slide.title} ${slide.subtitle}`).join(' ');
            
            // Извлекаем ключевые слова через AI
            const keywords = await this.extractKeywordsWithAI(allText);
            
            // Добавляем тему как основное ключевое слово
            const finalKeywords = [topic, ...keywords].slice(0, 10);
            
            return finalKeywords;
            
        } catch (error) {
            console.warn('⚠️ Используем локальное извлечение ключевых слов для карусели');
            
            // Fallback: локальное извлечение
            const allText = slides.map(slide => `${slide.title} ${slide.subtitle}`).join(' ');
            const localKeywords = this.extractKeywordsLocally(allText);
            
            return [topic, ...localKeywords].slice(0, 10);
        }
    }

    // Парсинг ответа от AI
    parseAIResponse(content) {
        try {
            // Убираем возможные markdown блоки
            const cleanContent = content
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            return JSON.parse(cleanContent);
            
        } catch (error) {
            console.error('❌ Ошибка парсинга AI ответа:', error);
            
            // Пытаемся извлечь JSON из текста
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('❌ Не удалось извлечь JSON из ответа');
                }
            }
            
            throw new Error('Не удалось распарсить ответ AI');
        }
    }

    // Вызов Gemini API
    async callGeminiAPI(prompt) {
        if (!this.apiKey) {
            // Для демо режима возвращаем заглушку
            console.log('ℹ️ API ключ не установлен, используем демо режим');
            throw new Error('API ключ не установлен');
        }

        const url = `${this.baseURL}?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`AI API ошибка: ${response.status}`);
        }

        return await response.json();
    }

    // ===== ИНТЕЛЛЕКТУАЛЬНАЯ СИСТЕМА ИЗВЛЕЧЕНИЯ КЛЮЧЕВЫХ СЛОВ =====

    // Извлечение 3-6 ключевых концепций для конкретного слайда
    async extractSlideKeywords(slideText) {
        console.log('🔍 Интеллектуальное извлечение ключевых концепций для слайда...');
        
        try {
            // Пробуем извлечь через AI с улучшенным промптом
            const aiKeywords = await this.extractIntelligentKeywords(slideText);
            
            if (aiKeywords && aiKeywords.length >= 3) {
                // Валидируем и фильтруем ключевые слова
                const validatedKeywords = this.validateKeywordQuality(aiKeywords, slideText);
                console.log(`✅ AI извлечение: ${validatedKeywords.length} ключевых концепций`);
                return validatedKeywords;
            }
            
        } catch (error) {
            console.warn('⚠️ AI извлечение не удалось, используем интеллектуальный локальный алгоритм');
        }
        
        // Fallback: интеллектуальное локальное извлечение
        const localKeywords = this.extractIntelligentKeywordsLocally(slideText);
        const validatedKeywords = this.validateKeywordQuality(localKeywords, slideText);
        
        // Обеспечиваем минимум 3 ключевых концепции
        if (validatedKeywords.length < 3) {
            const additionalKeywords = this.generateMeaningfulFallbacks(slideText);
            validatedKeywords.push(...additionalKeywords);
        }
        
        const finalKeywords = validatedKeywords.slice(0, 6); // Максимум 6
        console.log(`✅ Интеллектуальное извлечение: ${finalKeywords.length} ключевых концепций`);
        return finalKeywords;
    }

    // Извлечение интеллектуальных ключевых слов через AI
    async extractIntelligentKeywords(slideText) {
        const prompt = `Извлеки 3-6 самых важных КОНЦЕПЦИЙ из этого текста для подсветки в Instagram карусели.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
- ТОЛЬКО существительные и короткие фразы (2-3 слова максимум)
- ТОЛЬКО значимые концепции, термины, понятия
- НЕ глаголы, НЕ прилагательные, НЕ служебные слова
- НЕ повторяющиеся слова
- Длина слова: 4-20 символов
- Фокус на ключевых понятиях для понимания смысла

ИСКЛЮЧИТЬ:
- Стоп-слова: это, что, как, для, или, при, все, еще, уже, так, где, кто, чем
- Глаголы: делать, быть, иметь, знать, понимать, изучать, работать
- Прилагательные: хороший, плохой, большой, маленький, новый, старый
- Местоимения: я, ты, он, она, мы, вы, они, это, то, такой
- Предлоги и союзы: в, на, с, для, и, или, но, а, же

ПРИОРИТЕТ:
1. Ключевые термины и понятия
2. Важные концепции
3. Специфические названия
4. Значимые процессы (как существительные)

ТЕКСТ:
"${slideText.substring(0, 800)}"

Верни в JSON формате:
{ "keywords": ["концепция1", "термин2", "понятие3", "процесс4"] }

ТОЛЬКО JSON, никакого другого текста!`;

        try {
            const response = await this.callAIAPI(prompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 10000
            });
            
            const parsedKeywords = this.parseKeywordsResponse(response);
            
            // Дополнительная валидация AI результата
            const intelligentKeywords = this.filterIntelligentKeywords(parsedKeywords);
            
            return intelligentKeywords;
            
        } catch (error) {
            console.warn('⚠️ Ошибка AI извлечения интеллектуальных ключевых слов:', error.message);
            throw error;
        }
    }

    // Интеллектуальное локальное извлечение ключевых слов
    extractIntelligentKeywordsLocally(slideText) {
        console.log('🧠 Интеллектуальное локальное извлечение ключевых концепций...');
        
        // Очищаем и нормализуем текст
        const normalizedText = this.normalizeText(slideText);
        const words = this.tokenizeText(normalizedText);
        
        // Извлекаем кандидатов на ключевые слова
        const candidates = this.extractKeywordCandidates(words);
        
        // Оцениваем важность каждого кандидата
        const scoredCandidates = this.scoreKeywordCandidates(candidates, normalizedText);
        
        // Фильтруем по качеству и важности
        const qualityKeywords = this.selectHighQualityKeywords(scoredCandidates);
        
        // Извлекаем значимые фразы (биграммы и триграммы)
        const meaningfulPhrases = this.extractMeaningfulPhrases(words);
        
        // Объединяем слова и фразы
        const allKeywords = [...qualityKeywords, ...meaningfulPhrases];
        
        // Финальная сортировка по важности
        const finalKeywords = this.rankKeywordsByImportance(allKeywords, normalizedText);
        
        console.log(`✅ Локально извлечено ${finalKeywords.length} интеллектуальных ключевых концепций`);
        return finalKeywords.slice(0, 6);
    }

    // Нормализация текста для анализа
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Токенизация текста
    tokenizeText(text) {
        return text.split(' ')
            .filter(word => word.length >= 3)
            .map(word => word.trim());
    }

    // Извлечение кандидатов на ключевые слова
    extractKeywordCandidates(words) {
        // Расширенный список стоп-слов
        const stopWords = new Set([
            // Русские стоп-слова
            'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
            'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'была', 'было', 'были',
            'они', 'она', 'оно', 'мне', 'нас', 'вас', 'них', 'его', 'её', 'их',
            'тот', 'эта', 'эти', 'тех', 'той', 'тем', 'под', 'над', 'про', 'без',
            'через', 'после', 'перед', 'между', 'среди', 'около', 'вокруг',
            'сегодня', 'завтра', 'вчера', 'сейчас', 'потом', 'тогда', 'здесь',
            'там', 'туда', 'сюда', 'откуда', 'куда', 'почему', 'зачем', 'когда',
            // Глаголы
            'делать', 'сделать', 'быть', 'иметь', 'знать', 'понимать', 'изучать',
            'работать', 'учиться', 'получать', 'давать', 'брать', 'идти', 'ехать',
            'говорить', 'сказать', 'думать', 'хотеть', 'мочь', 'должен', 'нужно',
            // Прилагательные общие
            'хороший', 'плохой', 'большой', 'маленький', 'новый', 'старый',
            'первый', 'последний', 'главный', 'важный', 'нужный', 'правильный',
            // Английские стоп-слова
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
            'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy'
        ]);

        // Фильтруем кандидатов
        const candidates = words.filter(word => {
            // Проверяем длину
            if (word.length < 4 || word.length > 20) return false;
            
            // Проверяем на стоп-слова
            if (stopWords.has(word)) return false;
            
            // Проверяем на содержание только букв
            if (!/^[а-яёa-z]+$/i.test(word)) return false;
            
            // Исключаем слова, которые явно являются глаголами (по окончаниям)
            if (this.isLikelyVerb(word)) return false;
            
            return true;
        });

        return candidates;
    }

    // Проверка, является ли слово вероятно глаголом
    isLikelyVerb(word) {
        const verbEndings = [
            'ать', 'ить', 'еть', 'уть', 'ять', 'ыть', 'оть',
            'ает', 'ует', 'ит', 'ет', 'ют', 'ят', 'ал', 'ил', 'ел'
        ];
        
        return verbEndings.some(ending => word.endsWith(ending));
    }

    // Оценка кандидатов на ключевые слова
    scoreKeywordCandidates(candidates, fullText) {
        const wordFreq = {};
        const wordPositions = {};
        
        // Подсчитываем частоту и позиции
        candidates.forEach((word, index) => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
            if (!wordPositions[word]) wordPositions[word] = [];
            wordPositions[word].push(index);
        });

        // Оцениваем каждое слово
        const scoredWords = Object.entries(wordFreq).map(([word, freq]) => {
            let score = 0;
            
            // Базовый балл за частоту (но не слишком частые слова)
            if (freq >= 2 && freq <= 4) {
                score += freq * 10;
            } else if (freq === 1) {
                score += 5; // Уникальные слова тоже важны
            }
            
            // Бонус за длину (длинные слова часто более специфичны)
            score += Math.min(word.length, 15);
            
            // Бонус за позицию в начале текста
            const avgPosition = wordPositions[word].reduce((a, b) => a + b, 0) / wordPositions[word].length;
            if (avgPosition < candidates.length * 0.3) {
                score += 10; // Слова в начале часто важнее
            }
            
            // Бонус за специфичность (проверяем по словарю концепций)
            if (this.isConceptualWord(word)) {
                score += 20;
            }
            
            // Штраф за слишком общие слова
            if (this.isTooGeneral(word)) {
                score -= 15;
            }
            
            return { word, score, frequency: freq };
        });

        return scoredWords.sort((a, b) => b.score - a.score);
    }

    // Проверка, является ли слово концептуальным
    isConceptualWord(word) {
        const conceptualPatterns = [
            /система|метод|подход|техника|стратегия/i,
            /результат|эффект|успех|достижение|цель/i,
            /проблема|ошибка|трудность|препятствие|вызов/i,
            /навык|умение|компетенция|знание|опыт/i,
            /процесс|механизм|принцип|правило|закон/i,
            /ресурс|инструмент|средство|способ|решение/i,
            /анализ|исследование|изучение|понимание/i,
            /развитие|рост|прогресс|улучшение|оптимизация/i
        ];
        
        return conceptualPatterns.some(pattern => pattern.test(word));
    }

    // Проверка, является ли слово слишком общим
    isTooGeneral(word) {
        const generalWords = new Set([
            'человек', 'люди', 'время', 'жизнь', 'день', 'год', 'месяц', 'неделя',
            'дело', 'вещь', 'место', 'сторона', 'часть', 'момент', 'случай',
            'вопрос', 'ответ', 'слово', 'текст', 'информация', 'данные'
        ]);
        
        return generalWords.has(word);
    }

    // Выбор высококачественных ключевых слов
    selectHighQualityKeywords(scoredCandidates) {
        return scoredCandidates
            .filter(item => item.score >= 15) // Минимальный порог качества
            .slice(0, 4) // Максимум 4 отдельных слова
            .map(item => item.word);
    }

    // Извлечение значимых фраз
    extractMeaningfulPhrases(words) {
        const phrases = [];
        
        // Биграммы (фразы из 2 слов)
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            
            if (this.isPhraseWorthy(word1, word2)) {
                const phrase = `${word1} ${word2}`;
                if (phrase.length <= 20) {
                    phrases.push(phrase);
                }
            }
        }
        
        // Триграммы (фразы из 3 слов) - только самые значимые
        for (let i = 0; i < words.length - 2; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            const word3 = words[i + 2];
            
            if (this.isHighValueTrigram(word1, word2, word3)) {
                const phrase = `${word1} ${word2} ${word3}`;
                if (phrase.length <= 25) {
                    phrases.push(phrase);
                }
            }
        }
        
        // Убираем дубликаты и возвращаем максимум 2 фразы
        return [...new Set(phrases)].slice(0, 2);
    }

    // Проверка, стоит ли фраза из двух слов внимания
    isPhraseWorthy(word1, word2) {
        // Исключаем фразы со стоп-словами
        const stopWords = new Set(['это', 'что', 'как', 'для', 'или', 'при', 'все']);
        if (stopWords.has(word1) || stopWords.has(word2)) return false;
        
        // Исключаем фразы с глаголами
        if (this.isLikelyVerb(word1) || this.isLikelyVerb(word2)) return false;
        
        // Приоритет фразам с концептуальными словами
        if (this.isConceptualWord(word1) || this.isConceptualWord(word2)) return true;
        
        // Проверяем на значимые паттерны
        const meaningfulPatterns = [
            /\w+(ность|ция|сть|ство)$/i, // Абстрактные понятия
            /\w+(ение|ание|тие)$/i,      // Процессы
            /\w+(изм|ист|ант)$/i        // Концепции и роли
        ];
        
        return meaningfulPatterns.some(pattern => 
            pattern.test(word1) || pattern.test(word2)
        );
    }

    // Проверка высокоценных триграмм
    isHighValueTrigram(word1, word2, word3) {
        // Очень строгие критерии для триграмм
        const allConceptual = [word1, word2, word3].every(word => 
            this.isConceptualWord(word) && !this.isLikelyVerb(word)
        );
        
        return allConceptual;
    }

    // Ранжирование ключевых слов по важности
    rankKeywordsByImportance(keywords, fullText) {
        return keywords
            .map(keyword => ({
                keyword,
                importance: this.calculateKeywordImportance(keyword, fullText)
            }))
            .sort((a, b) => b.importance - a.importance)
            .map(item => item.keyword);
    }

    // Расчет важности ключевого слова
    calculateKeywordImportance(keyword, fullText) {
        let importance = 0;
        
        // Частота в тексте
        const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
        const matches = fullText.match(regex) || [];
        importance += matches.length * 5;
        
        // Длина ключевого слова
        importance += Math.min(keyword.length, 20);
        
        // Бонус за фразы
        if (keyword.includes(' ')) {
            importance += 10;
        }
        
        // Бонус за концептуальность
        if (this.isConceptualWord(keyword)) {
            importance += 15;
        }
        
        // Позиция в тексте (раннее появление = выше важность)
        const firstIndex = fullText.toLowerCase().indexOf(keyword.toLowerCase());
        if (firstIndex !== -1) {
            const relativePosition = firstIndex / fullText.length;
            importance += (1 - relativePosition) * 10;
        }
        
        return importance;
    }

    // Извлечение ключевых слов через AI (улучшенная версия)
    async extractKeywordsWithAI(text) {
        const prompt = `Извлеки 3-6 самых важных ключевых слов из этого текста для подсветки в Instagram карусели.

ТРЕБОВАНИЯ:
- Только существительные и важные понятия
- Слова длиной от 4 до 20 символов
- Самые значимые термины для понимания смысла
- Без стоп-слов (и, в, на, с, для, что, как, это, то, не)
- Без местоимений и служебных слов
- Фокус на ключевых концепциях и терминах

ТЕКСТ:
"${text.substring(0, 500)}"

Верни в JSON формате:
{ "keywords": ["концепция1", "термин2", "понятие3", "ключевое_слово4"] }

ТОЛЬКО JSON, никакого другого текста!`;

        try {
            const response = await this.callAIAPI(prompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 8000
            });
            
            const parsedKeywords = this.parseKeywordsResponse(response);
            
            // Валидируем и фильтруем ключевые слова
            const validKeywords = this.validateAndFilterKeywords(parsedKeywords);
            
            return validKeywords;
            
        } catch (error) {
            console.warn('⚠️ Ошибка AI извлечения ключевых слов:', error.message);
            throw error;
        }
    }

    // Валидация и фильтрация ключевых слов
    validateAndFilterKeywords(keywords) {
        if (!Array.isArray(keywords)) {
            return [];
        }
        
        const stopWords = new Set([
            // Русские стоп-слова
            'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
            'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'была', 'было',
            'они', 'она', 'оно', 'мне', 'нас', 'вас', 'них', 'его', 'её', 'их',
            'тот', 'эта', 'эти', 'тех', 'той', 'тем', 'под', 'над', 'про', 'без',
            'через', 'после', 'перед', 'между', 'среди', 'около', 'вокруг',
            // Английские стоп-слова
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
            'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
            'did', 'man', 'way', 'she', 'use', 'her', 'many', 'oil', 'sit', 'set'
        ]);
        
        return keywords
            .filter(keyword => {
                if (typeof keyword !== 'string') return false;
                
                const clean = keyword.toLowerCase().trim();
                
                // Проверяем длину
                if (clean.length < 4 || clean.length > 20) return false;
                
                // Проверяем на стоп-слова
                if (stopWords.has(clean)) return false;
                
                // Проверяем на содержание только букв и пробелов
                if (!/^[а-яёa-z\s]+$/i.test(clean)) return false;
                
                return true;
            })
            .map(keyword => keyword.toLowerCase().trim())
            .filter((keyword, index, array) => array.indexOf(keyword) === index) // Убираем дубликаты
            .slice(0, 6); // Максимум 6 ключевых слов
    }

    // Локальное извлечение ключевых слов (улучшенная версия)
    extractKeywordsLocally(text) {
        console.log('🏠 Локальное извлечение ключевых слов...');
        
        // Очищаем текст и разбиваем на слова
        const cleanText = text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const words = cleanText.split(' ').filter(word => word.length > 3);
        
        // Стоп-слова для фильтрации
        const stopWords = new Set([
            'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
            'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'была', 'было',
            'они', 'она', 'оно', 'мне', 'нас', 'вас', 'них', 'его', 'её', 'их',
            'тот', 'эта', 'эти', 'тех', 'той', 'тем', 'под', 'над', 'про', 'без',
            'через', 'после', 'перед', 'между', 'среди', 'около', 'вокруг',
            'сегодня', 'завтра', 'вчера', 'сейчас', 'потом', 'тогда', 'здесь',
            'там', 'туда', 'сюда', 'откуда', 'куда', 'почему', 'зачем', 'когда'
        ]);
        
        // Подсчитываем частоту слов
        const wordFreq = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length >= 4 && word.length <= 20) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        // Сортируем по частоте и важности
        const sortedWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .map(([word]) => word);
        
        // Добавляем биграммы (фразы из двух слов)
        const bigrams = this.extractMeaningfulBigrams(words, stopWords);
        
        // Объединяем слова и биграммы
        const allKeywords = [...sortedWords, ...bigrams];
        
        // Фильтруем по важности и возвращаем 3-6 ключевых слов
        const finalKeywords = this.selectMostMeaningful(allKeywords, text).slice(0, 6);
        
        console.log(`✅ Локально извлечено ${finalKeywords.length} ключевых слов:`, finalKeywords);
        return finalKeywords;
    }

    // Извлечение значимых биграмм
    extractMeaningfulBigrams(words, stopWords) {
        const bigrams = {};
        
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            
            if (word1.length >= 4 && word2.length >= 4 && 
                !stopWords.has(word1) && !stopWords.has(word2)) {
                
                const bigram = `${word1} ${word2}`;
                bigrams[bigram] = (bigrams[bigram] || 0) + 1;
            }
        }
        
        return Object.entries(bigrams)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2) // Максимум 2 биграммы
            .map(([bigram]) => bigram);
    }

    // Выбор наиболее значимых ключевых слов
    selectMostMeaningful(keywords, originalText) {
        // Приоритетные категории слов
        const priorityPatterns = [
            /результат|эффект|успех|достижение/i,
            /система|метод|способ|подход|техника/i,
            /проблема|ошибка|трудность|препятствие/i,
            /цель|задача|план|стратегия/i,
            /навык|умение|компетенция|знание/i,
            /время|скорость|быстро|эффективно/i,
            /деньги|доход|прибыль|экономия/i,
            /качество|уровень|стандарт/i
        ];
        
        const scoredKeywords = keywords.map(keyword => {
            let score = 0;
            
            // Базовый балл за длину (длинные слова часто более значимы)
            score += Math.min(keyword.length / 2, 10);
            
            // Бонус за соответствие приоритетным паттернам
            priorityPatterns.forEach(pattern => {
                if (pattern.test(keyword)) {
                    score += 15;
                }
            });
            
            // Бонус за частоту в тексте
            const frequency = (originalText.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
            score += frequency * 5;
            
            // Бонус за биграммы (фразы из двух слов)
            if (keyword.includes(' ')) {
                score += 8;
            }
            
            return { keyword, score };
        });
        
        return scoredKeywords
            .sort((a, b) => b.score - a.score)
            .map(item => item.keyword);
    }

    // Генерация резервных ключевых слов
    generateFallbackKeywords(text) {
        const fallbackKeywords = [];
        
        // Ищем числа и проценты
        const numbers = text.match(/\d+%|\d+\s*(раз|времен|дней|недель|месяцев|лет)/gi);
        if (numbers) {
            fallbackKeywords.push(...numbers.slice(0, 2));
        }
        
        // Ищем важные концепции по паттернам
        const concepts = [
            'продуктивность', 'эффективность', 'результат', 'успех',
            'система', 'метод', 'способ', 'техника', 'навык',
            'цель', 'план', 'стратегия', 'подход'
        ];
        
        concepts.forEach(concept => {
            if (text.toLowerCase().includes(concept)) {
                fallbackKeywords.push(concept);
            }
        });
        
        return fallbackKeywords.slice(0, 3);
    }

    // Извлечение ключевых слов через AI (Gemini)
    async extractKeywordsWithAI(text) {
        const prompt = `Извлеки 5-10 ключевых слов и фраз из этого текста для подсветки. 
        Верни только важные термины, избегай стоп-слова (и, в, на, с, для, что, как).
        Формат ответа: слово1, слово2, фраза из двух слов, термин
        
        Текст: "${text}"`;

        try {
            const response = await this.callGeminiAPI(prompt);
            
            if (response && response.candidates && response.candidates[0]) {
                const keywordsText = response.candidates[0].content.parts[0].text;
                
                // Парсим ответ и очищаем ключевые слова
                const keywords = this.parseAndCleanKeywords(keywordsText);
                
                return keywords;
            }
        } catch (error) {
            console.warn('⚠️ Ошибка извлечения ключевых слов через AI:', error);
            throw error;
        }
        
        return [];
    }

    // Локальное извлечение ключевых слов (fallback)
    extractKeywordsLocally(text) {
        console.log('🔍 Локальное извлечение ключевых слов...');
        
        // Стоп-слова для фильтрации
        const stopWords = new Set([
            'и', 'в', 'на', 'с', 'для', 'что', 'как', 'это', 'то', 'не', 'по', 'из', 'за', 'от', 'до',
            'при', 'или', 'но', 'а', 'же', 'бы', 'ли', 'уже', 'еще', 'так', 'там', 'тут', 'где',
            'когда', 'почему', 'зачем', 'кто', 'чем', 'чего', 'кого', 'кому', 'которые', 'которых'
        ]);
        
        // Очищаем текст и разбиваем на слова
        const cleanText = text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const words = cleanText.split(' ');
        
        // Подсчитываем частоту слов
        const wordFreq = {};
        words.forEach(word => {
            if (word.length > 2 && !stopWords.has(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        // Сортируем по частоте и берем топ-8
        const sortedWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([word]) => word);
        
        // Добавляем биграммы (фразы из двух слов)
        const bigrams = this.extractBigrams(words, stopWords);
        
        // Объединяем и ограничиваем до 10 ключевых слов
        const keywords = [...sortedWords, ...bigrams].slice(0, 10);
        
        console.log('✅ Локальные ключевые слова:', keywords);
        return keywords;
    }

    // Извлечение биграмм (фраз из двух слов)
    extractBigrams(words, stopWords) {
        const bigrams = {};
        
        for (let i = 0; i < words.length - 1; i++) {
            const word1 = words[i];
            const word2 = words[i + 1];
            
            if (word1.length > 2 && word2.length > 2 && 
                !stopWords.has(word1) && !stopWords.has(word2)) {
                
                const bigram = `${word1} ${word2}`;
                bigrams[bigram] = (bigrams[bigram] || 0) + 1;
            }
        }
        
        return Object.entries(bigrams)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([bigram]) => bigram);
    }

    // Парсинг и очистка ключевых слов от AI
    parseAndCleanKeywords(keywordsText) {
        console.log('🧹 Очистка ключевых слов от AI:', keywordsText);
        
        // Разбиваем по запятым и очищаем
        const rawKeywords = keywordsText
            .split(/[,\n]/)
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => keyword.length > 1);
        
        // Убираем дубликаты и стоп-слова
        const stopWords = new Set(['и', 'в', 'на', 'с', 'для', 'что', 'как', 'это', 'то', 'не']);
        const cleanKeywords = [];
        const seen = new Set();
        
        rawKeywords.forEach(keyword => {
            // Очищаем от лишних символов
            const clean = keyword.replace(/[^\w\sа-яё]/gi, '').trim();
            
            if (clean.length > 2 && 
                !stopWords.has(clean) && 
                !seen.has(clean)) {
                
                cleanKeywords.push(clean);
                seen.add(clean);
            }
        });
        
        // Ограничиваем до 10 ключевых слов
        const finalKeywords = cleanKeywords.slice(0, 10);
        
        console.log('✅ Очищенные ключевые слова:', finalKeywords);
        return finalKeywords;
    }

    // ===== НЕДОСТАЮЩИЕ МЕТОДЫ ДЛЯ ИНТЕЛЛЕКТУАЛЬНОГО ИЗВЛЕЧЕНИЯ =====

    // Валидация качества ключевых слов
    validateKeywordQuality(keywords, originalText) {
        console.log('🔍 Валидация качества ключевых слов...');
        
        if (!Array.isArray(keywords)) {
            console.warn('⚠️ Keywords не является массивом');
            return [];
        }

        const validatedKeywords = keywords.filter(keyword => {
            if (!keyword || typeof keyword !== 'string') {
                return false;
            }

            const cleanKeyword = keyword.trim().toLowerCase();
            
            // Проверяем длину
            if (cleanKeyword.length < 3 || cleanKeyword.length > 25) {
                return false;
            }

            // Проверяем на стоп-слова
            const stopWords = new Set([
                'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
                'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'была', 'было', 'были',
                'они', 'она', 'оно', 'мне', 'нас', 'вас', 'них', 'его', 'её', 'их',
                'тот', 'эта', 'эти', 'тех', 'той', 'тем', 'под', 'над', 'про', 'без',
                'через', 'после', 'перед', 'между', 'среди', 'около', 'вокруг',
                'сегодня', 'завтра', 'вчера', 'сейчас', 'потом', 'тогда', 'здесь',
                'там', 'туда', 'сюда', 'откуда', 'куда', 'почему', 'зачем', 'когда',
                'делать', 'сделать', 'быть', 'иметь', 'знать', 'понимать', 'изучать',
                'работать', 'учиться', 'получать', 'давать', 'брать', 'идти', 'ехать',
                'говорить', 'сказать', 'думать', 'хотеть', 'мочь', 'должен', 'нужно'
            ]);

            if (stopWords.has(cleanKeyword)) {
                return false;
            }

            // Проверяем на содержание только букв и пробелов
            if (!/^[а-яёa-z\s]+$/i.test(cleanKeyword)) {
                return false;
            }

            // Проверяем, что слово присутствует в оригинальном тексте
            const normalizedText = originalText.toLowerCase();
            if (!normalizedText.includes(cleanKeyword)) {
                return false;
            }

            // Исключаем слишком частые слова (более 30% от общего количества слов)
            const wordCount = (normalizedText.match(new RegExp(cleanKeyword, 'g')) || []).length;
            const totalWords = normalizedText.split(/\s+/).length;
            if (wordCount / totalWords > 0.3) {
                return false;
            }

            return true;
        });

        // Убираем дубликаты и ограничиваем до 6 слов
        const uniqueKeywords = [...new Set(validatedKeywords)].slice(0, 6);
        
        console.log(`✅ Валидация завершена: ${keywords.length} → ${uniqueKeywords.length} ключевых слов`);
        return uniqueKeywords;
    }

    // Фильтрация интеллектуальных ключевых слов
    filterIntelligentKeywords(keywords) {
        console.log('🧠 Фильтрация интеллектуальных ключевых слов...');
        
        if (!Array.isArray(keywords)) {
            return [];
        }

        const intelligentKeywords = keywords.filter(keyword => {
            if (!keyword || typeof keyword !== 'string') {
                return false;
            }

            const cleanKeyword = keyword.trim().toLowerCase();

            // Проверяем на концептуальность
            const conceptualPatterns = [
                /система|метод|подход|техника|стратегия|принцип/i,
                /результат|эффект|успех|достижение|цель|задача/i,
                /проблема|ошибка|трудность|препятствие|вызов|риск/i,
                /навык|умение|компетенция|знание|опыт|мастерство/i,
                /процесс|механизм|алгоритм|правило|закон|формула/i,
                /ресурс|инструмент|средство|способ|решение|вариант/i,
                /анализ|исследование|изучение|понимание|осознание/i,
                /развитие|рост|прогресс|улучшение|оптимизация|совершенствование/i,
                /качество|уровень|стандарт|критерий|показатель|метрика/i,
                /время|скорость|эффективность|продуктивность|производительность/i
            ];

            const isConceptual = conceptualPatterns.some(pattern => pattern.test(cleanKeyword));

            // Проверяем на специфичность (не слишком общие слова)
            const tooGeneral = [
                'человек', 'люди', 'время', 'жизнь', 'день', 'год', 'месяц', 'неделя',
                'дело', 'вещь', 'место', 'сторона', 'часть', 'момент', 'случай',
                'вопрос', 'ответ', 'слово', 'текст', 'информация', 'данные', 'факт'
            ].includes(cleanKeyword);

            // Проверяем длину (интеллектуальные ключевые слова обычно 4-20 символов)
            const goodLength = cleanKeyword.length >= 4 && cleanKeyword.length <= 20;

            // Проверяем на наличие цифр или специальных символов (исключаем)
            const hasSpecialChars = /[0-9%$@#&*()+=\[\]{}|\\:";'<>?,./]/.test(cleanKeyword);

            return isConceptual && !tooGeneral && goodLength && !hasSpecialChars;
        });

        // Сортируем по важности и ограничиваем
        const sortedKeywords = this.sortKeywordsByIntelligence(intelligentKeywords);
        const finalKeywords = sortedKeywords.slice(0, 6);

        console.log(`✅ Интеллектуальная фильтрация: ${keywords.length} → ${finalKeywords.length} концепций`);
        return finalKeywords;
    }

    // Сортировка ключевых слов по интеллектуальности
    sortKeywordsByIntelligence(keywords) {
        return keywords.sort((a, b) => {
            const scoreA = this.calculateIntelligenceScore(a);
            const scoreB = this.calculateIntelligenceScore(b);
            return scoreB - scoreA;
        });
    }

    // Расчет интеллектуального рейтинга ключевого слова
    calculateIntelligenceScore(keyword) {
        let score = 0;
        const cleanKeyword = keyword.toLowerCase();

        // Бонус за длину (оптимальная длина 6-12 символов)
        const length = cleanKeyword.length;
        if (length >= 6 && length <= 12) {
            score += 10;
        } else if (length >= 4 && length <= 15) {
            score += 5;
        }

        // Бонус за концептуальные паттерны
        const highValuePatterns = [
            /система|стратегия|методология/i,
            /эффективность|продуктивность|оптимизация/i,
            /инновация|технология|решение/i,
            /компетенция|мастерство|экспертиза/i
        ];

        highValuePatterns.forEach(pattern => {
            if (pattern.test(cleanKeyword)) {
                score += 15;
            }
        });

        // Бонус за сложные слова (с суффиксами)
        const complexSuffixes = [
            /ность$|ция$|сть$|ство$/i,  // абстрактные понятия
            /ение$|ание$|тие$/i,        // процессы
            /изм$|ист$|ант$/i           // концепции и роли
        ];

        complexSuffixes.forEach(suffix => {
            if (suffix.test(cleanKeyword)) {
                score += 8;
            }
        });

        // Штраф за слишком простые слова
        const simpleWords = ['дело', 'вещь', 'место', 'время', 'день'];
        if (simpleWords.includes(cleanKeyword)) {
            score -= 10;
        }

        return score;
    }

    // Генерация значимых резервных ключевых слов
    generateMeaningfulFallbacks(slideText) {
        console.log('🔄 Генерация значимых резервных ключевых слов...');
        
        const fallbackKeywords = [];
        const normalizedText = slideText.toLowerCase();

        // 1. Ищем числа и проценты (часто важны в контенте)
        const numberPatterns = [
            /\d+%/g,                           // проценты
            /\d+\s*(раз|времен|дней|недель|месяцев|лет)/gi,  // временные периоды
            /\d+\s*(рублей|долларов|евро)/gi,  // деньги
            /\d+\s*(человек|людей|клиентов)/gi // количество людей
        ];

        numberPatterns.forEach(pattern => {
            const matches = slideText.match(pattern);
            if (matches) {
                fallbackKeywords.push(...matches.slice(0, 2)); // максимум 2 числовых значения
            }
        });

        // 2. Ищем важные концепции по ключевым словам
        const conceptKeywords = [
            'продуктивность', 'эффективность', 'результат', 'успех', 'достижение',
            'система', 'метод', 'способ', 'техника', 'навык', 'стратегия',
            'цель', 'план', 'задача', 'проблема', 'решение', 'подход',
            'качество', 'уровень', 'развитие', 'рост', 'прогресс',
            'время', 'скорость', 'быстро', 'медленно', 'долго',
            'деньги', 'доход', 'прибыль', 'экономия', 'инвестиции',
            'бизнес', 'работа', 'карьера', 'профессия', 'должность',
            'здоровье', 'фитнес', 'питание', 'диета', 'спорт',
            'отношения', 'семья', 'друзья', 'партнер', 'любовь',
            'образование', 'обучение', 'курсы', 'знания', 'информация'
        ];

        conceptKeywords.forEach(concept => {
            if (normalizedText.includes(concept)) {
                fallbackKeywords.push(concept);
            }
        });

        // 3. Ищем действия как существительные
        const actionNouns = [
            'планирование', 'организация', 'управление', 'контроль',
            'анализ', 'исследование', 'изучение', 'понимание',
            'создание', 'разработка', 'построение', 'формирование',
            'улучшение', 'оптимизация', 'совершенствование', 'развитие',
            'достижение', 'получение', 'приобретение', 'освоение'
        ];

        actionNouns.forEach(action => {
            if (normalizedText.includes(action)) {
                fallbackKeywords.push(action);
            }
        });

        // 4. Ищем профессиональные термины
        const professionalTerms = [
            'маркетинг', 'реклама', 'продажи', 'клиенты', 'аудитория',
            'контент', 'блог', 'социальные сети', 'инстаграм', 'youtube',
            'стартап', 'бизнес-модель', 'монетизация', 'масштабирование',
            'автоматизация', 'делегирование', 'аутсорсинг', 'фриланс',
            'инвестиции', 'пассивный доход', 'финансовая грамотность'
        ];

        professionalTerms.forEach(term => {
            if (normalizedText.includes(term)) {
                fallbackKeywords.push(term);
            }
        });

        // Убираем дубликаты и ограничиваем количество
        const uniqueFallbacks = [...new Set(fallbackKeywords)]
            .filter(keyword => keyword && keyword.length >= 4)
            .slice(0, 4); // максимум 4 резервных ключевых слова

        console.log(`✅ Сгенерировано ${uniqueFallbacks.length} значимых резервных ключевых слов:`, uniqueFallbacks);
        return uniqueFallbacks;
    }

    // Обновление ключевых слов для существующего слайда
    async updateSlideKeywords(slideId) {
        const slide = this.state.getSlideById(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден для обновления ключевых слов`);
            return false;
        }

        try {
            // Собираем весь текст из текстовых блоков слайда
            const allText = slide.textBlocks.map(block => block.text).join(' ');
            
            if (!allText.trim()) {
                console.warn('⚠️ Нет текста для извлечения ключевых слов');
                return false;
            }

            // Извлекаем ключевые слова с помощью интеллектуальной системы
            const keywords = await this.extractSlideKeywords(allText);

            // Обновляем слайд
            this.state.updateSlideProperty(slideId, 'autoKeywords', keywords);
            
            console.log(`✅ Ключевые слова обновлены для слайда ${slideId}:`, keywords);
            return true;

        } catch (error) {
            console.error('❌ Ошибка обновления ключевых слов:', error);
            return false;
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

    // ===== ИЗВЛЕЧЕНИЕ КЛЮЧЕВЫХ СЛОВ =====

    // Извлечение ключевых слов для слайдов
    async extractKeywordsForSlides(slides) {
        try {
            console.log('🔍 Извлечение ключевых слов...');
            
            // Собираем весь текст из слайдов
            const allText = slides.map(slide => slide.text).join(' ');
            
            // Извлекаем ключевые слова
            const keywords = await this.extractKeywords(allText);
            
            // Добавляем ключевые слова к каждому слайду
            const slidesWithKeywords = slides.map(slide => ({
                ...slide,
                autoKeywords: keywords
            }));
            
            console.log(`✅ Извлечено ${keywords.length} ключевых слов`);
            return slidesWithKeywords;
            
        } catch (error) {
            console.warn('⚠️ Ошибка извлечения ключевых слов:', error.message);
            // Возвращаем слайды без ключевых слов
            return slides.map(slide => ({
                ...slide,
                autoKeywords: []
            }));
        }
    }

    // Извлечение ключевых слов из текста
    async extractKeywords(text) {
        try {
            const keywordPrompt = this.buildKeywordPrompt(text);
            const response = await this.callAIAPI(keywordPrompt, {
                provider: this.getAIProvider(),
                maxRetries: 2,
                timeout: 10000
            });
            
            const parsedKeywords = this.parseKeywordsResponse(response);
            return parsedKeywords;
            
        } catch (error) {
            console.warn('⚠️ Ошибка AI извлечения ключевых слов:', error.message);
            return this.extractKeywordsLocally(text);
        }
    }

    // Локальное извлечение ключевых слов
    extractKeywordsLocally(text) {
        // Простой алгоритм извлечения ключевых слов
        const words = text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Подсчитываем частоту слов
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        // Исключаем стоп-слова
        const stopWords = new Set([
            'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
            'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'был', 'была', 'было',
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his'
        ]);
        
        // Сортируем по частоте и берем топ-10
        const keywords = Object.entries(frequency)
            .filter(([word]) => !stopWords.has(word))
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
        
        console.log(`✅ Локально извлечено ${keywords.length} ключевых слов`);
        return keywords;
    }

    // ===== ПОСТРОЕНИЕ ПРОМПТОВ =====

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

    // Построение промпта для извлечения ключевых слов
    buildKeywordPrompt(text) {
        return `Извлеки 5-10 самых важных ключевых слов из этого текста для подсветки в Instagram карусели:

ТЕКСТ:
${text.substring(0, 1000)}...

ТРЕБОВАНИЯ:
- Только существительные и прилагательные
- Слова длиной от 4 до 15 символов
- Самые важные термины и понятия
- Без стоп-слов и служебных частей речи

Верни в JSON:
{ "keywords": ["слово1", "слово2", "слово3", ...] }`;
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

    // ===== ПАРСИНГ ОТВЕТОВ =====

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

    // Парсинг и валидация структурированного контента
    parseAndValidateStructuredContent(response, topic) {
        try {
            const cleanedResponse = this.cleanAIResponse(response);
            
            if (!cleanedResponse) {
                throw new Error('Empty response from AI');
            }

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error(`Invalid JSON format: ${parseError.message}`);
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
            parsedResponse.slides.forEach((slide, index) => {
                if (!slide || typeof slide !== 'object') {
                    throw new Error(`Slide ${index + 1} is not an object`);
                }
                
                if (!slide.text || typeof slide.text !== 'string' || slide.text.trim().length === 0) {
                    throw new Error(`Slide ${index + 1} has invalid text`);
                }
                
                // Обеспечиваем наличие title
                if (!slide.title) {
                    slide.title = `Slide ${index + 1}`;
                }
                
                // Валидируем длину текста (3-5 предложений)
                const sentences = slide.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
                if (sentences.length < 3) {
                    console.warn(`⚠️ Слайд ${index + 1} содержит менее 3 предложений`);
                }
                
                // Ограничиваем длину текста
                if (slide.text.length > 600) {
                    slide.text = slide.text.substring(0, 597) + '...';
                }
            });

            // Обеспечиваем наличие topic
            if (!parsedResponse.topic) {
                parsedResponse.topic = topic;
            }

            console.log(`✅ Структурированный контент валиден: ${parsedResponse.slides.length} слайдов`);
            return parsedResponse;

        } catch (error) {
            console.error('❌ Validation error:', error.message);
            throw error;
        }
    }

    // Дополнение слайдов до минимального количества (8)
    expandSlidesToMinimum(slides, topic) {
        const additionalTemplates = [
            {
                title: "Tips",
                text: `Дополнительные советы по ${topic}:\n\n• Начинайте с малого\n• Будьте последовательны\n• Отслеживайте прогресс\n• Не бойтесь экспериментировать`
            },
            {
                title: "Resources", 
                text: `Полезные ресурсы для изучения ${topic}:\n\n• Книги от экспертов\n• Онлайн-курсы\n• Практические упражнения\n• Сообщества единомышленников`
            },
            {
                title: "Next Steps",
                text: `Следующие шаги в ${topic}:\n\n• Определите приоритеты\n• Составьте план действий\n• Найдите ментора\n• Начните практиковать уже сегодня`
            }
        ];

        const expandedSlides = [...slides];
        let templateIndex = 0;

        while (expandedSlides.length < 8 && templateIndex < additionalTemplates.length) {
            expandedSlides.push(additionalTemplates[templateIndex]);
            templateIndex++;
        }

        return expandedSlides;
    }

    // Локальная генерация структурированного контента
    generateLocalStructuredContent(topic) {
        console.log('🏠 Локальная генерация структурированного контента для:', topic);
        
        const localSlides = [
            {
                title: "Hook",
                text: `95% людей делают критическую ошибку в ${topic}.\n\nЭта ошибка стоит им месяцы потраченного времени и денег.\n\nСегодня я покажу, как её избежать и получить результат в 3 раза быстрее.\n\nГотовы узнать секрет?`
            },
            {
                title: "Problem", 
                text: `Большинство новичков в ${topic} начинают не с того.\n\nОни изучают сложные техники, не освоив основы.\n\nРезультат: фрустрация, потеря мотивации, отказ от цели.\n\nЗнакомо? Тогда читайте дальше.`
            },
            {
                title: "Explanation",
                text: `Проблема в том, что люди не понимают основ ${topic}.\n\nОни хватаются за разрозненную информацию из разных источников.\n\nМозг не может структурировать хаотичные знания.\n\nНужна система, а не случайные советы.`
            },
            {
                title: "Value",
                text: `Правильный подход к ${topic} даёт огромные преимущества:\n\n• Экономия времени в 3-5 раз\n• Быстрые и стабильные результаты\n• Уверенность в своих действиях\n• Возможность помогать другим`
            },
            {
                title: "Example",
                text: `Реальный пример: Анна изучала ${topic} 6 месяцев без результата.\n\nПрименив систему из 4 шагов, она достигла цели за 2 месяца.\n\nСекрет в правильной последовательности действий.\n\nТеперь она зарабатывает на своих знаниях.`
            },
            {
                title: "Steps",
                text: `Система из 4 простых шагов:\n\n1. Изучите основы (20% времени)\n2. Практикуйтесь ежедневно (60%)\n3. Получайте обратную связь (15%)\n4. Совершенствуйтесь постоянно (5%)`
            },
            {
                title: "Mistakes",
                text: `Топ-3 ошибки в ${topic}:\n\n1. Перфекционизм вместо действий\n2. Изучение без практики\n3. Отсутствие системы отслеживания\n\nИзбегайте их любой ценой!`
            },
            {
                title: "Results",
                text: `Что вы получите через 30 дней:\n\n• Чёткое понимание основ ${topic}\n• Первые практические результаты\n• Уверенность в своих действиях\n• План дальнейшего развития`
            },
            {
                title: "Conclusion",
                text: `Главные выводы о ${topic}:\n\n• Основы важнее сложных техник\n• Практика превыше теории\n• Система лучше хаоса\n• Результат приходит к тем, кто действует`
            },
            {
                title: "CTA",
                text: `Начните применять эти принципы уже сегодня!\n\nВыберите один совет и внедрите его.\n\nПоделитесь в комментариях своим планом действий.\n\nСохраните пост, чтобы вернуться к нему завтра.`
            }
        ];

        return {
            topic: topic,
            slides: localSlides
        };
    }

    // Извлечение ключевых слов из текста
    extractKeywordsFromText(text) {
        // Простое извлечение ключевых слов
        const words = text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Подсчитываем частоту
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        // Исключаем стоп-слова
        const stopWords = new Set([
            'это', 'что', 'как', 'для', 'или', 'при', 'все', 'еще', 'уже', 'так',
            'где', 'кто', 'чем', 'том', 'был', 'быть', 'есть', 'была', 'было',
            'они', 'она', 'оно', 'мне', 'нас', 'вас', 'них', 'его', 'её', 'их'
        ]);
        
        // Возвращаем топ-8 ключевых слов
        return Object.entries(frequency)
            .filter(([word]) => !stopWords.has(word))
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([word]) => word);
    }

    // Парсинг ответа с ключевыми словами
    parseKeywordsResponse(response) {
        try {
            const cleanedResponse = this.cleanAIResponse(response);
            const parsedResponse = JSON.parse(cleanedResponse);
            
            if (!parsedResponse.keywords || !Array.isArray(parsedResponse.keywords)) {
                throw new Error('Invalid keywords format');
            }
            
            // Фильтруем и валидируем ключевые слова
            const validKeywords = parsedResponse.keywords
                .filter(keyword => typeof keyword === 'string' && keyword.length >= 3 && keyword.length <= 15)
                .slice(0, 10); // Максимум 10 ключевых слов
            
            return validKeywords;
            
        } catch (error) {
            console.warn('⚠️ Ошибка парсинга ключевых слов:', error.message);
            return [];
        }
    }

    // ===== ЛОКАЛЬНАЯ ГЕНЕРАЦИЯ =====

    // Генерация локальных слайдов (fallback)
    generateLocalSlides(topic) {
        const templates = this.getLocalTemplates();
        const template = this.selectBestTemplate(topic, templates);
        
        return template.slides.map((slide, index) => ({
            title: slide.title,
            text: slide.text.replace(/\{topic\}/g, topic),
            autoKeywords: []
        }));
    }

    // Получение локальных шаблонов
    getLocalTemplates() {
        return [
            {
                name: 'general',
                keywords: ['общий', 'универсальный'],
                slides: [
                    {
                        title: 'Hook',
                        text: 'Знаете ли вы, что 90% людей делают одну критическую ошибку в {topic}?\n\nЭта ошибка стоит им времени, денег и результатов.\n\nСегодня я покажу, как её избежать.'
                    },
                    {
                        title: 'Problem',
                        text: 'Большинство людей подходят к {topic} неправильно.\n\nОни тратят месяцы на изучение, но не получают результатов.\n\nПричина в том, что они не знают основ.'
                    },
                    {
                        title: 'Solution',
                        text: 'Есть простая система из 3 шагов:\n\n1. Изучите основы\n2. Практикуйтесь ежедневно\n3. Анализируйте результаты\n\nЭто работает для всех.'
                    },
                    {
                        title: 'Steps',
                        text: 'Шаг 1: Определите свою цель в {topic}\n\nШаг 2: Составьте план действий\n\nШаг 3: Начните с малого\n\nШаг 4: Отслеживайте прогресс'
                    },
                    {
                        title: 'CTA',
                        text: 'Начните применять эти советы уже сегодня!\n\nПоделитесь в комментариях своим опытом.\n\nСохраните пост, чтобы не потерять.'
                    }
                ]
            }
        ];
    }

    // Выбор лучшего шаблона для темы
    selectBestTemplate(topic, templates) {
        // Простая логика выбора шаблона
        const topicLower = topic.toLowerCase();
        
        for (const template of templates) {
            for (const keyword of template.keywords) {
                if (topicLower.includes(keyword)) {
                    return template;
                }
            }
        }
        
        // Возвращаем общий шаблон по умолчанию
        return templates[0];
    }

    // Добавление базовых ключевых слов
    addBasicKeywords(slides) {
        return slides.map(slide => ({
            ...slide,
            autoKeywords: this.extractKeywordsLocally(slide.text)
        }));
    }

    // ===== УТИЛИТЫ =====

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

    // ===== КЭШИРОВАНИЕ =====

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

    // ===== КОНФИГУРАЦИЯ AI =====

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

    // Вызов AI API (заглушка для реального API)
    async callAIAPI(prompt, config) {
        // Здесь будет реальный вызов к AI API
        // Пока возвращаем mock-ответ для демонстрации
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки API
        
        // Определяем тип запроса
        const isStructuredRequest = prompt.includes('ОБЯЗАТЕЛЬНАЯ СТРУКТУРА') && prompt.includes('8-11 слайдов');
        const isAnalysisRequest = prompt.includes('Проведи глубокий анализ темы') && prompt.includes('"analysis"');
        const isCarouselRequest = prompt.includes('создай детальную обучающую Instagram-карусель') && prompt.includes('"slides"');
        const isKeywordRequest = prompt.includes('Извлеки') && prompt.includes('ключевых слов');
        
        // MOCK для структурированного контента (новый формат)
        if (isStructuredRequest) {
            const topic = prompt.match(/на тему "([^"]+)"/)?.[1] || 'неизвестная тема';
            
            return `{
                "topic": "${topic}",
                "slides": [
                    {
                        "title": "Hook",
                        "text": "95% людей в сфере '${topic}' совершают одну критическую ошибку.\n\nЭта ошибка стоит им месяцы потраченного времени и тысячи рублей.\n\nСегодня я покажу, как её избежать и получить результат в 3 раза быстрее.\n\nГотовы узнать секрет успеха?"
                    },
                    {
                        "title": "Problem", 
                        "text": "Большинство новичков в ${topic} начинают изучение хаотично.\n\nОни читают статьи, смотрят видео, но не видят прогресса.\n\nПричина: отсутствие системного подхода и четкого плана.\n\nРезультат - фрустрация и желание всё бросить."
                    },
                    {
                        "title": "Explanation",
                        "text": "Проблема кроется в особенностях работы нашего мозга.\n\nМозг не может эффективно обрабатывать разрозненную информацию.\n\nНужна структура: от простого к сложному, от теории к практике.\n\nБез системы знания не превращаются в навыки."
                    },
                    {
                        "title": "Value",
                        "text": "Правильный подход к изучению ${topic} даёт огромные преимущества:\n\n• Экономия времени в 5 раз\n• Быстрое достижение первых результатов\n• Уверенность в своих действиях\n• Возможность монетизировать навыки"
                    },
                    {
                        "title": "Example",
                        "text": "Реальная история: Анна изучала ${topic} 8 месяцев без результата.\n\nПрименив систему из 4 этапов, она достигла цели за 6 недель.\n\nСекрет - правильная последовательность и фокус на практике.\n\nСейчас она зарабатывает на своих знаниях 150 000 рублей в месяц."
                    },
                    {
                        "title": "Steps",
                        "text": "Проверенная система изучения ${topic} из 4 этапов:\n\n1. Основы и терминология (1 неделя)\n2. Базовые навыки и практика (3 недели)\n3. Продвинутые техники (2 недели)\n4. Реальные проекты и портфолио (постоянно)"
                    },
                    {
                        "title": "Mistakes",
                        "text": "Топ-3 ошибки, которые замедляют прогресс в ${topic}:\n\n1. Перфекционизм - ждут идеального момента для старта\n2. Теория без практики - читают, но не делают\n3. Отсутствие обратной связи - учатся в вакууме\n\nИзбегайте эти ловушки!"
                    },
                    {
                        "title": "Results",
                        "text": "Что вы получите, следуя системе:\n\nЧерез 2 недели: понимание основ и первые практические навыки\nЧерез месяц: уверенность в базовых техниках\nЧерез 2 месяца: способность решать реальные задачи\nЧерез 3 месяца: готовность к монетизации навыков"
                    },
                    {
                        "title": "Conclusion",
                        "text": "Главные принципы успеха в ${topic}:\n\n• Системность важнее скорости\n• Практика ценнее теории\n• Обратная связь ускоряет рост\n• Постоянство побеждает интенсивность\n\nПомните: каждый эксперт когда-то был новичком."
                    },
                    {
                        "title": "CTA",
                        "text": "Готовы начать свой путь в ${topic}?\n\nВыберите один совет из поста и примените его сегодня.\n\nПоделитесь в комментариях своим планом действий.\n\nСохраните пост и возвращайтесь к нему каждую неделю для контроля прогресса."
                    }
                ]
            }`;
        }
        
        // MOCK для анализа темы
        if (isAnalysisRequest) {
            const topic = prompt.match(/анализ темы: "([^"]+)"/)?.[1] || 'неизвестная тема';
            
            return `{
                "analysis": [
                    "ПРОБЛЕМА: Большинство людей в сфере '${topic}' сталкиваются с информационной перегрузкой и не знают, с чего начать. 95% новичков бросают попытки в первые 30 дней из-за отсутствия четкого плана действий.",
                    "ПРИЧИНА: Отсутствует системный подход к изучению '${topic}'. Люди хватаются за разрозненную информацию из разных источников, не понимая основ и последовательности действий.",
                    "РЕШЕНИЕ: Пошаговая система изучения '${topic}' с четкими этапами, практическими заданиями и измеримыми результатами. Фокус на основах, затем постепенное усложнение."
                ]
            }`;
        }
        
        // MOCK для карусели
        if (isCarouselRequest) {
            const topic = prompt.match(/Тема: "([^"]+)"/)?.[1] || 'неизвестная тема';
            
            return `{
                "topic": "${topic}",
                "slides": [
                    {
                        "title": "Hook",
                        "text": "95% людей делают одну критическую ошибку в ${topic}.\n\nЭта ошибка стоит им месяцы потраченного времени.\n\nСегодня я покажу, как её избежать и получить результат в 3 раза быстрее."
                    },
                    {
                        "title": "Problem", 
                        "text": "Большинство новичков в ${topic} начинают не с того.\n\nОни изучают сложные техники, не освоив основы.\n\nРезультат: фрустрация, потеря мотивации, отказ от цели."
                    },
                    {
                        "title": "Solution",
                        "text": "Есть проверенная система из 4 этапов:\n\n1. Освоение основ (30% времени)\n2. Практика базовых навыков (40%)\n3. Изучение продвинутых техник (20%)\n4. Постоянное совершенствование (10%)"
                    },
                    {
                        "title": "Steps",
                        "text": "Шаг 1: Определите свою цель в ${topic}\n\nШаг 2: Изучите 3 основных принципа\n\nШаг 3: Практикуйтесь 15 минут ежедневно\n\nШаг 4: Отслеживайте прогресс еженедельно"
                    },
                    {
                        "title": "CTA",
                        "text": "Начните с первого шага уже сегодня!\n\nПоделитесь в комментариях: какая ваша цель в ${topic}?\n\nСохраните пост и возвращайтесь к нему каждую неделю."
                    }
                ]
            }`;
        }
        
        // MOCK для ключевых слов (улучшенная версия)
        if (isKeywordRequest) {
            // Извлекаем текст из промпта для анализа
            const textMatch = prompt.match(/"([^"]+)"/);
            const text = textMatch ? textMatch[1] : '';
            
            // Генерируем релевантные ключевые слова на основе текста
            const mockKeywords = this.generateMockKeywords(text);
            
            return `{
                "keywords": ${JSON.stringify(mockKeywords)}
            }`;
        }
        
        // Fallback
        throw new Error('Mock AI API: неизвестный тип запроса');
    }

    // Генерация mock ключевых слов на основе текста
    generateMockKeywords(text) {
        const keywords = [];
        
        // Словарь ключевых слов по темам
        const keywordDictionary = {
            'продуктивность': ['эффективность', 'результат', 'система', 'планирование', 'фокус', 'цели'],
            'бизнес': ['стратегия', 'прибыль', 'клиенты', 'продажи', 'маркетинг', 'развитие'],
            'здоровье': ['питание', 'тренировки', 'энергия', 'баланс', 'привычки', 'самочувствие'],
            'образование': ['знания', 'навыки', 'обучение', 'развитие', 'компетенции', 'практика'],
            'финансы': ['инвестиции', 'доходы', 'экономия', 'планирование', 'капитал', 'прибыль'],
            'технологии': ['инновации', 'автоматизация', 'эффективность', 'решения', 'системы', 'процессы']
        };
        
        // Определяем тему по ключевым словам в тексте
        const lowerText = text.toLowerCase();
        let selectedKeywords = [];
        
        for (const [theme, themeKeywords] of Object.entries(keywordDictionary)) {
            if (lowerText.includes(theme)) {
                selectedKeywords = themeKeywords;
                break;
            }
        }
        
        // Если тема не определена, используем общие ключевые слова
        if (selectedKeywords.length === 0) {
            selectedKeywords = ['результат', 'система', 'практика', 'основы', 'навыки', 'цель'];
        }
        
        // Добавляем ключевые слова, найденные в тексте
        const textWords = lowerText.match(/[а-яё]{4,}/g) || [];
        const meaningfulWords = textWords.filter(word => {
            return !['этот', 'который', 'может', 'должен', 'будет', 'есть', 'была', 'было', 'были'].includes(word);
        });
        
        // Объединяем тематические и найденные ключевые слова
        const allKeywords = [...selectedKeywords, ...meaningfulWords.slice(0, 3)];
        
        // Возвращаем 3-6 уникальных ключевых слов
        const uniqueKeywords = [...new Set(allKeywords)];
        return uniqueKeywords.slice(0, Math.min(6, Math.max(3, uniqueKeywords.length)));
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ ВЫСОКОКАЧЕСТВЕННОЙ ГЕНЕРАЦИИ =====

    // Получение базового анализа темы (fallback)
    getDefaultAnalysis(topic) {
        return {
            audience: `Люди, интересующиеся темой "${topic}"`,
            mainPain: `Отсутствие четкого понимания и практических навыков в области "${topic}"`,
            keyValue: `Получение структурированных знаний и практических инструментов для успеха в "${topic}"`,
            emotionalTriggers: ['страх упустить возможность', 'желание быстрого результата', 'потребность в экспертности'],
            recommendedSlides: 10,
            structure: [
                {"type": "hook", "purpose": "зацепить внимание"},
                {"type": "problem", "purpose": "показать боль"},
                {"type": "why", "purpose": "объяснить важность"},
                {"type": "insight", "purpose": "дать ага-момент"},
                {"type": "how", "purpose": "объяснить механизм"},
                {"type": "details", "purpose": "углубить понимание"},
                {"type": "example", "purpose": "показать на примере"},
                {"type": "mistake", "purpose": "предупредить об ошибках"},
                {"type": "conclusion", "purpose": "подвести итоги"},
                {"type": "cta", "purpose": "призвать к действию"}
            ]
        };
    }

    // Генерация fallback контента
    generateFallbackContent(topic, analysis) {
        console.log('🏠 Генерация fallback контента для:', topic);
        
        const fallbackSlides = [
            {
                title: "Hook",
                text: `95% людей в сфере "${topic}" совершают одну критическую ошибку.\n\nЭта ошибка стоит им месяцы потраченного времени и тысячи рублей.\n\nСегодня я покажу, как её избежать и получить результат в 3 раза быстрее.\n\nГотовы узнать секрет успеха?`
            },
            {
                title: "Problem",
                text: `Большинство новичков в "${topic}" начинают изучение хаотично.\n\nОни читают статьи, смотрят видео, но не видят прогресса.\n\nПричина: отсутствие системного подхода и четкого плана.\n\nРезультат - фрустрация и желание всё бросить.`
            },
            {
                title: "Why",
                text: `Почему это критически важно понимать?\n\nБез правильного подхода к "${topic}" вы потеряете не только время.\n\nВы упустите возможности, которые могли бы изменить вашу жизнь.\n\nКаждый день промедления - это шаг назад от ваших целей.`
            },
            {
                title: "Insight",
                text: `Вот ключевое понимание, которое меняет всё:\n\nУспех в "${topic}" зависит не от количества информации, а от качества её применения.\n\n80% результата дают 20% правильных действий.\n\nНужно знать эти 20% и сосредоточиться на них.`
            },
            {
                title: "How",
                text: `Как это работает на практике?\n\nМозг лучше усваивает информацию, когда она структурирована.\n\nПоследовательность "теория → практика → анализ → корректировка" даёт максимальный результат.\n\nЭто научно доказанный подход к обучению.`
            },
            {
                title: "Details",
                text: `Детали системы изучения "${topic}":\n\n1. Основы и терминология (20% времени)\n2. Базовые навыки и практика (50%)\n3. Продвинутые техники (20%)\n4. Реальные проекты (10%)\n\nКаждый этап строится на предыдущем.`
            },
            {
                title: "Example",
                text: `Реальный пример: Анна изучала "${topic}" 8 месяцев без результата.\n\nПрименив эту систему, она достигла цели за 6 недель.\n\nСекрет - правильная последовательность и фокус на практике.\n\nСейчас она зарабатывает на своих знаниях 150 000 рублей в месяц.`
            },
            {
                title: "Mistake",
                text: `Главная ошибка в изучении "${topic}" - перфекционизм.\n\nЛюди ждут идеального момента для старта или идеального плана.\n\nНо совершенство - враг прогресса.\n\nЛучше начать с 80% готовности, чем не начать вообще.`
            },
            {
                title: "Conclusion",
                text: `Главные принципы успеха в "${topic}":\n\n• Системность важнее скорости\n• Практика ценнее теории\n• Постоянство побеждает интенсивность\n• Обратная связь ускоряет рост\n\nПомните: каждый эксперт когда-то был новичком.`
            },
            {
                title: "CTA",
                text: `Готовы начать свой путь в "${topic}"?\n\nВыберите один совет из поста и примените его сегодня.\n\nПоделитесь в комментариях своим планом действий.\n\nСохраните пост и возвращайтесь к нему каждую неделю для контроля прогресса.`
            }
        ];

        return {
            topic: topic,
            slides: fallbackSlides
        };
    }

    // Парсинг и валидация вовлекающего контента
    parseAndValidateEngagingContent(response, topic) {
        try {
            const cleanedResponse = this.cleanAIResponse(response);
            
            if (!cleanedResponse) {
                throw new Error('Empty response from AI');
            }

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleanedResponse);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error(`Invalid JSON format: ${parseError.message}`);
            }

            // Валидируем структуру
            if (!parsedResponse || typeof parsedResponse !== 'object') {
                throw new Error('Response is not an object');
            }

            if (!parsedResponse.slides || !Array.isArray(parsedResponse.slides)) {
                throw new Error('Missing or invalid slides array');
            }

            if (parsedResponse.slides.length < 9 || parsedResponse.slides.length > 11) {
                console.warn(`⚠️ Неправильное количество слайдов: ${parsedResponse.slides.length}, ожидалось 9-11`);
            }

            // Валидируем каждый слайд на соответствие требованиям
            parsedResponse.slides.forEach((slide, index) => {
                if (!slide || typeof slide !== 'object') {
                    throw new Error(`Slide ${index + 1} is not an object`);
                }
                
                if (!slide.text || typeof slide.text !== 'string' || slide.text.trim().length === 0) {
                    throw new Error(`Slide ${index + 1} has invalid text`);
                }
                
                // Проверяем количество предложений (должно быть 3-5)
                const sentences = slide.text.split(/[.!?]+/).filter(s => s.trim().length > 10);
                if (sentences.length < 3) {
                    console.warn(`⚠️ Слайд ${index + 1} содержит менее 3 предложений: ${sentences.length}`);
                }
                
                // Проверяем на повторяющиеся фразы
                if (this.hasRepetitiveContent(slide.text, parsedResponse.slides, index)) {
                    console.warn(`⚠️ Слайд ${index + 1} содержит повторяющийся контент`);
                }
                
                // Обеспечиваем наличие title
                if (!slide.title) {
                    slide.title = this.getSlideTypeByIndex(index);
                }
                
                // Ограничиваем длину текста
                if (slide.text.length > 800) {
                    slide.text = slide.text.substring(0, 797) + '...';
                }
            });

            // Обеспечиваем наличие topic
            if (!parsedResponse.topic) {
                parsedResponse.topic = topic;
            }

            console.log(`✅ Вовлекающий контент валиден: ${parsedResponse.slides.length} слайдов`);
            return parsedResponse;

        } catch (error) {
            console.error('❌ Validation error:', error.message);
            throw error;
        }
    }

    // Проверка на повторяющийся контент
    hasRepetitiveContent(currentText, allSlides, currentIndex) {
        const currentWords = currentText.toLowerCase().split(/\s+/);
        const currentPhrases = this.extractPhrases(currentWords, 3); // Фразы из 3 слов
        
        for (let i = 0; i < allSlides.length; i++) {
            if (i === currentIndex) continue;
            
            const otherText = allSlides[i].text.toLowerCase();
            const otherWords = otherText.split(/\s+/);
            const otherPhrases = this.extractPhrases(otherWords, 3);
            
            // Проверяем пересечение фраз
            const intersection = currentPhrases.filter(phrase => otherPhrases.includes(phrase));
            if (intersection.length > 2) { // Более 2 одинаковых фраз
                return true;
            }
        }
        
        return false;
    }

    // Извлечение фраз из слов
    extractPhrases(words, length) {
        const phrases = [];
        for (let i = 0; i <= words.length - length; i++) {
            phrases.push(words.slice(i, i + length).join(' '));
        }
        return phrases;
    }

    // Определение типа слайда по индексу
    getSlideType(index, totalSlides) {
        const types = ['hook', 'problem', 'why', 'insight', 'how', 'details', 'example', 'mistake', 'conclusion', 'cta'];
        return types[index] || `slide_${index + 1}`;
    }

    // Получение названия типа слайда по индексу
    getSlideTypeByIndex(index) {
        const titles = ['Hook', 'Problem', 'Why', 'Insight', 'How', 'Details', 'Example', 'Mistake', 'Conclusion', 'CTA'];
        return titles[index] || `Slide ${index + 1}`;
    }

    // Расчет оценки качества слайда
    calculateQualityScore(text) {
        let score = 0;
        
        // Базовый балл за длину текста (оптимально 200-600 символов)
        const length = text.length;
        if (length >= 200 && length <= 600) {
            score += 20;
        } else if (length >= 100 && length <= 800) {
            score += 10;
        }
        
        // Балл за количество предложений (оптимально 3-5)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length >= 3 && sentences.length <= 5) {
            score += 15;
        } else if (sentences.length >= 2 && sentences.length <= 6) {
            score += 8;
        }
        
        // Балл за наличие конкретных цифр и фактов
        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            score += Math.min(numbers.length * 3, 15);
        }
        
        // Балл за эмоциональные слова
        const emotionalWords = [
            'успех', 'результат', 'эффект', 'прогресс', 'достижение',
            'проблема', 'ошибка', 'трудность', 'препятствие', 'вызов',
            'секрет', 'тайна', 'открытие', 'инсайт', 'понимание',
            'быстро', 'легко', 'просто', 'эффективно', 'мощно'
        ];
        
        const foundEmotional = emotionalWords.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        score += Math.min(foundEmotional * 2, 10);
        
        // Балл за структурированность (наличие переносов строк)
        const lineBreaks = (text.match(/\n/g) || []).length;
        if (lineBreaks >= 2) {
            score += 10;
        } else if (lineBreaks >= 1) {
            score += 5;
        }
        
        // Балл за призывы к действию
        const actionWords = ['начните', 'попробуйте', 'применяйте', 'используйте', 'делайте'];
        const foundActions = actionWords.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        score += Math.min(foundActions * 3, 10);
        
        // Штраф за повторяющиеся слова
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const repetitionRatio = words.length / uniqueWords.size;
        if (repetitionRatio > 1.5) {
            score -= 10;
        }
        
        // Максимальный балл 100
        return Math.min(Math.max(score, 0), 100);
    }

    // Очистка ответа AI от мусора
    cleanAIResponse(response) {
        if (typeof response !== 'string') {
            return response;
        }
        
        let cleaned = response.trim();
        
        // Убираем markdown блоки
        cleaned = cleaned.replace(/```json\s*/gi, '');
        cleaned = cleaned.replace(/```\s*/gi, '');
        
        // Убираем лишний текст до и после JSON
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }
        
        // Убираем комментарии в JSON
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        cleaned = cleaned.replace(/\/\/.*$/gm, '');
        
        // Исправляем частые ошибки в JSON
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Убираем лишние запятые
        cleaned = cleaned.replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Добавляем кавычки к ключам
        
        return cleaned.trim();
    }

    // Добавление базовых ключевых слов для локальных слайдов
    addBasicKeywords(slides) {
        return slides.map(slide => ({
            ...slide,
            autoKeywords: this.extractKeywordsFromText(slide.text || slide.subtitle || '').slice(0, 5)
        }));
    }

    // Обновление прогресса загрузки
    updateLoadingProgress(message, percent) {
        console.log(`📊 ${percent}%: ${message}`);
        
        // Отправляем событие для UI
        if (typeof document !== 'undefined') {
            const progressEvent = new CustomEvent('aiGenerationProgress', {
                detail: { message, percent }
            });
            document.dispatchEvent(progressEvent);
        }
    }

    // Кэширование слайдов
    cacheSlides(topic, slides) {
        try {
            const cacheKey = this.getCacheKey(topic);
            const cacheData = {
                slides,
                timestamp: Date.now(),
                topic
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log(`💾 Слайды кэшированы для темы: ${topic}`);
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
            const age = Date.now() - cacheData.timestamp;
            
            // Кэш действителен 24 часа
            if (age > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.slides;
        } catch (error) {
            console.warn('⚠️ Ошибка чтения кэша:', error);
            return null;
        }
    }

    // ===== PRO MODE HELPER METHODS =====

    // Парсинг ответа outline от AI
    parseOutlineResponse(response) {
        try {
            const cleanContent = this.cleanAIResponse(response);
            const parsed = JSON.parse(cleanContent);
            
            if (!parsed.outline || !Array.isArray(parsed.outline)) {
                throw new Error('Некорректная структура outline');
            }
            
            return parsed;
        } catch (error) {
            console.error('❌ Ошибка парсинга outline:', error);
            throw error;
        }
    }

    // Парсинг ответа контента от AI
    parseContentResponse(response) {
        try {
            const cleanContent = this.cleanAIResponse(response);
            const parsed = JSON.parse(cleanContent);
            
            if (!parsed.slides || !Array.isArray(parsed.slides)) {
                throw new Error('Некорректная структура контента');
            }
            
            return parsed;
        } catch (error) {
            console.error('❌ Ошибка парсинга контента:', error);
            throw error;
        }
    }

    // Очистка ответа AI от markdown и лишних символов
    cleanAIResponse(response) {
        let content = '';
        
        // Извлекаем текст из разных форматов ответа AI
        if (typeof response === 'string') {
            content = response;
        } else if (response && response.candidates && response.candidates[0]) {
            content = response.candidates[0].content.parts[0].text;
        } else if (response && response.content) {
            content = response.content;
        } else {
            throw new Error('Неизвестный формат ответа AI');
        }
        
        // Убираем markdown блоки и лишние символы
        return content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^\s*[\r\n]/gm, '')
            .trim();
    }

    // Валидация качества outline
    validateOutlineQuality(outline) {
        console.log('🔍 Валидация качества outline...');
        
        const checks = {
            // Проверка количества слайдов (10-11)
            slideCount: outline.outline && outline.outline.length >= 10 && outline.outline.length <= 11,
            
            // Проверка наличия обязательных типов слайдов
            hasHook: outline.outline && outline.outline.some(slide => slide.type === 'hook'),
            hasPain: outline.outline && outline.outline.some(slide => slide.type === 'pain'),
            hasValue: outline.outline && outline.outline.some(slide => slide.type === 'value'),
            hasInsights: outline.outline && outline.outline.some(slide => slide.type === 'insights'),
            hasConclusion: outline.outline && outline.outline.some(slide => slide.type === 'conclusion'),
            
            // Проверка наличия основных полей
            hasMainIdeas: outline.outline && outline.outline.every(slide => 
                slide.mainIdea && slide.mainIdea.length > 10
            ),
            hasPurposes: outline.outline && outline.outline.every(slide => 
                slide.purpose && slide.purpose.length > 5
            ),
            hasConnections: outline.outline && outline.outline.every(slide => 
                slide.connectionToPrevious && slide.connectionToPrevious.length > 3
            )
        };
        
        const passedChecks = Object.values(checks).filter(check => check).length;
        const totalChecks = Object.keys(checks).length;
        
        console.log(`📊 Outline качество: ${passedChecks}/${totalChecks} проверок пройдено`);
        
        // Требуем минимум 75% успешных проверок
        return passedChecks >= Math.ceil(totalChecks * 0.75);
    }

    // Валидация качества контента
    validateContentQuality(content) {
        console.log('🔍 Валидация качества контента...');
        
        const checks = {
            // Проверка количества слайдов
            slideCount: content.slides && content.slides.length >= 10 && content.slides.length <= 11,
            
            // Проверка длины текста каждого слайда (2-4 строки)
            textLength: content.slides && content.slides.every(slide => {
                const lines = slide.text.split('\n').filter(line => line.trim().length > 0);
                return lines.length >= 2 && lines.length <= 4;
            }),
            
            // Проверка наличия заголовков
            hasTitles: content.slides && content.slides.every(slide => 
                slide.title && slide.title.length > 0 && slide.title.length <= 50
            ),
            
            // Проверка уникальности контента
            uniqueContent: content.slides && this.checkContentUniqueness(content.slides),
            
            // Проверка наличия конкретики (цифры, факты)
            hasSpecifics: content.slides && content.slides.some(slide => 
                /\d+/.test(slide.text) || /\%/.test(slide.text)
            ),
            
            // Проверка типов ключевых слов
            hasKeywordTypes: content.slides && content.slides.every(slide => 
                slide.keywordType && ['emotional', 'conceptual', 'action', 'technical'].includes(slide.keywordType)
            )
        };
        
        const passedChecks = Object.values(checks).filter(check => check).length;
        const totalChecks = Object.keys(checks).length;
        
        console.log(`📊 Контент качество: ${passedChecks}/${totalChecks} проверок пройдено`);
        
        // Требуем минимум 80% успешных проверок
        return passedChecks >= Math.ceil(totalChecks * 0.8);
    }

    // Генерация fallback outline
    generateFallbackOutline(topic) {
        console.log('🔄 Генерация fallback outline для темы:', topic);
        
        return {
            topic: topic,
            totalSlides: 11,
            structure: "hook → pain → value → insights → conclusion",
            outline: [
                {
                    slideNumber: 1,
                    type: "hook",
                    mainIdea: `Провокационный факт о ${topic}`,
                    purpose: "Привлечь внимание и заинтриговать",
                    connectionToPrevious: "Начальный слайд"
                },
                {
                    slideNumber: 2,
                    type: "pain",
                    mainIdea: `Основная проблема в ${topic}`,
                    purpose: "Показать боль аудитории",
                    connectionToPrevious: "Развиваем интригу из hook"
                },
                {
                    slideNumber: 3,
                    type: "pain",
                    mainIdea: `Последствия игнорирования ${topic}`,
                    purpose: "Усилить эмоциональное воздействие",
                    connectionToPrevious: "Углубляем понимание проблемы"
                },
                {
                    slideNumber: 4,
                    type: "value",
                    mainIdea: `Первое ключевое решение для ${topic}`,
                    purpose: "Дать практическую ценность",
                    connectionToPrevious: "Переход от проблемы к решению"
                },
                {
                    slideNumber: 5,
                    type: "value",
                    mainIdea: `Второе важное решение для ${topic}`,
                    purpose: "Расширить набор инструментов",
                    connectionToPrevious: "Дополняем первое решение"
                },
                {
                    slideNumber: 6,
                    type: "value",
                    mainIdea: `Третье решение с примером для ${topic}`,
                    purpose: "Показать применение на практике",
                    connectionToPrevious: "Конкретизируем решения"
                },
                {
                    slideNumber: 7,
                    type: "value",
                    mainIdea: `Четвертое решение с результатами для ${topic}`,
                    purpose: "Доказать эффективность",
                    connectionToPrevious: "Подкрепляем доказательствами"
                },
                {
                    slideNumber: 8,
                    type: "insights",
                    mainIdea: `Неожиданный инсайт о ${topic}`,
                    purpose: "Дать ага-момент",
                    connectionToPrevious: "Переход к глубокому пониманию"
                },
                {
                    slideNumber: 9,
                    type: "insights",
                    mainIdea: `Скрытая закономерность в ${topic}`,
                    purpose: "Показать экспертность",
                    connectionToPrevious: "Развиваем инсайт"
                },
                {
                    slideNumber: 10,
                    type: "conclusion",
                    mainIdea: `Главные выводы о ${topic}`,
                    purpose: "Резюмировать ключевые моменты",
                    connectionToPrevious: "Подводим итоги"
                },
                {
                    slideNumber: 11,
                    type: "conclusion",
                    mainIdea: `Призыв к действию по ${topic}`,
                    purpose: "Мотивировать к применению",
                    connectionToPrevious: "Переводим знания в действие"
                }
            ]
        };
    }

    // Генерация fallback контента
    generateFallbackContent(topic, outline) {
        console.log('🔄 Генерация fallback контента для темы:', topic);
        
        const fallbackSlides = outline.outline.map((outlineSlide, index) => {
            const slideTexts = {
                hook: `${topic} — это не то, что вы думаете.\nБольшинство людей делают критическую ошибку.\nСейчас покажу, как это исправить.`,
                pain: `Проблема в том, что многие не понимают ${topic}.\nЭто приводит к потерянному времени.\nИ к разочарованию в результатах.`,
                value: `Вот что действительно работает в ${topic}:\nПроверенный метод с конкретными шагами.\nРезультат виден уже через неделю.`,
                insights: `Секрет ${topic} в том, что мало кто знает:\nЭто не про сложные техники.\nЭто про правильный подход.`,
                conclusion: `Главное в ${topic} — начать действовать.\nИспользуйте эти знания уже сегодня.\nРезультат не заставит себя ждать.`
            };
            
            const keywordTypes = {
                hook: 'emotional',
                pain: 'emotional', 
                value: 'action',
                insights: 'conceptual',
                conclusion: 'action'
            };
            
            return {
                slideNumber: outlineSlide.slideNumber,
                type: outlineSlide.type,
                title: `${outlineSlide.type.charAt(0).toUpperCase() + outlineSlide.type.slice(1)}`,
                text: slideTexts[outlineSlide.type] || `Контент для слайда ${index + 1} о ${topic}.\nВажная информация по теме.\nПрактические советы и рекомендации.`,
                keywordType: keywordTypes[outlineSlide.type] || 'conceptual'
            };
        });
        
        return {
            topic: topic,
            slides: fallbackSlides
        };
    }

    // Публичный метод для PRO MODE генерации (используется из UI)
    async generateProModeSlides(topic) {
        console.log('🚀 Запуск PRO MODE генерации слайдов для темы:', topic);
        
        try {
            // Используем PRO MODE генерацию
            const proResult = await this.generateProModeCarousel(topic);
            
            console.log('🔍 PRO MODE результат:', proResult);
            
            // Проверяем структуру результата
            if (!proResult || !proResult.slides || !Array.isArray(proResult.slides)) {
                throw new Error('PRO MODE вернул некорректную структуру данных');
            }
            
            // Передаем результат в StateManager для создания слайдов
            const success = this.state.createSlidesFromAI(proResult);
            
            if (success) {
                console.log('✅ PRO MODE слайды успешно созданы и переданы в StateManager');
                return {
                    success: true,
                    slidesCount: proResult.slides.length,
                    topic: topic,
                    mode: 'pro_carousel_generation',
                    outline: proResult.outline
                };
            } else {
                throw new Error('Не удалось создать слайды в StateManager');
            }
            
        } catch (error) {
            console.error('❌ Ошибка PRO MODE генерации:', error);
            
            // Fallback на storytelling генерацию
            try {
                console.log('🔄 Переход на storytelling генерацию...');
                const fallbackResult = await this.generateStorytellingCarousel(topic);
                
                const success = this.state.createSlidesFromAI(fallbackResult);
                
                if (success) {
                    console.log('✅ Storytelling слайды созданы как fallback');
                    return {
                        success: true,
                        slidesCount: fallbackResult.slides.length,
                        topic: topic,
                        mode: 'storytelling_fallback'
                    };
                }
            } catch (fallbackError) {
                console.error('❌ Ошибка fallback генерации:', fallbackError);
            }
            
            throw error;
        }
    }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIManager;
} else if (typeof window !== 'undefined') {
    window.AIManager = AIManager;
}