// ===== PERFORMANCE MANAGER =====
// Handles performance optimizations and debouncing

class PerformanceManager {
    constructor() {
        this.debounceTimers = new Map();
        this.rafCallbacks = new Set();
        this.memoryMonitor = null;
        
        console.log('✅ PerformanceManager инициализирован');
        
        // Запускаем мониторинг производительности
        this.startPerformanceMonitoring();
    }

    // ===== DEBOUNCING СИСТЕМА =====

    // Универсальный debounce для функций
    debounce(key, callback, delay = 300) {
        try {
            // Очищаем предыдущий таймер
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            // Устанавливаем новый таймер
            const timer = setTimeout(() => {
                this.debounceTimers.delete(key);
                callback();
            }, delay);
            
            this.debounceTimers.set(key, timer);
            
        } catch (error) {
            console.error('❌ Ошибка debounce:', error);
            // В случае ошибки выполняем callback сразу
            callback();
        }
    }

    // Debounce для пользовательского ввода
    debounceUserInput(inputElement, callback, delay = 300) {
        if (!inputElement) return;
        
        const key = `input_${inputElement.id || 'default'}`;
        
        inputElement.addEventListener('input', () => {
            this.debounce(key, () => {
                callback(inputElement.value);
            }, delay);
        });
    }

    // Debounce для изменения размера окна
    debounceResize(callback, delay = 100) {
        const key = 'window_resize';
        
        window.addEventListener('resize', () => {
            this.debounce(key, callback, delay);
        });
    }

    // Debounce для скролла
    debounceScroll(callback, delay = 50) {
        const key = 'window_scroll';
        
        window.addEventListener('scroll', () => {
            this.debounce(key, callback, delay);
        });
    }

    // ===== ОПТИМИЗАЦИЯ DOM =====

    // Батчинг DOM операций через requestAnimationFrame
    batchDOMUpdates(callback) {
        try {
            if (this.rafCallbacks.has(callback)) {
                return; // Уже запланировано
            }
            
            this.rafCallbacks.add(callback);
            
            requestAnimationFrame(() => {
                try {
                    callback();
                } catch (error) {
                    console.error('❌ Ошибка в batched DOM операции:', error);
                } finally {
                    this.rafCallbacks.delete(callback);
                }
            });
            
        } catch (error) {
            console.error('❌ Ошибка планирования DOM операции:', error);
            // Fallback - выполняем сразу
            callback();
        }
    }

    // Оптимизированное обновление стилей
    updateStylesOptimized(element, styles) {
        if (!element) return;
        
        this.batchDOMUpdates(() => {
            try {
                // Применяем все стили за один раз
                Object.assign(element.style, styles);
            } catch (error) {
                console.error('❌ Ошибка обновления стилей:', error);
            }
        });
    }

    // Оптимизированное добавление классов
    updateClassesOptimized(element, classesToAdd = [], classesToRemove = []) {
        if (!element) return;
        
        this.batchDOMUpdates(() => {
            try {
                // Удаляем классы
                if (classesToRemove.length > 0) {
                    element.classList.remove(...classesToRemove);
                }
                
                // Добавляем классы
                if (classesToAdd.length > 0) {
                    element.classList.add(...classesToAdd);
                }
            } catch (error) {
                console.error('❌ Ошибка обновления классов:', error);
            }
        });
    }

    // ===== GRACEFUL DEGRADATION =====

    // Проверка поддержки API с fallback
    checkAPISupport(apiName, fallbackCallback = null) {
        try {
            switch (apiName) {
                case 'requestAnimationFrame':
                    if (!window.requestAnimationFrame) {
                        window.requestAnimationFrame = fallbackCallback || 
                            ((callback) => setTimeout(callback, 16));
                        return false;
                    }
                    return true;
                    
                case 'IntersectionObserver':
                    return 'IntersectionObserver' in window;
                    
                case 'ResizeObserver':
                    return 'ResizeObserver' in window;
                    
                case 'localStorage':
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        return true;
                    } catch {
                        return false;
                    }
                    
                case 'canvas':
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext && canvas.getContext('2d'));
                    
                case 'webgl':
                    const canvas2 = document.createElement('canvas');
                    return !!(canvas2.getContext && canvas2.getContext('webgl'));
                    
                default:
                    return true;
            }
        } catch (error) {
            console.error(`❌ Ошибка проверки API ${apiName}:`, error);
            return false;
        }
    }

    // Безопасное использование localStorage
    safeLocalStorage = {
        getItem: (key) => {
            try {
                if (this.checkAPISupport('localStorage')) {
                    return localStorage.getItem(key);
                }
                return null;
            } catch (error) {
                console.error('❌ Ошибка чтения localStorage:', error);
                return null;
            }
        },
        
        setItem: (key, value) => {
            try {
                if (this.checkAPISupport('localStorage')) {
                    localStorage.setItem(key, value);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('❌ Ошибка записи localStorage:', error);
                return false;
            }
        },
        
        removeItem: (key) => {
            try {
                if (this.checkAPISupport('localStorage')) {
                    localStorage.removeItem(key);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('❌ Ошибка удаления localStorage:', error);
                return false;
            }
        }
    };

    // ===== МОНИТОРИНГ ПРОИЗВОДИТЕЛЬНОСТИ =====

    // Запуск мониторинга производительности
    startPerformanceMonitoring() {
        try {
            // Мониторинг памяти (если доступно)
            if ('memory' in performance) {
                this.memoryMonitor = setInterval(() => {
                    this.checkMemoryUsage();
                }, 30000); // Каждые 30 секунд
            }
            
            // Мониторинг FPS
            this.startFPSMonitoring();
            
            // Мониторинг долгих задач (если доступно)
            if ('PerformanceObserver' in window) {
                this.startLongTaskMonitoring();
            }
            
        } catch (error) {
            console.error('❌ Ошибка запуска мониторинга производительности:', error);
        }
    }

    // Проверка использования памяти
    checkMemoryUsage() {
        try {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
                const usagePercent = (usedMB / limitMB) * 100;
                
                console.log(`📊 Память: ${usedMB}MB / ${limitMB}MB (${usagePercent.toFixed(1)}%)`);
                
                // Предупреждение при высоком использовании памяти
                if (usagePercent > 80) {
                    console.warn('⚠️ Высокое использование памяти:', usagePercent.toFixed(1) + '%');
                    this.suggestMemoryCleanup();
                }
            }
        } catch (error) {
            console.error('❌ Ошибка проверки памяти:', error);
        }
    }

    // Мониторинг FPS
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn('⚠️ Низкий FPS:', fps);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    // Мониторинг долгих задач
    startLongTaskMonitoring() {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('⚠️ Долгая задача:', entry.duration.toFixed(2) + 'ms');
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
            
        } catch (error) {
            console.error('❌ Ошибка мониторинга долгих задач:', error);
        }
    }

    // Предложения по очистке памяти
    suggestMemoryCleanup() {
        console.log('🧹 Рекомендации по очистке памяти:');
        console.log('- Очистка неиспользуемых event listeners');
        console.log('- Удаление неиспользуемых DOM элементов');
        console.log('- Очистка кэшей и временных данных');
        
        // Автоматическая очистка
        this.performAutomaticCleanup();
    }

    // Автоматическая очистка памяти
    performAutomaticCleanup() {
        try {
            // Очищаем завершенные debounce таймеры
            for (const [key, timer] of this.debounceTimers.entries()) {
                if (timer._destroyed) {
                    this.debounceTimers.delete(key);
                }
            }
            
            // Принудительная сборка мусора (если доступна)
            if (window.gc) {
                window.gc();
                console.log('🧹 Принудительная сборка мусора выполнена');
            }
            
        } catch (error) {
            console.error('❌ Ошибка автоматической очистки:', error);
        }
    }

    // ===== УТИЛИТЫ =====

    // Измерение времени выполнения функции
    measurePerformance(name, callback) {
        const startTime = performance.now();
        
        try {
            const result = callback();
            
            // Если результат - Promise
            if (result && typeof result.then === 'function') {
                return result.finally(() => {
                    const endTime = performance.now();
                    console.log(`⏱️ ${name}: ${(endTime - startTime).toFixed(2)}ms`);
                });
            } else {
                const endTime = performance.now();
                console.log(`⏱️ ${name}: ${(endTime - startTime).toFixed(2)}ms`);
                return result;
            }
            
        } catch (error) {
            const endTime = performance.now();
            console.error(`❌ ${name} (${(endTime - startTime).toFixed(2)}ms):`, error);
            throw error;
        }
    }

    // Очистка ресурсов при уничтожении
    destroy() {
        try {
            // Очищаем все debounce таймеры
            for (const timer of this.debounceTimers.values()) {
                clearTimeout(timer);
            }
            this.debounceTimers.clear();
            
            // Очищаем RAF callbacks
            this.rafCallbacks.clear();
            
            // Останавливаем мониторинг памяти
            if (this.memoryMonitor) {
                clearInterval(this.memoryMonitor);
                this.memoryMonitor = null;
            }
            
            console.log('✅ PerformanceManager очищен');
            
        } catch (error) {
            console.error('❌ Ошибка очистки PerformanceManager:', error);
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
}