# Requirements Document

## Introduction

FlashPost MVP - это Telegram Mini App для создания Instagram каруселей с AI-генерацией контента. Система должна быть стабильной, готовой к продакшену и полностью совместимой с Telegram WebApp API. Проект находится на финальной стадии подготовки к релизу после устранения критических проблем.

## Glossary

- **FlashPost_System**: Основная система создания каруселей
- **Telegram_WebApp**: Telegram Mini App API и интеграция
- **Drag_System**: Система перетаскивания текстовых блоков
- **AI_Generator**: Система генерации контента с помощью ИИ
- **Export_Manager**: Система экспорта готовых каруселей
- **Error_Handler**: Система обработки и мониторинга ошибок
- **Touch_Handler**: Система обработки touch событий
- **Modal_Manager**: Система управления модальными окнами
- **Limit_Checker**: Система проверки FREE/PRO лимитов
- **UX_Polish**: Система UX улучшений (никнейм, навигация, CTA)

## Requirements

### Requirement 1: Стабильность и обработка ошибок

**User Story:** Как пользователь, я хочу, чтобы приложение работало стабильно без ошибок, чтобы иметь надежный опыт использования.

#### Acceptance Criteria

1. THE Error_Handler SHALL catch and log all JavaScript errors without crashing the application
2. WHEN an unhandled promise rejection occurs, THE Error_Handler SHALL log the error and continue operation
3. WHEN a DOM element is not found, THE FlashPost_System SHALL handle the null reference gracefully
4. WHEN any function encounters an error, THE Error_Handler SHALL log the error and provide fallback behavior
5. THE FlashPost_System SHALL validate all input parameters before processing

### Requirement 2: Telegram WebApp интеграция

**User Story:** Как пользователь Telegram, я хочу, чтобы приложение корректно работало в Telegram Mini App, чтобы использовать все возможности платформы.

#### Acceptance Criteria

1. WHEN Telegram WebApp API недоступен, THE Telegram_WebApp SHALL provide fallback functionality for browser usage
2. THE Telegram_WebApp SHALL safely initialize and expand the WebApp interface
3. WHEN theme parameters are available, THE Telegram_WebApp SHALL apply Telegram theme colors to the interface
4. THE Telegram_WebApp SHALL provide haptic feedback for user interactions when available
5. WHEN WebApp initialization fails, THE FlashPost_System SHALL continue working in browser mode

### Requirement 3: Стабильный Drag & Drop

**User Story:** Как создатель контента, я хочу плавно перетаскивать текстовые блоки, чтобы точно позиционировать элементы на слайде.

#### Acceptance Criteria

1. WHEN a user starts dragging a text block, THE Drag_System SHALL calculate positions accurately within slide boundaries
2. THE Drag_System SHALL constrain text block positions to 10-90% of slide area to prevent edge overflow
3. WHEN dragging on touch devices, THE Touch_Handler SHALL convert touch events to mouse events seamlessly
4. THE Drag_System SHALL provide visual feedback during dragging with scaling and z-index changes
5. WHEN drag operation ends, THE Drag_System SHALL clean up all event listeners properly

### Requirement 4: Модальные окна

**User Story:** Как пользователь, я хочу, чтобы модальные окна работали консистентно, чтобы иметь предсказуемый интерфейс.

#### Acceptance Criteria

1. THE Modal_Manager SHALL use unified CSS classes for all modal windows
2. WHEN a modal is opened, THE Modal_Manager SHALL focus appropriate input elements
3. THE Modal_Manager SHALL handle modal closing through buttons and outside clicks
4. WHEN modal elements are missing, THE Modal_Manager SHALL handle errors gracefully
5. THE Modal_Manager SHALL prevent body scrolling when modals are open

### Requirement 5: FREE/PRO лимиты

**User Story:** Как владелец продукта, я хочу корректно ограничивать функции для FREE пользователей, чтобы монетизировать PRO подписку.

#### Acceptance Criteria

1. THE Limit_Checker SHALL validate slide count against user tier limits before allowing new slides
2. WHEN AI generation limit is reached, THE Limit_Checker SHALL prevent further AI usage for FREE users
3. THE Limit_Checker SHALL check text blocks per slide limit before allowing new text additions
4. WHEN user upgrades to PRO, THE FlashPost_System SHALL remove all PRO locks immediately
5. THE Limit_Checker SHALL handle limit validation errors gracefully

### Requirement 6: Touch события

**User Story:** Как мобильный пользователь, я хочу, чтобы touch взаимодействия работали плавно, чтобы комфортно использовать приложение на телефоне.

#### Acceptance Criteria

1. THE Touch_Handler SHALL prevent default browser behavior for touch events to avoid conflicts
2. WHEN touch events occur, THE Touch_Handler SHALL convert them to equivalent mouse events
3. THE Touch_Handler SHALL support swipe gestures for slide navigation
4. WHEN touch drag ends, THE Touch_Handler SHALL clean up all touch event listeners
5. THE Touch_Handler SHALL handle multi-touch scenarios gracefully

### Requirement 7: UX Polish - Никнейм система

**User Story:** Как создатель контента, я хочу ввести свой никнейм один раз и видеть его на первом и последнем слайде, чтобы персонализировать карусель.

#### Acceptance Criteria

1. WHEN the app starts, THE UX_Polish SHALL show nickname input modal if no nickname is set
2. THE UX_Polish SHALL automatically add @ prefix if user doesn't include it
3. WHEN nickname is set, THE UX_Polish SHALL update first slide welcome text with the nickname
4. WHEN nickname is set, THE UX_Polish SHALL update last slide CTA text with the nickname
5. THE UX_Polish SHALL allow nickname editing by clicking on header nickname

### Requirement 8: UX Polish - Навигация

**User Story:** Как пользователь, я хочу интуитивную навигацию между слайдами, чтобы легко просматривать и редактировать карусель.

#### Acceptance Criteria

1. THE UX_Polish SHALL display "Листай →" hint with animation to guide users
2. THE UX_Polish SHALL show slide indicators with home (🏠) and target (🎯) icons
3. WHEN on first slide, THE UX_Polish SHALL disable previous button
4. WHEN on last slide, THE UX_Polish SHALL disable next button
5. THE UX_Polish SHALL support keyboard arrow navigation between slides

### Requirement 9: UX Polish - CTA на последнем слайде

**User Story:** Как создатель контента, я хочу, чтобы последний слайд автоматически содержал призыв к действию с моим никнеймом, чтобы привлекать подписчиков.

#### Acceptance Criteria

1. WHEN creating slides, THE UX_Polish SHALL mark the last slide with isLastSlide flag
2. THE UX_Polish SHALL automatically generate CTA text "Подпишись на @nickname" for last slide
3. WHEN nickname changes, THE UX_Polish SHALL update CTA text on last slide
4. THE UX_Polish SHALL style last slide CTA text prominently
5. WHEN AI generates slides, THE UX_Polish SHALL ensure last slide contains CTA

### Requirement 10: Система мониторинга

**User Story:** Как разработчик, я хочу отслеживать ошибки в продакшене, чтобы быстро выявлять и исправлять проблемы.

#### Acceptance Criteria

1. THE Error_Handler SHALL implement global error monitoring for production
2. THE Error_Handler SHALL collect error statistics and user context
3. WHEN critical errors occur, THE Error_Handler SHALL send error reports to monitoring service
4. THE Error_Handler SHALL implement error rate limiting to prevent spam
5. THE Error_Handler SHALL provide error recovery mechanisms where possible

### Requirement 11: Производительность

**User Story:** Как пользователь, я хочу, чтобы приложение загружалось быстро и работало плавно, чтобы иметь комфортный опыт использования.

#### Acceptance Criteria

1. THE FlashPost_System SHALL load within 2 seconds on 3G connection
2. THE FlashPost_System SHALL maintain 60fps during animations and transitions
3. THE FlashPost_System SHALL optimize DOM manipulations to minimize reflows
4. THE FlashPost_System SHALL implement debouncing for frequent user interactions
5. THE FlashPost_System SHALL keep memory usage stable during extended use

### Requirement 12: Экспорт готовых каруселей

**User Story:** Как создатель контента, я хочу экспортировать готовые карусели в высоком качестве, чтобы публиковать их в Instagram.

#### Acceptance Criteria

1. THE Export_Manager SHALL provide 720p PNG export for FREE users
2. THE Export_Manager SHALL offer 1080p, 4K PNG and PDF formats for PRO users
3. WHEN export starts, THE Export_Manager SHALL show progress indication
4. THE Export_Manager SHALL generate files with proper Instagram carousel dimensions
5. WHEN export completes, THE Export_Manager SHALL provide download links or save files locally

### Requirement 13: AI генерация контента

**User Story:** Как создатель контента, я хочу генерировать слайды с помощью AI, чтобы быстро создавать качественный контент.

#### Acceptance Criteria

1. THE AI_Generator SHALL accept topic input and generate relevant slide content
2. THE AI_Generator SHALL respect user tier limits (3 generations/day for FREE, unlimited for PRO)
3. WHEN AI generation is in progress, THE AI_Generator SHALL show loading state
4. THE AI_Generator SHALL generate slides with appropriate backgrounds and text styling
5. WHEN AI generation fails, THE AI_Generator SHALL show error message and restore UI state

### Requirement 14: Совместимость с браузерами

**User Story:** Как пользователь, я хочу, чтобы приложение работало в разных браузерах, чтобы иметь доступ независимо от платформы.

#### Acceptance Criteria

1. THE FlashPost_System SHALL work correctly in Chrome, Safari, Firefox, and Edge
2. THE FlashPost_System SHALL provide fallbacks for CSS features not supported in older browsers
3. THE FlashPost_System SHALL handle vendor prefixes for CSS properties
4. THE FlashPost_System SHALL work on both desktop and mobile browsers
5. THE FlashPost_System SHALL gracefully degrade features when browser APIs are unavailable