// 🔧 ИСПРАВЛЕННАЯ СИСТЕМА ЭКСПОРТА ДЛЯ FLASHPOST ULTIMATE

// Улучшенная функция экспорта одного слайда с обработкой ошибок
async function exportSingleSlideFixed(format, settings) {
    console.log('🚀 Начинаем экспорт слайда:', { format, settings });
    
    try {
        showLoading(true, `Экспорт в ${format} ${settings.width}x${settings.height}...`);
        
        // Проверяем наличие библиотек
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas не загружен. Проверьте подключение библиотеки.');
        }
        
        if (format === 'PDF' && typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF не загружен. Проверьте подключение библиотеки.');
        }
        
        // Получаем элемент слайда
        const slideCanvas = document.getElementById('slideCanvas');
        if (!slideCanvas) {
            throw new Error('Элемент slideCanvas не найден');
        }
        
        // Временно скрываем элементы управления
        const elementsToHide = [
            document.getElementById('slideNumber'),
            ...document.querySelectorAll('.nav-btn'),
            ...document.querySelectorAll('.indicator')
        ].filter(el => el);
        
        const originalStyles = elementsToHide.map(el => ({
            element: el,
            display: el.style.display,
            visibility: el.style.visibility
        }));
        
        elementsToHide.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        });
        
        console.log('📱 Элементы управления скрыты');
        
        // Ждем рендеринга
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Настройки html2canvas с улучшенной обработкой ошибок
        const html2canvasOptions = {
            backgroundColor: format === 'JPEG' ? '#ffffff' : null,
            scale: Math.min(settings.scale, 3), // Ограничиваем масштаб для избежания ошибок памяти
            width: settings.width,
            height: settings.height,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
            removeContainer: true,
            imageTimeout: 15000, // Таймаут для загрузки изображений
            onclone: function(clonedDoc) {
                console.log('📋 Клонирование документа завершено');
                
                // Исправляем шрифты в клонированном документе
                const clonedElements = clonedDoc.querySelectorAll('*');
                clonedElements.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    if (computedStyle.fontFamily) {
                        el.style.fontFamily = computedStyle.fontFamily;
                    }
                });
            }
        };
        
        console.log('🎨 Запускаем html2canvas с настройками:', html2canvasOptions);
        
        // Создаем canvas
        const canvas = await html2canvas(slideCanvas, html2canvasOptions);
        
        console.log('✅ html2canvas завершен успешно:', {
            width: canvas.width,
            height: canvas.height
        });
        
        // Восстанавливаем элементы управления
        originalStyles.forEach(({ element, display, visibility }) => {
            element.style.display = display;
            element.style.visibility = visibility;
        });
        
        console.log('🔄 Элементы управления восстановлены');
        
        // Создаем файл в зависимости от формата
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `flashpost_slide_${currentSlideIndex + 1}_${timestamp}`;
        
        if (format === 'PNG') {
            const dataURL = canvas.toDataURL('image/png');
            downloadFile(dataURL, `${filename}.png`);
            console.log('✅ PNG файл создан');
            
        } else if (format === 'JPEG') {
            const dataURL = canvas.toDataURL('image/jpeg', 0.92);
            downloadFile(dataURL, `${filename}.jpg`);
            console.log('✅ JPEG файл создан');
            
        } else if (format === 'PDF') {
            const { jsPDF } = window.jspdf;
            
            // Создаем PDF с правильными размерами
            const pdf = new jsPDF({
                orientation: settings.width > settings.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [settings.width, settings.height],
                compress: true
            });
            
            console.log('📄 PDF документ создан');
            
            // Конвертируем canvas в изображение для PDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Добавляем изображение в PDF
            pdf.addImage(
                imgData, 
                'PNG', 
                0, 0, 
                settings.width, 
                settings.height,
                undefined,
                'FAST'
            );
            
            // Сохраняем PDF
            pdf.save(`${filename}.pdf`);
            console.log('✅ PDF файл создан и сохранен');
            
            showToast(`📄 Слайд экспортирован в PDF!`);
            updateStats('exportsCompleted');
            return;
        }
        
        showToast(`📥 Слайд экспортирован в ${format}!`);
        updateStats('exportsCompleted');
        
    } catch (error) {
        console.error('❌ Ошибка экспорта:', error);
        
        // Детальная диагностика ошибки
        let errorMessage = 'Неизвестная ошибка экспорта';
        
        if (error.message.includes('html2canvas')) {
            errorMessage = 'Ошибка рендеринга. Попробуйте упростить слайд или уменьшить качество.';
        } else if (error.message.includes('jsPDF')) {
            errorMessage = 'Ошибка создания PDF. Проверьте размер изображения.';
        } else if (error.message.includes('Memory')) {
            errorMessage = 'Недостаточно памяти. Попробуйте уменьшить качество экспорта.';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'Ошибка CORS. Некоторые изображения могут быть заблокированы.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        }
        
        showToast(`❌ ${errorMessage}`, 'error');
        
        // Предлагаем альтернативные решения
        setTimeout(() => {
            if (confirm('Экспорт не удался. Попробовать с упрощенными настройками?')) {
                const simplifiedSettings = {
                    scale: 1,
                    width: 720,
                    height: 720
                };
                exportSingleSlideFixed(format, simplifiedSettings);
            }
        }, 2000);
        
    } finally {
        showLoading(false);
    }
}

// Вспомогательная функция для скачивания файла
function downloadFile(dataURL, filename) {
    try {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Файл ${filename} скачан`);
    } catch (error) {
        console.error('❌ Ошибка скачивания файла:', error);
        
        // Альтернативный метод скачивания
        try {
            const blob = dataURLToBlob(dataURL);
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(url);
            console.log(`✅ Файл ${filename} скачан (альтернативный метод)`);
        } catch (altError) {
            console.error('❌ Альтернативный метод скачивания также не удался:', altError);
            throw new Error('Не удалось скачать файл');
        }
    }
}

// Конвертация dataURL в Blob
function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
}

// Улучшенная функция экспорта всех слайдов
async function exportAllSlidesFixed(format, settings) {
    console.log('🚀 Начинаем экспорт всех слайдов:', { format, settings, count: currentSlides.length });
    
    try {
        showLoading(true, `Экспорт ${currentSlides.length} слайдов...`);
        
        const originalSlideIndex = currentSlideIndex;
        const exportedFiles = [];
        
        for (let i = 0; i < currentSlides.length; i++) {
            try {
                console.log(`📄 Экспорт слайда ${i + 1}/${currentSlides.length}`);
                
                // Переключаемся на слайд
                currentSlideIndex = i;
                renderSlide();
                
                // Обновляем прогресс
                const progress = Math.round((i / currentSlides.length) * 80) + 10;
                updateProgress(progress, `Экспорт слайда ${i + 1}/${currentSlides.length}...`);
                
                // Ждем рендеринга
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Экспортируем слайд
                await exportSingleSlideFixed(format, settings);
                
                exportedFiles.push(`flashpost_slide_${i + 1}`);
                
                // Небольшая пауза между экспортами
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (slideError) {
                console.error(`❌ Ошибка экспорта слайда ${i + 1}:`, slideError);
                showToast(`⚠️ Ошибка экспорта слайда ${i + 1}`, 'warning');
                // Продолжаем экспорт остальных слайдов
            }
        }
        
        // Восстанавливаем исходный слайд
        currentSlideIndex = originalSlideIndex;
        renderSlide();
        
        updateProgress(100, 'Экспорт завершен!');
        
        if (exportedFiles.length > 0) {
            showToast(`✅ Экспортировано ${exportedFiles.length}/${currentSlides.length} слайдов в ${format}!`);
        } else {
            showToast('❌ Не удалось экспортировать ни одного слайда', 'error');
        }
        
        console.log('✅ Экспорт всех слайдов завершен:', exportedFiles);
        
    } catch (error) {
        console.error('❌ Критическая ошибка экспорта всех слайдов:', error);
        showToast('❌ Критическая ошибка экспорта', 'error');
    } finally {
        showLoading(false);
    }
}

// Проверка готовности системы экспорта
function checkExportReadiness() {
    const issues = [];
    
    // Проверка библиотек
    if (typeof html2canvas === 'undefined') {
        issues.push('html2canvas не загружен');
    }
    
    if (typeof window.jspdf === 'undefined') {
        issues.push('jsPDF не загружен');
    }
    
    // Проверка слайдов
    if (!currentSlides || currentSlides.length === 0) {
        issues.push('Нет слайдов для экспорта');
    }
    
    // Проверка элементов DOM
    if (!document.getElementById('slideCanvas')) {
        issues.push('Элемент slideCanvas не найден');
    }
    
    return {
        ready: issues.length === 0,
        issues: issues
    };
}

// Диагностика экспорта
async function diagnoseExportIssues() {
    console.log('🔍 Запуск диагностики экспорта...');
    
    const readiness = checkExportReadiness();
    
    if (!readiness.ready) {
        console.error('❌ Система экспорта не готова:', readiness.issues);
        showToast(`❌ Проблемы экспорта: ${readiness.issues.join(', ')}`, 'error');
        return false;
    }
    
    // Тест простого экспорта
    try {
        const testElement = document.createElement('div');
        testElement.style.cssText = 'width: 100px; height: 100px; background: red;';
        document.body.appendChild(testElement);
        
        const testCanvas = await html2canvas(testElement, {
            width: 100,
            height: 100,
            scale: 1
        });
        
        document.body.removeChild(testElement);
        
        if (testCanvas.width > 0 && testCanvas.height > 0) {
            console.log('✅ Тест экспорта пройден успешно');
            return true;
        } else {
            console.error('❌ Тест экспорта не удался: пустой canvas');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Тест экспорта не удался:', error);
        return false;
    }
}

// Экспорт с автоматической диагностикой
async function smartExport(isAllSlides = false) {
    console.log('🧠 Умный экспорт с диагностикой...');
    
    // Сначала проверяем готовность
    const isReady = await diagnoseExportIssues();
    
    if (!isReady) {
        showToast('❌ Система экспорта не готова. Проверьте консоль для деталей.', 'error');
        return;
    }
    
    // Показываем модальное окно выбора формата
    showExportModal(isAllSlides);
}

console.log('🔧 Исправленная система экспорта загружена');
console.log('📋 Доступные функции:');
console.log('   - exportSingleSlideFixed() - улучшенный экспорт одного слайда');
console.log('   - exportAllSlidesFixed() - улучшенный экспорт всех слайдов');
console.log('   - diagnoseExportIssues() - диагностика проблем');
console.log('   - smartExport() - экспорт с автоматической диагностикой');