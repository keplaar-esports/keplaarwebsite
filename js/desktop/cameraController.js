class CameraController {
    constructor(renderer) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // ❌ REMOVED: OrbitControls - no longer needed with defined camera paths
        // this.controls = new THREE.OrbitControls(this.camera, renderer.domElement);
        
        this.cameraPositions = {
            intro: { position: new THREE.Vector3(4, 6, 7), target: new THREE.Vector3(0, 0, 0) },
            screen1: { position: new THREE.Vector3(0, 2.5, -1), target: new THREE.Vector3(0, 2.7, -7) },
            screen2: { position: new THREE.Vector3(2, 2.5, 1.7), target: new THREE.Vector3(8, 3, 1.7) },
            screen3: { position: new THREE.Vector3(0, 2.5, 4.5), target: new THREE.Vector3(0, 2.7, 7) },
            screen4: { position: new THREE.Vector3(-2, 2.5, 1.7), target: new THREE.Vector3(-8, 3, 1.7) },
            outro: { position: new THREE.Vector3(4, 6, 7), target: new THREE.Vector3(0, 0, 0) }
        };
        
        this.currentCameraPosition = 'intro';
        this.cameraPath = ['intro', 'screen1', 'screen2', 'screen3', 'screen4', 'outro'];
        
        // Track where camera should look at (for manual lookAt control)
        this.currentTarget = new THREE.Vector3(0, 0, 0);
    }

    setInitialPosition() {
        this.camera.position.copy(this.cameraPositions.intro.position);
        this.currentTarget.copy(this.cameraPositions.intro.target);
        this.camera.lookAt(this.currentTarget);
    }

    animateCameraToPosition(targetPosition, targetLookAt, duration = 2) {
        return new Promise(resolve => {
            const startPos = this.camera.position.clone();
            const startTarget = this.currentTarget.clone();
            const startTime = performance.now();

            const update = () => {
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / (duration * 1000), 1);
                const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

                this.camera.position.lerpVectors(startPos, targetPosition, eased);
                this.currentTarget.lerpVectors(startTarget, targetLookAt, eased);
                this.camera.lookAt(this.currentTarget);

                if (t < 1) requestAnimationFrame(update);
                else resolve();
            };
            update();
        });
    }

    // ✅ NEW: Manual update method (replaces controls.update())
    update() {
        this.camera.lookAt(this.currentTarget);
    }

    goToNextScreen() {
        if (!window.app?.sceneManager?.isModelLoaded) {
            console.log('Model not loaded yet, please wait...');
            return;
        }

        const currentIndex = this.cameraPath.indexOf(this.currentCameraPosition);
        
        // ✅ NEW: Handle looping from outro → screen1
        if (this.currentCameraPosition === 'outro') {
            // Go to screen1 (loop back)
            const targetPos = this.cameraPositions.screen1;
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = 'screen1';
                this.notifyCameraMoved('screen1');
                this.showNavigationAtDestination();
            });
            return;
        }
        
        if (currentIndex < this.cameraPath.length - 1) {
            const nextPositionKey = this.cameraPath[currentIndex + 1];
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            // SPECIAL CASE: Screen4 → Outro (show social media UI)
            if (this.currentCameraPosition === 'screen4' && nextPositionKey === 'outro') {
                const targetPos = this.cameraPositions.outro;
                this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                    this.currentCameraPosition = 'outro';
                    this.notifyCameraMoved('outro');
                    
                    // Show social media UI - hide navigation
                    if (window.app.uiManager) {
                        window.app.uiManager.showSocialMediaUI();
                    }
                });
            } else {
                // Normal animation for other transitions
                const targetPos = this.cameraPositions[nextPositionKey];
                this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                    this.currentCameraPosition = nextPositionKey;
                    this.notifyCameraMoved(nextPositionKey);
                    this.showNavigationAtDestination();
                });
            }
        }
    }

    goToPreviousScreen() {
        if (!window.app?.sceneManager?.isModelLoaded) {
            console.log('Model not loaded yet, please wait...');
            return;
        }

        const currentIndex = this.cameraPath.indexOf(this.currentCameraPosition);
        
        // ✅ NEW: Handle backwards loop from intro → screen4
        if (this.currentCameraPosition === 'intro') {
            const targetPos = this.cameraPositions.screen4;
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = 'screen4';
                this.notifyCameraMoved('screen4');
                this.showNavigationAtDestination();
            });
            return;
        }
        
        // ✅ Handle outro → screen4 loop
        if (this.currentCameraPosition === 'outro') {
            const targetPos = this.cameraPositions.screen4;
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = 'screen4';
                this.notifyCameraMoved('screen4');
                this.showNavigationAtDestination();
            });
        } else if (currentIndex > 0) {
            // Normal previous navigation
            const prevPosition = this.cameraPath[currentIndex - 1];
            const targetPos = this.cameraPositions[prevPosition];
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = prevPosition;
                this.notifyCameraMoved(prevPosition);
                this.showNavigationAtDestination();
            });
        }
    }

    notifyCameraMoved(positionKey) {
        window.dispatchEvent(new CustomEvent('camera-position-changed', {
            detail: {
                position: positionKey,
                screenId: this.mapCameraToScreen(positionKey)
            }
        }));
        
        console.log(`📍 Camera moved to: ${positionKey}`);
    }

    mapCameraToScreen(cameraPosition) {
        const cameraToScreenMap = {
            'screen1': 'events',
            'screen2': 'about', 
            'screen3': 'team',
            'screen4': 'giveaways',
            'outro': 'join',
            'intro': null
        };
        
        return cameraToScreenMap[cameraPosition] || null;
    }

    showNavigationAtDestination() {
        if (window.app.uiManager) {
            setTimeout(() => {
                window.app.uiManager.showNavigation();
                window.app.uiManager.updateNavigationButtons();
            }, 100);
        }
    }

    getCurrentCameraPosition() {
        return this.currentCameraPosition;
    }

    showNavigation() {
        document.getElementById('navigation-ui').style.display = 'block';
    }
}
