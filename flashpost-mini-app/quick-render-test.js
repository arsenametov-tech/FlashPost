// 🧪 Quick RenderApp Test Script
// Добавьте этот код в консоль браузера для быстрого тестирования

console.log('🧪 Quick RenderApp Test Script loaded');

// Функция для быстрого теста renderApp()
function quickRenderTest() {
    console.log('🔴 Running quick render test...');
    
    const app = document.getElementById('app');
    if (!app) {
        console.error('❌ #app element not found!');
        return false;
    }
    
    // Ваш предложенный тест
    app.innerHTML = `<div style="min-height:100vh;background:#0f0f14;color:red;font-size:24px;padding:20px;">🔴 RENDER APP WORKS</div>`;
    
    console.log('✅ Quick render test completed');
    return true;
}

// Функция для проверки состояния DOM
function checkDOMState() {
    const app = document.getElementById('app');
    const loading = document.getElementById('loading');
    
    const state = {
        app: {
            exists: !!app,
            isEmpty: !app || app.innerHTML.trim() === '',
            isVisible: app ? window.getComputedStyle(app).display !== 'none' : false,
            background: app ? window.getComputedStyle(app).backgroundColor : 'N/A',
            contentLength: app ? app.innerHTML.length : 0
        },
        loading: {
            exists: !!loading,
            isVisible: loading ? window.getComputedStyle(loading).display !== 'none' : false
        },
        body: {
            background: window.getComputedStyle(document.body).backgroundColor,
            color: window.getComputedStyle(document.body).color
        }
    };
    
    console.log('📊 DOM State:', state);
    return state;
}

// Функция для исправления белого экрана
function fixWhiteScreen() {
    console.log('🔧 Attempting to fix white screen...');
    
    // Проверяем и создаем #app если нужно
    let app = document.getElementById('app');
    if (!app) {
        app = document.createElement('div');
        app.id = 'app';
        document.body.appendChild(app);
        console.log('✅ Created missing #app element');
    }
    
    // Применяем критические стили
    app.style.cssText = `
        min-height: 100vh;
        background: #0f0f14;
        color: #fff;
        display: block;
        position: relative;
    `;
    
    // Скрываем loading если есть
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
        console.log('✅ Hidden loading screen');
    }
    
    // Показываем #app
    app.style.display = 'block';
    
    // Добавляем тестовый контент если пустой
    if (app.innerHTML.trim() === '') {
        quickRenderTest();
    }
    
    console.log('✅ White screen fix applied');
    return checkDOMState();
}

// Функция для тестирования основного приложения
function testMainAppRender() {
    console.log('🚀 Testing main app renderApp()...');
    
    if (window.flashPostApp && window.flashPostApp.renderApp) {
        try {
            window.flashPostApp.renderApp();
            console.log('✅ Main app renderApp() called successfully');
            return true;
        } catch (error) {
            console.error('❌ Error calling main app renderApp():', error);
            return false;
        }
    } else {
        console.warn('⚠️ Main app not available');
        return false;
    }
}

// Автоматическая диагностика
function autoDiagnose() {
    console.log('🔍 Running automatic diagnosis...');
    
    const state = checkDOMState();
    const issues = [];
    
    if (!state.app.exists) {
        issues.push('❌ #app element missing');
    }
    
    if (state.app.isEmpty) {
        issues.push('⚪ #app element is empty');
    }
    
    if (!state.app.isVisible) {
        issues.push('👻 #app element is hidden');
    }
    
    if (state.loading.isVisible) {
        issues.push('⏳ Loading screen still visible');
    }
    
    if (state.body.background === 'rgba(0, 0, 0, 0)' || state.body.background === 'rgb(255, 255, 255)') {
        issues.push('⚪ Body has white/transparent background');
    }
    
    if (issues.length === 0) {
        console.log('✅ No issues detected');
    } else {
        console.log('⚠️ Issues found:', issues);
        console.log('💡 Run fixWhiteScreen() to attempt automatic fix');
    }
    
    return { state, issues };
}

// Экспортируем функции в глобальную область
window.quickRenderTest = quickRenderTest;
window.checkDOMState = checkDOMState;
window.fixWhiteScreen = fixWhiteScreen;
window.testMainAppRender = testMainAppRender;
window.autoDiagnose = autoDiagnose;

// Показываем доступные команды
console.log(`
🧪 Available Quick Test Commands:
• quickRenderTest() - быстрый тест рендеринга
• checkDOMState() - проверка состояния DOM
• fixWhiteScreen() - исправление белого экрана
• testMainAppRender() - тест основного приложения
• autoDiagnose() - автоматическая диагностика

💡 Example usage:
quickRenderTest();
autoDiagnose();
fixWhiteScreen();
`);

// Автоматически запускаем диагностику
setTimeout(() => {
    console.log('🔄 Running initial diagnosis...');
    autoDiagnose();
}, 1000);