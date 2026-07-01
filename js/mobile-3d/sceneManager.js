// ============================================
// MOBILE-3D SCENE MANAGER - Optimized for Mobile
// ============================================

class Mobile3DSceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.isModelLoaded = false;
        this.model = null;
        this.pmremGenerator = null;
        
        // Initialize optimization managers
        this.qualityManager = new QualityManager();
        this.memoryManager = new MemoryManager();
        
        this.setupLighting();
        this.setupSkybox();
    }

    /**
     * Setup lighting - Slightly reduced for mobile performance
     */
    setupLighting() {
        // Ambient light (slightly brighter for mobile)
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.2));

        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(5, 15, 5);
        dirLight.castShadow = false; // Disable shadows for performance
        this.scene.add(dirLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        console.log('✅ Mobile lighting setup');
    }

    /**
     * Setup skybox
     */
    setupSkybox() {
        const skyGeo = new THREE.SphereGeometry(1000, 32, 32); // Reduced segments
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0xe8f1ff,
            side: THREE.BackSide
        });
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.sky);
    }

    /**
     * Setup PMREM Generator for environment reflections
     */
    setupPMREMGenerator(renderer) {
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.pmremGenerator.compileEquirectangularShader();
        
        const envRT = this.pmremGenerator.fromScene(this.sky).texture;
        this.scene.environment = envRT;
        
        // Track environment texture
        this.memoryManager.trackTexture(envRT, 'environment_map');
        
        console.log('✅ Environment reflections setup');
    }

    /**
     * Load 3D environment model
     */
    async loadEnvironment(renderer) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            
            loader.load('assets/models/environment4.glb', (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                
                console.log('✅ Model loaded');
                
                // Setup environment reflections
                this.setupPMREMGenerator(renderer);
                
                // Apply mobile-optimized materials
                this.enhanceMaterialsForMobile(renderer);
                
                // Apply screen images
                this.applyScreenImages();
                
                this.isModelLoaded = true;
                resolve();
                
            }, 
            (progress) => {
                // Loading progress
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`📦 Loading model: ${percent.toFixed(0)}%`);
            },
            (error) => {
                console.error("❌ GLB Load Error:", error);
                reject(error);
            });
        });
    }

    /**
     * Enhance materials for mobile (optimized)
     */
    enhanceMaterialsForMobile(renderer) {
        let materialCount = 0;
        
        this.model.traverse(child => {
            if (child.isMesh && child.material) {
                
                // Skip screens
                if (child.name && child.name.startsWith('Screen')) {
                    return;
                }
                
                const screenNames = ["Screen001", "Screen002", "Screen003", "Screen004"];
                if (screenNames.includes(child.name)) return;

                // Track geometry
                if (child.geometry) {
                    this.memoryManager.trackGeometry(child.geometry, child.name || `geometry_${materialCount}`);
                }
                
                // Track and optimize material
                this.memoryManager.trackMaterial(child.material, child.name || `material_${materialCount}`);
                this.qualityManager.optimizeMaterial(child.material, renderer);
                
                materialCount++;

                // Texture improvements (device-specific now)
                if (child.material.map && renderer) {
                    this.qualityManager.optimizeTexture(child.material.map, renderer);
                }

                // Device-specific environment intensity
                const settings = this.qualityManager.settings;
                child.material.envMapIntensity = settings.envMapIntensity;

                // Adjust roughness/metalness
                if (child.material.roughness !== undefined)
                    child.material.roughness = Math.max(0.05, child.material.roughness * 0.5);

                if (child.material.metalness !== undefined)
                    child.material.metalness = Math.min(0.8, child.material.metalness * 1.3);

                // Pillars enhancement (slightly reduced)
                const pillarNames = ['Pillar.001', 'Pillar.002', 'Pillar.003', 'Pillar.004'];
                const nameLower = child.name.toLowerCase();

                if (pillarNames.some(n => nameLower.includes(n))) {
                    child.material.envMapIntensity = 3.0; // Reduced from 4.0
                    if (child.material.color) {
                        const hsl = {};
                        child.material.color.getHSL(hsl);
                        hsl.l = Math.min(0.75, hsl.l * 1.6);
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    child.material.roughness = 0.15;
                    child.material.metalness = 0.5;
                }

                // Blue emissive lights (slightly reduced)
                const lightNames = ['Light.001', 'Light.002', 'Light.003', 'Light.004'];
                if (lightNames.some(n => child.name.includes(n)) || child.material.name === "Material.003") {
                    child.material.emissive = new THREE.Color(0x0066ff);
                    child.material.emissiveIntensity = 6.0; // Reduced from 8.0
                    child.material.envMapIntensity = 4.0; // Reduced from 6.0
                    if (child.material.color) {
                        const hsl = {};
                        child.material.color.getHSL(hsl);
                        hsl.h = 0.6;
                        hsl.s = 0.9;
                        hsl.l = 0.7;
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    child.material.roughness = 0.05;
                    child.material.metalness = 0.2;
                }

                // Glass material (simplified for mobile)
                if (child.material.name === "Glass.007" && !screenNames.includes(child.name)) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x050810,
                        metalness: 0.6,
                        roughness: 0.05,
                        envMapIntensity: 3.0,
                        transparent: true,
                        opacity: 0.8
                    });
                }
            }
        });
        
        console.log(`✅ Materials optimized for mobile (${materialCount} materials)`);
        console.log('📊 Memory usage:', this.memoryManager.getMemoryReport());
    }

    /**
     * Apply screen images (same as desktop)
     */
    applyScreenImages() {
        const textureLoader = new THREE.TextureLoader();
        const screenImages = [
            { screenName: "Screen001", imagePath: "assets/textures/newscreen2.png" },
            { screenName: "Screen002", imagePath: "assets/textures/screen03.jpeg" },
            { screenName: "Screen003", imagePath: "assets/textures/screen4.jpeg" },
            { screenName: "Screen004", imagePath: "assets/textures/screen01.jpeg" }
        ];

        let loadedCount = 0;

        screenImages.forEach(screenConfig => {
            textureLoader.load(screenConfig.imagePath, (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.flipY = false;
                
                // Find the screen mesh
                let screenMesh = null;
                this.model.traverse(child => {
                    if (child.isMesh && child.name === screenConfig.screenName) {
                        screenMesh = child;
                    }
                });
                
                if (screenMesh) {
                    // Dispose old material
                    if (screenMesh.material && screenMesh.material.dispose) {
                        screenMesh.material.dispose();
                    }
                    
                    // Apply screen material (slightly optimized for mobile)
                    screenMesh.material = new THREE.MeshStandardMaterial({
                        map: texture,
                        emissive: 0x050810,
                        emissiveMap: texture,
                        emissiveIntensity: 1.5, // Reduced from 2.0
                        color: 0xffffff,
                        metalness: 0.0,
                        roughness: 0.15,
                        transparent: true,
                        opacity: 0.95,
                        envMapIntensity: 0.2,
                        side: THREE.FrontSide
                    });
                    
                    // Tag as screen for interactions
                    screenMesh.userData.originalScale = screenMesh.scale.clone();
                    screenMesh.userData.isScreen = true;
                    
                    loadedCount++;
                    console.log(`✅ Screen ${loadedCount}/4: ${screenConfig.screenName}`);
                    
                    if (loadedCount === screenImages.length) {
                        console.log('🎉 All screens loaded!');
                    }
                }
            }, undefined, (error) => {
                console.error(`❌ Failed to load: ${screenConfig.screenName}`, error);
            });
        });
    }

    /**
     * Dispose resources
     */
    dispose() {
        console.log('🧹 Disposing scene resources...');
        
        if (this.pmremGenerator) {
            this.pmremGenerator.dispose();
        }
        
        if (this.model) {
            this.memoryManager.disposeObject(this.model);
        }
        
        if (this.sky) {
            this.memoryManager.disposeObject(this.sky);
        }
        
        // Force garbage collection hint
        this.memoryManager.forceGC();
        
        console.log('✅ Scene disposed');
    }
}