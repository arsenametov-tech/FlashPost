// ===== AI MODULE (FIXED VERSION) =====
// Handles AI integration and keyword extraction

class AIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.apiKey = null; // Будет установлен при настройке
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        console.log('✅ AIManager (fixed) инициализирован');
    }

    // Проверка доступности AI
    isAvailable() {
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
                generatedBy: 'AI-Fixed',
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
            // Используем PRO MODE генерацию
            return await this.generateProModeCarousel(topic);
            
        } catch (error) {
            console.error('❌ Ошибка PRO MODE генерации, переход на storytelling:', error);
            
            try {
                // Fallback на storytelling генерацию
                return await this.generateStorytellingCarousel(topic);
            } catch (storytellingError) {
                console.error('❌ Ошибка storytelling генерации, переход на стандартную:', storytellingError);
                
                try {
                    // Финальный fallback на стандартную генерацию
                    return await this.generateCarousel(topic);
                } catch (fallbackError) {
                    console.error('❌ Ошибка fallback генерации:', fallbackError);
                    // Возвращаем минимальную заглушку
                    return this.generateFallbackCarousel(topic);
                }
            }
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

    // Storytelling генерация карусели
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