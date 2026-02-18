// ============================================
// MEMORY MANAGER - Aggressive Resource Management
// ============================================
// Tracks and disposes of GPU resources to prevent memory leaks
// WHY: WebGL context loss happens when GPU runs out of memory

class MemoryManager {
    constructor() {
        this.trackedTextures = new Map();
        this.trackedGeometries = new Map();
        this.trackedMaterials = new Map();
        this.memoryUsageEstimate = 0; // in MB
        
        // Disposal queue for delayed cleanup
        this.disposalQueue = [];
        this.disposalTimer = null;
        
        console.log('🧹 Memory Manager initialized');
    }
    
    /**
     * Track a texture
     */
    trackTexture(texture, name = 'unnamed') {
        const id = texture.uuid;
        
        if (!this.trackedTextures.has(id)) {
            const size = this.estimateTextureSize(texture);
            this.trackedTextures.set(id, {
                texture,
                name,
                size,
                timestamp: Date.now()
            });
            
            this.memoryUsageEstimate += size;
            console.log(`📦 Tracking texture: ${name} (${size.toFixed(2)}MB) - Total: ${this.memoryUsageEstimate.toFixed(2)}MB`);
        }
    }
    
    /**
     * Track a geometry
     */
    trackGeometry(geometry, name = 'unnamed') {
        const id = geometry.uuid;
        
        if (!this.trackedGeometries.has(id)) {
            const size = this.estimateGeometrySize(geometry);
            this.trackedGeometries.set(id, {
                geometry,
                name,
                size,
                timestamp: Date.now()
            });
            
            this.memoryUsageEstimate += size;
            console.log(`📦 Tracking geometry: ${name} (${size.toFixed(2)}MB)`);
        }
    }
    
    /**
     * Track a material
     */
    trackMaterial(material, name = 'unnamed') {
        const id = material.uuid;
        
        if (!this.trackedMaterials.has(id)) {
            this.trackedMaterials.set(id, {
                material,
                name,
                timestamp: Date.now()
            });
            
            // Track material textures
            const textures = this.getMaterialTextures(material);
            textures.forEach(tex => this.trackTexture(tex, `${name}_texture`));
        }
    }
    
    /**
     * Estimate texture memory size
     */
    estimateTextureSize(texture) {
        if (!texture.image) return 0;
        
        const width = texture.image.width || 512;
        const height = texture.image.height || 512;
        
        // RGBA = 4 bytes per pixel
        let bytesPerPixel = 4;
        
        // Mipmaps add ~1/3 more memory
        const mipmapMultiplier = texture.generateMipmaps ? 1.33 : 1;
        
        const bytes = width * height * bytesPerPixel * mipmapMultiplier;
        const mb = bytes / (1024 * 1024);
        
        return mb;
    }
    
    /**
     * Estimate geometry memory size
     */
    estimateGeometrySize(geometry) {
        let bytes = 0;
        
        // Position (3 floats per vertex)
        if (geometry.attributes.position) {
            bytes += geometry.attributes.position.count * 3 * 4;
        }
        
        // Normal (3 floats per vertex)
        if (geometry.attributes.normal) {
            bytes += geometry.attributes.normal.count * 3 * 4;
        }
        
        // UV (2 floats per vertex)
        if (geometry.attributes.uv) {
            bytes += geometry.attributes.uv.count * 2 * 4;
        }
        
        // Index (if exists)
        if (geometry.index) {
            bytes += geometry.index.count * 4;
        }
        
        const mb = bytes / (1024 * 1024);
        return mb;
    }
    
    /**
     * Get all textures from a material
     */
    getMaterialTextures(material) {
        const textures = [];
        
        // Common texture maps
        const textureProps = [
            'map', 'normalMap', 'roughnessMap', 'metalnessMap',
            'emissiveMap', 'aoMap', 'bumpMap', 'displacementMap',
            'alphaMap', 'envMap'
        ];
        
        textureProps.forEach(prop => {
            if (material[prop]) {
                textures.push(material[prop]);
            }
        });
        
        return textures;
    }
    
    /**
     * Dispose of a texture immediately
     */
    disposeTexture(texture) {
        const id = texture.uuid;
        const tracked = this.trackedTextures.get(id);
        
        if (tracked) {
            texture.dispose();
            this.memoryUsageEstimate -= tracked.size;
            this.trackedTextures.delete(id);
            console.log(`🗑️ Disposed texture: ${tracked.name} (${tracked.size.toFixed(2)}MB freed)`);
        } else {
            texture.dispose();
        }
    }
    
    /**
     * Dispose of a geometry immediately
     */
    disposeGeometry(geometry) {
        const id = geometry.uuid;
        const tracked = this.trackedGeometries.get(id);
        
        if (tracked) {
            geometry.dispose();
            this.memoryUsageEstimate -= tracked.size;
            this.trackedGeometries.delete(id);
            console.log(`🗑️ Disposed geometry: ${tracked.name} (${tracked.size.toFixed(2)}MB freed)`);
        } else {
            geometry.dispose();
        }
    }
    
    /**
     * Dispose of a material and its textures
     */
    disposeMaterial(material) {
        const id = material.uuid;
        const tracked = this.trackedMaterials.get(id);
        
        // Dispose material textures
        const textures = this.getMaterialTextures(material);
        textures.forEach(tex => this.disposeTexture(tex));
        
        // Dispose material
        material.dispose();
        
        if (tracked) {
            this.trackedMaterials.delete(id);
            console.log(`🗑️ Disposed material: ${tracked.name}`);
        }
    }
    
    /**
     * Dispose of an entire object3D and its children
     */
    disposeObject(object) {
        object.traverse(child => {
            if (child.isMesh) {
                // Dispose geometry
                if (child.geometry) {
                    this.disposeGeometry(child.geometry);
                }
                
                // Dispose material(s)
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => this.disposeMaterial(mat));
                    } else {
                        this.disposeMaterial(child.material);
                    }
                }
            }
        });
        
        console.log(`🗑️ Disposed object: ${object.name || 'unnamed'}`);
    }
    
    /**
     * Queue an object for delayed disposal
     * Useful when transitioning between scenes
     */
    queueDisposal(object, delayMs = 1000) {
        this.disposalQueue.push({
            object,
            disposeAt: Date.now() + delayMs
        });
        
        // Start disposal timer if not running
        if (!this.disposalTimer) {
            this.startDisposalTimer();
        }
    }
    
    /**
     * Start disposal timer
     */
    startDisposalTimer() {
        this.disposalTimer = setInterval(() => {
            const now = Date.now();
            const toDispose = [];
            
            // Find items ready for disposal
            this.disposalQueue = this.disposalQueue.filter(item => {
                if (item.disposeAt <= now) {
                    toDispose.push(item.object);
                    return false;
                }
                return true;
            });
            
            // Dispose items
            toDispose.forEach(obj => this.disposeObject(obj));
            
            // Stop timer if queue empty
            if (this.disposalQueue.length === 0) {
                clearInterval(this.disposalTimer);
                this.disposalTimer = null;
            }
        }, 100);
    }
    
    /**
     * Force garbage collection hint (doesn't guarantee GC)
     */
    forceGC() {
        console.log('🧹 Forcing garbage collection hint...');
        
        // Nullify large arrays to help GC
        if (typeof window.gc === 'function') {
            window.gc();
            console.log('✅ GC called');
        } else {
            console.log('⚠️ Manual GC not available (run with --expose-gc flag)');
        }
    }
    
    /**
     * Get memory usage report
     */
    getMemoryReport() {
        return {
            estimatedUsage: this.memoryUsageEstimate.toFixed(2) + ' MB',
            textures: this.trackedTextures.size,
            geometries: this.trackedGeometries.size,
            materials: this.trackedMaterials.size,
            queuedDisposals: this.disposalQueue.length
        };
    }
    
    /**
     * Check if we're approaching memory limits
     */
    isMemoryHigh(maxBudgetMB = 300) {
        return this.memoryUsageEstimate >= maxBudgetMB * 0.8; // 80% threshold
    }
    
    /**
     * Emergency cleanup - dispose oldest textures
     */
    emergencyCleanup(targetMB = 50) {
        console.warn('⚠️ Emergency memory cleanup triggered!');
        
        // Sort textures by age (oldest first)
        const textures = Array.from(this.trackedTextures.values())
            .sort((a, b) => a.timestamp - b.timestamp);
        
        let freed = 0;
        
        for (const item of textures) {
            if (freed >= targetMB) break;
            
            // Don't dispose screen textures
            if (item.name.includes('screen')) continue;
            
            this.disposeTexture(item.texture);
            freed += item.size;
        }
        
        console.log(`✅ Emergency cleanup freed ${freed.toFixed(2)}MB`);
        this.forceGC();
    }
    
    /**
     * Reset all tracking
     */
    reset() {
        this.trackedTextures.clear();
        this.trackedGeometries.clear();
        this.trackedMaterials.clear();
        this.memoryUsageEstimate = 0;
        this.disposalQueue = [];
        
        if (this.disposalTimer) {
            clearInterval(this.disposalTimer);
            this.disposalTimer = null;
        }
        
        console.log('🧹 Memory manager reset');
    }
}

// Export
window.MemoryManager = MemoryManager;
