// ===== TEMPLATE MANAGER MODULE =====
// Handles template save/apply functionality for carousel slides

class TemplateManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.storageKey = 'flashpost_templates';
        console.log('✅ TemplateManager инициализирован');
    }

    // ===== TEMPLATE CREATION =====

    // Создание шаблона из текущего слайда
    createTemplateFromSlide(slideId, templateName) {
        const slide = this.state.getSlideById(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден для создания шаблона`);
            return null;
        }

        const template = {
            id: this.generateTemplateId(),
            name: templateName,
            createdAt: Date.now(),
            
            // Фон слайда
            background: {
                type: slide.background.type,
                color: slide.background.color,
                image: slide.background.image,
                x: slide.background.x,
                y: slide.background.y,
                brightness: slide.background.brightness
            },
            
            // Макет и стили текстовых блоков (БЕЗ содержимого)
            textBlocksLayout: slide.textBlocks.map(block => ({
                // Позиционирование
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                rotation: block.rotation,
                zIndex: block.zIndex,
                
                // Стили шрифта
                font: block.font,
                size: block.size,
                weight: block.weight,
                style: block.style,
                
                // Цвета
                color: block.color,
                backgroundColor: block.backgroundColor,
                
                // Выравнивание и форматирование
                textAlign: block.textAlign,
                lineHeight: block.lineHeight,
                letterSpacing: block.letterSpacing,
                wordSpacing: block.wordSpacing,
                
                // Эффекты
                effects: {
                    shadow: { ...(block.effects?.shadow || {}) },
                    outline: { ...(block.effects?.outline || {}) },
                    glow: { ...(block.effects?.glow || {}) },
                    gradient: { ...(block.effects?.gradient || {}) }
                },
                
                // Настройки ключевых слов (структура, но не содержимое)
                keywordHighlighting: {
                    autoHighlight: block.keywordHighlighting?.autoHighlight || false,
                    keywordColor: block.keywordHighlighting?.keywordColor || '#ff0000',
                    autoKeywordColor: block.keywordHighlighting?.autoKeywordColor || '#0000ff',
                    glowEnabled: block.keywordHighlighting?.glowEnabled || false,
                    glowIntensity: block.keywordHighlighting?.glowIntensity || 0.5
                },
                
                // Дополнительные свойства
                opacity: block.opacity
            }))
        };

        console.log(`✅ Создан шаблон "${templateName}" из слайда ${slideId}`);
        return template;
    }

    // ===== TEMPLATE STORAGE =====

    // Сохранение шаблона в localStorage
    saveTemplate(template) {
        try {
            const templates = this.getTemplatesFromStorage();
            
            // Проверяем, не существует ли уже шаблон с таким именем
            const existingIndex = templates.findIndex(t => t.name === template.name);
            
            if (existingIndex !== -1) {
                // Обновляем существующий шаблон
                templates[existingIndex] = template;
                console.log(`🔄 Обновлен существующий шаблон: ${template.name}`);
            } else {
                // Добавляем новый шаблон
                templates.push(template);
                console.log(`➕ Добавлен новый шаблон: ${template.name}`);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            return false;
        }
    }

    // Получение всех шаблонов из localStorage
    getTemplatesFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблонов:', error);
            return [];
        }
    }

    // Получение шаблона по ID
    getTemplateById(templateId) {
        const templates = this.getTemplatesFromStorage();
        return templates.find(t => t.id === templateId) || null;
    }

    // Удаление шаблона
    deleteTemplate(templateId) {
        try {
            const templates = this.getTemplatesFromStorage();
            const filteredTemplates = templates.filter(t => t.id !== templateId);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredTemplates));
            console.log(`🗑️ Удален шаблон: ${templateId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка удаления шаблона:', error);
            return false;
        }
    }

    // ===== TEMPLATE APPLICATION =====

    // Применение шаблона к слайду
    applyTemplateToSlide(templateId, slideId, preserveText = true) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            console.warn(`⚠️ Шаблон ${templateId} не найден`);
            return false;
        }

        const slide = this.state.getSlideById(slideId);
        if (!slide) {
            console.warn(`⚠️ Слайд ${slideId} не найден`);
            return false;
        }

        try {
            // Сохраняем текущий контент если нужно
            const currentTexts = preserveText ? slide.textBlocks.map(block => ({
                text: block.text,
                autoKeywords: slide.autoKeywords || []
            })) : [];

            // Применяем фон из шаблона
            slide.background = {
                type: template.background.type,
                color: template.background.color,
                image: template.background.image,
                x: template.background.x,
                y: template.background.y,
                brightness: template.background.brightness
            };

            // Очищаем текущие блоки
            slide.textBlocks = [];

            // Создаем новые блоки на основе шаблона
            template.textBlocksLayout.forEach((layoutBlock, index) => {
                const newBlock = {
                    id: this.state.generateUID(),
                    
                    // Текст: либо сохраненный, либо заглушка
                    text: (preserveText && currentTexts[index]) ? 
                          currentTexts[index].text : 
                          `Текст блока ${index + 1}`,
                    
                    // Позиционирование из шаблона
                    x: layoutBlock.x,
                    y: layoutBlock.y,
                    width: layoutBlock.width,
                    height: layoutBlock.height,
                    rotation: layoutBlock.rotation,
                    zIndex: layoutBlock.zIndex,
                    
                    // Стили шрифта из шаблона
                    font: layoutBlock.font,
                    size: layoutBlock.size,
                    weight: layoutBlock.weight,
                    style: layoutBlock.style,
                    
                    // Цвета из шаблона
                    color: layoutBlock.color,
                    backgroundColor: layoutBlock.backgroundColor,
                    
                    // Выравнивание из шаблона
                    textAlign: layoutBlock.textAlign,
                    lineHeight: layoutBlock.lineHeight,
                    letterSpacing: layoutBlock.letterSpacing,
                    wordSpacing: layoutBlock.wordSpacing,
                    
                    // Эффекты из шаблона
                    effects: {
                        shadow: { ...(layoutBlock.effects?.shadow || {}) },
                        outline: { ...(layoutBlock.effects?.outline || {}) },
                        glow: { ...(layoutBlock.effects?.glow || {}) },
                        gradient: { ...(layoutBlock.effects?.gradient || {}) }
                    },
                    
                    // Настройки ключевых слов из шаблона
                    keywordHighlighting: {
                        autoHighlight: layoutBlock.keywordHighlighting?.autoHighlight || false,
                        keywordColor: layoutBlock.keywordHighlighting?.keywordColor || '#ff0000',
                        autoKeywordColor: layoutBlock.keywordHighlighting?.autoKeywordColor || '#0000ff',
                        glowEnabled: layoutBlock.keywordHighlighting?.glowEnabled || false,
                        glowIntensity: layoutBlock.keywordHighlighting?.glowIntensity || 0.5
                    },
                    
                    // Дополнительные свойства
                    opacity: layoutBlock.opacity,
                    
                    // Метаданные
                    isEditing: false,
                    lastModified: Date.now(),
                    version: 1
                };

                slide.textBlocks.push(newBlock);
            });

            console.log(`✅ Шаблон "${template.name}" применен к слайду ${slideId}`);
            return true;

        } catch (error) {
            console.error('❌ Ошибка применения шаблона:', error);
            return false;
        }
    }

    // Применение шаблона ко всем слайдам
    applyTemplateToAllSlides(templateId, preserveText = true) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            console.warn(`⚠️ Шаблон ${templateId} не найден`);
            return false;
        }

        const slides = this.state.getAllSlides();
        let successCount = 0;

        slides.forEach(slide => {
            if (this.applyTemplateToSlide(templateId, slide.id, preserveText)) {
                successCount++;
            }
        });

        console.log(`✅ Шаблон "${template.name}" применен к ${successCount}/${slides.length} слайдам`);
        return successCount === slides.length;
    }

    // ===== HIGH-LEVEL METHODS =====

    // Сохранение текущего слайда как шаблона
    saveCurrentSlideAsTemplate(templateName) {
        const activeSlide = this.state.getActiveSlide();
        if (!activeSlide) {
            console.warn('⚠️ Нет активного слайда для сохранения как шаблон');
            return false;
        }

        const template = this.createTemplateFromSlide(activeSlide.id, templateName);
        if (!template) {
            return false;
        }

        return this.saveTemplate(template);
    }

    // Применение шаблона к текущему слайду
    applyTemplateToCurrentSlide(templateId, preserveText = true) {
        const activeSlide = this.state.getActiveSlide();
        if (!activeSlide) {
            console.warn('⚠️ Нет активного слайда для применения шаблона');
            return false;
        }

        return this.applyTemplateToSlide(templateId, activeSlide.id, preserveText);
    }

    // ===== UTILITY METHODS =====

    // Генерация уникального ID для шаблона
    generateTemplateId() {
        return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Получение статистики шаблонов
    getTemplateStats() {
        const templates = this.getTemplatesFromStorage();
        return {
            total: templates.length,
            newest: templates.length > 0 ? templates.reduce((newest, template) => 
                template.createdAt > newest.createdAt ? template : newest
            ) : null,
            oldest: templates.length > 0 ? templates.reduce((oldest, template) => 
                template.createdAt < oldest.createdAt ? template : oldest
            ) : null
        };
    }

    // Экспорт шаблонов в JSON
    exportTemplates() {
        const templates = this.getTemplatesFromStorage();
        return JSON.stringify(templates, null, 2);
    }

    // Импорт шаблонов из JSON
    importTemplates(jsonString, merge = true) {
        try {
            const importedTemplates = JSON.parse(jsonString);
            
            if (!Array.isArray(importedTemplates)) {
                throw new Error('Неверный формат данных');
            }

            let currentTemplates = merge ? this.getTemplatesFromStorage() : [];
            
            // Добавляем импортированные шаблоны
            importedTemplates.forEach(template => {
                // Проверяем структуру шаблона
                if (this.validateTemplate(template)) {
                    // Генерируем новый ID чтобы избежать конфликтов
                    template.id = this.generateTemplateId();
                    template.createdAt = Date.now();
                    currentTemplates.push(template);
                }
            });

            localStorage.setItem(this.storageKey, JSON.stringify(currentTemplates));
            console.log(`✅ Импортировано ${importedTemplates.length} шаблонов`);
            return true;

        } catch (error) {
            console.error('❌ Ошибка импорта шаблонов:', error);
            return false;
        }
    }

    // Валидация структуры шаблона
    validateTemplate(template) {
        return template &&
               typeof template.name === 'string' &&
               template.background &&
               Array.isArray(template.textBlocksLayout);
    }

    // Очистка всех шаблонов
    clearAllTemplates() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🗑️ Все шаблоны удалены');
            return true;
        } catch (error) {
            console.error('❌ Ошибка очистки шаблонов:', error);
            return false;
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateManager;
} else {
    window.TemplateManager = TemplateManager;
}