import React, { useState, useEffect } from 'react';
import FlashPostCarousel from './FlashPostCarousel';

const FlashPostApp = () => {
  const [slides, setSlides] = useState([]);
  const [currentView, setCurrentView] = useState('start'); // 'start', 'carousel', 'editor'
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [instagramContact, setInstagramContact] = useState('');

  // Popular topics for quick ideas
  const popularTopics = [
    "AI и нейросети",
    "Криптовалюты", 
    "NFT и Web3",
    "Пассивный доход",
    "Личный бренд",
    "Минимализм",
    "Ментальное здоровье",
    "Продуктивность",
    "Инвестиции",
    "Стартапы",
    "Фриланс",
    "Саморазвитие",
    "Здоровый образ жизни",
    "Путешествия",
    "Кулинария",
    "Мода и стиль"
  ];

  // Generate slides function
  const generateSlides = async (selectedTopic) => {
    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate slides based on topic
      const slideCount = Math.floor(Math.random() * 4) + 8; // 8-11 slides
      const generatedSlides = [];
      
      const templates = [
        { title: "Hook", text: `🔥 Секреты ${selectedTopic.toLowerCase()}, которые изменят жизнь` },
        { title: "Problem", text: `❌ Главная ошибка в ${selectedTopic.toLowerCase()}` },
        { title: "Solution", text: `✅ Проверенная стратегия успеха` },
        { title: "Step1", text: `1️⃣ Первый шаг к мастерству` },
        { title: "Step2", text: `2️⃣ Как избежать ошибок` },
        { title: "Step3", text: `3️⃣ Продвинутые техники` },
        { title: "Tools", text: `🛠️ Must-have инструменты` },
        { title: "Results", text: `📊 Реальные результаты` },
        { title: "Warning", text: `⚠️ Что может пойти не так` },
        { title: "CTA", text: `🎯 Начните применять сегодня!` }
      ];
      
      for (let i = 0; i < slideCount; i++) {
        const template = templates[i % templates.length];
        generatedSlides.push({
          title: template.title,
          text: template.text
        });
      }
      
      setSlides(generatedSlides);
      setCurrentView('carousel');
      
    } catch (error) {
      console.error('Error generating slides:', error);
      alert('Ошибка генерации слайдов');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generate button click
  const handleGenerate = () => {
    if (topic.trim().length < 3) {
      alert('Введите тему (минимум 3 символа)');
      return;
    }
    generateSlides(topic);
  };

  // Handle topic selection
  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
  };

  // Handle slide change
  const handleSlideChange = (index) => {
    if (index === 'edit') {
      setCurrentView('editor');
    }
  };

  // Start screen component
  const StartScreen = () => (
    <div className="section active">
      <div className="start-section">
        <div className="glass-card header">
          <h1 className="title">⚡ FlashPost</h1>
          <p className="subtitle">Создай карусель за 30 секунд</p>
        </div>
        
        <div className="ideas glass-card">
          <h3>💡 Популярные темы</h3>
          <div className="ideas-grid">
            {popularTopics.map((topicItem, index) => (
              <div 
                key={index}
                className="idea"
                onClick={() => handleTopicSelect(topicItem)}
              >
                {topicItem}
              </div>
            ))}
          </div>
        </div>
        
        <div className="input-section glass-card">
          <label className="input-label">О чем создать карусель?</label>
          <div className="input-wrapper">
            <textarea 
              className="topic-input" 
              placeholder="Например: Здоровое питание, Продуктивность, Финансы..."
              rows="2"
              maxLength="200"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="input-counter">{topic.length}/200</div>
          </div>
        </div>
        
        <div className="input-section glass-card">
          <label className="input-label">Instagram (будет на слайдах)</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              className="topic-input" 
              placeholder="@your_instagram"
              maxLength="50"
              value={instagramContact}
              onChange={(e) => setInstagramContact(e.target.value)}
            />
          </div>
        </div>
        
        <div className="actions">
          <button className="btn btn-secondary">
            ✏️ Ручной ввод
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="spinner"></div>
                Создание...
              </>
            ) : (
              <>🚀 Создать</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render based on current view
  return (
    <div className="app">
      {currentView === 'start' && <StartScreen />}
      {currentView === 'carousel' && (
        <FlashPostCarousel 
          slides={slides}
          instagramContact={instagramContact}
          onSlideChange={handleSlideChange}
        />
      )}
      {currentView === 'editor' && (
        <div className="editor-placeholder">
          <h2>Редактор (в разработке)</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentView('carousel')}
          >
            ← Назад к карусели
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashPostApp;