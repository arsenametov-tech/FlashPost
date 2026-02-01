// ===== DOM UPDATE QUEUE SYSTEM =====
// Prevents race conditions and batches DOM updates

class DOMUpdateQueue {
    constructor() {
        this.updateQueue = [];
        this.isProcessing = false;
        this.debounceTimeout = null;
        this.batchTimeout = null;
        
        console.log('✅ DOMUpdateQueue инициализирован');
    }

    // Добавление обновления в очередь
    enqueue(updateFunction, priority = 'normal') {
        const update = {
            id: Date.now() + Math.random(),
            function: updateFunction,
            priority: priority, // 'high' | 'normal' | 'low'
            timestamp: Date.now()
        };
        
        this.updateQueue.push(update);
        
        // Сортируем по приоритету
        this.updateQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        // Запускаем обработку
        this.scheduleProcessing();
        
        return update.id;
    }

    // Планирование обработки очереди
    scheduleProcessing() {
        if (this.isProcessing) return;
        
        // Дебаунсинг для частых обновлений
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.processQueue();
        }, 16); // ~60fps
    }

    // Обработка очереди обновлений
    async processQueue() {
        if (this.isProcessing || this.updateQueue.length === 0) return;
        
        this.isProcessing = true;
        console.log(`🔄 Обработка ${this.updateQueue.length} DOM обновлений...`);
        
        try {
            // Батчинг обновлений
            const batch = this.updateQueue.splice(0, 10); // Максимум 10 за раз
            
            // Выполняем обновления синхронно в батче
            for (const update of batch) {
                try {
                    await update.function();
                } catch (error) {
                    console.error('❌ Ошибка в DOM обновлении:', error);
                }
            }
            
            // Если остались обновления, планируем следующий батч
            if (this.updateQueue.length > 0) {
                this.batchTimeout = setTimeout(() => {
                    this.isProcessing = false;
                    this.processQueue();
                }, 4); // Небольшая пауза между батчами
            } else {
                this.isProcessing = false;
            }
            
        } catch (error) {
            console.error('❌ Критическая ошибка в очереди DOM обновлений:', error);
            this.isProcessing = false;
        }
    }

    // Очистка очереди
    clear() {
        this.updateQueue = [];
        this.isProcessing = false;
        
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
        
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        console.log('🧹 Очередь DOM обновлений очищена');
    }

    // Получение статистики очереди
    getStats() {
        return {
            queueLength: this.updateQueue.length,
            isProcessing: this.isProcessing,
            highPriorityCount: this.updateQueue.filter(u => u.priority === 'high').length,
            normalPriorityCount: this.updateQueue.filter(u => u.priority === 'normal').length,
            lowPriorityCount: this.updateQueue.filter(u => u.priority === 'low').length
        };
    }
}

// Глобальный экземпляр очереди
window.domUpdateQueue = new DOMUpdateQueue();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUpdateQueue;
} else {
    window.DOMUpdateQueue = DOMUpdateQueue;
}