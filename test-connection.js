const http = require('http');

console.log('🔍 Тестируем подключение к серверу...\n');

function testConnection(port = 8000) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            console.log(`✅ Сервер отвечает на порту ${port}`);
            console.log(`📊 Статус: ${res.statusCode}`);
            console.log(`📋 Заголовки:`, res.headers);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`📄 Размер ответа: ${data.length} байт`);
                if (data.includes('<title>')) {
                    console.log('✅ HTML страница загружена корректно');
                } else {
                    console.log('⚠️ Ответ не содержит HTML');
                }
                resolve(true);
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Ошибка подключения к порту ${port}:`);
            console.log(`   ${error.message}`);
            reject(error);
        });
        
        req.setTimeout(5000, () => {
            console.log(`⏰ Таймаут подключения к порту ${port}`);
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function runTests() {
    try {
        // Тест основного порта
        await testConnection(8000);
        
        // Тест конкретных страниц
        console.log('\n🔍 Тестируем конкретные страницы...');
        
        const pages = [
            '/',
            '/index.html',
            '/test-access.html',
            '/check.html',
            '/style.css',
            '/script.js'
        ];
        
        for (const page of pages) {
            try {
                const req = http.get(`http://localhost:8000${page}`, (res) => {
                    console.log(`✅ ${page}: ${res.statusCode}`);
                });
                req.on('error', () => {
                    console.log(`❌ ${page}: Ошибка`);
                });
                req.setTimeout(2000, () => {
                    console.log(`⏰ ${page}: Таймаут`);
                    req.destroy();
                });
            } catch (error) {
                console.log(`❌ ${page}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.log('\n❌ Сервер недоступен');
        console.log('💡 Возможные причины:');
        console.log('   • Сервер не запущен');
        console.log('   • Порт заблокирован');
        console.log('   • Проблемы с файрволом');
        console.log('\n🔧 Попробуйте:');
        console.log('   • node server.js');
        console.log('   • Проверить порт: netstat -an | findstr :8000');
    }
}

runTests();