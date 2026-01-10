// ============================================
// MAIN.JS - Perfect transition with no gap
// ============================================

console.log('🚀 Starting Keplaar Esports experience...');

(async function initDesktop() {
    console.log('🎯 Desktop main.js executing NOW...');
    
    // 👇 PREPARE INTRO UI EARLY & MAKE IT VISIBLE UNDER LOADING SCREEN
    const uiContainer = document.getElementById('ui-container');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (uiContainer) {
        uiContainer.style.display = 'block';
        uiContainer.style.opacity = '1'; // Already visible underneath
        uiContainer.style.zIndex = '1'; // Behind loading screen
        console.log('✅ Intro UI prepared (behind loading screen)');
    }
    
    if (loadingScreen) {
        loadingScreen.style.zIndex = '9999'; // On top
    }
    
    const loadingManager = window.loadingManager;
    if (!loadingManager) {
        console.error('❌ Loading manager not found');
        return;
    }
    
    // ========== PHASE 1: SETUP ==========
    loadingManager.updateProgress(10, 'Initializing...');
    
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);
    
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1s ease';
    
    console.log('✅ Renderer created (bright settings)');
    loadingManager.updateProgress(20, '3D engine ready');
    
    const sceneManager = new SceneManager();
    const scene = sceneManager.scene;
    
    const cameraController = new CameraController(renderer);
    const camera = cameraController.camera;
    const controls = cameraController.controls;
    
    cameraController.setInitialPosition();
    console.log('✅ Camera positioned');
    
    const interactionManager = new InteractionManager(scene, camera, renderer);
    
    loadingManager.updateProgress(30, 'Scene ready');
    
    // ========== PHASE 2: PRELOAD VIDEO ==========
    loadingManager.updateProgress(40, 'Preparing video...');
    
    const video = document.getElementById('bg-video');
    let videoReady = false;
    
    if (video) {
        video.preload = 'auto';
        
        await new Promise((resolve) => {
            if (video.readyState >= 3) {
                videoReady = true;
                resolve();
                return;
            }
            
            video.addEventListener('canplay', () => {
                videoReady = true;
                resolve();
            }, { once: true });
            
            video.addEventListener('error', () => {
                console.warn('Video load error');
                resolve();
            }, { once: true });
            
            video.load();
            setTimeout(resolve, 1500);
        });
    }
    
    loadingManager.updateProgress(50, 'Video ready');
    
    // ========== PHASE 3: LOAD ENVIRONMENT ==========
    loadingManager.updateProgress(60, 'Loading environment...');
    
    try {
        await sceneManager.loadEnvironment(renderer);
        console.log('✅ Environment loaded');
        loadingManager.updateProgress(80, 'Environment loaded');
        
        setTimeout(() => {
            interactionManager.setupInteractions();
            loadingManager.updateProgress(90, 'Interactions ready');
        }, 500);
        
    } catch (error) {
        console.error('❌ Environment load failed:', error);
        loadingManager.showError('Environment failed to load');
        return;
    }
    
    // ========== PHASE 4: FINALIZE ==========
    loadingManager.updateProgress(95, 'Finalizing...');
    
    window.app = {
        camera: camera,
        controls: controls,
        cameraController: cameraController,
        sceneManager: sceneManager,
        interactionManager: interactionManager,
        uiManager: window.uiManager,
        renderer: renderer
    };
    
    console.log('✅ App object created');
    
    // Start animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    console.log('✅ Animation loop started');
    
    setTimeout(() => {
        loadingManager.updateProgress(100, 'Ready!');
    }, 500);
    
    // ========== PERFECT TRANSITION: Just fade out loading screen ==========
    setTimeout(() => {
        console.log('🎬 Starting perfect transition...');
        
        // 1. Show 3D canvas slightly
        renderer.domElement.style.opacity = '0.2';
        
        // 2. Start video
        if (video && videoReady) {
            video.play().catch(e => console.log('Video autoplay blocked'));
        }
        
        // 3. Set video background opacity
        const videoBackground = document.getElementById('video-background');
        if (videoBackground) {
            videoBackground.style.opacity = '0.4';
        }
        
        // 👇 4. JUST FADE OUT LOADING SCREEN (intro already visible underneath)
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.6s ease';
            loadingScreen.style.opacity = '0';
            
            console.log('✅ Perfect fade: loading screen disappearing');
            
            // Remove loading screen after fade
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600);
        }
        
        // 5. Continue fading video to more transparent
        setTimeout(() => {
            if (videoBackground) {
                videoBackground.style.transition = 'opacity 1s ease';
                videoBackground.style.opacity = '0.3';
            }
        }, 300);
        
        console.log('✅ Desktop ready - waiting for user to enter');
        
    }, 800); // Start transition a bit earlier
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (sceneManager.pmremGenerator) {
            sceneManager.pmremGenerator.dispose();
        }
    });
    
    console.log('✅ Desktop initialization complete!');
    
})();