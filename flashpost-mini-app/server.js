const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    let filePath = '.' + req.url;
    
    // Маршрутизация для мини-приложения
    if (filePath === './' || filePath === './app') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    
    // Добавляем заголовки CORS для разработки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                console.log(`❌ Файл не найден: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <html>
                        <head>
                            <title>404 - Файл не найден</title>
                            <meta charset="utf-8">
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                                .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
                                h1 { color: #e74c3c; margin-bottom: 20px; }
                                p { color: #666; margin-bottom: 20px; }
                                a { color: #833ab4; text-decoration: none; font-weight: bold; }
                                a:hover { text-decoration: underline; }
                                .links { margin-top: 30px; }
                                .links a { display: inline-block; margin: 0 10px; padding: 10px 20px; background: #833ab4; color: white; border-radius: 5px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>404 - Файл не найден</h1>
                                <p>Файл <strong>${req.url}</strong> не существует</p>
                                <div class="links">
                                    <a href="/index.html">🚀 FlashPost Mini App</a>
                                </div>
                            </div>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                console.error(`❌ Ошибка сервера: ${error.code} - ${error.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <html>
                        <head><title>500 - Ошибка сервера</title><meta charset="utf-8"></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>500 - Ошибка сервера</h1>
                            <p>Произошла внутренняя ошибка сервера</p>
                            <p>Код ошибки: ${error.code}</p>
                            <a href="/">← Вернуться на главную</a>
                        </body>
                    </html>
                `);
            }
        } else {
            // Success
            console.log(`✅ Файл отправлен: ${filePath} (${content.length} байт)`);
            res.writeHead(200, { 
                'Content-Type': mimeType + '; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

// Обработка ошибок сервера
server.on('error', (error) => {
    console.error(`\n❌ ОШИБКА СЕРВЕРА:`);
    
    if (error.code === 'EADDRINUSE') {
        console.error(`   Порт ${port} уже используется`);
        console.error(`\n💡 РЕШЕНИЯ:`);
        console.error(`   1. Закройте другие приложения на порту ${port}`);
        console.error(`   2. Используйте другой порт: SET PORT=3000 && node server.js`);
        console.error(`   3. Найдите и завершите процесс: netstat -ano | findstr :${port}`);
        console.error(`   4. Подождите несколько секунд и попробуйте снова`);
    } else if (error.code === 'EACCES') {
        console.error(`   Нет прав доступа к порту ${port}`);
        console.error(`\n💡 РЕШЕНИЯ:`);
        console.error(`   1. Запустите от имени администратора`);
        console.error(`   2. Используйте порт > 1024`);
    } else {
        console.error(`   ${error.message}`);
        console.error(`   Код ошибки: ${error.code}`);
    }
    
    console.error(`\n🔧 Для диагностики запустите:`);
    console.error(`   netstat -ano | findstr :${port}`);
    console.error(`\n`);
    
    process.exit(1);
});

// Обработка сигналов завершения
process.on('SIGINT', () => {
    console.log(`\n\n🛑 Получен сигнал SIGINT (Ctrl+C)`);
    console.log(`⏰ Завершение работы сервера...`);
    server.close(() => {
        console.log(`✅ Сервер корректно остановлен`);
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log(`\n\n🛑 Получен сигнал SIGTERM`);
    console.log(`⏰ Завершение работы сервера...`);
    server.close(() => {
        console.log(`✅ Сервер корректно остановлен`);
        process.exit(0);
    });
});

// Запуск сервера
server.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 FlashPost Mini App сервер успешно запущен!`);
    console.log(`\n📍 АДРЕСА:`);
    console.log(`   • http://localhost:${port} - Главная страница`);
    console.log(`   • http://127.0.0.1:${port} - Альтернативный адрес`);
    console.log(`\n📁 ФАЙЛЫ:`);
    console.log(`   • http://localhost:${port}/index.html - FlashPost Mini App`);
    console.log(`\n📊 ИНФОРМАЦИЯ:`);
    console.log(`   • Директория: ${__dirname}`);
    console.log(`   • Запущен: ${new Date().toLocaleString()}`);
    console.log(`   • PID: ${process.pid}`);
    console.log(`\n💡 Для остановки нажмите Ctrl+C`);
    console.log(`\n${'='.repeat(60)}\n`);
});