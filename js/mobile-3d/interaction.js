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
        
        // Touch/pointer state
        this.touchStartPos = new THREE.Vector2();
        this.touchStartTime = 0;
        this.isTap = false;
        this.tapThreshold = 22;  // pixels — generous for finger taps
        this.tapTimeThreshold = 600; // ms  — comfortable tap window
        
        // Setup interactions
        this.setupTouchListeners();
        
        console.log('✅ Mobile-3D Interaction initialized');
    }
    
    /**
     * Setup pointer event listeners (immune to scroll controller's preventDefault)
     * Using pointer events instead of touch events avoids conflicts with the
     * scroll controller which calls preventDefault() on window touchstart.
     */
    setupTouchListeners() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            this.touchStartPos.set(e.clientX, e.clientY);
            this.touchStartTime = performance.now();
            this.isTap = true;
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!this.isTap) return;
            const currentPos = new THREE.Vector2(e.clientX, e.clientY);
            if (currentPos.distanceTo(this.touchStartPos) > this.tapThreshold) {
                this.isTap = false;
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            if (!this.isTap) return;
            const duration = performance.now() - this.touchStartTime;
            if (duration < this.tapTimeThreshold) {
                this.processTap(e.clientX, e.clientY);
            }
            this.isTap = false;
        });

        canvas.addEventListener('pointercancel', () => {
            this.isTap = false;
        });

        console.log('✅ Pointer listeners attached (replaces touch listeners)');
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
            const hit = intersects[0];
            console.log(`👆 Tapped screen: ${hit.object.name}`);

            // Pass UV coordinates so we can detect left/right on the screen
            this.handleScreenTap(hit.object, hit.uv);
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
    handleScreenTap(screenMesh, uv) {
        // Visual feedback - pulse effect
        this.pulseScreen(screenMesh);

        const screenName = screenMesh.name;

        // ── Screen 002 = Our Team (screen03.jpeg) ──────────────────────
        if (screenName === 'Screen002') {
            // Only show popup when the camera is on the team screen
            const currentScreen = window.mobile3DApp?.cameraController?.getCurrentScreen();
            if (currentScreen !== 'screen3') {
                console.log('🚫 Team popup blocked – camera not at screen3');
                return;
            }

            // Use UV.x to distinguish left (CEO) vs right (COO)
            // UV.x < 0.5  → left half of screen → CEO
            // UV.x >= 0.5 → right half of screen → COO
            let role, personName, linkedinUrl;

            const uvX = uv ? uv.x : 0.5; // fallback to centre if UV unavailable

            if (uvX < 0.5) {
                role        = 'CEO';
                personName  = 'Amogh Ingale';
                linkedinUrl = '#';
            } else {
                role        = 'COO';
                personName  = 'Deepti Goswami';
                linkedinUrl = '#';
            }

            console.log(`📱 Team screen tapped – UV.x=${uvX.toFixed(2)} → ${role}`);

            if (window.mobileTeamPopup) {
                window.mobileTeamPopup.show(role, personName, linkedinUrl);
            }
            return;
        }

        // ── Other screens (no interaction yet) ────────────────────────
        const screenLabels = {
            'Screen001': 'Events',
            'Screen003': 'Giveaways',
            'Screen004': 'About Us'
        };
        console.log(`📱 ${screenLabels[screenName] || screenName} tapped`);
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