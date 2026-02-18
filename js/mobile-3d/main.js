// ============================================
// MOBILE-3D MAIN.JS - Entry Point
// ============================================

console.log('📱 Mobile-3D main.js loaded');

(async function initMobile3D() {
    console.log('🎯 Initializing mobile-3D experience...');
    
    const loadingManager = window.loadingManager;
    if (!loadingManager) {
        console.error('❌ Loading manager not found');
        return;
    }
    
    try {
        // Wait a moment for template to be in DOM
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ========== PHASE 0: INITIALIZE OPTIMIZATION MANAGERS ==========
        const qualityManager = new QualityManager();
        const memoryManager = new MemoryManager();
        
        console.log(`🎮 Quality Tier: ${qualityManager.performanceTier}`);
        console.log(`📊 Memory Budget: ${qualityManager.getMemoryBudget()}MB`);
        
        // ========== PHASE 1: SETUP RENDERER ==========
        loadingManager.updateProgress(10, 'Setting up renderer...');
        
        const settings = qualityManager.settings;
        const renderer = new THREE.WebGLRenderer({
            antialias: settings.antialias,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false // Don't fail on low-end devices
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Apply quality-specific renderer settings
        qualityManager.configureRenderer(renderer);
        
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2.0;
        renderer.physicallyCorrectLights = true;
        
        // Insert canvas as first child of body
        if (document.body.firstChild) {
            document.body.insertBefore(renderer.domElement, document.body.firstChild);
        } else {
            document.body.appendChild(renderer.domElement);
        }
        
        // Start with canvas slightly visible
        renderer.domElement.style.opacity = '0.3';
        renderer.domElement.style.transition = 'opacity 1s ease';
        
        // Setup WebGL context recovery
        const contextManager = new WebGLContextManager(
            renderer.domElement,
            () => {
                console.error('❌ Context lost - pausing app');
                // Disable scroll and interactions
                if (window.mobile3DApp?.scrollController) {
                    window.mobile3DApp.scrollController.disableScroll();
                }
            },
            () => {
                console.log('✅ Context restored - reloading app');
                // Reload page to reinitialize
                window.location.reload();
            }
        );
        
        console.log('✅ Renderer created with context recovery');
        loadingManager.updateProgress(20, 'Renderer ready');
        
        // ========== PHASE 2: CREATE SCENE ==========
        loadingManager.updateProgress(30, 'Creating scene...');
        
        const sceneManager = new Mobile3DSceneManager();
        const scene = sceneManager.scene;
        
        console.log('✅ Scene created');
        
        // ========== PHASE 3: LOAD ENVIRONMENT ==========
        loadingManager.updateProgress(40, 'Loading environment...');
        
        await sceneManager.loadEnvironment(renderer);
        
        console.log('✅ Environment loaded');
        loadingManager.updateProgress(70, 'Environment ready');
        
        // ========== PHASE 4: INITIALIZE CONTROLLERS ==========
        loadingManager.updateProgress(85, 'Initializing controllers...');
        
        // Create camera controller with proportional scroll
        const cameraController = new Mobile3DCameraController(renderer);
        const camera = cameraController.camera;
        
        // Create scroll controller
        const scrollController = new Mobile3DScrollController(cameraController);
        
        // Create mobile UI controller
        const mobileUI = new Mobile3DUI();
        
        // Create interaction manager (touch events)
        const interactionManager = new Mobile3DInteraction(scene, camera, renderer);
        
        console.log('✅ Controllers initialized');
        loadingManager.updateProgress(90, 'Controllers ready');
        
        // ========== PHASE 6: FINALIZE ==========
        loadingManager.updateProgress(95, 'Finalizing...');
        
        // Create performance monitor
        const performanceMonitor = new PerformanceMonitor(qualityManager, memoryManager);
        
        // Enable FPS counter if debug mode
        if (window.location.search.includes('debug=true')) {
            performanceMonitor.enableFPSCounter();
        }
        
        window.mobile3DApp = {
            renderer: renderer,
            scene: scene,
            camera: camera,
            sceneManager: sceneManager,
            cameraController: cameraController,
            scrollController: scrollController,
            mobileUI: mobileUI,
            interactionManager: interactionManager,
            // Optimization managers
            qualityManager: qualityManager,
            memoryManager: memoryManager,
            contextManager: contextManager,
            performanceMonitor: performanceMonitor
        };
        
        console.log('✅ Global app object created');
        
        // Start animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Update camera controller
            cameraController.update();
            
            // Render scene
            renderer.render(scene, camera);
        }
        
        animate();
        console.log('✅ Animation loop started');
        
        // Complete loading ONCE
        setTimeout(() => {
            loadingManager.updateProgress(100, 'Ready!');
        }, 300);
        
        // Wait a moment then show intro
        setTimeout(() => {
            // Fade out loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.transition = 'opacity 0.6s ease';
                loadingScreen.style.opacity = '0';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 600);
            }
            
            // Intro appears solid, canvas hidden
            renderer.domElement.style.opacity = '0';
            renderer.domElement.style.transition = 'none';
            
            const introOverlay = document.querySelector('.mobile-intro-overlay');
            if (introOverlay) {
                // Start solid, matching loading screen
                introOverlay.style.background = 'rgba(10, 10, 20, 0.95)';
                introOverlay.style.transition = 'none';
            }
            
            // After loading screen fully fades, start revealing environment (1.5s)
            setTimeout(() => {
                console.log('🎬 Revealing environment...');
                
                if (introOverlay) {
                    // Fade to semi-transparent (1.5s)
                    introOverlay.style.transition = 'background 1.5s ease';
                    introOverlay.style.background = 'rgba(10, 10, 20, 0.7)';
                }
                
                // Fade in canvas (1.5s)
                renderer.domElement.style.transition = 'opacity 1.5s ease';
                renderer.domElement.style.opacity = '0.5';
                
                console.log('✅ Environment reveal complete');
            }, 800); // Start after loading screen is gone
            
            // Setup enter button
            setupEnterButton();
            
            console.log('✅ Mobile-3D ready - waiting for user to enter');
        }, 500);
        
        // ========== WINDOW RESIZE ==========
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // ========== CLEANUP ==========
        window.addEventListener('beforeunload', () => {
            console.log('🧹 Cleaning up before unload...');
            
            // Dispose scene manager
            if (sceneManager) {
                sceneManager.dispose();
            }
            
            // Dispose renderer
            if (renderer) {
                renderer.dispose();
            }
            
            // Reset memory manager
            if (memoryManager) {
                memoryManager.reset();
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize mobile-3D:', error);
        loadingManager.showError('Failed to load 3D experience. Please refresh.');
    }
})();

/**
 * Setup enter button to transition from intro to 3D experience
 */
function setupEnterButton() {
    const enterButton = document.getElementById('mobile-enter-button');
    const introUI = document.getElementById('mobile-intro-ui');
    const mobileHeader = document.getElementById('mobile-header');
    
    if (!enterButton || !introUI) {
        console.error('❌ Enter button or intro UI not found');
        return;
    }
    
    enterButton.addEventListener('click', async () => {
        console.log('🚪 Entering mobile-3D experience...');
        
        // Disable button immediately
        enterButton.disabled = true;
        enterButton.style.transition = 'opacity 0.3s ease';
        enterButton.style.opacity = '0.5';
        enterButton.style.pointerEvents = 'none';
        
        // Get references
        const app = window.mobile3DApp;
        if (!app) {
            console.error('❌ App not initialized');
            return;
        }
        
        // Smooth fade out intro UI (longer duration)
        introUI.style.transition = 'opacity 1.5s ease';
        introUI.style.opacity = '0';
        
        // Make canvas fully visible smoothly (longer duration)
        app.renderer.domElement.style.transition = 'opacity 1.5s ease';
        app.renderer.domElement.style.opacity = '1';
        
        // Wait for fade (give it time to complete)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Hide intro UI completely
        introUI.style.display = 'none';
        introUI.classList.add('hidden');
        
        // Show mobile header smoothly
        if (mobileHeader) {
            mobileHeader.style.display = 'block';
            mobileHeader.style.opacity = '0';
            mobileHeader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                mobileHeader.style.opacity = '1';
            }, 50);
        }
        
        // Move camera from intro to first screen
        await app.cameraController.animateToPosition('screen1-left', 2);
        
        // Set scroll to match this position
        const scrollPercent = app.cameraController.getScrollPercentForPosition('screen1-left');
        app.scrollController.setScroll(scrollPercent, true); // true = immediate
        
        // Enable scrolling
        app.scrollController.enableScroll();

        // Show navigation arrows
        if (app.mobileUI) {
            app.mobileUI.showNavArrows();
        }

        // Show scroll hint
        showScrollHint();
        
        console.log('✅ Entered mobile-3D experience');
    });
}

/**
 * Show scroll hint for a few seconds
 */
function showScrollHint() {
    const hint = document.createElement('div');
    hint.className = 'scroll-hint';
    hint.innerHTML = `
        <div class="scroll-hint-icon"></div>
        <span>Scroll to explore</span>
    `;
    document.body.appendChild(hint);
    
    // Hide after 3 seconds
    setTimeout(() => {
        hint.classList.add('hidden');
        setTimeout(() => hint.remove(), 500);
    }, 3000);
}

// Debug helpers
if (window.location.search.includes('debug=true')) {
    console.log('🐛 Debug mode enabled');
    
    // Expose app globally for console debugging
    window.addEventListener('load', () => {
        console.log('🎮 Debug commands available:');
        console.log('  mobile3DApp - Access app object');
        console.log('  mobile3DApp.performanceMonitor.getReport() - Performance stats');
        console.log('  mobile3DApp.memoryManager.getMemoryReport() - Memory usage');
        console.log('  mobile3DApp.contextManager.getStats() - WebGL context status');
        console.log('  mobile3DApp.contextManager.forceContextLoss() - Test context loss');
    });
}