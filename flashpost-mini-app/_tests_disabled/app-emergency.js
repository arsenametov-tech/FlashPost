// ===== EMERGENCY UI STABILIZATION =====
// Single Screen MVP - Minimal guaranteed working UI

// Simple state for emergency mode
let emergencyState = {
    slides: [],
    currentSlideIndex: 0
};

// Emergency UI Stabilization
function initEmergencyUI() {
    console.log('🚨 EMERGENCY UI STABILIZATION - Starting...');
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderEmergencyUI);
    } else {
        renderEmergencyUI();
    }
}

function renderEmergencyUI() {
    console.log('🎯 Rendering Emergency UI...');
    
    const app = document.getElementById('app');
    const loading = document.getElementById('loading');
    
    if (!app) {
        console.error('❌ #app element not found');
        return;
    }
    
    // Hide loading
    if (loading) {
        loading.style.display = 'none';
    }
    
    // Show app
    app.style.display = 'block';
    
    // Render static layout
    app.innerHTML = `
        <div style="
            min-height: 100vh;
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <!-- Header -->
            <div style="
                text-align: center;
                margin-bottom: 40px;
            ">
                <h1 style="
                    font-size: 32px;
                    font-weight: 800;
                    margin: 0 0 10px 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">⚡ FlashPost Mini App</h1>
                <p style="
                    font-size: 16px;
                    opacity: 0.9;
                    margin: 0;
                ">Emergency UI Mode - Single Screen MVP</p>
            </div>
            
            <!-- Generate Button -->
            <button id="generateTestBtn" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 20px 40px;
                border-radius: 15px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                margin-bottom: 40px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🎯 Generate Test Carousel
            </button>
            
            <!-- Preview Area -->
            <div style="
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 20px;
                padding: 30px;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                max-width: 400px;
                width: 100%;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            ">
                <h3 style="
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 600;
                ">📱 Preview Area</h3>
                
                <div id="slidePreview" style="
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 15px;
                    padding: 40px 20px;
                    min-height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    line-height: 1.5;
                ">
                    <div style="opacity: 0.7;">
                        Click "Generate Test Carousel" to see slides
                    </div>
                </div>
                
                <!-- Navigation -->
                <div id="navigation" style="
                    margin-top: 20px;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                ">
                    <button id="prevBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 10px 15px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">← Prev</button>
                    
                    <span id="slideCounter" style="
                        font-size: 14px;
                        opacity: 0.8;
                    ">1 / 3</span>
                    
                    <button id="nextBtn" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 10px 15px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Next →</button>
                </div>
            </div>
            
            <!-- Status -->
            <div id="status" style="
                margin-top: 30px;
                font-size: 14px;
                opacity: 0.7;
                text-align: center;
            ">
                ✅ Emergency UI Active - Basic functionality only
            </div>
        </div>
    `;
    
    // Bind events
    bindEmergencyEvents();
    
    console.log('✅ Emergency UI rendered successfully');
}

function bindEmergencyEvents() {
    console.log('🔗 Binding emergency events...');
    
    // Generate button
    const generateBtn = document.getElementById('generateTestBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateTestCarousel);
        console.log('✅ Generate button bound');
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (emergencyState.currentSlideIndex > 0) {
                emergencyState.currentSlideIndex--;
                renderCurrentSlide();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (emergencyState.currentSlideIndex < emergencyState.slides.length - 1) {
                emergencyState.currentSlideIndex++;
                renderCurrentSlide();
            }
        });
    }
}

function generateTestCarousel() {
    console.log('🎯 Generating test carousel...');
    
    const generateBtn = document.getElementById('generateTestBtn');
    const status = document.getElementById('status');
    
    // Update button state
    if (generateBtn) {
        generateBtn.textContent = '⏳ Generating...';
        generateBtn.disabled = true;
    }
    
    // Update status
    if (status) {
        status.innerHTML = '⏳ Creating 3 test slides...';
    }
    
    // Create 3 test slides
    emergencyState.slides = [
        {
            id: 'slide_1',
            title: 'Welcome Slide',
            text: '🚀 Welcome to FlashPost!\n\nThis is your first slide in the carousel.',
            background: '#833ab4'
        },
        {
            id: 'slide_2', 
            title: 'Features Slide',
            text: '✨ Amazing Features:\n\n• Create beautiful carousels\n• Easy to use interface\n• Professional results',
            background: '#fd1d1d'
        },
        {
            id: 'slide_3',
            title: 'Call to Action',
            text: '🎯 Ready to Start?\n\nClick the button below to begin creating your own amazing content!',
            background: '#fcb045'
        }
    ];
    
    emergencyState.currentSlideIndex = 0;
    
    // Simulate loading
    setTimeout(() => {
        // Restore button
        if (generateBtn) {
            generateBtn.textContent = '🔄 Regenerate Test Carousel';
            generateBtn.disabled = false;
        }
        
        // Update status
        if (status) {
            status.innerHTML = '✅ Test carousel generated successfully!';
        }
        
        // Show navigation
        const navigation = document.getElementById('navigation');
        if (navigation) {
            navigation.style.display = 'flex';
        }
        
        // Render first slide
        renderCurrentSlide();
        
        console.log('✅ Test carousel generated successfully');
        
    }, 1000);
}

function renderCurrentSlide() {
    const slidePreview = document.getElementById('slidePreview');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!slidePreview || emergencyState.slides.length === 0) return;
    
    const currentSlide = emergencyState.slides[emergencyState.currentSlideIndex];
    
    // Update slide content
    slidePreview.innerHTML = `
        <div style="
            background: ${currentSlide.background};
            border-radius: 12px;
            padding: 30px;
            color: white;
            text-align: center;
            width: 100%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ">
            <h3 style="
                margin: 0 0 15px 0;
                font-size: 20px;
                font-weight: 700;
            ">${currentSlide.title}</h3>
            <div style="
                font-size: 14px;
                line-height: 1.6;
                white-space: pre-line;
            ">${currentSlide.text}</div>
        </div>
    `;
    
    // Update counter
    if (slideCounter) {
        slideCounter.textContent = `${emergencyState.currentSlideIndex + 1} / ${emergencyState.slides.length}`;
    }
    
    // Update navigation buttons
    if (prevBtn) {
        prevBtn.disabled = emergencyState.currentSlideIndex === 0;
        prevBtn.style.opacity = emergencyState.currentSlideIndex === 0 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = emergencyState.currentSlideIndex === emergencyState.slides.length - 1;
        nextBtn.style.opacity = emergencyState.currentSlideIndex === emergencyState.slides.length - 1 ? '0.5' : '1';
    }
    
    console.log(`📱 Rendered slide ${emergencyState.currentSlideIndex + 1}: ${currentSlide.title}`);
}

// Initialize emergency UI immediately
console.log('🚨 EMERGENCY MODE ACTIVATED');
initEmergencyUI();

// Make available globally for debugging
window.emergencyState = emergencyState;
window.generateTestCarousel = generateTestCarousel;