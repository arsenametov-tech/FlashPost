@echo off
echo 🚀 Запуск FlashPost Test Server...
echo.
echo ✅ РАБОЧИЕ ССЫЛКИ:
echo 📱 Основное приложение: http://localhost:8000/flashpost-working-complete.html
echo 🚀 Страница запуска: http://localhost:8000/open-flashpost.html
echo ⚡ Быстрый доступ: http://localhost:8000/flashpost-quick-access.html
echo 🧪 Полный тест: http://localhost:8000/flashpost-complete-test-fixed.html
echo.
echo 🔧 Альтернативные версии:
echo 📱 UX Polished: http://localhost:8000/flashpost-mvp-ux-polished.html
echo 🎨 Template Test: http://localhost:8000/test-template-system.html
echo.
echo Запуск сервера на порту 8000...
echo Нажмите Ctrl+C для остановки
echo.

start http://localhost:8000/open-flashpost.html

python -m http.server 8000 2>nul || (
    echo Python не найден, пробуем альтернативный метод...
    node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{const file=path.join(__dirname,req.url==='/'?'/open-flashpost.html':req.url);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}const ext=path.extname(file);const contentType={'html':'text/html','css':'text/css','js':'application/javascript'}[ext.slice(1)]||'text/plain';res.writeHead(200,{'Content-Type':contentType});res.end(data);});}).listen(8000,()=>console.log('Server running on http://localhost:8000'));" 2>nul || (
        echo Не удалось запустить сервер. Откройте файлы напрямую в браузере.
        echo.
        echo 📱 Откройте в браузере: flashpost-working-complete.html
        pause
    )
)