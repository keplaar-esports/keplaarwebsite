class InteractionManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.hoveredSection = null;
        this.scrollEnabled = true; // 👈 Track if scroll is enabled
        
        this.setupEventListeners();
    
        this.screenSections = {
            "Screen004": [
                { 
                    name: "event1", 
                    bounds: { x: 0.37, y: -0.72, width: 0.5, height: 1.2 },
                    hoverText: "Event 1 - Coming Soon",
                    isEvent: true
                },
                { 
                    name: "event2", 
                    bounds: { x: -0.3, y: -0.72, width: 0.5, height: 1.2 },
                    hoverText: "Event 2 - Coming Soon", 
                    isEvent: true
                },
                { 
                    name: "event3", 
                    bounds: { x: -0.93, y: -0.72, width: 0.5, height: 1.2 },
                    hoverText: "Event 3 - Coming Soon",
                    isEvent: true
                }
            ],

            "Screen001": [],

            "Screen002": [
                { 
                    name: "ceo", 
                    bounds: { x: 0.585, y: -0.8, width: 0.325, height: 1.12 },
                    hoverText: "CEO - Amogh Ingale",
                    linkedinUrl: "https://linkedin.com/in/johnsmith", 
                    role: "CEO",
                    personName: "Amogh Ingale"
                },
                { 
                    name: "cfo", 
                    bounds: { x: 0.2, y: -0.8, width: 0.325, height: 1.12 },
                    hoverText: "CFO - Min Zhao",
                    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
                    role: "CFO", 
                    personName: "Min Zhao"
                },
                { 
                    name: "cto", 
                    bounds: { x: -0.19, y: -0.8, width: 0.325, height: 1.12 },
                    hoverText: "CTO - Jason Lee",
                    linkedinUrl: "https://linkedin.com/in/mikechen",
                    role: "CTO",
                    personName: "Jason Lee"
                },
                { 
                    name: "cpo", 
                    bounds:   { x: -0.585, y: -0.8, width: 0.325, height: 1.12 },
                    hoverText: "CPO - Andy Chen",
                    linkedinUrl: "https://linkedin.com/in/alexwilson",
                    role: "CPO",
                    personName: "Andy Chen"
                },
                { 
                    name: "coo", 
                    bounds:  { x: -0.96, y: -0.8, width: 0.325, height: 1.12 },
                    hoverText: "COO - Ahmed Abdi",
                    linkedinUrl: "https://linkedin.com/in/emilybrown",
                    role: "COO",
                    personName: "Ahmed Abdi"
                }
            ],

            "Screen003": []
        };
        
        this.setupEventListeners();
        this.setupTooltip();
    }

    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.removeEventListener('click', this.onClick);
        
        this.boundOnMouseMove = this.onMouseMove.bind(this);
        this.boundOnClick = this.onClick.bind(this);
        
        this.renderer.domElement.addEventListener('mousemove', this.boundOnMouseMove);
        console.log('✅ Mousemove listener added');
        
        this.renderer.domElement.addEventListener('click', this.boundOnClick);
        console.log('✅ Click listener added');
        
        // 👇 Scroll listener with modal check
        window.addEventListener('wheel', (event) => {
            this.onScroll(event);
        }, { passive: false });
        
        console.log('✅ All event listeners setup complete');
    }

    setupTooltip() {
        // Tooltip functionality replaced by PopupManager
        // No longer creating the old tooltip element
        console.log('💡 Using new PopupManager instead of tooltip');
    }

    showTooltip(text, x, y) {
        // Old tooltip method - no longer used
        // Kept for backwards compatibility
    }

    hideTooltip() {
        // Old tooltip method - no longer used
        // PopupManager handles hiding
    }

    setupInteractions() {
        console.log('🔄 SETUP INTERACTIONS - START');
        
        setTimeout(() => {
            this.setupScreenInteractions();
        }, 1000);
    }

    setupScreenInteractions() {
        console.log('🔍 SCREEN INTERACTIONS - START SEARCH');
        
        if (!window.app?.sceneManager?.model) {
            console.log('❌ No model available');
            return;
        }

        let screensFound = 0;
        
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh && child.name && child.name.startsWith('Screen')) {
                this.tagScreen(child);
                screensFound++;
            }
        });
        
        console.log(`📊 Screens tagged: ${screensFound}`);
        
        if (screensFound === 0) {
            console.log('🔄 Trying manual screen detection...');
            this.manualScreenDetection();
        }
    }

    findScreensByPattern() {
        let screensFound = 0;
        
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh) {
                if (child.name.includes('Screen') || 
                    child.name.includes('screen') ||
                    (child.material && child.material.name && child.material.name.includes('Screen'))) {
                    
                    child.userData.originalScale = child.scale.clone();
                    child.userData.isScreen = true;
                    screensFound++;
                    
                    console.log(`✅ Found screen by pattern: ${child.name}`);
                }
            }
        });
        
        console.log(`Total screens found by pattern: ${screensFound}`);
    }

    tagScreen(mesh) {
        mesh.userData.originalScale = mesh.scale.clone();
        mesh.userData.isScreen = true;
        console.log(`✅ TAG SCREEN: ${mesh.name}`);
    }

    manualScreenDetection() {
        console.log('🔍 MANUAL SCREEN DETECTION');
        let found = 0;
        
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh) {
                if (child.name && (
                    child.name.includes('Screen') || 
                    child.name.includes('screen') ||
                    (child.material && child.material.map)
                )) {
                    this.tagScreen(child);
                    found++;
                }
            }
        });
        
        console.log(`📊 Manual detection found: ${found} screens`);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        
        this.checkIntersections(event.clientX, event.clientY);
    }

    checkIntersections(mouseX, mouseY) {
        if (!window.app?.sceneManager?.model) {
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const screenMeshes = [];
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh && child.userData.isScreen) {
                screenMeshes.push(child);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const point = intersects[0].point;
            
            const uv = this.worldToUV(point, object);
            const section = this.getSectionAtUV(object.name, uv);
            
            if (section) {
                this.renderer.domElement.style.cursor = 'pointer';
                
                // Use new trigger enter/leave methods
                if (window.popupManager) {
                    window.popupManager.onTriggerEnter(section, mouseX, mouseY);
                }
                
                this.highlightSection(object, section);
                this.hoveredSection = section;
            } else {
                this.renderer.domElement.style.cursor = 'default';
                
                // Notify that we left trigger area
                if (window.popupManager) {
                    window.popupManager.onTriggerLeave();
                }
                
                this.removeHighlight();
                this.hoveredSection = null;
            }
            
            if (this.hoveredObject !== object) {
                if (this.hoveredObject) {
                    this.onHoverExit(this.hoveredObject);
                }
                this.hoveredObject = object;
                this.onHoverEnter(object);
            }
        } else {
            if (this.hoveredObject) {
                this.onHoverExit(this.hoveredObject);
                this.hoveredObject = null;
            }
            
            // Notify that we left trigger area
            if (window.popupManager) {
                window.popupManager.onTriggerLeave();
            }
            
            this.removeHighlight();
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    worldToUV(worldPoint, object) {
        const localPoint = object.worldToLocal(worldPoint.clone());
        
        const uv = {
            u: (localPoint.x + 0.5),
            v: (localPoint.y + 0.5)
        };
        
        return uv;
    }

    getSectionAtUV(screenName, uv) {
        const sections = this.screenSections[screenName];
        if (!sections) return null;
        
        for (const section of sections) {
            if (section.bounds) {
                const bounds = section.bounds;
                const sectionU = (bounds.x + 0.5);
                const sectionV = (bounds.y + 0.5);
                const sectionWidth = bounds.width;
                const sectionHeight = bounds.height;
                
                if (uv.u >= sectionU && 
                    uv.u <= sectionU + sectionWidth &&
                    uv.v >= sectionV && 
                    uv.v <= sectionV + sectionHeight) {
                    return section;
                }
            }
        }
        return null;
    }

    highlightSection(object, section) {
        this.removeHighlight();
        this.hoveredSection = { object, section };
    }

    removeHighlight() {
        if (this.hoveredSection) {
            this.hoveredSection = null;
        }
    }

    onClick(event) {
        console.log('Clicked');

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const screenMeshes = [];
        if (window.app?.sceneManager?.model) {
            window.app.sceneManager.model.traverse(child => {
                if (child.isMesh && child.userData.isScreen) {
                    screenMeshes.push(child);
                }
            });
        }
        
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            console.log(`Hit screen: ${object.name}`);
            
            const point = intersects[0].point;
            const uv = this.worldToUV(point, object);
            const section = this.getSectionAtUV(object.name, uv);
            
            if (section) {
                console.log(`✅ Found section: ${section.name}`);
                this.handleSectionClick(section);
            }
        }
    }

    handleSectionClick(section) {
        // ✅ NEW: Check if we're at the correct camera position before handling click
        const currentCameraPos = window.app?.cameraController?.getCurrentCameraPosition();
        
        // Define which sections belong to which camera positions
        const sectionToCameraMap = {
            'event1': 'screen1',
            'event2': 'screen1',
            'event3': 'screen1',
            'ceo': 'screen3',
            'cfo': 'screen3',
            'cto': 'screen3',
            'cpo': 'screen3',
            'coo': 'screen3'
        };
        
        const requiredPosition = sectionToCameraMap[section.name];
        
        // ✅ Only handle click if we're at the correct camera position
        if (currentCameraPos !== requiredPosition) {
            console.log(`🚫 Click blocked: ${section.name} requires ${requiredPosition}, but camera is at ${currentCameraPos}`);
            return; // Don't handle click
        }
        
        // Camera position is correct - proceed with click handling
        if (section.isEvent) {
            this.handleEventClick(section);
        }
        else if (section.linkedinUrl) {
            this.handleLinkedInClick(section);
        }
    }

    handleEventClick(section) {
        alert(`Event Clicked: ${section.hoverText}\n\nThis would open event details in the future.`);
    }

    handleLinkedInClick(section) {
        console.log(`🔗 Opening LinkedIn profile: ${section.personName || section.name}`);
        window.open(section.linkedinUrl, '_blank', 'noopener,noreferrer');
    }

    onHoverEnter(object) {
        if (window.gsap) {
            gsap.to(object.scale, {
                duration: 0.3,
                x: object.userData.originalScale.x * 1.1,
                y: object.userData.originalScale.y * 1.1,
                z: object.userData.originalScale.z * 1.1,
                ease: "power2.out"
            });
        } else {
            object.scale.multiplyScalar(1.1);
        }

        if (object.material.emissive) {
            object.material.emissiveIntensity = 0.5;
        }

        this.renderer.domElement.style.cursor = 'pointer';
    }

    onHoverExit(object) {
        if (window.gsap) {
            gsap.to(object.scale, {
                duration: 0.3,
                x: object.userData.originalScale.x,
                y: object.userData.originalScale.y,
                z: object.userData.originalScale.z,
                ease: "power2.out"
            });
        } else {
            object.scale.copy(object.userData.originalScale);
        }

        if (object.material.emissive) {
            object.material.emissiveIntensity = 0.2;
        }

        this.renderer.domElement.style.cursor = 'default';
    }

    onScroll(event) {
        // 👇 CHECK IF ANY MODAL IS OPEN
        const socialUI = document.getElementById('social-media-ui');
        const formUI = document.getElementById('contact-form-ui');
        
        const socialOpen = socialUI && socialUI.style.display !== 'none';
        const formOpen = formUI && formUI.style.display !== 'none';
        
        // 👇 BLOCK SCROLL IF ANY MODAL IS OPEN
        if (socialOpen || formOpen) {
            console.log('🚫 Scroll blocked - modal is open');
            // Don't prevent default - allow scrolling within modal
            return;
        }
        
        // 👇 CHECK IF SCROLL IS ENABLED
        if (!this.scrollEnabled) {
            console.log('🚫 Scroll disabled');
            return;
        }
        
        // ✅ NEW: Allow scroll navigation from ALL positions (including intro)
        const currentPos = window.app?.cameraController?.getCurrentCameraPosition();
        if (currentPos) {
            event.preventDefault();
            
            const direction = event.deltaY > 0 ? 'next' : 'previous';
            
            if (direction === 'next') {
                window.app.cameraController.goToNextScreen();
            } else {
                window.app.cameraController.goToPreviousScreen();
            }
        }
    }
}