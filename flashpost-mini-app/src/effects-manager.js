// ===== EFFECTS MANAGER MODULE =====
// Handles visual effects for text and slides

class EffectsManager {
    constructor(stateManager) {
        this.state = stateManager;
        
        // Активные эффекты
        this.activeEffects = new Map();
        
        // Предустановленные эффекты
        this.presetEffects = this.initializePresets();
        
        // CSS стили для эффектов
        this.injectEffectStyles();
        
        console.log('✅ EffectsManager инициализирован');
    }

    // ===== ИНИЦИАЛИЗАЦИЯ ПРЕСЕТОВ =====

    initializePresets() {
        return {
            // Эффекты текста
            textEffects: {
                gradientText: {
                    name: 'Градиентный текст',
                    css: {
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
                        backgroundSize: '200% 200%',
                        backgroundClip: 'text',
                        webkitBackgroundClip: 'text',
                        color: 'transparent',
                        animation: 'gradientShift 3s ease infinite'
                    }
                },
                neonGlow: {
                    name: 'Неоновое свечение',
                    css: {
                        color: '#fff',
                        textShadow: `
                            0 0 5px currentColor,
                            0 0 10px currentColor,
                            0 0 15px currentColor,
                            0 0 20px #ff00de,
                            0 0 35px #ff00de,
                            0 0 40px #ff00de
                        `,
                        animation: 'neonFlicker 2s ease-in-out infinite alternate'
                    }
                },
                shadow3d: {
                    name: '3D тень',
                    css: {
                        textShadow: `
                            1px 1px 0px #ccc,
                            2px 2px 0px #c9c9c9,
                            3px 3px 0px #bbb,
                            4px 4px 0px #b9b9b9,
                            5px 5px 0px #aaa,
                            6px 6px 1px rgba(0,0,0,.1),
                            0 0 5px rgba(0,0,0,.1),
                            0 1px 3px rgba(0,0,0,.3),
                            0 3px 5px rgba(0,0,0,.2),
                            0 5px 10px rgba(0,0,0,.25)
                        `
                    }
                },
                blurBackground: {
                    name: 'Размытие фона',
                    css: {
                        position: 'relative',
                        zIndex: 2
                    },
                    backdrop: {
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '10px',
                        zIndex: -1
                    }
                },
                gradientOutline: {
                    name: 'Градиентная обводка',
                    css: {
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                        backgroundClip: 'text',
                        webkitBackgroundClip: 'text',
                        color: 'transparent',
                        textStroke: '2px transparent',
                        webkitTextStroke: '2px transparent',
                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                    }
                },
                pulse: {
                    name: 'Пульсация',
                    css: {
                        animation: 'textPulse 2s ease-in-out infinite'
                    }
                }
            },

            // Эффекты слайда
            slideEffects: {
                particles: {
                    name: 'Частицы на фоне',
                    type: 'canvas',
                    config: {
                        particleCount: 50,
                        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
                        speed: 0.5,
                        size: { min: 2, max: 6 }
                    }
                },
                geometricShapes: {
                    name: 'Геометрические фигуры',
                    type: 'svg',
                    config: {
                        shapes: ['circle', 'triangle', 'square'],
                        count: 15,
                        colors: ['rgba(255,107,107,0.3)', 'rgba(78,205,196,0.3)', 'rgba(69,183,209,0.3)'],
                        animation: 'float'
                    }
                },
                waveEffect: {
                    name: 'Волновой эффект',
                    type: 'css',
                    css: {
                        background: `
                            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%),
                            linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                        `,
                        backgroundSize: '200% 200%, 100% 100%',
                        animation: 'waveMove 4s ease-in-out infinite'
                    }
                },
                dynamicGradient: {
                    name: 'Динамический градиент',
                    type: 'css',
                    css: {
                        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientAnimation 8s ease infinite'
                    }
                }
            }
        };
    }

    // ===== ВНЕДРЕНИЕ CSS СТИЛЕЙ =====

    injectEffectStyles() {
        if (document.getElementById('effects-styles')) return;

        const style = document.createElement('style');
        style.id = 'effects-styles';
        style.textContent = `
            /* Анимации для градиентов */
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                25% { background-position: 100% 50%; }
                50% { background-position: 100% 100%; }
                75% { background-position: 0% 100%; }
                100% { background-position: 0% 50%; }
            }

            /* Неоновое мерцание */
            @keyframes neonFlicker {
                0%, 100% {
                    text-shadow: 
                        0 0 5px currentColor,
                        0 0 10px currentColor,
                        0 0 15px currentColor,
                        0 0 20px #ff00de,
                        0 0 35px #ff00de,
                        0 0 40px #ff00de;
                }
                50% {
                    text-shadow: 
                        0 0 2px currentColor,
                        0 0 5px currentColor,
                        0 0 8px currentColor,
                        0 0 12px #ff00de,
                        0 0 18px #ff00de,
                        0 0 25px #ff00de;
                }
            }

            /* Пульсация текста */
            @keyframes textPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }

            /* Волновое движение */
            @keyframes waveMove {
                0%, 100% { background-position: 0% 0%, 0% 0%; }
                25% { background-position: 100% 0%, 0% 0%; }
                50% { background-position: 100% 100%, 0% 0%; }
                75% { background-position: 0% 100%, 0% 0%; }
            }

            /* Плавающие элементы */
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                33% { transform: translateY(-10px) rotate(120deg); }
                66% { transform: translateY(5px) rotate(240deg); }
            }

            /* Эффект размытого фона */
            .blur-backdrop {
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 10px;
                z-index: -1;
                pointer-events: none;
            }

            /* Контейнер для частиц */
            .particles-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            /* Геометрические фигуры */
            .geometric-shapes {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .shape {
                position: absolute;
                animation: float 6s ease-in-out infinite;
            }

            .shape.circle {
                border-radius: 50%;
            }

            .shape.triangle {
                width: 0;
                height: 0;
                background: none !important;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 17px solid;
            }

            .shape.square {
                /* Квадрат остается как есть */
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ CSS стили эффектов внедрены');
    }

    // ===== ПРИМЕНЕНИЕ ЭФФЕКТОВ К ТЕКСТУ =====

    // Применение эффекта к текстовому блоку
    applyTextEffect(blockId, effectType, intensity = 1) {
        const element = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!element) {
            console.warn(`❌ Элемент с ID ${blockId} не найден`);
            return false;
        }

        const effect = this.presetEffects.textEffects[effectType];
        if (!effect) {
            console.warn(`❌ Эффект ${effectType} не найден`);
            return false;
        }

        // Удаляем предыдущие эффекты
        this.removeTextEffect(blockId);

        // Применяем новый эффект
        const effectId = `effect_${blockId}_${effectType}`;
        
        try {
            // Применяем CSS стили
            if (effect.css) {
                Object.assign(element.style, this.scaleEffectIntensity(effect.css, intensity));
            }

            // Добавляем backdrop элемент если нужно
            if (effect.backdrop) {
                const backdrop = document.createElement('div');
                backdrop.className = 'blur-backdrop';
                backdrop.setAttribute('data-effect-backdrop', effectId);
                Object.assign(backdrop.style, effect.backdrop);
                
                // Вставляем backdrop перед текстовым элементом
                element.parentNode.insertBefore(backdrop, element);
            }

            // Сохраняем информацию об эффекте
            this.activeEffects.set(effectId, {
                blockId,
                effectType,
                element,
                intensity
            });

            console.log(`✅ Эффект ${effectType} применен к блоку ${blockId}`);
            return effectId;

        } catch (error) {
            console.error('❌ Ошибка применения эффекта:', error);
            return false;
        }
    }

    // Масштабирование интенсивности эффекта
    scaleEffectIntensity(cssProps, intensity) {
        const scaledProps = { ...cssProps };
        
        // Масштабируем определенные свойства
        if (scaledProps.textShadow) {
            // Для теней масштабируем размытие и смещение
            scaledProps.textShadow = scaledProps.textShadow.replace(/(\d+)px/g, (match, value) => {
                return Math.round(parseInt(value) * intensity) + 'px';
            });
        }
        
        if (scaledProps.filter && scaledProps.filter.includes('blur')) {
            // Для размытия масштабируем значение
            scaledProps.filter = scaledProps.filter.replace(/blur\((\d+)px\)/, (match, value) => {
                return `blur(${Math.round(parseInt(value) * intensity)}px)`;
            });
        }
        
        return scaledProps;
    }

    // Удаление эффекта с текстового блока
    removeTextEffect(blockId) {
        const element = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!element) return;

        // Находим и удаляем активные эффекты для этого блока
        for (const [effectId, effectData] of this.activeEffects.entries()) {
            if (effectData.blockId === blockId) {
                // Очищаем стили
                this.clearElementStyles(element);
                
                // Удаляем backdrop если есть
                const backdrop = document.querySelector(`[data-effect-backdrop="${effectId}"]`);
                if (backdrop) {
                    backdrop.remove();
                }
                
                this.activeEffects.delete(effectId);
            }
        }
    }

    // Очистка стилей элемента
    clearElementStyles(element) {
        const stylesToClear = [
            'background', 'backgroundSize', 'backgroundClip', 'webkitBackgroundClip',
            'color', 'textShadow', 'animation', 'filter', 'textStroke', 'webkitTextStroke'
        ];
        
        stylesToClear.forEach(prop => {
            element.style[prop] = '';
        });
    }

    // ===== ПРИМЕНЕНИЕ ЭФФЕКТОВ К СЛАЙДУ =====

    // Применение эффекта к слайду
    applySlideEffect(slideId, effectType) {
        const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
        if (!slideElement) {
            console.warn(`❌ Слайд с ID ${slideId} не найден`);
            return false;
        }

        const effect = this.presetEffects.slideEffects[effectType];
        if (!effect) {
            console.warn(`❌ Эффект слайда ${effectType} не найден`);
            return false;
        }

        // Удаляем предыдущие эффекты слайда
        this.removeSlideEffect(slideId);

        const effectId = `slide_effect_${slideId}_${effectType}`;

        try {
            switch (effect.type) {
                case 'css':
                    this.applyCSSSlideEffect(slideElement, effect, effectId);
                    break;
                case 'canvas':
                    this.applyCanvasSlideEffect(slideElement, effect, effectId);
                    break;
                case 'svg':
                    this.applySVGSlideEffect(slideElement, effect, effectId);
                    break;
            }

            // Сохраняем информацию об эффекте
            this.activeEffects.set(effectId, {
                slideId,
                effectType,
                element: slideElement,
                type: effect.type
            });

            console.log(`✅ Эффект слайда ${effectType} применен к слайду ${slideId}`);
            return effectId;

        } catch (error) {
            console.error('❌ Ошибка применения эффекта слайда:', error);
            return false;
        }
    }

    // Применение CSS эффекта к слайду
    applyCSSSlideEffect(slideElement, effect, effectId) {
        if (effect.css) {
            Object.assign(slideElement.style, effect.css);
        }
    }

    // Применение Canvas эффекта (частицы)
    applyCanvasSlideEffect(slideElement, effect, effectId) {
        const canvas = document.createElement('canvas');
        canvas.className = 'particles-container';
        canvas.setAttribute('data-effect-canvas', effectId);
        
        const rect = slideElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        slideElement.appendChild(canvas);
        
        // Запускаем анимацию частиц
        this.startParticleAnimation(canvas, effect.config);
    }

    // Применение SVG эффекта (геометрические фигуры)
    applySVGSlideEffect(slideElement, effect, effectId) {
        const container = document.createElement('div');
        container.className = 'geometric-shapes';
        container.setAttribute('data-effect-svg', effectId);
        
        slideElement.appendChild(container);
        
        // Создаем геометрические фигуры
        this.createGeometricShapes(container, effect.config);
    }

    // Анимация частиц
    startParticleAnimation(canvas, config) {
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        // Создаем частицы
        for (let i = 0; i < config.particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * config.speed,
                vy: (Math.random() - 0.5) * config.speed,
                size: Math.random() * (config.size.max - config.size.min) + config.size.min,
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        // Анимационный цикл
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // Обновляем позицию
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Отскок от границ
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // Рисуем частицу
                ctx.save();
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Создание геометрических фигур
    createGeometricShapes(container, config) {
        for (let i = 0; i < config.count; i++) {
            const shape = document.createElement('div');
            const shapeType = config.shapes[Math.floor(Math.random() * config.shapes.length)];
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            const size = Math.random() * 20 + 10;
            
            shape.className = `shape ${shapeType}`;
            shape.style.cssText = `
                left: ${Math.random() * 90}%;
                top: ${Math.random() * 90}%;
                width: ${size}px;
                height: ${size}px;
                background: ${shapeType !== 'triangle' ? color : 'none'};
                animation-delay: ${Math.random() * 2}s;
                animation-duration: ${4 + Math.random() * 4}s;
            `;
            
            if (shapeType === 'triangle') {
                shape.style.borderBottomColor = color;
            }
            
            container.appendChild(shape);
        }
    }

    // Удаление эффекта слайда
    removeSlideEffect(slideId) {
        for (const [effectId, effectData] of this.activeEffects.entries()) {
            if (effectData.slideId === slideId) {
                const element = effectData.element;
                
                // Очищаем CSS стили
                if (effectData.type === 'css') {
                    this.clearElementStyles(element);
                }
                
                // Удаляем canvas элементы
                const canvas = element.querySelector(`[data-effect-canvas="${effectId}"]`);
                if (canvas) {
                    canvas.remove();
                }
                
                // Удаляем SVG элементы
                const svg = element.querySelector(`[data-effect-svg="${effectId}"]`);
                if (svg) {
                    svg.remove();
                }
                
                this.activeEffects.delete(effectId);
            }
        }
    }

    // ===== КОМБИНИРОВАНИЕ ЭФФЕКТОВ =====

    // Применение нескольких эффектов к блоку
    applyMultipleTextEffects(blockId, effects) {
        const results = [];
        
        effects.forEach(({ type, intensity = 1 }) => {
            const result = this.applyTextEffect(blockId, type, intensity);
            if (result) {
                results.push(result);
            }
        });
        
        return results;
    }

    // ===== ПОЛУЧЕНИЕ ДОСТУПНЫХ ЭФФЕКТОВ =====

    // Получение списка эффектов текста
    getTextEffects() {
        return Object.keys(this.presetEffects.textEffects).map(key => ({
            id: key,
            name: this.presetEffects.textEffects[key].name,
            type: 'text'
        }));
    }

    // Получение списка эффектов слайда
    getSlideEffects() {
        return Object.keys(this.presetEffects.slideEffects).map(key => ({
            id: key,
            name: this.presetEffects.slideEffects[key].name,
            type: this.presetEffects.slideEffects[key].type
        }));
    }

    // ===== ОЧИСТКА РЕСУРСОВ =====

    // Удаление всех эффектов
    removeAllEffects() {
        for (const [effectId, effectData] of this.activeEffects.entries()) {
            if (effectData.blockId) {
                this.removeTextEffect(effectData.blockId);
            } else if (effectData.slideId) {
                this.removeSlideEffect(effectData.slideId);
            }
        }
        
        this.activeEffects.clear();
        console.log('🧹 Все эффекты удалены');
    }

    // Уничтожение менеджера эффектов
    destroy() {
        this.removeAllEffects();
        
        // Удаляем CSS стили
        const styleElement = document.getElementById('effects-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        console.log('✅ EffectsManager уничтожен');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EffectsManager;
}