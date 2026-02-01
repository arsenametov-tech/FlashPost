import React, { useState, useEffect } from 'react';

const FlashPostCarousel = ({ slides, instagramContact, onSlideChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(null); // Track which slide is being saved

  // Save slide function using html2canvas
  const saveSlide = async (slideIndex) => {
    setIsSaving(slideIndex);
    
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const slideElement = document.getElementById(`slide-${slideIndex}`);
      if (!slideElement) {
        throw new Error('Slide element not found');
      }

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(slideElement, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: 1080,
        scrollX: 0,
        scrollY: 0
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `flashpost-slide-${slideIndex + 1}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Ошибка сохранения слайда');
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setIsSaving(null);
    }
  };

  // Save all slides
  const saveAllSlides = async () => {
    for (let i = 0; i < slides.length; i++) {
      await saveSlide(i);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Handle slide navigation
  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    onSlideChange?.(index);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Progress calculation
  const progressPercentage = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="carousel-section">
      {/* Header */}
      <div className="carousel-header glass-card">
        <h2>Ваша карусель готова!</h2>
        <p>Слайдов: {slides.length} • Детальное раскрытие темы</p>
      </div>

      {/* Carousel Container */}
      <div className="carousel-container glass-card">
        <div 
          className="carousel-track"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isFirstSlide = index === 0;
            const isLastSlide = index === slides.length - 1;
            const showInstagram = (isFirstSlide || isLastSlide) && instagramContact;

            return (
              <div 
                key={index}
                id={`slide-${index}`}
                className={`slide ${isActive ? 'active' : ''}`}
                data-index={index}
              >
                <div className="slide-text">{slide.text}</div>
                <div className="slide-number">{index + 1}/{slides.length}</div>
                
                {showInstagram && (
                  <div className="slide-instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="m16 11.37-.4-.4a6 6 0 1 0-7.2 0l-.4.4"/>
                      <circle cx="12" cy="12" r="3"/>
                      <circle cx="17.5" cy="6.5" r="1.5"/>
                    </svg>
                    {instagramContact}
                  </div>
                )}

                {/* Save button for current slide */}
                {isActive && (
                  <button 
                    className="slide-save-btn"
                    onClick={() => saveSlide(index)}
                    disabled={isSaving === index}
                    title="Сохранить слайд"
                  >
                    {isSaving === index ? (
                      <div className="spinner-small"></div>
                    ) : (
                      '💾'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="carousel-nav">
          <button 
            className="nav-btn" 
            onClick={prevSlide}
            disabled={currentSlide === 0 || isAnimating}
          >
            ‹
          </button>
          
          <div className="indicators">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          
          <button 
            className="nav-btn" 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1 || isAnimating}
          >
            ›
          </button>
        </div>

        {/* Progress Bar for many slides */}
        {slides.length > 5 && (
          <div className="carousel-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          ← Новая карусель
        </button>
        <button 
          className="btn btn-success" 
          onClick={saveAllSlides}
          disabled={isSaving !== null}
        >
          {isSaving !== null ? '💾 Сохранение...' : '💾 Скачать все'}
        </button>
        <button className="btn btn-primary" onClick={() => onSlideChange?.('edit')}>
          ✏️ Редактировать
        </button>
      </div>
    </div>
  );
};

export default FlashPostCarousel;