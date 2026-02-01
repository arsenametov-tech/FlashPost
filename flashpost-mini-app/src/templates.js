// ===== TEMPLATE MANAGER MODULE =====
// Handles template saving, loading, and application

class TemplateManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.storageKey = 'flashpost_templates';
        console.log('✅ TemplateManager инициализирован');
    }

    // ===== СОЗДАНИЕ ШАБЛОНОВ =====

    // Создание шаблона из текущего слайда
    createTemplateFromSlide(slideId, templateName) {
        const slide = this.state.getSlideById(slideId);
        if (!slide) {
            console.error(`❌ Слайд ${slideId} не найден для создания шаблона`);
            return null;
        }

        const template = {
            id: this.generateTemplateId(),
            name: templateName || `Шаблон ${new Date().toLocaleDateString()}`,
            createdAt: new Date().toISOString(),
            
            // Настройки фона (включаем в шаблон)
            background: {
                type: slide.background.type,
                color: slide.background.color,
                image: slide.background.image,
                x: slide.background.x,
                y: slide.background.y,
                brightness: slide.background.brightness
            },
            
            // Стили и макет текстовых блоков (БЕЗ содержимого)
            textBlocksTemplate: slide.textBlocks.map(block => ({
                // Макет и позиционирование
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                rotation: block.rotation,
                opacity: block.opacity,
                zIndex: block.zIndex,
                
                // Стили шрифта
                font: block.font,
                size: block.size,
                weight: block.weight,
                style: block.style,
                
                // Цвета
                color: block.color,
                backgroundColor: block.backgroundColor,
                
                // Эффекты
                effects: {
                    shadow: { ...block.effects.shadow },
                    outline: { ...block.effects.outline },
                    glow: { ...block.effects.glow },
                    gradient: { ...block.effects.gradient }
                },
                
                // Форматирование
                textAlign: block.textAlign,
                lineHeight: block.lineHeight,
                letterSpacing: block.letterSpacing,
                wordSpacing: block.wordSpacing,
                
                // НЕ включаем текст - только плейсхолдер
                textPlaceholder: `Текст блока ${slide.textBlocks.indexOf(block) + 1}`
            })),
            
            // Метаданные
            slideCount: 1,
            blockCount: slide.textBlocks.length
        };

        console.log(`✅ Создан шаблон "${template.name}" с ${template.blockCount} блоками`);
        return template;
    }

    // ===== СОХРАНЕНИЕ ШАБЛОНОВ =====

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
            
            // Ограничиваем количество шаблонов (максимум 20)
            if (templates.length > 20) {
                templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                templates.splice(20);
                console.log('🧹 Удалены старые шаблоны (лимит: 20)');
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
            
            console.log(`💾 Шаблон "${template.name}" сохранен в localStorage`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            return false;
        }
    }

    // Сохранение текущего слайда как шаблона
    saveCurrentSlideAsTemplate(templateName) {
        const activeSlide = this.state.getActiveSlide();
        if (!activeSlide) {
            console.error('❌ Нет активного слайда для сохранения как шаблон');
            return false;
        }

        const template = this.createTemplateFromSlide(activeSlide.id, templateName);
        if (!template) return false;

        return this.saveTemplate(template);
    }

    // ===== ПРИМЕНЕНИЕ ШАБЛОНОВ =====

    // Применение шаблона к слайду
    applyTemplateToSlide(templateId, slideId, preserveText = true) {
        const template = this.getTemplateById(templateId);
        const slide = this.state.getSlideById(slideId);
        
        if (!template) {
            console.error(`❌ Шаблон ${templateId} не найден`);
            return false;
        }
        
        if (!slide) {
            console.error(`❌ Слайд ${slideId} не найден`);
            return false;
        }

        try {
            // Сохраняем текущий текст если нужно
            const currentTexts = preserveText ? slide.textBlocks.map(block => block.text) : [];
            
            // Применяем фон из шаблона через StateManager
            this.state.updateSlideProperty(slideId, 'background', { ...template.background });
            
            // Удаляем все текущие текстовые блоки через StateManager
            const currentBlocks = [...slide.textBlocks]; // Копия для безопасного удаления
            currentBlocks.forEach(block => {
                this.state.deleteTextBlockFromSlide(slideId, block.id);
            });
            
            // Создаем новые блоки из шаблона через StateManager
            template.textBlocksTemplate.forEach((blockTemplate, index) => {
                const blockData = {
                    // Применяем текст: сохраненный или плейсхолдер
                    text: (preserveText && currentTexts[index]) ? 
                          currentTexts[index] : 
                          blockTemplate.textPlaceholder,
                    
                    // Копируем все стили и макет из шаблона
                    x: blockTemplate.x,
                    y: blockTemplate.y,
                    width: blockTemplate.width,
                    height: blockTemplate.height,
                    rotation: blockTemplate.rotation,
                    opacity: blockTemplate.opacity,
                    zIndex: blockTemplate.zIndex,
                    
                    font: blockTemplate.font,
                    size: blockTemplate.size,
                    weight: blockTemplate.weight,
                    style: blockTemplate.style,
                    
                    color: blockTemplate.color,
                    backgroundColor: blockTemplate.backgroundColor,
                    
                    effects: {
                        shadow: { ...blockTemplate.effects.shadow },
                        outline: { ...blockTemplate.effects.outline },
                        glow: { ...blockTemplate.effects.glow },
                        gradient: { ...blockTemplate.effects.gradient }
                    },
                    
                    textAlign: blockTemplate.textAlign,
                    lineHeight: blockTemplate.lineHeight,
                    letterSpacing: blockTemplate.letterSpacing,
                    wordSpacing: blockTemplate.wordSpacing
                };
                
                // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямой мутации
                this.state.addTextBlockToSlide(slideId, blockData);
            });
            
            console.log(`✅ Шаблон "${template.name}" применен к слайду ${slideId} через StateManager`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка применения шаблона к слайду:', error);
            return false;
        }
    }

    // Применение шаблона ко всем слайдам
    applyTemplateToAllSlides(templateId, preserveText = true) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            console.error(`❌ Шаблон ${templateId} не найден`);
            return false;
        }

        // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямого доступа
        const slides = this.state.getAllSlides();
        if (slides.length === 0) {
            console.warn('⚠️ Нет слайдов для применения шаблона');
            return false;
        }

        let successCount = 0;
        
        slides.forEach(slide => {
            if (this.applyTemplateToSlide(templateId, slide.id, preserveText)) {
                successCount++;
            }
        });

        console.log(`✅ Шаблон "${template.name}" применен к ${successCount}/${slides.length} слайдам через StateManager`);
        
        // Обновляем живое превью для всех слайдов
        this.triggerGlobalLivePreviewUpdate();
        
        return successCount > 0;
    }

    // Применение шаблона к выбранному слайду
    applyTemplateToSelectedSlide(templateId, preserveText = true) {
        const activeSlide = this.state.getActiveSlide();
        if (!activeSlide) {
            console.error('❌ Нет активного слайда для применения шаблона');
            return false;
        }

        const result = this.applyTemplateToSlide(templateId, activeSlide.id, preserveText);
        
        if (result) {
            // Обновляем живое превью для текущего слайда
            this.triggerSlideLivePreviewUpdate(activeSlide.id);
        }
        
        return result;
    }

    // ===== ПОЛУЧЕНИЕ ШАБЛОНОВ =====

    // Получение всех шаблонов из localStorage
    getTemplatesFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Ошибка чтения шаблонов из localStorage:', error);
            return [];
        }
    }

    // Получение шаблона по ID
    getTemplateById(templateId) {
        const templates = this.getTemplatesFromStorage();
        return templates.find(template => template.id === templateId);
    }

    // Получение шаблона по имени
    getTemplateByName(templateName) {
        const templates = this.getTemplatesFromStorage();
        return templates.find(template => template.name === templateName);
    }

    // ===== УПРАВЛЕНИЕ ШАБЛОНАМИ =====

    // Удаление шаблона
    deleteTemplate(templateId) {
        try {
            const templates = this.getTemplatesFromStorage();
            const templateIndex = templates.findIndex(t => t.id === templateId);
            
            if (templateIndex === -1) {
                console.warn(`⚠️ Шаблон ${templateId} не найден для удаления`);
                return false;
            }
            
            const deletedTemplate = templates.splice(templateIndex, 1)[0];
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
            
            console.log(`🗑️ Шаблон "${deletedTemplate.name}" удален`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка удаления шаблона:', error);
            return false;
        }
    }

    // Переименование шаблона
    renameTemplate(templateId, newName) {
        try {
            const templates = this.getTemplatesFromStorage();
            const template = templates.find(t => t.id === templateId);
            
            if (!template) {
                console.warn(`⚠️ Шаблон ${templateId} не найден для переименования`);
                return false;
            }
            
            const oldName = template.name;
            template.name = newName;
            template.lastModified = new Date().toISOString();
            
            localStorage.setItem(this.storageKey, JSON.stringify(templates));
            
            console.log(`✏️ Шаблон переименован: "${oldName}" → "${newName}"`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка переименования шаблона:', error);
            return false;
        }
    }

    // ===== УТИЛИТЫ =====

    // Генерация ID шаблона
    generateTemplateId() {
        return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Обновление живого превью для слайда
    triggerSlideLivePreviewUpdate(slideId) {
        const slide = this.state.getSlideById(slideId);
        if (!slide) return;

        // Обновляем все блоки слайда
        slide.textBlocks.forEach(block => {
            this.state.triggerLivePreviewUpdate(block.id);
        });
    }

    // Глобальное обновление живого превью
    triggerGlobalLivePreviewUpdate() {
        // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямого доступа
        const slides = this.state.getAllSlides();
        slides.forEach(slide => {
            this.triggerSlideLivePreviewUpdate(slide.id);
        });
    }

    // Валидация шаблона
    validateTemplate(template) {
        if (!template || typeof template !== 'object') {
            return { valid: false, error: 'Шаблон не является объектом' };
        }

        if (!template.name || typeof template.name !== 'string') {
            return { valid: false, error: 'Отсутствует имя шаблона' };
        }

        if (!template.background || typeof template.background !== 'object') {
            return { valid: false, error: 'Отсутствуют настройки фона' };
        }

        if (!Array.isArray(template.textBlocksTemplate)) {
            return { valid: false, error: 'Отсутствует массив шаблонов текстовых блоков' };
        }

        return { valid: true };
    }

    // Экспорт шаблона в JSON
    exportTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            console.error(`❌ Шаблон ${templateId} не найден для экспорта`);
            return null;
        }

        try {
            const jsonData = JSON.stringify(template, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `template_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`📤 Шаблон "${template.name}" экспортирован`);
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка экспорта шаблона:', error);
            return false;
        }
    }

    // Импорт шаблона из JSON
    async importTemplate(file) {
        try {
            const text = await file.text();
            const template = JSON.parse(text);
            
            const validation = this.validateTemplate(template);
            if (!validation.valid) {
                console.error('❌ Невалидный шаблон:', validation.error);
                return false;
            }
            
            // Генерируем новый ID для импортированного шаблона
            template.id = this.generateTemplateId();
            template.importedAt = new Date().toISOString();
            
            const result = this.saveTemplate(template);
            
            if (result) {
                console.log(`📥 Шаблон "${template.name}" импортирован`);
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка импорта шаблона:', error);
            return false;
        }
    }

    // Получение статистики шаблонов
    getTemplateStats() {
        const templates = this.getTemplatesFromStorage();
        
        return {
            total: templates.length,
            totalBlocks: templates.reduce((sum, t) => sum + t.blockCount, 0),
            averageBlocks: templates.length > 0 ? 
                Math.round(templates.reduce((sum, t) => sum + t.blockCount, 0) / templates.length) : 0,
            oldestTemplate: templates.length > 0 ? 
                templates.reduce((oldest, t) => 
                    new Date(t.createdAt) < new Date(oldest.createdAt) ? t : oldest
                ).name : null,
            newestTemplate: templates.length > 0 ? 
                templates.reduce((newest, t) => 
                    new Date(t.createdAt) > new Date(newest.createdAt) ? t : newest
                ).name : null
        };
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateManager;
} else {
    window.TemplateManager = TemplateManager;
}