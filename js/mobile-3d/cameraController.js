// ============================================
// MOBILE-3D CAMERA CONTROLLER - Proportional Scroll
// ============================================

class Mobile3DCameraController {
    constructor(renderer) {
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        // No orbit controls for mobile (we control camera directly)
        
        // Define all camera positions with sub-positions
        this.positions = {
            // Intro position
            'intro': {
                position: new THREE.Vector3(4, 6, 7),
                target: new THREE.Vector3(0, 0, 0)
            },
            
            // Screen 1 - Events (3 sub-positions: left, center, right)
            'screen1-left': {
                position: new THREE.Vector3(-2, 2.5, -1),
                target: new THREE.Vector3(-3, 2.7, -7)
            },
            'screen1-center': {
                position: new THREE.Vector3(0, 2.5, -1),
                target: new THREE.Vector3(0, 2.7, -7)
            },
            'screen1-right': {
                position: new THREE.Vector3(2, 2.5, -1),
                target: new THREE.Vector3(3, 2.7, -7)
            },
            
            // Screen 2 - About Us (3 sub-positions)
            'screen2-left': {
                position: new THREE.Vector3(0.5, 2.5, 1.7),
                target: new THREE.Vector3(5, 3, 1.7)
            },
            'screen2-center': {
                position: new THREE.Vector3(2, 2.5, 1.7),
                target: new THREE.Vector3(8, 3, 1.7)
            },
            'screen2-right': {
                position: new THREE.Vector3(3.5, 2.5, 1.7),
                target: new THREE.Vector3(11, 3, 1.7)
            },
            
            // Screen 3 - Team (3 sub-positions)
            'screen3-left': {
                position: new THREE.Vector3(-2, 2.5, 4.7),
                target: new THREE.Vector3(-3, 2.5, 7)
            },
            'screen3-center': {
                position: new THREE.Vector3(0, 2.5, 4.7),
                target: new THREE.Vector3(0, 2.5, 7)
            },
            'screen3-right': {
                position: new THREE.Vector3(2, 2.5, 4.7),
                target: new THREE.Vector3(3, 2.5, 7)
            },
            
            // Screen 4 - Giveaways (3 sub-positions)
            'screen4-left': {
                position: new THREE.Vector3(-3.5, 2.5, 1.7),
                target: new THREE.Vector3(-11, 3, 1.7)
            },
            'screen4-center': {
                position: new THREE.Vector3(-2, 2.5, 1.7),
                target: new THREE.Vector3(-8, 3, 1.7)
            },
            'screen4-right': {
                position: new THREE.Vector3(-0.5, 2.5, 1.7),
                target: new THREE.Vector3(-5, 3, 1.7)
            },
            
            // Outro - Join Us
            'outro': {
                position: new THREE.Vector3(4, 6, 7),
                target: new THREE.Vector3(0, 0, 0)
            }
        };
        
        // Define the path (order of positions)
        this.path = [
            'intro',
            'screen1-left', 'screen1-center', 'screen1-right',
            'screen2-left', 'screen2-center', 'screen2-right',
            'screen3-left', 'screen3-center', 'screen3-right',
            'screen4-left', 'screen4-center', 'screen4-right',
            'outro'
        ];
        
        // Current state
        this.currentPositionKey = 'intro';
        this.targetPosition = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3(0, 0, 0);
        
        // For smooth interpolation
        this.lerpAlpha = 0.08; // Smoothness (lower = smoother but slower)
        
        // Animation state
        this.isAnimating = false;
        this.animationProgress = 0;
        this.animationStartPos = new THREE.Vector3();
        this.animationStartLookAt = new THREE.Vector3();
        this.animationTargetPos = new THREE.Vector3();
        this.animationTargetLookAt = new THREE.Vector3();
        this.animationDuration = 0;
        this.animationStartTime = 0;
        
        // Set initial position
        this.setPosition('intro');
        
        console.log('✅ Mobile-3D Camera Controller initialized');
        console.log(`📍 Total positions in path: ${this.path.length}`);
    }
    
    /**
     * Set camera to a specific position immediately
     */
    setPosition(positionKey) {
        if (!this.positions[positionKey]) {
            console.error(`❌ Position not found: ${positionKey}`);
            return;
        }
        
        const pos = this.positions[positionKey];
        this.camera.position.copy(pos.position);
        this.currentLookAt.copy(pos.target);
        this.camera.lookAt(this.currentLookAt);
        
        this.currentPositionKey = positionKey;
        
        console.log(`📍 Camera set to: ${positionKey}`);
    }
    
    /**
     * Animate camera to a specific position
     * @param {string} positionKey - Target position key
     * @param {number} duration - Animation duration in seconds
     */
    async animateToPosition(positionKey, duration = 2) {
        return new Promise((resolve) => {
            if (!this.positions[positionKey]) {
                console.error(`❌ Position not found: ${positionKey}`);
                resolve();
                return;
            }
            
            console.log(`🎬 Animating to: ${positionKey}`);
            
            const targetPos = this.positions[positionKey];
            
            // Store animation parameters
            this.isAnimating = true;
            this.animationStartPos.copy(this.camera.position);
            this.animationStartLookAt.copy(this.currentLookAt);
            this.animationTargetPos.copy(targetPos.position);
            this.animationTargetLookAt.copy(targetPos.target);
            this.animationDuration = duration * 1000; // Convert to ms
            this.animationStartTime = performance.now();
            this.animationProgress = 0;
            
            // Update current position key
            this.currentPositionKey = positionKey;
            
            // Wait for animation to complete
            const checkComplete = () => {
                if (this.animationProgress >= 1) {
                    console.log(`✅ Animation complete: ${positionKey}`);
                    resolve();
                } else {
                    requestAnimationFrame(checkComplete);
                }
            };
            
            checkComplete();
        });
    }
    
    /**
     * Set camera position based on scroll percentage (0-100)
     * This is the KEY function for proportional scrolling
     */
    setPositionFromScroll(scrollPercent) {
        // Clamp scroll between 0-100
        scrollPercent = Math.max(0, Math.min(100, scrollPercent));
        
        // Map scroll percentage to path index
        const totalPositions = this.path.length;
        const exactIndex = (scrollPercent / 100) * (totalPositions - 1);
        
        // Get the two positions to interpolate between
        const index1 = Math.floor(exactIndex);
        const index2 = Math.min(index1 + 1, totalPositions - 1);
        const t = exactIndex - index1; // Interpolation factor (0-1)
        
        const pos1Key = this.path[index1];
        const pos2Key = this.path[index2];
        
        const pos1 = this.positions[pos1Key];
        const pos2 = this.positions[pos2Key];
        
        // Interpolate position
        this.targetPosition.lerpVectors(pos1.position, pos2.position, t);
        
        // Interpolate look-at target
        this.targetLookAt.lerpVectors(pos1.target, pos2.target, t);
        
        // Update current position key for UI
        this.currentPositionKey = t < 0.5 ? pos1Key : pos2Key;
        
        // Smooth lerp to target
        this.camera.position.lerp(this.targetPosition, this.lerpAlpha);
        this.currentLookAt.lerp(this.targetLookAt, this.lerpAlpha);
        this.camera.lookAt(this.currentLookAt);
    }
    
    /**
     * Get current position index in path
     */
    getCurrentIndex() {
        return this.path.indexOf(this.currentPositionKey);
    }
    
    /**
     * Get scroll percentage for current position
     */
    getScrollPercentForPosition(positionKey) {
        const index = this.path.indexOf(positionKey);
        if (index === -1) return 0;
        
        const percent = (index / (this.path.length - 1)) * 100;
        return percent;
    }
    
    /**
     * Navigate to a specific screen (for UI navigation)
     * @param {string} screenId - e.g., 'screen1', 'screen2', etc.
     */
    async navigateToScreen(screenId) {
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
        
        await this.animateToPosition(positionKey, 1.5);
    }
    
    /**
     * Update camera (called every frame)
     */
    update() {
        // Handle programmatic animations
        if (this.isAnimating) {
            const elapsed = performance.now() - this.animationStartTime;
            this.animationProgress = Math.min(elapsed / this.animationDuration, 1);
            
            // Easing function (ease-in-out cubic)
            const eased = this.animationProgress < 0.5
                ? 4 * this.animationProgress * this.animationProgress * this.animationProgress
                : 1 - Math.pow(-2 * this.animationProgress + 2, 3) / 2;
            
            // Interpolate position
            this.camera.position.lerpVectors(
                this.animationStartPos,
                this.animationTargetPos,
                eased
            );
            
            // Interpolate look-at
            this.currentLookAt.lerpVectors(
                this.animationStartLookAt,
                this.animationTargetLookAt,
                eased
            );
            
            this.camera.lookAt(this.currentLookAt);
            
            // Check if animation complete
            if (this.animationProgress >= 1) {
                this.isAnimating = false;
                this.camera.position.copy(this.animationTargetPos);
                this.currentLookAt.copy(this.animationTargetLookAt);
                this.camera.lookAt(this.currentLookAt);
            }
        }
    }
    
    /**
     * Get current screen ID from position
     */
    getCurrentScreen() {
        const posKey = this.currentPositionKey;
        
        if (posKey.startsWith('screen1')) return 'screen1';
        if (posKey.startsWith('screen2')) return 'screen2';
        if (posKey.startsWith('screen3')) return 'screen3';
        if (posKey.startsWith('screen4')) return 'screen4';
        if (posKey === 'outro') return 'outro';
        
        return null;
    }
    
    /**
     * Get info for debug display
     */
    getDebugInfo() {
        return {
            currentPosition: this.currentPositionKey,
            currentScreen: this.getCurrentScreen(),
            pathIndex: this.getCurrentIndex(),
            isAnimating: this.isAnimating,
            cameraPos: this.camera.position.toArray().map(n => n.toFixed(2)),
            lookAt: this.currentLookAt.toArray().map(n => n.toFixed(2))
        };
    }
}