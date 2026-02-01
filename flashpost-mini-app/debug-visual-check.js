// 🔍 Debug Visual Check - Быстрая диагностика белого экрана
// Вставьте этот код в консоль браузера для мгновенной диагностики

console.log('🔍 Debug Visual Check loaded');

// Функция для быстрой визуальной диагностики
function debugVisualCheck() {
    console.log('🔍 Running visual white screen diagnosis...');
    
    const results = {
        timestamp: new Date().toLocaleTimeString(),
        issues: [],
        passes: []
    };
    
    // 1. Проверка CSS Layout
    console.log('1️⃣ Checking CSS Layout...');
    const html = document.documentElement;
    const body = document.body;
    const app = document.getElementById('app');
    
    if (!app) {
        results.issues.push('❌ #app element missing');
    } else {
        results.passes.push('✅ #app exists');
        
        const appStyles = window.getComputedStyle(app);
        
        if (!appStyles.minHeight.includes('100vh')) {
            results.issues.push('❌ #app min-height not 100vh: ' + appStyles.minHeight);
        } else {
            results.passes.push('✅ #app min-height: 100vh');
        }
        
        if (appStyles.display === 'none') {
            results.issues.push('❌ #app display: none');
        } else {
            results.passes.push('✅ #app display: ' + appStyles.display);
        }
        
        if (app.innerHTML.trim() === '') {
            results.issues.push('❌ #app is empty');
        } else {
            results.passes.push('✅ #app has content (' + app.innerHTML.length + ' chars)');
        }
    }
    
    const bodyStyles = window.getComputedStyle(body);
    if (bodyStyles.margin !== '0px') {
        results.issues.push('❌ body margin not 0: ' + bodyStyles.margin);
    } else {
        results.passes.push('✅ body margin: 0');
    }
    
    // 2. Проверка позиционирования
    console.log('2️⃣ Checking positioning...');
    if (app) {
        const position = window.getComputedStyle(app).position;
        if (position === 'fixed' || position === 'absolute') {
            const width = window.getComputedStyle(app).width;
            const height = window.getComputedStyle(app).height;
            if (width === 'auto' || height === 'auto') {
                results.issues.push('❌ Fixed/absolute position without explicit size');
            } else {
                results.passes.push('✅ Fixed/absolute with explicit size');
            }
        } else {
            results.passes.push('✅ Safe position: ' + position);
        }
    }
    
    // 3. Проверка renderApp
    console.log('3️⃣ Checking renderApp...');
    if (window.flashPostApp && window.flashPostApp.renderApp) {
        results.passes.push('✅ renderApp() available');
    } else {
        results.issues.push('❌ renderApp() not available');
    }
    
    // 4. Проверка Telegram expand
    console.log('4️⃣ Checking Telegram expand...');
    const tg = window.Telegram?.WebApp;
    if (tg) {
        if (tg.isExpanded) {
            results.passes.push('✅ Telegram expanded');
        } else {
            results.issues.push('❌ Telegram not expanded');
        }
        
        if (tg.viewportHeight < 400) {
            results.issues.push('❌ Telegram viewport too small: ' + tg.viewportHeight + 'px');
        } else {
            results.passes.push('✅ Telegram viewport: ' + tg.viewportHeight + 'px');
        }
    } else {
        results.passes.push('ℹ️ Running outside Telegram');
    }
    
    // 5. Проверка loading screen
    console.log('5️⃣ Checking loading screen...');
    const loading = document.getElementById('loading');
    if (loading) {
        const loadingDisplay = window.getComputedStyle(loading).display;
        if (loadingDisplay !== 'none') {
            results.issues.push('❌ Loading screen still visible');
        } else {
            results.passes.push('✅ Loading screen hidden');
        }
    } else {
        results.passes.push('ℹ️ No loading screen found');
    }
    
    // Вывод результатов
    console.log('📊 DIAGNOSIS RESULTS:');
    console.log('Time:', results.timestamp);
    
    if (results.passes.length > 0) {
        console.log('%c✅ PASSES:', 'color: green; font-weight: bold');
        results.passes.forEach(pass => console.log('%c' + pass, 'color: green'));
    }
    
    if (results.issues.length > 0) {
        console.log('%c❌ ISSUES:', 'color: red; font-weight: bold');
        results.issues.forEach(issue => console.log('%c' + issue, 'color: red'));
        console.log('%c💡 Run quickFixWhiteScreen() to attempt fixes', 'color: yellow; font-weight: bold');
    } else {
        console.log('%c🎉 NO ISSUES DETECTED!', 'color: green; font-weight: bold; font-size: 16px');
    }
    
    return results;
}

// Функция для быстрого исправления
function quickFixWhiteScreen() {
    console.log('🔧 Quick fixing white screen issues...');
    
    // 1. Создаем #app если нет
    let app = document.getElementById('app');
    if (!app) {
        app = document.createElement('div');
        app.id = 'app';
        document.body.appendChild(app);
        console.log('✅ Created #app element');
    }
    
    // 2. Применяем критические стили
    document.documentElement.style.cssText = `
        margin: 0; padding: 0; height: 100%; background: #0f0f14;
    `;
    
    document.body.style.cssText = `
        margin: 0; padding: 0; height: 100%; background: #0f0f14; color: #ffffff;
    `;
    
    app.style.cssText = `
        min-height: 100vh; background: #0f0f14; color: #fff; display: block; position: relative;
    `;
    
    // 3. Скрываем loading
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
    
    // 4. Добавляем debug UI если пустой
    if (app.innerHTML.trim() === '') {
        app.innerHTML = `
            <div style="min-height:100vh;background:#0f0f14;color:red;font-size:24px;padding:20px;display:flex;align-items:center;justify-content:center;text-align:center;">
                🔴 DEBUG: WHITE SCREEN FIXED<br>
                <div style="font-size:16px;color:white;margin-top:20px;">
                    ✅ CSS Layout corrected<br>
                    ✅ #app element visible<br>
                    ✅ Debug UI active<br>
                    Time: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
        console.log('✅ Added debug UI');
    }
    
    // 5. Telegram expand
    const tg = window.Telegram?.WebApp;
    if (tg) {
        try {
            tg.ready();
            tg.expand();
            console.log('✅ Telegram expand called');
        } catch (error) {
            console.log('⚠️ Telegram expand error:', error);
        }
    }
    
    console.log('🎉 Quick fix completed! Run debugVisualCheck() to verify.');
}

// Функция для добавления красного debug UI
function addRedDebugUI() {
    console.log('🔴 Adding red debug UI...');
    
    const app = document.getElementById('app');
    if (!app) {
        console.error('❌ #app not found');
        return false;
    }
    
    app.innerHTML = `
        <div style="
            min-height: 100vh;
            background: #0f0f14;
            color: red;
            font-size: 24px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            flex-direction: column;
        ">
            🔴 RED DEBUG UI ACTIVE
            <div style="font-size: 16px; color: white; margin-top: 20px; line-height: 1.5;">
                ✅ #app element exists and accessible<br>
                ✅ innerHTML can be modified<br>
                ✅ CSS styles are applying<br>
                ✅ Red text is visible<br>
                ✅ Full viewport height working<br>
                ✅ Flexbox centering working<br>
                <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
                    Viewport: ${window.innerWidth}x${window.innerHeight}<br>
                    Time: ${new Date().toLocaleTimeString()}<br>
                    User Agent: ${navigator.userAgent.substring(0, 50)}...
                </div>
            </div>
        </div>
    `;
    
    // Скрываем loading
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
    
    console.log('✅ Red debug UI added successfully');
    return true;
}

// Функция для проверки всех модулей
function checkModulesLoaded() {
    console.log('📦 Checking modules loaded...');
    
    const modules = [
        'StateManager',
        'Renderer', 
        'Editor',
        'DragManager',
        'ExportManager',
        'AIManager',
        'TemplateManager',
        'FlashPostApp'
    ];
    
    const loaded = [];
    const missing = [];
    
    modules.forEach(module => {
        if (typeof window[module] !== 'undefined') {
            loaded.push(module);
        } else {
            missing.push(module);
        }
    });
    
    console.log('✅ Loaded modules:', loaded);
    if (missing.length > 0) {
        console.log('❌ Missing modules:', missing);
    }
    
    console.log('🚀 FlashPostApp instance:', !!window.flashPostApp);
    
    return { loaded, missing, hasInstance: !!window.flashPostApp };
}

// Экспорт функций
window.debugVisualCheck = debugVisualCheck;
window.quickFixWhiteScreen = quickFixWhiteScreen;
window.addRedDebugUI = addRedDebugUI;
window.checkModulesLoaded = checkModulesLoaded;

// Показываем доступные команды
console.log(`
🔍 DEBUG VISUAL CHECK COMMANDS:
• debugVisualCheck() - полная диагностика
• quickFixWhiteScreen() - быстрое исправление
• addRedDebugUI() - красный debug UI
• checkModulesLoaded() - проверка модулей

💡 Quick start:
debugVisualCheck();
addRedDebugUI();
`);

// Автоматическая диагностика через 1 секунду
setTimeout(() => {
    console.log('🔄 Running automatic visual diagnosis...');
    debugVisualCheck();
}, 1000);