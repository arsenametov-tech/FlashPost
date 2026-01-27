#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

console.log('🚀 FlashPost AI - Автозапуск сервера\n');

// Проверяем наличие основных файлов
const requiredFiles = ['server.js', 'index.html', 'style.css', 'script.js'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('❌ Отсутствуют файлы:', missingFiles.join(', '));
    console.log('💡 Убедитесь, что вы находитесь в правильной папке проекта');
    process.exit(1);
}

console.log('✅ Все необходимые файлы найдены');

// Проверяем доступность порта
function checkPort(port) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
}

async function startServer() {
    const port = 8000;
    const isPortFree = await checkPort(port);
    
    if (!isPortFree) {
        console.log(`⚠️  Порт ${port} уже используется`);
        console.log('💡 Попробуйте закрыть другие приложения или подождите');
        
        // Пытаемся найти свободный порт
        for (let testPort = 8001; testPort <= 8010; testPort++) {
            if (await checkPort(testPort)) {
                console.log(`✅ Найден свободный порт: ${testPort}`);
                process.env.PORT = testPort;
                break;
            }
        }
    } else {
        console.log(`✅ Порт ${port} свободен`);
    }
    
    console.log('\n🔄 Запускаем сервер...\n');
    
    // Запускаем сервер
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    // Обработка завершения
    process.on('SIGINT', () => {
        console.log('\n🛑 Получен сигнал остановки...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`\n🏁 Сервер завершен с кодом ${code}`);
    });
    
    serverProcess.on('error', (error) => {
        console.log(`❌ Ошибка запуска сервера: ${error.message}`);
    });
}

startServer().catch(error => {
    console.log(`❌ Критическая ошибка: ${error.message}`);
    process.exit(1);
});