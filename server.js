const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;

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
    if (filePath === './') {
        filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 - Файл не найден</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>404 - Файл не найден</h1>
                            <p>Файл ${req.url} не существует</p>
                            <a href="/">← Вернуться на главную</a>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Ошибка сервера: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 FlashPost сервер запущен на http://localhost:${port}`);
    console.log(`🌐 Также доступен на http://127.0.0.1:${port}`);
    console.log(`📁 Обслуживает файлы из: ${__dirname}`);
    console.log(`⏰ Запущен: ${new Date().toLocaleString()}`);
    console.log(`\n🎯 Для тестирования откройте:`);
    console.log(`   • http://localhost:${port} - Основное приложение`);
    console.log(`   • http://localhost:${port}/test-access.html - Тест доступа`);
    console.log(`   • http://localhost:${port}/check.html - Проверка системы`);
    console.log(`\n💡 Для остановки нажмите Ctrl+C`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`❌ Порт ${port} уже используется.`);
        console.log(`💡 Попробуйте:`);
        console.log(`   • Закрыть другие приложения на порту ${port}`);
        console.log(`   • Использовать другой порт: PORT=3000 node server.js`);
        console.log(`   • Или подождать несколько секунд и попробовать снова`);
    } else if (error.code === 'EACCES') {
        console.log(`❌ Нет прав доступа к порту ${port}`);
        console.log(`💡 Попробуйте запустить от имени администратора или используйте порт > 1024`);
    } else {
        console.log(`❌ Ошибка сервера: ${error.message}`);
        console.log(`🔧 Код ошибки: ${error.code}`);
    }
    process.exit(1);
});