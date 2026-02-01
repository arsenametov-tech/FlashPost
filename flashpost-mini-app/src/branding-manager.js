// ===== BRANDING MANAGER MODULE =====
// Handles brand assets, color palettes, and font pairs

class BrandingManager {
    constructor(stateManager) {
        this.state = stateManager;
        
        // Брендовые ресурсы
        this.brandAssets = {
            logos: new Map(),
            colorPalettes: new Map(),
            fontPairs: new Map(),
            customFonts: new Map()
        };
        
        // Активная брендовая тема
        this.activeBrandTheme = null;
        
        // Предустановленные цветовые палитры
        this.presetPalettes = this.initializePresetPalettes();
        
        // Предустановленные шрифтовые пары
        this.presetFontPairs = this.initializePresetFontPairs();
        
        // Загружаем сохраненные данные
        this.loadBrandData();
        
        console.log('✅ BrandingManager инициализирован');
    }

    // ===== ИНИЦИАЛИЗАЦИЯ ПРЕСЕТОВ =====

    initializePresetPalettes() {
        return {
            corporate: {
                name: 'Корпоративная',
                colors: {
                    primary: '#2c3e50',
                    secondary: '#3498db',
                    accent: '#e74c3c',
                    background: '#ecf0f1',
                    text: '#2c3e50',
                    textSecondary: '#7f8c8d'
                },
                description: 'Профессиональная палитра для бизнеса'
            },
            creative: {
                name: 'Креативная',
                colors: {
                    primary: '#9b59b6',
                    secondary: '#e67e22',
                    accent: '#f39c12',
                    background: '#2c3e50',
                    text: '#ecf0f1',
                    textSecondary: '#bdc3c7'
                },
                description: 'Яркая палитра для творческих проектов'
            },
            minimal: {
                name: 'Минималистичная',
                colors: {
                    primary: '#2c3e50',
                    secondary: '#95a5a6',
                    accent: '#3498db',
                    background: '#ffffff',
                    text: '#2c3e50',
                    textSecondary: '#7f8c8d'
                },
                description: 'Чистая палитра для минимализма'
            },
            vibrant: {
                name: 'Яркая',
                colors: {
                    primary: '#e74c3c',
                    secondary: '#f39c12',
                    accent: '#2ecc71',
                    background: '#34495e',
                    text: '#ffffff',
                    textSecondary: '#ecf0f1'
                },
                description: 'Энергичная палитра для привлечения внимания'
            },
            nature: {
                name: 'Природная',
                colors: {
                    primary: '#27ae60',
                    secondary: '#16a085',
                    accent: '#f39c12',
                    background: '#2c3e50',
                    text: '#ecf0f1',
                    textSecondary: '#95a5a6'
                },
                description: 'Естественная палитра с зелеными оттенками'
            }
        };
    }

    initializePresetFontPairs() {
        return {
            classic: {
                name: 'Классическая',
                heading: {
                    family: 'Playfair Display',
                    weight: '700',
                    style: 'serif',
                    googleFont: 'Playfair+Display:wght@400;700'
                },
                body: {
                    family: 'Source Sans Pro',
                    weight: '400',
                    style: 'sans-serif',
                    googleFont: 'Source+Sans+Pro:wght@300;400;600'
                },
                description: 'Элегантное сочетание serif и sans-serif'
            },
            modern: {
                name: 'Современная',
                heading: {
                    family: 'Montserrat',
                    weight: '600',
                    style: 'sans-serif',
                    googleFont: 'Montserrat:wght@400;600;700'
                },
                body: {
                    family: 'Open Sans',
                    weight: '400',
                    style: 'sans-serif',
                    googleFont: 'Open+Sans:wght@300;400;600'
                },
                description: 'Чистые современные шрифты'
            },
            creative: {
                name: 'Креативная',
                heading: {
                    family: 'Poppins',
                    weight: '700',
                    style: 'sans-serif',
                    googleFont: 'Poppins:wght@400;600;700'
                },
                body: {
                    family: 'Nunito',
                    weight: '400',
                    style: 'sans-serif',
                    googleFont: 'Nunito:wght@300;400;600'
                },
                description: 'Дружелюбные округлые шрифты'
            },
            tech: {
                name: 'Техническая',
                heading: {
                    family: 'Roboto',
                    weight: '700',
                    style: 'sans-serif',
                    googleFont: 'Roboto:wght@300;400;700'
                },
                body: {
                    family: 'Roboto',
                    weight: '400',
                    style: 'sans-serif',
                    googleFont: 'Roboto:wght@300;400;700'
                },
                description: 'Технологичный монотонный стиль'
            },
            elegant: {
                name: 'Элегантная',
                heading: {
                    family: 'Cormorant Garamond',
                    weight: '600',
                    style: 'serif',
                    googleFont: 'Cormorant+Garamond:wght@400;600;700'
                },
                body: {
                    family: 'Lato',
                    weight: '400',
                    style: 'sans-serif',
                    googleFont: 'Lato:wght@300;400;700'
                },
                description: 'Изысканное сочетание для премиум контента'
            }
        };
    }

    // ===== УПРАВЛЕНИЕ ЛОГОТИПАМИ =====

    // Загрузка логотипа
    async uploadLogo(file, logoName = 'default') {
        try {
            // Валидация файла
            if (!this.validateImageFile(file)) {
                throw new Error('Недопустимый формат файла. Поддерживаются: PNG, JPG, SVG');
            }

            // Конвертируем в base64
            const logoData = await this.fileToBase64(file);
            
            // Создаем объект логотипа
            const logo = {
                id: this.generateId(),
                name: logoName,
                data: logoData,
                originalName: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                settings: {
                    position: 'top-right',
                    size: 'medium',
                    opacity: 1,
                    margin: { top: 10, right: 10, bottom: 10, left: 10 }
                }
            };

            // Сохраняем логотип
            this.brandAssets.logos.set(logo.id, logo);
            this.saveBrandData();

            console.log(`✅ Логотип "${logoName}" загружен`);
            return logo.id;

        } catch (error) {
            console.error('❌ Ошибка загрузки логотипа:', error);
            throw error;
        }
    }

    // Применение логотипа к слайду
    applyLogoToSlide(slideId, logoId, settings = {}) {
        const slide = this.state.getSlideById(slideId);
        const logo = this.brandAssets.logos.get(logoId);
        
        if (!slide || !logo) {
            console.warn('❌ Слайд или логотип не найден');
            return false;
        }

        // Объединяем настройки
        const logoSettings = { ...logo.settings, ...settings };
        
        // Добавляем логотип к слайду
        if (!slide.brandElements) {
            slide.brandElements = {};
        }
        
        slide.brandElements.logo = {
            logoId,
            settings: logoSettings
        };

        // Обновляем отображение
        this.renderLogoOnSlide(slideId);
        
        console.log(`✅ Логотип применен к слайду ${slideId}`);
        return true;
    }

    // Отрисовка логотипа на слайде
    renderLogoOnSlide(slideId) {
        const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
        const slide = this.state.getSlideById(slideId);
        
        if (!slideElement || !slide?.brandElements?.logo) return;

        // Удаляем существующий логотип
        const existingLogo = slideElement.querySelector('.brand-logo');
        if (existingLogo) {
            existingLogo.remove();
        }

        const logoData = slide.brandElements.logo;
        const logo = this.brandAssets.logos.get(logoData.logoId);
        
        if (!logo) return;

        // Создаем элемент логотипа
        const logoElement = document.createElement('img');
        logoElement.className = 'brand-logo';
        logoElement.src = logo.data;
        logoElement.alt = logo.name;
        
        // Применяем стили
        const settings = logoData.settings;
        logoElement.style.cssText = `
            position: absolute;
            ${this.getLogoPositionStyles(settings.position)}
            ${this.getLogoSizeStyles(settings.size)}
            opacity: ${settings.opacity};
            margin: ${settings.margin.top}px ${settings.margin.right}px ${settings.margin.bottom}px ${settings.margin.left}px;
            z-index: 10;
            pointer-events: none;
        `;

        slideElement.appendChild(logoElement);
    }

    // Получение стилей позиционирования логотипа
    getLogoPositionStyles(position) {
        const positions = {
            'top-left': 'top: 0; left: 0;',
            'top-center': 'top: 0; left: 50%; transform: translateX(-50%);',
            'top-right': 'top: 0; right: 0;',
            'center-left': 'top: 50%; left: 0; transform: translateY(-50%);',
            'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
            'center-right': 'top: 50%; right: 0; transform: translateY(-50%);',
            'bottom-left': 'bottom: 0; left: 0;',
            'bottom-center': 'bottom: 0; left: 50%; transform: translateX(-50%);',
            'bottom-right': 'bottom: 0; right: 0;'
        };
        
        return positions[position] || positions['top-right'];
    }

    // Получение стилей размера логотипа
    getLogoSizeStyles(size) {
        const sizes = {
            'small': 'max-width: 60px; max-height: 40px;',
            'medium': 'max-width: 100px; max-height: 60px;',
            'large': 'max-width: 150px; max-height: 90px;'
        };
        
        return sizes[size] || sizes['medium'];
    }

    // ===== УПРАВЛЕНИЕ ЦВЕТОВЫМИ ПАЛИТРАМИ =====

    // Создание кастомной цветовой палитры
    createColorPalette(name, colors, description = '') {
        const palette = {
            id: this.generateId(),
            name,
            colors,
            description,
            createdAt: new Date().toISOString(),
            isCustom: true
        };

        this.brandAssets.colorPalettes.set(palette.id, palette);
        this.saveBrandData();

        console.log(`✅ Цветовая палитра "${name}" создана`);
        return palette.id;
    }

    // Применение цветовой палитры к проекту
    applyColorPalette(paletteId) {
        const palette = this.brandAssets.colorPalettes.get(paletteId) || 
                       this.presetPalettes[paletteId];
        
        if (!palette) {
            console.warn(`❌ Палитра ${paletteId} не найдена`);
            return false;
        }

        // Применяем палитру ко всем слайдам
        const slides = this.state.getSlides();
        slides.forEach(slide => {
            this.applyPaletteToSlide(slide.id, palette);
        });

        // Сохраняем активную палитру
        this.activeBrandTheme = {
            ...this.activeBrandTheme,
            colorPalette: paletteId
        };

        console.log(`✅ Цветовая палитра "${palette.name}" применена`);
        return true;
    }

    // Применение палитры к конкретному слайду
    applyPaletteToSlide(slideId, palette) {
        const slide = this.state.getSlideById(slideId);
        if (!slide) return;

        // Применяем цвета к текстовым блокам
        if (slide.textBlocks) {
            slide.textBlocks.forEach((block, index) => {
                // Чередуем цвета для разных блоков
                const colorKeys = Object.keys(palette.colors);
                const colorKey = index % 2 === 0 ? 'text' : 'textSecondary';
                
                if (palette.colors[colorKey]) {
                    block.color = palette.colors[colorKey];
                }
            });
        }

        // Применяем фоновый цвет если нет изображения
        if (!slide.background?.image) {
            slide.background = {
                ...slide.background,
                color: palette.colors.background || palette.colors.primary
            };
        }
    }

    // ===== УПРАВЛЕНИЕ ШРИФТОВЫМИ ПАРАМИ =====

    // Загрузка Google Fonts
    loadGoogleFonts(fontPairId) {
        const fontPair = this.presetFontPairs[fontPairId];
        if (!fontPair) return;

        // Проверяем, не загружены ли уже шрифты
        const linkId = `google-fonts-${fontPairId}`;
        if (document.getElementById(linkId)) return;

        // Создаем ссылку на Google Fonts
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${fontPair.heading.googleFont}&${fontPair.body.googleFont}&display=swap`;
        
        document.head.appendChild(link);
        console.log(`✅ Google Fonts загружены для пары "${fontPair.name}"`);
    }

    // Применение шрифтовой пары к проекту
    applyFontPair(fontPairId) {
        const fontPair = this.presetFontPairs[fontPairId];
        if (!fontPair) {
            console.warn(`❌ Шрифтовая пара ${fontPairId} не найдена`);
            return false;
        }

        // Загружаем шрифты
        this.loadGoogleFonts(fontPairId);

        // Применяем шрифты ко всем слайдам
        const slides = this.state.getSlides();
        slides.forEach(slide => {
            this.applyFontPairToSlide(slide.id, fontPair);
        });

        // Сохраняем активную шрифтовую пару
        this.activeBrandTheme = {
            ...this.activeBrandTheme,
            fontPair: fontPairId
        };

        console.log(`✅ Шрифтовая пара "${fontPair.name}" применена`);
        return true;
    }

    // Применение шрифтовой пары к слайду
    applyFontPairToSlide(slideId, fontPair) {
        const slide = this.state.getSlideById(slideId);
        if (!slide?.textBlocks) return;

        slide.textBlocks.forEach((block, index) => {
            // Первый блок - заголовочный шрифт, остальные - основной
            const font = index === 0 ? fontPair.heading : fontPair.body;
            
            block.font = font.family;
            block.weight = parseInt(font.weight);
            
            // Увеличиваем размер для заголовков
            if (index === 0 && block.size < 24) {
                block.size = Math.max(block.size * 1.2, 24);
            }
        });
    }

    // ===== БРЕНДОВЫЕ ТЕМЫ =====

    // Создание полной брендовой темы
    createBrandTheme(name, config) {
        const theme = {
            id: this.generateId(),
            name,
            colorPaletteId: config.colorPaletteId,
            fontPairId: config.fontPairId,
            logoId: config.logoId,
            settings: config.settings || {},
            createdAt: new Date().toISOString()
        };

        // Сохраняем тему
        const themes = this.getBrandThemes();
        themes[theme.id] = theme;
        localStorage.setItem('flashpost_brand_themes', JSON.stringify(themes));

        console.log(`✅ Брендовая тема "${name}" создана`);
        return theme.id;
    }

    // Применение брендовой темы
    applyBrandTheme(themeId) {
        const themes = this.getBrandThemes();
        const theme = themes[themeId];
        
        if (!theme) {
            console.warn(`❌ Брендовая тема ${themeId} не найдена`);
            return false;
        }

        // Применяем компоненты темы
        if (theme.colorPaletteId) {
            this.applyColorPalette(theme.colorPaletteId);
        }
        
        if (theme.fontPairId) {
            this.applyFontPair(theme.fontPairId);
        }
        
        if (theme.logoId) {
            const slides = this.state.getSlides();
            slides.forEach(slide => {
                this.applyLogoToSlide(slide.id, theme.logoId);
            });
        }

        this.activeBrandTheme = theme;
        
        console.log(`✅ Брендовая тема "${theme.name}" применена`);
        return true;
    }

    // ===== УТИЛИТЫ =====

    // Валидация изображения
    validateImageFile(file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }

    // Конвертация файла в base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Генерация уникального ID
    generateId() {
        return `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ===== СОХРАНЕНИЕ И ЗАГРУЗКА =====

    // Сохранение брендовых данных
    saveBrandData() {
        const data = {
            logos: Array.from(this.brandAssets.logos.entries()),
            colorPalettes: Array.from(this.brandAssets.colorPalettes.entries()),
            fontPairs: Array.from(this.brandAssets.fontPairs.entries()),
            activeBrandTheme: this.activeBrandTheme
        };
        
        localStorage.setItem('flashpost_brand_data', JSON.stringify(data));
    }

    // Загрузка брендовых данных
    loadBrandData() {
        try {
            const data = localStorage.getItem('flashpost_brand_data');
            if (!data) return;

            const parsed = JSON.parse(data);
            
            if (parsed.logos) {
                this.brandAssets.logos = new Map(parsed.logos);
            }
            if (parsed.colorPalettes) {
                this.brandAssets.colorPalettes = new Map(parsed.colorPalettes);
            }
            if (parsed.fontPairs) {
                this.brandAssets.fontPairs = new Map(parsed.fontPairs);
            }
            if (parsed.activeBrandTheme) {
                this.activeBrandTheme = parsed.activeBrandTheme;
            }

            console.log('✅ Брендовые данные загружены');
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки брендовых данных:', error);
        }
    }

    // Получение брендовых тем
    getBrandThemes() {
        try {
            const themes = localStorage.getItem('flashpost_brand_themes');
            return themes ? JSON.parse(themes) : {};
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки тем:', error);
            return {};
        }
    }

    // ===== ПОЛУЧЕНИЕ ДАННЫХ =====

    // Получение всех логотипов
    getLogos() {
        return Array.from(this.brandAssets.logos.values());
    }

    // Получение всех цветовых палитр
    getColorPalettes() {
        const custom = Array.from(this.brandAssets.colorPalettes.values());
        const preset = Object.keys(this.presetPalettes).map(key => ({
            id: key,
            ...this.presetPalettes[key],
            isPreset: true
        }));
        
        return [...preset, ...custom];
    }

    // Получение всех шрифтовых пар
    getFontPairs() {
        return Object.keys(this.presetFontPairs).map(key => ({
            id: key,
            ...this.presetFontPairs[key]
        }));
    }

    // ===== ОЧИСТКА РЕСУРСОВ =====

    // Удаление брендовых элементов со всех слайдов
    removeBrandingFromAllSlides() {
        const slides = this.state.getSlides();
        slides.forEach(slide => {
            if (slide.brandElements) {
                delete slide.brandElements;
            }
            
            // Удаляем логотипы из DOM
            const slideElement = document.querySelector(`[data-slide-id="${slide.id}"]`);
            if (slideElement) {
                const logo = slideElement.querySelector('.brand-logo');
                if (logo) {
                    logo.remove();
                }
            }
        });
        
        this.activeBrandTheme = null;
        console.log('🧹 Брендинг удален со всех слайдов');
    }

    // Уничтожение менеджера брендинга
    destroy() {
        this.removeBrandingFromAllSlides();
        this.brandAssets.logos.clear();
        this.brandAssets.colorPalettes.clear();
        this.brandAssets.fontPairs.clear();
        
        console.log('✅ BrandingManager уничтожен');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrandingManager;
}