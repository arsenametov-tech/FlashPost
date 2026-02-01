// ===== ANIMATION MANAGER MODULE =====
// Handles text animations and slide transitions

class AnimationManager {
    constructor(stateManager, renderer) {
        this.state = stateManager;
        this.renderer = renderer;
        
        // Активные анимации
        this.activeAnimations = new Map();
        this.animationQueue = [];
        
        // Настройки по умолчанию
        this.defaultDuration = 800;
        this.defaultEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Предустановленные анимации
        this.presetAnimations = this.initializePresets();
        
        console.log('✅ AnimationManager инициализирован');
    }

    // ===== ИНИЦИАЛИЗАЦИЯ ПРЕСЕТОВ =====

    initializePresets() {
        return {
            // Анимации появления текста
            textAnimations: {
                fadeIn: {
                    name: 'Плавное появление',
                    keyframes: [
                        { opacity: 0, transform: 'translateY(20px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    duration: 600,
                    easing: 'ease-out'
                },
                slideInLeft: {
                    name: 'Въезд слева',
                    keyframes: [
                        { opacity: 0, transform: 'translateX(-50px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ],
                    duration: 700,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                },
                slideInRight: {
                    name: 'Въезд справа',
                    keyframes: [
                        { opacity: 0, transform: 'translateX(50px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ],
                    duration: 700,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                },
                slideInUp: {
                    name: 'Въезд снизу',
                    keyframes: [
                        { opacity: 0, transform: 'translateY(30px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    duration: 600,
                    easing: 'ease-out'
                },
                slideInDown: {
                    name: 'Въезд сверху',
                    keyframes: [
                        { opacity: 0, transform: 'translateY(-30px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    duration: 600,
                    easing: 'ease-out'
                },
                zoomIn: {
                    name: 'Увеличение',
                    keyframes: [
                        { opacity: 0, transform: 'scale(0.8)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    duration: 500,
                    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                },
                bounceIn: {
                    name: 'Отскок',
                    keyframes: [
                        { opacity: 0, transform: 'scale(0.3)' },
                        { opacity: 0.7, transform: 'scale(1.05)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    duration: 800,
                    easing: 'ease-out'
                },
                rotateIn: {
                    name: 'Поворот',
                    keyframes: [
                        { opacity: 0, transform: 'rotate(-180deg) scale(0.8)' },
                        { opacity: 1, transform: 'rotate(0deg) scale(1)' }
                    ],
                    duration: 700,
                    easing: 'ease-out'
                },
                typewriter: {
                    name: 'Печатная машинка',
                    type: 'custom',
                    duration: 2000,
                    easing: 'linear'
                }
            },

            // Переходы между слайдами
            slideTransitions: {
                slide: {
                    name: 'Скольжение',
                    duration: 400,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                },
                fade: {
                    name: 'Затухание',
                    duration: 300,
                    easing: 'ease-in-out'
                },
                zoom: {
                    name: 'Масштабирование',
                    duration: 500,
                    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                },
                flip: {
                    name: 'Переворот',
                    duration: 600,
                    easing: 'ease-in-out'
                },
                cube: {
                    name: 'Кубический',
                    duration: 700,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }
            }
        };
    }

    // ===== УПРАВЛЕНИЕ АНИМАЦИЯМИ ТЕКСТА =====

    // Применение анимации к текстовому блоку
    animateTextBlock(blockId, animationType, options = {}) {
        const element = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!element) {
            console.warn(`❌ Элемент с ID ${blockId} не найден`);
            return false;
        }

        const animation = this.presetAnimations.textAnimations[animationType];
        if (!animation) {
            console.warn(`❌ Анимация ${animationType} не найдена`);
            return false;
        }

        // Объединяем настройки
        const config = {
            duration: options.duration || animation.duration,
            easing: options.easing || animation.easing,
            delay: options.delay || 0,
            loop: options.loop || false
        };

        // Специальная обработка для typewriter эффекта
        if (animation.type === 'custom' && animationType === 'typewriter') {
            return this.animateTypewriter(element, config);
        }

        // Стандартная CSS анимация
        return this.applyKeyframeAnimation(element, animation.keyframes, config);
    }

    // Применение keyframe анимации
    applyKeyframeAnimation(element, keyframes, config) {
        try {
            // Создаем уникальный ID для анимации
            const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Применяем анимацию
            const animation = element.animate(keyframes, {
                duration: config.duration,
                easing: config.easing,
                delay: config.delay,
                iterations: config.loop ? Infinity : 1,
                fill: 'forwards'
            });

            // Сохраняем ссылку на анимацию
            this.activeAnimations.set(animationId, {
                animation,
                element,
                config
            });

            // Очищаем после завершения
            animation.addEventListener('finish', () => {
                this.activeAnimations.delete(animationId);
            });

            console.log(`✅ Анимация ${animationId} запущена`);
            return animationId;

        } catch (error) {
            console.error('❌ Ошибка применения анимации:', error);
            return false;
        }
    }

    // Эффект печатной машинки
    animateTypewriter(element, config) {
        const text = element.textContent;
        const duration = config.duration;
        const delay = config.delay || 0;
        
        // Очищаем текст
        element.textContent = '';
        element.style.opacity = '1';
        
        // Добавляем курсор
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '|';
        cursor.style.cssText = `
            animation: blink 1s infinite;
            color: inherit;
        `;
        element.appendChild(cursor);

        // Добавляем CSS для курсора если его нет
        if (!document.getElementById('typewriter-styles')) {
            const style = document.createElement('style');
            style.id = 'typewriter-styles';
            style.textContent = `
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                let currentIndex = 0;
                const interval = duration / text.length;

                const typeInterval = setInterval(() => {
                    if (currentIndex < text.length) {
                        element.textContent = text.substring(0, currentIndex + 1);
                        element.appendChild(cursor);
                        currentIndex++;
                    } else {
                        clearInterval(typeInterval);
                        // Убираем курсор через 1 секунду
                        setTimeout(() => {
                            if (cursor.parentNode) {
                                cursor.remove();
                            }
                        }, 1000);
                        resolve();
                    }
                }, interval);
            }, delay);
        });
    }

    // ===== ПЕРЕХОДЫ МЕЖДУ СЛАЙДАМИ =====

    // Анимированный переход к следующему слайду
    transitionToSlide(direction, transitionType = 'slide') {
        const currentSlide = document.querySelector('.slide.active');
        const nextSlide = this.getNextSlideElement(direction);
        
        if (!currentSlide || !nextSlide) {
            console.warn('❌ Не удалось найти слайды для перехода');
            return false;
        }

        const transition = this.presetAnimations.slideTransitions[transitionType];
        if (!transition) {
            console.warn(`❌ Переход ${transitionType} не найден`);
            return false;
        }

        return this.executeSlideTransition(currentSlide, nextSlide, direction, transition);
    }

    // Выполнение перехода между слайдами
    executeSlideTransition(currentSlide, nextSlide, direction, transition) {
        return new Promise((resolve) => {
            const container = currentSlide.parentElement;
            
            // Подготавливаем слайды
            this.prepareSlideTransition(currentSlide, nextSlide, direction);
            
            // Выбираем тип перехода
            switch (transition.name) {
                case 'Скольжение':
                    this.slideTransition(currentSlide, nextSlide, direction, transition, resolve);
                    break;
                case 'Затухание':
                    this.fadeTransition(currentSlide, nextSlide, transition, resolve);
                    break;
                case 'Масштабирование':
                    this.zoomTransition(currentSlide, nextSlide, direction, transition, resolve);
                    break;
                case 'Переворот':
                    this.flipTransition(currentSlide, nextSlide, direction, transition, resolve);
                    break;
                case 'Кубический':
                    this.cubeTransition(currentSlide, nextSlide, direction, transition, resolve);
                    break;
                default:
                    this.slideTransition(currentSlide, nextSlide, direction, transition, resolve);
            }
        });
    }

    // Подготовка слайдов к переходу
    prepareSlideTransition(currentSlide, nextSlide, direction) {
        // Позиционируем следующий слайд
        nextSlide.style.position = 'absolute';
        nextSlide.style.top = '0';
        nextSlide.style.left = '0';
        nextSlide.style.width = '100%';
        nextSlide.style.height = '100%';
        nextSlide.style.zIndex = '1';
        
        currentSlide.style.zIndex = '2';
    }

    // Переход скольжением
    slideTransition(currentSlide, nextSlide, direction, transition, callback) {
        const translateX = direction === 'next' ? '-100%' : '100%';
        const nextTranslateX = direction === 'next' ? '100%' : '-100%';
        
        // Позиционируем следующий слайд
        nextSlide.style.transform = `translateX(${nextTranslateX})`;
        nextSlide.style.opacity = '1';
        
        // Анимируем переход
        const currentAnimation = currentSlide.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(${translateX})` }
        ], {
            duration: transition.duration,
            easing: transition.easing,
            fill: 'forwards'
        });

        const nextAnimation = nextSlide.animate([
            { transform: `translateX(${nextTranslateX})` },
            { transform: 'translateX(0)' }
        ], {
            duration: transition.duration,
            easing: transition.easing,
            fill: 'forwards'
        });

        nextAnimation.addEventListener('finish', () => {
            this.finishSlideTransition(currentSlide, nextSlide);
            callback();
        });
    }

    // Переход затуханием
    fadeTransition(currentSlide, nextSlide, transition, callback) {
        nextSlide.style.opacity = '0';
        
        const fadeOut = currentSlide.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: transition.duration / 2,
            easing: transition.easing,
            fill: 'forwards'
        });

        fadeOut.addEventListener('finish', () => {
            const fadeIn = nextSlide.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: transition.duration / 2,
                easing: transition.easing,
                fill: 'forwards'
            });

            fadeIn.addEventListener('finish', () => {
                this.finishSlideTransition(currentSlide, nextSlide);
                callback();
            });
        });
    }

    // Переход масштабированием
    zoomTransition(currentSlide, nextSlide, direction, transition, callback) {
        nextSlide.style.transform = 'scale(0.8)';
        nextSlide.style.opacity = '0';
        
        const zoomOut = currentSlide.animate([
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.2)', opacity: 0 }
        ], {
            duration: transition.duration / 2,
            easing: transition.easing,
            fill: 'forwards'
        });

        zoomOut.addEventListener('finish', () => {
            const zoomIn = nextSlide.animate([
                { transform: 'scale(0.8)', opacity: 0 },
                { transform: 'scale(1)', opacity: 1 }
            ], {
                duration: transition.duration / 2,
                easing: transition.easing,
                fill: 'forwards'
            });

            zoomIn.addEventListener('finish', () => {
                this.finishSlideTransition(currentSlide, nextSlide);
                callback();
            });
        });
    }

    // Переход переворотом
    flipTransition(currentSlide, nextSlide, direction, transition, callback) {
        const rotateY = direction === 'next' ? 'rotateY(-90deg)' : 'rotateY(90deg)';
        const nextRotateY = direction === 'next' ? 'rotateY(90deg)' : 'rotateY(-90deg)';
        
        nextSlide.style.transform = nextRotateY;
        nextSlide.style.opacity = '0';
        
        const flipOut = currentSlide.animate([
            { transform: 'rotateY(0deg)', opacity: 1 },
            { transform: rotateY, opacity: 0 }
        ], {
            duration: transition.duration / 2,
            easing: transition.easing,
            fill: 'forwards'
        });

        flipOut.addEventListener('finish', () => {
            const flipIn = nextSlide.animate([
                { transform: nextRotateY, opacity: 0 },
                { transform: 'rotateY(0deg)', opacity: 1 }
            ], {
                duration: transition.duration / 2,
                easing: transition.easing,
                fill: 'forwards'
            });

            flipIn.addEventListener('finish', () => {
                this.finishSlideTransition(currentSlide, nextSlide);
                callback();
            });
        });
    }

    // Кубический переход
    cubeTransition(currentSlide, nextSlide, direction, transition, callback) {
        // Создаем 3D контейнер
        const container = currentSlide.parentElement;
        container.style.perspective = '1000px';
        container.style.perspectiveOrigin = '50% 50%';
        
        const rotateY = direction === 'next' ? '-90deg' : '90deg';
        const nextRotateY = direction === 'next' ? '90deg' : '-90deg';
        
        // Позиционируем слайды для 3D эффекта
        currentSlide.style.transformOrigin = direction === 'next' ? 'right center' : 'left center';
        nextSlide.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';
        nextSlide.style.transform = `rotateY(${nextRotateY})`;
        
        const cubeRotation = container.animate([
            { transform: 'rotateY(0deg)' },
            { transform: `rotateY(${rotateY})` }
        ], {
            duration: transition.duration,
            easing: transition.easing,
            fill: 'forwards'
        });

        cubeRotation.addEventListener('finish', () => {
            this.finishSlideTransition(currentSlide, nextSlide);
            container.style.perspective = '';
            container.style.perspectiveOrigin = '';
            callback();
        });
    }

    // Завершение перехода слайда
    finishSlideTransition(currentSlide, nextSlide) {
        // Очищаем стили
        currentSlide.classList.remove('active');
        currentSlide.style.transform = '';
        currentSlide.style.opacity = '';
        currentSlide.style.position = '';
        currentSlide.style.zIndex = '';
        
        nextSlide.classList.add('active');
        nextSlide.style.transform = '';
        nextSlide.style.opacity = '';
        nextSlide.style.position = '';
        nextSlide.style.zIndex = '';
    }

    // Получение следующего слайда
    getNextSlideElement(direction) {
        const slides = document.querySelectorAll('.slide');
        const currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
        
        let nextIndex;
        if (direction === 'next') {
            nextIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
        } else {
            nextIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
        }
        
        return slides[nextIndex];
    }

    // ===== УПРАВЛЕНИЕ АНИМАЦИЯМИ =====

    // Остановка всех анимаций
    stopAllAnimations() {
        this.activeAnimations.forEach((animData, animId) => {
            animData.animation.cancel();
        });
        this.activeAnimations.clear();
        console.log('🛑 Все анимации остановлены');
    }

    // Остановка конкретной анимации
    stopAnimation(animationId) {
        const animData = this.activeAnimations.get(animationId);
        if (animData) {
            animData.animation.cancel();
            this.activeAnimations.delete(animationId);
            console.log(`🛑 Анимация ${animationId} остановлена`);
            return true;
        }
        return false;
    }

    // Пауза/возобновление анимации
    pauseAnimation(animationId) {
        const animData = this.activeAnimations.get(animationId);
        if (animData) {
            animData.animation.pause();
            return true;
        }
        return false;
    }

    playAnimation(animationId) {
        const animData = this.activeAnimations.get(animationId);
        if (animData) {
            animData.animation.play();
            return true;
        }
        return false;
    }

    // ===== АНИМАЦИЯ ВСЕХ ТЕКСТОВЫХ БЛОКОВ СЛАЙДА =====

    // Анимация появления всех блоков слайда
    animateSlideTextBlocks(slideId, staggerDelay = 200) {
        const slide = this.state.getSlideById(slideId);
        if (!slide || !slide.textBlocks) {
            console.warn(`❌ Слайд ${slideId} не найден или не содержит текстовых блоков`);
            return;
        }

        slide.textBlocks.forEach((block, index) => {
            const animationType = block.animation || 'fadeIn';
            const delay = index * staggerDelay;
            
            setTimeout(() => {
                this.animateTextBlock(block.id, animationType, { delay: 0 });
            }, delay);
        });

        console.log(`✅ Запущена анимация ${slide.textBlocks.length} блоков слайда ${slideId}`);
    }

    // ===== ПОЛУЧЕНИЕ ДОСТУПНЫХ АНИМАЦИЙ =====

    // Получение списка анимаций текста
    getTextAnimations() {
        return Object.keys(this.presetAnimations.textAnimations).map(key => ({
            id: key,
            name: this.presetAnimations.textAnimations[key].name,
            duration: this.presetAnimations.textAnimations[key].duration
        }));
    }

    // Получение списка переходов слайдов
    getSlideTransitions() {
        return Object.keys(this.presetAnimations.slideTransitions).map(key => ({
            id: key,
            name: this.presetAnimations.slideTransitions[key].name,
            duration: this.presetAnimations.slideTransitions[key].duration
        }));
    }

    // ===== ОЧИСТКА РЕСУРСОВ =====

    destroy() {
        this.stopAllAnimations();
        this.activeAnimations.clear();
        this.animationQueue = [];
        
        console.log('✅ AnimationManager уничтожен');
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}