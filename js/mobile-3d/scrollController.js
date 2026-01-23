// ============================================
// MOBILE-3D SCROLL CONTROLLER - FIXED VERSION
// Direction-aware UI triggering
// ============================================

class Mobile3DScrollController {
    constructor(cameraController) {
        this.cameraController = cameraController;
        
        // Scroll state
        this.scrollEnabled = false;
        this.currentScroll = 0; // 0-100%
        this.targetScroll = 0;
        this.scrollVelocity = 0;
        this.lastScroll = 0; // Track previous scroll for direction
        
        // Touch tracking for momentum
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.lastTouchY = 0;
        this.lastTouchTime = 0;
        
        // Scroll limits
        this.scrollMin = 0;
        this.scrollMax = 100;
        this.infiniteLoop = true;
        
        // 🆕 DIRECTION TRACKING
        this.scrollDirection = 'none'; // 'forward', 'backward', 'none'
        this.previousScreen = null;
        this.currentScreen = null;
        
        // 🆕 OUTRO UI STATE MANAGEMENT
        this.outroUIState = {
            hasShownThisVisit: false,     // 🔧 Track if UI shown THIS visit to outro
            hasEnteredEnvironment: false, // Track if user entered environment
            isAtOutro: false,             // Currently at outro
            justLeftScreen4: false,       // 🔧 Just left screen4 (resets when leaving outro)
            uiCurrentlyShowing: false     // 🔧 NEW: Prevent multiple UI calls
        };
        
        // Scroll sensitivity
        this.scrollSensitivity = 0.08; // Increased for better responsiveness
        this.touchSensitivity = 0.06;  // Increased for better responsiveness
        this.momentumDecay = 0.93;
        this.scrollSmoothing = 0.25; // Increased from 0.12 for faster progress bar updates
        
        // Progress bar element
        this.progressBar = document.querySelector('.mobile-progress-fill');
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Scroll controller initialized with direction tracking');
    }
    
    /**
     * Setup event listeners for scroll and touch
     */
    setupEventListeners() {
        this.wheelHandler = (e) => this.onWheel(e);
        this.touchStartHandler = (e) => this.onTouchStart(e);
        this.touchMoveHandler = (e) => this.onTouchMove(e);
        this.touchEndHandler = (e) => this.onTouchEnd(e);
    }
    
    /**
     * Enable scrolling (called after intro)
     */
    enableScroll() {
        if (this.scrollEnabled) return;
        
        this.scrollEnabled = true;
        this.outroUIState.hasEnteredEnvironment = true;
        
        window.addEventListener('wheel', this.wheelHandler, { passive: false });
        window.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        window.addEventListener('touchend', this.touchEndHandler, { passive: false });
        
        this.startUpdateLoop();
        
        console.log('✅ Scroll enabled - environment entered');
    }
    
    /**
     * Disable scrolling
     */
    disableScroll() {
        if (!this.scrollEnabled) return;
        
        this.scrollEnabled = false;
        
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('touchstart', this.touchStartHandler);
        window.removeEventListener('touchmove', this.touchMoveHandler);
        window.removeEventListener('touchend', this.touchEndHandler);
        
        console.log('🚫 Scroll disabled');
    }
    
    /**
     * Handle wheel event
     */
    onWheel(e) {
        if (!this.scrollEnabled) return;
        
        e.preventDefault();
        
        const delta = e.deltaY * this.scrollSensitivity;
        this.updateScrollWithDelta(delta);
    }
    
    /**
     * Handle touch start
     */
    onTouchStart(e) {
        if (!this.scrollEnabled) return;
        
        const target = e.target;
        if (target.closest('.hamburger') || 
            target.closest('.mobile-nav') || 
            target.closest('.mobile-modal') ||
            target.closest('#mobile-header')) {
            return;
        }
        
        e.preventDefault();
        
        this.touchStartY = e.touches[0].clientY;
        this.lastTouchY = this.touchStartY;
        this.touchStartTime = performance.now();
        this.lastTouchTime = this.touchStartTime;
        
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
        
        const deltaY = this.lastTouchY - currentY;
        const deltaTime = currentTime - this.lastTouchTime;
        
        const scrollDelta = deltaY * this.touchSensitivity;
        this.updateScrollWithDelta(scrollDelta);
        
        if (deltaTime > 0) {
            this.scrollVelocity = scrollDelta / deltaTime * 16;
        }
        
        this.lastTouchY = currentY;
        this.lastTouchTime = currentTime;
    }
    
    /**
     * Handle touch end
     */
    onTouchEnd(e) {
        if (!this.scrollEnabled) return;
        
        if (Math.abs(this.scrollVelocity) > 0.5) {
            this.applyMomentum();
        }
    }
    
    /**
     * 🆕 UPDATE SCROLL WITH DELTA - CORE LOGIC
     */
    updateScrollWithDelta(delta) {
        // Store previous scroll for direction detection
        this.lastScroll = this.currentScroll;
        
        // Update target scroll
        this.targetScroll += delta;
        
        // 🆕 DETECT SCROLL DIRECTION
        if (delta > 0.1) {
            this.scrollDirection = 'forward';
        } else if (delta < -0.1) {
            this.scrollDirection = 'backward';
        }
        
        // 🆕 CHECK IF APPROACHING OUTRO FROM SCREEN4
        const currentScreen = this.getCurrentScreen();
        const approachingOutro = this.targetScroll >= 95 && currentScreen === 'screen4';
        
        if (approachingOutro && this.scrollDirection === 'forward') {
            console.log('🎯 Approaching outro from screen4 - will trigger UI');
            this.outroUIState.lastTriggerDirection = 'forward';
        }
        
        // 🆕 HANDLE INFINITE LOOP WITH SPECIAL OUTRO LOGIC
        if (this.infiniteLoop) {
            if (this.targetScroll > this.scrollMax) {
                // Wrapping forward: outro → screen1
                console.log('🔄 Wrapping forward: outro → screen1');
                
                // 🔧 CHECK: Should we show UI?
                // Only show if: coming from screen4 AND haven't shown yet AND not currently showing
                if (this.outroUIState.justLeftScreen4 && 
                    !this.outroUIState.hasShownThisVisit && 
                    !this.outroUIState.uiCurrentlyShowing) {
                    
                    console.log('⏸️ PAUSING for UI - first time at outro from screen4');
                    
                    // Don't wrap yet - stay at outro
                    this.targetScroll = this.scrollMax;
                    
                    // Mark that we're showing UI (prevents duplicate calls)
                    this.outroUIState.uiCurrentlyShowing = true;
                    
                    // Show UI
                    this.checkAndShowOutroUI('forward');
                    
                    // Disable scroll during UI
                    this.scrollEnabled = false;
                } else {
                    // UI already shown or not coming from screen4 - just wrap
                    if (!this.outroUIState.uiCurrentlyShowing) {
                        console.log('➡️ Wrapping forward (UI already shown or not from screen4)');
                        this.performWrapAround('forward');
                    }
                }
                
            } else if (this.targetScroll < this.scrollMin) {
                // Wrapping backward: screen1 → outro
                console.log('🔄 Wrapping backward: screen1 → outro');
                
                // Just wrap - never show UI on backward
                this.performWrapAround('backward');
                
            } else {
                // Normal scroll within bounds
                this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, this.targetScroll));
            }
        } else {
            this.targetScroll = Math.max(this.scrollMin, Math.min(this.scrollMax, this.targetScroll));
        }
    }
    
    /**
     * 🆕 PERFORM WRAP AROUND
     */
    performWrapAround(direction) {
        if (direction === 'forward') {
            this.targetScroll = this.scrollMin + (this.targetScroll - this.scrollMax);
            this.currentScroll = this.scrollMin;
        } else {
            this.targetScroll = this.scrollMax + this.targetScroll;
            this.currentScroll = this.scrollMax;
        }
    }
    
    /**
     * 🆕 CHECK AND SHOW OUTRO UI
     */
    async checkAndShowOutroUI(direction) {
        console.log('🔍 Outro UI - Showing modal');
        
        // Show social media UI
        if (window.mobile3DApp?.mobileUI) {
            await window.mobile3DApp.mobileUI.showOutroModal();
            
            // 🔧 After UI closes, mark as shown and reset flags
            this.outroUIState.hasShownThisVisit = true;
            this.outroUIState.uiCurrentlyShowing = false;
            
            console.log('✅ UI closed - marked as shown for this visit');
        }
    }
    
    /**
     * Apply momentum scrolling
     */
    applyMomentum() {
        const momentumLoop = () => {
            if (Math.abs(this.scrollVelocity) < 0.1) {
                this.scrollVelocity = 0;
                return;
            }
            
            this.updateScrollWithDelta(this.scrollVelocity);
            
            this.scrollVelocity *= this.momentumDecay;
            
            requestAnimationFrame(momentumLoop);
        };
        
        momentumLoop();
    }
    
    /**
     * Start update loop
     */
    startUpdateLoop() {
        const update = () => {
            if (!this.scrollEnabled) return;
            
            // Smooth lerp to target scroll for camera
            this.currentScroll += (this.targetScroll - this.currentScroll) * this.scrollSmoothing;
            
            // Update camera position
            this.cameraController.setPositionFromScroll(this.currentScroll);
            
            // Update progress bar DIRECTLY with target scroll for instant feedback
            this.updateProgressBar(this.targetScroll);
            
            // 🆕 TRACK SCREEN CHANGES
            this.trackScreenChanges();
            
            // Update debug info
            this.updateDebugInfo();
            
            requestAnimationFrame(update);
        };
        
        update();
    }
    
    /**
     * 🆕 TRACK SCREEN CHANGES
     */
    trackScreenChanges() {
        const newScreen = this.getCurrentScreen();
        
        if (newScreen !== this.currentScreen) {
            this.previousScreen = this.currentScreen;
            this.currentScreen = newScreen;
            
            console.log(`📍 Screen changed: ${this.previousScreen} → ${this.currentScreen}`);
            
            // 🔧 RESET UI STATE WHEN LEAVING OUTRO
            if (this.previousScreen === 'outro' && this.currentScreen !== 'outro') {
                this.outroUIState.isAtOutro = false;
                this.outroUIState.hasShownThisVisit = false; // Reset for next visit
                this.outroUIState.justLeftScreen4 = false;
                this.outroUIState.uiCurrentlyShowing = false; // Reset UI showing flag
                console.log('📤 Left outro - UI state fully reset');
            }
            
            // 🔧 MARK WHEN LEAVING SCREEN4 FOR OUTRO
            if (this.previousScreen === 'screen4' && this.currentScreen === 'outro') {
                this.outroUIState.justLeftScreen4 = true;
                console.log('🎯 Just entered outro from screen4');
                
                // 🔧 WAIT 800MS FOR CAMERA TO FULLY SETTLE AT OUTRO (increased from 500ms)
                if (!this.outroUIState.hasShownThisVisit && !this.outroUIState.uiCurrentlyShowing) {
                    console.log('⏸️ At outro position - waiting for camera to fully settle...');
                    this.outroUIState.uiCurrentlyShowing = true;
                    
                    // Wait longer for camera to settle and for velocity to be very low
                    setTimeout(() => {
                        // Triple-check: still at outro, not moving fast, and scroll progress is very close to 100
                        const isAtOutro = this.getCurrentScreen() === 'outro';
                        const isStable = Math.abs(this.scrollVelocity) < 0.3; // Stricter check
                        const isNearEnd = this.currentScroll > 95; // Must be near the end
                        
                        if (isAtOutro && isStable && isNearEnd) {
                            console.log('✅ Camera fully settled - showing UI');
                            this.disableScroll();
                            this.checkAndShowOutroUI('forward');
                        } else {
                            console.log('⚠️ Camera still moving or not at end - skipping UI');
                            console.log(`  isAtOutro: ${isAtOutro}, isStable: ${isStable}, isNearEnd: ${isNearEnd}`);
                            console.log(`  velocity: ${this.scrollVelocity.toFixed(3)}, scroll: ${this.currentScroll.toFixed(1)}%`);
                            this.outroUIState.uiCurrentlyShowing = false;
                        }
                    }, 800); // Increased from 500ms to 800ms
                }
            }
            
            // Mark when entering outro
            if (this.currentScreen === 'outro') {
                this.outroUIState.isAtOutro = true;
                console.log('📥 Entered outro position');
            }
        }
    }
    
    /**
     * Set scroll to specific percentage
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
    updateProgressBar(scrollPercent) {
        if (this.progressBar) {
            // Use provided scroll percent or current scroll
            const percent = scrollPercent !== undefined ? scrollPercent : this.currentScroll;
            this.progressBar.style.width = `${percent}%`;
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
     * Navigate to specific screen
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
        
        const scrollPercent = this.cameraController.getScrollPercentForPosition(positionKey);
        
        console.log(`🎯 Navigating to ${screenId} (${scrollPercent.toFixed(1)}%)`);
        
        this.setScroll(scrollPercent);
    }
    
    /**
     * Reset scroll to beginning
     */
    reset() {
        this.currentScroll = 0;
        this.targetScroll = 0;
        this.scrollVelocity = 0;
        this.outroUIState = {
            hasShownThisVisit: false,
            hasEnteredEnvironment: false,
            isAtOutro: false,
            justLeftScreen4: false,
            uiCurrentlyShowing: false
        };
        this.updateProgressBar();
    }
    
    /**
     * Get current screen from scroll position
     */
    getCurrentScreen() {
        return this.cameraController.getCurrentScreen();
    }
}