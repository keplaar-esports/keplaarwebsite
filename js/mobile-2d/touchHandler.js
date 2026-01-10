// ============================================
// TOUCH HANDLER.JS - Touch Gestures
// ============================================

class TouchHandler {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // Minimum distance for swipe
        
        this.init();
    }
    
    init() {
        // Setup touch listeners
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
        
        // Setup team cards swipe
        this.setupTeamCardsSwipe();
        
        console.log('👆 Touch handler ready');
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        
        this.handleSwipe();
    }
    
    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        
        // Check if horizontal swipe is dominant
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > this.minSwipeDistance) {
                if (diffX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > this.minSwipeDistance) {
                if (diffY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        }
    }
    
    onSwipeLeft() {
        console.log('👈 Swipe left detected');
        // Could be used for navigation
    }
    
    onSwipeRight() {
        console.log('👉 Swipe right detected');
        // Could be used for navigation
    }
    
    onSwipeUp() {
        console.log('👆 Swipe up detected');
        // Natural scroll behavior
    }
    
    onSwipeDown() {
        console.log('👇 Swipe down detected');
        // Natural scroll behavior
    }
    
    setupTeamCardsSwipe() {
        const teamCards = document.querySelector('.team-cards');
        if (!teamCards) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        
        teamCards.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - teamCards.offsetLeft;
            scrollLeft = teamCards.scrollLeft;
        });
        
        teamCards.addEventListener('touchend', () => {
            isDown = false;
        });
        
        teamCards.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - teamCards.offsetLeft;
            const walk = (x - startX) * 2;
            teamCards.scrollLeft = scrollLeft - walk;
        });
    }
    
    // Add haptic feedback (if supported)
    vibrate(duration = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
    
    // Double tap detection
    setupDoubleTap(element, callback) {
        let lastTap = 0;
        
        element.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                callback(e);
                this.vibrate(20);
            }
            
            lastTap = currentTime;
        });
    }
    
    // Long press detection
    setupLongPress(element, callback, duration = 500) {
        let pressTimer;
        
        element.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                callback(e);
                this.vibrate(30);
            }, duration);
        });
        
        element.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        element.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }
}

// Make available globally
window.TouchHandler = TouchHandler;