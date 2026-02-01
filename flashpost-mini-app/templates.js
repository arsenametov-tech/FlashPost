// ===== ПРЕМИУМ ШАБЛОНЫ FLASHPOST MINI APP =====

class PremiumTemplates {
    constructor() {
        this.templates = this.initializeTemplates();
    }

    initializeTemplates() {
        return {
            // ===== БИЗНЕС ШАБЛОНЫ =====
            business: {
                name: "Бизнес",
                icon: "💼",
                category: "business",
                isPremium: true,
                templates: [
                    {
                        id: "corporate",
                        name: "Корпоративный",
                        preview: "🏢",
                        description: "Строгий корпоративный стиль",
                        colors: {
                            primary: "#1a365d",
                            secondary: "#2d3748",
                            accent: "#3182ce",
                            text: "#ffffff",
                            background: "linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #4a5568 100%)"
                        },
                        fonts: {
                            primary: "Inter",
                            secondary: "Arial"
                        },
                        layout: "minimal",
                        effects: ["shadow", "gradient"]
                    },
                    {
                        id: "startup",
                        name: "Стартап",
                        preview: "🚀",
                        description: "Современный стиль для стартапов",
                        colors: {
                            primary: "#6366f1",
                            secondary: "#8b5cf6",
                            accent: "#ec4899",
                            text: "#ffffff",
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)"
                        },
                        fonts: {
                            primary: "Inter",
                            secondary: "Arial"
                        },
                        layout: "modern",
                        effects: ["glow", "gradient"]
                    }
                ]
            },

            // ===== КРЕАТИВНЫЕ ШАБЛОНЫ =====
            creative: {
                name: "Креативные",
                icon: "🎨",
                category: "creative",
                isPremium: true,
                templates: [
                    {
                        id: "artistic",
                        name: "Художественный",
                        preview: "🎭",
                        description: "Креативный художественный стиль",
                        colors: {
                            primary: "#f59e0b",
                            secondary: "#ef4444",
                            accent: "#8b5cf6",
                            text: "#ffffff",
                            background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%)"
                        },
                        fonts: {
                            primary: "Georgia",
                            secondary: "Arial"
                        },
                        layout: "creative",
                        effects: ["blur", "gradient", "shadow"]
                    }
                ]
            }
        };
    }

    // Получение всех шаблонов
    getAllTemplates() {
        return this.templates;
    }

    // Получение шаблонов по категории
    getTemplatesByCategory(category) {
        return this.templates[category] || null;
    }

    // Получение конкретного шаблона
    getTemplate(category, templateId) {
        const categoryTemplates = this.getTemplatesByCategory(category);
        if (!categoryTemplates) return null;
        
        return categoryTemplates.templates.find(template => template.id === templateId) || null;
    }

    // Применение шаблона к слайду
    applyTemplate(slideElement, category, templateId) {
        const template = this.getTemplate(category, templateId);
        if (!template) {
            console.warn(`Template ${templateId} in category ${category} not found`);
            return false;
        }

        // Применяем стили
        slideElement.style.background = template.colors.background;
        slideElement.style.color = template.colors.text;
        slideElement.style.fontFamily = template.fonts.primary;

        // Добавляем эффекты
        if (template.effects.includes('shadow')) {
            slideElement.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        }
        
        if (template.effects.includes('glow')) {
            slideElement.style.boxShadow = `0 0 30px ${template.colors.accent}40`;
        }

        console.log(`✅ Template ${templateId} applied successfully`);
        return true;
    }
}

// Экспорт для использования в других файлах
if (typeof window !== 'undefined') {
    window.PremiumTemplates = PremiumTemplates;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumTemplates;
}