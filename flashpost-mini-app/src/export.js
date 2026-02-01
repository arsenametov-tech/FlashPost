// ===== EXPORT MODULE =====
// Handles html2canvas + zip export functionality

class ExportManager {
    constructor(stateManager) {
        this.state = stateManager;
        console.log('✅ ExportManager инициализирован');
    }

    // ===== ОСНОВНЫЕ МЕТОДЫ ЭКСПОРТА =====

    // Скачивание всех слайдов
    async downloadAllSlides(format = 'PNG', quality = '720p') {
        try {
            this.showToast('📥 Подготовка к экспорту...', 'info');
            
            // Проверяем лимиты пользователя
            if (!this.checkExportLimits(format, quality)) {
                this.showUpgradeModal();
                return;
            }
            
            // Показываем прогресс экспорта
            this.showExportProgress(0);
            
            // Переключаемся в режим экспорта для правильного рендеринга
            const originalMode = this.state.getMode();
            await this.state.setMode('export');
            
            // Ждем обновления DOM
            await this.nextTick();
            
            // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямого доступа
            const slidesCount = this.state.getSlidesCount();
            if (slidesCount === 0) {
                this.showToast('Нет слайдов для экспорта', 'error');
                this.hideExportProgress();
                return;
            }

            // Создаем ZIP архив с выбранным качеством
            const exportData = await this.exportAllSlidesToImages(format, quality);
            
            if (exportData.success) {
                this.showToast(`✅ Экспортировано ${exportData.count} слайдов`, 'success');
                
                // Скачиваем архив
                this.downloadZipFile(exportData.zipBlob, `flashpost-carousel-${quality}.zip`);
            } else {
                this.showToast('Ошибка экспорта слайдов', 'error');
            }
            
            // Скрываем прогресс и возвращаем исходный режим
            this.hideExportProgress();
            await this.state.setMode(originalMode);
            
        } catch (error) {
            console.error('❌ Ошибка экспорта всех слайдов:', error);
            this.showToast('Ошибка экспорта. Попробуйте еще раз.', 'error');
            this.hideExportProgress();
        }
    }

    // Скачивание текущего слайда
    async downloadCurrentSlide(format = 'PNG', quality = '720p') {
        try {
            this.showToast('📥 Экспорт текущего слайда...', 'info');
            
            // Проверяем лимиты пользователя
            if (!this.checkExportLimits(format, quality)) {
                this.showUpgradeModal();
                return;
            }
            
            const activeSlide = this.state.getActiveSlide();
            if (!activeSlide) {
                this.showToast('Нет активного слайда для экспорта', 'error');
                return;
            }

            // Переключаемся в режим экспорта
            const originalMode = this.state.getMode();
            await this.state.setMode('export');
            
            // Ждем обновления DOM
            await this.nextTick();
            
            // Экспортируем слайд с выбранным качеством
            const exportResult = await this.exportSlideToImage(activeSlide, format, quality);
            
            if (exportResult.success) {
                this.showToast('✅ Слайд сохранен', 'success');
                
                // Скачиваем изображение
                const filename = `slide-${this.state.getActiveSlideIndex() + 1}-${quality}.${format.toLowerCase()}`;
                this.downloadImage(exportResult.imageBlob, filename);
            } else {
                this.showToast('Ошибка экспорта слайда', 'error');
            }
            
            // Возвращаем исходный режим
            await this.state.setMode(originalMode);
            
        } catch (error) {
            console.error('❌ Ошибка экспорта текущего слайда:', error);
            this.showToast('Ошибка экспорта. Попробуйте еще раз.', 'error');
        }
    }

    // Проверка лимитов экспорта
    checkExportLimits(format, quality) {
        try {
            const userPlan = this.state.getUserPlan() || 'FREE';
            
            if (userPlan === 'PRO') {
                return true; // PRO пользователи могут экспортировать в любом формате
            }
            
            // FREE пользователи ограничены 720p PNG
            if (format !== 'PNG' || quality !== '720p') {
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка проверки лимитов экспорта:', error);
            return true; // В случае ошибки разрешаем экспорт
        }
    }

    // Показать модал апгрейда
    showUpgradeModal() {
        try {
            // Создаем модал апгрейда
            let upgradeModal = document.getElementById('upgrade-modal');
            
            if (!upgradeModal) {
                upgradeModal = document.createElement('div');
                upgradeModal.id = 'upgrade-modal';
                upgradeModal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                `;
                
                upgradeModal.innerHTML = `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white; max-width: 400px; margin: 20px;">
                        <h3 style="margin-bottom: 15px;">🚀 Обновись до PRO!</h3>
                        <p style="margin-bottom: 20px; opacity: 0.9;">Для экспорта в высоком качестве и других форматах нужен PRO аккаунт</p>
                        <div style="margin-bottom: 20px;">
                            <div>✅ 1080p и 4K экспорт</div>
                            <div>✅ PDF формат</div>
                            <div>✅ Безлимитная AI генерация</div>
                            <div>✅ Приоритетная поддержка</div>
                        </div>
                        <button onclick="this.closest('#upgrade-modal').style.display='none'" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">Понятно</button>
                    </div>
                `;
                
                document.body.appendChild(upgradeModal);
            }
            
            upgradeModal.style.display = 'flex';
            
        } catch (error) {
            console.error('❌ Ошибка показа модала апгрейда:', error);
        }
    }

    // Показать прогресс экспорта
    showExportProgress(progress) {
        try {
            let progressEl = document.getElementById('export-progress');
            
            if (!progressEl) {
                progressEl = document.createElement('div');
                progressEl.id = 'export-progress';
                progressEl.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 10px;
                    z-index: 10000;
                    text-align: center;
                    font-family: 'Inter', sans-serif;
                    backdrop-filter: blur(10px);
                    min-width: 250px;
                `;
                document.body.appendChild(progressEl);
            }
            
            progressEl.innerHTML = `
                <div style="margin-bottom: 15px;">📤 Экспорт слайдов</div>
                <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">${Math.round(progress)}%</div>
            `;
            
            progressEl.style.display = 'block';
            
        } catch (error) {
            console.error('❌ Ошибка показа прогресса экспорта:', error);
        }
    }

    // Скрыть прогресс экспорта
    hideExportProgress() {
        try {
            const progressEl = document.getElementById('export-progress');
            if (progressEl) {
                progressEl.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Ошибка скрытия прогресса экспорта:', error);
        }
    }

    // ===== МЕТОДЫ РАБОТЫ С HTML2CANVAS =====

    // Экспорт всех слайдов в изображения
    async exportAllSlidesToImages(format = 'PNG', quality = '720p') {
        // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямого доступа
        const slides = this.state.getAllSlides();
        const exportedImages = [];
        
        try {
            for (let i = 0; i < slides.length; i++) {
                // Обновляем прогресс
                const progress = (i / slides.length) * 100;
                this.showExportProgress(progress);
                
                // Устанавливаем текущий слайд для рендеринга
                this.state.setCurrentSlideIndex(i);
                await this.nextTick();
                
                // Экспортируем слайд с выбранным качеством
                const exportResult = await this.exportSlideToImage(slides[i], format, quality);
                
                if (exportResult.success) {
                    exportedImages.push({
                        index: i,
                        filename: `slide-${i + 1}.${format.toLowerCase()}`,
                        blob: exportResult.imageBlob
                    });
                }
            }
            
            // Завершаем прогресс
            this.showExportProgress(100);
            
            // Создаем ZIP архив (заглушка - в реальности нужна библиотека JSZip)
            const zipBlob = await this.createZipArchive(exportedImages);
            
            return {
                success: true,
                count: exportedImages.length,
                zipBlob: zipBlob
            };
            
        } catch (error) {
            console.error('❌ Ошибка экспорта слайдов в изображения:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Экспорт одного слайда в изображение
    async exportSlideToImage(slideData, format = 'PNG', quality = '720p') {
        try {
            // Получаем размеры в зависимости от качества
            const dimensions = this.getExportDimensions(quality);
            
            // Находим элемент слайда для экспорта
            const slideElement = document.querySelector('.slide-container');
            if (!slideElement) {
                throw new Error('Элемент слайда не найден');
            }

            // Настройки html2canvas в зависимости от качества
            const canvasOptions = {
                width: dimensions.width,
                height: dimensions.height,
                scale: dimensions.scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
                imageTimeout: 15000,
                removeContainer: true
            };

            // Экспортируем в canvas (заглушка - в реальности нужна библиотека html2canvas)
            const canvas = await this.renderSlideToCanvas(slideElement, canvasOptions);
            
            // Конвертируем в blob
            const imageBlob = await this.canvasToBlob(canvas, format);
            
            return {
                success: true,
                imageBlob: imageBlob,
                dimensions: dimensions
            };
            
        } catch (error) {
            console.error('❌ Ошибка экспорта слайда в изображение:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Получить размеры экспорта в зависимости от качества
    getExportDimensions(quality) {
        const dimensions = {
            '720p': { width: 1080, height: 1080, scale: 1 },
            '1080p': { width: 1080, height: 1080, scale: 1.5 },
            '4K': { width: 2160, height: 2160, scale: 2 }
        };
        
        return dimensions[quality] || dimensions['720p'];
    }

    // Рендер слайда в canvas (заглушка)
    async renderSlideToCanvas(element, options) {
        // В реальности здесь будет html2canvas
        console.log('🎨 Рендеринг слайда в canvas с опциями:', options);
        
        // Создаем заглушку canvas
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;
        
        const ctx = canvas.getContext('2d');
        
        // Заливаем градиентом как заглушку
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Добавляем текст как заглушку
        ctx.fillStyle = 'white';
        ctx.font = '48px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('FlashPost Slide', canvas.width / 2, canvas.height / 2);
        
        return canvas;
    }

    // Конвертация canvas в blob
    async canvasToBlob(canvas, format) {
        return new Promise((resolve) => {
            const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg';
            canvas.toBlob(resolve, mimeType, 0.9);
        });
    }

    // Создание ZIP архива (заглушка)
    async createZipArchive(images) {
        console.log('📦 Создание ZIP архива с', images.length, 'изображениями');
        
        // В реальности здесь будет JSZip
        // Возвращаем заглушку blob
        return new Blob(['ZIP archive placeholder'], { type: 'application/zip' });
    }
                this.showToast(`Экспорт слайда ${i + 1}/${slides.length}...`, 'info');
                
                // Устанавливаем активный слайд
                this.state.setActiveSlideByIndex(i);
                
                // Ждем рендеринга
                await this.nextTick();
                
                // Экспортируем слайд
                const exportResult = await this.exportSlideToImage(slides[i]);
                
                if (exportResult.success) {
                    exportedImages.push({
                        name: `slide-${i + 1}.png`,
                        blob: exportResult.imageBlob
                    });
                } else {
                    console.warn(`⚠️ Не удалось экспортировать слайд ${i + 1}`);
                }
            }
            
            // Создаем ZIP архив
            const zipBlob = await this.createZipArchive(exportedImages);
            
            return {
                success: true,
                count: exportedImages.length,
                zipBlob: zipBlob
            };
            
        } catch (error) {
            console.error('❌ Ошибка экспорта всех слайдов:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Экспорт одного слайда в изображение
    async exportSlideToImage(slide) {
        try {
            // Находим элемент слайда в DOM
            const slideElement = document.querySelector(`[data-slide-id="${slide.id}"]`);
            
            if (!slideElement) {
                console.error(`❌ Элемент слайда ${slide.id} не найден в DOM`);
                return { success: false, error: 'Slide element not found' };
            }

            // Настройки для html2canvas
            const canvasOptions = {
                width: 1080,
                height: 1080,
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                logging: false
            };

            // Проверяем доступность html2canvas
            if (typeof html2canvas === 'undefined') {
                console.warn('⚠️ html2canvas не загружен, используем заглушку');
                return await this.mockExportSlideToImage(slide);
            }

            // Экспортируем с помощью html2canvas
            const canvas = await html2canvas(slideElement, canvasOptions);
            
            // Конвертируем в blob
            const imageBlob = await this.canvasToBlob(canvas);
            
            return {
                success: true,
                imageBlob: imageBlob,
                canvas: canvas
            };
            
        } catch (error) {
            console.error('❌ Ошибка экспорта слайда в изображение:', error);
            return { success: false, error: error.message };
        }
    }

    // Заглушка для экспорта слайда (когда html2canvas недоступен)
    async mockExportSlideToImage(slide) {
        // Создаем canvas с заглушкой
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        
        const ctx = canvas.getContext('2d');
        
        // Рисуем фон
        if (slide.background.type === 'color') {
            ctx.fillStyle = slide.background.color;
        } else {
            ctx.fillStyle = '#833ab4'; // Fallback цвет
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем текст (упрощенно)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Разбиваем текст на строки
        const text = slide.textBlocks[0]?.text || slide.title || 'Слайд';
        const lines = this.wrapText(ctx, text, canvas.width - 100);
        
        const lineHeight = 60;
        const startY = (canvas.height - (lines.length * lineHeight)) / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
        });
        
        // Конвертируем в blob
        const imageBlob = await this.canvasToBlob(canvas);
        
        return {
            success: true,
            imageBlob: imageBlob,
            canvas: canvas
        };
    }

    // ===== УТИЛИТЫ ДЛЯ ЭКСПОРТА =====

    // Конвертация canvas в blob
    canvasToBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png', 1.0);
        });
    }

    // Разбивка текста на строки для canvas
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine.trim());
                currentLine = words[i] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine.trim().length > 0) {
            lines.push(currentLine.trim());
        }
        
        return lines;
    }

    // Создание ZIP архива
    async createZipArchive(images) {
        try {
            // Проверяем доступность JSZip
            if (typeof JSZip === 'undefined') {
                console.warn('⚠️ JSZip не загружен, используем заглушку');
                return await this.mockCreateZipArchive(images);
            }

            const zip = new JSZip();
            
            // Добавляем изображения в архив
            images.forEach((image, index) => {
                zip.file(image.name, image.blob);
            });
            
            // Генерируем ZIP файл
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            return zipBlob;
            
        } catch (error) {
            console.error('❌ Ошибка создания ZIP архива:', error);
            return await this.mockCreateZipArchive(images);
        }
    }

    // Заглушка для создания ZIP архива
    async mockCreateZipArchive(images) {
        // Возвращаем первое изображение как fallback
        if (images.length > 0) {
            return images[0].blob;
        }
        
        // Создаем пустой blob
        return new Blob(['Mock ZIP archive'], { type: 'application/zip' });
    }

    // ===== МЕТОДЫ СКАЧИВАНИЯ =====

    // Скачивание изображения
    downloadImage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Добавляем в DOM и кликаем
        document.body.appendChild(link);
        link.click();
        
        // Убираем из DOM и освобождаем URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`✅ Изображение скачано: ${filename}`);
    }

    // Скачивание ZIP файла
    downloadZipFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Добавляем в DOM и кликаем
        document.body.appendChild(link);
        link.click();
        
        // Убираем из DOM и освобождаем URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`✅ ZIP архив скачан: ${filename}`);
    }

    // ===== СОХРАНЕНИЕ ШАБЛОНОВ =====

    // Сохранение как шаблон
    async saveTemplate() {
        try {
            const projectState = this.state.getProjectState();
            
            // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЙ МЕТОД StateManager вместо прямого доступа
            const slidesCount = this.state.getSlidesCount();
            if (slidesCount === 0) {
                this.showToast('Нет слайдов для сохранения в шаблон', 'error');
                return;
            }

            // Создаем данные шаблона
            const slides = this.state.getAllSlides();
            const templateData = {
                name: `Шаблон ${new Date().toLocaleDateString()}`,
                slides: slides.map(slide => ({
                    title: slide.title,
                    background: slide.background,
                    textBlocks: slide.textBlocks.map(block => ({
                        text: '[Ваш текст]', // Заменяем текст на плейсхолдер
                        x: block.x,
                        y: block.y,
                        width: block.width,
                        font: block.font,
                        size: block.size,
                        weight: block.weight,
                        color: block.color
                    }))
                })),
                createdAt: new Date().toISOString()
            };

            // Сохраняем в localStorage
            this.saveTemplateToStorage(templateData);
            
            this.showToast('✅ Шаблон сохранен', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона:', error);
            this.showToast('Ошибка сохранения шаблона', 'error');
        }
    }

    // Сохранение шаблона в localStorage
    saveTemplateToStorage(templateData) {
        try {
            const templates = this.getTemplatesFromStorage();
            
            // Добавляем новый шаблон
            templates.push(templateData);
            
            // Ограничиваем количество шаблонов
            if (templates.length > 10) {
                templates.shift(); // Удаляем самый старый
            }
            
            localStorage.setItem('flashpost_templates', JSON.stringify(templates));
            
            console.log('✅ Шаблон сохранен в localStorage');
            
        } catch (error) {
            console.error('❌ Ошибка сохранения шаблона в localStorage:', error);
        }
    }

    // Получение шаблонов из localStorage
    getTemplatesFromStorage() {
        try {
            const stored = localStorage.getItem('flashpost_templates');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Ошибка чтения шаблонов из localStorage:', error);
            return [];
        }
    }

    // Загрузка шаблона
    loadTemplate(templateId) {
        try {
            const templates = this.getTemplatesFromStorage();
            const template = templates[templateId];
            
            if (!template) {
                this.showToast('Шаблон не найден', 'error');
                return false;
            }

            // Очищаем текущий проект
            this.state.clearProject();
            
            // Загружаем слайды из шаблона
            template.slides.forEach(slideData => {
                const slide = this.state.createSlide(slideData);
                
                // Создаем текстовые блоки
                slideData.textBlocks.forEach(blockData => {
                    this.state.createTextBlock(slide.id, blockData);
                });
            });
            
            // Устанавливаем первый слайд как активный
            if (this.state.project.slides.length > 0) {
                this.state.setActiveSlideByIndex(0);
            }
            
            this.showToast('✅ Шаблон загружен', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблона:', error);
            this.showToast('Ошибка загрузки шаблона', 'error');
            return false;
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====

    // Ожидание следующего тика
    nextTick() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
    }

    // Показ уведомления
    showToast(message, type = 'info') {
        // Создаем элемент уведомления
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Добавляем стили
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Показываем с анимацией
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Убираем через 3 секунды
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // ===== ЭКСПОРТ В РАЗЛИЧНЫЕ ФОРМАТЫ =====

    // Экспорт в PDF (заглушка)
    async exportToPDF() {
        this.showToast('Экспорт в PDF будет добавлен в следующих версиях', 'info');
    }

    // Экспорт в PowerPoint (заглушка)
    async exportToPowerPoint() {
        this.showToast('Экспорт в PowerPoint будет добавлен в следующих версиях', 'info');
    }

    // Экспорт в JSON
    exportToJSON() {
        try {
            const projectState = this.state.getProjectState();
            const jsonData = JSON.stringify(projectState, null, 2);
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            this.downloadZipFile(blob, 'flashpost-project.json');
            
            this.showToast('✅ Проект экспортирован в JSON', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка экспорта в JSON:', error);
            this.showToast('Ошибка экспорта в JSON', 'error');
        }
    }

    // Импорт из JSON
    async importFromJSON(file) {
        try {
            const text = await file.text();
            const projectData = JSON.parse(text);
            
            // Валидируем данные
            if (!projectData.slides || !Array.isArray(projectData.slides)) {
                throw new Error('Неверный формат файла');
            }
            
            // Загружаем проект
            this.state.loadProjectState(projectData);
            
            this.showToast('✅ Проект импортирован из JSON', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка импорта из JSON:', error);
            this.showToast('Ошибка импорта файла', 'error');
            return false;
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
} else {
    window.ExportManager = ExportManager;
}

    // ===== УТИЛИТЫ =====

    // Показать toast уведомление
    showToast(message, type = 'info') {
        try {
            console.log(`📢 Toast (${type}): ${message}`);
            
            // Создаем toast элемент
            let toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                toastContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    pointer-events: none;
                `;
                document.body.appendChild(toastContainer);
            }
            
            const toast = document.createElement('div');
            toast.style.cssText = `
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                margin-bottom: 10px;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                pointer-events: auto;
            `;
            toast.textContent = message;
            
            toastContainer.appendChild(toast);
            
            // Анимация появления
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // Автоматическое скрытие через 3 секунды
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
            
        } catch (error) {
            console.error('❌ Ошибка показа toast:', error);
        }
    }

    // Утилита для ожидания следующего тика
    nextTick() {
        return new Promise(resolve => {
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(resolve);
            } else {
                setTimeout(resolve, 16);
            }
        });
    }

    // Скачивание файла
    downloadImage(blob, filename) {
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Файл скачан:', filename);
            
        } catch (error) {
            console.error('❌ Ошибка скачивания файла:', error);
        }
    }

    // Скачивание ZIP файла
    downloadZipFile(blob, filename) {
        try {
            this.downloadImage(blob, filename);
        } catch (error) {
            console.error('❌ Ошибка скачивания ZIP:', error);
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}