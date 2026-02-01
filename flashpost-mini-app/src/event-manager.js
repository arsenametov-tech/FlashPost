// ===== EVENT MANAGEMENT SYSTEM =====
// Prevents memory leaks and manages event handlers properly

class EventManager {
    constructor() {
        this.eventHandlers = new Map(); // element -> handlers[]
        this.globalHandlers = [];
        this.isDestroyed = false;
        
        console.log('✅ EventManager инициализирован');
    }

    // Добавление обработчика события с автоматической очисткой
    addEventListener(element, event, handler, options = {}) {
        if (this.isDestroyed) {
            console.warn('⚠️ EventManager уничтожен, игнорируем addEventListener');
            return null;
        }

        if (!element || typeof handler !== 'function') {
            console.error('❌ Неверные параметры для addEventListener');
            return null;
        }

        // Создаем обертку для обработчика с защитой от ошибок
        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('❌ Ошибка в обработчике события:', error);
            }
        };

        // Добавляем обработчик
        element.addEventListener(event, wrappedHandler, options);

        // Сохраняем для последующей очистки
        const handlerInfo = {
            element,
            event,
            handler: wrappedHandler,
            originalHandler: handler,
            options,
            id: Date.now() + Math.random()
        };

        if (!this.eventHandlers.has(element)) {
            this.eventHandlers.set(element, []);
        }
        this.eventHandlers.get(element).push(handlerInfo);

        console.log(`🔗 Добавлен обработчик ${event} для элемента`);
        return handlerInfo.id;
    }

    // Удаление конкретного обработчика
    removeEventListener(element, event, originalHandler) {
        if (!this.eventHandlers.has(element)) return false;

        const handlers = this.eventHandlers.get(element);
        const handlerIndex = handlers.findIndex(h => 
            h.event === event && h.originalHandler === originalHandler
        );

        if (handlerIndex === -1) return false;

        const handlerInfo = handlers[handlerIndex];
        element.removeEventListener(event, handlerInfo.handler, handlerInfo.options);
        handlers.splice(handlerIndex, 1);

        // Если больше нет обработчиков для элемента, удаляем из Map
        if (handlers.length === 0) {
            this.eventHandlers.delete(element);
        }

        console.log(`🗑️ Удален обработчик ${event} для элемента`);
        return true;
    }

    // Удаление всех обработчиков для элемента
    removeAllEventListeners(element) {
        if (!this.eventHandlers.has(element)) return 0;

        const handlers = this.eventHandlers.get(element);
        let removedCount = 0;

        handlers.forEach(handlerInfo => {
            element.removeEventListener(
                handlerInfo.event, 
                handlerInfo.handler, 
                handlerInfo.options
            );
            removedCount++;
        });

        this.eventHandlers.delete(element);
        console.log(`🗑️ Удалено ${removedCount} обработчиков для элемента`);
        return removedCount;
    }

    // Добавление глобального обработчика (document, window)
    addGlobalEventListener(target, event, handler, options = {}) {
        if (this.isDestroyed) return null;

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('❌ Ошибка в глобальном обработчике:', error);
            }
        };

        target.addEventListener(event, wrappedHandler, options);

        const handlerInfo = {
            target,
            event,
            handler: wrappedHandler,
            originalHandler: handler,
            options,
            id: Date.now() + Math.random()
        };

        this.globalHandlers.push(handlerInfo);
        console.log(`🌐 Добавлен глобальный обработчик ${event}`);
        return handlerInfo.id;
    }

    // Удаление глобального обработчика
    removeGlobalEventListener(target, event, originalHandler) {
        const handlerIndex = this.globalHandlers.findIndex(h => 
            h.target === target && h.event === event && h.originalHandler === originalHandler
        );

        if (handlerIndex === -1) return false;

        const handlerInfo = this.globalHandlers[handlerIndex];
        target.removeEventListener(event, handlerInfo.handler, handlerInfo.options);
        this.globalHandlers.splice(handlerIndex, 1);

        console.log(`🗑️ Удален глобальный обработчик ${event}`);
        return true;
    }

    // Очистка всех обработчиков
    cleanup() {
        console.log('🧹 Очистка всех обработчиков событий...');

        // Очищаем обработчики элементов
        let totalRemoved = 0;
        this.eventHandlers.forEach((handlers, element) => {
            handlers.forEach(handlerInfo => {
                element.removeEventListener(
                    handlerInfo.event, 
                    handlerInfo.handler, 
                    handlerInfo.options
                );
                totalRemoved++;
            });
        });
        this.eventHandlers.clear();

        // Очищаем глобальные обработчики
        this.globalHandlers.forEach(handlerInfo => {
            handlerInfo.target.removeEventListener(
                handlerInfo.event, 
                handlerInfo.handler, 
                handlerInfo.options
            );
            totalRemoved++;
        });
        this.globalHandlers = [];

        console.log(`✅ Очищено ${totalRemoved} обработчиков событий`);
    }

    // Уничтожение менеджера
    destroy() {
        this.cleanup();
        this.isDestroyed = true;
        console.log('💥 EventManager уничтожен');
    }

    // Получение статистики
    getStats() {
        const elementHandlersCount = Array.from(this.eventHandlers.values())
            .reduce((sum, handlers) => sum + handlers.length, 0);

        return {
            elementHandlers: elementHandlersCount,
            globalHandlers: this.globalHandlers.length,
            totalElements: this.eventHandlers.size,
            isDestroyed: this.isDestroyed
        };
    }

    // Проверка на утечки памяти
    checkForLeaks() {
        const stats = this.getStats();
        const threshold = 100; // Порог для предупреждения

        if (stats.elementHandlers > threshold) {
            console.warn(`⚠️ Возможная утечка памяти: ${stats.elementHandlers} обработчиков элементов`);
        }

        if (stats.globalHandlers > 20) {
            console.warn(`⚠️ Много глобальных обработчиков: ${stats.globalHandlers}`);
        }

        return stats;
    }
}

// Глобальный экземпляр менеджера событий
window.eventManager = new EventManager();

// Автоматическая очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.eventManager) {
        window.eventManager.destroy();
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}