// ============================================
// MOBILE-3D SCROLL CONTROLLER - Proportional Camera Movement
// ============================================

class Mobile3DScrollController {
    constructor(cameraController) {
        this.cameraController = cameraController;
        
        // Scroll state
        this.scrollEnabled = false;
        this.currentScroll = 0; // 0-100%
        this.targetScroll = 0;
        this.scrollVelocity = 0;
        
        // Touch tracking for momentum
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.lastTouchY = 0;
        this.lastTouchTime = 0;
        
        // Scroll limits
        this.scrollMin = 0;
        this.scrollMax = 100;
        
        // Scroll sensitivity (adjust these for feel)
        this.scrollSensitivity = 0.15; // How much each pixel scrolls
        this.touchSensitivity = 0.08; // How much each touch pixel scrolls
        this.momentumDecay = 0.95; // Momentum decay rate
        this.scrollSmoothing = 0.12; // Smoothing factor
        
        // Progress bar element
        this.progressBar = document.querySelector('.mobile-progress-fill');
        
        // Setup event listeners (but don't enable yet)
        this.setupEventListeners();
        
        console.log('✅ Scroll controller initialized (disabled)');
    }
    
    /**
     * Setup event listeners for scroll and touch
     */
    setupEventListeners() {
        // Mouse wheel for testing on desktop
        this.wheelHandler = (e) => this.onWheel(e);
        
        // Touch events for mobile
        this.touchStartHandler = (e) => this.onTouchStart(e);
        this.touchMoveHandler = (e) => this.onTouchMove(e);
        this.touchEndHandler = (e) => this.onTouchEnd(e);
        
        console.log('✅ Event listeners prepared');
    }
    
    /**
     * Enable scrolling (called after intro)
     */
    enableScroll() {
        if (this.scrollEnabled) return;
        
        this.scrollEnabled = true;
        
        // Add event listeners
        window.addEventListener('wheel', this.wheelHandler, { passive: false });
        window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        window.addEventListener('touchend', this.touchEndHandler, { passive: false });
        
        // Start update loop
        this.startUpdateLoop();
        
        console.log('✅ Scroll enabled');
    }
    
    /**
     * Disable scrolling
     */
    disableScroll() {
        if (!this.scrollEnabled) return;
        
        this.scrollEnabled = false;
        
        // Remove event listeners
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('touchstart', this.touchStartHandler);
        window.removeEventListener('touchmove', this.touchMoveHandler);
        window.removeEventListener('touchend', this.touchEndHandler);
        
        console.log('🚫 Scroll disabled');
    }
    
    /**
     * Handle wheel event (for desktop testing)
     */
    onWheel(e) {
        if (!this.scrollEnabled) return;
        
        e.preventDefault();
        
        // Update target scroll based on wheel delta
        const delta = e.deltaY * this.scrollSensitivity;
        this.targetScroll += delta;
        
        // Clamp to limits
        this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, this.targetScroll));
    }
    
    /**
     * Handle touch start
     */
    onTouchStart(e) {
        if (!this.scrollEnabled) return;
        
        // Prevent default to avoid page scroll
        e.preventDefault();
        
        // Record start position
        this.touchStartY = e.touches[0].clientY;
        this.lastTouchY = this.touchStartY;
        this.touchStartTime = performance.now();
        this.lastTouchTime = this.touchStartTime;
        
        // Stop momentum
        this.scrollVelocity = 0;
    }
    
    /**
     * Handle touch move
     */
    onTouchMove(e) {
        if (!this.scrollEnabled) return;
        
        e.preventDefault();
        
        const currentY = e.touches[0].clientY;
        const currentTime = performance.now();
        
        // Calculate delta
        const deltaY = this.lastTouchY - currentY;
        const deltaTime = currentTime - this.lastTouchTime;
        
        // Update target scroll
        const scrollDelta = deltaY * this.touchSensitivity;
        this.targetScroll += scrollDelta;
        
        // Clamp to limits
        this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, this.targetScroll));
        
        // Calculate velocity for momentum
        if (deltaTime > 0) {
            this.scrollVelocity = scrollDelta / deltaTime * 16; // Normalize to 60fps
        }
        
        // Update last position
        this.lastTouchY = currentY;
        this.lastTouchTime = currentTime;
    }
    
    /**
     * Handle touch end - apply momentum
     */
    onTouchEnd(e) {
        if (!this.scrollEnabled) return;
        
        // Apply momentum if velocity is significant
        if (Math.abs(this.scrollVelocity) > 0.5) {
            this.applyMomentum();
        }
    }
    
    /**
     * Apply momentum scrolling
     */
    applyMomentum() {
        const momentumLoop = () => {
            if (Math.abs(this.scrollVelocity) < 0.1) {
                // Stop momentum when velocity is very small
                this.scrollVelocity = 0;
                return;
            }
            
            // Apply velocity to target scroll
            this.targetScroll += this.scrollVelocity;
            
            // Clamp to limits
            this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, this.targetScroll));
            
            // Decay velocity
            this.scrollVelocity *= this.momentumDecay;
            
            // Continue loop
            requestAnimationFrame(momentumLoop);
        };
        
        momentumLoop();
    }
    
    /**
     * Start update loop (smooth scrolling)
     */
    startUpdateLoop() {
        const update = () => {
            if (!this.scrollEnabled) return;
            
            // Smooth lerp to target scroll
            this.currentScroll += (this.targetScroll - this.currentScroll) * this.scrollSmoothing;
            
            // Update camera position based on scroll
            this.cameraController.setPositionFromScroll(this.currentScroll);
            
            // Update progress bar
            this.updateProgressBar();
            
            // Update debug info if available
            this.updateDebugInfo();
            
            // Continue loop
            requestAnimationFrame(update);
        };
        
        update();
    }
    
    /**
     * Set scroll to specific percentage (for navigation)
     */
    setScroll(percent, immediate = false) {
        this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, percent));
        
        if (immediate) {
            this.currentScroll = this.targetScroll;
        }
    }
    
    /**
     * Get current scroll percentage
     */
    getScrollPercent() {
        return this.currentScroll;
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        if (this.progressBar) {
            this.progressBar.style.width = `${this.currentScroll}%`;
        }
    }
    
    /**
     * Update debug info
     */
    updateDebugInfo() {
        const debugScroll = document.getElementById('debug-scroll');
        if (debugScroll) {
            debugScroll.textContent = `${this.currentScroll.toFixed(1)}%`;
        }
        
        const debugCamera = document.getElementById('debug-camera');
        if (debugCamera) {
            debugCamera.textContent = this.cameraController.currentPositionKey;
        }
    }
    
    /**
     * Navigate to a specific screen (sets scroll to that position)
     * @param {string} screenId - e.g., 'screen1', 'screen2'
     */
    navigateToScreen(screenId) {
        const screenMap = {
            'screen1': 'screen1-center',
            'screen2': 'screen2-center',
            'screen3': 'screen3-center',
            'screen4': 'screen4-center',
            'outro': 'outro'
        };
        
        const positionKey = screenMap[screenId];
        if (!positionKey) {
            console.error(`❌ Unknown screen: ${screenId}`);
            return;
        }
        
        // Get scroll percentage for this position
        const scrollPercent = this.cameraController.getScrollPercentForPosition(positionKey);
        
        console.log(`🎯 Navigating to ${screenId} (${scrollPercent.toFixed(1)}%)`);
        
        // Set scroll to this percentage
        this.setScroll(scrollPercent);
    }
    
    /**
     * Reset scroll to beginning
     */
    reset() {
        this.currentScroll = 0;
        this.targetScroll = 0;
        this.scrollVelocity = 0;
        this.updateProgressBar();
    }
    
    /**
     * Get current screen from scroll position
     */
    getCurrentScreen() {
        return this.cameraController.getCurrentScreen();
    }
}