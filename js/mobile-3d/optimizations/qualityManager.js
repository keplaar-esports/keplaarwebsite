// ============================================
// QUALITY MANAGER - Device-Specific Settings
// ============================================
// Automatically adjusts rendering quality based on device performance
// WHY: Old phones can't handle full quality - we need adaptive settings

class QualityManager {
    constructor() {
        this.performanceScore = window.deviceDetector?.performanceScore || 0;
        this.performanceTier = this.determinePerformanceTier();
        this.settings = this.getQualitySettings();
        
        console.log(`🎨 Quality Manager initialized - Tier: ${this.performanceTier}`);
        console.log('📊 Quality Settings:', this.settings);
    }
    
    /**
     * Determine performance tier based on score
     */
    determinePerformanceTier() {
        if (this.performanceScore >= 200) return 'high';
        if (this.performanceScore >= 120) return 'medium';
        return 'low';
    }
    
    /**
     * Get quality settings for current device
     */
    getQualitySettings() {
        const baseSettings = {
            // Renderer settings
            antialias: true,
            shadowsEnabled: false, // Always disable shadows on mobile
            maxPixelRatio: 2,
            
            // Texture settings
            maxTextureSize: 2048,
            textureAnisotropy: 4,
            mipmapping: true,
            
            // Material settings
            envMapIntensity: 1.0,
            emissiveIntensity: 1.0,
            
            // Performance settings
            maxLights: 3,
            useLOD: false,
            
            // Post-processing
            postProcessing: false,
            bloomEnabled: false,
            
            // Memory
            aggressiveDisposal: true,
            textureCompression: true
        };
        
        // Adjust based on performance tier
        switch(this.performanceTier) {
            case 'high':
                return {
                    ...baseSettings,
                    maxPixelRatio: 2,
                    textureAnisotropy: 8,
                    envMapIntensity: 2.0,
                    emissiveIntensity: 1.5,
                    maxTextureSize: 2048
                };
                
            case 'medium':
                return {
                    ...baseSettings,
                    maxPixelRatio: 1.5,
                    textureAnisotropy: 4,
                    envMapIntensity: 1.5,
                    emissiveIntensity: 1.2,
                    maxTextureSize: 1024
                };
                
            case 'low':
                return {
                    ...baseSettings,
                    antialias: false, // Disable AA for low-end
                    maxPixelRatio: 1,
                    textureAnisotropy: 2,
                    envMapIntensity: 1.0,
                    emissiveIntensity: 0.8,
                    maxTextureSize: 512,
                    mipmapping: false, // Disable mipmaps to save memory
                    aggressiveDisposal: true
                };
        }
        
        return baseSettings;
    }
    
    /**
     * Configure renderer with quality settings
     */
    configureRenderer(renderer) {
        const s = this.settings;
        
        // Set pixel ratio
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, s.maxPixelRatio));
        
        // Configure shadow map (if enabled)
        renderer.shadowMap.enabled = s.shadowsEnabled;
        if (s.shadowsEnabled) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        console.log(`✅ Renderer configured for ${this.performanceTier} tier`);
        console.log(`   - Pixel Ratio: ${Math.min(window.devicePixelRatio, s.maxPixelRatio)}`);
        console.log(`   - Antialias: ${s.antialias}`);
        console.log(`   - Shadows: ${s.shadowsEnabled}`);
    }
    
    /**
     * Optimize material based on quality settings
     */
    optimizeMaterial(material, renderer) {
        const s = this.settings;
        
        // Optimize textures
        if (material.map) {
            this.optimizeTexture(material.map, renderer);
        }
        if (material.normalMap) {
            this.optimizeTexture(material.normalMap, renderer);
        }
        if (material.roughnessMap) {
            this.optimizeTexture(material.roughnessMap, renderer);
        }
        if (material.metalnessMap) {
            this.optimizeTexture(material.metalnessMap, renderer);
        }
        
        // Adjust material properties
        if (material.envMapIntensity !== undefined) {
            material.envMapIntensity *= s.envMapIntensity;
        }
        if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity *= s.emissiveIntensity;
        }
        
        // Force update
        material.needsUpdate = true;
    }
    
    /**
     * Optimize texture settings
     */
    optimizeTexture(texture, renderer) {
        const s = this.settings;
        
        // Set anisotropy
        const maxAniso = renderer.capabilities.getMaxAnisotropy();
        texture.anisotropy = Math.min(s.textureAnisotropy, maxAniso);
        
        // Set filtering
        if (s.mipmapping) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
        } else {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
        }
        
        // Generate mipmaps if needed
        if (s.mipmapping && texture.image) {
            texture.generateMipmaps = true;
        } else {
            texture.generateMipmaps = false;
        }
        
        texture.needsUpdate = true;
    }
    
    /**
     * Get recommended loading strategy
     */
    getLoadingStrategy() {
        switch(this.performanceTier) {
            case 'high':
                return {
                    progressive: false,
                    lazyLoad: false,
                    lowResFirst: false
                };
            case 'medium':
                return {
                    progressive: true,
                    lazyLoad: false,
                    lowResFirst: true
                };
            case 'low':
                return {
                    progressive: true,
                    lazyLoad: true,
                    lowResFirst: true
                };
        }
    }
    
    /**
     * Check if we should reduce quality during runtime
     */
    shouldReduceQuality(fps) {
        // If FPS drops below 25 on low-end, we're in trouble
        if (this.performanceTier === 'low' && fps < 25) {
            return true;
        }
        // If FPS drops below 30 on medium, reduce quality
        if (this.performanceTier === 'medium' && fps < 30) {
            return true;
        }
        return false;
    }
    
    /**
     * Emergency quality reduction
     */
    emergencyReduceQuality(renderer) {
        console.warn('⚠️ Emergency quality reduction triggered!');
        
        // Reduce pixel ratio
        const currentRatio = renderer.getPixelRatio();
        const newRatio = Math.max(0.75, currentRatio * 0.8);
        renderer.setPixelRatio(newRatio);
        
        // Update settings
        this.settings.maxPixelRatio = newRatio;
        this.settings.envMapIntensity *= 0.8;
        this.settings.emissiveIntensity *= 0.8;
        
        console.log(`   - New Pixel Ratio: ${newRatio}`);
    }
    
    /**
     * Get memory budget estimate (in MB)
     */
    getMemoryBudget() {
        switch(this.performanceTier) {
            case 'high': return 400;
            case 'medium': return 250;
            case 'low': return 150;
        }
    }
}

// Export
window.QualityManager = QualityManager;
