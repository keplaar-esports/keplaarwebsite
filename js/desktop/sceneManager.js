class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.isModelLoaded = false;
        this.model = null;
        this.pmremGenerator = null;
        this.animatedLights = [];
        // Removed: this.glowSpheres = []; - Glow orbs removed
        
        this.setupAtmosphere();
        this.setupLighting();
        this.setupSkybox();
        // Removed: this.setupParticles(); - Floating particles removed
        // Removed: this.setupGlowOrbs(); - Glow orbs removed
    }

    setupAtmosphere() {
        // Add atmospheric fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0008);
        console.log('✨ Atmospheric fog added');
    }

    setupLighting() {
        // Enhanced ambient light with blue tint
        const ambientLight = new THREE.AmbientLight(0x4488ff, 0.8);
        this.scene.add(ambientLight);

        // Main directional light (sun-like)
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.far = 100;
        this.scene.add(mainLight);

        // Warm fill light
        const fillLight = new THREE.DirectionalLight(0xffaa88, 1.5);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Removed animated colored lights (cyan, purple, blue) - they were floating/moving

        console.log('✨ Enhanced lighting setup complete');
    }

    setupSkybox() {
        // Enhanced skybox with gradient
        const skyGeo = new THREE.SphereGeometry(1000, 60, 40);
        
        // Create gradient material
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create radial gradient from dark blue to cyan
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#2a2a5a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const skyMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.sky);
        
        console.log('✨ Enhanced gradient skybox created');
    }

    setupParticles() {
        // Create floating particles for atmosphere
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a large sphere - but keep them LOWER to avoid being visible from high camera angles
            const radius = Math.random() * 100 + 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = Math.random() * 30 - 15; // Keep particles between -15 and 15 (lower than before)
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Colors (cyan, blue, purple) - NO WHITE to avoid white squares
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                colors[i3] = 0.0; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0; // Cyan
            } else if (colorChoice < 0.7) {
                colors[i3] = 0.0; colors[i3 + 1] = 0.4; colors[i3 + 2] = 1.0; // Blue
            } else {
                colors[i3] = 0.6; colors[i3 + 1] = 0.0; colors[i3 + 2] = 1.0; // Purple
            }
            
            // Smaller, more subtle sizes
            sizes[i] = Math.random() * 1.2 + 0.3;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.5, // Smaller particles
            vertexColors: true,
            transparent: true,
            opacity: 0.4, // More subtle
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        console.log('✨ 2000 ambient particles created');
    }

    setupGlowOrbs() {
        // Add floating glow orbs around the scene
        const orbPositions = [
            { x: -20, y: 8, z: 15, color: 0x00ffff, size: 2 },
            { x: 20, y: 10, z: -15, color: 0xff00ff, size: 2.5 },
            { x: 0, y: 12, z: 20, color: 0x0066ff, size: 2 },
            { x: -15, y: 6, z: -10, color: 0x00ffaa, size: 1.8 }
        ];
        
        orbPositions.forEach((config, index) => {
            const geometry = new THREE.SphereGeometry(config.size, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            
            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(config.x, config.y, config.z);
            
            // Add glow light to orb
            const glowLight = new THREE.PointLight(config.color, 2, 30);
            glowLight.position.copy(orb.position);
            
            this.scene.add(orb);
            this.scene.add(glowLight);
            
            this.glowSpheres.push({
                mesh: orb,
                light: glowLight,
                baseY: config.y,
                offset: index * (Math.PI / 2),
                speed: 0.5 + Math.random() * 0.5
            });
        });
        
        console.log('✨ Floating glow orbs added');
    }

    animateScene(time) {
        // Particles animation removed - no more floating particles
        // Glow orbs animation removed - no more floating orbs
        // Animated colored lights removed - no more moving lights
    }

    setupPMREMGenerator(renderer) {
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.pmremGenerator.compileEquirectangularShader();
        
        const envRT = this.pmremGenerator.fromScene(this.sky).texture;
        this.scene.environment = envRT;
    }

    async loadEnvironment(renderer) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load('assets/models/environment3.glb', (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                
                // Setup environment reflections with renderer
                this.setupPMREMGenerator(renderer);
                
                // Apply material enhancements
                this.enhanceMaterials(renderer);
                
                // Apply screen images
                this.applyScreenImages();
                
                this.isModelLoaded = true;
                resolve();
                
            }, undefined, (error) => {
                console.error("GLB Load Error:", error);
                reject(error);
            });
        });
    }

    enhanceMaterials(renderer) {
        this.model.traverse(child => {
            if (child.isMesh && child.material) {

                if (child.name && child.name.startsWith('Screen')) {
                    console.log(`🔄 Skipping enhancement for screen: ${child.name}`);
                    return;
                }
                
                // Skip screen meshes (handled separately)
                const screenNames = ["Screen001", "Screen002", "Screen003", "Screen004"];
                if (screenNames.includes(child.name)) return;

                // Texture improvements
                if (child.material.map && renderer) {
                    child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                    child.material.map.magFilter = THREE.LinearFilter;
                }

                // Enhanced global material properties
                child.material.envMapIntensity = 4.0;

                if (child.material.roughness !== undefined)
                    child.material.roughness = Math.max(0.03, child.material.roughness * 0.4);

                if (child.material.metalness !== undefined)
                    child.material.metalness = Math.min(0.95, child.material.metalness * 1.8);

                // Pillars enhancement - make them glow!
                const pillarNames = ['Pillar.001', 'Pillar.002', 'Pillar.003', 'Pillar.004'];
                const nameLower = child.name.toLowerCase();

                if (pillarNames.some(n => nameLower.includes(n.toLowerCase()))) {
                    child.material.envMapIntensity = 6.0;
                    
                    // Brighter, more vibrant colors
                    if (child.material.color) {
                        const hsl = {};
                        child.material.color.getHSL(hsl);
                        hsl.s = Math.min(1.0, hsl.s * 1.5); // More saturated
                        hsl.l = Math.min(0.9, hsl.l * 2.2); // Much brighter
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    
                    child.material.roughness = 0.05;
                    child.material.metalness = 0.8;
                    
                    // Strong emissive glow
                    child.material.emissive = child.material.color.clone();
                    child.material.emissiveIntensity = 0.3;
                    
                    console.log(`✨ Enhanced pillar: ${child.name}`);
                }

                // Enhanced bluish-white lights with uniform glow (like tube lights)
                const lightNames = ['Light.001', 'Light.002', 'Light.003', 'Light.004'];
                if (lightNames.some(n => child.name.includes(n)) || child.material.name === "Material.003") {
                    child.material.emissive = new THREE.Color(0x88ddff); // Bluish-white color
                    child.material.emissiveIntensity = 25.0; // Very strong uniform glow
                    child.material.envMapIntensity = 0.0; // No reflections from lights
                    
                    if (child.material.color) {
                        child.material.color.setHex(0xaaeeff); // Bright bluish-white
                    }
                    
                    child.material.roughness = 0.01; // Very smooth for better glow
                    child.material.metalness = 0.0; // Non-metallic for uniform glow
                    
                    // DO NOT add point light - we want uniform material glow, not spot lighting
                    
                    console.log(`✨ Enhanced tube light with uniform glow: ${child.name}`);
                }

                // Glass material for other glass objects (not our screens)
                if (child.material.name === "Glass.007" && !screenNames.includes(child.name)) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0x050810,
                        metalness: 0.7,
                        roughness: 0.03,
                        emissiveIntensity: 0.3,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.01,
                        envMapIntensity: 0.5, // Reduced from 5.0 to minimize reflections
                        transparent: true,
                        transmission: 1
                    });
                }
            }
        });
        
        console.log('✨ All materials enhanced with premium look');
    }

    applyScreenImages() {
        const textureLoader = new THREE.TextureLoader();
        const screenImages = [
            { screenName: "Screen001", imagePath: "assets/textures/newscreen2.png" },
            { screenName: "Screen002", imagePath: "assets/textures/screen3.jpeg" },
            { screenName: "Screen003", imagePath: "assets/textures/screen4.jpeg" },
            { screenName: "Screen004", imagePath: "assets/textures/screen1.jpeg" }
        ];

        let loadedCount = 0;

        screenImages.forEach(screenConfig => {
            textureLoader.load(screenConfig.imagePath, (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.flipY = false;
                
                let screenMesh = null;
                this.model.traverse(child => {
                    if (child.isMesh && child.name === screenConfig.screenName) {
                        screenMesh = child;
                    }
                });
                
                if (screenMesh) {
                    if (screenMesh.material && screenMesh.material.dispose) {
                        screenMesh.material.dispose();
                    }
                    
                    // Apply screen material with no environment reflections for clear content visibility
                    screenMesh.material = new THREE.MeshPhysicalMaterial({
                        map: texture,
                        emissive: 0x050810,
                        emissiveMap: texture,
                        emissiveIntensity: 2.0,
                        color: 0xffffff,
                        metalness: 0.0,
                        roughness: 0.1,
                        transparent: true,
                        opacity: 0.95,
                        transmission: 0,
                        clearcoat: 0.3,
                        clearcoatRoughness: 0.1,
                        envMapIntensity: 0.0, // Set to 0 to completely eliminate reflections
                        side: THREE.FrontSide
                    });
                    
                    screenMesh.userData.originalScale = screenMesh.scale.clone();
                    screenMesh.userData.isScreen = true;
                    
                    loadedCount++;
                    console.log(`✅ Screen ${loadedCount}/4: ${screenConfig.screenName}`);
                    
                    if (loadedCount === screenImages.length) {
                        console.log('🎉 All screens loaded and ready for interaction!');
                    }
                }
            }, undefined, (error) => {
                console.error(`❌ Failed to load: ${screenConfig.screenName}`, error);
            });
        });
    }

    dispose() {
        if (this.pmremGenerator) {
            this.pmremGenerator.dispose();
        }
        
        // Particles removed - no disposal needed
        // Glow spheres removed - no disposal needed
    }
}
