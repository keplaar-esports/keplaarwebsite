// ============================================
// MOBILE-3D INTERACTION - Touch Events
// ============================================

class Mobile3DInteraction {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.touchPosition = new THREE.Vector2();
        
        // Touch state
        this.touchStartPos = new THREE.Vector2();
        this.touchStartTime = 0;
        this.isTap = false;
        this.tapThreshold = 10; // pixels
        this.tapTimeThreshold = 300; // ms
        
        // Setup interactions
        this.setupTouchListeners();
        
        console.log('✅ Mobile-3D Interaction initialized');
    }
    
    /**
     * Setup touch event listeners
     */
    setupTouchListeners() {
        const canvas = this.renderer.domElement;
        
        // Touch start
        canvas.addEventListener('touchstart', (e) => {
            this.onTouchStart(e);
        }, { passive: true });
        
        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            this.onTouchMove(e);
        }, { passive: true });
        
        // Touch end (tap detection)
        canvas.addEventListener('touchend', (e) => {
            this.onTouchEnd(e);
        }, { passive: true });
        
        console.log('✅ Touch listeners attached');
    }
    
    /**
     * Handle touch start
     */
    onTouchStart(e) {
        if (e.touches.length !== 1) return; // Only handle single touch
        
        const touch = e.touches[0];
        this.touchStartPos.set(touch.clientX, touch.clientY);
        this.touchStartTime = performance.now();
        this.isTap = true;
    }
    
    /**
     * Handle touch move - detect if it's a drag (not a tap)
     */
    onTouchMove(e) {
        if (!this.isTap) return;
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const currentPos = new THREE.Vector2(touch.clientX, touch.clientY);
        const distance = currentPos.distanceTo(this.touchStartPos);
        
        // If moved more than threshold, it's not a tap
        if (distance > this.tapThreshold) {
            this.isTap = false;
        }
    }
    
    /**
     * Handle touch end - process tap if valid
     */
    onTouchEnd(e) {
        if (!this.isTap) return;
        
        const touchDuration = performance.now() - this.touchStartTime;
        
        // Check if it's a valid tap (quick and didn't move much)
        if (touchDuration < this.tapTimeThreshold) {
            // Get the touch position for raycasting
            const touch = e.changedTouches[0];
            this.processTap(touch.clientX, touch.clientY);
        }
        
        this.isTap = false;
    }
    
    /**
     * Process tap at specific coordinates
     */
    processTap(clientX, clientY) {
        // Convert to normalized device coordinates
        this.touchPosition.x = (clientX / window.innerWidth) * 2 - 1;
        this.touchPosition.y = -(clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find intersections
        this.raycaster.setFromCamera(this.touchPosition, this.camera);
        
        // Get all screen meshes
        const screenMeshes = this.getScreenMeshes();
        
        if (screenMeshes.length === 0) return;
        
        // Check intersections
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            console.log(`👆 Tapped screen: ${hitObject.name}`);
            
            // Handle the tap
            this.handleScreenTap(hitObject);
        }
    }
    
    /**
     * Get all screen meshes from the scene
     */
    getScreenMeshes() {
        const screens = [];
        
        if (!window.mobile3DApp?.sceneManager?.model) {
            return screens;
        }
        
        window.mobile3DApp.sceneManager.model.traverse(child => {
            if (child.isMesh && child.userData.isScreen) {
                screens.push(child);
            }
        });
        
        return screens;
    }
    
    /**
     * Handle screen tap
     */
    handleScreenTap(screenMesh) {
        // Visual feedback - pulse effect
        this.pulseScreen(screenMesh);
        
        // You can add more interactions here
        // For example, showing details about the tapped screen
        
        // Get screen name
        const screenName = screenMesh.name;
        
        // Map screen names to actions
        const screenActions = {
            'Screen001': () => {
                console.log('📱 Screen 1 tapped - About section');
                // Could show a modal with more info
            },
            'Screen002': () => {
                console.log('📱 Screen 2 tapped - Team section');
                // Could show team details
            },
            'Screen003': () => {
                console.log('📱 Screen 3 tapped - Events section');
                // Could show event details
            },
            'Screen004': () => {
                console.log('📱 Screen 4 tapped - Giveaways section');
                // Could show giveaway info
            }
        };
        
        // Execute action if exists
        if (screenActions[screenName]) {
            screenActions[screenName]();
        }
    }
    
    /**
     * Pulse animation for tapped screen
     */
    pulseScreen(screenMesh) {
        if (!screenMesh.userData.originalScale) {
            screenMesh.userData.originalScale = screenMesh.scale.clone();
        }
        
        const originalScale = screenMesh.userData.originalScale;
        
        // Animate scale up
        const scaleUp = () => {
            screenMesh.scale.x = originalScale.x * 1.05;
            screenMesh.scale.y = originalScale.y * 1.05;
            screenMesh.scale.z = originalScale.z * 1.05;
        };
        
        // Animate scale back
        const scaleDown = () => {
            screenMesh.scale.copy(originalScale);
        };
        
        // Quick pulse
        scaleUp();
        setTimeout(scaleDown, 150);
    }
    
    /**
     * Setup interactions (called after model is loaded)
     */
    setupInteractions() {
        console.log('🔄 Setting up screen interactions...');
        
        setTimeout(() => {
            const screens = this.getScreenMeshes();
            console.log(`✅ Found ${screens.length} interactive screens`);
        }, 1000);
    }
}