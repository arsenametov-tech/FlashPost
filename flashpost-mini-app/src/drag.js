// ===== DRAG & DROP MODULE =====
// Handles drag & resize logic for text blocks

class DragManager {
    constructor(stateManager) {
        this.state = stateManager;
        
        // === ВРЕМЕННЫЕ ДАННЫЕ DRAG & DROP (НЕ СОСТОЯНИЕ) ===
        // Эти данные используются только во время активного перетаскивания
        // и не дублируют состояние проекта
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartLeft = 0;
        this.dragStartTop = 0;
        
        // Привязываем методы к контексту для глобальных обработчиков
        this.onDragMove = this.onDragMove.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        
        console.log('✅ DragManager инициализирован');
    }

    // ===== ОСНОВНЫЕ МЕТОДЫ DRAG & DROP =====

    // Привязка drag & drop событий
    bindDragEvents() {
        // Глобальные обработчики уже привязываются в startDrag/stopDrag
        // Здесь только логирование
        console.log('✅ Drag events system ready (global handlers)');
    }

    // Начало перетаскивания (стабильное)
    startDrag(e, blockId) {
        e.preventDefault();
        e.stopPropagation();
        
        // Проверяем, что мы в режиме редактирования
        if (!this.state.isMode('edit')) {
            console.warn('⚠️ Drag доступен только в режиме редактирования');
            return;
        }
        
        // Устанавливаем состояние перетаскивания ТОЛЬКО в StateManager
        this.state.setDragState(blockId, true);
        
        // Сохраняем начальные координаты (временные данные)
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Получаем элемент блока
        const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockEl) {
            const rect = blockEl.getBoundingClientRect();
            this.dragStartLeft = rect.left;
            this.dragStartTop = rect.top;
            
            // Устанавливаем активный блок
            this.state.setActiveTextBlock(blockId);
        }
        
        // Добавляем глобальные обработчики
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.stopDrag);
        
        // Добавляем визуальную обратную связь
        this.addDragVisualFeedback(blockId);
        
        console.log(`🎯 Начало перетаскивания блока: ${blockId}`);
    }

    // Движение мыши (полностью контролируемое состоянием)
    onDragMove(e) {
        // Получаем состояние перетаскивания из StateManager
        const dragState = this.state.getDragState();
        if (!dragState.isDragging || !dragState.blockId) return;
        
        e.preventDefault();
        
        // Вычисляем смещение
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Получаем родительский слайд для вычисления относительных координат
        const slideEl = document.querySelector('.slide');
        if (!slideEl) return;
        
        const slideRect = slideEl.getBoundingClientRect();
        
        // Вычисляем новые координаты в процентах
        const newLeft = this.dragStartLeft + deltaX;
        const newTop = this.dragStartTop + deltaY;
        
        const newX = ((newLeft - slideRect.left) / slideRect.width) * 100;
        const newY = ((newTop - slideRect.top) / slideRect.height) * 100;
        
        // Ограничиваем координаты границами слайда
        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(95, newY));
        
        // ТОЛЬКО обновляем состояние - DOM обновится автоматически через колбэки
        this.state.updateTextBlockProperty(dragState.blockId, 'x', clampedX);
        this.state.updateTextBlockProperty(dragState.blockId, 'y', clampedY);
        
        // НЕ ОБНОВЛЯЕМ DOM НАПРЯМУЮ - это делает StateManager через колбэки
        console.log(`🎯 Позиция блока ${dragState.blockId} обновлена в состоянии: (${clampedX.toFixed(1)}%, ${clampedY.toFixed(1)}%)`);
    }


    // Завершение перетаскивания (стабильное)
    stopDrag(e) {
        const dragState = this.state.getDragState();
        if (!dragState.isDragging) return;
        
        e.preventDefault();
        
        // Убираем глобальные обработчики
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.stopDrag);
        
        // Убираем визуальную обратную связь
        this.removeDragVisualFeedback(dragState.blockId);
        
        console.log(`✅ Завершено перетаскивание блока: ${dragState.blockId}`);
        
        // Сбрасываем состояние перетаскивания в StateManager
        this.state.setDragState(null, false);
        
        // Сбрасываем временные данные
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartLeft = 0;
        this.dragStartTop = 0;
    }

    // ===== ВИЗУАЛЬНАЯ ОБРАТНАЯ СВЯЗЬ =====

    // Добавление визуальной обратной связи при перетаскивании
    addDragVisualFeedback(blockId) {
        const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!blockEl) return;
        
        // Добавляем класс для стилизации
        blockEl.classList.add('dragging');
        
        // Меняем курсор
        blockEl.style.cursor = 'grabbing';
        
        // Добавляем тень
        blockEl.style.boxShadow = '0 8px 25px rgba(131, 58, 180, 0.4)';
        
        // Немного увеличиваем
        blockEl.style.transform = 'translate(-50%, -50%) scale(1.05)';
        
        // Увеличиваем z-index
        blockEl.style.zIndex = '1000';
    }

    // Удаление визуальной обратной связи
    removeDragVisualFeedback(blockId) {
        const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!blockEl) return;
        
        // Убираем класс
        blockEl.classList.remove('dragging');
        
        // Возвращаем курсор
        blockEl.style.cursor = 'grab';
        
        // Убираем тень
        blockEl.style.boxShadow = '';
        
        // Возвращаем размер
        blockEl.style.transform = 'translate(-50%, -50%) scale(1)';
        
        // Возвращаем z-index
        blockEl.style.zIndex = '10';
    }

    // ===== RESIZE ФУНКЦИОНАЛЬНОСТЬ =====

    // Инициализация resize для текстового блока (полностью контролируемое состоянием)
    initializeResize(blockEl, blockId) {
        const resizeHandle = blockEl.querySelector('.text-block-resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let resizeStartX = 0;
        let resizeStartWidth = 0;
        
        const startResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            resizeStartX = e.clientX;
            
            // Получаем ширину из состояния, не из DOM
            const block = this.state.getActiveSlide()?.textBlocks.find(b => b.id === blockId);
            resizeStartWidth = block ? block.width : 80;
            
            // Добавляем глобальные обработчики для resize
            const onResizeMove = (e) => {
                if (!isResizing) return;
                
                const deltaX = e.clientX - resizeStartX;
                const slideEl = blockEl.closest('.slide');
                if (!slideEl) return;
                
                const slideWidth = slideEl.offsetWidth;
                const deltaPercent = (deltaX / slideWidth) * 100;
                const newWidth = resizeStartWidth + deltaPercent;
                
                // Ограничиваем ширину
                const clampedWidth = Math.max(10, Math.min(90, newWidth));
                
                // ТОЛЬКО обновляем состояние - DOM обновится автоматически через колбэки
                this.state.updateTextBlockProperty(blockId, 'width', clampedWidth);
                
                console.log(`📏 Ширина блока ${blockId} обновлена в состоянии: ${clampedWidth.toFixed(1)}%`);
            };
            
            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', onResizeMove);
                document.removeEventListener('mouseup', stopResize);
                
                // Убираем визуальную обратную связь
                blockEl.classList.remove('resizing');
            };
            
            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', stopResize);
            
            // Добавляем визуальную обратную связь
            blockEl.classList.add('resizing');
        };
        
        resizeHandle.addEventListener('mousedown', startResize);
    }

    // ===== TOUCH СОБЫТИЯ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ =====

    // Привязка touch событий для мобильных устройств
    bindTouchEvents(blockEl, blockId) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartLeft = 0;
        let touchStartTop = 0;
        let isTouchDragging = false;
        
        const onTouchStart = (e) => {
            if (!this.state.isMode('edit')) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            
            const rect = blockEl.getBoundingClientRect();
            touchStartLeft = rect.left;
            touchStartTop = rect.top;
            
            isTouchDragging = true;
            
            // Устанавливаем активный блок
            this.state.setActiveTextBlock(blockId);
            
            // Добавляем визуальную обратную связь
            this.addDragVisualFeedback(blockId);
        };
        
        const onTouchMove = (e) => {
            if (!isTouchDragging) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Получаем родительский слайд
            const slideEl = blockEl.closest('.slide');
            if (!slideEl) return;
            
            const slideRect = slideEl.getBoundingClientRect();
            
            // Вычисляем новые координаты
            const newLeft = touchStartLeft + deltaX;
            const newTop = touchStartTop + deltaY;
            
            const newX = ((newLeft - slideRect.left) / slideRect.width) * 100;
            const newY = ((newTop - slideRect.top) / slideRect.height) * 100;
            
            // Ограничиваем координаты
            const clampedX = Math.max(0, Math.min(100, newX));
            const clampedY = Math.max(0, Math.min(100, newY));
            
            // ТОЛЬКО обновляем состояние - DOM обновится автоматически через колбэки
            this.state.updateTextBlockProperty(blockId, 'x', clampedX);
            this.state.updateTextBlockProperty(blockId, 'y', clampedY);
            
            console.log(`📱 Touch позиция блока ${blockId} обновлена в состоянии: (${clampedX.toFixed(1)}%, ${clampedY.toFixed(1)}%)`);
        };
        
        const onTouchEnd = (e) => {
            if (!isTouchDragging) return;
            
            e.preventDefault();
            
            isTouchDragging = false;
            
            // Убираем визуальную обратную связь
            this.removeDragVisualFeedback(blockId);
        };
        
        blockEl.addEventListener('touchstart', onTouchStart, { passive: false });
        blockEl.addEventListener('touchmove', onTouchMove, { passive: false });
        blockEl.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    // ===== УТИЛИТЫ =====

    // Проверка, происходит ли перетаскивание
    isDragInProgress() {
        return this.state.getDragState().isDragging;
    }

    // Получение ID перетаскиваемого блока
    getDraggedBlockId() {
        return this.state.getDragState().blockId;
    }

    // Принудительная остановка перетаскивания
    forceDragStop() {
        const dragState = this.state.getDragState();
        if (dragState.isDragging) {
            this.removeDragVisualFeedback(dragState.blockId);
            
            // Убираем глобальные обработчики
            document.removeEventListener('mousemove', this.onDragMove);
            document.removeEventListener('mouseup', this.stopDrag);
            
            // Сбрасываем состояние в StateManager
            this.state.setDragState(null, false);
            
            console.log('🛑 Перетаскивание принудительно остановлено');
        }
    }

    // Привязка drag событий к текстовому блоку
    bindTextBlockDragEvents(blockEl, blockId) {
        // Mouse события
        blockEl.addEventListener('mousedown', (e) => this.startDrag(e, blockId));
        
        // Touch события для мобильных устройств
        this.bindTouchEvents(blockEl, blockId);
        
        // Инициализация resize
        this.initializeResize(blockEl, blockId);
        
        // Добавляем курсор
        blockEl.style.cursor = 'grab';
        
        console.log(`✅ Drag события привязаны к блоку: ${blockId}`);
    }

    // Отвязка drag событий от текстового блока
    unbindTextBlockDragEvents(blockEl) {
        // Клонируем элемент для удаления всех обработчиков
        const newBlockEl = blockEl.cloneNode(true);
        blockEl.parentNode.replaceChild(newBlockEl, blockEl);
        
        console.log('✅ Drag события отвязаны от блока');
        return newBlockEl;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragManager;
} else {
    window.DragManager = DragManager;
}