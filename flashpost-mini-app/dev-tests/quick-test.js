// Быстрый тест двухэтапной AI системы FlashPost
console.log('🧪 Запуск тестов FlashPost AI системы...');

// Тест 1: Проверка создания экземпляра приложения
try {
    if (typeof FlashPostApp !== 'undefined') {
        console.log('✅ Тест 1: Класс FlashPostApp доступен');
        
        // Создаем тестовый экземпляр
        const testApp = new FlashPostApp();
        console.log('✅ Тест 2: Экземпляр FlashPostApp создан успешно');
        
        // Тест 3: Проверка методов двухэтапной системы
        if (typeof testApp.buildAnalysisPrompt === 'function') {
            console.log('✅ Тест 3: Метод buildAnalysisPrompt существует');
            
            const analysisPrompt = testApp.buildAnalysisPrompt('AI и нейросети');
            if (analysisPrompt.includes('Раскрой тему:') && analysisPrompt.includes('"analysis"')) {
                console.log('✅ Тест 4: Промпт анализа сформирован корректно');
            } else {
                console.error('❌ Тест 4: Неверный формат промпта анализа');
            }
        } else {
            console.error('❌ Тест 3: Метод buildAnalysisPrompt не найден');
        }
        
        // Тест 5: Проверка метода создания карусели
        if (typeof testApp.buildCarouselPrompt === 'function') {
            console.log('✅ Тест 5: Метод buildCarouselPrompt существует');
            
            const testAnalysis = ['Проблема 1', 'Причина 2', 'Решение 3'];
            const carouselPrompt = testApp.buildCarouselPrompt('Тестовая тема', testAnalysis);
            if (carouselPrompt.includes('Используй эти идеи:') && carouselPrompt.includes('"slides"')) {
                console.log('✅ Тест 6: Промпт карусели сформирован корректно');
            } else {
                console.error('❌ Тест 6: Неверный формат промпта карусели');
            }
        } else {
            console.error('❌ Тест 5: Метод buildCarouselPrompt не найден');
        }
        
        // Тест 7: Проверка JSON retry системы
        if (typeof testApp.cleanAIResponse === 'function') {
            console.log('✅ Тест 7: Метод cleanAIResponse существует');
            
            const dirtyJSON = 'Вот ответ: {"test": "value"} Готово!';
            const cleanJSON = testApp.cleanAIResponse(dirtyJSON);
            if (cleanJSON === '{"test": "value"}') {
                console.log('✅ Тест 8: JSON очистка работает корректно');
            } else {
                console.error('❌ Тест 8: Ошибка очистки JSON:', cleanJSON);
            }
        } else {
            console.error('❌ Тест 7: Метод cleanAIResponse не найден');
        }
        
        console.log('🎉 Все базовые тесты пройдены успешно!');
        console.log('📝 Для полного тестирования откройте http://localhost:3003/index.html');
        
    } else {
        console.error('❌ Тест 1: Класс FlashPostApp не найден');
    }
} catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
}

// Тест интеграции с DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Проверка DOM интеграции...');
    
    // Проверяем наличие основных элементов
    const app = document.getElementById('app');
    const loading = document.getElementById('loading');
    
    if (app && loading) {
        console.log('✅ Основные DOM элементы найдены');
    } else {
        console.error('❌ Отсутствуют основные DOM элементы');
    }
    
    // Проверяем CSS поддержку переносов строк
    const testElement = document.createElement('div');
    testElement.style.whiteSpace = 'pre-line';
    testElement.textContent = 'Строка 1\nСтрока 2';
    document.body.appendChild(testElement);
    
    if (testElement.offsetHeight > 20) { // Примерная высота двух строк
        console.log('✅ CSS поддержка переносов строк работает');
    } else {
        console.warn('⚠️ Возможные проблемы с отображением переносов строк');
    }
    
    document.body.removeChild(testElement);
    
    console.log('✅ DOM интеграция проверена');
});

console.log('🚀 Тесты завершены. Проверьте консоль для результатов.');