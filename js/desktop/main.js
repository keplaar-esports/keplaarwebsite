// ============================================
// MAIN.JS - Enhanced with scene animations
// ============================================

console.log('🚀 Starting Keplaar Esports experience...');

(async function initDesktop() {
    console.log('🎯 Desktop main.js executing NOW...');
    
    // 👇 PREPARE INTRO UI EARLY & MAKE IT VISIBLE UNDER LOADING SCREEN
    const uiContainer = document.getElementById('ui-container');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (uiContainer) {
        uiContainer.style.display = 'block';
        uiContainer.style.opacity = '1';
        uiContainer.style.zIndex = '1';
        console.log('✅ Intro UI prepared (behind loading screen)');
    }
    
    if (loadingScreen) {
        loadingScreen.style.zIndex = '9999';
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
    renderer.toneMappingExposure = 2.2; // Slightly brighter
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1s ease';
    
    console.log('✅ Enhanced renderer created');
    loadingManager.updateProgress(20, '3D engine ready');
    
    const sceneManager = new SceneManager();
    const scene = sceneManager.scene;
    
    const cameraController = new CameraController(renderer);
    const camera = cameraController.camera;
    
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
        cameraController: cameraController,
        sceneManager: sceneManager,
        interactionManager: interactionManager,
        uiManager: window.uiManager,
        renderer: renderer
    };
    
    console.log('✅ App object created');
    
    // ========== ENHANCED ANIMATION LOOP ==========
    let startTime = Date.now();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const currentTime = Date.now() - startTime;
        
        // Animate scene elements (particles, lights, orbs)
        sceneManager.animateScene(currentTime);
        
        // Subtle camera float effect - reduced for screen3
        const currentPos = cameraController.getCurrentCameraPosition();
        const floatMultiplier = currentPos === 'screen3' ? 0.3 : 1.0; // 70% less float on screen3
        camera.position.y += Math.sin(currentTime * 0.0002) * 0.001 * floatMultiplier;
        
        cameraController.update();
        renderer.render(scene, camera);
    }
    animate();
    console.log('✅ Enhanced animation loop started with scene animations');
    
    setTimeout(() => {
        loadingManager.updateProgress(100, 'Ready!');
    }, 500);
    
    // ========== PERFECT TRANSITION ==========
    setTimeout(() => {
        console.log('🎬 Starting enhanced transition...');
        
        // 1. Show 3D canvas with particles
        renderer.domElement.style.opacity = '0.3';
        
        // 2. Start video
        if (video && videoReady) {
            video.play().catch(e => console.log('Video autoplay blocked'));
        }
        
        // 3. Set video background opacity (more visible)
        const videoBackground = document.getElementById('video-background');
        if (videoBackground) {
            videoBackground.style.opacity = '0.45'; // Increased from 0.35 to 0.45
        }
        
        // 4. Fade out loading screen
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.8s ease';
            loadingScreen.style.opacity = '0';
            
            console.log('✅ Enhanced fade transition started');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 800);
        }
        
        // 5. Gradually increase canvas opacity
        setTimeout(() => {
            renderer.domElement.style.opacity = '1';
            if (videoBackground) {
                videoBackground.style.transition = 'opacity 1.5s ease';
                videoBackground.style.opacity = '0.5'; // Increased from 0.3 to 0.4
            }
        }, 400);
        
        console.log('✨ Enhanced desktop environment ready!');
        
    }, 800);
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        sceneManager.dispose();
    });
    
    console.log('✅ Desktop initialization complete with enhanced visuals!');
    
})();
